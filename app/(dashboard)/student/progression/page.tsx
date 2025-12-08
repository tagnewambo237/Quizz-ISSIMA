"use client"

/**
 * Student Progression & Trends Page
 * 
 * Comprehensive view for students to track their progression:
 * - Performance trends over time
 * - Skill progression by subject
 * - Gaming dashboard with stats
 * - Achievements and milestones
 */

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    Clock,
    Award,
    Target,
    BookOpen,
    BarChart3,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Sparkles,
    Trophy,
    Medal,
    Flame,
    Star,
    Filter,
    RefreshCw,
    GraduationCap,
    ArrowLeft
} from "lucide-react"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/models/enums"
import { StudentGamingDashboard } from "@/components/analytics/StudentGamingDashboard"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface WeeklyProgress {
    week: string
    averageScore: number
    examsTaken: number
    trend: 'up' | 'down' | 'stable'
}

interface ProgressionData {
    period: string
    averageScore: number
    examsTaken: number
    conceptsMastered: number
}

export default function StudentProgressionPage() {
    const { data: session } = useSession()
    const [progressionData, setProgressionData] = useState<ProgressionData[]>([])
    const [loading, setLoading] = useState(true)
    const [activeView, setActiveView] = useState<'dashboard' | 'trends' | 'achievements'>('dashboard')

    useEffect(() => {
        if (session?.user?.id) {
            fetchProgressionData()
        }
    }, [session])

    const fetchProgressionData = async () => {
        setLoading(true)
        try {
            // Fetch progression trend from API
            const res = await fetch(`/api/predictions?type=trend&weeks=8`)
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) {
                    setProgressionData(data)
                }
            }
        } catch (error) {
            console.error("Error fetching progression:", error)
        } finally {
            setLoading(false)
        }
    }

    // Calculate stats from progression data
    const avgScore = progressionData.length > 0
        ? Math.round(progressionData.reduce((s, p) => s + p.averageScore, 0) / progressionData.filter(p => p.averageScore > 0).length || 0)
        : 0
    const totalExams = progressionData.reduce((s, p) => s + p.examsTaken, 0)
    const recentTrend = progressionData.length >= 2
        ? progressionData[progressionData.length - 1].averageScore - progressionData[progressionData.length - 2].averageScore
        : 0

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    return (
        <RoleGuard allowedRoles={[UserRole.STUDENT]} fallback={<div className="p-8">Accès refusé.</div>}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/student"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-indigo-500" />
                            Ma Progression
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Suivez votre évolution et identifiez vos axes d'amélioration
                        </p>
                    </div>
                    <button
                        onClick={fetchProgressionData}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <RefreshCw className={cn("w-5 h-5 text-gray-500", loading && "animate-spin")} />
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white"
                    >
                        <div className="flex items-center gap-2 mb-2 text-white/80">
                            <GraduationCap className="w-5 h-5" />
                            <span className="text-sm font-medium">Examens Récents</span>
                        </div>
                        <div className="text-3xl font-bold">{totalExams}</div>
                        <p className="text-xs text-white/60 mt-1">8 dernières semaines</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <Target className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium">Moyenne</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{avgScore}%</div>
                        <p className="text-xs text-gray-400 mt-1">Performance globale</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            {recentTrend > 0 ? (
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : recentTrend < 0 ? (
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            ) : (
                                <Minus className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="text-sm font-medium">Tendance</span>
                        </div>
                        <div className={cn(
                            "text-3xl font-bold",
                            recentTrend > 0 ? "text-green-600" : recentTrend < 0 ? "text-red-600" : "text-gray-600"
                        )}>
                            {recentTrend > 0 ? '+' : ''}{recentTrend}%
                        </div>
                        <p className="text-xs text-gray-400 mt-1">vs semaine précédente</p>
                    </motion.div>
                </div>

                {/* View Tabs */}
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {[
                        { id: 'dashboard', label: 'Dashboard Gaming', icon: Flame },
                        { id: 'trends', label: 'Tendances', icon: TrendingUp },
                        { id: 'achievements', label: 'Réalisations', icon: Trophy }
                    ].map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveView(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors whitespace-nowrap",
                                    activeView === tab.id
                                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeView === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <StudentGamingDashboard studentId={session?.user?.id} />
                        </motion.div>
                    )}

                    {activeView === 'trends' && (
                        <motion.div
                            key="trends"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Weekly Progress Chart */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                                    Progression Hebdomadaire
                                </h3>

                                {progressionData.length === 0 || progressionData.every(p => p.averageScore === 0) ? (
                                    <p className="text-center text-gray-500 py-8">
                                        Pas encore assez de données pour afficher la progression
                                    </p>
                                ) : (
                                    <div className="flex items-end justify-between gap-2 h-48">
                                        {progressionData.map((week, idx) => {
                                            const prevScore = idx > 0 ? progressionData[idx - 1].averageScore : week.averageScore
                                            const trend = week.averageScore > prevScore + 5 ? 'up' :
                                                week.averageScore < prevScore - 5 ? 'down' : 'stable'

                                            return (
                                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                                    {week.averageScore > 0 && (
                                                        <div className="flex items-center gap-1 text-xs">
                                                            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                                                            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                                                            <span className="font-medium">{week.averageScore}%</span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={cn(
                                                            "w-full rounded-t-lg transition-all",
                                                            week.averageScore === 0 ? "bg-gray-200 dark:bg-gray-700" :
                                                                week.averageScore >= 70 ? "bg-green-500" :
                                                                    week.averageScore >= 50 ? "bg-amber-500" : "bg-red-500"
                                                        )}
                                                        style={{ height: `${Math.max(10, week.averageScore)}%` }}
                                                    />
                                                    <span className="text-xs text-gray-500">{week.period}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Activity Summary */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    Résumé par Semaine
                                </h3>
                                <div className="space-y-3">
                                    {progressionData.slice().reverse().map((week, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{week.period}</p>
                                                    <p className="text-xs text-gray-500">{week.examsTaken} examens</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "text-lg font-bold",
                                                week.averageScore >= 70 ? "text-green-600" :
                                                    week.averageScore >= 50 ? "text-amber-600" :
                                                        week.averageScore > 0 ? "text-red-600" : "text-gray-400"
                                            )}>
                                                {week.averageScore > 0 ? `${week.averageScore}%` : '-'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeView === 'achievements' && (
                        <motion.div
                            key="achievements"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Achievements Grid */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Medal className="w-5 h-5 text-amber-500" />
                                    Badges & Réalisations
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { icon: Trophy, label: "Premier Examen", desc: "Terminé votre premier examen", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", unlocked: totalExams >= 1 },
                                        { icon: Flame, label: "Série de 3 jours", desc: "3 jours consécutifs d'activité", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30", unlocked: false },
                                        { icon: Star, label: "Score Parfait", desc: "100% sur un examen", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30", unlocked: false },
                                        { icon: Target, label: "Objectif Atteint", desc: "Moyenne supérieure à 70%", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30", unlocked: avgScore >= 70 },
                                        { icon: Award, label: "Persévérant", desc: "10 examens complétés", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", unlocked: totalExams >= 10 },
                                        { icon: TrendingUp, label: "En Progression", desc: "Amélioration de 10%", color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30", unlocked: recentTrend >= 10 },
                                        { icon: BookOpen, label: "Studieux", desc: "5 matières explorées", color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", unlocked: false },
                                        { icon: Clock, label: "Régulier", desc: "Activité chaque semaine", color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/30", unlocked: false }
                                    ].map((achievement, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex flex-col items-center p-4 rounded-xl text-center transition-all",
                                                achievement.unlocked
                                                    ? "bg-gray-50 dark:bg-gray-750"
                                                    : "bg-gray-100 dark:bg-gray-700 opacity-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-xl mb-3",
                                                achievement.unlocked ? achievement.bg : "bg-gray-200 dark:bg-gray-600"
                                            )}>
                                                <achievement.icon className={cn(
                                                    "w-6 h-6",
                                                    achievement.unlocked ? achievement.color : "text-gray-400"
                                                )} />
                                            </div>
                                            <span className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                                                {achievement.label}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {achievement.desc}
                                            </span>
                                            {achievement.unlocked && (
                                                <span className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Débloqué
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </RoleGuard>
    )
}
