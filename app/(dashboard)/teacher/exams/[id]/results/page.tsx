"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/models/enums"
import { ExamStats } from "@/components/analytics/ExamStats"
import { StudentPerformanceTable } from "@/components/analytics/StudentPerformanceTable"
import { QuestionAnalysis } from "@/components/analytics/QuestionAnalysis"
import { ChartScoreDistribution } from "@/components/analytics/ChartScoreDistribution"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { exportToCSV, formatAttemptsForExport, formatQuestionAnalysisForExport } from "@/lib/utils/exportResults"

export default function ExamResultsPage() {
    const params = useParams()
    const [exam, setExam] = useState<any>(null)
    const [attempts, setAttempts] = useState<any[]>([])
    const [questionStats, setQuestionStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchData()
        }
    }, [params.id])

    const fetchData = async () => {
        try {
            // Fetch exam details
            const examRes = await fetch(`/api/exams/v2/${params.id}`)
            const examData = await examRes.json()

            if (examData.success) {
                setExam(examData.data)
            }

            // Fetch attempts (mock data for now)
            // TODO: Create endpoint /api/exams/:id/attempts
            setAttempts([])

            // Mock question stats
            setQuestionStats([])

        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleExportCSV = () => {
        if (attempts.length === 0) {
            alert("Aucune donnée à exporter")
            return
        }
        const formattedData = formatAttemptsForExport(attempts)
        exportToCSV(formattedData, `resultats_${exam?.title || 'examen'}_${new Date().toISOString().split('T')[0]}`)
    }

    const handleExportQuestionAnalysis = () => {
        if (questionStats.length === 0) {
            alert("Aucune donnée à exporter")
            return
        }
        const formattedData = formatQuestionAnalysisForExport(questionStats)
        exportToCSV(formattedData, `analyse_questions_${exam?.title || 'examen'}_${new Date().toISOString().split('T')[0]}`)
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

    const stats = {
        totalAttempts: exam.stats?.totalAttempts || 0,
        totalCompletions: exam.stats?.totalCompletions || 0,
        averageScore: exam.stats?.averageScore || 0,
        passRate: exam.stats?.passRate || 0,
        averageTime: exam.stats?.averageTime || 0,
    }

    const scores = attempts.map(a => a.percentage)

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={`/teacher/exams/${params.id}`}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Button>
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Résultats: {exam.title}</h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Analyse des performances et statistiques
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleExportCSV} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Exporter Résultats (CSV)
                                </Button>
                                <Button onClick={handleExportQuestionAnalysis} variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Exporter Analyse (CSV)
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="mb-8">
                        <ExamStats stats={stats} />
                    </div>

                    {/* Charts and Analysis */}
                    <div className="grid gap-6 md:grid-cols-2 mb-8">
                        <ChartScoreDistribution scores={scores} />
                        <QuestionAnalysis questions={questionStats} />
                    </div>

                    {/* Student Performance Table */}
                    <StudentPerformanceTable attempts={attempts} />
                </div>
            </div>
        </RoleGuard>
    )
}
