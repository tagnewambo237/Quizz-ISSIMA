import mongoose from 'mongoose';
import { LegacyEventAdapter } from '@/lib/events/adapters/LegacyEventAdapter';
import { EventPublisher, Event } from '@/lib/events/EventPublisher';
import { EventBus, EventPriority, DomainEvent } from '@/lib/events/core/EventBus';
import { v4 as uuidv4 } from 'uuid';

describe('LegacyEventAdapter', () => {
  let adapter: LegacyEventAdapter;
  let legacyPublisher: EventPublisher;
  let newEventBus: EventBus;

  beforeAll(async () => {
    // Connect to in-memory MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    }
  });

  beforeEach(async () => {
    adapter = new LegacyEventAdapter();
    legacyPublisher = EventPublisher.getInstance();
    newEventBus = EventBus.getInstance();
    
    // Clear both systems
    legacyPublisher['observers'] = [];
    newEventBus['priorityQueues'].clear();
    newEventBus['handlers'].clear();
    
    // Clear MongoDB
    const EventStore = mongoose.models.EventStore;
    if (EventStore) {
      await EventStore.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('publishBoth', () => {
    it('should publish to both legacy and new event systems', async () => {
      const legacyHandler = jest.fn();
      const newHandler = jest.fn();

      // Subscribe to legacy system
      legacyPublisher.subscribe({
        getName: () => 'LegacyHandler',
        getInterestedEvents: () => ['TEST_EVENT'],
        update: legacyHandler
      });

      // Subscribe to new system
      newEventBus.subscribe('TEST_EVENT', newHandler);

      const legacyEvent: Event = {
        type: 'TEST_EVENT',
        timestamp: new Date(),
        userId: new mongoose.Types.ObjectId(),
        data: { message: 'Hello from legacy' }
      };

      await adapter.publishBoth(legacyEvent);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(legacyHandler).toHaveBeenCalledWith(legacyEvent);
      expect(newHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TEST_EVENT',
          data: { message: 'Hello from legacy' }
        })
      );
    });

    it('should convert legacy event to new format correctly', async () => {
      const newHandler = jest.fn();
      
      newEventBus.subscribe('CONVERSION_TEST', newHandler);

      const userId = new mongoose.Types.ObjectId();
      const legacyEvent: Event = {
        type: 'CONVERSION_TEST',
        timestamp: new Date(),
        userId: userId,
        data: { key: 'value' }
      };

      await adapter.publishBoth(legacyEvent);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(newHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CONVERSION_TEST',
          priority: EventPriority.NORMAL,
          userId: userId,
          data: { key: 'value' },
          metadata: expect.objectContaining({
            version: 1
          })
        })
      );
    });
  });

  describe('subscribeBoth', () => {
    it('should subscribe to both legacy and new event systems', async () => {
      const handlerMock = jest.fn();

      adapter.subscribeBoth('DUAL_EVENT', handlerMock);

      // Publish to legacy system
      await legacyPublisher.publish({
        type: 'DUAL_EVENT',
        timestamp: new Date(),
        data: { source: 'legacy' }
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(handlerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DUAL_EVENT',
          data: { source: 'legacy' }
        })
      );

      handlerMock.mockClear();

      // Publish to new system
      const newEvent: DomainEvent = {
        id: uuidv4(),
        type: 'DUAL_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: { source: 'new' },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await newEventBus.publish(newEvent);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(handlerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DUAL_EVENT',
          data: { source: 'new' }
        })
      );
    });

    it('should handle errors in dual subscription', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const failingHandler = jest.fn(async () => {
        throw new Error('Handler error');
      });

      adapter.subscribeBoth('ERROR_EVENT', failingHandler);

      // Publish to legacy system
      await legacyPublisher.publish({
        type: 'ERROR_EVENT',
        timestamp: new Date(),
        data: {}
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('publishNew', () => {
    it('should publish only to new event system', async () => {
      const legacyHandler = jest.fn();
      const newHandler = jest.fn();

      // Subscribe to both systems
      legacyPublisher.subscribe({
        getName: () => 'LegacyHandler',
        getInterestedEvents: () => ['NEW_ONLY_EVENT'],
        update: legacyHandler
      });

      newEventBus.subscribe('NEW_ONLY_EVENT', newHandler);

      await adapter.publishNew('NEW_ONLY_EVENT', { test: 'data' });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(legacyHandler).not.toHaveBeenCalled();
      expect(newHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'NEW_ONLY_EVENT',
          data: { test: 'data' }
        })
      );
    });

    it('should publish with custom priority', async () => {
      const newHandler = jest.fn();
      
      newEventBus.subscribe('HIGH_PRIORITY_NEW', newHandler);

      await adapter.publishNew(
        'HIGH_PRIORITY_NEW',
        { urgent: true },
        EventPriority.HIGH
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(newHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: EventPriority.HIGH
        })
      );
    });

    it('should publish with userId', async () => {
      const newHandler = jest.fn();
      const userId = new mongoose.Types.ObjectId();
      
      newEventBus.subscribe('USER_NEW_EVENT', newHandler);

      await adapter.publishNew(
        'USER_NEW_EVENT',
        { action: 'test' },
        EventPriority.NORMAL,
        userId
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(newHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId
        })
      );
    });
  });

  describe('subscribeNew', () => {
    it('should subscribe only to new event system', async () => {
      const handlerMock = jest.fn();

      adapter.subscribeNew('NEW_SUB_EVENT', handlerMock);

      // Publish to new system
      const newEvent: DomainEvent = {
        id: uuidv4(),
        type: 'NEW_SUB_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: { test: 'data' },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await newEventBus.publish(newEvent);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(handlerMock).toHaveBeenCalledWith(newEvent);
    });
  });

  describe('convertToNewEvent', () => {
    it('should convert legacy event to new format', () => {
      const userId = new mongoose.Types.ObjectId();
      const legacyEvent: Event = {
        type: 'LEGACY_EVENT',
        timestamp: new Date('2024-01-15'),
        userId: userId,
        data: { key: 'value' }
      };

      const newEvent = adapter.convertToNewEvent(legacyEvent);

      expect(newEvent).toMatchObject({
        type: 'LEGACY_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: legacyEvent.timestamp,
        userId: userId,
        data: { key: 'value' },
        metadata: {
          version: 1
        }
      });

      expect(newEvent.id).toBeDefined();
      expect(newEvent.metadata.correlationId).toBeDefined();
    });

    it('should convert with custom priority', () => {
      const legacyEvent: Event = {
        type: 'LEGACY_EVENT',
        timestamp: new Date(),
        data: {}
      };

      const newEvent = adapter.convertToNewEvent(legacyEvent, EventPriority.HIGH);

      expect(newEvent.priority).toBe(EventPriority.HIGH);
    });

    it('should handle legacy event without userId', () => {
      const legacyEvent: Event = {
        type: 'LEGACY_EVENT',
        timestamp: new Date(),
        data: {}
      };

      const newEvent = adapter.convertToNewEvent(legacyEvent);

      expect(newEvent.userId).toBeUndefined();
    });
  });

  describe('convertToLegacyEvent', () => {
    it('should convert new event to legacy format', () => {
      const userId = new mongoose.Types.ObjectId();
      const newEvent: DomainEvent = {
        id: uuidv4(),
        type: 'NEW_EVENT',
        priority: EventPriority.HIGH,
        timestamp: new Date('2024-01-15'),
        userId: userId,
        data: { key: 'value' },
        metadata: {
          correlationId: uuidv4(),
          version: 1
        }
      };

      const legacyEvent = adapter.convertToLegacyEvent(newEvent);

      expect(legacyEvent).toEqual({
        type: 'NEW_EVENT',
        timestamp: newEvent.timestamp,
        userId: userId,
        data: { key: 'value' }
      });
    });

    it('should handle new event without userId', () => {
      const newEvent: DomainEvent = {
        id: uuidv4(),
        type: 'NEW_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: {
          correlationId: uuidv4(),
          version: 1
        }
      };

      const legacyEvent = adapter.convertToLegacyEvent(newEvent);

      expect(legacyEvent.userId).toBeUndefined();
    });

    it('should lose priority and metadata in conversion', () => {
      const newEvent: DomainEvent = {
        id: uuidv4(),
        type: 'NEW_EVENT',
        priority: EventPriority.CRITICAL,
        timestamp: new Date(),
        data: {},
        metadata: {
          correlationId: uuidv4(),
          causationId: uuidv4(),
          version: 2
        }
      };

      const legacyEvent = adapter.convertToLegacyEvent(newEvent);

      // Legacy format doesn't have priority or metadata
      expect((legacyEvent as any).priority).toBeUndefined();
      expect((legacyEvent as any).metadata).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    it('should handle full migration workflow', async () => {
      const results: string[] = [];

      // Legacy handler
      legacyPublisher.subscribe({
        getName: () => 'LegacyMigrationHandler',
        getInterestedEvents: () => ['MIGRATION_EVENT'],
        update: async (event: Event) => {
          results.push('legacy-received');
        }
      });

      // New handler
      newEventBus.subscribe('MIGRATION_EVENT', async (event: DomainEvent) => {
        results.push('new-received');
      });

      // Publish via adapter (dual mode)
      await adapter.publishBoth({
        type: 'MIGRATION_EVENT',
        timestamp: new Date(),
        data: { migrating: true }
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(results).toContain('legacy-received');
      expect(results).toContain('new-received');
    });

    it('should handle bidirectional event flow', async () => {
      const handlerMock = jest.fn();

      // Subscribe to both systems
      adapter.subscribeBoth('BIDIRECTIONAL_EVENT', handlerMock);

      // Event from legacy system
      await legacyPublisher.publish({
        type: 'BIDIRECTIONAL_EVENT',
        timestamp: new Date(),
        data: { from: 'legacy' }
      });

      // Wait
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(handlerMock).toHaveBeenCalledTimes(1);

      handlerMock.mockClear();

      // Event from new system
      await newEventBus.publish({
        id: uuidv4(),
        type: 'BIDIRECTIONAL_EVENT',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: { from: 'new' },
        metadata: { correlationId: uuidv4(), version: 1 }
      });

      // Wait
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(handlerMock).toHaveBeenCalledTimes(1);
    });
  });
});
