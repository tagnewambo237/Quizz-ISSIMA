import { cn } from "@/lib/utils"

interface ExamStatusBadgeProps {
    status: string
    className?: string
}

export function ExamStatusBadge({ status, className }: ExamStatusBadgeProps) {
    const getStatusColor = () => {
        switch (status) {
            case "DRAFT":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            case "PENDING_VALIDATION":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            case "VALIDATED":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            case "PUBLISHED":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            case "ARCHIVED":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusLabel = () => {
        switch (status) {
            case "DRAFT":
                return "Brouillon"
            case "PENDING_VALIDATION":
                return "En Validation"
            case "VALIDATED":
                return "Validé"
            case "PUBLISHED":
                return "Publié"
            case "ARCHIVED":
                return "Archivé"
            default:
                return status
        }
    }

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                getStatusColor(),
                className
            )}
        >
            {getStatusLabel()}
        </span>
    )
}
