"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Trophy, TrendingUp, Calendar, ArrowLeft, Mail, User, Medal } from "lucide-react"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function StudentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.classId && params.studentId) {
            setLoading(true)
            fetch(`/api/classes/${params.classId}/students/${params.studentId}/stats`)
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(err => console.error("Error loading stats", err))
                .finally(() => setLoading(false))
        }
    }, [params.classId, params.studentId])

    if (loading) return <div className="flex h-96 items-center justify-center">Loading...</div>
    if (!stats) return <div className="flex h-96 items-center justify-center">Student not found</div>

    // Chart Data Preparation
    const chartData = stats.history
        ?.filter((h: any) => h.status === 'COMPLETED')
        .map((h: any) => ({
            name: h.title,
            score: h.score,
            date: new Date(h.date).toLocaleDateString()
        })) || []

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto px-6">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Détails de l'apprenant</h1>
            </div>

            {/* Profile Card & Key Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-secondary text-white text-3xl font-bold flex items-center justify-center mb-4 shadow-lg ring-4 ring-white dark:ring-gray-800">
                            {stats.student?.name?.[0] || "U"}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {stats.student?.name}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-6">
                            <Mail className="h-4 w-4" />
                            <span>{stats.student?.email}</span>
                        </div>

                        {/* Rank Badge */}
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 mb-2">
                            <Medal className="h-5 w-5" />
                            <span>Rang: #{stats.rank} / {stats.totalStudents}</span>
                        </div>
                        <p className="text-sm text-gray-400">Classement général</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-400">Moyenne Générale</span>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {stats.averageScore}<span className="text-xl text-gray-400">/100</span>
                            </p>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-green-500 transition-all duration-1000"
                                    style={{ width: `${stats.averageScore}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-400">Participation</span>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {stats.participationRate}%
                            </p>
                            <p className="text-sm text-gray-500">
                                {stats.examsTaken} examens passés sur {stats.totalExams} disponibles
                            </p>
                        </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6">Évolution des notes</h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#114D5A" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#114D5A" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#114D5A"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed History Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-secondary" />
                        Historique Détaillé
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Examen</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stats.history?.map((exam: any) => (
                                <tr key={exam.examId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {exam.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(exam.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {exam.status === 'COMPLETED' ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">Complété</span>
                                        ) : exam.status === 'MISSED' ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">Manqué</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">En attente</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                        {exam.status === 'COMPLETED' ? `${exam.score}/100` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
