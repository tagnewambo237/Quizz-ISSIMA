"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
    Users, BookOpen, GraduationCap, Trophy, TrendingUp,
    Calendar, ChevronRight, Loader2, School
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ClassInfo {
    id: string
    name: string
    schoolName: string
    schoolLogo?: string
    level: string
    field?: string
    mainTeacher: {
        name: string
    }
    studentCount: number
    academicYear: string
    myRank?: number
    myAverage?: number
}

export default function StudentClassesPage() {
    const { data: session } = useSession()
    const [classes, setClasses] = useState<ClassInfo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user?.id) {
            fetchClasses()
        }
    }, [session])

    const fetchClasses = async () => {
        try {
            const res = await fetch('/api/student/classes')
            const data = await res.json()
            if (data.success) {
                setClasses(data.classes || [])
            }
        } catch (error) {
            console.error('Error fetching classes:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                        Mes Classes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Toutes les classes où vous êtes inscrit
                    </p>
                </div>
            </div>

            {/* Classes List */}
            {classes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Aucune classe
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Vous n'êtes inscrit dans aucune classe pour le moment.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {classes.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start gap-4">
                                {/* School Logo */}
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                                    {cls.schoolLogo ? (
                                        <img
                                            src={cls.schoolLogo}
                                            alt={cls.schoolName}
                                            className="h-full w-full object-cover rounded-2xl"
                                        />
                                    ) : (
                                        <School className="h-8 w-8 text-white" />
                                    )}
                                </div>

                                {/* Class Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                            {cls.name}
                                        </h3>
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                            {cls.academicYear}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {cls.schoolName}
                                    </p>

                                    {/* Details */}
                                    <div className="flex flex-wrap gap-4 mt-3">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                            <span>{cls.level}</span>
                                            {cls.field && <span>• {cls.field}</span>}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                            <Users className="h-4 w-4 text-secondary" />
                                            <span>{cls.studentCount} élèves</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                            <BookOpen className="h-4 w-4 text-green-500" />
                                            <span>Prof: {cls.mainTeacher.name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats & Actions */}
                                <div className="flex flex-col items-end gap-2">
                                    {cls.myRank && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                            <Trophy className="h-4 w-4 text-yellow-500" />
                                            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                                                #{cls.myRank}
                                            </span>
                                        </div>
                                    )}
                                    {cls.myAverage !== undefined && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <span className="font-bold text-green-600 dark:text-green-400">
                                                {Math.round(cls.myAverage)}%
                                            </span>
                                        </div>
                                    )}
                                    <Link
                                        href={`/student/classes/${cls.id}`}
                                        className="flex items-center gap-1 text-sm text-primary hover:underline font-medium mt-2"
                                    >
                                        Voir détails
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">💡 Saviez-vous ?</h3>
                <p className="text-gray-300 text-sm">
                    Vous pouvez être inscrit dans plusieurs classes de différentes écoles.
                    Vos performances sont suivies séparément pour chaque classe, mais votre XP
                    et vos badges s'accumulent globalement.
                </p>
            </div>
        </div>
    )
}
