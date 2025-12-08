"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserRole } from "@/models/enums"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { motion } from "framer-motion"
import {
    TrendingUp, Users, BookOpen, Award, Zap, Target,
    Sparkles, Trophy, Star, Flame, BarChart3,
    MoreHorizontal, ChevronRight, CheckCircle2,
    Calendar, Lightbulb, GraduationCap, ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { TeacherAnalyticsDashboard } from "@/components/analytics/TeacherAnalyticsDashboard"
import { cn } from "@/lib/utils"

export default function TeacherDashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
            return
        }

        if (status === "authenticated" && session?.user?.role === UserRole.TEACHER) {
            fetchStats()
        }
    }, [status, session, router])

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/profiles/stats")
            const data = await res.json()
            if (data.success) {
                setStats(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error)
        } finally {
            setLoading(false)
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="h-8 w-8 rounded-full border-2 border-[#3a4794] border-t-transparent animate-spin"></div>
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    // Gaming & Stats Data from API
    const game = stats?.gamification || { level: 1, xp: 0, nextLevelXp: 500, title: "Débutant" }
    const basic = stats?.basic || { totalExamsCreated: 0, totalStudentsReached: 0, averageStudentScore: 0, activeExams: 0 }

    // Calculate progress
    const progressPercent = Math.min((game.xp / game.nextLevelXp) * 100, 100)

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]} fallback={<div className="p-8">Accès refusé.</div>}>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
            >
                {/* 1. HERO & GAMIFICATION SECTION */}
                <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Welcome Card */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#3a4794] to-[#2a3575] text-white shadow-xl p-8 md:p-10 flex flex-col justify-between min-h-[300px]">
                        {/* Abstract Background */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#359a53]/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-[#359a53]" />
                                    <span>Espace Enseignant Innovant</span>
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                                Bonjour, {session?.user?.name?.split(' ')[0] || "Professeur"}
                            </h1>
                            <p className="text-blue-100 max-w-lg text-lg leading-relaxed">
                                Votre impact grandit chaque jour. Continuez à inspirer vos étudiants et à suivre leur évolution.
                            </p>
                        </div>

                        {/* Gaming Stats Row */}
                        <div className="relative z-10 mt-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#359a53] to-green-600 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                                    <Trophy className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-200 uppercase tracking-widest font-bold">Niveau {game.level}</p>
                                    <h3 className="text-xl font-bold text-white">{game.title}</h3>
                                </div>
                            </div>

                            <div className="h-px w-full md:w-px md:h-12 bg-white/20" />

                            <div className="flex-1 w-full">
                                <div className="flex justify-between text-xs font-medium text-blue-200 mb-2">
                                    <span>Progression XP</span>
                                    <span>{game.xp.toLocaleString()} / {game.nextLevelXp.toLocaleString()} XP</span>
                                </div>
                                <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-[#359a53] to-green-400 rounded-full shadow-[0_0_10px_rgba(53,154,83,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid - Premium Design */}
                    <div className="lg:col-span-1 grid grid-cols-2 gap-3">
                        {[
                            {
                                href: "/teacher/exams/create",
                                icon: BookOpen,
                                label: "Créer Examen",
                                color: "from-[#3a4794] to-indigo-600",
                                iconBg: "bg-white/20",
                                textColor: "text-white"
                            },
                            {
                                href: "/teacher/classes",
                                icon: Users,
                                label: "Mes Classes",
                                color: "from-[#359a53] to-emerald-600",
                                iconBg: "bg-white/20",
                                textColor: "text-white"
                            },
                            {
                                href: "/teacher/syllabus",
                                icon: Target,
                                label: "Programme",
                                color: "from-purple-500 to-purple-700",
                                iconBg: "bg-white/20",
                                textColor: "text-white"
                            },
                            {
                                href: "/teacher/exams",
                                icon: BarChart3,
                                label: "Mes Examens",
                                color: "from-amber-500 to-orange-600",
                                iconBg: "bg-white/20",
                                textColor: "text-white"
                            }
                        ].map((action, idx) => (
                            <Link key={idx} href={action.href}>
                                <motion.div
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "relative overflow-hidden rounded-2xl p-5 h-full min-h-[120px]",
                                        "bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300",
                                        "flex flex-col items-center justify-center text-center gap-3 cursor-pointer",
                                        action.color
                                    )}
                                >
                                    {/* Decorative Elements */}
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                                    <div className={cn("p-3 rounded-xl", action.iconBg)}>
                                        <action.icon className={cn("w-6 h-6", action.textColor)} />
                                    </div>
                                    <span className={cn("font-bold text-sm", action.textColor)}>{action.label}</span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* 2. DYNAMIC STATS GRID */}
                <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Examens Créés",
                            value: basic.totalExamsCreated,
                            icon: GraduationCap,
                            color: "text-[#3a4794]",
                            bg: "bg-[#3a4794]/10",
                            trend: "Total à ce jour",
                            trendColor: "text-gray-500"
                        },
                        {
                            label: "Étudiants Touchés",
                            value: basic.totalStudentsReached,
                            icon: Users,
                            color: "text-[#359a53]",
                            bg: "bg-[#359a53]/10",
                            trend: "Actifs dans vos classes",
                            trendColor: "text-[#359a53]"
                        },
                        {
                            label: "Moyenne Globale",
                            value: `${basic.averageStudentScore}%`,
                            icon: Award,
                            color: "text-purple-600",
                            bg: "bg-purple-100 dark:bg-purple-900/20",
                            trend: `${(basic.averageStudentScore / 5).toFixed(1)}/20`,
                            trendColor: "text-purple-600"
                        },
                        {
                            label: "Examens En Cours",
                            value: basic.activeExams,
                            icon: Calendar,
                            color: "text-orange-600",
                            bg: "bg-orange-100 dark:bg-orange-900/20",
                            trend: "Actuellement publiés",
                            trendColor: "text-orange-600"
                        }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                                </div>
                                {i === 3 && stat.value > 0 && (
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className={cn("text-xs mt-2 font-medium flex items-center gap-1", stat.trendColor)}>
                                    {stat.trend}
                                </p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* 3. ANALYTICS PREVIEW & MAIN CONTENT */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Analytics Dashboard Component Integration */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-6 h-6 text-[#3a4794]" />
                                Analyses & Prédictions
                            </h2>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#359a53]" />
                                Données temps réel
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-2">
                            <TeacherAnalyticsDashboard teacherId={session?.user?.id} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </RoleGuard>
    )
}
