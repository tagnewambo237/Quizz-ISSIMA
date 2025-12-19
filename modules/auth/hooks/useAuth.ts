'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';
import type { AuthMethod, UserData } from '../types';

/**
 * Hook principal pour la gestion de l'authentification
 * 
 * @example
 * const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
 * 
 * if (isLoading) return <Loader />;
 * if (!isAuthenticated) return <LoginPage />;
 * 
 * return <Dashboard user={user} />;
 */
export function useAuth() {
    const { data: session, status, update } = useSession();

    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated' && !!session?.user;

    // Convertir la session en UserData
    const user: UserData | null = session?.user ? {
        id: (session.user as any).id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user as any).role || '',
        avatar: session.user.image || undefined,
        isActive: true,
        emailVerified: (session.user as any).emailVerified
    } : null;

    // Fonction de connexion
    const handleSignIn = useCallback(async (
        provider: AuthMethod,
        options?: { callbackUrl?: string; redirect?: boolean }
    ) => {
        return await signIn(provider, {
            callbackUrl: options?.callbackUrl || '/',
            redirect: options?.redirect ?? true
        });
    }, []);

    // Fonction de déconnexion
    const handleSignOut = useCallback(async (options?: { callbackUrl?: string }) => {
        return await signOut({
            callbackUrl: options?.callbackUrl || '/login'
        });
    }, []);

    // Rafraîchir la session
    const refreshSession = useCallback(async () => {
        await update();
    }, [update]);

    return {
        // État
        user,
        session,
        isAuthenticated,
        isLoading,
        status,

        // Actions
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshSession,

        // Helpers
        hasRole: (role: string | string[]) => {
            if (!user?.role) return false;
            if (Array.isArray(role)) return role.includes(user.role);
            return user.role === role;
        },
        isStudent: user?.role === 'STUDENT',
        isTeacher: user?.role === 'TEACHER',
        isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
    };
}

export default useAuth;
