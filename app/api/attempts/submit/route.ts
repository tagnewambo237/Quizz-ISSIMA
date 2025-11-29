import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Attempt from "@/models/Attempt"
import Response from "@/models/Response"
import Question from "@/models/Question"
import Exam from "@/models/Exam"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { examSubmissionLimiter, getClientIdentifier, createRateLimitResponse } from "@/lib/security/rateLimiter"
import { validateExamSubmission, calculateScore, detectCheatingPatterns } from "@/lib/security/examSecurity"
import { sanitizeObjectId } from "@/lib/security/sanitize"

export async function POST(req: Request) {
    try {
        // Apply rate limiting to prevent spam submissions
        const identifier = getClientIdentifier(req)
        const rateLimitResult = examSubmissionLimiter(identifier)

        if (!rateLimitResult.success) {
            return createRateLimitResponse(rateLimitResult.resetTime)
        }

        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const body = await req.json()

        // Sanitize attemptId to prevent NoSQL injection
        const attemptId = sanitizeObjectId(body.attemptId)
        if (!attemptId) {
            return NextResponse.json({ message: "Invalid attempt ID" }, { status: 400 })
        }

        const attempt = await Attempt.findById(attemptId).lean()

        if (!attempt || attempt.userId.toString() !== session.user.id) {
            return NextResponse.json({ message: "Invalid attempt" }, { status: 403 })
        }

        if (attempt.status === "COMPLETED") {
            return NextResponse.json({ message: "Already completed" }, { status: 400 })
        }

        // Get all responses for this attempt
        const responses = await Response.find({ attemptId }).lean()

        // Get exam questions for validation
        const questions = await Question.find({ examId: attempt.examId }).lean()

        // Validate submission
        const validation = validateExamSubmission(attempt, responses, questions)
        if (!validation.valid) {
            console.error(`[SECURITY] Invalid submission attempt: ${validation.errors.join(', ')}`)
            return NextResponse.json(
                { message: "Invalid submission", errors: validation.errors },
                { status: 400 }
            )
        }

        // Calculate score securely on server side
        const score = calculateScore(responses, questions)

        console.log(`[SUBMIT] Calculating score for attempt ${attemptId}`)
        console.log(`[SUBMIT] Total responses: ${responses.length}`)
        console.log(`[SUBMIT] Final score: ${score}`)

        // Update attempt with final score
        const submittedAt = new Date()
        await Attempt.findByIdAndUpdate(attemptId, {
            status: "COMPLETED",
            submittedAt,
            score,
        })

        // Detect potential cheating patterns
        const cheatingCheck = detectCheatingPatterns(
            { ...attempt, submittedAt, score },
            responses
        )

        if (cheatingCheck.suspicious) {
            console.warn(`[SECURITY] Suspicious activity detected for attempt ${attemptId}: ${cheatingCheck.reasons.join(', ')}`)
            // Log for teacher review but don't block submission
        }

        return NextResponse.json({ message: "Submitted", score })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
