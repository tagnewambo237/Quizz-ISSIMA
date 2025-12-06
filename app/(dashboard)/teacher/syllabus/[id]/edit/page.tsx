import { SyllabusForm } from "@/components/syllabus/SyllabusForm"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import connectDB from "@/lib/mongodb"
import Syllabus from "@/models/Syllabus"

async function getSyllabus(id: string) {
    try {
        await connectDB()
        const syllabus = await Syllabus.findById(id)
            .populate('subject', 'name code') // Populate for initial data if needed, though ID is enough for form usually
            .populate('school', 'name')
            .lean()

        if (!syllabus) return null

        // Serialize for client component
        return JSON.parse(JSON.stringify(syllabus))
    } catch (error) {
        console.error("Error fetching syllabus:", error)
        return null
    }
}

export default async function EditSyllabusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const syllabus = await getSyllabus(id)

    if (!syllabus) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/teacher/syllabus">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-gray-500" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Edit className="h-8 w-8 text-[#3a4795]" />
                        Modifier le Programme
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Modifiez les informations et la structure de votre cours
                    </p>
                </div>
            </div>

            <SyllabusForm initialData={syllabus} />
        </div>
    )
}
