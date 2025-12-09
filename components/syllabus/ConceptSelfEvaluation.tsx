"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, HelpCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export enum MasteryLevel {
    UNKNOWN = 'UNKNOWN',
    TOTALLY_UNABLE = 'TOTALLY_UNABLE',
    UNABLE_WITH_HELP = 'UNABLE_WITH_HELP',
    UNABLE_ALONE = 'UNABLE_ALONE',
    ABLE_WITH_HELP = 'ABLE_WITH_HELP',
    ABLE_ALONE = 'ABLE_ALONE',
    PERFECTLY_ABLE = 'PERFECTLY_ABLE'
}

interface ConceptSelfEvaluationProps {
    conceptId: string
    syllabusId: string
    conceptTitle: string
    onEvaluate?: (level: MasteryLevel) => void
}

const LEVELS = [
    { id: MasteryLevel.UNKNOWN, label: "Je ne sais pas", color: "bg-gray-200 text-gray-600", value: 0 },
    { id: MasteryLevel.TOTALLY_UNABLE, label: "Totalement incapable", color: "bg-red-100 text-red-600", value: 10 },
    { id: MasteryLevel.UNABLE_WITH_HELP, label: "Incapable même avec aide", color: "bg-orange-100 text-orange-600", value: 25 },
    { id: MasteryLevel.UNABLE_ALONE, label: "Incapable sans aide", color: "bg-yellow-100 text-yellow-600", value: 40 },
    { id: MasteryLevel.ABLE_WITH_HELP, label: "Capable avec aide", color: "bg-blue-100 text-blue-600", value: 60 },
    { id: MasteryLevel.ABLE_ALONE, label: "Capable sans aide", color: "bg-indigo-100 text-indigo-600", value: 80 },
    { id: MasteryLevel.PERFECTLY_ABLE, label: "Je suis parfaitement capable", color: "bg-green-100 text-green-600", value: 100 },
]

export function ConceptSelfEvaluation({ conceptId, syllabusId, conceptTitle, onEvaluate }: ConceptSelfEvaluationProps) {
    const [selectedLevel, setSelectedLevel] = useState<MasteryLevel | null>(null)
    const [reflection, setReflection] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async () => {
        if (!selectedLevel) return

        setSubmitting(true)
        try {
            const res = await fetch("/api/syllabus/concepts/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conceptId,
                    syllabusId,
                    level: selectedLevel,
                    reflection
                })
            })

            if (res.ok) {
                toast.success("Auto-évaluation enregistrée !")
                setSubmitted(true)
                if (onEvaluate) onEvaluate(selectedLevel)
            } else {
                toast.error("Erreur lors de l'enregistrement")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erreur technique")
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 text-center"
            >
                <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-3">
                    <Check className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-green-800 dark:text-green-300">Évaluation enregistrée !</h3>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">Merci pour votre réflexion.</p>
            </motion.div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Auto-évaluation : {conceptTitle}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Évaluez votre niveau de maîtrise pour ce concept. Soyez honnête, cela vous aidera à progresser.
            </p>

            <div className="space-y-3 mb-6">
                {LEVELS.map((level) => (
                    <motion.button
                        key={level.id}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-all border-2 ${selectedLevel === level.id
                                ? "border-[#3a4795] ring-2 ring-[#3a4795]/20"
                                : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            } ${selectedLevel === level.id ? "bg-white dark:bg-gray-800" : level.color.replace('text-', 'bg-opacity-10 text-')}`}
                    >
                        <span className={`font-medium ${selectedLevel === level.id ? 'text-[#3a4795]' : ''}`}>
                            {level.label}
                        </span>
                        {selectedLevel === level.id && (
                            <div className="h-6 w-6 bg-[#3a4795] rounded-full flex items-center justify-center text-white">
                                <Check className="h-4 w-4" />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Réflexion (Optionnel)
                </label>
                <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Qu'est-ce qui vous pose problème ? Ou qu'est-ce que vous avez bien compris ?"
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#3a4795] outline-none transition-all resize-none h-24"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!selectedLevel || submitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!selectedLevel || submitting
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#3a4795] to-[#359b52] text-white hover:shadow-lg hover:shadow-[#3a4795]/20 active:scale-95"
                    }`}
            >
                {submitting ? "Enregistrement..." : "Valider mon auto-évaluation"}
            </button>
        </div>
    )
}
