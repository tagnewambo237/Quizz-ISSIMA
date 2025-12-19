/**
 * Bootstrap Client
 * 
 * Initialise le système modulaire côté serveur pour Next.js 14 App Router
 * À utiliser dans un Server Component (par exemple app/layout.tsx)
 */

import { bootstrap, isAppReady } from './bootstrap';

let initializationPromise: Promise<void> | null = null;
let isInitialized = false;

/**
 * Initialise l'application de manière idempotente
 * Peut être appelé plusieurs fois sans problème (singleton pattern)
 */
export async function ensureAppInitialized(): Promise<void> {
  // Si déjà initialisé, retourner immédiatement
  if (isInitialized && isAppReady()) {
    return;
  }

  // Si initialisation en cours, attendre la promesse existante
  if (initializationPromise) {
    return initializationPromise;
  }

  // Lancer l'initialisation
  initializationPromise = (async () => {
    try {
      console.log('[Bootstrap-Client] Starting application initialization...');
      
      await bootstrap();
      
      isInitialized = true;
      console.log('[Bootstrap-Client] ✅ Application initialized successfully');
    } catch (error) {
      console.error('[Bootstrap-Client] ❌ Failed to initialize:', error);
      // Reset pour permettre un retry
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Reset l'état d'initialisation (utile pour les tests)
 */
export function resetBootstrap(): void {
  isInitialized = false;
  initializationPromise = null;
}
