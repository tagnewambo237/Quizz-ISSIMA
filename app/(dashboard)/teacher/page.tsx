import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Attempt from "@/models/Attempt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Plus, Users, Clock, FileText, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function TeacherDashboard() {
    const session = await getServerSession(authOptions)

    await connectDB()

    // Fetch stats
    const examsCount = await Exam.countDocuments({
        createdById: session?.user?.id,
    })

    const now = new Date()
    const activeExams = await Exam.find({
        createdById: session?.user?.id,
        startTime: { $lte: now },
        endTime: { $gte: now },
    }).lean()

    // Get attempt counts for active exams
    const activeExamsWithCounts = await Promise.all(
        activeExams.map(async (exam) => {
            const attemptCount = await Attempt.countDocuments({ examId: exam._id })
            return {
                ...exam,
                id: exam._id.toString(),
                _count: { attempts: attemptCount }
            }
        })
    )

    // Calculate total students (unique users who attempted exams)
    const uniqueStudents = await Attempt.distinct('userId', {
        examId: { $in: await Exam.find({ createdById: session?.user?.id }).distinct('_id') }
    })
    const totalStudents = uniqueStudents.length

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Welcome back, <span className="font-semibold text-primary dark:text-primary">{session?.user?.name}</span>
                    </p>
                </div>
                <Link
                    href="/teacher/exams/create"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/25 font-medium group"
                >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                    Create Exam
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-primary dark:text-primary group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-2 py-1 rounded-lg">
                            Total
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Exams</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{examsCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 bg-secondary/10 dark:bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary dark:text-secondary group-hover:scale-110 transition-transform">
                            <Clock className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-medium bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary px-2 py-1 rounded-lg flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                            Live
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Now</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeExams.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-primary dark:text-primary group-hover:scale-110 transition-transform">
                            <Users className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-2 py-1 rounded-lg">
                            Students
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalStudents}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full" />
                            Active Exams
                        </h2>
                        <Link href="/teacher/exams" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 group">
                            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {activeExamsWithCounts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No exams currently active.</p>
                            <p className="text-sm text-gray-400 mt-1">Scheduled exams will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeExamsWithCounts.map((exam) => (
                                <div key={exam.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary dark:text-primary font-bold text-lg shrink-0">
                                            {exam.title[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{exam.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                Ends {format(new Date(exam.endTime), "h:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-gray-100 dark:border-gray-700 pt-4 sm:pt-0">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{exam._count.attempts}</p>
                                            <p className="text-xs text-gray-500">Attempts</p>
                                        </div>
                                        <Link
                                            href={`/teacher/exams/${exam.id}/monitor`}
                                            className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary hover:bg-primary/20 dark:hover:bg-primary/30 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            Monitor
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <div className="w-1 h-6 bg-secondary rounded-full" />
                            Recent Activity
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 text-center">
                        <div className="w-16 h-16 bg-secondary/10 dark:bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="h-8 w-8 text-secondary" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activity.</p>
                        <p className="text-sm text-gray-400 mt-1">Student submissions will appear here.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

