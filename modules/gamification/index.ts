/**
 * Module Gamification
 *
 * Système complet de gamification avec XP, badges, niveaux et leaderboards.
 *
 * @example
 * import {
 *   GamificationService,
 *   UserXP,
 *   Badge,
 *   XPDisplay,
 *   BadgeCard,
 *   useUserXP,
 *   useBadges
 * } from '@/modules/gamification';
 */

// Charger les event handlers au démarrage
import './events/handlers';

// ========================================
// Types
// ========================================
export type {
  BadgeData,
  LeaderboardEntry,
  UserXPData
} from './types';

export { LeaderboardType, LeaderboardMetric } from './types';

// ========================================
// Models
// ========================================
export { UserXP } from './models/UserXP';
export { XPTransaction } from './models/XPTransaction';
export { Badge, UserBadge, BadgeCategory, BadgeRarity } from './models/Badge';

// ========================================
// Services (XPSource vient du service)
// ========================================
export {
  GamificationService,
  XPSource
} from './services/GamificationService';
export type {
  XPTransaction as XPTransactionData,
  UserGamificationStats,
  LevelInfo
} from './services/GamificationService';

export { LeaderboardService } from './services/LeaderboardService';

// ========================================
// Components
// ========================================
export * from './components';

// ========================================
// Hooks
// ========================================
export * from './hooks';

// ========================================
// Events
// ========================================
export * from './events/types';

console.log('[Module] Gamification chargé ✅');
