import connectDB from "@/lib/mongodb"
import Attempt from "@/models/Attempt"
import Exam from "@/models/Exam"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Clock, Calendar, CheckCircle, XCircle, Trophy, ArrowLeft, Eye, Lock } from "lucide-react"
import Link from "next/link"
import { format, isPast } from "date-fns"

export default async function StudentHistoryPage() {
    const session = await getServerSession(authOptions)

    await connectDB()

    const attemptsDoc = await Attempt.find({
        userId: session?.user?.id,
        status: "COMPLETED"
    }).sort({ submittedAt: -1 }).lean()

    // Populate exams
    const examIds = [...new Set(attemptsDoc.map(a => a.examId.toString()))]
    const exams = await Exam.find({ _id: { $in: examIds } }).lean()
    const examsMap = new Map(exams.map(e => [e._id.toString(), e]))

    const attempts = attemptsDoc.map(a => ({
        ...a,
        id: a._id.toString(),
        exam: {
            ...examsMap.get(a.examId.toString()),
            id: examsMap.get(a.examId.toString())?._id.toString()
        }
    })).filter(a => a.exam) // Filter out attempts where exam might have been deleted

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/student"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Exam History</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Your past achievements and results
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {attempts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No history yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Complete an exam to see your results here.
                        </p>
                    </div>
                ) : (
                    attempts.map((attempt) => {
                        const examEnded = attempt.exam.endTime ? isPast(new Date(attempt.exam.endTime)) : false

                        return (
                            <div
                                key={attempt.id}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 transition-all hover:shadow-lg group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0
                                            ${(attempt.score || 0) >= 50 ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}
                                        `}>
                                            {(attempt.score || 0) >= 50 ? <Trophy className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                                                {attempt.exam.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(attempt.submittedAt!), "PPP")}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" />
                                                    {format(new Date(attempt.submittedAt!), "p")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-4 md:pt-0">
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Score</p>
                                            <p className={`text-3xl font-black ${(attempt.score || 0) >= 50 ? 'text-secondary dark:text-secondary' : 'text-red-600 dark:text-red-400'}`}>
                                                {attempt.score}
                                            </p>
                                        </div>

                                        {examEnded ? (
                                            <Link
                                                href={`/student/history/${attempt.id}`}
                                                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary/30"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </Link>
                                        ) : (
                                            <div className="bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 cursor-not-allowed" title="Available after exam ends">
                                                <Lock className="h-4 w-4" />
                                                Locked
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
