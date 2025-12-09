"use client"

/**
 * StudentGamingDashboard Component
 * 
 * Gaming-style analytics dashboard for students including:
 * - Progression individuelle en temps réel
 * - Comparaison avec la classe et l'établissement
 * - Recommandations personnalisées d'amélioration
 * - Historique des évaluations et auto-évaluations
 * - Prédictions de résultats futurs
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
    Sparkles,
    Zap,
    Trophy,
    Flame,
    Star,
    Clock,
    Medal,
    Rocket,
    Shield,
    Crown,
    Swords,
    CheckCircle2,
    XCircle,
    Lightbulb,
    GraduationCap,
    School
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentGamingDashboardProps {
    studentId?: string
    classId?: string
}

interface ProgressData {
    level: number
    currentXP: number
    nextLevelXP: number
    title: string
    streak: number
    rank: number
    totalStudents: number
    percentile: number
}

interface PredictionData {
    predictedScore: number
    confidenceLevel: number
    successProbability: number
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

interface ComparisonData {
    myScore: number
    classAverage: number
    schoolAverage: number
    nationalAverage?: number
}

interface Recommendation {
    id: string
    type: 'concept' | 'practice' | 'strategy' | 'resource'
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    estimatedTime?: string
    impact?: string
}

interface EvaluationHistory {
    id: string
    title: string
    date: string
    score: number
    maxScore: number
    type: 'exam' | 'self-assessment' | 'quiz'
    subject?: string
}

interface ForecastData {
    shortTerm: { score: number; confidence: number }
    mediumTerm: { score: number; confidence: number }
    longTerm: { score: number; confidence: number }
}

export function StudentGamingDashboard({ studentId, classId }: StudentGamingDashboardProps) {
    const [progress, setProgress] = useState<ProgressData | null>(null)
    const [predictions, setPredictions] = useState<PredictionData | null>(null)
    const [comparison, setComparison] = useState<ComparisonData | null>(null)
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [history, setHistory] = useState<EvaluationHistory[]>([])
    const [forecast, setForecast] = useState<ForecastData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'progress' | 'compare' | 'recommend' | 'history' | 'predict'>('progress')

    const fetchAllData = async () => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (studentId) params.append("studentId", studentId)

            // Fetch predictions from API
            const [predRes, insightsRes] = await Promise.all([
                fetch(`/api/predictions?${params.toString()}`),
                fetch(`/api/insights?${params.toString()}`)
            ])

            if (predRes.ok) {
                const predData = await predRes.json()
                setPredictions({
                    predictedScore: predData.score?.predictedPercentage || 0,
                    confidenceLevel: predData.score?.confidenceLevel || 0,
                    successProbability: predData.probability?.probability || 0,
                    trend: predData.score?.trendDirection || 'STABLE',
                    riskLevel: predData.probability?.riskLevel || 'LOW'
                })
            }

            if (insightsRes.ok) {
                const insightsData = await insightsRes.json()
                if (insightsData.success && insightsData.data) {
                    // Set recommendations from insights
                    if (insightsData.data.recommendations) {
                        setRecommendations(insightsData.data.recommendations.map((r: any, i: number) => ({
                            id: `rec-${i}`,
                            type: r.type || 'practice',
                            title: r.title || r.action,
                            description: r.description || r.reason,
                            priority: r.priority || 'medium',
                            estimatedTime: r.estimatedTime,
                            impact: r.impact
                        })))
                    }

                    // Set forecast
                    if (insightsData.data.forecast) {
                        setForecast(insightsData.data.forecast)
                    }
                }
            }

            // Mock data for demo (will be replaced by real API data)
            setProgress({
                level: 12,
                currentXP: 2750,
                nextLevelXP: 3500,
                title: "Apprenti Expert",
                streak: 7,
                rank: 5,
                totalStudents: 32,
                percentile: 85
            })

            setComparison({
                myScore: 72,
                classAverage: 65,
                schoolAverage: 62,
                nationalAverage: 58
            })

            setHistory([
                { id: '1', title: 'Examen Final Maths', date: '2024-12-05', score: 85, maxScore: 100, type: 'exam', subject: 'Mathématiques' },
                { id: '2', title: 'Auto-évaluation Physique', date: '2024-12-03', score: 70, maxScore: 100, type: 'self-assessment', subject: 'Physique' },
                { id: '3', title: 'Quiz Français', date: '2024-12-01', score: 78, maxScore: 100, type: 'quiz', subject: 'Français' },
                { id: '4', title: 'Examen Histoire-Géo', date: '2024-11-28', score: 65, maxScore: 100, type: 'exam', subject: 'Histoire-Géo' },
                { id: '5', title: 'Auto-évaluation SVT', date: '2024-11-25', score: 82, maxScore: 100, type: 'self-assessment', subject: 'SVT' },
            ])

            if (!forecast) {
                setForecast({
                    shortTerm: { score: 75, confidence: 85 },
                    mediumTerm: { score: 78, confidence: 70 },
                    longTerm: { score: 82, confidence: 55 }
                })
            }

        } catch (err: any) {
            console.error('Error fetching data:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [studentId, classId])

    const TrendIcon = ({ trend }: { trend: string }) => {
        if (trend === 'IMPROVING') return <TrendingUp className="w-4 h-4 text-green-500" />
        if (trend === 'DECLINING') return <TrendingDown className="w-4 h-4 text-red-500" />
        return <Minus className="w-4 h-4 text-gray-400" />
    }

    const PriorityBadge = ({ priority }: { priority: string }) => {
        const config = {
            high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600', label: 'Urgent' },
            medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600', label: 'Important' },
            low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600', label: 'Conseillé' }
        }
        const c = config[priority as keyof typeof config] || config.medium
        return (
            <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", c.bg, c.text)}>
                {c.label}
            </span>
        )
    }

    const XPBar = ({ current, max }: { current: number; max: number }) => {
        const percentage = Math.min((current / max) * 100, 100)
        return (
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                    {current.toLocaleString()} / {max.toLocaleString()} XP
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Zap className="w-12 h-12 text-yellow-500 mx-auto" />
                    </motion.div>
                    <p className="mt-4 text-gray-500 animate-pulse">Chargement de tes stats...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-2xl">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
                <button onClick={fetchAllData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl">
                    Réessayer
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Gaming Header - Player Card */}
            {progress && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 rounded-3xl p-6 text-white"
                >
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            {/* Player Info */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                        <Crown className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-purple-600 rounded-lg px-2 py-0.5 text-xs font-bold">
                                        Niv. {progress.level}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{progress.title}</h2>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-300">
                                        <span className="flex items-center gap-1">
                                            <Flame className="w-4 h-4 text-orange-400" />
                                            {progress.streak} jours
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Trophy className="w-4 h-4 text-yellow-400" />
                                            #{progress.rank} / {progress.totalStudents}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Medal className="w-4 h-4 text-blue-400" />
                                            Top {100 - progress.percentile}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* XP Progress */}
                            <div className="lg:w-72">
                                <div className="flex justify-between text-sm text-gray-300 mb-1">
                                    <span>Progression vers Niv. {progress.level + 1}</span>
                                    <span>{Math.round((progress.currentXP / progress.nextLevelXP) * 100)}%</span>
                                </div>
                                <XPBar current={progress.currentXP} max={progress.nextLevelXP} />
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs text-gray-300">Score Prédit</span>
                                </div>
                                <div className="text-2xl font-bold">{predictions?.predictedScore || 0}%</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-gray-300">Prob. Réussite</span>
                                </div>
                                <div className="text-2xl font-bold">{predictions?.successProbability || 0}%</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span className="text-xs text-gray-300">Tendance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendIcon trend={predictions?.trend || 'STABLE'} />
                                    <span className="font-bold">
                                        {predictions?.trend === 'IMPROVING' ? 'En hausse' :
                                            predictions?.trend === 'DECLINING' ? 'En baisse' : 'Stable'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-gray-300">Confiance</span>
                                </div>
                                <div className="text-2xl font-bold">{predictions?.confidenceLevel || 0}%</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'progress', label: 'Progression', icon: TrendingUp },
                    { id: 'compare', label: 'Comparaison', icon: Users },
                    { id: 'recommend', label: 'Recommandations', icon: Lightbulb },
                    { id: 'history', label: 'Historique', icon: Calendar },
                    { id: 'predict', label: 'Prédictions', icon: Rocket }
                ].map(tab => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {/* Progression Tab */}
                {activeTab === 'progress' && progress && (
                    <motion.div
                        key="progress"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Real-time Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-500" />
                                Progression en Temps Réel
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
                                    <span className="text-gray-600 dark:text-gray-300">Score Actuel vs Prédit</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-purple-600">72%</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                        <span className="font-bold text-indigo-600">{predictions?.predictedScore}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <span className="text-gray-600 dark:text-gray-300">Examens complétés</span>
                                    <span className="font-bold text-gray-900 dark:text-white">15</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <span className="text-gray-600 dark:text-gray-300">Temps d'étude cette semaine</span>
                                    <span className="font-bold text-gray-900 dark:text-white">12h 30min</span>
                                </div>
                            </div>
                        </div>

                        {/* Achievements Progress */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Prochains Accomplissements
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { icon: "🎯", name: "Perfectionniste", progress: 80, desc: "3 scores parfaits / 5" },
                                    { icon: "🔥", name: "En Feu", progress: 70, desc: "7 jours / 10 de streak" },
                                    { icon: "📚", name: "Érudit", progress: 60, desc: "15 examens / 25" },
                                ].map((ach, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl">
                                            {ach.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-900 dark:text-white">{ach.name}</span>
                                                <span className="text-gray-500">{ach.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${ach.progress}%` }}
                                                    transition={{ duration: 0.5, delay: 0.1 * i }}
                                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{ach.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Comparison Tab */}
                {activeTab === 'compare' && comparison && (
                    <motion.div
                        key="compare"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Comparaison des Performances
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Ton Score', value: comparison.myScore, color: 'bg-purple-500', icon: Star },
                                { label: 'Moyenne Classe', value: comparison.classAverage, color: 'bg-blue-500', icon: GraduationCap },
                                { label: 'Moyenne École', value: comparison.schoolAverage, color: 'bg-green-500', icon: School },
                                { label: 'Moyenne Nationale', value: comparison.nationalAverage || 0, color: 'bg-gray-400', icon: Users },
                            ].map((item, i) => {
                                const Icon = item.icon
                                const diff = item.value - comparison.myScore
                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 dark:text-white">{item.value}%</span>
                                                {i > 0 && diff !== 0 && (
                                                    <span className={cn(
                                                        "text-xs font-medium px-1.5 py-0.5 rounded",
                                                        comparison.myScore > item.value
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    )}>
                                                        {comparison.myScore > item.value ? '+' : ''}{comparison.myScore - item.value}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.value}%` }}
                                                transition={{ duration: 0.8, delay: 0.1 * i }}
                                                className={cn("h-full rounded-full", item.color)}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <p className="text-purple-800 dark:text-purple-300 text-sm">
                                <strong>🎉 Bravo !</strong> Tu es au-dessus de la moyenne de ta classe et de ton école !
                                Continue comme ça pour atteindre le top 10%.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommend' && (
                    <motion.div
                        key="recommend"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                            <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                Recommandations Personnalisées
                            </h3>
                            <p className="text-amber-700 dark:text-amber-400 text-sm">
                                Basées sur ton profil d'apprentissage et tes derniers résultats
                            </p>
                        </div>

                        {recommendations.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Tout va bien !</h3>
                                <p className="text-gray-500">Pas de recommandation urgente pour le moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendations.map((rec) => (
                                    <div
                                        key={rec.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {rec.type === 'concept' && <Brain className="w-4 h-4 text-purple-500" />}
                                                {rec.type === 'practice' && <Swords className="w-4 h-4 text-blue-500" />}
                                                {rec.type === 'strategy' && <Target className="w-4 h-4 text-green-500" />}
                                                {rec.type === 'resource' && <BookOpen className="w-4 h-4 text-amber-500" />}
                                                <span className="font-medium text-gray-900 dark:text-white">{rec.title}</span>
                                            </div>
                                            <PriorityBadge priority={rec.priority} />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">{rec.description}</p>
                                        {(rec.estimatedTime || rec.impact) && (
                                            <div className="flex gap-2 text-xs text-gray-400">
                                                {rec.estimatedTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {rec.estimatedTime}
                                                    </span>
                                                )}
                                                {rec.impact && (
                                                    <span className="flex items-center gap-1">
                                                        <Zap className="w-3 h-3" /> {rec.impact}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" />
                                Historique des Évaluations
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {history.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                item.type === 'exam' ? "bg-purple-100 dark:bg-purple-900/30" :
                                                    item.type === 'self-assessment' ? "bg-blue-100 dark:bg-blue-900/30" :
                                                        "bg-green-100 dark:bg-green-900/30"
                                            )}>
                                                {item.type === 'exam' && <GraduationCap className="w-5 h-5 text-purple-600" />}
                                                {item.type === 'self-assessment' && <Brain className="w-5 h-5 text-blue-600" />}
                                                {item.type === 'quiz' && <Zap className="w-5 h-5 text-green-600" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                                                    {item.subject && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{item.subject}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn(
                                                "text-xl font-bold",
                                                item.score >= 80 ? "text-green-600" :
                                                    item.score >= 60 ? "text-amber-600" : "text-red-600"
                                            )}>
                                                {item.score}%
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {item.score}/{item.maxScore}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Predictions Tab */}
                {activeTab === 'predict' && forecast && (
                    <motion.div
                        key="predict"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {[
                            { label: 'Court Terme', sublabel: 'Prochain examen', data: forecast.shortTerm, icon: Zap, color: 'from-green-500 to-emerald-600' },
                            { label: 'Moyen Terme', sublabel: '1 mois', data: forecast.mediumTerm, icon: Target, color: 'from-blue-500 to-indigo-600' },
                            { label: 'Long Terme', sublabel: 'Fin d\'année', data: forecast.longTerm, icon: Rocket, color: 'from-purple-500 to-pink-600' },
                        ].map((period, i) => {
                            const Icon = period.icon
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
                                >
                                    <div className={cn(
                                        "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br",
                                        period.color
                                    )} />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={cn("p-2 rounded-xl bg-gradient-to-br text-white", period.color)}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{period.label}</p>
                                                <p className="text-xs text-gray-500">{period.sublabel}</p>
                                            </div>
                                        </div>
                                        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                            {period.data.score}%
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full bg-gradient-to-r", period.color)}
                                                    style={{ width: `${period.data.confidence}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {period.data.confidence}% confiance
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
