"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Users, BookOpen, TrendingUp, Calendar, Settings, Search, MoreVertical, Loader2, Edit, Trash2, GraduationCap } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ClassFormModal } from "@/components/classes/ClassFormModal"
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal"
import { StudentInvitationModal } from "@/components/classes/invitations/StudentInvitationModal"
import { Eye, MonitorX } from "lucide-react"

// Mock Data removed - using real stats

export default function ClassDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('overview')
    const [classData, setClassData] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [exams, setExams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Actions State
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        try {
            const [classRes, statsRes, examsRes] = await Promise.all([
                fetch(`/api/classes/${params.classId}`),
                fetch(`/api/classes/${params.classId}/stats`),
                fetch(`/api/classes/${params.classId}/exams`)
            ])

            const classJson = await classRes.json()
            const statsJson = await statsRes.json()
            const examsJson = await examsRes.json()

            if (classJson.success) setClassData(classJson.data)
            if (statsJson.success) setStats(statsJson.data)
            if (examsJson.success) setExams(examsJson.data)

        } catch (error) {
            console.error("Failed to fetch class data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (params.classId) {
            fetchData()
        }
    }, [params.classId])

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/classes/${params.classId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                router.push('/teacher/classes')
            } else {
                alert("Impossible de supprimer la classe")
            }
        } catch (error) {
            console.error("Delete error", error)
        } finally {
            setIsDeleting(false)
        }
    }

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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{classData.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            <span>{classData.school?.name}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                        <span>{classData.academicYear}</span>
                        {classData.field && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full font-medium">
                                    {classData.field.name}
                                </span>
                            </>
                        )}
                        {classData.specialty && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <div className="flex items-center gap-1.5">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>{classData.specialty.name}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
                        title="Modifier"
                    >
                        <Edit className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-xl transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {['overview', 'students', 'exams', 'settings'].map((tab) => (
                    tab === 'students' ? (
                        <button
                            key={tab}
                            onClick={() => setActiveTab('students')}
                            className={`pb-4 px-2 font-medium capitalize transition-colors relative whitespace-nowrap ${activeTab === 'students' ? 'text-secondary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Apprenants
                            {activeTab === 'students' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"
                                />
                            )}
                        </button>
                    ) : (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 font-medium capitalize transition-colors relative whitespace-nowrap ${activeTab === tab
                                ? "text-secondary"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                        >
                            {tab === 'overview' ? 'Vue d\'ensemble' :
                                tab === 'exams' ? 'Examens' : 'Paramètres'}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"
                                />
                            )}
                        </button>
                    )
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Performance des Examens</h3>

                            {stats?.performanceHistory?.length > 0 ? (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.performanceHistory}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                                interval={0}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                                domain={[0, 100]}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(4px)'
                                                }}
                                                cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#8B5CF6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorScore)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
                                    <TrendingUp className="h-12 w-12 mb-3 opacity-20" />
                                    <p>Aucune donnée de performance disponible.</p>
                                    <p className="text-sm">Les résultats apparaîtront une fois les examens complétés.</p>
                                </div>
                            )}
                        </div>

                        {/* Stats Cards */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <TrendingUp className="h-24 w-24 text-green-500" />
                                </div>
                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Moyenne Générale</p>
                                        <div className="flex items-baseline gap-2">
                                            <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {stats?.averageScore || 0}%
                                            </h4>
                                            <span className="text-sm text-gray-500">
                                                ({((stats?.averageScore || 0) / 5).toFixed(1)}/20)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400 font-medium relative z-10 bg-green-50 dark:bg-green-900/20 inline-block px-3 py-1 rounded-full">
                                    Score global de la classe
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users className="h-24 w-24 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de Participation</p>
                                        <h4 className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.attendanceRate || 0}%</h4>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 relative z-10 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stats?.attendanceRate || 0}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 relative z-10">Basé sur les élèves ayant passé au moins un examen.</p>
                            </div>

                            <div className="bg-gradient-to-br from-secondary to-secondary/80 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-white/80 text-sm font-medium mb-1">Nombre d'examens</p>
                                    <h4 className="text-4xl font-bold mb-4">{stats?.examsCount || 0}</h4>
                                    <button onClick={() => router.push('/teacher/exams/create')} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-medium transition-colors">
                                        + Créer un examen
                                    </button>
                                </div>
                                <BookOpen className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10 rotate-12" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Liste des Apprenants ({classData.students?.length || 0})</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-medium hover:bg-secondary/90 transition-colors flex items-center gap-2"
                                >
                                    + Inviter
                                </button>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        placeholder="Rechercher..."
                                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-secondary transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Apprenant</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
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
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.isActive
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                        }`}>
                                                        {student.isActive ? "Actif" : "En attente"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex justify-end gap-2">
                                                    <button
                                                        onClick={() => router.push(`/teacher/classes/${params.classId}/students/${student._id}`)}
                                                        className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                                                        title="Voir performances"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("Voulez-vous vraiment retirer cet élève de la classe ?")) {
                                                                try {
                                                                    const res = await fetch(`/api/classes/${params.classId}/students/${student._id}`, {
                                                                        method: "DELETE"
                                                                    })
                                                                    if (res.ok) {
                                                                        fetchData()
                                                                    } else {
                                                                        alert("Erreur lors de la suppression")
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err)
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Retirer de la classe"
                                                    >
                                                        <MonitorX className="h-4 w-4" />
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
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Examens de la classe</h3>
                            <button
                                onClick={() => router.push('/teacher/exams/create')}
                                className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-medium hover:bg-secondary/90 transition-colors flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Créer un examen
                            </button>
                        </div>

                        {exams.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Aucun examen prévu pour cette classe.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exams.map((exam: any) => (
                                    <div key={exam._id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${exam.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-gray-500'
                                            }`} />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${exam.status === 'PUBLISHED'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {exam.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(exam.startTime).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-1" title={exam.title}>
                                                {exam.title}
                                            </h4>

                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                <BookOpen className="h-4 w-4" />
                                                <span className="line-clamp-1">{exam.subject?.name}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex -space-x-2">
                                                    {/* Placeholder for student avatars who took it? For now abstract */}
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/teacher/exams/${exam._id}`)}
                                                    className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
                                                >
                                                    Voir détails
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* General Settings */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-gray-400" />
                                    Paramètres Généraux
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                    Gérez les informations principales de la classe.
                                </p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom de la classe</label>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{classData.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Année Académique</label>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{classData.academicYear}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Établissement</label>
                                        <p className="text-gray-900 dark:text-white">{classData.school?.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Niveau</label>
                                        <p className="text-gray-900 dark:text-white">
                                            {classData.level?.name} <span className="text-sm text-gray-400">({classData.level?.code})</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Modifier les informations
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20 overflow-hidden">
                            <div className="p-6 border-b border-red-100 dark:border-red-900/20">
                                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <Trash2 className="h-5 w-5" />
                                    Zone de Danger
                                </h3>
                                <p className="text-red-600/70 dark:text-red-400/70 mt-1 text-sm">
                                    Actions irréversibles concernant cette classe.
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Supprimer la classe</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Cela supprimera définitivement la classe et désassociera tous les élèves.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                                    >
                                        Supprimer définitivement
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Modals */}
            {
                classData && (
                    <ClassFormModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        onSuccess={fetchData}
                        initialData={classData}
                    />
                )
            }

            <StudentInvitationModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
            />



            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Supprimer la classe"
                message="Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible et supprimera toutes les données associées."
                confirmText="Supprimer"
                isLoading={isDeleting}
            />
        </div >
    )
}
