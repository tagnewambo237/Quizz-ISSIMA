"use client"

import { useState } from "react"
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
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
