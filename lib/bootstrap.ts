import { EventBus } from './events/core/EventBus';
import { DeadLetterQueue } from './events/core/DeadLetterQueue';
import { FEATURE_FLAGS, logFeatureFlags, validateConfiguration } from './config/features';

/**
 * Bootstrap de l'application
 *
 * Initialise tous les systèmes critiques:
 * - EventBus avec priority queues
 * - Dead Letter Queue avec retry automatique
 * - Chargement dynamique des modules activés
 * - Validation de la configuration
 */
export class ApplicationBootstrap {
  private static instance: ApplicationBootstrap;
  private isInitialized = false;
  private eventBus: EventBus;
  private deadLetterQueue: DeadLetterQueue;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.deadLetterQueue = new DeadLetterQueue();
  }

  /**
   * Récupère l'instance singleton du bootstrap
   */
  static getInstance(): ApplicationBootstrap {
    if (!ApplicationBootstrap.instance) {
      ApplicationBootstrap.instance = new ApplicationBootstrap();
    }
    return ApplicationBootstrap.instance;
  }

  /**
   * Initialise l'application complète
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[Bootstrap] Application already initialized');
      return;
    }

    console.log('[Bootstrap] Starting application initialization...');

    try {
      // 1. Valider la configuration
      await this.validateConfig();

      // 2. Afficher les feature flags
      this.logConfiguration();

      // 3. Initialiser EventBus
      await this.initializeEventBus();

      // 4. Initialiser Dead Letter Queue
      await this.initializeDeadLetterQueue();

      // 5. Charger les modules activés
      await this.loadEnabledModules();

      this.isInitialized = true;
      console.log('[Bootstrap] ✅ Application initialized successfully');
    } catch (error) {
      console.error('[Bootstrap] ❌ Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Valide la configuration avant le démarrage
   */
  private async validateConfig(): Promise<void> {
    console.log('[Bootstrap] Validating configuration...');

    const validation = validateConfiguration();

    if (!validation.valid) {
      console.error('[Bootstrap] ❌ Configuration validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      throw new Error('Invalid configuration. Please check your environment variables.');
    }

    console.log('[Bootstrap] ✅ Configuration validated');
  }

  /**
   * Affiche la configuration au démarrage
   */
  private logConfiguration(): void {
    console.log('\n========================================');
    console.log('  QuizLock - Modular Architecture');
    console.log('========================================');
    logFeatureFlags();
    console.log('========================================\n');
  }

  /**
   * Initialise le bus d'événements
   */
  private async initializeEventBus(): Promise<void> {
    console.log('[Bootstrap] Initializing EventBus...');

    // EventBus est déjà un singleton, récupérer l'instance suffit
    // L'initialisation des queues se fait automatiquement au premier getInstance()

    console.log('[Bootstrap] ✅ EventBus initialized');
  }

  /**
   * Initialise la Dead Letter Queue
   */
  private async initializeDeadLetterQueue(): Promise<void> {
    if (!FEATURE_FLAGS.ENABLE_DEAD_LETTER_QUEUE) {
      console.log('[Bootstrap] ⚠️  Dead Letter Queue disabled by feature flag');
      return;
    }

    console.log('[Bootstrap] Initializing Dead Letter Queue...');

    // Démarrer le retry automatique
    this.deadLetterQueue.startAutoRetry();

    console.log('[Bootstrap] ✅ Dead Letter Queue initialized');
  }

  /**
   * Charge dynamiquement les modules activés
   */
  private async loadEnabledModules(): Promise<void> {
    if (!FEATURE_FLAGS.USE_MODULAR_STRUCTURE) {
      console.log('[Bootstrap] ⚠️  Modular structure disabled, skipping module loading');
      return;
    }

    console.log('[Bootstrap] Loading enabled modules...');

    const moduleMap: Record<string, string> = {
      auth: 'auth',
      academicStructure: 'academic-structure',
      invitations: 'invitations',
      assessments: 'assessments',
      examExecution: 'exam-execution',
      gamification: 'gamification',
      analytics: 'analytics',
      messaging: 'messaging'
    };

    const enabledModules: string[] = [];

    for (const [key, modulePath] of Object.entries(moduleMap)) {
      if (FEATURE_FLAGS.MODULES_ENABLED[key as keyof typeof FEATURE_FLAGS.MODULES_ENABLED]) {
        try {
          // Import dynamique du module
          await import(`../modules/${modulePath}`);
          enabledModules.push(modulePath);
          console.log(`[Bootstrap]   ✅ Loaded module: ${modulePath}`);
        } catch (error) {
          // Si le module n'existe pas encore, c'est normal pendant la migration
          console.log(`[Bootstrap]   ⚠️  Module not found: ${modulePath} (not yet migrated)`);
        }
      }
    }

    if (enabledModules.length === 0) {
      console.log('[Bootstrap] ⚠️  No modules loaded');
    } else {
      console.log(`[Bootstrap] ✅ Loaded ${enabledModules.length} modules`);
    }
  }

  /**
   * Arrête proprement l'application
   */
  async shutdown(): Promise<void> {
    console.log('[Bootstrap] Shutting down application...');

    try {
      // Arrêter le retry automatique de la DLQ
      if (FEATURE_FLAGS.ENABLE_DEAD_LETTER_QUEUE) {
        this.deadLetterQueue.stopAutoRetry();
      }

      // Traiter les événements restants dans les queues
      const stats = this.eventBus.getQueueStats();
      const totalPending = Object.values(stats).reduce((sum, count) => sum + count, 0);

      if (totalPending > 0) {
        console.log(`[Bootstrap] Processing ${totalPending} remaining events...`);
        // Attendre un peu pour laisser les événements se traiter
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.isInitialized = false;
      console.log('[Bootstrap] ✅ Application shutdown complete');
    } catch (error) {
      console.error('[Bootstrap] Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de l'application
   */
  getStats(): {
    initialized: boolean;
    eventBusStats: Record<string, number>;
    dlqStats?: any;
  } {
    const stats: any = {
      initialized: this.isInitialized,
      eventBusStats: this.eventBus.getQueueStats()
    };

    if (FEATURE_FLAGS.ENABLE_DEAD_LETTER_QUEUE) {
      // La méthode getStats() du DLQ est async, on ne peut pas l'appeler ici
      // On pourrait l'ajouter dans une méthode async séparée si nécessaire
      stats.dlqEnabled = true;
    }

    return stats;
  }

  /**
   * Vérifie si l'application est initialisée
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

/**
 * Helper pour initialiser l'application facilement
 *
 * @example
 * // Dans app/layout.tsx ou middleware
 * import { bootstrap } from '@/lib/bootstrap';
 * await bootstrap();
 */
export async function bootstrap(): Promise<void> {
  const app = ApplicationBootstrap.getInstance();
  await app.initialize();
}

/**
 * Helper pour arrêter l'application proprement
 *
 * @example
 * // Dans un signal handler ou lors des tests
 * import { shutdown } from '@/lib/bootstrap';
 * await shutdown();
 */
export async function shutdown(): Promise<void> {
  const app = ApplicationBootstrap.getInstance();
  await app.shutdown();
}

/**
 * Helper pour obtenir les statistiques de l'application
 */
export function getAppStats() {
  const app = ApplicationBootstrap.getInstance();
  return app.getStats();
}

/**
 * Helper pour vérifier si l'application est prête
 */
export function isAppReady(): boolean {
  const app = ApplicationBootstrap.getInstance();
  return app.isReady();
}
