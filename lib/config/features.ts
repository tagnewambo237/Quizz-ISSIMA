/**
 * Feature Flags pour la migration progressive vers l'architecture modulaire
 *
 * Ces flags permettent d'activer/désactiver les nouveaux systèmes et modules
 * sans risque pour l'application en production.
 */

/**
 * Configuration des feature flags
 */
export const FEATURE_FLAGS = {
  /**
   * Utiliser le nouveau EventBus au lieu de l'ancien EventPublisher
   *
   * false: Utilise uniquement l'ancien EventPublisher
   * true: Utilise le nouveau EventBus avec priority queues et event sourcing
   */
  USE_NEW_EVENT_BUS: process.env.USE_NEW_EVENT_BUS === 'true',

  /**
   * Utiliser le système modulaire
   *
   * false: Architecture monolithique actuelle
   * true: Nouvelle architecture modulaire
   */
  USE_MODULAR_STRUCTURE: process.env.USE_MODULAR_STRUCTURE === 'true',

  /**
   * Modules activés (migration progressive)
   *
   * À activer un par un après migration et tests
   */
  MODULES_ENABLED: {
    auth: process.env.MODULE_AUTH_ENABLED === 'true',
    academicStructure: process.env.MODULE_ACADEMIC_STRUCTURE_ENABLED === 'true',
    invitations: process.env.MODULE_INVITATIONS_ENABLED === 'true',
    assessments: process.env.MODULE_ASSESSMENTS_ENABLED === 'true',
    examExecution: process.env.MODULE_EXAM_EXECUTION_ENABLED === 'true',
    gamification: process.env.MODULE_GAMIFICATION_ENABLED === 'true',
    analytics: process.env.MODULE_ANALYTICS_ENABLED === 'true',
    messaging: process.env.MODULE_MESSAGING_ENABLED === 'true'
  },

  /**
   * Activer Dead Letter Queue avec retry automatique
   */
  ENABLE_DEAD_LETTER_QUEUE: process.env.ENABLE_DEAD_LETTER_QUEUE !== 'false', // Par défaut: true

  /**
   * Activer Event Sourcing (stockage des événements dans MongoDB)
   */
  ENABLE_EVENT_SOURCING: process.env.ENABLE_EVENT_SOURCING !== 'false', // Par défaut: true

  /**
   * Mode de transition
   *
   * 'dual': Publie dans ancien ET nouveau système (sécurité max, performance --)
   * 'new-only': Publie uniquement dans nouveau système (performance ++, risque +)
   * 'legacy-only': Publie uniquement dans ancien système (pas de migration)
   */
  EVENT_PUBLISHING_MODE: (process.env.EVENT_PUBLISHING_MODE || 'dual') as 'dual' | 'new-only' | 'legacy-only',

  /**
   * Interval de retry automatique (Dead Letter Queue) en millisecondes
   * Par défaut: 5 minutes
   */
  DLQ_RETRY_INTERVAL: parseInt(process.env.DLQ_RETRY_INTERVAL || '300000', 10),

  /**
   * Nombre maximum de tentatives avant abandon (Dead Letter Queue)
   * Par défaut: 3
   */
  DLQ_MAX_RETRIES: parseInt(process.env.DLQ_MAX_RETRIES || '3', 10),

  /**
   * Interval de traitement des queues (EventBus) en millisecondes
   * Par défaut: 100ms
   */
  EVENT_QUEUE_PROCESSING_INTERVAL: parseInt(process.env.EVENT_QUEUE_PROCESSING_INTERVAL || '100', 10),

  /**
   * TTL des événements dans EventStore (en jours)
   * Par défaut: 90 jours
   */
  EVENT_STORE_TTL_DAYS: parseInt(process.env.EVENT_STORE_TTL_DAYS || '90', 10),

  /**
   * Logging verbose pour debugging
   */
  VERBOSE_EVENT_LOGGING: process.env.VERBOSE_EVENT_LOGGING === 'true'
};

/**
 * Vérifie si un module spécifique est activé
 */
export function isModuleEnabled(moduleName: keyof typeof FEATURE_FLAGS.MODULES_ENABLED): boolean {
  return FEATURE_FLAGS.MODULES_ENABLED[moduleName] === true;
}

/**
 * Compte le nombre de modules activés
 */
export function getEnabledModulesCount(): number {
  return Object.values(FEATURE_FLAGS.MODULES_ENABLED).filter(Boolean).length;
}

/**
 * Récupère la liste des modules activés
 */
export function getEnabledModules(): string[] {
  return Object.entries(FEATURE_FLAGS.MODULES_ENABLED)
    .filter(([_, enabled]) => enabled)
    .map(([moduleName]) => moduleName);
}

/**
 * Log de la configuration au démarrage
 */
export function logFeatureFlags(): void {
  console.log('[FeatureFlags] Configuration:');
  console.log(`  - New EventBus: ${FEATURE_FLAGS.USE_NEW_EVENT_BUS ? '✅' : '❌'}`);
  console.log(`  - Modular Structure: ${FEATURE_FLAGS.USE_MODULAR_STRUCTURE ? '✅' : '❌'}`);
  console.log(`  - Event Sourcing: ${FEATURE_FLAGS.ENABLE_EVENT_SOURCING ? '✅' : '❌'}`);
  console.log(`  - Dead Letter Queue: ${FEATURE_FLAGS.ENABLE_DEAD_LETTER_QUEUE ? '✅' : '❌'}`);
  console.log(`  - Publishing Mode: ${FEATURE_FLAGS.EVENT_PUBLISHING_MODE}`);
  console.log(`  - Enabled Modules: ${getEnabledModulesCount()}/8`);

  const enabledModules = getEnabledModules();
  if (enabledModules.length > 0) {
    console.log(`    ✅ ${enabledModules.join(', ')}`);
  }
}

/**
 * Valide la configuration
 */
export function validateConfiguration(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validation basique
  if (FEATURE_FLAGS.DLQ_MAX_RETRIES < 1) {
    errors.push('DLQ_MAX_RETRIES must be >= 1');
  }

  if (FEATURE_FLAGS.DLQ_RETRY_INTERVAL < 1000) {
    errors.push('DLQ_RETRY_INTERVAL must be >= 1000ms');
  }

  if (FEATURE_FLAGS.EVENT_QUEUE_PROCESSING_INTERVAL < 10) {
    errors.push('EVENT_QUEUE_PROCESSING_INTERVAL must be >= 10ms');
  }

  if (FEATURE_FLAGS.EVENT_STORE_TTL_DAYS < 1) {
    errors.push('EVENT_STORE_TTL_DAYS must be >= 1');
  }

  // Vérifier cohérence modules vs modular structure
  if (!FEATURE_FLAGS.USE_MODULAR_STRUCTURE && getEnabledModulesCount() > 0) {
    errors.push('Modules are enabled but USE_MODULAR_STRUCTURE is false');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
