import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { ClassService } from "@/lib/services/ClassService"
import { UserRole } from "@/models/enums"
import mongoose from "mongoose"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Validate ID
        if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid class ID" }, { status: 400 })
        }

        await connectDB()
        const classData = await ClassService.getClassById(id)

        if (!classData) {
            return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 })
        }

        // Access control
        if (session.user.role === UserRole.TEACHER && classData.mainTeacher._id.toString() !== session.user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
        }

        // Calculate stats (Mock logic for now, replace with real aggregation later)
        const stats = {
            totalStudents: classData.students.length,
            averageScore: 14.5, // Mock
            attendanceRate: 92, // Mock
            examsCount: 5, // Mock
            recentActivities: [
                { type: 'exam', name: 'Math Test 1', date: new Date() },
                { type: 'assignment', name: 'Physics Homework', date: new Date() }
            ]
        }

        return NextResponse.json({ success: true, data: stats })

    } catch (error: any) {
        console.error("Get Class Stats Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
