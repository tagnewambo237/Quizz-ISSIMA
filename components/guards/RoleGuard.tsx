import { useAccessControl } from "@/hooks/useAccessControl"
import { UserRole } from "@/models/enums"
import { ReactNode } from "react"

interface RoleGuardProps {
    allowedRoles: UserRole[]
    children: ReactNode
    fallback?: ReactNode
}

/**
 * Affiche les enfants uniquement si l'utilisateur a l'un des rôles autorisés
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
    const { hasRole, isLoading } = useAccessControl()

    if (isLoading) {
        return null // Ou un squelette de chargement
    }

    if (hasRole(allowedRoles)) {
        return <>{children}</>
    }

    return <>{fallback}</>
}
