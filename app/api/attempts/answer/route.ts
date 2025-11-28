import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Attempt from "@/models/Attempt"
import Option from "@/models/Option"
import Response from "@/models/Response"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { attemptId, questionId, selectedOptionId } = await req.json()

        const attempt = await Attempt.findById(attemptId)

        if (!attempt || attempt.userId.toString() !== session.user.id) {
            return NextResponse.json({ message: "Invalid attempt" }, { status: 403 })
        }

        if (attempt.status === "COMPLETED") {
            return NextResponse.json({ message: "Attempt already completed" }, { status: 400 })
        }

        // Check if the selected option is correct
        const option = await Option.findById(selectedOptionId)

        const isCorrect = option?.isCorrect || false

        console.log(`[ANSWER] Question: ${questionId}, Option: ${selectedOptionId}, isCorrect: ${isCorrect}`)

        // Find existing response for this question in this attempt
        const existingResponse = await Response.findOne({
            attemptId,
            questionId,
        })

        // Update existing response or create new one
        if (existingResponse) {
            await Response.findByIdAndUpdate(existingResponse._id, {
                selectedOptionId,
                isCorrect
            })
            console.log(`[ANSWER] Updated existing response: ${existingResponse._id}`)
        } else {
            const newResponse = await Response.create({
                attemptId,
                questionId,
                selectedOptionId,
                isCorrect,
            })
            console.log(`[ANSWER] Created new response: ${newResponse._id}`)
        }

        return NextResponse.json({ message: "Saved" })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
