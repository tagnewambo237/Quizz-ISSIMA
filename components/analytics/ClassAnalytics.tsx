"use client"

/**
 * ClassAnalytics Dashboard Component
 * 
 * For teachers to view class-level analytics including:
 * - Class performance prediction
 * - At-risk students
 * - Mastery distribution
 * - School benchmark
 */

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Users,
    AlertTriangle,
    Trophy,
    Target,
    PieChart,
    TrendingUp,
    TrendingDown,
    Minus,
    RefreshCw,
    UserX,
    Star,
    BarChart3,
    School,
    ChevronRight,
    Eye
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ClassAnalyticsProps {
    classId: string
    schoolId?: string
    showStudentDetails?: boolean
}

interface ClassPrediction {
    classId: string
    averagePredictedScore: number
    expectedPassRate: number
    atRiskStudents: number
    topPerformers: number
    distributionByMastery: Record<string, number>
}

interface SchoolBenchmark {
    schoolId: string
    averageScore: number
    passRate: number
    studentCount: number
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
}

interface RiskStudent {
    studentId: string
    studentName: string
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    riskScore: number
    indicators: { type: string; description: string }[]
}

export function ClassAnalytics({ classId, schoolId, showStudentDetails = false }: ClassAnalyticsProps) {
    const [classData, setClassData] = useState<ClassPrediction | null>(null)
    const [benchmark, setBenchmark] = useState<SchoolBenchmark | null>(null)
    const [atRiskDetails, setAtRiskDetails] = useState<RiskStudent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedTab, setSelectedTab] = useState<'overview' | 'risk' | 'distribution'>('overview')

    const fetchAnalytics = async () => {
        setLoading(true)
        setError(null)

        try {
            // Fetch class predictions
            const classRes = await fetch(`/api/predictions?type=class&classId=${classId}`)
            if (!classRes.ok) throw new Error("Failed to fetch class predictions")
            setClassData(await classRes.json())

            // Fetch school benchmark if schoolId provided
            if (schoolId) {
                const benchmarkRes = await fetch(`/api/predictions?type=benchmark&schoolId=${schoolId}`)
                if (benchmarkRes.ok) {
                    setBenchmark(await benchmarkRes.json())
                }
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [classId, schoolId])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (error || !classData) {
        return (
            <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                <p>{error || "Unable to load class analytics"}</p>
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

    // Calculate mastery distribution percentages
    const totalStudents = Object.values(classData.distributionByMastery).reduce((a, b) => a + b, 0)
    const masteryLabels: Record<string, { label: string; color: string }> = {
        'PERFECTLY_ABLE': { label: 'Parfaitement capable', color: 'bg-green-500' },
        'ABLE_ALONE': { label: 'Capable seul', color: 'bg-emerald-500' },
        'ABLE_WITH_HELP': { label: 'Capable avec aide', color: 'bg-blue-500' },
        'UNABLE_ALONE': { label: 'Incapable seul', color: 'bg-amber-500' },
        'UNABLE_WITH_HELP': { label: 'Incapable avec aide', color: 'bg-orange-500' },
        'TOTALLY_UNABLE': { label: 'Totalement incapable', color: 'bg-red-500' },
        'UNKNOWN': { label: 'Non évalué', color: 'bg-gray-400' }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-500" />
                    Analytics de la Classe
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
                {/* Average Predicted Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Score Moyen Prédit</span>
                    </div>
                    <div className="text-4xl font-bold mb-1">{classData.averagePredictedScore}%</div>
                </motion.div>

                {/* Expected Pass Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Trophy className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Taux de Réussite Prévu</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {classData.expectedPassRate}%
                    </div>
                </motion.div>

                {/* At Risk Students */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(
                        "p-6 rounded-2xl border shadow-sm",
                        classData.atRiskStudents > 0
                            ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    )}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                            "p-2 rounded-lg",
                            classData.atRiskStudents > 0
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-gray-100 dark:bg-gray-700"
                        )}>
                            <UserX className={cn(
                                "w-5 h-5",
                                classData.atRiskStudents > 0 ? "text-red-600" : "text-gray-500"
                            )} />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Étudiants à Risque</span>
                    </div>
                    <div className={cn(
                        "text-4xl font-bold mb-1",
                        classData.atRiskStudents > 0 ? "text-red-600" : "text-gray-900 dark:text-white"
                    )}>
                        {classData.atRiskStudents}
                    </div>
                    {classData.atRiskStudents > 0 && (
                        <span className="text-sm text-red-600">Nécessitent une attention</span>
                    )}
                </motion.div>

                {/* Top Performers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Star className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Top Performers</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {classData.topPerformers}
                    </div>
                    <span className="text-sm text-gray-500">Score ≥80%</span>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {[
                    { id: 'overview', label: 'Vue d\'ensemble', icon: PieChart },
                    { id: 'distribution', label: 'Distribution', icon: BarChart3 },
                    { id: 'risk', label: 'Risques', icon: AlertTriangle }
                ].map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors",
                                selectedTab === tab.id
                                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            {selectedTab === 'overview' && benchmark && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* Class vs School Comparison */}
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <School className="w-5 h-5 text-indigo-500" />
                            Comparaison avec l'École
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Score Moyen</span>
                                    <span className="font-medium">
                                        Classe: {classData.averagePredictedScore}% | École: {benchmark.averageScore}%
                                    </span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${classData.averagePredictedScore}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Taux de Réussite</span>
                                    <span className="font-medium">
                                        Classe: {classData.expectedPassRate}% | École: {benchmark.passRate}%
                                    </span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${classData.expectedPassRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* School Benchmark */}
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Benchmark École
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Score Moyen École</span>
                                <span className="font-bold text-lg">{benchmark.averageScore}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Taux de Réussite</span>
                                <span className="font-bold text-lg">{benchmark.passRate}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Total Étudiants</span>
                                <span className="font-bold text-lg">{benchmark.studentCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Tendance</span>
                                <div className="flex items-center gap-1">
                                    <TrendIcon trend={benchmark.trend} />
                                    <span className={cn(
                                        "font-medium",
                                        benchmark.trend === 'IMPROVING' ? "text-green-600" :
                                            benchmark.trend === 'DECLINING' ? "text-red-600" : "text-gray-500"
                                    )}>
                                        {benchmark.trend === 'IMPROVING' ? 'En hausse' :
                                            benchmark.trend === 'DECLINING' ? 'En baisse' : 'Stable'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {selectedTab === 'distribution' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-500" />
                        Distribution par Niveau de Maîtrise
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(classData.distributionByMastery)
                            .filter(([_, count]) => count > 0)
                            .sort(([a], [b]) => {
                                const order = ['PERFECTLY_ABLE', 'ABLE_ALONE', 'ABLE_WITH_HELP', 'UNABLE_ALONE', 'UNABLE_WITH_HELP', 'TOTALLY_UNABLE', 'UNKNOWN']
                                return order.indexOf(a) - order.indexOf(b)
                            })
                            .map(([level, count]) => {
                                const config = masteryLabels[level] || { label: level, color: 'bg-gray-400' }
                                const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0

                                return (
                                    <div key={level} className="flex items-center gap-4">
                                        <div className="w-40 text-sm text-gray-600 dark:text-gray-400">
                                            {config.label}
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.5 }}
                                                    className={cn("h-full rounded-full", config.color)}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-20 text-right">
                                            <span className="font-bold">{count}</span>
                                            <span className="text-sm text-gray-500 ml-1">({percentage}%)</span>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </motion.div>
            )}

            {selectedTab === 'risk' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {classData.atRiskStudents === 0 ? (
                        <div className="text-center py-12 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800">
                            <Trophy className="w-12 h-12 mx-auto mb-4 text-green-500" />
                            <h3 className="text-lg font-bold text-green-800 dark:text-green-300">
                                Aucun étudiant à risque 🎉
                            </h3>
                            <p className="text-green-600 dark:text-green-400 mt-2">
                                Tous vos étudiants sont sur la bonne voie !
                            </p>
                        </div>
                    ) : (
                        <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
                            <h3 className="font-bold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                {classData.atRiskStudents} étudiant(s) nécessitent une attention
                            </h3>
                            <div className="space-y-2">
                                <p className="text-red-700 dark:text-red-400 text-sm">
                                    Ces étudiants montrent des signes de difficulté ou de décrochage potentiel.
                                    Consultez leurs profils individuels pour plus de détails.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <Eye className="w-4 h-4" />
                                    <span>Cliquez sur un étudiant dans la liste pour voir les détails de risque</span>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}
