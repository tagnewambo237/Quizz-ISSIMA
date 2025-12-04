"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserRole } from "@/models/enums"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { StatsOverview } from "@/components/dashboard/teacher/StatsOverview"
import { QuickActions } from "@/components/dashboard/teacher/QuickActions"
import { RecentActivity } from "@/components/dashboard/teacher/RecentActivity"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export default function TeacherDashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [recentActivities, setRecentActivities] = useState<any[]>([])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
            return
        }

        if (status === "authenticated" && session?.user?.role === UserRole.TEACHER) {
            fetchStats()
            fetchActivities()
        }
    }, [status, session, router])

    const fetchActivities = async () => {
        try {
            const res = await fetch("/api/profiles/activities")
            const data = await res.json()
            if (data.success) {
                setRecentActivities(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch activities:", error)
        }
    }

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
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                </div>
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-[120px]" />
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Skeleton className="col-span-4 h-[400px]" />
                        <Skeleton className="col-span-3 h-[400px]" />
                    </div>
                </div>
            </div>
        )
    }

    // Transformer les données de l'API pour le composant StatsOverview
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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]} fallback={<div className="p-8">Accès refusé. Réservé aux enseignants.</div>}>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex-1 space-y-8 p-8 pt-6 bg-gray-50/30 dark:bg-gray-950/30 min-h-screen"
            >
                {/* Premium Hero Section with Animated Gradient */}
                <motion.div variants={item} className="relative overflow-hidden rounded-[2rem] p-10 shadow-2xl">
                    {/* Animated Background Mesh - Brand Colors */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3a4794] to-[#2a3575]"></div>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>

                    {/* Subtle accents */}
                    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#359a53]/20 blur-3xl mix-blend-screen animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#4a5db0]/30 blur-3xl mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md mb-2">
                                <span className="mr-2 h-2 w-2 rounded-full bg-[#359a53] animate-pulse"></span>
                                Espace Enseignant
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                                Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">{session?.user?.name || "Professeur"}</span>
                            </h2>
                            <p className="text-blue-100/90 max-w-xl text-lg font-light leading-relaxed">
                                Prêt à inspirer vos étudiants aujourd'hui ? Vos outils pédagogiques sont prêts.
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                                <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">Aujourd'hui</p>
                                <p className="text-3xl font-semibold text-white">
                                    {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item}>
                    <StatsOverview stats={dashboardStats} />
                </motion.div>

                <div className="grid gap-8 md:grid-cols-12">
                    <motion.div variants={item} className="md:col-span-8 space-y-8">
                        <RecentActivity activities={recentActivities} />
                    </motion.div>
                    <motion.div variants={item} className="md:col-span-4 space-y-8">
                        <QuickActions />
                    </motion.div>
                </div>
            </motion.div>
        </RoleGuard>
    )
}
