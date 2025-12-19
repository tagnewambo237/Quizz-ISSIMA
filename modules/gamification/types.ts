/**
 * Types partagés du module Gamification
 */

import { BadgeCategory, BadgeRarity } from './models/Badge';

// Note: XPSource est maintenant défini et exporté depuis GamificationService

/**
 * Données d'un badge (utilisées par les composants et hooks)
 */
export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  isLocked?: boolean;
  earnedAt?: Date;
  progress?: {
    current: number;
    required: number;
  };
}

/**
 * Entrée du leaderboard (utilisée par les services, composants et hooks)
 */
export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  avatarInitial?: string;
  score: number;
  totalXP?: number;
  level?: number;
  trend?: 'UP' | 'DOWN' | 'STABLE' | 'NEW';
  previousRank?: number;
  badges?: number;
  isCurrentUser?: boolean;
}

/**
 * Données XP utilisateur (utilisées par les hooks)
 */
export interface UserXPData {
  userId: string;
  totalXP: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  currentLevelXP?: number;
  currentLevelInfo: {
    name: string;
    minXP: number;
    maxXP: number;
  };
  streak?: number;
  lastActivity?: Date;
}

/**
 * Type de leaderboard
 */
export enum LeaderboardType {
  CLASS = 'CLASS',
  SCHOOL = 'SCHOOL',
  GLOBAL = 'GLOBAL',
}

/**
 * Métrique pour le classement
 */
export enum LeaderboardMetric {
  XP = 'XP',
  EXAMS = 'EXAMS',
  SCORE = 'SCORE',
  STREAK = 'STREAK',
  BADGES = 'BADGES',
}
