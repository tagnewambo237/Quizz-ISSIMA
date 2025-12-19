'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface ExtendedSession extends Session {
    user: Session['user'] & {
        id: string;
        role: string;
        emailVerified?: boolean;
    };
}

interface UseSessionReturn {
    session: ExtendedSession | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    isLoading: boolean;
    isAuthenticated: boolean;
    userId: string | null;
    userRole: string | null;
}

/**
 * Hook simplifié pour accéder à la session next-auth avec types stricts
 * 
 * @example
 * const { session, isAuthenticated, userId, userRole } = useSessionData();
 * 
 * if (!isAuthenticated) {
 *   redirect('/login');
 * }
 * 
 * console.log('User ID:', userId);
 * console.log('Role:', userRole);
 */
export function useSessionData(): UseSessionReturn {
    const { data: session, status } = useSession();

    const extendedSession = session as ExtendedSession | null;

    return {
        session: extendedSession,
        status,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated' && !!session,
        userId: extendedSession?.user?.id || null,
        userRole: extendedSession?.user?.role || null
    };
}

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 * 
 * @example
 * const canManageUsers = useHasRole(['ADMIN', 'SUPER_ADMIN']);
 * const isTeacher = useHasRole('TEACHER');
 */
export function useHasRole(requiredRoles: string | string[]): boolean {
    const { userRole, isAuthenticated } = useSessionData();

    if (!isAuthenticated || !userRole) return false;

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(userRole);
}

/**
 * Hook pour vérifier si l'utilisateur est connecté
 */
export function useIsAuthenticated(): boolean {
    const { isAuthenticated } = useSessionData();
    return isAuthenticated;
}

export { useSessionData as useSession };
export default useSessionData;
