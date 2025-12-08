"use client"

/**
 * Teacher Student Profile Page
 * 
 * Comprehensive view for teachers to analyze a specific student:
 * - Performance predictions & risk assessment
 * - Progression trends & weak concepts
 * - Comparison with class peers
 * - Personalized recommendations
 */

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    GraduationCap,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    Target,
    BookOpen,
    Award,
    Brain,
    Clock,
    Activity,
    MessageSquare,
    Send,
    ChevronRight,
    Sparkles,
    BarChart3,
    RefreshCw
} from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/models/enums"
import { StudentAnalytics } from "@/components/analytics/StudentAnalytics"
import { cn } from "@/lib/utils"

interface StudentInfo {
    _id: string
    name: string
    email: string
    image?: string
    studentCode?: string
    createdAt: string
}

interface ClassInfo {
    _id: string
    name: string
    level?: { name: string }
}

export default function TeacherStudentProfilePage() {
    const { data: session } = useSession()
    const router = useRouter()
    const params = useParams()
    const studentId = params?.studentId as string

    const [student, setStudent] = useState<StudentInfo | null>(null)
    const [studentClass, setStudentClass] = useState<ClassInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'notes'>('analytics')

    useEffect(() => {
        if (studentId) {
            fetchStudentData()
        }
    }, [studentId])

    const fetchStudentData = async () => {
        setLoading(true)
        try {
            // Fetch student info
            const res = await fetch(`/api/users/${studentId}`)
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setStudent(data.data)
                }
            }

            // Fetch student's class (from teacher's classes)
            const classRes = await fetch('/api/classes')
            if (classRes.ok) {
                const classData = await classRes.json()
                if (classData.success && classData.data) {
                    // Find class containing this student
                    const foundClass = classData.data.find((c: any) =>
                        c.students?.some((s: any) => s._id === studentId || s === studentId)
                    )
                    if (foundClass) {
                        setStudentClass(foundClass)
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching student data:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR, UserRole.SCHOOL_ADMIN]} fallback={<div className="p-8">Accès refusé.</div>}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Profil Étudiant
                        </h1>
                        <p className="text-sm text-gray-500">
                            Analyse détaillée et suivi de progression
                        </p>
                    </div>
                </div>

                {/* Student Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#3a4794] to-[#2a3575] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#359a53]/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
                            {student?.image ? (
                                <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white/60" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                {student?.name || "Étudiant inconnu"}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
                                {student?.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        {student.email}
                                    </span>
                                )}
                                {student?.studentCode && (
                                    <span className="flex items-center gap-1">
                                        <GraduationCap className="w-4 h-4" />
                                        {student.studentCode}
                                    </span>
                                )}
                                {studentClass && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
                                        <BookOpen className="w-4 h-4" />
                                        {studentClass.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors" title="Envoyer un message">
                                <MessageSquare className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-[#359a53] hover:bg-[#2d8847] rounded-xl transition-colors" title="Envoyer une recommandation">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                    {[
                        { id: 'analytics', label: 'Analyse & Prédictions', icon: BarChart3 },
                        { id: 'history', label: 'Historique', icon: Clock },
                        { id: 'notes', label: 'Notes & Observations', icon: MessageSquare }
                    ].map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors",
                                    activeTab === tab.id
                                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'analytics' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <StudentAnalytics
                            studentId={studentId}
                            classId={studentClass?._id}
                        />
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Historique des Évaluations
                        </h3>
                        <p className="text-gray-500 text-center py-8">
                            L'historique détaillé sera bientôt disponible.
                        </p>
                    </motion.div>
                )}

                {activeTab === 'notes' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-500" />
                            Notes & Observations
                        </h3>
                        <div className="space-y-4">
                            <textarea
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Ajoutez vos observations sur cet étudiant..."
                                rows={4}
                            />
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">
                                Enregistrer la note
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </RoleGuard>
    )
}
