/**
 * Types partagés du module Auth
 */

// Re-export des enums depuis le modèle central
export { UserRole, SubSystem } from '@/models/enums';

/**
 * Type de méthode d'authentification
 */
export type AuthMethod = 'email' | 'google' | 'github';

/**
 * Données utilisateur simplifiées (pour les composants/hooks)
 */
export interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    isActive: boolean;
    emailVerified?: boolean;
}

/**
 * Données du profil étudiant (LearnerProfile)
 */
export interface LearnerProfileData {
    userId: string;
    currentLevel?: {
        id: string;
        name: string;
        code?: string;
    };
    currentField?: {
        id: string;
        name: string;
        code?: string;
    };
    subscriptionStatus: string;
    stats: {
        totalExamsTaken: number;
        averageScore: number;
        totalStudyTime: number;
    };
    gamification: {
        level: number;
        xp: number;
        streak: number;
        badges: Array<{ badgeId: string; earnedAt: Date }>;
    };
}

/**
 * Données du profil enseignant (PedagogicalProfile)
 */
export interface PedagogicalProfileData {
    userId: string;
    teachingSubjects: Array<{ id: string; name: string; code?: string }>;
    interventionLevels: Array<{ id: string; name: string }>;
    accessScope: string;
    stats: {
        totalExamsCreated: number;
        totalStudentsSupervised: number;
        averageStudentScore: number;
    };
}

/**
 * Données combinées user + profil
 */
export interface ProfileData {
    user: UserData;
    profile: LearnerProfileData | PedagogicalProfileData | null;
    profileType: 'learner' | 'pedagogical' | null;
}

/**
 * État de session pour les hooks
 */
export interface SessionState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserData | null;
    error: string | null;
}

/**
 * Données d'inscription
 */
export interface RegisterData {
    name: string;
    email: string;
    password?: string;
    role: string;
    googleId?: string;
    githubId?: string;
}

/**
 * Données de complétion de profil
 */
export interface CompleteProfileData {
    role: string;
    institution?: string;
    currentLevel?: string;
    currentField?: string;
    preferences?: Record<string, any>;
    metadata?: Record<string, any>;
}

/**
 * Résultat d'authentification
 */
export interface AuthResult {
    success: boolean;
    userId?: string;
    error?: string;
    redirectTo?: string;
}
