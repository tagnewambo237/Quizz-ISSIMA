import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import Option from "@/models/Option"
import Attempt from "@/models/Attempt"
import Response from "@/models/Response"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { ExamTaker } from "@/components/student/ExamTaker"
import { shuffleQuestionsForUser } from "@/lib/shuffle"
import { HuggingFaceService, type ReformulationIntensity } from "@/lib/services/HuggingFaceService"

export default async function ExamTakePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    await connectDB()

    const { id } = await params

    const examDoc = await Exam.findById(id).lean()

    if (!examDoc) notFound()

    // Fetch questions and options
    const questionsDoc = await Question.find({ examId: id }).lean()
    const questionIds = questionsDoc.map(q => q._id)
    const optionsDoc = await Option.find({ questionId: { $in: questionIds } }).select('-isCorrect').lean()

    // Build base questions array
    let examQuestions = questionsDoc.map(q => ({
        id: q._id.toString(),
        examId: q.examId.toString(),
        text: q.text,
        imageUrl: q.imageUrl,
        points: q.points,
        options: optionsDoc
            .filter(o => o.questionId.toString() === q._id.toString())
            .map(o => ({
                id: o._id.toString(),
                questionId: o.questionId.toString(),
                text: o.text,
                // isCorrect is excluded via .select('-isCorrect')
            }))
    }))

    // Check if AI reformulation is enabled
    const aiReformulation = examDoc.config?.antiCheat?.aiReformulation
    const reformulationIntensity = (examDoc.config?.antiCheat?.reformulationIntensity || 'MODERATE') as ReformulationIntensity

    if (aiReformulation && session.user.id) {
        // Apply AI reformulation to questions and options
        // This creates unique versions for each student
        try {
            const reformulatedQuestions = await Promise.all(
                examQuestions.map(async (q, qIndex) => {
                    const seed = `${session.user.id}-${id}-q${qIndex}`

                    // Reformulate question text
                    const reformulatedText = await HuggingFaceService.reformulateText(
                        q.text,
                        { intensity: reformulationIntensity, language: 'fr' },
                        seed
                    )

                    // Reformulate options
                    const reformulatedOptions = await Promise.all(
                        q.options.map(async (opt, optIndex) => ({
                            ...opt,
                            text: await HuggingFaceService.reformulateText(
                                opt.text,
                                { intensity: reformulationIntensity, language: 'fr' },
                                `${seed}-opt${optIndex}`
                            )
                        }))
                    )

                    return {
                        ...q,
                        text: reformulatedText,
                        options: reformulatedOptions
                    }
                })
            )
            examQuestions = reformulatedQuestions
        } catch (error) {
            console.error('[AI Reformulation] Error:', error)
            // Fall back to original questions if reformulation fails
        }
    }

    const exam = {
        id: examDoc._id.toString(),
        title: examDoc.title,
        description: examDoc.description,
        startTime: examDoc.startTime.toISOString(),
        endTime: examDoc.endTime.toISOString(),
        duration: examDoc.duration,
        closeMode: examDoc.closeMode,
        createdById: examDoc.createdById.toString(),
        createdAt: examDoc.createdAt.toISOString(),
        updatedAt: examDoc.updatedAt.toISOString(),
        questions: examQuestions
    }

    const attemptDoc = await Attempt.findOne({
        examId: id,
        userId: session.user.id,
    }).lean()

    let attempt = null
    if (attemptDoc) {
        const responsesDoc = await Response.find({ attemptId: attemptDoc._id }).lean()
        attempt = {
            id: attemptDoc._id.toString(),
            examId: attemptDoc.examId.toString(),
            userId: attemptDoc.userId.toString(),
            startedAt: attemptDoc.startedAt.toISOString(),
            expiresAt: attemptDoc.expiresAt.toISOString(),
            submittedAt: attemptDoc.submittedAt?.toISOString(),
            status: attemptDoc.status,
            score: attemptDoc.score,
            resumeToken: attemptDoc.resumeToken,
            responses: responsesDoc.map(r => ({
                id: r._id.toString(),
                attemptId: r.attemptId.toString(),
                questionId: r.questionId.toString(),
                selectedOptionId: r.selectedOptionId?.toString() || "",
                isCorrect: r.isCorrect,
            }))
        }
    }

    // If no attempt or completed, redirect
    if (!attempt) redirect(`/student/exam/${exam.id}/lobby`)
    if (attempt.status === "COMPLETED") redirect(`/student/exam/${exam.id}/result`)

    // Check if expired
    if (new Date() > new Date(attempt.expiresAt)) {
        // Should trigger submit logic if not already submitted
        // But for now, just redirect to result which handles "completed" state
        // We might need a server action to mark as completed if expired but status is STARTED
        // For simplicity, let client handle auto-submit or user manual submit
        // But if they refresh page after expiry, we should probably close it.
        // I'll leave it to client auto-submit for now, or add a check here to close it.
    }

    // Shuffle questions for this specific user (anti-cheating)
    // Each student gets a unique but consistent order
    const shuffledQuestions = shuffleQuestionsForUser(exam.questions, session.user.id, exam.id)
    const examWithShuffledQuestions = {
        ...exam,
        questions: shuffledQuestions,
    }

    return <ExamTaker exam={examWithShuffledQuestions} attempt={attempt} />
}
