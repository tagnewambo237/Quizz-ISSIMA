import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Attempt from "@/models/Attempt"
import Response from "@/models/Response"
import Question from "@/models/Question"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { attemptId } = await req.json()

        const attempt = await Attempt.findById(attemptId)

        if (!attempt || attempt.userId.toString() !== session.user.id) {
            return NextResponse.json({ message: "Invalid attempt" }, { status: 403 })
        }

        if (attempt.status === "COMPLETED") {
            return NextResponse.json({ message: "Already completed" })
        }

        // Get all responses for this attempt
        const responses = await Response.find({ attemptId }).lean()

        // Calculate score
        let score = 0
        console.log(`[SUBMIT] Calculating score for attempt ${attemptId}`)
        console.log(`[SUBMIT] Total responses: ${responses.length}`)

        for (const response of responses) {
            const question = await Question.findById(response.questionId)
            if (question) {
                console.log(`[SUBMIT] Response ${response._id}: isCorrect=${response.isCorrect}, points=${question.points}`)
                if (response.isCorrect) {
                    score += question.points
                }
            }
        }

        console.log(`[SUBMIT] Final score: ${score}`)

        await Attempt.findByIdAndUpdate(attemptId, {
            status: "COMPLETED",
            submittedAt: new Date(),
            score,
        })

        return NextResponse.json({ message: "Submitted", score })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
