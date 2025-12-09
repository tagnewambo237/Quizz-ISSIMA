"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { SubSystem } from "@/models/enums"

import StepIndicator from "@/components/onboarding/StepIndicator"
import SubSystemSelector from "@/components/onboarding/SubSystemSelector"
import LevelSelector from "@/components/onboarding/LevelSelector"
import FieldSelector from "@/components/onboarding/FieldSelector"

export default function StudentOnboardingPage() {
    const router = useRouter()
    const { update } = useSession()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        subSystem: null as SubSystem | null,
        cycle: null as string | null,
        level: null as string | null,
        field: null as string | null
    })

    const totalSteps = 3
    const stepLabels = ["System", "Level", "Field"]

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1)
        } else {
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        } else {
            router.push("/onboarding")
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: "STUDENT",
                    details: formData
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to complete onboarding")
            }

            // Force session update to refresh the JWT token with the new role
            // This triggers the JWT callback which fetches the updated role from DB
            await update()

            // Use window.location.href for a full page reload to ensure middleware picks up new role
            window.location.href = "/student"
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    const isStepValid = () => {
        switch (step) {
            case 1: return !!formData.subSystem
            case 2: return !!formData.cycle && !!formData.level
            case 3: return true // Field is optional or handled by component
            default: return false
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">

                    <StepIndicator
                        currentStep={step}
                        totalSteps={totalSteps}
                        labels={stepLabels}
                    />

                    <div className="mb-8 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Select your Education System
                                    </h2>
                                    <SubSystemSelector
                                        selected={formData.subSystem}
                                        onSelect={(sys) => setFormData({ ...formData, subSystem: sys })}
                                    />
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Select your Level
                                    </h2>
                                    <LevelSelector
                                        subSystem={formData.subSystem!}
                                        selectedCycle={formData.cycle}
                                        selectedLevel={formData.level}
                                        onSelectCycle={(c) => setFormData({ ...formData, cycle: c, level: null, field: null })}
                                        onSelectLevel={(l) => setFormData({ ...formData, level: l, field: null })}
                                    />
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Select your Field / Series
                                    </h2>
                                    <FieldSelector
                                        level={formData.level!}
                                        selectedField={formData.field}
                                        onSelect={(f) => setFormData({ ...formData, field: f })}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <div className="mb-6 text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={handleBack}
                            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={!isStepValid() || loading}
                            className={cn(
                                "px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center shadow-lg",
                                !isStepValid()
                                    ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none"
                                    : "bg-secondary hover:bg-secondary/90 shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {step === totalSteps ? "Finish Setup" : "Continue"}
                                    {step < totalSteps && <ChevronRight className="w-5 h-5 ml-2" />}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
