"use client"

import { Menu } from "lucide-react"

interface MobileHeaderProps {
    onOpenSidebar: () => void
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
    return (
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Q</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">QuizLock</span>
            </div>
            <button
                onClick={onOpenSidebar}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Open menu"
            >
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
        </div>
    )
}
