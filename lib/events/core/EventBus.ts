import { EventEmitter } from 'events';
import mongoose, { Model, Document } from 'mongoose';

/**
 * Priorité des événements
 */
export enum EventPriority {
  CRITICAL = 0,  // Anti-triche, paiements, sécurité
  HIGH = 1,      // Notifications importantes, gamification
  NORMAL = 2,    // Événements standards
  LOW = 3        // Analytics, logs
}

/**
 * Interface événement enrichie
 */
export interface DomainEvent {
  id: string;
  type: string;
  priority: EventPriority;
  timestamp: Date;
  userId?: mongoose.Types.ObjectId;
  data: Record<string, any>;
  metadata?: {
    correlationId?: string;  // Pour tracer une transaction
    causationId?: string;    // ID de l'événement parent
    version?: number;        // Version du schéma d'événement
  };
}

/**
 * Interface pour le modèle EventStore MongoDB
 */
interface IEventStore extends Document {
  eventId: string;
  type: string;
  priority: number;
  timestamp: Date;
  userId?: mongoose.Types.ObjectId;
  data: any;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    version?: number;
  };
  processed: boolean;
  processedAt?: Date;
  createdAt: Date;
}

/**
 * EventBus amélioré avec priority queues et event sourcing
 *
 * Fonctionnalités:
 * - Priority queues (4 niveaux)
 * - Event sourcing (MongoDB)
 * - Traitement asynchrone
 * - Event replay
 * - Historique des événements
 */
export class EventBus extends EventEmitter {
  private static instance: EventBus;
  private eventStore: Model<IEventStore> | null = null;

  // Priority queues (tableau de files)
  private priorityQueues: Map<EventPriority, DomainEvent[]> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  private constructor() {
    super();
    this.setMaxListeners(100); // Augmenter limite pour éviter warnings
    this.initializePriorityQueues();
    this.initializeEventStore();
    this.startProcessing();
  }

  static getInstance(): EventBus {
    if (!this.instance) {
      this.instance = new EventBus();
    }
    return this.instance;
  }

  /**
   * Publie un événement avec priorité
   */
  async publish(event: DomainEvent): Promise<void> {
    try {
      // 1. Enqueue selon la priorité
      const queue = this.priorityQueues.get(event.priority) || [];
      queue.push(event);
      this.priorityQueues.set(event.priority, queue);

      // 2. Event sourcing: persister dans MongoDB
      await this.persistEvent(event);

      // 3. Traitement immédiat si CRITICAL
      if (event.priority === EventPriority.CRITICAL) {
        await this.processEvent(event);
      }
    } catch (error) {
      console.error('[EventBus] Error publishing event:', error);
      throw error;
    }
  }

  /**
   * Subscribe avec typage fort
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => Promise<void>
  ): void {
    this.on(eventType, async (event: T) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[EventBus] Handler error for ${eventType}:`, error);
        // L'erreur sera gérée par la Dead Letter Queue
        this.emit('handler-error', { event, error });
      }
    });
  }

  /**
   * Traite les événements par priorité
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return; // Éviter traitement concurrent

    this.isProcessing = true;

    try {
      // Traiter CRITICAL, puis HIGH, puis NORMAL, puis LOW
      for (const priority of [
        EventPriority.CRITICAL,
        EventPriority.HIGH,
        EventPriority.NORMAL,
        EventPriority.LOW
      ]) {
        const queue = this.priorityQueues.get(priority) || [];

        while (queue.length > 0) {
          const event = queue.shift();
          if (event && event.priority !== EventPriority.CRITICAL) {
            // CRITICAL déjà traité immédiatement
            await this.processEvent(event);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Traite un événement individuel
   */
  private async processEvent(event: DomainEvent): Promise<void> {
    try {
      // Émettre vers les listeners
      this.emit(event.type, event);

      // Marquer comme traité dans event store
      await this.markEventAsProcessed(event.id);

    } catch (error) {
      console.error(`[EventBus] Error processing event ${event.type}:`, error);

      // Émettre l'erreur pour la Dead Letter Queue
      this.emit('handler-error', { event, error });
    }
  }

  /**
   * Initialise l'event store MongoDB
   */
  private async initializeEventStore(): Promise<void> {
    try {
      // Vérifier si le modèle existe déjà
      if (mongoose.models.EventStore) {
        this.eventStore = mongoose.models.EventStore as Model<IEventStore>;
        return;
      }

      const EventStoreSchema = new mongoose.Schema<IEventStore>({
        eventId: { type: String, required: true, unique: true, index: true },
        type: { type: String, required: true, index: true },
        priority: { type: Number, required: true, index: true },
        timestamp: { type: Date, required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, sparse: true },
        data: { type: mongoose.Schema.Types.Mixed },
        metadata: {
          correlationId: { type: String, index: true, sparse: true },
          causationId: { type: String, sparse: true },
          version: Number
        },
        processed: { type: Boolean, default: false, index: true },
        processedAt: Date,
        createdAt: { type: Date, default: Date.now, index: true }
      });

      // Index composé pour requêtes fréquentes
      EventStoreSchema.index({ type: 1, timestamp: -1 });
      EventStoreSchema.index({ userId: 1, timestamp: -1 });
      EventStoreSchema.index({ 'metadata.correlationId': 1 });

      // TTL index: supprimer événements après 90 jours
      EventStoreSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

      this.eventStore = mongoose.model<IEventStore>('EventStore', EventStoreSchema);

      console.log('[EventBus] EventStore initialized');
    } catch (error) {
      console.error('[EventBus] Failed to initialize EventStore:', error);
      // Continuer sans event sourcing si MongoDB non disponible
      this.eventStore = null;
    }
  }

