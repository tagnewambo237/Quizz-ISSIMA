"use client"

import { useState, Suspense } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { MobileHeader } from "@/components/dashboard/MobileHeader"
import { PageTransition } from "@/components/PageTransition"
import { LoadingProvider } from "@/contexts/LoadingContext"
import { GlobalProgressBar } from "@/components/ui/GlobalProgressBar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <LoadingProvider>
            <GlobalProgressBar />

            {/* Toaster is already in RootLayout */}
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />
                <Suspense fallback={<div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 z-40" />}>
                    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                </Suspense>
                <main className="md:pl-64 min-h-screen transition-all duration-300">
                    <PageTransition>
                        <div className="p-4 md:p-8 max-w-7xl mx-auto">
                            {children}
                        </div>
                    </PageTransition>
                </main>
            </div>
        </LoadingProvider>
    )
}
