import { v4 as uuidv4 } from 'uuid';
import { EventPublisher } from '../EventPublisher'; // Ancien système
import { EventBus, EventPriority, DomainEvent } from '../core/EventBus'; // Nouveau système
import { Event } from '../EventPublisher'; // Type de l'ancien système

/**
 * Adaptateur pour faire cohabiter ancien et nouveau systèmes d'événements
 *
 * Pendant la migration progressive, cet adaptateur permet de:
 * - Publier dans les deux systèmes simultanément
 * - Subscribe aux deux systèmes
 * - Migrer progressivement vers le nouveau système
 *
 * @example
 * const adapter = new LegacyEventAdapter();
 * await adapter.publishBoth(event);
 */
export class LegacyEventAdapter {
  private legacyPublisher = EventPublisher.getInstance();
  private newEventBus = EventBus.getInstance();

  /**
   * Publie un événement dans les deux systèmes
   * À utiliser pendant la période de transition
   */
  async publishBoth(event: Event): Promise<void> {
    // 1. Publier dans l'ancien système
    await this.legacyPublisher.publish(event);

    // 2. Convertir et publier dans le nouveau système
    const newEvent: DomainEvent = {
      id: uuidv4(),
      type: event.type,
      priority: EventPriority.NORMAL, // Tous les anciens événements en priorité normale
      timestamp: event.timestamp,
      userId: event.userId,
      data: event.data,
      metadata: {
        correlationId: uuidv4(),
        version: 1
      }
    };

    await this.newEventBus.publish(newEvent);
  }

  /**
   * Subscribe un handler dans les deux systèmes
   * Le handler recevra les événements des deux sources
   */
  subscribeBoth(
    eventType: string,
    handler: (event: any) => Promise<void>
  ): void {
    // 1. Subscribe ancien système
    const legacyObserver = {
      getName: () => `LegacyAdapter-${eventType}`,
      getInterestedEvents: () => [eventType],
      update: async (event: Event) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[LegacyEventAdapter] Error in handler for ${eventType}:`, error);
        }
      }
    };

    this.legacyPublisher.subscribe(legacyObserver);

    // 2. Subscribe nouveau système
    this.newEventBus.subscribe(eventType, async (event: DomainEvent) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[LegacyEventAdapter] Error in handler for ${eventType}:`, error);
      }
    });

    console.log(`[LegacyEventAdapter] Subscribed to ${eventType} in both systems`);
  }

  /**
   * Publie uniquement dans le nouveau système
   * À utiliser quand un module est complètement migré
   */
  async publishNew(
    type: string,
    data: Record<string, any>,
    priority: EventPriority = EventPriority.NORMAL,
    userId?: any
  ): Promise<void> {
    const event: DomainEvent = {
      id: uuidv4(),
      type,
      priority,
      timestamp: new Date(),
      userId,
      data,
      metadata: {
        correlationId: uuidv4(),
        version: 1
      }
    };

    await this.newEventBus.publish(event);
  }

  /**
   * Subscribe uniquement dans le nouveau système
   * À utiliser quand un module est complètement migré
   */
  subscribeNew(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void {
    this.newEventBus.subscribe(eventType, handler);
    console.log(`[LegacyEventAdapter] Subscribed to ${eventType} in new system only`);
  }

  /**
   * Convertit un événement ancien format vers nouveau format
   */
  convertToNewEvent(legacyEvent: Event, priority?: EventPriority): DomainEvent {
    return {
      id: uuidv4(),
      type: legacyEvent.type,
      priority: priority || EventPriority.NORMAL,
      timestamp: legacyEvent.timestamp,
      userId: legacyEvent.userId,
      data: legacyEvent.data,
      metadata: {
        correlationId: uuidv4(),
        version: 1
      }
    };
  }

  /**
   * Convertit un événement nouveau format vers ancien format
   */
  convertToLegacyEvent(newEvent: DomainEvent): Event {
    return {
      type: newEvent.type,
      timestamp: newEvent.timestamp,
      userId: newEvent.userId,
      data: newEvent.data
    };
  }
}
