"use client"

import { useState, useCallback } from "react"
import { useLoadingContext } from "@/contexts/LoadingContext"
import { toast } from "sonner"

interface UseAsyncActionOptions {
    // Unique key to track this operation
    key: string
    // Success message to show
    successMessage?: string
    // Error message prefix
    errorMessage?: string
    // Callback on success
    onSuccess?: (result: any) => void
    // Callback on error
    onError?: (error: Error) => void
    // Show toast notifications
    showToast?: boolean
}

interface UseAsyncActionReturn<T> {
    execute: (...args: any[]) => Promise<T | undefined>
    isLoading: boolean
    error: Error | null
    reset: () => void
}

/**
 * Hook to wrap async operations with automatic loading state management
 * 
 * @example
 * const { execute, isLoading } = useAsyncAction(
 *   async (data) => {
 *     const res = await fetch('/api/classes', { method: 'POST', body: JSON.stringify(data) })
 *     return res.json()
 *   },
 *   { key: 'createClass', successMessage: 'Classe créée!' }
 * )
 * 
 * // Usage
 * <button onClick={() => execute(formData)} disabled={isLoading}>
 *   {isLoading ? 'Chargement...' : 'Créer'}
 * </button>
 */
export function useAsyncAction<T = any>(
    asyncFn: (...args: any[]) => Promise<T>,
    options: UseAsyncActionOptions
): UseAsyncActionReturn<T> {
    const { key, successMessage, errorMessage = "Une erreur est survenue", onSuccess, onError, showToast = true } = options
    const { startLoading, stopLoading, isLoading: checkLoading } = useLoadingContext()
    const [error, setError] = useState<Error | null>(null)

    const isLoading = checkLoading(key)

    const execute = useCallback(async (...args: any[]): Promise<T | undefined> => {
        // Prevent double execution
        if (checkLoading(key)) {
            return undefined
        }

        setError(null)
        startLoading(key)

        try {
            const result = await asyncFn(...args)

            if (successMessage && showToast) {
                toast.success(successMessage)
            }

            onSuccess?.(result)
            return result
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            setError(error)

            if (showToast) {
                toast.error(`${errorMessage}: ${error.message}`)
            }

            onError?.(error)
            return undefined
        } finally {
            stopLoading(key)
        }
    }, [key, asyncFn, successMessage, errorMessage, onSuccess, onError, showToast, startLoading, stopLoading, checkLoading])

    const reset = useCallback(() => {
        setError(null)
    }, [])

    return {
        execute,
        isLoading,
        error,
        reset
    }
}

/**
 * Simplified hook for loading state without context (local state only)
 * Use when you don't need global tracking
 */
export function useLocalAsyncAction<T = any>(
    asyncFn: (...args: any[]) => Promise<T>,
    options?: Partial<Omit<UseAsyncActionOptions, 'key'>>
) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const { successMessage, errorMessage = "Une erreur est survenue", onSuccess, onError, showToast = true } = options || {}

    const execute = useCallback(async (...args: any[]): Promise<T | undefined> => {
        if (isLoading) return undefined

        setError(null)
        setIsLoading(true)

        try {
            const result = await asyncFn(...args)

            if (successMessage && showToast) {
                toast.success(successMessage)
            }

            onSuccess?.(result)
            return result
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            setError(error)

            if (showToast) {
                toast.error(`${errorMessage}: ${error.message}`)
            }

            onError?.(error)
            return undefined
        } finally {
            setIsLoading(false)
        }
    }, [asyncFn, successMessage, errorMessage, onSuccess, onError, showToast, isLoading])

    return { execute, isLoading, error, reset: () => setError(null) }
}
