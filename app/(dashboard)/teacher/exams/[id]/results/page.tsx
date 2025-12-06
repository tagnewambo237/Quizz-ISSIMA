"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/models/enums"
// import { ExamStats } from "@/components/analytics/ExamStats"
// import { StudentPerformanceTable } from "@/components/analytics/StudentPerformanceTable"
// import { QuestionAnalysis } from "@/components/analytics/QuestionAnalysis"
// import { ChartScoreDistribution } from "@/components/analytics/ChartScoreDistribution"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Download, FileText, Loader2, Trophy, CheckCircle2, Clock, Users, BarChart3, TrendingUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
// import { exportToCSV, formatAttemptsForExport, formatQuestionAnalysisForExport } from "@/lib/utils/exportResults"

export default function ExamResultsPage() {
    const params = useParams()
    const [exam, setExam] = useState<any>(null)
    const [attempts, setAttempts] = useState<any[]>([])
    const [stats, setStats] = useState({
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTimeSpent: 0
    })
    const [distribution, setDistribution] = useState([
        { range: '0-20', count: 0 },
        { range: '21-40', count: 0 },
        { range: '41-60', count: 0 },
        { range: '61-80', count: 0 },
        { range: '81-100', count: 0 },
    ])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (params.id) {
            fetchData()
        }
    }, [params.id])

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/exams/${params.id}/results`)
            const data = await res.json()

            if (data.success) {
                setExam(data.data.exam)
                setStats(data.data.stats)
                setDistribution(data.data.distribution)
                setAttempts(data.data.attempts)
            }
        } catch (error) {
            console.error("Error fetching results:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter attempts by search query
    const filteredAttempts = attempts.filter(a => 
        a.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.studentCode?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort for top performers (highest scores first)
    const topPerformers = [...attempts]
        .filter(a => a.status === 'COMPLETED')
        .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
        .slice(0, 3)


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-black/20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative w-16 h-16">
                        <motion.div
                            className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"
                            style={{ borderTopColor: 'transparent' }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-blue-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-gray-500 font-medium">Analyse des résultats...</p>
                </motion.div>
            </div>
        )
    }

    if (!exam) return null

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-white/20"
                    >
                        <div>
                            <Link href={`/teacher/exams/${params.id}`} className="inline-flex items-center text-sm text-gray-400 hover:text-blue-500 transition-colors mb-2 group">
                                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                                Retour à l'examen
                            </Link>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-2">
                                {exam.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
                                    <FileText className="w-3.5 h-3.5" />
                                    Rapport d'analyse
                                </span>
                                <span>•</span>
                                <span>Généré le {new Date().toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <Download className="mr-2 h-4 w-4" /> CSV
                            </Button>
                            <Button className="rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xl shadow-gray-900/10 dark:shadow-white/10">
                                <FileText className="mr-2 h-4 w-4" /> Rapport PDF
                            </Button>
                        </div>
                    </motion.div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Moyenne", value: `${mockStats.averageScore}%`, icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-200 dark:border-amber-800" },
                            { label: "Taux de Réussite", value: `${mockStats.passRate}%`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-800" },
                            { label: "Temps Moyen", value: `${mockStats.averageTime}m`, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-200 dark:border-blue-800" },
                            { label: "Total Participants", value: mockStats.totalAttempts, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-200 dark:border-purple-800" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn("bg-white dark:bg-gray-800 rounded-[2rem] p-6 border shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300", stat.border)}
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                                    <p className={cn("text-3xl font-bold tracking-tight", stat.color)}>{stat.value}</p>
                                </div>
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", stat.bg)}>
                                    <stat.icon className={cn("w-7 h-7", stat.color)} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Score Distribution */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm"
                        >
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-gray-400" />
                                Distribution des Scores
                            </h3>
                            <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4">
                                {distributionData.map((item, i) => (
                                    <div key={item.range} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full relative h-[200px] flex items-end rounded-t-xl bg-gray-50 dark:bg-gray-900 overflow-hidden">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(item.count / 15) * 100}%` }}
                                                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity rounded-t-xl relative min-h-[4px]"
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {item.count} étudiants
                                                </div>
                                            </motion.div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors">{item.range}%</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Recent Activity / Top Performers */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm"
                        >
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                Top Performance
                            </h3>
                            <div className="space-y-4">
                                {attempts.slice(0, 3).map((attempt, i) => (
                                    <div key={attempt.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br shadow-sm text-white",
                                            i === 0 ? "from-yellow-400 to-orange-500" :
                                                i === 1 ? "from-gray-300 to-gray-400" :
                                                    "from-orange-300 to-orange-400"
                                        )}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{attempt.studentName}</p>
                                            <p className="text-xs text-gray-500">{attempt.timeSpent} • {attempt.submittedAt}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600 dark:text-emerald-400">{attempt.score}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Detailed List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Détails des tentatives</h3>
                            <div className="flex gap-2">
                                <Input placeholder="Rechercher un étudiant..." className="h-9 w-64 bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4 rounded-tl-2xl">Étudiant</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Temps</th>
                                        <th className="px-6 py-4 rounded-tr-2xl text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {attempts.map((attempt) => (
                                        <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold">
                                                        {attempt.studentName.charAt(0)}
                                                    </div>
                                                    {attempt.studentName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-bold",
                                                    attempt.score >= 50 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                )}>
                                                    {attempt.score >= 50 ? "Réussi" : "Échoué"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full", attempt.score >= 80 ? "bg-emerald-500" : attempt.score >= 50 ? "bg-blue-500" : "bg-red-500")}
                                                            style={{ width: `${attempt.score}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold">{attempt.score}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{attempt.timeSpent}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" className="hidden group-hover:inline-flex text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                                                    Détails
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </RoleGuard>
    )
}
