import mongoose from 'mongoose';
import { EventBus, EventPriority, DomainEvent } from '@/lib/events/core/EventBus';
import { v4 as uuidv4 } from 'uuid';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeAll(async () => {
    // Connect to in-memory MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    }
  });

  beforeEach(async () => {
    // Get fresh instance
    eventBus = EventBus.getInstance();
    
    // Clear all queues
    eventBus['priorityQueues'].clear();
    
    // Remove all event listeners
    eventBus.removeAllListeners();
    
    // Clear MongoDB EventStore
    const EventStore = mongoose.models.EventStore;
    if (EventStore) {
      await EventStore.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EventBus.getInstance();
      const instance2 = EventBus.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Event Publishing', () => {
    it('should publish an event to the correct priority queue', async () => {
      const event: DomainEvent = {
        id: uuidv4(),
        type: 'TEST_EVENT',
        priority: EventPriority.HIGH,
        timestamp: new Date(),
        data: { test: 'data' },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await eventBus.publish(event);

      const stats = eventBus.getQueueStats();
      expect(stats[EventPriority.HIGH]).toBe(1);
    });

    it('should process CRITICAL events immediately', async () => {
      const handlerMock = jest.fn();
      
      eventBus.subscribe('CRITICAL_EVENT', handlerMock);

      const event: DomainEvent = {
        id: uuidv4(),
        type: 'CRITICAL_EVENT',
        priority: EventPriority.CRITICAL,
        timestamp: new Date(),
        data: { alert: 'security breach' },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await eventBus.publish(event);

      // CRITICAL should be processed immediately
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(handlerMock).toHaveBeenCalledWith(event);
    });

    it('should handle multiple priorities correctly', async () => {
      const events: DomainEvent[] = [
        {
          id: uuidv4(),
          type: 'LOW_EVENT',
          priority: EventPriority.LOW,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'HIGH_EVENT',
          priority: EventPriority.HIGH,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'NORMAL_EVENT',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        }
      ];

      for (const event of events) {
        await eventBus.publish(event);
      }

      const stats = eventBus.getQueueStats();
      expect(stats[EventPriority.LOW]).toBe(1);
      expect(stats[EventPriority.HIGH]).toBe(1);
      expect(stats[EventPriority.NORMAL]).toBe(1);
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe to events', async () => {
      const handlerMock = jest.fn();
      
      eventBus.subscribe('USER_REGISTERED', handlerMock);

      const event: DomainEvent = {
        id: uuidv4(),
        type: 'USER_REGISTERED',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: { userId: '123', email: 'test@example.com' },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await eventBus.publish(event);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(handlerMock).toHaveBeenCalledWith(event);
    });

    it('should call multiple handlers for the same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('BADGE_EARNED', handler1);
      eventBus.subscribe('BADGE_EARNED', handler2);

      const event: DomainEvent = {
        id: uuidv4(),
        type: 'BADGE_EARNED',
        priority: EventPriority.HIGH,
        timestamp: new Date(),
        data: { badgeId: 'test-badge' },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await eventBus.publish(event);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it('should not call handlers for different event types', async () => {
      const handlerMock = jest.fn();
      
      eventBus.subscribe('USER_REGISTERED', handlerMock);

      const event: DomainEvent = {
        id: uuidv4(),
        type: 'STUDENT_ENROLLED',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await eventBus.publish(event);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(handlerMock).not.toHaveBeenCalled();
    });
  });

  describe('Priority Queue Processing', () => {
    it('should process events in priority order', async () => {
      const processingOrder: string[] = [];
      
      const createHandler = (name: string) => {
        return jest.fn(async () => {
          processingOrder.push(name);
        });
      };

      eventBus.subscribe('CRITICAL_TEST', createHandler('critical'));
      eventBus.subscribe('HIGH_TEST', createHandler('high'));
      eventBus.subscribe('NORMAL_TEST', createHandler('normal'));
      eventBus.subscribe('LOW_TEST', createHandler('low'));

      // Publish in reverse order (low to critical)
      await eventBus.publish({
        id: uuidv4(),
        type: 'LOW_TEST',
        priority: EventPriority.LOW,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      });

      await eventBus.publish({
        id: uuidv4(),
        type: 'NORMAL_TEST',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      });

      await eventBus.publish({
        id: uuidv4(),
        type: 'HIGH_TEST',
        priority: EventPriority.HIGH,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      });

      // CRITICAL is processed immediately, skip for this test

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 500));

      // Should process in order: HIGH -> NORMAL -> LOW
      expect(processingOrder).toEqual(['high', 'normal', 'low']);
    });
  });

  describe('Event Sourcing', () => {
    it('should persist events to MongoDB', async () => {
      const event: DomainEvent = {
        id: uuidv4(),
        type: 'EXAM_COMPLETED',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        userId: new mongoose.Types.ObjectId(),
        data: { examId: '123', score: 85 },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await eventBus.publish(event);

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 200));

      const EventStore = mongoose.models.EventStore;
      const storedEvent = await EventStore.findOne({ eventId: event.id });

      expect(storedEvent).toBeTruthy();
      expect(storedEvent.type).toBe('EXAM_COMPLETED');
      expect(storedEvent.data).toEqual({ examId: '123', score: 85 });
    });

    it('should query event history by type', async () => {
      const events: DomainEvent[] = [
        {
          id: uuidv4(),
          type: 'USER_LOGIN',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: { userId: '123' },
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'USER_LOGOUT',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: { userId: '123' },
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'USER_LOGIN',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: { userId: '456' },
          metadata: { correlationId: uuidv4(), version: 1 }
        }
      ];

      for (const event of events) {
        await eventBus.publish(event);
      }

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 300));

      const history = await eventBus.getEventHistory({ type: 'USER_LOGIN' });
      
      expect(history).toHaveLength(2);
      expect(history.every(e => e.type === 'USER_LOGIN')).toBe(true);
    });

    it('should query event history by userId', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      const events: DomainEvent[] = [
        {
          id: uuidv4(),
          type: 'XP_GAINED',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          userId,
          data: { amount: 10 },
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'BADGE_EARNED',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          userId,
          data: { badgeId: 'test' },
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'XP_GAINED',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          userId: new mongoose.Types.ObjectId(), // Different user
          data: { amount: 20 },
          metadata: { correlationId: uuidv4(), version: 1 }
        }
      ];

      for (const event of events) {
        await eventBus.publish(event);
      }

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 300));

      const history = await eventBus.getEventHistory({ 
        userId: userId.toString() 
      });
      
      expect(history).toHaveLength(2);
      expect(history.every(e => e.userId?.toString() === userId.toString())).toBe(true);
    });

    it('should query event history by correlationId', async () => {
      const correlationId = uuidv4();
      
      const events: DomainEvent[] = [
        {
          id: uuidv4(),
          type: 'EXAM_STARTED',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: { examId: '123' },
          metadata: { correlationId, version: 1 }
        },
        {
          id: uuidv4(),
          type: 'QUESTION_ANSWERED',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: { questionId: '1' },
          metadata: { correlationId, version: 1 }
        },
        {
          id: uuidv4(),
          type: 'EXAM_SUBMITTED',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: { examId: '123' },
          metadata: { correlationId, version: 1 }
        }
      ];

      for (const event of events) {
        await eventBus.publish(event);
      }

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 300));

      const workflow = await eventBus.getEventHistory({ correlationId });
      
      expect(workflow).toHaveLength(3);
      expect(workflow.map(e => e.type)).toEqual([
        'EXAM_STARTED',
        'QUESTION_ANSWERED',
        'EXAM_SUBMITTED'
      ]);
    });
  });

  describe('Event Replay', () => {
    it('should replay events within date range', async () => {
      const handlerMock = jest.fn();
      
      eventBus.subscribe('REPLAY_TEST', handlerMock);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      const event: DomainEvent = {
        id: uuidv4(),
        type: 'REPLAY_TEST',
        priority: EventPriority.NORMAL,
        timestamp: new Date('2024-06-15'),
        data: { test: 'replay' },
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await eventBus.publish(event);

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 200));

      // Clear handler calls
      handlerMock.mockClear();

      // Replay events
      await eventBus.replayEvents(startDate, endDate);

      // Wait for replay processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(handlerMock).toHaveBeenCalled();
    });

    it('should replay only specified event types', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('TYPE_A', handler1);
      eventBus.subscribe('TYPE_B', handler2);

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
        }
      ];

      for (const event of events) {
        await eventBus.publish(event);
      }

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 300));

      // Clear handler calls
      handler1.mockClear();
      handler2.mockClear();

      // Replay only TYPE_A
      const startDate = new Date(Date.now() - 1000 * 60);
      const endDate = new Date(Date.now() + 1000 * 60);
      
      await eventBus.replayEvents(startDate, endDate, ['TYPE_A']);

      // Wait for replay
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should emit handler-error when handler throws', async () => {
      const errorHandler = jest.fn();
      
      eventBus.on('handler-error', errorHandler);

      const failingHandler = jest.fn(async () => {
        throw new Error('Handler failed');
      });

      eventBus.subscribe('ERROR_TEST', failingHandler);

      const event: DomainEvent = {
        id: uuidv4(),
        type: 'ERROR_TEST',
        priority: EventPriority.NORMAL,
        timestamp: new Date(),
        data: {},
        metadata: { correlationId: uuidv4(), version: 1 }
      };

      await eventBus.publish(event);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          event,
          error: expect.any(Error)
        })
      );
    });
  });

  describe('Queue Statistics', () => {
    it('should return queue statistics', async () => {
      const events: DomainEvent[] = [
        {
          id: uuidv4(),
          type: 'TEST1',
          priority: EventPriority.HIGH,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'TEST2',
          priority: EventPriority.HIGH,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        },
        {
          id: uuidv4(),
          type: 'TEST3',
          priority: EventPriority.NORMAL,
          timestamp: new Date(),
          data: {},
          metadata: { correlationId: uuidv4(), version: 1 }
        }
      ];

      for (const event of events) {
        await eventBus.publish(event);
      }

      const stats = eventBus.getQueueStats();

      expect(stats[EventPriority.HIGH]).toBe(2);
      expect(stats[EventPriority.NORMAL]).toBe(1);
      expect(stats[EventPriority.LOW]).toBe(0);
    });
  });
});
