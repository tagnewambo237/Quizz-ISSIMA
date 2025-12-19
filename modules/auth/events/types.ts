/**
 * Types d'événements du module Auth
 */

export enum AuthEvents {
  // Inscription
  USER_REGISTERED = 'USER_REGISTERED',

  // Connexion / Déconnexion
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',

  // Profil
  USER_PROFILE_COMPLETED = 'USER_PROFILE_COMPLETED',
  USER_PROFILE_UPDATED = 'USER_PROFILE_UPDATED',

  // Sécurité
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',

  // Streak de connexion
  DAILY_LOGIN_STREAK = 'DAILY_LOGIN_STREAK',
}

export enum AuthMethods {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
}

/**
 * Payload des événements Auth
 */
export interface UserRegisteredPayload {
  name: string;
  email: string;
  role: string;
  registrationMethod: AuthMethods;
  registeredAt: Date;
}

export interface UserLoginPayload {
  email: string;
  loginMethod: AuthMethods;
  loginAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserLogoutPayload {
  email: string;
  logoutAt: Date;
  sessionDuration?: number;
}

export interface UserProfileCompletedPayload {
  role: string;
  institution?: string;
  completedAt: Date;
}

export interface DailyLoginStreakPayload {
  currentStreak: number;
  previousStreak: number;
  isNewRecord: boolean;
}
