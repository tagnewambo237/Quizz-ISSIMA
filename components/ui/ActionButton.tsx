"use client"

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
    loadingText?: string
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline"
    size?: "sm" | "md" | "lg"
    icon?: ReactNode
    children: ReactNode
}

const variantStyles = {
    primary: "bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/20",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20",
    ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
    outline: "border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
}

const sizeStyles = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl"
}

/**
 * Button component with built-in loading state
 * 
 * @example
 * <ActionButton 
 *   loading={isLoading} 
 *   onClick={handleSubmit}
 *   variant="primary"
 * >
 *   Sauvegarder
 * </ActionButton>
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
    ({
        loading = false,
        loadingText,
        variant = "primary",
        size = "md",
        icon,
        children,
        className,
        disabled,
        ...props
    }, ref) => {
        const isDisabled = loading || disabled

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={cn(
                    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {loadingText || children}
                    </>
                ) : (
                    <>
                        {icon}
                        {children}
                    </>
                )}
            </button>
        )
    }
)

ActionButton.displayName = "ActionButton"
