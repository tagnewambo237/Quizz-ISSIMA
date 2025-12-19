/**
 * Types d'événements spécifiques au module Gamification
 *
 * Ces événements sont publiés PAR le module gamification
 * et peuvent être écoutés par d'autres modules
 */

export const GamificationEvents = {
  XP_GAINED: "XP_GAINED",
  BADGE_EARNED: "BADGE_EARNED",
  LEVEL_UP: "LEVEL_UP",
  STREAK_ACHIEVED: "STREAK_ACHIEVED",
  CHALLENGE_COMPLETED: "CHALLENGE_COMPLETED",
} as const;

/**
 * Badges disponibles dans le système
 */
export const BadgeDefinitions = {
  PERFECT_SCORE: {
    id: "perfect-score",
    name: "Score Parfait",
    icon: "🏆",
    description: "Obtenir 100% à un examen",
    rarity: "rare",
    xpBonus: 50,
  },
  FIRST_EXAM: {
    id: "first-exam",
    name: "Premier Examen",
    icon: "🎯",
    description: "Compléter votre premier examen",
    rarity: "common",
    xpBonus: 10,
  },
  EARLY_BIRD: {
    id: "early-bird",
    name: "Lève-tôt",
    icon: "🌅",
    description: "Compléter un examen avant la date limite",
    rarity: "common",
    xpBonus: 20,
  },
  STREAK_7: {
    id: "streak-7",
    name: "Série de 7",
    icon: "🔥",
    description: "7 jours consécutifs d'activité",
    rarity: "uncommon",
    xpBonus: 30,
  },
  QUICK_LEARNER: {
    id: "quick-learner",
    name: "Apprenant Rapide",
    icon: "⚡",
    description: "Compléter un examen en moins de 10 minutes",
    rarity: "uncommon",
    xpBonus: 25,
  },
} as const;

/**
 * Configuration XP par source
 */
export const XP_REWARDS = {
  EXAM_COMPLETION: 50,
  PERFECT_SCORE: 100,
  FIRST_ATTEMPT: 10,
  ENROLLMENT: 10,
  DAILY_LOGIN: 5,
  FORUM_POST: 5,
  HELPING_PEER: 15,
} as const;
