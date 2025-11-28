import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Attempt from "@/models/Attempt"
import Exam from "@/models/Exam"
import Response from "@/models/Response"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { id } = await params

        // Verify attempt belongs to an exam created by this teacher
        const attempt = await Attempt.findById(id)

        if (!attempt) {
            return NextResponse.json({ message: "Attempt not found" }, { status: 404 })
        }

        const exam = await Exam.findById(attempt.examId)

        if (!exam || exam.createdById.toString() !== session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        // Delete responses first (manual cascade)
        await Response.deleteMany({ attemptId: id })
        await Attempt.findByIdAndDelete(id)

        return NextResponse.json({ message: "Attempt deleted" })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ message: "Error deleting attempt" }, { status: 500 })
    }
}
