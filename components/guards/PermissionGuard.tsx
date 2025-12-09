import { useAccessControl } from "@/hooks/useAccessControl"
import { ReactNode } from "react"

interface PermissionGuardProps {
    resourceType: 'exam' | 'subject' | 'level' | 'field'
    resourceId?: string
    children: ReactNode
    fallback?: ReactNode
}

/**
 * Affiche les enfants uniquement si l'utilisateur a accès à la ressource spécifiée
 */
export function PermissionGuard({
    resourceType,
    resourceId,
    children,
    fallback = null
}: PermissionGuardProps) {
    const { hasAccess, isLoading } = useAccessControl()

    if (isLoading) {
        return null
    }

    if (hasAccess(resourceType, resourceId)) {
        return <>{children}</>
    }

    return <>{fallback}</>
}
