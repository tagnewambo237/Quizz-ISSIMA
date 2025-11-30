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

    // Simuler des activités récentes (à remplacer par une vraie API)
    const recentActivities = [
        {
            id: "1",
            type: "EXAM_CREATED" as const,
            title: "Nouvel examen créé",
            description: "Mathématiques - Terminale C",
            timestamp: new Date(),
            user: { name: session?.user?.name || "Moi" }
        }
    ]

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]} fallback={<div className="p-8">Accès refusé. Réservé aux enseignants.</div>}>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord</h2>
                </div>

                <StatsOverview stats={dashboardStats} />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4">
                        <RecentActivity activities={recentActivities} />
                    </div>
                    <div className="col-span-3">
                        <QuickActions />
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
}
