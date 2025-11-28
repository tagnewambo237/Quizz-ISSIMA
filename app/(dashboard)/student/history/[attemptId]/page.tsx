import connectDB from "@/lib/mongodb"
import Attempt from "@/models/Attempt"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import Option from "@/models/Option"
import Response from "@/models/Response"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { ExamReview } from "@/components/student/ExamReview"
import { isPast } from "date-fns"

export default async function ExamReviewPage({ params }: { params: Promise<{ attemptId: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    await connectDB()

    const { attemptId } = await params

    // Fetch the attempt
    const attemptDoc = await Attempt.findById(attemptId).lean()
    if (!attemptDoc) notFound()

    // Verify this attempt belongs to the current user
    if (attemptDoc.userId.toString() !== session.user.id) {
        redirect("/student")
    }

    // Fetch the exam
    const examDoc = await Exam.findById(attemptDoc.examId).lean()
    if (!examDoc) notFound()

    // Check if exam has ended (students can only review after exam end time)
    const examEnded = isPast(new Date(examDoc.endTime))

    // Teachers can always review, students only after exam ends
    if (session.user.role !== "TEACHER" && !examEnded) {
        redirect("/student/history")
    }

    // Fetch questions and options
    const questionsDoc = await Question.find({ examId: examDoc._id }).lean()
    const questionIds = questionsDoc.map(q => q._id)
    const optionsDoc = await Option.find({ questionId: { $in: questionIds } }).lean()

    // Fetch student responses
    const responsesDoc = await Response.find({ attemptId: attemptDoc._id }).lean()

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
        questions: questionsDoc.map(q => ({
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
                    isCorrect: o.isCorrect,
                }))
        }))
    }

    const attempt = {
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
            selectedOptionId: r.selectedOptionId.toString(),
            isCorrect: r.isCorrect,
        }))
    }

    return <ExamReview exam={exam} attempt={attempt} />
}
