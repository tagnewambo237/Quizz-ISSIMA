import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import Attempt from "@/models/Attempt"
import LateCode from "@/models/LateCode"
import User from "@/models/User" // Ensure User model is imported for population if needed
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { MonitorView } from "@/components/dashboard/MonitorView"

export default async function MonitorPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") redirect("/login")

    await connectDB()

    const { id } = await params

    const examDoc = await Exam.findById(id).lean()

    if (!examDoc) notFound()
    if (examDoc.createdById.toString() !== session.user.id) notFound()

    // Fetch related data
    const questions = await Question.find({ examId: id }).lean()
    const attemptsDoc = await Attempt.find({ examId: id }).sort({ startedAt: -1 }).lean()
    const lateCodes = await LateCode.find({ examId: id }).lean()

    // Populate users for attempts manually to ensure type safety and control
    const userIds = [...new Set(attemptsDoc.map(a => a.userId.toString()))]
    const users = await User.find({ _id: { $in: userIds } }).lean()
    const usersMap = new Map(users.map(u => [u._id.toString(), u]))

    const attempts = attemptsDoc.map(a => ({
        ...a,
        id: a._id.toString(),
        user: usersMap.get(a.userId.toString()) ? {
            ...usersMap.get(a.userId.toString()),
            id: usersMap.get(a.userId.toString())!._id.toString()
        } : null
    }))

    const exam = {
        ...examDoc,
        id: examDoc._id.toString(),
        questions: questions.map(q => ({ ...q, id: q._id.toString() })),
        attempts,
        lateCodes: lateCodes.map(lc => ({ ...lc, id: lc._id.toString() }))
    }

    return <MonitorView exam={exam} />
}
