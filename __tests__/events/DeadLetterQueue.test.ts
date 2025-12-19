import mongoose from 'mongoose';
import { EventBus, EventPriority, DomainEvent } from '@/lib/events/core/EventBus';
import { DeadLetterQueue } from '@/lib/events/core/DeadLetterQueue';
import { v4 as uuidv4 } from 'uuid';

describe('DeadLetterQueue', () => {
  let eventBus: EventBus;
  let dlq: DeadLetterQueue;

  beforeAll(async () => {
    // Connect to in-memory MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    }
  });

  beforeEach(async () => {
    eventBus = EventBus.getInstance();
    dlq = new DeadLetterQueue();
    
    // Clear DeadLetter collection
    const DeadLetter = mongoose.models.DeadLetter;
    if (DeadLetter) {
      await DeadLetter.deleteMany({});
    }

    // Clear EventStore
    const EventStore = mongoose.models.EventStore;
    if (EventStore) {
      await EventStore.deleteMany({});
    }

    // Clear queues
    eventBus['priorityQueues'].clear();
    eventBus['handlers'].clear();
  });

  afterEach(() => {
    // Stop auto-retry if running
    dlq.stopAutoRetry();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Adding Failed Events', () => {
    it('should add a failed event to the DLQ', async () => {
      const event: DomainEvent = {
        id: uuidv4(),
        type: 'TEST_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: { test: 'data' },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      const error = new Error('Handler failed');

      await dlq.add(event, error);

      const unresolved = await dlq.getUnresolved();
      
      expect(unresolved).toHaveLength(1);
      expect(unresolved[0].eventId).toBe(event.id);
      expect(unresolved[0].eventType).toBe('TEST_EVENT');
      expect(unresolved[0].error.message).toBe('Handler failed');
      expect(unresolved[0].attemptCount).toBe(1);
    });

    it('should increment attempt count for duplicate events', async () => {
      const event: DomainEvent = {
        id: uuidv4(),
        type: 'TEST_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      const error = new Error('Handler failed');

      // Add first time
      await dlq.add(event, error);

      // Add second time (same event)
      await dlq.add(event, error);

      const unresolved = await dlq.getUnresolved();
      
      expect(unresolved).toHaveLength(1);
      expect(unresolved[0].attemptCount).toBe(2);
    });

    it('should capture error stack trace', async () => {
      const event: DomainEvent = {
        id: uuidv4(),
        type: 'TEST_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      const error = new Error('Test error');

      await dlq.add(event, error);

      const unresolved = await dlq.getUnresolved();
      
      expect(unresolved[0].error.stack).toBeDefined();
      expect(unresolved[0].error.name).toBe('Error');
    });
  });

  describe('Automatic Event Capture', () => {
    it('should automatically capture events when handlers fail', async () => {
      const failingHandler = jest.fn(async () => {
        throw new Error('Intentional failure');
      });

      eventBus.subscribe('FAILING_EVENT', failingHandler);

      const event: DomainEvent = {
        id: uuidv4(),
        type: 'FAILING_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: { test: 'data' },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await eventBus.publish(event);

      // Wait for processing and DLQ capture
      await new Promise(resolve => setTimeout(resolve, 300));

      const unresolved = await dlq.getUnresolved();
      
      expect(unresolved.length).toBeGreaterThan(0);
      expect(unresolved[0].eventType).toBe('FAILING_EVENT');
    });
  });

  describe('Retry Failed Events', () => {
    it('should retry failed events successfully', async () => {
      let attemptCount = 0;
      const handler = jest.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('First attempt fails');
        }
        // Second attempt succeeds
      });

      eventBus.subscribe('RETRY_TEST', handler);

      const event: DomainEvent = {
        id: uuidv4(),
        type: 'RETRY_TEST',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      // First attempt (will fail)
      await eventBus.publish(event);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Verify it's in DLQ
      let unresolved = await dlq.getUnresolved();
      expect(unresolved).toHaveLength(1);

      // Manually retry (bypassing interval)
      const retried = await dlq.retryFailed();

      // Wait for retry processing
      await new Promise(resolve => setTimeout(resolve, 300));

      // Should be resolved now
      unresolved = await dlq.getUnresolved({ limit: 100 });
      const resolved = unresolved.filter(e => e.resolved);
      
      expect(retried).toBeGreaterThan(0);
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should not retry events that have not exceeded retry interval', async () => {
      const event: DomainEvent = {
        id: uuidv4(),
        type: 'TEST_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      // Add to DLQ
      await dlq.add(event, new Error('Test'));

      // Immediately try to retry (should not retry because interval not passed)
      const retried = await dlq.retryFailed();

      expect(retried).toBe(0);
    });

    it('should not retry events that exceeded max retries', async () => {
      const event: DomainEvent = {
        id: uuidv4(),
        type: 'TEST_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      // Add to DLQ with max retries
      const DeadLetter = mongoose.models.DeadLetter;
      await DeadLetter.create({
        eventId: event.id,
        eventType: event.type,
        eventData: event,
        error: { message: 'Test error' },
        attemptCount: 3, // Max retries reached
        lastAttempt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        resolved: false
      });

      const retried = await dlq.retryFailed();

      expect(retried).toBe(0);
    });
  });

  describe('Get Unresolved Events', () => {
    it('should return all unresolved events', async () => {
      const events: DomainEvent[] = [
        {
          id: uuidv4(),
          type: 'EVENT_1',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'EVENT_2',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        }
      ];

      for (const event of events) {
        await dlq.add(event, new Error('Test'));
      }

      const unresolved = await dlq.getUnresolved();

      expect(unresolved).toHaveLength(2);
    });

    it('should filter by event type', async () => {
      const events: DomainEvent[] = [
        {
          id: uuidv4(),
          type: 'TYPE_A',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'TYPE_B',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'TYPE_A',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        }
      ];

      for (const event of events) {
        await dlq.add(event, new Error('Test'));
      }

      const unresolved = await dlq.getUnresolved({ eventType: 'TYPE_A' });

      expect(unresolved).toHaveLength(2);
      expect(unresolved.every(e => e.eventType === 'TYPE_A')).toBe(true);
    });

    it('should limit results', async () => {
      const events: DomainEvent[] = Array.from({ length: 10 }, () => ({
        id: uuidv4(),
        type: 'TEST_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      }));

      for (const event of events) {
        await dlq.add(event, new Error('Test'));
      }

      const unresolved = await dlq.getUnresolved({ limit: 5 });

      expect(unresolved).toHaveLength(5);
    });
  });

  describe('Statistics', () => {
    it('should return accurate statistics', async () => {
      const events: DomainEvent[] = [
        {
          id: uuidv4(),
          type: 'TYPE_A',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'TYPE_B',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'TYPE_A',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        }
      ];

      for (const event of events) {
        await dlq.add(event, new Error('Test'));
      }

      const stats = await dlq.getStats();

      expect(stats.total).toBe(3);
      expect(stats.unresolved).toBe(3);
      expect(stats.byType['TYPE_A']).toBe(2);
      expect(stats.byType['TYPE_B']).toBe(1);
    });

    it('should count max retries reached', async () => {
      const DeadLetter = mongoose.models.DeadLetter;
      
      await DeadLetter.create({
        eventId: uuidv4(),
        eventType: 'TEST',
        eventData: {},
        error: { message: 'Test' },
        attemptCount: 3,
        resolved: false
      });

      await DeadLetter.create({
        eventId: uuidv4(),
        eventType: 'TEST',
        eventData: {},
        error: { message: 'Test' },
        attemptCount: 3,
        resolved: false
      });

      const stats = await dlq.getStats();

      expect(stats.maxRetriesReached).toBe(2);
    });
  });

  describe('Manual Resolution', () => {
    it('should resolve an event manually', async () => {
      const event: DomainEvent = {
        id: uuidv4(),
        type: 'TEST_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await dlq.add(event, new Error('Test'));

      const resolved = await dlq.resolve(event.id);

      expect(resolved).toBe(true);

      const DeadLetter = mongoose.models.DeadLetter;
      const deadLetter = await DeadLetter.findOne({ eventId: event.id });

      expect(deadLetter.resolved).toBe(true);
      expect(deadLetter.resolvedAt).toBeDefined();
    });

    it('should return false for non-existent event', async () => {
      const resolved = await dlq.resolve('non-existent-id');

      expect(resolved).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup old resolved events', async () => {
      const DeadLetter = mongoose.models.DeadLetter;
      
      // Create old resolved event (40 days ago)
      await DeadLetter.create({
        eventId: uuidv4(),
        eventType: 'OLD_EVENT',
        eventData: {},
        error: { message: 'Test' },
        attemptCount: 1,
        resolved: true,
        resolvedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      });

      // Create recent resolved event
      await DeadLetter.create({
        eventId: uuidv4(),
        eventType: 'RECENT_EVENT',
        eventData: {},
        error: { message: 'Test' },
        attemptCount: 1,
        resolved: true,
        resolvedAt: new Date()
      });

      const deleted = await dlq.cleanup(30); // Cleanup older than 30 days

      expect(deleted).toBe(1);

      const remaining = await DeadLetter.countDocuments({});
      expect(remaining).toBe(1);
    });

    it('should not cleanup unresolved events', async () => {
      const DeadLetter = mongoose.models.DeadLetter;
      
      // Create old unresolved event
      await DeadLetter.create({
        eventId: uuidv4(),
        eventType: 'OLD_UNRESOLVED',
        eventData: {},
        error: { message: 'Test' },
        attemptCount: 1,
        resolved: false,
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      });

      const deleted = await dlq.cleanup(30);

      expect(deleted).toBe(0);

      const remaining = await DeadLetter.countDocuments({});
      expect(remaining).toBe(1);
    });
  });

  describe('Auto Retry', () => {
    it('should start and stop auto retry', () => {
      dlq.startAutoRetry();
      
      // Should not throw when starting again
      dlq.startAutoRetry();

      dlq.stopAutoRetry();
      dlq.stopAutoRetry(); // Should not throw
    });
  });
});
