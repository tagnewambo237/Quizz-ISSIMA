import { EventPriority, EventType, publishEvent } from '@/lib/events';
import { User } from '../models';
import type { IUser } from '../models';
import type { RegisterData, CompleteProfileData, AuthResult, UserData } from '../types';
import { UserRole } from '../types';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * AuthService - Module Auth
 *
 * Gère l'authentification, l'inscription et la gestion des utilisateurs
 */
export class AuthService {
  /**
   * Inscrit un nouvel utilisateur
   */
  static async registerUser(data: RegisterData): Promise<AuthResult> {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return { success: false, error: 'Cet email est déjà utilisé' };
      }

      // Hasher le mot de passe si fourni
      let hashedPassword: string | undefined;
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 12);
      }

      // Créer l'utilisateur
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as UserRole,
        googleId: data.googleId,
        githubId: data.githubId,
        isActive: true,
        emailVerified: !!data.googleId || !!data.githubId, // OAuth = vérifié
        preferences: {
          language: 'fr',
          notifications: { email: true, push: true }
        },
        gamification: {
          totalXP: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0
        }
      });

      // Publier événement USER_REGISTERED
      await publishEvent(
        EventType.USER_REGISTERED,
        {
          name: data.name,
          email: data.email,
          role: data.role,
          registrationMethod: data.googleId
            ? 'google'
            : data.githubId
              ? 'github'
              : 'email',
          registeredAt: new Date()
        },
        {
          userId: user._id,
          priority: EventPriority.NORMAL
        }
      );

      console.log(`[Auth] Utilisateur inscrit: ${data.email}`);

      return {
        success: true,
        userId: user._id.toString(),
        redirectTo: '/onboarding'
      };
    } catch (error: any) {
      console.error('[Auth] Erreur inscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Connecte un utilisateur (met à jour lastLogin)
   */
  static async loginUser(
    userId: mongoose.Types.ObjectId | string,
    email: string,
    loginMethod: 'email' | 'google' | 'github'
  ): Promise<void> {
    const userIdObj =
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Mettre à jour lastLogin et reset loginAttempts
    await User.findByIdAndUpdate(userIdObj, {
      lastLogin: new Date(),
      loginAttempts: 0,
      lockedUntil: null,
      'gamification.lastActivityDate': new Date()
    });

    // Publier événement USER_LOGIN
    await publishEvent(
      EventType.USER_LOGIN,
      {
        email,
        loginMethod,
        loginAt: new Date()
      },
      {
        userId: userIdObj,
        priority: EventPriority.NORMAL
      }
    );

    console.log(`[Auth] Connexion utilisateur: ${email}`);
  }

  /**
   * Déconnecte un utilisateur
   */
  static async logoutUser(
    userId: mongoose.Types.ObjectId | string,
    email: string
  ): Promise<void> {
    const userIdObj =
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Publier événement USER_LOGOUT
    await publishEvent(
      EventType.USER_LOGOUT,
      {
        email,
        logoutAt: new Date()
      },
      {
        userId: userIdObj,
        priority: EventPriority.LOW
      }
    );

    console.log(`[Auth] Déconnexion utilisateur: ${email}`);
  }

  /**
   * Complète le profil d'un utilisateur après inscription
   */
  static async completeProfile(
    userId: mongoose.Types.ObjectId | string,
    profileData: CompleteProfileData
  ): Promise<AuthResult> {
    try {
      const userIdStr = typeof userId === 'string' ? userId : userId.toString();
      const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

      // Mettre à jour le rôle de l'utilisateur
      await User.findByIdAndUpdate(userIdObj, {
        role: profileData.role,
        institution: profileData.institution
      });

      // TODO: La création automatique du profil sera gérée par les event handlers
      // ou via une route API dédiée selon le rôle

      // Publier événement USER_PROFILE_COMPLETED
      await publishEvent(
        EventType.USER_PROFILE_COMPLETED,
        {
          role: profileData.role,
          institution: profileData.institution,
          completedAt: new Date()
        },
        {
          userId: userIdObj,
          priority: EventPriority.HIGH
        }
      );

      console.log(`[Auth] Profil complété pour utilisateur ${userIdStr}`);

      return {
        success: true,
        userId: userIdStr,
        redirectTo: profileData.role === UserRole.STUDENT ? '/student' : '/teacher'
      };
    } catch (error: any) {
      console.error('[Auth] Erreur complétion profil:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupère un utilisateur par ID
   */
  static async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId).select('-password').lean();
  }

  /**
   * Récupère un utilisateur par email
   */
  static async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select('-password').lean();
  }

  /**
   * Convertit un IUser en UserData
   */
  static toUserData(user: IUser): UserData {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.metadata?.avatar || user.image,
      isActive: user.isActive,
      emailVerified: user.emailVerified
    };
  }

  /**
   * Met à jour un utilisateur
   */
  static async updateUser(
    userId: string,
    data: Partial<Pick<IUser, 'name' | 'metadata' | 'preferences'>>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');
  }

  /**
   * Vérifie le mot de passe d'un utilisateur
   */
  static async verifyPassword(email: string, password: string): Promise<IUser | null> {
    const user = await User.findOne({ email });
    if (!user || !user.password) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Incrémenter les tentatives échouées
      await User.findByIdAndUpdate(user._id, {
        $inc: { loginAttempts: 1 }
      });
      return null;
    }

    return user;
  }

  /**
   * Vérifie l'email d'un utilisateur
   */
  static async verifyEmail(
    userId: mongoose.Types.ObjectId | string,
    email: string
  ): Promise<void> {
    const userIdObj =
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    await User.findByIdAndUpdate(userIdObj, { emailVerified: true });

    console.log(`[Auth] Email vérifié: ${email}`);
  }

  /**
   * Réinitialise le mot de passe
   */
  static async resetPassword(
    userId: mongoose.Types.ObjectId | string,
    newPassword: string
  ): Promise<void> {
    const userIdObj =
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await User.findByIdAndUpdate(userIdObj, {
      password: hashedPassword,
      loginAttempts: 0,
      lockedUntil: null
    });

    console.log(`[Auth] Mot de passe réinitialisé pour ${userIdObj}`);
  }

  /**
   * Désactive un compte utilisateur
   */
  static async deactivateUser(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { isActive: false });
    console.log(`[Auth] Compte désactivé: ${userId}`);
  }

  /**
   * Réactive un compte utilisateur
   */
  static async reactivateUser(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { isActive: true });
    console.log(`[Auth] Compte réactivé: ${userId}`);
  }
}
