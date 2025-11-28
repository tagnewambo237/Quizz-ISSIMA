"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function PageTransition({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(false)
    }, [])

    return (
        <>
            {/* Loading Overlay */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: isLoading ? 1 : 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center pointer-events-none"
                style={{ display: isLoading ? "flex" : "none" }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-center"
                >
                    <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <span className="text-white font-bold text-3xl">Q</span>
                    </div>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto"
                    />
                </motion.div>
            </motion.div>

            {/* Page Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </>
    )
}
