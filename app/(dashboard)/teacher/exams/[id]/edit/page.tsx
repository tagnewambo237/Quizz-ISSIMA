import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import Option from "@/models/Option"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { ExamForm } from "@/components/dashboard/ExamForm"

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") redirect("/login")

    await connectDB()

    const { id } = await params

    const examDoc = await Exam.findById(id).lean()

    if (!examDoc) notFound()

    // Fetch questions
    const questionsDoc = await Question.find({ examId: id }).lean()

    // Fetch options for all questions
    const questionIds = questionsDoc.map(q => q._id)
    const optionsDoc = await Option.find({ questionId: { $in: questionIds } }).lean()

    // Reconstruct the nested object structure
    const exam = {
        ...examDoc,
        id: examDoc._id.toString(),
        questions: questionsDoc.map(q => ({
            ...q,
            id: q._id.toString(),
            options: optionsDoc
                .filter(o => o.questionId.toString() === q._id.toString())
                .map(o => ({ ...o, id: o._id.toString() }))
        }))
    }

    if (!exam || exam.createdById.toString() !== session.user.id) notFound()

    return <ExamForm initialData={exam} />
}
