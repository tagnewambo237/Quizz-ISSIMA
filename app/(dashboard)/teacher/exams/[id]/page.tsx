"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole, ExamStatus } from "@/models/enums"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExamStatusBadge } from "@/components/exam-management/ExamStatusBadge"
import { ArrowLeft, Edit, Send, CheckCircle, Archive, Loader2, Play, Pause, RotateCcw, Clock, Users, BarChart3, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { LateCodeManager } from "@/components/exam-management/LateCodeManager"
import { toast } from "sonner"

export default function ExamDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [exam, setExam] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        if (params.id) {
            fetchExam()
        }
    }, [params.id])

    const fetchExam = async () => {
        try {
            const res = await fetch(`/api/exams/v2/${params.id}`)
            const data = await res.json()

            if (data.success) {
                setExam(data.data)
            }
        } catch (error) {
            console.error("Error fetching exam:", error)
            toast.error("Erreur lors du chargement de l'examen")
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (action: string, endpoint: string, successMessage: string) => {
        setActionLoading(action)
        try {
            const res = await fetch(endpoint, { method: "POST" })
            const data = await res.json()

            if (res.ok && data.success) {
                toast.success(successMessage)
                fetchExam()
            } else {
                toast.error(data.message || "Une erreur est survenue")
            }
        } catch (error) {
            console.error(`Error ${action}:`, error)
            toast.error("Erreur lors de l'opération")
        } finally {
            setActionLoading(null)
        }
    }

    const handleSubmitForValidation = () =>
        handleAction("submit", `/api/exams/${params.id}/submit-validation`, "Examen soumis pour validation !")

    const handlePublish = () =>
        handleAction("publish", `/api/exams/${params.id}/publish`, "Examen publié avec succès !")

    const handleArchive = () =>
        handleAction("archive", `/api/exams/${params.id}/archive`, "Examen archivé avec succès !")

    const handleUnarchive = () =>
        handleAction("unarchive", `/api/exams/${params.id}/status`, "Examen restauré avec succès !")

    // Render action buttons based on status
    const renderStatusActions = () => {
        if (!exam) return null

        const isLoading = actionLoading !== null

        switch (exam.status) {
            case ExamStatus.DRAFT:
                return (
                    <>
                        <Link href={`/teacher/exams/${exam._id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSubmitForValidation}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {actionLoading === "submit" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Soumettre pour Validation
                        </Button>
                    </>
                )

            case ExamStatus.PENDING_VALIDATION:
                return (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <span className="text-amber-700 dark:text-amber-400 font-medium">
                            En attente de validation par un inspecteur
                        </span>
                    </div>
                )

            case ExamStatus.VALIDATED:
                return (
                    <>
                        <Link href={`/teacher/exams/${exam._id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        </Link>
                        <Button
                            onClick={handlePublish}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {actionLoading === "publish" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="mr-2 h-4 w-4" />
                            )}
                            Publier l'examen
                        </Button>
                    </>
                )

            case ExamStatus.PUBLISHED:
                return (
                    <>
                        <Link href={`/teacher/exams/${exam._id}/results`}>
                            <Button variant="outline">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Voir les résultats
                            </Button>
                        </Link>
                        <Button
                            onClick={handleArchive}
                            disabled={isLoading}
                            variant="outline"
                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                            {actionLoading === "archive" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Archive className="mr-2 h-4 w-4" />
                            )}
                            Archiver
                        </Button>
                    </>
                )

            case ExamStatus.ARCHIVED:
                return (
                    <>
                        <Link href={`/teacher/exams/${exam._id}/results`}>
                            <Button variant="outline">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Voir les résultats
                            </Button>
                        </Link>
                        <Button
                            onClick={handleUnarchive}
                            disabled={isLoading}
                            variant="outline"
                        >
                            {actionLoading === "unarchive" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RotateCcw className="mr-2 h-4 w-4" />
                            )}
                            Restaurer
                        </Button>
                    </>
                )

            default:
                return null
        }
    }

    // Render status-specific alerts/info
    const renderStatusInfo = () => {
        if (!exam) return null

        switch (exam.status) {
            case ExamStatus.DRAFT:
                return (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start gap-3">
                        <Edit className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Mode Brouillon</p>
                            <p className="text-sm text-gray-500">Cet examen n'a pas encore été soumis. Modifiez-le et soumettez-le pour validation.</p>
                        </div>
                    </div>
                )

            case ExamStatus.PUBLISHED:
                return (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-green-700 dark:text-green-400">Examen en ligne</p>
                            <p className="text-sm text-green-600 dark:text-green-500">Les étudiants peuvent accéder à cet examen et le passer.</p>
                        </div>
                    </div>
                )

            case ExamStatus.ARCHIVED:
                return (
                    <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 flex items-start gap-3">
                        <Archive className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-orange-700 dark:text-orange-400">Examen archivé</p>
                            <p className="text-sm text-orange-600 dark:text-orange-500">Cet examen n'est plus accessible aux étudiants. Vous pouvez le restaurer si nécessaire.</p>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!exam) {
        return (
            <div className="p-8">
                <p>Examen non trouvé</p>
            </div>
        )
    }

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
            <div className="p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/teacher/exams">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Button>
                        </Link>
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
                                <ExamStatusBadge status={exam.status} />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {renderStatusActions()}
                            </div>
                        </div>
                    </div>

                    {/* Status Info Banner */}
                    {renderStatusInfo()}

                    {/* Details */}
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations Générales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {exam.description && (
                                    <div>
                                        <p className="text-sm text-gray-500">Description</p>
                                        <p>{exam.description}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Durée</p>
                                        <p className="font-medium">{exam.duration} minutes</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Difficulté</p>
                                        <p className="font-medium">{exam.difficultyLevel || "Non défini"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p className="font-medium">{exam.evaluationType || "Non défini"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Questions</p>
                                        <p className="font-medium">{exam.questions?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-500" />
                                    Statistiques
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-blue-600 dark:text-blue-400">Tentatives</p>
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{exam.stats?.totalAttempts || 0}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-sm text-green-600 dark:text-green-400">Complétées</p>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{exam.stats?.totalCompletions || 0}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <p className="text-sm text-purple-600 dark:text-purple-400">Moyenne</p>
                                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{exam.stats?.averageScore || 0}%</p>
                                    </div>
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <p className="text-sm text-amber-600 dark:text-amber-400">Taux de Réussite</p>
                                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{exam.stats?.passRate || 0}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Late Code Management - Only show for published/closed exams */}
                        {(exam.status === ExamStatus.PUBLISHED || exam.status === ExamStatus.ARCHIVED) && (
                            <LateCodeManager examId={exam._id} examStatus={exam.status} />
                        )}
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
}
