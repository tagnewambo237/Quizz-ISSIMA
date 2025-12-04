"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/models/enums"
import { ExamCard } from "@/components/exam-management/ExamCard"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import Link from "next/link"

const TABS = [
    { id: "all", label: "Tous", status: null },
    { id: "draft", label: "Brouillons", status: "DRAFT" },
    { id: "pending", label: "En Validation", status: "PENDING_VALIDATION" },
    { id: "validated", label: "Validés", status: "VALIDATED" },
    { id: "published", label: "Publiés", status: "PUBLISHED" },
    { id: "archived", label: "Archivés", status: "ARCHIVED" },
]

export default function ExamsListPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("all")
    const [exams, setExams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchExams()
    }, [activeTab])

    const fetchExams = async () => {
        setLoading(true)
        try {
            const currentTab = TABS.find(t => t.id === activeTab)
            const statusParam = currentTab?.status ? `?status=${currentTab.status}` : ""

            const res = await fetch(`/api/exams/v2${statusParam}`)
            const data = await res.json()

            if (data.success) {
                setExams(data.data.exams || [])
            }
        } catch (error) {
            console.error("Error fetching exams:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleArchive = async (examId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir archiver cet examen ?")) return

        try {
            const res = await fetch(`/api/exams/${examId}/archive`, {
                method: "POST",
            })

            if (res.ok) {
                fetchExams() // Refresh list
            } else {
                alert("Erreur lors de l'archivage")
            }
        } catch (error) {
            console.error("Error archiving exam:", error)
            alert("Erreur lors de l'archivage")
        }
    }

    const handleGenerateLateCode = async (examId: string) => {
        router.push(`/teacher/exams/${examId}?action=generate-late-code`)
    }

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Mes Examens
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Gérez vos examens et suivez les résultats
                            </p>
                        </div>
                        <Link href="/teacher/exams/create">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Créer un Examen
                            </Button>
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${activeTab === tab.id
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                        }
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Aucun examen trouvé
                            </p>
                            <Link href="/teacher/exams/create">
                                <Button variant="outline">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Créer votre premier examen
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map((exam) => (
                                <ExamCard
                                    key={exam._id}
                                    exam={exam}
                                    onArchive={handleArchive}
                                    onGenerateLateCode={handleGenerateLateCode}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    )
}
