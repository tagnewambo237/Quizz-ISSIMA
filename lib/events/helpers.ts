import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { EventBus, DomainEvent, EventPriority } from './core/EventBus';

/**
 * Options pour la publication d'événements
 */
export interface PublishEventOptions {
  priority?: EventPriority;
  userId?: mongoose.Types.ObjectId | string;
  correlationId?: string;
  causationId?: string;
  version?: number;
}

/**
 * Helper pour publier facilement des événements
 *
 * @example
 * await publishEvent('ATTEMPT_GRADED', {
 *   attemptId: '123',
 *   score: 85,
 *   maxScore: 100
 * }, {
 *   priority: EventPriority.HIGH,
 *   userId: userId
 * });
 */
export async function publishEvent(
  type: string,
  data: Record<string, any>,
  options: PublishEventOptions = {}
): Promise<void> {
  // Convertir userId en ObjectId si string
  let userIdObj: mongoose.Types.ObjectId | undefined;
  if (options.userId) {
    if (typeof options.userId === 'string') {
      userIdObj = new mongoose.Types.ObjectId(options.userId);
    } else {
      userIdObj = options.userId;
    }
  }

  const event: DomainEvent = {
    id: uuidv4(),
    type,
    priority: options.priority || EventPriority.NORMAL,
    timestamp: new Date(),
    userId: userIdObj,
    data,
    metadata: {
      correlationId: options.correlationId || uuidv4(),
      causationId: options.causationId,
      version: options.version || 1
    }
  };

  const eventBus = EventBus.getInstance();
  await eventBus.publish(event);
}

/**
 * Decorator pour écouter des événements
 *
 * Note: Ce decorator ne fonctionne qu'avec les classes instantiées
 *
 * @example
 * class MyHandler {
 *   @OnEvent('ATTEMPT_GRADED')
 *   async handleAttemptGraded(event: DomainEvent) {
 *     // Traiter l'événement
 *   }
 * }
 */
export function OnEvent(eventType: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    // Auto-subscribe au démarrage
    // Note: Nécessite que la classe soit instantiée
    setTimeout(() => {
      const eventBus = EventBus.getInstance();
      eventBus.subscribe(eventType, originalMethod.bind(target));
    }, 0);

    return descriptor;
  };
}

/**
 * Helper pour créer un handler d'événement simple
 *
 * @example
 * createEventHandler('ATTEMPT_GRADED', async (event) => {
 *   console.log('Attempt graded:', event.data);
 * });
 */
export function createEventHandler(
  eventType: string,
  handler: (event: DomainEvent) => Promise<void>
): void {
  const eventBus = EventBus.getInstance();
  eventBus.subscribe(eventType, handler);
  console.log(`[EventHandler] Registered handler for ${eventType}`);
}

/**
 * Helper pour créer un handler d'événement avec gestion d'erreur
 *
 * @example
 * createSafeEventHandler('ATTEMPT_GRADED', async (event) => {
 *   // Code qui peut throw une erreur
 * }, (error) => {
 *   console.error('Custom error handling:', error);
 * });
 */
export function createSafeEventHandler(
  eventType: string,
  handler: (event: DomainEvent) => Promise<void>,
  errorHandler?: (error: Error, event: DomainEvent) => void
): void {
  const eventBus = EventBus.getInstance();

  eventBus.subscribe(eventType, async (event: DomainEvent) => {
    try {
      await handler(event);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error, event);
      } else {
        console.error(`[EventHandler] Error in handler for ${eventType}:`, error);
      }
      // Re-throw pour que la DeadLetterQueue capture l'erreur
      throw error;
    }
  });

  console.log(`[EventHandler] Registered safe handler for ${eventType}`);
}

/**
 * Helper pour obtenir les statistiques des queues
 */
export function getEventBusStats(): Record<string, number> {
  const eventBus = EventBus.getInstance();
  return eventBus.getQueueStats();
}

/**
 * Helper pour obtenir l'historique des événements
 */
export async function getEventHistory(filters: {
  type?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  correlationId?: string;
} = {}): Promise<any[]> {
  const eventBus = EventBus.getInstance();
  return await eventBus.getEventHistory(filters);
}

/**
 * Helper pour rejouer des événements
 */
export async function replayEvents(
  startDate: Date,
  endDate: Date,
  eventTypes?: string[]
): Promise<void> {
  const eventBus = EventBus.getInstance();
  await eventBus.replayEvents(startDate, endDate, eventTypes);
}
