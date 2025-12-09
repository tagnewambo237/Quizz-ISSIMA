"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
    Flame, Trophy, Clock, Star, CheckCircle, Target, Zap,
    Loader2, Gift, Medal, Calendar, Users, School, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Challenge {
    id: string
    title: string
    description: string
    type: 'DAILY' | 'WEEKLY' | 'SUBJECT' | 'CLASS' | 'SCHOOL' | 'SPECIAL'
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED'
    startDate: string
    endDate: string
    goals: {
        type: string
        target: number
        description: string
    }[]
    rewards: {
        xpBonus: number
        badgeName?: string
        specialReward?: string
    }
    progress?: {
        progress: {
            goalIndex: number
            current: number
            target: number
            completed: boolean
        }[]
        overallProgress: number
        completed: boolean
    }
    participantsCount: number
    completedCount: number
}

interface GamificationStats {
    totalXP: number
    level: number
    currentLevelProgress: number
    streak: {
        current: number
        longest: number
    }
    badges: {
        total: number
        recent: any[]
    }
}

export default function StudentChallengesPage() {
    const { data: session } = useSession()
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [stats, setStats] = useState<GamificationStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')

    useEffect(() => {
        if (session?.user?.id) {
            fetchData()
        }
    }, [session])

    const fetchData = async () => {
        try {
            const [challengesRes, statsRes] = await Promise.all([
                fetch('/api/student/challenges'),
                fetch('/api/student/gamification')
            ])

            const challengesData = await challengesRes.json()
            const statsData = await statsRes.json()

            if (challengesData.success) {
                setChallenges(challengesData.challenges || [])
            }
            if (statsData.success) {
                setStats(statsData.stats)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const joinChallenge = async (challengeId: string) => {
        try {
            await fetch(`/api/student/challenges/${challengeId}/join`, {
                method: 'POST'
            })
            fetchData()
        } catch (error) {
            console.error('Error joining challenge:', error)
        }
    }

    const getChallengeIcon = (type: string) => {
        switch (type) {
            case 'DAILY': return <Flame className="h-5 w-5" />
            case 'WEEKLY': return <Calendar className="h-5 w-5" />
            case 'CLASS': return <Users className="h-5 w-5" />
            case 'SCHOOL': return <School className="h-5 w-5" />
            case 'SPECIAL': return <Star className="h-5 w-5" />
            default: return <Target className="h-5 w-5" />
        }
    }

    const getChallengeColor = (type: string) => {
        switch (type) {
            case 'DAILY': return 'from-orange-500 to-red-500'
            case 'WEEKLY': return 'from-blue-500 to-indigo-500'
            case 'CLASS': return 'from-green-500 to-emerald-500'
            case 'SCHOOL': return 'from-purple-500 to-violet-500'
            case 'SPECIAL': return 'from-yellow-500 to-amber-500'
            default: return 'from-gray-500 to-slate-500'
        }
    }

    const getTimeRemaining = (endDate: string) => {
        const end = new Date(endDate)
        const now = new Date()
        const diff = end.getTime() - now.getTime()

        if (diff <= 0) return 'Terminé'

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        if (days > 0) return `${days}j ${hours}h restant`
        return `${hours}h restant`
    }

    const activeChallenges = challenges.filter(c => c.status === 'ACTIVE')
    const completedChallenges = challenges.filter(c => c.status === 'COMPLETED' || c.progress?.completed)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto">
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-primary via-secondary to-primary rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Flame className="h-8 w-8" />
                        Défis & Récompenses
                    </h1>
                    <p className="text-white/80 mb-6">
                        Relevez des défis, gagnez des XP et débloquez des badges !
                    </p>

                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-300" />
                                <div className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</div>
                                <div className="text-xs text-white/60">XP Total</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                <Star className="h-6 w-6 mx-auto mb-1 text-yellow-300" />
                                <div className="text-2xl font-bold">Niv. {stats.level}</div>
                                <div className="text-xs text-white/60">{stats.currentLevelProgress}% prochain</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                <Flame className="h-6 w-6 mx-auto mb-1 text-orange-400" />
                                <div className="text-2xl font-bold">{stats.streak.current}🔥</div>
                                <div className="text-xs text-white/60">Streak actuel</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                <Medal className="h-6 w-6 mx-auto mb-1 text-amber-300" />
                                <div className="text-2xl font-bold">{stats.badges.total}</div>
                                <div className="text-xs text-white/60">Badges</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                <button
                    onClick={() => setActiveTab('active')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                        activeTab === 'active'
                            ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                            : "text-gray-500 dark:text-gray-400"
                    )}
                >
                    <Target className="h-4 w-4" />
                    Défis Actifs ({activeChallenges.length})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                        activeTab === 'completed'
                            ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                            : "text-gray-500 dark:text-gray-400"
                    )}
                >
                    <CheckCircle className="h-4 w-4" />
                    Complétés ({completedChallenges.length})
                </button>
            </div>

            {/* Challenges List */}
            {activeTab === 'active' && (
                <div className="space-y-4">
                    {activeChallenges.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <Flame className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Aucun défi actif
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                De nouveaux défis seront bientôt disponibles !
                            </p>
                        </div>
                    ) : (
                        activeChallenges.map((challenge, index) => (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border-2 border-gray-100 dark:border-gray-700"
                            >
                                {/* Header */}
                                <div className={cn(
                                    "p-4 bg-gradient-to-r text-white",
                                    getChallengeColor(challenge.type)
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getChallengeIcon(challenge.type)}
                                            <div>
                                                <h3 className="font-bold text-lg">{challenge.title}</h3>
                                                <p className="text-sm text-white/80">{challenge.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Clock className="h-4 w-4" />
                                                {getTimeRemaining(challenge.endDate)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress & Goals */}
                                <div className="p-6">
                                    {challenge.progress ? (
                                        <>
                                            {/* Overall Progress */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Progression
                                                    </span>
                                                    <span className="text-sm font-bold text-primary">
                                                        {Math.round(challenge.progress.overallProgress)}%
                                                    </span>
                                                </div>
                                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-primary to-secondary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${challenge.progress.overallProgress}%` }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Individual Goals */}
                                            <div className="space-y-2">
                                                {challenge.goals.map((goal, idx) => {
                                                    const progress = challenge.progress?.progress.find(p => p.goalIndex === idx)
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-xl",
                                                                progress?.completed
                                                                    ? "bg-green-50 dark:bg-green-900/10"
                                                                    : "bg-gray-50 dark:bg-gray-700/50"
                                                            )}
                                                        >
                                                            {progress?.completed ? (
                                                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                                            ) : (
                                                                <Target className="h-5 w-5 text-gray-400 shrink-0" />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    {goal.description}
                                                                </p>
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                                                {progress?.current || 0}/{goal.target}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => joinChallenge(challenge.id)}
                                            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                                        >
                                            Participer au défi
                                        </button>
                                    )}

                                    {/* Rewards */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Zap className="h-4 w-4 text-yellow-500" />
                                                <span className="font-bold text-yellow-600">+{challenge.rewards.xpBonus} XP</span>
                                            </div>
                                            {challenge.rewards.badgeName && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Gift className="h-4 w-4 text-purple-500" />
                                                    <span className="font-medium text-purple-600">{challenge.rewards.badgeName}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {challenge.participantsCount} participants • {challenge.completedCount} réussis
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'completed' && (
                <div className="space-y-4">
                    {completedChallenges.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Aucun défi complété
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Complétez des défis pour gagner des récompenses !
                            </p>
                        </div>
                    ) : (
                        completedChallenges.map((challenge, index) => (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-green-100 dark:border-green-900/30"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-r text-white",
                                        getChallengeColor(challenge.type)
                                    )}>
                                        {getChallengeIcon(challenge.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {challenge.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {challenge.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                        <Zap className="h-4 w-4 text-yellow-500" />
                                        <span className="font-bold text-yellow-600">+{challenge.rewards.xpBonus}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
