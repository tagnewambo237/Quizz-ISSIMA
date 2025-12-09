"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
    Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus,
    Users, School, Globe, Star, Loader2, ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"

type LeaderboardType = 'CLASS' | 'SCHOOL' | 'NATIONAL'

interface LeaderboardEntry {
    rank: number
    studentId: string
    studentName: string
    avatarInitial: string
    score: number
    trend: 'UP' | 'DOWN' | 'STABLE' | 'NEW'
    level?: number
    isCurrentUser?: boolean
}

interface LeaderboardData {
    type: LeaderboardType
    scope: {
        className?: string
        schoolName?: string
        levelName?: string
    }
    entries: LeaderboardEntry[]
    totalParticipants: number
    currentUserPosition?: {
        rank: number
        percentile: number
    }
}

export default function StudentLeaderboardPage() {
    const { data: session } = useSession()
    const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('CLASS')
    const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [myRankings, setMyRankings] = useState<any>(null)

    useEffect(() => {
        if (session?.user?.id) {
            fetchLeaderboard()
            fetchMyRankings()
        }
    }, [session, leaderboardType])

    const fetchLeaderboard = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/student/leaderboard?type=${leaderboardType}`)
            const data = await res.json()
            if (data.success) {
                setLeaderboard(data.leaderboard)
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchMyRankings = async () => {
        try {
            const res = await fetch('/api/student/rankings')
            const data = await res.json()
            if (data.success) {
                setMyRankings(data.rankings)
            }
        } catch (error) {
            console.error('Error fetching rankings:', error)
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'UP': return <TrendingUp className="h-4 w-4 text-green-500" />
            case 'DOWN': return <TrendingDown className="h-4 w-4 text-red-500" />
            case 'NEW': return <Star className="h-4 w-4 text-yellow-500" />
            default: return <Minus className="h-4 w-4 text-gray-400" />
        }
    }

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
        if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
        return <span className="text-lg font-bold text-gray-500 dark:text-gray-400">{rank}</span>
    }

    const tabs = [
        { type: 'CLASS' as LeaderboardType, label: 'Ma Classe', icon: Users },
        { type: 'SCHOOL' as LeaderboardType, label: 'Mon École', icon: School },
        { type: 'NATIONAL' as LeaderboardType, label: 'National', icon: Globe }
    ]

    return (
        <div className="space-y-8 pb-10 max-w-4xl mx-auto">
            {/* Header with My Stats */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Trophy className="h-8 w-8" />
                        Classements
                    </h1>
                    <p className="text-white/80 mb-6">
                        Comparez-vous aux autres apprenants
                    </p>

                    {/* My Rankings Summary */}
                    {myRankings && (
                        <div className="grid grid-cols-3 gap-4">
                            {myRankings.class && (
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                    <Users className="h-5 w-5 mx-auto mb-1 text-white/80" />
                                    <div className="text-2xl font-bold">#{myRankings.class.rank}</div>
                                    <div className="text-xs text-white/60">
                                        sur {myRankings.class.totalStudents} ({myRankings.class.percentile}%)
                                    </div>
                                    <div className="text-[10px] text-white/50 mt-1">{myRankings.class.className}</div>
                                </div>
                            )}
                            {myRankings.school && (
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                    <School className="h-5 w-5 mx-auto mb-1 text-white/80" />
                                    <div className="text-2xl font-bold">#{myRankings.school.rank}</div>
                                    <div className="text-xs text-white/60">
                                        sur {myRankings.school.totalStudents} ({myRankings.school.percentile}%)
                                    </div>
                                    <div className="text-[10px] text-white/50 mt-1">{myRankings.school.schoolName}</div>
                                </div>
                            )}
                            {myRankings.national && (
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                                    <Globe className="h-5 w-5 mx-auto mb-1 text-white/80" />
                                    <div className="text-2xl font-bold">#{myRankings.national.rank}</div>
                                    <div className="text-xs text-white/60">
                                        sur {myRankings.national.totalStudents} ({myRankings.national.percentile}%)
                                    </div>
                                    <div className="text-[10px] text-white/50 mt-1">Niveau national</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.type}
                            onClick={() => setLeaderboardType(tab.type)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
                                leaderboardType === tab.type
                                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Leaderboard */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : leaderboard && leaderboard.entries.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Scope Info */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {leaderboard.scope.className || leaderboard.scope.schoolName || leaderboard.scope.levelName}
                            <span className="ml-2 text-gray-400">
                                • {leaderboard.totalParticipants} participants
                            </span>
                        </p>
                    </div>

                    {/* Entries */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {leaderboard.entries.map((entry, index) => (
                            <motion.div
                                key={entry.studentId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 transition-colors",
                                    entry.isCurrentUser
                                        ? "bg-primary/5 dark:bg-primary/10"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                )}
                            >
                                {/* Rank */}
                                <div className="w-10 h-10 flex items-center justify-center">
                                    {getRankBadge(entry.rank)}
                                </div>

                                {/* Avatar */}
                                <div className={cn(
                                    "h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold",
                                    entry.isCurrentUser
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                )}>
                                    {entry.avatarInitial}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "font-semibold truncate",
                                        entry.isCurrentUser
                                            ? "text-primary"
                                            : "text-gray-900 dark:text-white"
                                    )}>
                                        {entry.studentName}
                                        {entry.isCurrentUser && (
                                            <span className="ml-2 text-xs font-normal text-primary/60">(Vous)</span>
                                        )}
                                    </p>
                                    {entry.level && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Niveau {entry.level}
                                        </p>
                                    )}
                                </div>

                                {/* Trend */}
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(entry.trend)}
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {Math.round(entry.score).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">XP</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Current User Position if not in top */}
                    {leaderboard.currentUserPosition &&
                        !leaderboard.entries.find(e => e.isCurrentUser) && (
                            <div className="px-6 py-4 bg-primary/5 border-t-4 border-primary">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Votre position
                                    </span>
                                    <span className="font-bold text-primary">
                                        #{leaderboard.currentUserPosition.rank}
                                        <span className="text-sm font-normal ml-2">
                                            (Top {leaderboard.currentUserPosition.percentile}%)
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Aucun classement disponible
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Complétez des examens pour apparaître dans les classements.
                    </p>
                </div>
            )}
        </div>
    )
}
