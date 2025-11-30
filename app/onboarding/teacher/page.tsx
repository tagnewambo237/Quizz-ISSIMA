"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Cycle } from "@/models/enums"

import StepIndicator from "@/components/onboarding/StepIndicator"
import SubjectSelector from "@/components/onboarding/SubjectSelector"

export default function TeacherOnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        subjects: [] as string[],
        levels: [] as string[]
    })

    const totalSteps = 2
    const stepLabels = ["Subjects", "Levels"]

    // Données simulées pour les niveaux
    const LEVELS: Record<string, string[]> = {
        [Cycle.COLLEGE]: ['6ème', '5ème', '4ème', '3ème'],
        [Cycle.LYCEE]: ['2nde', '1ère', 'Tle'],
        [Cycle.LICENCE]: ['L1', 'L2', 'L3'],
        [Cycle.MASTER]: ['M1', 'M2']
    }

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
                    role: "TEACHER",
                    details: formData
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to complete onboarding")
            }

            window.location.href = "/teacher"
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    const toggleSubject = (subject: string) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }))
    }

    const toggleLevel = (level: string) => {
        setFormData(prev => ({
            ...prev,
            levels: prev.levels.includes(level)
                ? prev.levels.filter(l => l !== level)
                : [...prev.levels, level]
        }))
    }

    const isStepValid = () => {
        switch (step) {
            case 1: return formData.subjects.length > 0
            case 2: return formData.levels.length > 0
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
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        What do you teach?
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Select all subjects you are qualified to teach.
                                    </p>
                                    <SubjectSelector
                                        selectedSubjects={formData.subjects}
                                        onToggle={toggleSubject}
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
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Which levels do you teach?
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Select the grade levels you are currently teaching.
                                    </p>
                                    <div className="space-y-6">
                                        {Object.entries(LEVELS).map(([cycle, levels]) => (
                                            <div key={cycle}>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                    {cycle}
                                                </h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {levels.map((level) => (
                                                        <button
                                                            key={level}
                                                            onClick={() => toggleLevel(level)}
                                                            className={cn(
                                                                "p-2 rounded-lg border text-center transition-all text-sm",
                                                                formData.levels.includes(level)
                                                                    ? "border-primary bg-primary/5 text-primary font-medium"
                                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                                            )}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                                    : "bg-primary hover:bg-primary/90 shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
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
