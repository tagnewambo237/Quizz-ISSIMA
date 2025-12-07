"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react"

interface LoadingState {
    [key: string]: boolean
}

interface LoadingContextType {
    // Check if a specific operation or any operation is loading
    isLoading: (key?: string) => boolean
    // Check if any operation is loading
    isAnyLoading: boolean
    // Start a loading operation
    startLoading: (key: string) => void
    // Stop a loading operation
    stopLoading: (key: string) => void
    // Get all active loading keys
    activeOperations: string[]
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
    children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
    const [loadingState, setLoadingState] = useState<LoadingState>({})

    const startLoading = useCallback((key: string) => {
        setLoadingState(prev => ({ ...prev, [key]: true }))
    }, [])

    const stopLoading = useCallback((key: string) => {
        setLoadingState(prev => {
            const newState = { ...prev }
            delete newState[key]
            return newState
        })
    }, [])

    const isLoading = useCallback((key?: string) => {
        if (key) {
            return !!loadingState[key]
        }
        return Object.keys(loadingState).length > 0
    }, [loadingState])

    const isAnyLoading = useMemo(() => {
        return Object.keys(loadingState).length > 0
    }, [loadingState])

    const activeOperations = useMemo(() => {
        return Object.keys(loadingState)
    }, [loadingState])

    const value = useMemo(() => ({
        isLoading,
        isAnyLoading,
        startLoading,
        stopLoading,
        activeOperations
    }), [isLoading, isAnyLoading, startLoading, stopLoading, activeOperations])

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    )
}

export function useLoadingContext() {
    const context = useContext(LoadingContext)
    if (context === undefined) {
        throw new Error("useLoadingContext must be used within a LoadingProvider")
    }
    return context
}
