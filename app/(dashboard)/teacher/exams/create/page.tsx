"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Step1Classification } from "@/components/exam-creator/Step1Classification"
import { Step2TargetAudience } from "@/components/exam-creator/Step2TargetAudience"
import { Step3Configuration } from "@/components/exam-creator/Step3Configuration"
import { Step4QuestionEditor } from "@/components/exam-creator/Step4QuestionEditor"
import { Step5Preview } from "@/components/exam-creator/Step5Preview"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/models/enums"
import { toast } from "sonner"

interface ExamData {
    // Step 1: Classification
    subSystem?: string
    targetLevels?: string[]
    subject?: string
    learningUnit?: string

    // Step 2: Target Audience
    targetFields?: string[]
    targetedCompetencies?: string[]

    // Step 3: Configuration
    title?: string
    description?: string
    startTime?: Date
    endTime?: Date
    duration?: number
    closeMode?: string
    pedagogicalObjective?: string
    evaluationType?: string
    difficultyLevel?: string
    config?: any

    // Step 4: Questions
    questions?: any[]
}

const STEPS = [
    { id: 1, name: "Classification", description: "Structure éducative" },
    { id: 2, name: "Public Cible", description: "Filières et compétences" },
    { id: 3, name: "Configuration", description: "Paramètres de l'examen" },
    { id: 4, name: "Questions", description: "Créer les questions" },
    { id: 5, name: "Aperçu", description: "Vérifier et soumettre" },
]

export default function CreateExamPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [examData, setExamData] = useState<ExamData>({})
    const [loading, setLoading] = useState(false)
    const [autoSaving, setAutoSaving] = useState(false)

    // Use useCallback to prevent infinite loops
    const updateExamData = useCallback((data: Partial<ExamData>) => {
        setExamData(prev => ({ ...prev, ...data }))
    }, [])

    // Auto-save to localStorage
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Object.keys(examData).length > 0) {
                setAutoSaving(true)
                localStorage.setItem('exam-draft', JSON.stringify(examData))
                setTimeout(() => setAutoSaving(false), 500)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [examData])

    // Load draft on mount
    useEffect(() => {
        const draft = localStorage.getItem('exam-draft')
        if (draft) {
            try {
                const parsed = JSON.parse(draft)
                setExamData(parsed)
                toast.info("Brouillon chargé", {
                    description: "Votre travail précédent a été restauré"
                })
            } catch (e) {
                console.error("Failed to load draft", e)
            }
        }
    }, [])

    // Validation for each step
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(examData.subSystem && examData.targetLevels?.length && examData.subject)
            case 2:
                return true // Optional step
            case 3:
                return !!(examData.title && examData.startTime && examData.endTime && examData.duration)
            case 4:
                return !!(examData.questions && examData.questions.length > 0)
            default:
                return true
        }
    }

    const handleNext = () => {
        if (!validateStep(currentStep)) {
            toast.error("Champs requis manquants", {
                description: "Veuillez remplir tous les champs obligatoires"
            })
            return
        }

        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/exams/v2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(examData),
            })

            if (!res.ok) {
                throw new Error("Failed to create exam")
            }

            const data = await res.json()
            localStorage.removeItem('exam-draft')
            toast.success("Examen créé avec succès !")
            router.push(`/teacher/exams/${data.data._id}`)
        } catch (error) {
            console.error("Error creating exam:", error)
            toast.error("Erreur lors de la création de l'examen")
        } finally {
            setLoading(false)
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Classification data={examData} onUpdate={updateExamData} />
            case 2:
                return <Step2TargetAudience data={examData} onUpdate={updateExamData} />
            case 3:
                return <Step3Configuration data={examData} onUpdate={updateExamData} />
            case 4:
                return <Step4QuestionEditor data={examData} onUpdate={updateExamData} />
            case 5:
                return <Step5Preview data={examData} />
            default:
                return null
        }
    }

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-gradient-to-r from-[#3a4794] to-[#2a3575] rounded-2xl p-8 text-white shadow-xl"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                    Créer un Examen
                                </h1>
                                <p className="text-blue-100 text-lg">
                                    Suivez les étapes pour créer un examen complet
                                </p>
                            </div>
                            {autoSaving && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                                >
                                    <Save className="h-4 w-4 animate-pulse" />
                                    <span className="text-sm font-medium">Sauvegarde...</span>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Progress Stepper */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            {STEPS.map((step, index) => (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-md ${currentStep > step.id
                                                ? "bg-[#359a53] text-white shadow-green-500/30"
                                                : currentStep === step.id
                                                    ? "bg-[#3a4794] text-white shadow-blue-900/30"
                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                                                }`}
                                        >
                                            {currentStep > step.id ? (
                                                <Check className="h-6 w-6" />
                                            ) : (
                                                step.id
                                            )}
                                        </motion.div>
                                        <div className="mt-3 text-center">
                                            <p className={`text-sm font-semibold ${currentStep >= step.id
                                                ? "text-gray-900 dark:text-white"
                                                : "text-gray-500 dark:text-gray-400"
                                                }`}>
                                                {step.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden md:block">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className="flex-1 mx-2 md:mx-4 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                                                transition={{ duration: 0.5 }}
                                                className="h-full bg-[#359a53]"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8"
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-between gap-4"
                    >
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className="px-6 py-6 text-base font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Précédent
                        </Button>

                        {currentStep < STEPS.length ? (
                            <Button
                                onClick={handleNext}
                                className="px-6 py-6 text-base font-semibold bg-[#3a4794] hover:bg-[#2a3575] text-white shadow-lg"
                            >
                                Suivant
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-6 text-base font-semibold bg-[#359a53] hover:bg-[#2a7a43] text-white shadow-lg disabled:opacity-50"
                            >
                                {loading ? "Création..." : "Créer l'Examen"}
                                <Check className="ml-2 h-5 w-5" />
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </RoleGuard>
    )
}
