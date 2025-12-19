/**
 * Module Auth
 *
 * Système d'authentification, utilisateurs et profils.
 *
 * @example
 * // Import unique depuis le module
 * import {
 *   // Services
 *   AuthService,
 *   ProfileService,
 *   
 *   // Models
 *   User,
 *   LearnerProfile,
 *   PedagogicalProfile,
 *   
 *   // Types
 *   UserData,
 *   ProfileData,
 *   UserRole,
 *   
 *   // Components
 *   UserAvatar,
 *   ProfileCard,
 *   AuthGuard,
 *   LoginButton,
 *   
 *   // Hooks
 *   useAuth,
 *   useProfile,
 *   useSession
 * } from '@/modules/auth';
 *
 * // Utiliser les services
 * await AuthService.registerUser({ name, email, password, role });
 * const { user, profile } = await ProfileService.getUserProfile(userId);
 *
 * // Utiliser les hooks
 * const { user, isAuthenticated, signIn, signOut } = useAuth();
 * const { profile, loading, refresh } = useProfile();
 *
 * // Utiliser les composants
 * <UserAvatar user={user} size="lg" />
 * <AuthGuard allowedRoles={['TEACHER', 'ADMIN']}>
 *   <ProtectedContent />
 * </AuthGuard>
 */

// Charger les event handlers au démarrage
import './events/handlers';

// ========================================
// Types
// ========================================
export type {
    UserData,
    ProfileData,
    LearnerProfileData,
    PedagogicalProfileData,
    SessionState,
    AuthMethod,
    RegisterData,
    CompleteProfileData,
    AuthResult
} from './types';

export { UserRole, SubSystem } from './types';

// ========================================
// Models
// ========================================
export * from './models';

// ========================================
// Services
// ========================================
export * from './services';

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

console.log('[Module] Auth chargé ✅');
