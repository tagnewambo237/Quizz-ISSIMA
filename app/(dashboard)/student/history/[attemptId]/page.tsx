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
import { isPast, addMinutes, isAfter } from "date-fns"
import { Clock, Lock, Home } from "lucide-react"
import Link from "next/link"

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

    // Calculate late exam period
    const now = new Date()
    const lateDuration = examDoc.config?.lateDuration || 0
    const delayResultsUntilLateEnd = examDoc.config?.delayResultsUntilLateEnd ?? false
    const examEndTime = new Date(examDoc.endTime)
    const lateEndTime = addMinutes(examEndTime, lateDuration)

    // Check access conditions
    const examEnded = isPast(examEndTime)
    const inLatePeriod = examEnded && isAfter(lateEndTime, now) && lateDuration > 0
    const resultsBlocked = !examEnded || (delayResultsUntilLateEnd && inLatePeriod)

    // Time remaining until results
    const timeUntilResults = inLatePeriod
        ? Math.ceil((lateEndTime.getTime() - now.getTime()) / 1000 / 60)
        : 0

    // Teachers can always review, students follow late exam rules
    if (session.user.role !== "TEACHER" && resultsBlocked) {
        // Show blocked page instead of redirecting
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
                    <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Résultats Non Disponibles</h1>

                    {inLatePeriod ? (
                        <>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Les résultats détaillés seront disponibles après la fin de la période retardataires.
                            </p>

                            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-2xl p-6 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    <span className="font-bold text-amber-800 dark:text-amber-200">Période retardataires en cours</span>
                                </div>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                                    Pour garantir l'équité, les résultats sont masqués pendant que d'autres étudiants terminent l'examen.
                                </p>
                                <div className="bg-amber-100 dark:bg-amber-800/50 rounded-xl p-3">
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Disponible dans environ</p>
                                    <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                                        {timeUntilResults} min
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Les résultats seront disponibles après la fin de l'examen.
                        </p>
                    )}

                    <Link
                        href="/student/history"
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <Home className="h-5 w-5" />
                        Retour à l'historique
                    </Link>
                </div>
            </div>
        )
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
            type: q.type || 'QCM',
            correctAnswer: q.correctAnswer,
            modelAnswer: q.modelAnswer,
            explanation: q.explanation,
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
            selectedOptionId: r.selectedOptionId?.toString() || "",
            textResponse: r.textResponse || "",
            isCorrect: r.isCorrect,
        }))
    }

    return <ExamReview exam={exam} attempt={attempt} />
}
