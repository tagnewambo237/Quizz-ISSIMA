"use client"

import { StudentGamingDashboard } from "@/components/analytics/StudentGamingDashboard"
import { useSession } from "next-auth/react"

interface StudentAnalyticsSectionProps {
    classId?: string
}

export function StudentAnalyticsSection({ classId }: StudentAnalyticsSectionProps) {
    const { data: session } = useSession()

    if (!session?.user?.id) {
        return null
    }

    return (
        <StudentGamingDashboard
            studentId={session.user.id}
            classId={classId}
        />
    )
}
