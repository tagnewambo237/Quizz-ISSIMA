import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import Option from "@/models/Option"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { id } = await params

        // Fetch the original exam
        const originalExam = await Exam.findById(id)

        if (!originalExam) {
            return NextResponse.json({ message: "Exam not found" }, { status: 404 })
        }

        // Verify ownership
        if (originalExam.createdById.toString() !== session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        // Fetch questions and options
        const questions = await Question.find({ examId: id })

        // Create the duplicate exam
        const duplicatedExam = await Exam.create({
            title: `${originalExam.title} (Copy)`,
            description: originalExam.description,
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
            duration: originalExam.duration,
            closeMode: originalExam.closeMode,
            createdById: session.user.id,
        })

        // Duplicate questions with options
        for (const question of questions) {
            const options = await Option.find({ questionId: question._id })

            const newQuestion = await Question.create({
                examId: duplicatedExam._id,
                text: question.text,
                imageUrl: question.imageUrl,
                points: question.points,
            })

            await Option.insertMany(
                options.map((option) => ({
                    questionId: newQuestion._id,
                    text: option.text,
                    isCorrect: option.isCorrect,
                }))
            )
        }

        return NextResponse.json({
            message: "Exam duplicated successfully",
            examId: duplicatedExam._id.toString()
        }, { status: 201 })
    } catch (error: any) {
        console.error("Error duplicating exam:", error)
        return NextResponse.json(
            { message: error.message || "Failed to duplicate exam" },
            { status: 500 }
        )
    }
}
