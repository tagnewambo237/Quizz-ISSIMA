/**
 * Public API pour le système d'événements
 *
 * Ce fichier exporte tous les composants nécessaires pour utiliser
 * le système d'événements modulaire de QuizLock.
 *
 * @example
 * // Publier un événement
 * import { publishEvent, EventPriority, EventType } from '@/lib/events';
 *
 * await publishEvent(EventType.ATTEMPT_GRADED, {
 *   attemptId: '123',
 *   score: 85
 * }, {
 *   priority: EventPriority.HIGH,
 *   userId: userId
 * });
 *
 * @example
 * // Écouter un événement
 * import { createEventHandler, EventType } from '@/lib/events';
 *
 * createEventHandler(EventType.BADGE_EARNED, async (event) => {
 *   console.log('Badge earned:', event.data);
 * });
 *
 * @example
 * // Utiliser l'adaptateur pour la transition
 * import { LegacyEventAdapter } from '@/lib/events';
 *
 * const adapter = new LegacyEventAdapter();
 * await adapter.publishBoth(event);
 */

// ========================================
// Core EventBus
// ========================================
export {
  EventBus,
  EventPriority,
  type DomainEvent,
  type EventFilter,
  type QueueStats
} from './core/EventBus';

// ========================================
// Dead Letter Queue
// ========================================
export { DeadLetterQueue } from './core/DeadLetterQueue';

// ========================================
// Event Types
// ========================================
export {
  EventType,
  type UserRegisteredEvent,
  type StudentEnrolledEvent,
  type AttemptGradedEvent,
  type XPGainedEvent,
  type BadgeEarnedEvent,
  type LevelUpEvent,
  type ExamPublishedEvent,
  type AntiCheatViolationEvent
} from './types';

// ========================================
// Helpers
// ========================================
export {
  publishEvent,
  createEventHandler,
  createSafeEventHandler,
  getEventBusStats,
  getEventHistory,
  replayEvents,
  OnEvent,
  type PublishEventOptions
} from './helpers';

// ========================================
// Legacy Adapter (for migration)
// ========================================
export { LegacyEventAdapter } from './adapters/LegacyEventAdapter';

// ========================================
// Re-export ancien EventPublisher pour compatibilité
// ========================================
export { EventPublisher, type Event } from './EventPublisher';

// ========================================
// Initialization (legacy compatibility)
// ========================================
/**
 * Initialize event system (legacy function for compatibility)
 * EventBus is now initialized automatically as a singleton
 */
export function initEventSystem(): void {
  // EventBus initializes automatically via singleton pattern
  // This function is kept for backward compatibility
  EventBus.getInstance();
}
