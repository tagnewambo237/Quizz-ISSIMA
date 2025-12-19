'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    fallback?: React.ReactNode;
    redirectTo?: string;
    requireEmailVerified?: boolean;
}

/**
 * AuthGuard - Protège les routes selon l'authentification et les rôles
 * 
 * @example
 * // Protéger une route pour les enseignants et admins
 * <AuthGuard allowedRoles={['TEACHER', 'ADMIN']}>
 *   <TeacherDashboard />
 * </AuthGuard>
 * 
 * @example
 * // Rediriger vers une page spécifique si non autorisé
 * <AuthGuard allowedRoles={['ADMIN']} redirectTo="/unauthorized">
 *   <AdminPanel />
 * </AuthGuard>
 */
export function AuthGuard({
    children,
    allowedRoles,
    fallback,
    redirectTo = '/login',
    requireEmailVerified = false
}: AuthGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Toujours attendre que la session soit chargée
        if (status === 'loading') return;

        // Non authentifié -> rediriger vers login
        if (status === 'unauthenticated') {
            router.push(redirectTo);
            return;
        }

        // Authentifié - vérifier les rôles si spécifiés
        if (session?.user) {
            const userRole = (session.user as any).role;

            // Vérifier si le rôle est autorisé
            if (allowedRoles && allowedRoles.length > 0) {
                if (!userRole || !allowedRoles.includes(userRole)) {
                    router.push('/unauthorized');
                    return;
                }
            }

            // Vérifier si l'email doit être vérifié
            if (requireEmailVerified && !(session.user as any).emailVerified) {
                router.push('/verify-email');
                return;
            }

            setIsAuthorized(true);
        }
    }, [session, status, allowedRoles, redirectTo, requireEmailVerified, router]);

    // État de chargement
    if (status === 'loading') {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#2a3575]" />
                    <p className="text-gray-500">Vérification de l'authentification...</p>
                </div>
            </div>
        );
    }

    // Non autorisé - afficher rien pendant la redirection
    if (!isAuthorized) {
        return fallback || null;
    }

    // Autorisé - afficher le contenu
    return <>{children}</>;
}

/**
 * HOC version of AuthGuard
 */
export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    options?: Omit<AuthGuardProps, 'children'>
) {
    return function AuthenticatedComponent(props: P) {
        return (
            <AuthGuard {...options}>
                <Component {...props} />
            </AuthGuard>
        );
    };
}

export default AuthGuard;
