import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Attempt from "@/models/Attempt"
import Question from "@/models/Question"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Trophy, Star, BookOpen, Flame } from "lucide-react"
import { isPast } from "date-fns"
import { ExamCard } from "@/components/student/ExamCard"

export default async function StudentDashboard() {
    const session = await getServerSession(authOptions)

    await connectDB()

    // Fetch all exams
    const exams = await Exam.find({}).sort({ startTime: 1 }).lean()

    // Fetch attempts for this user
    const attempts = await Attempt.find({ userId: session?.user?.id }).lean()

    // Get question counts for each exam
    const examsWithData = await Promise.all(
        exams.map(async (exam) => {
            const questionCount = await Question.countDocuments({ examId: exam._id })
            const userAttempt = attempts.find(a => a.examId.toString() === exam._id.toString())

            return {
                id: exam._id.toString(),
                title: exam.title,
                description: exam.description,
                startTime: exam.startTime.toISOString(),
                endTime: exam.endTime.toISOString(),
                duration: exam.duration,
                closeMode: exam.closeMode,
                createdById: exam.createdById.toString(),
                createdAt: exam.createdAt.toISOString(),
                updatedAt: exam.updatedAt.toISOString(),
                attempts: userAttempt ? [{
                    id: userAttempt._id.toString(),
                    examId: userAttempt.examId.toString(),
                    userId: userAttempt.userId.toString(),
                    status: userAttempt.status,
                    score: userAttempt.score,
                    startedAt: userAttempt.startedAt?.toISOString(),
                    submittedAt: userAttempt.submittedAt?.toISOString(),
                }] : [],
                _count: { questions: questionCount }
            }
        })
    )

    // Calculate stats
    const completedExams = examsWithData.filter(e => e.attempts[0]?.status === "COMPLETED").length
    const totalPoints = examsWithData.reduce((acc, exam) => {
        const attempt = exam.attempts[0]
        return acc + (attempt?.score || 0)
    }, 0)

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-indigo-100 font-medium tracking-wide uppercase text-sm">Student Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-extrabold mb-4">
                        Welcome back, {session?.user?.name}! 👋
                    </h1>
                    <p className="text-indigo-100 text-lg max-w-2xl">
                        Ready to challenge yourself? You have <span className="font-bold text-white">{examsWithData.filter(e => isPast(new Date(e.startTime)) && !isPast(new Date(e.endTime)) && !e.attempts[0]).length} active exams</span> waiting for you.
                    </p>

                    <div className="flex flex-wrap gap-6 mt-8">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                            <div className="bg-yellow-400 p-2 rounded-lg text-yellow-900">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-100">Exams Passed</p>
                                <p className="font-bold text-xl">{completedExams}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                            <div className="bg-orange-400 p-2 rounded-lg text-orange-900">
                                <Flame className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-100">Total Score</p>
                                <p className="font-bold text-xl">{totalPoints}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Exam List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-indigo-500" />
                        Your Learning Path
                    </h2>

                    <div className="space-y-4">
                        {examsWithData.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No exams assigned yet</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Relax! You don't have any exams scheduled right now.
                                </p>
                            </div>
                        ) : (
                            examsWithData.map((exam) => {
                                const attempt = exam.attempts[0]
                                const isStarted = isPast(new Date(exam.startTime))
                                const isEnded = isPast(new Date(exam.endTime))
                                const isActive = isStarted && !isEnded

                                let status = "upcoming"
                                if (attempt?.status === "COMPLETED") status = "completed"
                                else if (attempt?.status === "STARTED") status = "in_progress"
                                else if (isEnded) status = "missed"
                                else if (isActive) status = "active"

                                return (
                                    <ExamCard
                                        key={exam.id}
                                        exam={exam}
                                        status={status as any}
                                    />
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            Achievements
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 opacity-50">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center text-2xl grayscale">
                                    🎯
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">First Perfect Score</p>
                                    <p className="text-xs text-gray-500">Get 100% on an exam</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 opacity-50">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center text-2xl grayscale">
                                    🔥
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">On Fire</p>
                                    <p className="text-xs text-gray-500">Complete 3 exams in a row</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <h3 className="font-bold text-lg mb-2 relative z-10">Need Help?</h3>
                        <p className="text-gray-300 text-sm mb-4 relative z-10">
                            Check the documentation or contact your teacher for assistance.
                        </p>
                        <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-2 rounded-xl font-semibold text-sm transition-colors relative z-10">
                            View Guide
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