  /**
   * Persiste un événement (Event Sourcing)
   */
  private async persistEvent(event: DomainEvent): Promise<void> {
    if (!this.eventStore) return; // Skip si EventStore non initialisé

    try {
      await this.eventStore.create({
        eventId: event.id,
        type: event.type,
        priority: event.priority,
        timestamp: event.timestamp,
        userId: event.userId,
        data: event.data,
        metadata: event.metadata,
        processed: false
      });
    } catch (error) {
      // Erreur silencieuse pour ne pas bloquer l'événement
      console.error('[EventBus] Failed to persist event:', error);
    }
  }

  /**
   * Marque un événement comme traité
   */
  private async markEventAsProcessed(eventId: string): Promise<void> {
    if (!this.eventStore) return;

    try {
      await this.eventStore.updateOne(
        { eventId },
        {
          $set: {
            processed: true,
            processedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('[EventBus] Failed to mark event as processed:', error);
    }
  }

  /**
   * Récupère l'historique des événements (Event Sourcing)
   */
  async getEventHistory(filters: {
    type?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    correlationId?: string;
  } = {}): Promise<any[]> {
    if (!this.eventStore) return [];

    try {
      const query: any = {};

      if (filters.type) query.type = filters.type;
      if (filters.userId) query.userId = new mongoose.Types.ObjectId(filters.userId);
      if (filters.correlationId) query['metadata.correlationId'] = filters.correlationId;

      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }

      return await this.eventStore
        .find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100)
        .lean();
    } catch (error) {
      console.error('[EventBus] Failed to get event history:', error);
      return [];
    }
  }

  /**
   * Replay d'événements (pour reconstruire état)
   */
  async replayEvents(
    startDate: Date,
    endDate: Date,
    eventTypes?: string[]
  ): Promise<void> {
    if (!this.eventStore) {
      console.warn('[EventBus] EventStore not available for replay');
      return;
    }

    try {
      const query: any = {
        timestamp: { $gte: startDate, $lte: endDate }
      };

      if (eventTypes && eventTypes.length > 0) {
        query.type = { $in: eventTypes };
      }

      const events = await this.eventStore
        .find(query)
        .sort({ timestamp: 1 }) // Ordre chronologique
        .lean();

      console.log(`[EventBus] Replaying ${events.length} events...`);

      for (const storedEvent of events) {
        const event: DomainEvent = {
          id: storedEvent.eventId,
          type: storedEvent.type,
          priority: storedEvent.priority as EventPriority,
          timestamp: storedEvent.timestamp,
          userId: storedEvent.userId,
          data: storedEvent.data,
          metadata: storedEvent.metadata
        };

        // Re-emit sans persister (déjà persisté)
        this.emit(event.type, event);
      }

      console.log(`[EventBus] Replay completed`);
    } catch (error) {
      console.error('[EventBus] Failed to replay events:', error);
      throw error;
    }
  }

  /**
   * Initialise les priority queues
   */
  private initializePriorityQueues(): void {
    this.priorityQueues.set(EventPriority.CRITICAL, []);
    this.priorityQueues.set(EventPriority.HIGH, []);
    this.priorityQueues.set(EventPriority.NORMAL, []);
    this.priorityQueues.set(EventPriority.LOW, []);
  }

  /**
   * Démarre le traitement périodique des queues
   */
  private startProcessing(): void {
    // Traiter la queue toutes les 100ms
    this.processingInterval = setInterval(() => {
      this.processQueue().catch(error => {
        console.error('[EventBus] Error in queue processing:', error);
      });
    }, 100);

    console.log('[EventBus] Queue processing started (100ms interval)');
  }

  /**
   * Arrêt propre de l'EventBus
   */
  async shutdown(): Promise<void> {
    console.log('[EventBus] Shutting down...');

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Traiter les événements restants
    await this.processQueue();

    // Vider les listeners
    this.removeAllListeners();

    console.log('[EventBus] Shutdown complete');
  }

  /**
   * Statistiques des queues (pour monitoring)
   */
  getQueueStats(): Record<string, number> {
    return {
      critical: this.priorityQueues.get(EventPriority.CRITICAL)?.length || 0,
      high: this.priorityQueues.get(EventPriority.HIGH)?.length || 0,
      normal: this.priorityQueues.get(EventPriority.NORMAL)?.length || 0,
      low: this.priorityQueues.get(EventPriority.LOW)?.length || 0
    };
  }
}
