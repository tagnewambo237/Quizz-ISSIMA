import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Attempt from "@/models/Attempt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { format } from "date-fns"
import Link from "next/link"
import { Plus, Calendar, Clock, Users, MoreVertical, Eye, Edit, Trash } from "lucide-react"
import { ExamCardActions } from "@/components/dashboard/ExamCardActions"

export default async function TeacherExamsPage() {
    const session = await getServerSession(authOptions)

    await connectDB()

    const examsData = await Exam.find({
        createdById: session?.user?.id
    }).sort({ createdAt: -1 }).lean()

    const exams = await Promise.all(examsData.map(async (exam) => {
        const attemptsCount = await Attempt.countDocuments({ examId: exam._id })
        return {
            ...exam,
            _id: exam._id.toString(),
            id: exam._id.toString(),
            createdById: exam.createdById.toString(),
            startTime: exam.startTime.toISOString(),
            endTime: exam.endTime.toISOString(),
            createdAt: exam.createdAt ? exam.createdAt.toISOString() : undefined,
            updatedAt: exam.updatedAt ? exam.updatedAt.toISOString() : undefined,
            _count: {
                attempts: attemptsCount
            }
        }
    }))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Exams</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and monitor your exams</p>
                </div>
                <Link
                    href="/teacher/exams/create"
                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Create New Exam
                </Link>
            </div>

            <div className="grid gap-6">
                {exams.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No exams yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first exam.</p>
                        <Link
                            href="/teacher/exams/create"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                            Create Exam <Plus className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    exams.map((exam) => (
                        <div
                            key={exam.id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                        {exam.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 line-clamp-1">
                                        {exam.description || "No description"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${new Date() >= new Date(exam.startTime) && new Date() <= new Date(exam.endTime)
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : new Date() > new Date(exam.endTime)
                                            ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        }`}>
                                        {new Date() >= new Date(exam.startTime) && new Date() <= new Date(exam.endTime)
                                            ? "Active"
                                            : new Date() > new Date(exam.endTime)
                                                ? "Finished"
                                                : "Upcoming"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(exam.startTime), "MMM d, yyyy")}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {exam.duration} mins
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {exam._count.attempts} attempts
                                </div>
                                <div className="flex-1 hidden sm:block" />
                                <div className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0">
                                    <ExamCardActions exam={exam} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
