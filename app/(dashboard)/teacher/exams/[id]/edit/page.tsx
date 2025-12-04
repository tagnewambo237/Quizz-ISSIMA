"use client"

import { useParams, useRouter } from "next/navigation"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/models/enums"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditExamPage() {
    const params = useParams()
    const router = useRouter()

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
            <div className="p-8">
                <div className="max-w-5xl mx-auto">
                    <Link href={`/teacher/exams/${params.id}`}>
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Button>
                    </Link>

                    <h1 className="text-3xl font-bold mb-8">Modifier l'Examen</h1>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                        <p className="text-yellow-800 dark:text-yellow-200">
                            Fonctionnalité d'édition en cours de développement.
                            Pour l'instant, vous pouvez créer un nouvel examen ou archiver celui-ci.
                        </p>
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
}
