"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useLoadingContext } from "@/contexts/LoadingContext"

/**
 * Global progress bar that appears at the top of the screen during any loading operation
 * Similar to YouTube/GitHub loading indicator
 */
export function GlobalProgressBar() {
    const { isAnyLoading } = useLoadingContext()

    return (
        <AnimatePresence>
            {isAnyLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[9999] h-1"
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-secondary via-purple-500 to-secondary"
                        initial={{ x: "-100%" }}
                        animate={{
                            x: ["−100%", "100%"],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
