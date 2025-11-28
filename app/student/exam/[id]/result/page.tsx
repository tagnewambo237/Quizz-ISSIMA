import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import Attempt from "@/models/Attempt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { CheckCircle, XCircle, Home } from "lucide-react"
import Link from "next/link"

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    await connectDB()

    const { id } = await params

    const examDoc = await Exam.findById(id).lean()

    if (!examDoc) notFound()

    const questionsDoc = await Question.find({ examId: id }).lean()

    const exam = {
        ...examDoc,
        id: examDoc._id.toString(),
        questions: questionsDoc.map(q => ({ ...q, id: q._id.toString() }))
    }

    const attemptDoc = await Attempt.findOne({
        examId: id,
        userId: session.user.id,
    }).lean()

    const attempt = attemptDoc ? { ...attemptDoc, id: attemptDoc._id.toString() } : null

    if (!attempt || attempt.status !== "COMPLETED") {
        redirect(`/student/exam/${exam.id}/lobby`)
    }

    const maxScore = exam.questions.reduce((acc, q) => acc + q.points, 0)
    const score = attempt.score || 0
    const percentage = Math.round((score / maxScore) * 100)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Exam Completed!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    You have successfully submitted {exam.title}.
                </p>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Score</p>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{score}</span>
                        <span className="text-gray-500 dark:text-gray-400">/ {maxScore}</span>
                    </div>
                    <p className="text-sm font-medium text-primary mt-2">{percentage}%</p>
                </div>

                <Link
                    href="/student"
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <Home className="h-5 w-5" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}
