"use client"

/**
 * StudentAnalytics Dashboard Component
 * 
 * Displays comprehensive analytics for a student including:
 * - Predicted score
 * - Success probability
 * - Weak concepts
 * - Progression trends
 * - Peer ranking (if in a class)
 */

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Target,
    Brain,
    Award,
    AlertTriangle,
    BookOpen,
    BarChart3,
    Users,
    Calendar,
    RefreshCw,
    ChevronRight,
    Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentAnalyticsProps {
    studentId?: string  // If not provided, uses current user
    classId?: string
    syllabusId?: string
    compact?: boolean
}

interface PredictionData {
    score: {
        predictedPercentage: number
        confidenceLevel: number
        rSquared?: number
        trendDirection: 'UP' | 'DOWN' | 'STABLE'
        factors: { name: string; impact: number; description: string; recommendation?: string }[]
    }
    probability: {
        probability: number
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
        recommendedActions: string[]
    }
    weakConcepts: {
        conceptId: string
        conceptTitle: string
        mastery: number
        trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
    }[]
    trend: {
        period: string
        averageScore: number
        examsTaken: number
    }[]
    rank?: {
        rank: number
        totalStudents: number
        percentile: number
        trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
    }
}

export function StudentAnalytics({ studentId, classId, syllabusId, compact = false }: StudentAnalyticsProps) {
    const [data, setData] = useState<PredictionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalytics = async () => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (studentId) params.append("studentId", studentId)
            if (syllabusId) params.append("syllabusId", syllabusId)

            const res = await fetch(`/api/predictions?${params.toString()}`)
            if (!res.ok) {
                throw new Error("Failed to fetch predictions")
            }

            const predictionData = await res.json()

            // If classId provided, also fetch ranking
            if (classId) {
                const rankRes = await fetch(`/api/predictions?type=rank&classId=${classId}${studentId ? `&studentId=${studentId}` : ''}`)
                if (rankRes.ok) {
                    predictionData.rank = await rankRes.json()
                }
            }

            setData(predictionData)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [studentId, classId, syllabusId])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                <p>{error || "Unable to load analytics"}</p>
                <button
                    onClick={fetchAnalytics}
                    className="mt-4 text-blue-500 hover:underline"
                >
                    Réessayer
                </button>
            </div>
        )
    }

    const TrendIcon = ({ trend }: { trend: 'IMPROVING' | 'STABLE' | 'DECLINING' }) => {
        if (trend === 'IMPROVING') return <TrendingUp className="w-4 h-4 text-green-500" />
        if (trend === 'DECLINING') return <TrendingDown className="w-4 h-4 text-red-500" />
        return <Minus className="w-4 h-4 text-gray-400" />
    }

    const RiskBadge = ({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) => {
        const colors = {
            LOW: 'bg-green-100 text-green-700 border-green-200',
            MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
            HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
            CRITICAL: 'bg-red-100 text-red-700 border-red-200'
        }
        const labels = {
            LOW: 'Faible risque',
            MEDIUM: 'Risque modéré',
            HIGH: 'Risque élevé',
            CRITICAL: 'Risque critique'
        }
        return (
            <span className={cn("px-2 py-1 text-xs font-medium rounded-full border", colors[level])}>
                {labels[level]}
            </span>
        )
    }

    if (compact) {
        // Compact view for sidebar or widget
        return (
            <div className="space-y-4">
                {/* Quick Score */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <div>
                        <p className="text-sm text-gray-500">Score Prédit</p>
                        <p className="text-2xl font-bold text-blue-600">{data.score.predictedPercentage}%</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Probabilité</p>
                        <p className="text-lg font-semibold text-gray-700">{data.probability.probability}%</p>
                    </div>
                </div>

                {/* Quick Weak Concepts */}
                {data.weakConcepts.length > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                        <p className="text-sm font-medium text-amber-700 mb-2">À réviser :</p>
                        <div className="flex flex-wrap gap-2">
                            {data.weakConcepts.slice(0, 3).map(concept => (
                                <span
                                    key={concept.conceptId}
                                    className="px-2 py-1 bg-white dark:bg-gray-800 text-xs rounded-full text-amber-700"
                                >
                                    {concept.conceptTitle}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    Mes Prédictions & Analytics
                </h2>
                <button
                    onClick={fetchAnalytics}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Rafraîchir"
                >
                    <RefreshCw className={cn("w-5 h-5 text-gray-500", loading && "animate-spin")} />
                </button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Predicted Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Score Prédit</span>
                        {data.score.trendDirection === 'UP' && <TrendingUp className="w-4 h-4 text-green-300" />}
                        {data.score.trendDirection === 'DOWN' && <TrendingDown className="w-4 h-4 text-red-300" />}
                    </div>
                    <div className="text-4xl font-bold mb-2">{data.score.predictedPercentage}%</div>
                    <div className="flex flex-col gap-1 text-sm text-blue-100">
                        <span>Confiance: {data.score.confidenceLevel}%</span>
                        {data.score.rSquared !== undefined && (
                            <span className="text-xs opacity-75">
                                R² = {(data.score.rSquared * 100).toFixed(0)}% (précision régression)
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* Success Probability */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Probabilité de Réussite</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {data.probability.probability}%
                    </div>
                    <RiskBadge level={data.probability.riskLevel} />
                </motion.div>

                {/* Peer Ranking (if available) */}
                {data.rank && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Classement</span>
                        </div>
                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                {data.rank.rank}
                            </span>
                            <span className="text-lg text-gray-500 pb-1">/ {data.rank.totalStudents}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Top {100 - data.rank.percentile}%</span>
                            <TrendIcon trend={data.rank.trend} />
                        </div>
                    </motion.div>
                )}

                {/* Weak Concepts Count */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Brain className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Concepts à Réviser</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {data.weakConcepts.length}
                    </div>
                    <span className="text-sm text-gray-500">points faibles identifiés</span>
                </motion.div>
            </div>

            {/* Factors & Recommendations */}
            {data.score.factors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Facteurs de Prédiction
                    </h3>
                    <div className="space-y-4">
                        {data.score.factors.map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className={cn(
                                    "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                                    factor.impact > 0
                                        ? "bg-green-100 text-green-600"
                                        : factor.impact < 0
                                            ? "bg-red-100 text-red-600"
                                            : "bg-gray-100 text-gray-500"
                                )}>
                                    {factor.impact > 0 ? '+' : ''}{factor.impact}%
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{factor.name}</p>
                                    <p className="text-sm text-gray-500">{factor.description}</p>
                                    {factor.recommendation && (
                                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            <ChevronRight className="w-4 h-4" />
                                            {factor.recommendation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Weak Concepts */}
            {data.weakConcepts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        Concepts à Réviser
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.weakConcepts.map((concept) => (
                            <div
                                key={concept.conceptId}
                                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {concept.conceptTitle}
                                    </p>
                                    <TrendIcon trend={concept.trend} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full",
                                                concept.mastery < 30 ? "bg-red-500" :
                                                    concept.mastery < 50 ? "bg-amber-500" : "bg-yellow-500"
                                            )}
                                            style={{ width: `${concept.mastery}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">
                                        {concept.mastery}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Progression Chart (Simple Visualization) */}
            {data.trend.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        Progression
                    </h3>
                    <div className="flex items-end justify-between gap-2 h-40">
                        {data.trend.map((week, idx) => {
                            const height = Math.max(10, week.averageScore)
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center">
                                        <span className="text-xs text-gray-500 mb-1">
                                            {week.averageScore > 0 ? `${week.averageScore}%` : '-'}
                                        </span>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ delay: 0.1 * idx, duration: 0.5 }}
                                            className={cn(
                                                "w-full rounded-t-md",
                                                week.averageScore >= 75 ? "bg-green-500" :
                                                    week.averageScore >= 50 ? "bg-blue-500" :
                                                        week.averageScore > 0 ? "bg-amber-500" : "bg-gray-200"
                                            )}
                                            style={{ minHeight: '8px' }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400 truncate w-full text-center">
                                        {week.period.replace('Semaine ', 'S')}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* Recommended Actions */}
            {data.probability.recommendedActions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl border border-green-100 dark:border-green-800"
                >
                    <h3 className="font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Actions Recommandées
                    </h3>
                    <ul className="space-y-2">
                        {data.probability.recommendedActions.map((action, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <ChevronRight className="w-4 h-4" />
                                {action}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </div>
    )
}
