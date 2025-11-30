"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface StepIndicatorProps {
    currentStep: number
    totalSteps: number
    labels?: string[]
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
    return (
        <div className="w-full mb-8">
            <div className="flex justify-between items-center relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full" />

                {/* Active Progress Bar */}
                <motion.div
                    className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />

                {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNumber = index + 1
                    const isActive = stepNumber === currentStep
                    const isCompleted = stepNumber < currentStep

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isActive || isCompleted ? "var(--primary)" : "var(--background)",
                                    borderColor: isActive || isCompleted ? "var(--primary)" : "var(--muted)",
                                    scale: isActive ? 1.1 : 1
                                }}
                                className={cn(
                                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 bg-white dark:bg-gray-800",
                                    (isActive || isCompleted) ? "border-primary text-white" : "border-gray-300 dark:border-gray-600 text-gray-400"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span className="text-sm font-medium">{stepNumber}</span>
                                )}
                            </motion.div>
                            {labels && labels[index] && (
                                <span className={cn(
                                    "absolute top-10 text-xs font-medium whitespace-nowrap transition-colors duration-300",
                                    isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
                                )}>
                                    {labels[index]}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
