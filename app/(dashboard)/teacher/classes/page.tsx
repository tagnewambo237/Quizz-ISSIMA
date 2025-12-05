"use client"

import { useState, useEffect } from "react"
import { Plus, Users, School, BookOpen, Loader2, TrendingUp, Calendar, MoreVertical, Trash2, Edit, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock data for charts (can be replaced with real stats later)
const mockChartData = [
    { value: 65 }, { value: 72 }, { value: 68 }, { value: 75 }, { value: 82 }, { value: 78 }, { value: 85 }
]

export default function TeacherClassesPage() {
    const router = useRouter()
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [schools, setSchools] = useState<any[]>([])
    const [levels, setLevels] = useState<any[]>([])
    
    // Form State
    const [formData, setFormData] = useState({
        name: "",
        school: "",
        level: "",
        academicYear: "2024-2025" // Default
    })
    const [submitting, setSubmitting] = useState(false)

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

    const fetchDependencies = async () => {
        try {
            const [schoolsRes, levelsRes] = await Promise.all([
                fetch("/api/schools"),
                fetch("/api/education-levels")
            ])
            const schoolsData = await schoolsRes.json()
            const levelsData = await levelsRes.json()

            if (schoolsData.success) setSchools(schoolsData.data)
            if (levelsData.success) setLevels(levelsData.data)
        } catch (error) {
            console.error("Failed to fetch dependencies", error)
        }
    }

    useEffect(() => {
        fetchClasses()
        fetchDependencies()
    }, [])

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch("/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setShowCreateModal(false)
                setFormData({ name: "", school: "", level: "", academicYear: "2024-2025" })
                fetchClasses() // Refresh list
            } else {
                alert(data.message || "Failed to create class")
            }
        } catch (error) {
            console.error("Create class error", error)
            alert("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteClass = async (classId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return
        try {
            const res = await fetch(`/api/classes/${classId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                fetchClasses()
            } else {
                alert("Impossible de supprimer la classe")
            }
        } catch (error) {
            console.error("Delete error", error)
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
                             {/* Actions Dropdown (Simplified for now) */}
                             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button 
                                    onClick={() => handleDeleteClass(cls._id)}
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
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {cls.academicYear}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-secondary transition-colors">
                                        {cls.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                                        <School className="h-4 w-4" />
                                        {cls.school?.name || "École inconnue"}
                                    </p>

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
                                                <BookOpen className="h-4 w-4 text-gray-400" />
                                                <span>{cls.level?.name || "N/A"}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Élèves</p>
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <Users className="h-4 w-4 text-gray-400" />
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

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>

                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Créer une classe</h2>
                            
                            <form onSubmit={handleCreateClass} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la classe</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Ex: Terminale C 2"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">École</label>
                                    <select 
                                        required
                                        value={formData.school}
                                        onChange={(e) => setFormData({...formData, school: e.target.value})}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                    >
                                        <option value="">Sélectionner une école</option>
                                        {schools.map(school => (
                                            <option key={school._id} value={school._id}>{school.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Niveau</label>
                                    <select 
                                        required
                                        value={formData.level}
                                        onChange={(e) => setFormData({...formData, level: e.target.value})}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                    >
                                        <option value="">Sélectionner un niveau</option>
                                        {levels.map(level => (
                                            <option key={level._id} value={level._id}>{level.name} ({level.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Année Académique</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.academicYear}
                                        onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Créer"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
