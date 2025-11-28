import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Attempt from "@/models/Attempt"
import Question from "@/models/Question"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { ExamLobby } from "@/components/student/ExamLobby"

export default async function ExamLobbyPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    await connectDB()

    const { id } = await params

    const examDoc = await Exam.findById(id).lean()

    if (!examDoc) notFound()

    const questionCount = await Question.countDocuments({ examId: id })
    const attempts = await Attempt.find({
        examId: id,
        userId: session.user.id
    }).lean()

    const exam = {
        ...examDoc,
        id: examDoc._id.toString(),
        _count: { questions: questionCount },
        attempts: attempts.map(a => ({ ...a, id: a._id.toString() }))
    }

    if (!exam) notFound()

    // If already attempted and not finished, redirect to take
    // If finished, redirect to result (not implemented yet)
    const attempt = exam.attempts[0]
    if (attempt) {
        if (attempt.status === "STARTED") {
            redirect(`/student/exam/${exam.id}/take`)
        } else {
            // redirect(`/student/exam/${exam.id}/result`)
            // For now stay here or show result summary
        }
    }

    return <ExamLobby exam={exam} user={session.user} />
}
