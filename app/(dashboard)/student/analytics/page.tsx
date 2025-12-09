"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
    BarChart2, TrendingUp, TrendingDown, Target, Award, Brain,
    Loader2, AlertTriangle, CheckCircle, Clock, Sparkles, Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PredictionData {
    predictedPercentage: number
    confidenceLevel: number
    trendDirection: 'UP' | 'DOWN' | 'STABLE'
    factors: {
        name: string
        impact: number
        description: string
        recommendation?: string
    }[]
}

interface StrengthWeakness {
    subjectId: string
    subjectName: string
    averageScore: number
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
}

interface AnalyticsData {
    prediction?: PredictionData
    strengths: StrengthWeakness[]
    weaknesses: StrengthWeakness[]
    overallLevel: string
    recommendations: string[]
    successProbability?: {
        probability: number
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
        recommendedActions: string[]
    }
}

export default function StudentAnalyticsPage() {
    const { data: session } = useSession()
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user?.id) {
            fetchAnalytics()
        }
    }, [session])

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/student/analytics')
            const data = await res.json()
            if (data.success) {
                setAnalytics(data.analytics)
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'IMPROVING':
            case 'UP':
                return <TrendingUp className="h-5 w-5 text-green-500" />
            case 'DECLINING':
            case 'DOWN':
                return <TrendingDown className="h-5 w-5 text-red-500" />
            default:
                return <Target className="h-5 w-5 text-gray-400" />
        }
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'LOW': return 'text-green-500 bg-green-50 dark:bg-green-900/20'
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
            case 'HIGH': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
            case 'CRITICAL': return 'text-red-500 bg-red-50 dark:bg-red-900/20'
            default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <BarChart2 className="h-8 w-8 text-primary" />
                    </div>
                    Mes Performances
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Analyse de vos forces, faiblesses et prédictions personnalisées
                </p>
            </div>

            {!analytics ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <BarChart2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Données insuffisantes
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Complétez quelques examens pour obtenir des analyses détaillées.
                    </p>
                </div>
            ) : (
                <>
                    {/* Prediction Card */}
                    {analytics.prediction && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 text-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="h-5 w-5" />
                                    <span className="text-white/80 font-medium">Prédiction IA</span>
                                </div>

                                <div className="flex items-end gap-4 mb-4">
                                    <div className="text-6xl font-bold">
                                        {Math.round(analytics.prediction.predictedPercentage)}%
                                    </div>
                                    <div className="flex items-center gap-2 pb-2">
                                        {getTrendIcon(analytics.prediction.trendDirection)}
                                        <span className="text-white/80">
                                            Score prédit prochain examen
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2">
                                        <span className="text-sm text-white/60">Confiance</span>
                                        <span className="ml-2 font-bold">{analytics.prediction.confidenceLevel}%</span>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2">
                                        <span className="text-sm text-white/60">Tendance</span>
                                        <span className="ml-2 font-bold capitalize">
                                            {analytics.prediction.trendDirection === 'UP' ? 'En hausse' :
                                                analytics.prediction.trendDirection === 'DOWN' ? 'En baisse' : 'Stable'}
                                        </span>
                                    </div>
                                </div>

                                {/* Factors */}
                                <div className="space-y-2">
                                    {analytics.prediction.factors.slice(0, 3).map((factor, idx) => (
                                        <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center justify-between">
                                            <div>
                                                <span className="font-medium">{factor.name}</span>
                                                <p className="text-sm text-white/60">{factor.description}</p>
                                            </div>
                                            <span className={cn(
                                                "font-bold text-lg",
                                                factor.impact >= 0 ? "text-green-300" : "text-red-300"
                                            )}>
                                                {factor.impact >= 0 ? '+' : ''}{factor.impact}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Success Probability */}
                    {analytics.successProbability && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={cn(
                                "rounded-3xl p-6 border-2",
                                getRiskColor(analytics.successProbability.riskLevel)
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {analytics.successProbability.riskLevel === 'LOW' ? (
                                        <CheckCircle className="h-6 w-6" />
                                    ) : (
                                        <AlertTriangle className="h-6 w-6" />
                                    )}
                                    <h3 className="text-xl font-bold">Probabilité de Réussite</h3>
                                </div>
                                <div className="text-4xl font-bold">
                                    {analytics.successProbability.probability}%
                                </div>
                            </div>

                            {analytics.successProbability.recommendedActions.length > 0 && (
                                <div className="space-y-2">
                                    <p className="font-medium text-sm opacity-80">Actions recommandées:</p>
                                    {analytics.successProbability.recommendedActions.map((action, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span className="text-sm">{action}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Strengths & Weaknesses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-green-100 dark:border-green-900/30"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <Award className="h-5 w-5 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Points Forts
                                </h3>
                            </div>

                            {analytics.strengths.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    Continuez à progresser !
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {analytics.strengths.map((strength) => (
                                        <div
                                            key={strength.subjectId}
                                            className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {strength.subjectName}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {getTrendIcon(strength.trend)}
                                                    <span className="font-bold text-green-600 dark:text-green-400">
                                                        {Math.round(strength.averageScore)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Weaknesses */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-red-100 dark:border-red-900/30"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                    <Target className="h-5 w-5 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    À Améliorer
                                </h3>
                            </div>

                            {analytics.weaknesses.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    Aucune faiblesse détectée !
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {analytics.weaknesses.map((weakness) => (
                                        <div
                                            key={weakness.subjectId}
                                            className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {weakness.subjectName}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {getTrendIcon(weakness.trend)}
                                                    <span className="font-bold text-red-600 dark:text-red-400">
                                                        {Math.round(weakness.averageScore)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Recommendations */}
                    {analytics.recommendations.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-yellow-400" />
                                <h3 className="text-xl font-bold">Recommandations Personnalisées</h3>
                            </div>
                            <div className="space-y-3">
                                {analytics.recommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-primary">{idx + 1}</span>
                                        </div>
                                        <p className="text-gray-300">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    )
}
