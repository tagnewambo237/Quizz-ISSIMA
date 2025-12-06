"use client"

import { useState, useEffect } from "react"
import { Plus, Users, School, BookOpen, Loader2, TrendingUp, Calendar, MoreVertical, Trash2, Edit, X, GraduationCap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ClassFormModal } from "@/components/classes/ClassFormModal"
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal"

// Mock data for charts (can be replaced with real stats later)
const mockChartData = [
    { value: 65 }, { value: 72 }, { value: 68 }, { value: 75 }, { value: 82 }, { value: 78 }, { value: 85 }
]

export default function TeacherClassesPage() {
    const router = useRouter()
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Modals State
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [classToEdit, setClassToEdit] = useState<any>(null)
    const [classToDelete, setClassToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchClasses = async () => {
        try {
            const res = await fetch("/api/classes")
            const data = await res.json()
            if (data.success) {
                setClasses(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch classes", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClasses()
    }, [])

    const confirmDelete = async () => {
        if (!classToDelete) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/classes/${classToDelete}`, {
                method: "DELETE"
            })
            if (res.ok) {
                fetchClasses()
                setClassToDelete(null)
            } else {
                alert("Impossible de supprimer la classe")
            }
        } catch (error) {
            console.error("Delete error", error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Classes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez vos classes et suivez leur progression</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 active:scale-95 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Nouvelle Classe
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            ) : classes.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"
                >
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aucune classe</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Commencez par créer votre première classe pour inviter des élèves et assigner des devoirs.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-3 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary/20 transition-colors font-semibold"
                    >
                        Créer une classe
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls, index) => (
                        <motion.div
                            key={cls._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-secondary/20 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Actions Dropdown */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => {
                                        setClassToEdit(cls)
                                        setShowCreateModal(true)
                                    }}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Modifier"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setClassToDelete(cls._id)}
                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <Link href={`/teacher/classes/${cls._id}`}>
                                <div className="cursor-pointer">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-14 w-14 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                            <Users className="h-7 w-7" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                                                {cls.academicYear}
                                            </span>
                                            {cls.field && (
                                                <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 border border-gray-200 dark:border-gray-700 rounded-full">
                                                    {cls.field.code}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-secondary transition-colors">
                                        {cls.name}
                                    </h3>
                                    <div className="space-y-1 mb-6">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <School className="h-4 w-4" />
                                            {cls.school?.name || "École inconnue"}
                                        </p>
                                        {cls.specialty && (
                                            <p className="text-xs text-gray-400 flex items-center gap-2">
                                                <GraduationCap className="h-3 w-3" />
                                                {cls.specialty.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Mini Chart */}
                                    <div className="h-16 mb-6 -mx-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={mockChartData}>
                                                <defs>
                                                    <linearGradient id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#8884d8"
                                                    fillOpacity={1}
                                                    fill={`url(#colorGradient-${index})`}
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Niveau</p>
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <BookOpen className="h-4 w-4" />
                                                <span>{cls.level?.name || "N/A"}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Élèves</p>
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <Users className="h-4 w-4" />
                                                <span>{cls.students?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <ClassFormModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false)
                    setClassToEdit(null)
                }}
                onSuccess={fetchClasses}
                initialData={classToEdit}
            />

            <DeleteConfirmModal
                isOpen={!!classToDelete}
                onClose={() => setClassToDelete(null)}
                onConfirm={confirmDelete}
                title="Supprimer la classe"
                message="Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible et supprimera toutes les données associées (examens, devoirs, etc.)."
                confirmText="Supprimer"
                isLoading={isDeleting}
            />
        </div>
    )
}
