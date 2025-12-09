"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Plus, Search, MoreVertical, FileText, Calendar, Layers, ChevronRight, GraduationCap, Clock, Trash2, Edit, ExternalLink, Copy } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function TeacherSyllabusPage() {
    const router = useRouter()
    const [syllabuses, setSyllabuses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeMenu, setActiveMenu] = useState<string | null>(null)

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [syllabusToDelete, setSyllabusToDelete] = useState<string | null>(null)

    useEffect(() => {
        fetchSyllabuses()
    }, [])

    const fetchSyllabuses = async () => {
        try {
            const res = await fetch("/api/syllabus")
            const data = await res.json()
            if (data.success) {
                setSyllabuses(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch syllabuses", error)
            toast.error("Erreur lors du chargement des programmes")
        } finally {
            setLoading(false)
        }
    }

    const handleDuplicate = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            const toastId = toast.loading("Duplication en cours...")
            const res = await fetch(`/api/syllabus/${id}/clone`, {
                method: "POST"
            })
            const data = await res.json()

            if (data.success) {
                toast.success("Programme dupliqué avec succès", { id: toastId })
                setSyllabuses(prev => [data.data, ...prev])
                setActiveMenu(null)
            } else {
                toast.error(data.message || "Erreur lors de la duplication", { id: toastId })
            }
        } catch (error) {
            console.error("Duplicate error", error)
            toast.error("Erreur technique")
        }
    }

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setSyllabusToDelete(id)
        setDeleteModalOpen(true)
        setActiveMenu(null)
    }

    const confirmDelete = async () => {
        if (!syllabusToDelete) return

        try {
            const res = await fetch(`/api/syllabus/${syllabusToDelete}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Programme supprimé avec succès")
                setSyllabuses(prev => prev.filter(s => s._id !== syllabusToDelete))
            } else {
                toast.error("Erreur lors de la suppression")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erreur technique")
        } finally {
            setDeleteModalOpen(false)
            setSyllabusToDelete(null)
        }
    }

    const filteredSyllabuses = syllabuses.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="bg-[#3a4795]/10 dark:bg-[#3a4795]/20 p-2 rounded-xl text-[#3a4795] dark:text-[#5e6cc9]">
                            <BookOpen className="h-8 w-8" />
                        </span>
                        Mes Programmes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        Gérez vos cursus pédagogiques et le suivi de vos classes
                    </p>
                </div>
                <Link href="/teacher/syllabus/create">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3a4795] to-[#359b52] text-white rounded-xl hover:shadow-lg hover:shadow-[#3a4795]/20 active:scale-95 transition-all font-semibold">
                        <Plus className="h-5 w-5" />
                        Nouveau Programme
                    </button>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 max-w-2xl">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-400">
                    <Search className="h-5 w-5" />
                </div>
                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un programme, une matière..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredSyllabuses.map((syllabus, index) => (
                            <motion.div
                                key={syllabus._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-[#3a4795]/30 dark:hover:border-[#3a4795]/50 transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                {/* Card Header */}
                                <div className="p-6 pb-0 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#3a4795]/10 to-[#359b52]/10 dark:from-[#3a4795]/20 dark:to-[#359b52]/20 flex items-center justify-center text-[#3a4795] dark:text-[#5e6cc9] shadow-inner">
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-[#3a4795] dark:text-[#5e6cc9]">
                                                    {syllabus.subject?.name || "Matière"}
                                                </span>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#3a4795] dark:group-hover:text-[#5e6cc9] transition-colors">
                                                    {syllabus.title}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Actions Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setActiveMenu(activeMenu === syllabus._id ? null : syllabus._id)
                                                }}
                                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                            >
                                                <MoreVertical className="h-5 w-5" />
                                            </button>

                                            {activeMenu === syllabus._id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setActiveMenu(null);
                                                        }}
                                                    />
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden py-1">
                                                        <Link href={`/teacher/syllabus/${syllabus._id}`} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                            <ExternalLink className="h-4 w-4" />
                                                            Détails
                                                        </Link>
                                                        <Link href={`/teacher/syllabus/${syllabus._id}/edit`} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                            <Edit className="h-4 w-4" />
                                                            Modifier
                                                        </Link>
                                                        <button
                                                            onClick={(e) => handleDuplicate(syllabus._id, e)}
                                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                            Dupliquer
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteClick(syllabus._id, e)}
                                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                                        {syllabus.description || "Aucune description fournie pour ce programme."}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Layers className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium">Structure</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {syllabus.structure?.chapters?.length || 0} Chapitres
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium">Mise à jour</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {new Date(syllabus.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Link */}
                                <Link
                                    href={`/teacher/syllabus/${syllabus._id}`}
                                    className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-[#3a4795]/10 dark:hover:bg-[#3a4795]/20 transition-colors flex items-center justify-between group/footer"
                                >
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover/footer:text-[#3a4795] dark:group-hover/footer:text-[#5e6cc9] transition-colors">
                                        Voir le programme
                                    </span>
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover/footer:text-[#3a4795] dark:group-hover/footer:text-[#5e6cc9] transform group-hover/footer:translate-x-1 transition-all" />
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* New Card */}
                    <Link href="/teacher/syllabus/create">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full min-h-[300px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-[#3a4795] hover:border-[#3a4795]/50 dark:hover:border-[#3a4795]/50 hover:bg-[#3a4795]/5 dark:hover:bg-[#3a4795]/10 transition-all cursor-pointer group"
                        >
                            <div className="h-16 w-16 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <Plus className="h-8 w-8" />
                            </div>
                            <span className="font-semibold text-lg">Créer un programme</span>
                        </motion.div>
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteModalOpen(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10"
                        >
                            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <Trash2 className="h-8 w-8" />
                            </div>

                            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                                Supprimer le programme ?
                            </h3>
                            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                                Cette action est irréversible. Le programme sera archivé et ne sera plus visible.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
