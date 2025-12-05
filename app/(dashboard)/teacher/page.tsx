"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserRole } from "@/models/enums"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { motion } from "framer-motion"
import {
    TrendingUp, Users, BookOpen, Award, Zap, Target,
    ArrowUpRight, Sparkles, Trophy, Star, Flame, Calendar,
    MoreHorizontal, ChevronRight, Bell, CheckCircle2
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"

// Mock data
const performanceData = [
    { name: 'Lun', students: 45, exams: 12 },
    { name: 'Mar', students: 52, exams: 15 },
    { name: 'Mer', students: 48, exams: 10 },
    { name: 'Jeu', students: 61, exams: 18 },
    { name: 'Ven', students: 55, exams: 14 },
    { name: 'Sam', students: 38, exams: 8 },
    { name: 'Dim', students: 42, exams: 9 },
]

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

    const dashboardStats = stats ? {
        totalExamsCreated: stats.teaching?.totalExamsCreated || 0,
        totalStudentsReached: stats.teaching?.totalStudentsReached || 0,
        averageClassScore: stats.teaching?.averageClassScore || 0,
        activeExams: stats.teaching?.activeExams || 0
    } : {
        totalExamsCreated: 0,
        totalStudentsReached: 0,
        averageClassScore: 0,
        activeExams: 0
    }

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="h-8 w-8 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    }

    const item = {
        hidden: { y: 10, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]} fallback={<div className="p-8">Accès refusé.</div>}>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"
            >
                {/* 1. HEADER CARD - Gaming & Info (Blue Card Style) */}
                <motion.div
                    variants={item}
                    className="relative overflow-hidden rounded-[2.5rem] bg-[#3a4794] text-white shadow-xl min-h-[280px] flex flex-col justify-between p-8 md:p-10"
                >
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#359a53]/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium mb-4">
                            <span className="w-2 h-2 rounded-full bg-[#359a53] animate-pulse"></span>
                            Espace Enseignant
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                            Bonjour, {session?.user?.name?.split(' ')[0] || "Professeur"}
                        </h1>
                        <p className="text-blue-100 max-w-xl text-lg font-light">
                            Prêt à inspirer vos étudiants aujourd'hui ? Vos outils pédagogiques sont prêts.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-6 mt-8">
                        {/* Gaming Stats Integrated */}
                        <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full md:w-auto">
                            <div className="flex flex-col">
                                <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Niveau Actuel</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">15</span>
                                    <span className="text-sm text-blue-200">Mentor Expert</span>
                                </div>
                            </div>
                            <div className="h-10 w-[1px] bg-white/20"></div>
                            <div className="flex flex-col flex-1 min-w-[150px]">
                                <div className="flex justify-between text-xs text-blue-200 mb-1">
                                    <span>XP Progression</span>
                                    <span>2,450 / 3,000</span>
                                </div>
                                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#359a53] w-[82%] rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right hidden md:block">
                            <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">AUJOURD'HUI</p>
                            <p className="text-3xl font-bold">
                                {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. STATS GRID (Clean White Cards) */}
                <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Examens Créés",
                            value: dashboardStats.totalExamsCreated,
                            sub: "+2 depuis le mois dernier",
                            icon: BookOpen,
                            color: "text-blue-600",
                            bg: "bg-blue-50"
                        },
                        {
                            label: "Étudiants Touchés",
                            value: dashboardStats.totalStudentsReached,
                            sub: "+12% depuis le mois dernier",
                            icon: Users,
                            color: "text-green-600",
                            bg: "bg-green-50"
                        },
                        {
                            label: "Moyenne de Classe",
                            value: `${dashboardStats.averageClassScore.toFixed(0)}/20`,
                            sub: "+0.5 vs moyenne générale",
                            icon: Award,
                            color: "text-purple-600",
                            bg: "bg-purple-50"
                        },
                        {
                            label: "Examens Actifs",
                            value: dashboardStats.activeExams,
                            sub: "En cours actuellement",
                            icon: TrendingUp,
                            color: "text-orange-600",
                            bg: "bg-orange-50"
                        },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[160px]">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                                <p className="text-xs font-medium text-green-600">{stat.sub}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* 3. MAIN CONTENT SPLIT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN (2/3) - Activity & Performance */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Recent Activity List (Clean) */}
                        <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activité Récente</h3>
                                <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Empty State / Placeholder */}
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-12 w-12 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-3">
                                    <Sparkles className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune activité récente à afficher.</p>
                            </div>
                        </motion.div>

                        {/* Performance Chart (Compact) */}
                        <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance</h3>
                                <select className="text-xs border-none bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1 outline-none text-gray-600">
                                    <option>Cette semaine</option>
                                    <option>Ce mois</option>
                                </select>
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={performanceData}>
                                        <defs>
                                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3a4794" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3a4794" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                fontSize: '12px'
                                            }}
                                            cursor={{ stroke: '#3a4794', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Area type="monotone" dataKey="students" stroke="#3a4794" strokeWidth={2} fill="url(#colorStudents)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN (1/3) - Actions & Notifications */}
                    <div className="space-y-6">

                        {/* Quick Actions (Big Buttons) */}
                        <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h3 className="text-lg font-bold text-[#3a4794] mb-4">Actions Rapides</h3>
                            <div className="space-y-3">
                                <Link href="/teacher/exams/create" className="block">
                                    <button className="w-full group relative overflow-hidden rounded-2xl bg-[#3a4794] p-4 text-left transition-all hover:bg-[#2a3575] hover:shadow-lg hover:shadow-blue-900/20">
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-xl bg-white/20 p-2 text-white">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">Créer un Examen</p>
                                                    <p className="text-xs text-blue-200">Nouvelle évaluation</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-white/50 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </button>
                                </Link>

                                <Link href="/teacher/classes" className="block">
                                    <button className="w-full group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl bg-gray-100 p-2 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">Gérer mes Classes</span>
                                        </div>
                                    </button>
                                </Link>

                                <Link href="/teacher/syllabus" className="block">
                                    <button className="w-full group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl bg-gray-100 p-2 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                <Target className="h-5 w-5" />
                                            </div>
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">Programmes</span>
                                        </div>
                                    </button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Recent Notifications (Compact) */}
                        <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
                                <Link href="/teacher/notifications" className="text-xs font-medium text-[#3a4794] hover:underline">Voir tout</Link>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { title: "Nouveau Badge", msg: "Mentor Expert débloqué", time: "5m", icon: Trophy, color: "text-yellow-600 bg-yellow-50" },
                                    { title: "Classe Terminée", msg: "Terminale C2 a fini", time: "1h", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
                                ].map((notif, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className={`p-2 rounded-xl flex-shrink-0 ${notif.color}`}>
                                            <notif.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                                            <p className="text-xs text-gray-500">{notif.msg}</p>
                                        </div>
                                        <span className="ml-auto text-[10px] text-gray-400 font-medium">{notif.time}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </motion.div>
        </RoleGuard>
    )
}
