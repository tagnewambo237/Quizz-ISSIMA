import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { ClassService } from "@/lib/services/ClassService"
import { UserRole } from "@/models/enums"
import mongoose from "mongoose"
import Exam from "@/models/Exam"
import Attempt from "@/models/Attempt"

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

        // Get real stats from database
        const studentIds = classData.students.map((s: any) => s._id)
        const totalStudents = studentIds.length

        // Get all exams for this class
        const exams = await Exam.find({ targetClasses: id }).lean()
        const examsCount = exams.length
        const examIds = exams.map((e: any) => e._id)

        // Get all attempts for these exams by students in this class
        const attempts = await Attempt.find({
            examId: { $in: examIds },
            userId: { $in: studentIds },
            status: 'COMPLETED'
        }).lean()

        // Calculate average score
        let averageScore = 0
        if (attempts.length > 0) {
            const totalScore = attempts.reduce((sum: number, att: any) => sum + (att.score || 0), 0)
            averageScore = Math.round((totalScore / attempts.length) * 10) / 10
        }

        // Calculate attendance rate (students who took at least one exam)
        let attendanceRate = 0
        if (totalStudents > 0 && examsCount > 0) {
            const studentsWithAttempts = new Set(attempts.map((a: any) => a.userId.toString()))
            attendanceRate = Math.round((studentsWithAttempts.size / totalStudents) * 100)
        }

        // Build performance history from exam results
        const performanceHistory = await Promise.all(
            exams.slice(-6).map(async (exam: any) => {
                const examAttempts = attempts.filter((a: any) =>
                    a.examId.toString() === exam._id.toString()
                )
                const avgScore = examAttempts.length > 0
                    ? Math.round(examAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / examAttempts.length)
                    : 0

                return {
                    name: exam.title.substring(0, 15) + (exam.title.length > 15 ? '...' : ''),
                    score: avgScore,
                    date: exam.startTime
                }
            })
        )

        // Sort by date
        performanceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const stats = {
            totalStudents,
            averageScore,
            attendanceRate,
            examsCount,
            performanceHistory
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
