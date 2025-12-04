import { useSession } from "next-auth/react"
import { UserRole, AccessScope } from "@/models/enums"
import { useState, useEffect } from "react"

interface AccessControlProps {
    requiredRole?: UserRole | UserRole[]
    resourceType?: 'exam' | 'subject' | 'level' | 'field'
    resourceId?: string
}

/**
 * Hook pour vérifier les permissions côté client
 * Note: Ceci est une vérification UI uniquement, la vraie sécurité est côté serveur
 */
export function useAccessControl() {
    const { data: session, status } = useSession()
    const [pedagogicalProfile, setPedagogicalProfile] = useState<any>(null)
    const [profileLoading, setProfileLoading] = useState(false)

    // Charger le profil pédagogique si l'utilisateur est un enseignant
    useEffect(() => {
        if (session?.user?.role === UserRole.TEACHER && !pedagogicalProfile && !profileLoading) {
            setProfileLoading(true)
            fetch('/api/profiles/pedagogical')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setPedagogicalProfile(data.data)
                    }
                })
                .catch(err => console.error("Failed to load profile for access control", err))
                .finally(() => setProfileLoading(false))
        }
    }, [session, pedagogicalProfile])

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     */
    const hasRole = (role: UserRole | UserRole[]) => {
        if (!session?.user) return false

        const userRole = session.user.role as UserRole
        if (Array.isArray(role)) {
            return role.includes(userRole)
        }
        return userRole === role
    }

    /**
     * Vérifie si l'utilisateur a accès à une ressource spécifique
     * Logique simplifiée du AccessHandler côté client
     */
    const hasAccess = (resourceType: string, resourceId?: string): boolean => {
        if (!session?.user) return false

        const role = session.user.role as UserRole

        // Admins ont toujours accès
        const adminRoles = [
            UserRole.INSPECTOR,
            UserRole.PRINCIPAL,
            UserRole.DG_ISIMMA,
            UserRole.RECTOR
        ]
        if (adminRoles.includes(role)) return true

        // Étudiants : logique spécifique (à implémenter si besoin)
        if (role === UserRole.STUDENT) return true // Par défaut pour l'instant

        // Enseignants : vérification du scope
        if (role === UserRole.TEACHER) {
            if (!pedagogicalProfile) return false // En attente de chargement ou pas de profil

            const { accessScope, scopeDetails } = pedagogicalProfile

            if (accessScope === AccessScope.GLOBAL) return true

            if (!resourceId) return true // Accès général au type autorisé

            switch (accessScope) {
                case AccessScope.SUBJECT:
                    return scopeDetails.specificSubjects.includes(resourceId)

                case AccessScope.LEVEL:
                    return scopeDetails.specificLevels.includes(resourceId)

                case AccessScope.FIELD:
                    return scopeDetails.specificFields.includes(resourceId)

                case AccessScope.LOCAL:
                    // TODO: Vérifier l'institution si disponible dans le contexte
                    return true

                default:
                    return false
            }
        }

        return false
    }

    return {
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading" || (session?.user?.role === UserRole.TEACHER && profileLoading),
        user: session?.user,
        hasRole,
        hasAccess
    }
}
