"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/models/enums"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExamStatusBadge } from "@/components/exam-management/ExamStatusBadge"
import { ArrowLeft, Edit, Send, CheckCircle, Archive, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ExamDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [exam, setExam] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

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
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitForValidation = async () => {
        setActionLoading(true)
        try {
            const res = await fetch(`/api/exams/${params.id}/submit-validation`, {
                method: "POST",
            })

            if (res.ok) {
                alert("Examen soumis pour validation !")
                fetchExam()
            } else {
                const data = await res.json()
                alert(data.message || "Erreur lors de la soumission")
            }
        } catch (error) {
            console.error("Error:", error)
            alert("Erreur lors de la soumission")
        } finally {
            setActionLoading(false)
        }
    }

    const handlePublish = async () => {
        setActionLoading(true)
        try {
            const res = await fetch(`/api/exams/${params.id}/publish`, {
                method: "POST",
            })

            if (res.ok) {
                alert("Examen publié !")
                fetchExam()
            } else {
                const data = await res.json()
                alert(data.message || "Erreur lors de la publication")
            }
        } catch (error) {
            console.error("Error:", error)
            alert("Erreur lors de la publication")
        } finally {
            setActionLoading(false)
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
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
                                <ExamStatusBadge status={exam.status} />
                            </div>
                            <div className="flex gap-2">
                                {exam.status === "DRAFT" && (
                                    <>
                                        <Link href={`/teacher/exams/${exam._id}/edit`}>
                                            <Button variant="outline">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Modifier
                                            </Button>
                                        </Link>
                                        <Button onClick={handleSubmitForValidation} disabled={actionLoading}>
                                            <Send className="mr-2 h-4 w-4" />
                                            Soumettre pour Validation
                                        </Button>
                                    </>
                                )}
                                {exam.status === "VALIDATED" && (
                                    <Button onClick={handlePublish} disabled={actionLoading}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Publier
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

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
                                <div className="grid grid-cols-3 gap-4">
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
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Statistiques</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Tentatives</p>
                                        <p className="text-2xl font-bold">{exam.stats?.totalAttempts || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Complétées</p>
                                        <p className="text-2xl font-bold">{exam.stats?.totalCompletions || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Moyenne</p>
                                        <p className="text-2xl font-bold">{exam.stats?.averageScore || 0}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Taux de Réussite</p>
                                        <p className="text-2xl font-bold">{exam.stats?.passRate || 0}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
}
