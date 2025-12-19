import mongoose, { Document, Model } from 'mongoose';
import { EventBus, DomainEvent } from './EventBus';

/**
 * Interface pour un événement en échec
 */
interface IDeadLetter extends Document {
  eventId: string;
  eventType: string;
  eventData: any;
  error: {
    message: string;
    stack?: string;
    name?: string;
  };
  attemptCount: number;
  lastAttempt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

/**
 * Dead Letter Queue
 *
 * Gère les événements dont le traitement a échoué:
 * - Stockage MongoDB des échecs
 * - Retry automatique avec backoff
 * - Dashboard d'inspection
 * - Résolution manuelle
 */
export class DeadLetterQueue {
  private model: Model<IDeadLetter>;
  private maxRetries = 3;
  private retryInterval = 5 * 60 * 1000; // 5 minutes
  private retryIntervalTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeModel();
    this.registerErrorHandler();
  }

  /**
   * Initialise le modèle MongoDB
   */
  private initializeModel(): void {
    try {
      // Vérifier si le modèle existe déjà
      if (mongoose.models.DeadLetter) {
        this.model = mongoose.models.DeadLetter as Model<IDeadLetter>;
        this.isInitialized = true;
        return;
      }

      const DeadLetterSchema = new mongoose.Schema<IDeadLetter>({
        eventId: { type: String, required: true, index: true },
        eventType: { type: String, required: true, index: true },
        eventData: { type: mongoose.Schema.Types.Mixed, required: true },
        error: {
          message: { type: String, required: true },
          stack: String,
          name: String
        },
        attemptCount: { type: Number, default: 1 },
        lastAttempt: { type: Date, default: Date.now, index: true },
        resolved: { type: Boolean, default: false, index: true },
        resolvedAt: Date,
        createdAt: { type: Date, default: Date.now, index: true }
      });

      // Index composés pour requêtes fréquentes
      DeadLetterSchema.index({ resolved: 1, attemptCount: 1, lastAttempt: 1 });

      this.model = mongoose.model<IDeadLetter>('DeadLetter', DeadLetterSchema);
      this.isInitialized = true;

      console.log('[DeadLetterQueue] Model initialized');
    } catch (error) {
      console.error('[DeadLetterQueue] Failed to initialize model:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Enregistre le handler pour écouter les erreurs de l'EventBus
   */
  private registerErrorHandler(): void {
    const eventBus = EventBus.getInstance();

    eventBus.on('handler-error', async ({ event, error }: { event: DomainEvent; error: any }) => {
      await this.add(event, error);
    });

    console.log('[DeadLetterQueue] Error handler registered');
  }

  /**
   * Ajoute un événement en échec à la DLQ
   */
  async add(event: DomainEvent, error: any): Promise<void> {
    if (!this.isInitialized) {
      console.error('[DeadLetterQueue] Not initialized, cannot add event');
      return;
    }

    try {
      const existing = await this.model.findOne({ eventId: event.id });

      if (existing) {
        // Incrémenter le compteur de tentatives
        existing.attemptCount += 1;
        existing.lastAttempt = new Date();
        existing.error = {
          message: error.message || 'Unknown error',
          stack: error.stack,
          name: error.name
        };
        await existing.save();

        console.log(
          `[DeadLetterQueue] Updated failed event ${event.id} (attempt ${existing.attemptCount}/${this.maxRetries})`
        );
      } else {
        // Créer nouvelle entrée
        await this.model.create({
          eventId: event.id,
          eventType: event.type,
          eventData: event,
          error: {
            message: error.message || 'Unknown error',
            stack: error.stack,
            name: error.name
          },
          attemptCount: 1,
          lastAttempt: new Date()
        });

        console.log(`[DeadLetterQueue] Added failed event ${event.id} to DLQ`);
      }
    } catch (err) {
      console.error('[DeadLetterQueue] Failed to add event to DLQ:', err);
    }
  }

  /**
   * Retry automatique des événements en échec
   * Retourne le nombre d'événements retryés avec succès
   */
  async retryFailed(): Promise<number> {
    if (!this.isInitialized) {
      return 0;
    }

    try {
      const cutoff = new Date(Date.now() - this.retryInterval);

      // Récupérer les événements à retry
      const failedEvents = await this.model.find({
        resolved: false,
        attemptCount: { $lt: this.maxRetries },
        lastAttempt: { $lt: cutoff }
      }).limit(10); // Limiter pour ne pas surcharger

      if (failedEvents.length === 0) {
        return 0;
      }

      const eventBus = EventBus.getInstance();
      let retried = 0;

      for (const deadLetter of failedEvents) {
        try {
          console.log(
            `[DeadLetterQueue] Retrying event ${deadLetter.eventId} (attempt ${deadLetter.attemptCount + 1}/${this.maxRetries})`
          );

          // Republier l'événement
          await eventBus.publish(deadLetter.eventData);

          // Marquer comme résolu
          deadLetter.resolved = true;
          deadLetter.resolvedAt = new Date();
          await deadLetter.save();

          retried++;

          console.log(`[DeadLetterQueue] Event ${deadLetter.eventId} retried successfully`);
        } catch (error) {
          // La nouvelle tentative a échoué, elle sera automatiquement ajoutée à la DLQ
          console.error(`[DeadLetterQueue] Retry failed for event ${deadLetter.eventId}:`, error);
        }
      }

      if (retried > 0) {
        console.log(`[DeadLetterQueue] Retried ${retried}/${failedEvents.length} failed events`);
      }

      return retried;
    } catch (error) {
      console.error('[DeadLetterQueue] Error in retryFailed:', error);
      return 0;
    }
  }

  /**
   * Récupère tous les événements non résolus
   */
  async getUnresolved(options: {
    limit?: number;
    eventType?: string;
  } = {}): Promise<IDeadLetter[]> {
    if (!this.isInitialized) {
      return [];
    }

    try {
      const query: any = { resolved: false };

      if (options.eventType) {
        query.eventType = options.eventType;
      }

      return await this.model
        .find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);
    } catch (error) {
      console.error('[DeadLetterQueue] Failed to get unresolved events:', error);
      return [];
    }
  }

  /**
   * Récupère les statistiques de la DLQ
   */
  async getStats(): Promise<{
    total: number;
    unresolved: number;
    maxRetriesReached: number;
    byType: Record<string, number>;
  }> {
    if (!this.isInitialized) {
      return { total: 0, unresolved: 0, maxRetriesReached: 0, byType: {} };
    }

    try {
      const [total, unresolved, maxRetriesReached, byType] = await Promise.all([
        this.model.countDocuments({}),
        this.model.countDocuments({ resolved: false }),
        this.model.countDocuments({ attemptCount: { $gte: this.maxRetries }, resolved: false }),
        this.model.aggregate([
          { $match: { resolved: false } },
          { $group: { _id: '$eventType', count: { $sum: 1 } } }
        ])
      ]);

      const byTypeObj: Record<string, number> = {};
      for (const item of byType) {
        byTypeObj[item._id] = item.count;
      }

      return {
        total,
        unresolved,
        maxRetriesReached,
        byType: byTypeObj
      };
    } catch (error) {
      console.error('[DeadLetterQueue] Failed to get stats:', error);
      return { total: 0, unresolved: 0, maxRetriesReached: 0, byType: {} };
    }
  }

  /**
   * Résout manuellement un événement (sans retry)
   */
  async resolve(eventId: string): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const result = await this.model.updateOne(
        { eventId },
        {
          $set: {
            resolved: true,
            resolvedAt: new Date()
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('[DeadLetterQueue] Failed to resolve event:', error);
      return false;
    }
  }

  /**
   * Démarre le retry automatique périodique
   */
  startAutoRetry(): void {
    if (this.retryIntervalTimer) {
      console.warn('[DeadLetterQueue] Auto-retry already started');
      return;
    }

    this.retryIntervalTimer = setInterval(async () => {
      const retried = await this.retryFailed();
      if (retried > 0) {
        console.log(`[DeadLetterQueue] Auto-retry: ${retried} events processed`);
      }
    }, this.retryInterval);

    console.log(`[DeadLetterQueue] Auto-retry started (every ${this.retryInterval / 1000}s)`);
  }

  /**
   * Arrête le retry automatique
   */
  stopAutoRetry(): void {
    if (this.retryIntervalTimer) {
      clearInterval(this.retryIntervalTimer);
      this.retryIntervalTimer = null;
      console.log('[DeadLetterQueue] Auto-retry stopped');
    }
  }

  /**
   * Nettoie les événements résolus anciens
   */
  async cleanup(olderThanDays: number = 30): Promise<number> {
    if (!this.isInitialized) {
      return 0;
    }

    try {
      const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

      const result = await this.model.deleteMany({
        resolved: true,
        resolvedAt: { $lt: cutoff }
      });

      console.log(`[DeadLetterQueue] Cleaned up ${result.deletedCount} old resolved events`);
      return result.deletedCount || 0;
    } catch (error) {
      console.error('[DeadLetterQueue] Failed to cleanup:', error);
      return 0;
    }
  }
}
