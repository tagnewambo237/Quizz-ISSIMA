"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
    BookOpen, ChevronRight, Star, TrendingUp, TrendingDown, Minus,
    CheckCircle, AlertCircle, HelpCircle, Target, BarChart2, Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mastery levels matching the backend
const MASTERY_LEVELS = [
    { value: 'UNKNOWN', label: "Je ne sais pas", color: "#9ca3af", icon: HelpCircle, percentage: 0 },
    { value: 'TOTALLY_UNABLE', label: "Totalement incapable", color: "#ef4444", icon: AlertCircle, percentage: 10 },
    { value: 'UNABLE_WITH_HELP', label: "Incapable même avec aide", color: "#f97316", icon: AlertCircle, percentage: 25 },
    { value: 'UNABLE_ALONE', label: "Incapable sans aide", color: "#eab308", icon: Target, percentage: 40 },
    { value: 'ABLE_WITH_HELP', label: "Capable avec aide", color: "#3b82f6", icon: Target, percentage: 60 },
    { value: 'ABLE_ALONE', label: "Capable sans aide", color: "#6366f1", icon: CheckCircle, percentage: 80 },
    { value: 'PERFECTLY_ABLE', label: "Parfaitement capable", color: "#22c55e", icon: Star, percentage: 100 }
]

interface Subject {
    id: string
    name: string
    description?: string
    averageScore: number
    conceptsCount: number
    conceptsMastered: number
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
    concepts?: Concept[]
}

interface Concept {
    id: string
    title: string
    description?: string
    currentLevel?: string
    lastEvaluated?: string
}

export default function StudentSubjectsPage() {
    const { data: session } = useSession()
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
    const [evaluating, setEvaluating] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (session?.user?.id) {
            fetchSubjects()
        }
    }, [session])

    const fetchSubjects = async () => {
        try {
            const res = await fetch('/api/student/subjects')
            const data = await res.json()
            if (data.success) {
                setSubjects(data.subjects || [])
            }
        } catch (error) {
            console.error('Error fetching subjects:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelfEvaluation = async (conceptId: string, level: string) => {
        setSaving(true)
        try {
            await fetch('/api/self-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conceptId,
                    level,
                    reflection: '' // Could add a textarea for this
                })
            })

            // Refresh subject data
            fetchSubjects()
            setEvaluating(null)
        } catch (error) {
            console.error('Error saving evaluation:', error)
        } finally {
            setSaving(false)
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-500" />
            case 'DECLINING': return <TrendingDown className="h-4 w-4 text-red-500" />
            default: return <Minus className="h-4 w-4 text-gray-400" />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        Mes Matières
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Suivez vos progrès et évaluez votre maîtrise des concepts
                    </p>
                </div>
            </div>

            {/* Subject Grid */}
            {subjects.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Aucune matière disponible
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Vous n'êtes pas encore inscrit dans une classe avec des matières.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subjects.map((subject) => (
                        <motion.div
                            key={subject.id}
                            layoutId={`subject-${subject.id}`}
                            className={cn(
                                "bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 transition-all cursor-pointer hover:shadow-lg",
                                selectedSubject?.id === subject.id
                                    ? "border-primary shadow-lg"
                                    : "border-gray-100 dark:border-gray-700"
                            )}
                            onClick={() => setSelectedSubject(
                                selectedSubject?.id === subject.id ? null : subject
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {subject.name}
                                    </h3>
                                    {subject.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {subject.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(subject.trend)}
                                    <ChevronRight className={cn(
                                        "h-5 w-5 text-gray-400 transition-transform",
                                        selectedSubject?.id === subject.id && "rotate-90"
                                    )} />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="text-2xl font-bold text-primary">
                                        {Math.round(subject.averageScore)}%
                                    </div>
                                    <div className="text-xs text-gray-500">Moyenne</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="text-2xl font-bold text-secondary">
                                        {subject.conceptsMastered}/{subject.conceptsCount}
                                    </div>
                                    <div className="text-xs text-gray-500">Concepts</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="text-2xl font-bold text-green-500">
                                        {Math.round((subject.conceptsMastered / Math.max(1, subject.conceptsCount)) * 100)}%
                                    </div>
                                    <div className="text-xs text-gray-500">Maîtrise</div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-secondary"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(subject.conceptsMastered / Math.max(1, subject.conceptsCount)) * 100}%`
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Concept Details / Self-Evaluation Panel */}
            <AnimatePresence>
                {selectedSubject && selectedSubject.concepts && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700"
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <BarChart2 className="h-5 w-5 text-primary" />
                            Auto-évaluation: {selectedSubject.name}
                        </h3>

                        <div className="space-y-4">
                            {selectedSubject.concepts.map((concept) => (
                                <div
                                    key={concept.id}
                                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {concept.title}
                                            </h4>
                                            {concept.description && (
                                                <p className="text-sm text-gray-500">{concept.description}</p>
                                            )}
                                        </div>
                                        {concept.currentLevel && (
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                                style={{
                                                    backgroundColor: MASTERY_LEVELS.find(
                                                        l => l.value === concept.currentLevel
                                                    )?.color || '#9ca3af'
                                                }}
                                            >
                                                {MASTERY_LEVELS.find(l => l.value === concept.currentLevel)?.label}
                                            </span>
                                        )}
                                    </div>

                                    {/* Evaluation buttons */}
                                    {evaluating === concept.id ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {MASTERY_LEVELS.map((level) => {
                                                const Icon = level.icon
                                                return (
                                                    <button
                                                        key={level.value}
                                                        onClick={() => handleSelfEvaluation(concept.id, level.value)}
                                                        disabled={saving}
                                                        className="p-3 rounded-xl border-2 text-left hover:border-primary transition-all disabled:opacity-50"
                                                        style={{ borderColor: level.color + '40' }}
                                                    >
                                                        <Icon
                                                            className="h-5 w-5 mb-1"
                                                            style={{ color: level.color }}
                                                        />
                                                        <span className="text-xs font-medium block" style={{ color: level.color }}>
                                                            {level.label}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEvaluating(concept.id)}
                                            className="w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Target className="h-4 w-4" />
                                            {concept.currentLevel ? "Mettre à jour" : "S'auto-évaluer"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
