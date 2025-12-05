import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import LearnerProfile from "@/models/LearnerProfile"

/**
 * API pour récupérer les notifications de l'utilisateur
 * Basé sur les événements du système (XP, Badges, Level Up, etc.)
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        // Récupérer le profil de l'utilisateur pour les notifications gamification
        const profile = await LearnerProfile.findOne({ user: session.user.id })
            .select('gamification')
            .lean()

        const notifications: any[] = []

        // Notifications de badges récents (derniers 7 jours)
        if (profile?.gamification?.badges) {
            const recentBadges = profile.gamification.badges
                .filter((badge: any) => {
                    const earnedDate = new Date(badge.earnedAt)
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    return earnedDate > weekAgo
                })
                .map((badge: any) => ({
                    id: `badge-${badge.id}`,
                    type: 'badge',
                    title: 'Nouveau Badge!',
                    message: `Badge "${badge.name}" débloqué`,
                    timestamp: badge.earnedAt,
                    read: false,
                    data: badge
                }))

            notifications.push(...recentBadges)
        }

        // Notification de niveau actuel
        if (profile?.gamification?.level) {
            const currentLevel = profile.gamification.level
            const currentXP = profile.gamification.xp
            const nextLevelXP = Math.pow(currentLevel, 2) * 100

            notifications.push({
                id: `level-${currentLevel}`,
                type: 'level_up',
                title: `Niveau ${currentLevel}`,
                message: `${currentXP} / ${nextLevelXP} XP vers le niveau ${currentLevel + 1}`,
                timestamp: new Date(),
                read: true,
                data: {
                    currentLevel,
                    currentXP,
                    nextLevelXP
                }
            })
        }

        // Trier par date (plus récent en premier)
        notifications.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount: notifications.filter(n => !n.read).length
        })

    } catch (error: any) {
        console.error("Notifications Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

/**
 * Marquer une notification comme lue
 */
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { notificationId } = await req.json()

        // Dans une vraie implémentation, vous stockeriez l'état de lecture
        // dans une collection séparée ou dans le profil utilisateur

        return NextResponse.json({
            success: true,
            message: "Notification marked as read"
        })

    } catch (error: any) {
        console.error("Mark Read Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
