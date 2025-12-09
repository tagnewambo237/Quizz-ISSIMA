"use client"

import { SyllabusForm } from "@/components/syllabus/SyllabusForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateSyllabusPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/teacher/syllabus">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-gray-500" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nouveau Programme</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Créez un nouveau syllabus pour structurer vos cours</p>
                </div>
            </div>

            <SyllabusForm />
        </div>
    )
}
