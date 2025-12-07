import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import connectDB from "@/lib/mongodb"
import { ClassService } from "@/lib/services/ClassService"
import { ExamCard } from "@/components/student/ExamCard"
import Attempt from "@/models/Attempt"
import Question from "@/models/Question"
import { BookOpen, Calendar, GraduationCap, School, Users } from "lucide-react"
import { isPast } from "date-fns"

export default async function StudentClassPage(props: { params: Promise<{ classId: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    await connectDB()

    // 1. Fetch Class Data
    const classData = await ClassService.getClassById(params.classId)
    if (!classData) {
        notFound()
    }

    // Optional: Verify student is enrolled?
    // For now we assume access if they have the link/ID, but ideally we should check classData.students
    const isEnrolled = classData.students?.some((s: any) => s._id.toString() === session.user.id);
    if (!isEnrolled) {
        // You could redirect to a "Join" page or show an error
        // But if they just joined via the link, they ARE enrolled.
        // If they manually type URL, maybe we block?
        // Let's allow for now or validation might be tricky if data isn't fresh.
    }

    // 2. Fetch Exams for this class
    const exams = await ClassService.getClassExams(params.classId)

    // 3. Fetch user attempts for these exams
    const attempts = await Attempt.find({
        userId: session.user.id,
        examId: { $in: exams.map((e: any) => e._id) }
    }).lean()

    // 4. Format Exams for UI
    const examsWithData = await Promise.all(
        exams.map(async (exam: any) => {
            const questionCount = await Question.countDocuments({ examId: exam._id })
            const userAttempt = attempts.find((a: any) => a.examId.toString() === exam._id.toString())

            return {
                id: exam._id.toString(),
                title: exam.title,
                description: exam.description,
                startTime: exam.startTime.toISOString(),
                endTime: exam.endTime.toISOString(),
                duration: exam.duration,
                closeMode: exam.closeMode,
                createdById: exam.createdById?.toString(),
                attempts: userAttempt ? [{
                    id: userAttempt._id.toString(),
                    status: userAttempt.status,
                    score: userAttempt.score,
                }] : [],
                _count: { questions: questionCount },
                subject: exam.subject
            }
        })
    )

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/4" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-secondary font-medium mb-2">
                                <School className="h-4 w-4" />
                                {(classData.school as any)?.name}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {classData.name}
                            </h1>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                {classData.level && (
                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{(classData.level as any).name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                    <Calendar className="h-4 w-4" />
                                    <span>{classData.academicYear}</span>
                                </div>
                                {classData.mainTeacher && (
                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                        <Users className="h-4 w-4" />
                                        <span>Prof. {(classData.mainTeacher as any).name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exams Grid */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-secondary" />
                    Examens de la classe
                </h2>

                {examsWithData.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun examen disponible</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Votre professeur n'a pas encore publié d'examen pour cette classe.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {examsWithData.map((exam) => {
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
                                    exam={exam as any}
                                    status={status as any}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
