"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Users, BookOpen, TrendingUp, Calendar, Settings, Search, MoreVertical, Loader2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock Data for charts (keep for now until we have real historical data)
const performanceData = [
    { name: 'Sem 1', score: 65 },
    { name: 'Sem 2', score: 72 },
    { name: 'Sem 3', score: 68 },
    { name: 'Sem 4', score: 75 },
    { name: 'Sem 5', score: 82 },
    { name: 'Sem 6', score: 78 },
]

export default function ClassDetailPage() {
    const params = useParams()
    const [activeTab, setActiveTab] = useState('overview')
    const [classData, setClassData] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, statsRes] = await Promise.all([
                    fetch(`/api/classes/${params.classId}`),
                    fetch(`/api/classes/${params.classId}/stats`)
                ])

                const classJson = await classRes.json()
                const statsJson = await statsRes.json()

                if (classJson.success) setClassData(classJson.data)
                if (statsJson.success) setStats(statsJson.data)

            } catch (error) {
                console.error("Failed to fetch class data", error)
            } finally {
                setLoading(false)
            }
        }

        if (params.classId) {
            fetchData()
        }
    }, [params.classId])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
        )
    }

    if (!classData) {
        return <div className="p-8 text-center">Classe introuvable</div>
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{classData.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {classData.school?.name} • {classData.academicYear}
                    </p>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                    <Settings className="h-6 w-6 text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {['overview', 'students', 'exams', 'settings'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-2 font-medium capitalize transition-colors relative whitespace-nowrap ${activeTab === tab
                            ? "text-secondary"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        {tab === 'overview' ? 'Vue d\'ensemble' :
                            tab === 'students' ? 'Élèves' :
                                tab === 'exams' ? 'Examens' : 'Paramètres'}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Performance Moyenne</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={performanceData}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3a4794" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3a4794" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#3a4794" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Moyenne Classe</p>
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.averageScore || 0}/20</h4>
                                    </div>
                                </div>
                                <div className="text-sm text-green-600 font-medium">+2.5% vs mois dernier</div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Présence</p>
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.attendanceRate || 0}%</h4>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats?.attendanceRate || 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Liste des Élèves ({classData.students?.length || 0})</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    placeholder="Rechercher..."
                                    className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-secondary transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-left">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nom</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Moyenne</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {classData.students?.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Aucun élève dans cette classe
                                            </td>
                                        </tr>
                                    ) : (
                                        classData.students?.map((student: any) => (
                                            <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">
                                                            {student.name?.[0] || "U"}
                                                        </div>
                                                        {student.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{student.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600">
                                                        N/A
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="text-center py-12 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Liste des examens à venir...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
