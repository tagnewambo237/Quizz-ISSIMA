import mongoose from 'mongoose';
import { EventBus, EventPriority, DomainEvent } from '@/lib/events/core/EventBus';
import {
  publishEvent,
  createEventHandler,
  createSafeEventHandler,
  getEventHistory,
  replayEvents,
  getEventBusStats
} from '@/lib/events/helpers';
import { v4 as uuidv4 } from 'uuid';

describe('Event Helpers', () => {
  let eventBus: EventBus;

  beforeAll(async () => {
    // Connect to in-memory MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    }
  });

  beforeEach(async () => {
    eventBus = EventBus.getInstance();
    
    // Clear all queues and handlers
    eventBus['priorityQueues'].clear();
    eventBus['handlers'].clear();
    
    // Clear MongoDB
    const EventStore = mongoose.models.EventStore;
    if (EventStore) {
      await EventStore.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('publishEvent', () => {
    it('should publish an event with default priority', async () => {
      const handlerMock = jest.fn();
      
      eventBus.subscribe('TEST_EVENT', handlerMock);

      await publishEvent('TEST_EVENT', { message: 'Hello' });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(handlerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TEST_EVENT',
          priority: EventPriority.NORMAL,
          data: { message: 'Hello' }
        })
      );
    });

    it('should publish an event with custom priority', async () => {
      const handlerMock = jest.fn();
      
      eventBus.subscribe('HIGH_PRIORITY_EVENT', handlerMock);

      await publishEvent(
        'HIGH_PRIORITY_EVENT',
        { urgent: true },
        { priority: EventPriority.HIGH }
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(handlerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'HIGH_PRIORITY_EVENT',
          priority: EventPriority.HIGH,
          data: { urgent: true }
        })
      );
    });

    it('should publish an event with userId', async () => {
      const userId = new mongoose.Types.ObjectId();
      const handlerMock = jest.fn();
      
      eventBus.subscribe('USER_EVENT', handlerMock);

      await publishEvent(
        'USER_EVENT',
        { action: 'login' },
        { userId }
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(handlerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId
        })
      );
    });

    it('should convert string userId to ObjectId', async () => {
      const userId = new mongoose.Types.ObjectId();
      const handlerMock = jest.fn();
      
      eventBus.subscribe('USER_EVENT', handlerMock);

      await publishEvent(
        'USER_EVENT',
        { action: 'logout' },
        { userId: userId.toString() }
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(handlerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(mongoose.Types.ObjectId)
        })
      );
    });

    it('should publish with custom correlationId', async () => {
      const correlationId = uuidv4();
      const handlerMock = jest.fn();
      
      eventBus.subscribe('CORRELATED_EVENT', handlerMock);

      await publishEvent(
        'CORRELATED_EVENT',
        { step: 1 },
        { correlationId }
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(handlerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            correlationId
          })
        })
      );
    });
  });

  describe('createEventHandler', () => {
    it('should create and register an event handler', async () => {
      const handlerMock = jest.fn();
      
      createEventHandler('HANDLER_TEST', handlerMock);

      await publishEvent('HANDLER_TEST', { test: 'data' });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(handlerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'HANDLER_TEST',
          data: { test: 'data' }
        })
      );
    });

    it('should handle async operations in handler', async () => {
      let executed = false;

      createEventHandler('ASYNC_TEST', async (event) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        executed = true;
      });

      await publishEvent('ASYNC_TEST', {});

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(executed).toBe(true);
    });
  });

  describe('createSafeEventHandler', () => {
    it('should catch errors and call error handler', async () => {
      const errorHandlerMock = jest.fn();
      
      createSafeEventHandler(
        'ERROR_TEST',
        async () => {
          throw new Error('Intentional error');
        },
        errorHandlerMock
      );

      await publishEvent('ERROR_TEST', {});

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(errorHandlerMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          type: 'ERROR_TEST'
        })
      );
    });

    it('should re-throw error for DLQ to capture', async () => {
      const errorHandlerMock = jest.fn();
      
      createSafeEventHandler(
        'DLQ_TEST',
        async () => {
          throw new Error('Should go to DLQ');
        },
        errorHandlerMock
      );

      // Listen for handler-error event
      const dlqCaptureMock = jest.fn();
      eventBus.on('handler-error', dlqCaptureMock);

      await publishEvent('DLQ_TEST', {});

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(errorHandlerMock).toHaveBeenCalled();
      expect(dlqCaptureMock).toHaveBeenCalled();
    });

    it('should use default error handler if none provided', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      createSafeEventHandler('DEFAULT_ERROR_TEST', async () => {
        throw new Error('Default error handling');
      });

      await publishEvent('DEFAULT_ERROR_TEST', {});

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getEventHistory', () => {
    beforeEach(async () => {
      // Publish some test events
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();
      const correlationId = uuidv4();

      await publishEvent('EVENT_TYPE_A', { value: 1 }, { userId: userId1 });
      await publishEvent('EVENT_TYPE_B', { value: 2 }, { userId: userId2 });
      await publishEvent('EVENT_TYPE_A', { value: 3 }, { userId: userId1, correlationId });
      
      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    it('should get all events when no filter provided', async () => {
      const history = await getEventHistory({});

      expect(history.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by event type', async () => {
      const history = await getEventHistory({ type: 'EVENT_TYPE_A' });

      expect(history).toHaveLength(2);
      expect(history.every(e => e.type === 'EVENT_TYPE_A')).toBe(true);
    });

    it('should filter by userId', async () => {
      // Get the first userId from the events
      const allHistory = await getEventHistory({});
      const userId = allHistory[0].userId?.toString();

      if (userId) {
        const history = await getEventHistory({ userId });

        expect(history.every(e => e.userId?.toString() === userId)).toBe(true);
      }
    });

    it('should limit results', async () => {
      const history = await getEventHistory({ limit: 2 });

      expect(history.length).toBeLessThanOrEqual(2);
    });

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 1000 * 60); // 1 minute ago
      const endDate = new Date(Date.now() + 1000 * 60); // 1 minute from now

      const history = await getEventHistory({ startDate, endDate });

      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('replayEvents', () => {
    it('should replay events within date range', async () => {
      const handlerMock = jest.fn();
      
      createEventHandler('REPLAY_EVENT', handlerMock);

      // Publish original event
      await publishEvent('REPLAY_EVENT', { original: true });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(handlerMock).toHaveBeenCalledTimes(1);

      // Clear mock
      handlerMock.mockClear();

      // Replay events
      const startDate = new Date(Date.now() - 1000 * 60);
      const endDate = new Date(Date.now() + 1000 * 60);
      
      await replayEvents(startDate, endDate);

      // Wait for replay
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(handlerMock).toHaveBeenCalledTimes(1);
    });

    it('should replay only specified event types', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      createEventHandler('REPLAY_TYPE_A', handler1);
      createEventHandler('REPLAY_TYPE_B', handler2);

      // Publish events
      await publishEvent('REPLAY_TYPE_A', {});
      await publishEvent('REPLAY_TYPE_B', {});

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      // Clear mocks
      handler1.mockClear();
      handler2.mockClear();

      // Replay only TYPE_A
      const startDate = new Date(Date.now() - 1000 * 60);
      const endDate = new Date(Date.now() + 1000 * 60);
      
      await replayEvents(startDate, endDate, ['REPLAY_TYPE_A']);

      // Wait for replay
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('getEventBusStats', () => {
    it('should return queue statistics', async () => {
      // Publish events to different queues
      await publishEvent('HIGH_EVENT', {}, { priority: EventPriority.HIGH });
      await publishEvent('NORMAL_EVENT_1', {}, { priority: EventPriority.NORMAL });
      await publishEvent('NORMAL_EVENT_2', {}, { priority: EventPriority.NORMAL });
      await publishEvent('LOW_EVENT', {}, { priority: EventPriority.LOW });

      const stats = getEventBusStats();

      expect(stats[EventPriority.HIGH]).toBe(1);
      expect(stats[EventPriority.NORMAL]).toBe(2);
      expect(stats[EventPriority.LOW]).toBe(1);
    });

    it('should return 0 for empty queues', () => {
      const stats = getEventBusStats();

      expect(stats[EventPriority.CRITICAL]).toBe(0);
      expect(stats[EventPriority.HIGH]).toBe(0);
      expect(stats[EventPriority.NORMAL]).toBe(0);
      expect(stats[EventPriority.LOW]).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow with helpers', async () => {
      const correlationId = uuidv4();
      const userId = new mongoose.Types.ObjectId();
      const results: string[] = [];

      // Create handlers
      createEventHandler('WORKFLOW_START', async (event) => {
        results.push('started');
        
        await publishEvent(
          'WORKFLOW_PROCESS',
          { step: 2 },
          { 
            userId: event.userId,
            correlationId: event.metadata.correlationId,
            priority: EventPriority.HIGH
          }
        );
      });

      createEventHandler('WORKFLOW_PROCESS', async (event) => {
        results.push('processed');
        
        await publishEvent(
          'WORKFLOW_COMPLETE',
          { step: 3 },
          {
            userId: event.userId,
            correlationId: event.metadata.correlationId
          }
        );
      });

      createEventHandler('WORKFLOW_COMPLETE', async () => {
        results.push('completed');
      });

      // Start workflow
      await publishEvent(
        'WORKFLOW_START',
        { step: 1 },
        { userId, correlationId, priority: EventPriority.NORMAL }
      );

      // Wait for all processing
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(results).toEqual(['started', 'processed', 'completed']);

      // Verify event history
      const history = await getEventHistory({ correlationId });
      
      expect(history).toHaveLength(3);
      expect(history.map(e => e.type)).toEqual([
        'WORKFLOW_START',
        'WORKFLOW_PROCESS',
        'WORKFLOW_COMPLETE'
      ]);
    });

    it('should handle error recovery with safe handler', async () => {
      let attemptCount = 0;
      const results: string[] = [];

      createSafeEventHandler(
        'RETRY_WORKFLOW',
        async (event) => {
          attemptCount++;
          
          if (attemptCount === 1) {
            results.push('failed');
            throw new Error('First attempt fails');
          }
          
          results.push('succeeded');
        },
        (error) => {
          results.push('error-caught');
        }
      );

      // First attempt
      await publishEvent('RETRY_WORKFLOW', { attempt: 1 });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(results).toContain('failed');
      expect(results).toContain('error-caught');
    });
  });
});
