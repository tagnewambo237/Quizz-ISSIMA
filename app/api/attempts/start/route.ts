import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Attempt from "@/models/Attempt"
import LateCode from "@/models/LateCode"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addMinutes } from "date-fns"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { examId, lateCode } = await req.json()

        const exam = await Exam.findById(examId)

        if (!exam) {
            return NextResponse.json({ message: "Exam not found" }, { status: 404 })
        }

        // Check for existing attempt
        const existingAttempt = await Attempt.findOne({
            examId,
            userId: session.user.id,
        })

        if (existingAttempt) {
            return NextResponse.json({ attemptId: existingAttempt._id.toString(), message: "Resuming attempt" })
        }

        const now = new Date()
        const isStarted = exam.startTime <= now
        const isEnded = exam.endTime <= now

        // Teachers can preview exams regardless of date restrictions
        const isTeacher = session.user.role === "TEACHER"

        if (!isTeacher) {
            // Only enforce date restrictions for students
            if (!isStarted) {
                return NextResponse.json({ message: "Exam has not started yet" }, { status: 403 })
            }

            if (isEnded) {
                if (exam.closeMode === "STRICT") {
                    return NextResponse.json({ message: "Exam is closed" }, { status: 403 })
                }

                if (!lateCode) {
                    return NextResponse.json({ message: "Late code required" }, { status: 403 })
                }

                // Validate late code
                const codeRecord = await LateCode.findOne({ code: lateCode })

                if (!codeRecord || codeRecord.examId.toString() !== examId || codeRecord.usagesRemaining <= 0) {
                    return NextResponse.json({ message: "Invalid or expired late code" }, { status: 403 })
                }

                // Decrement usage
                await LateCode.findByIdAndUpdate(codeRecord._id, {
                    $inc: { usagesRemaining: -1 }
                })
            }
        }

        // Create attempt
        const resumeToken = randomBytes(16).toString("hex")
        const expiresAt = addMinutes(now, exam.duration)

        const attempt = await Attempt.create({
            examId,
            userId: session.user.id,
            expiresAt,
            resumeToken,
        })

        return NextResponse.json({ attemptId: attempt._id.toString(), resumeToken }, { status: 201 })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
