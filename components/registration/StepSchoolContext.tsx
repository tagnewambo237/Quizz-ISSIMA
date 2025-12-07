"use client"

import { useState, useEffect } from "react"
import { UserRole } from "@/models/enums"
import { Search, School as SchoolIcon, Users, AlertCircle, CheckCircle2 } from "lucide-react"

interface StepSchoolContextProps {
    data: any
    updateData: (data: any) => void
    onNext: () => void
    onBack: () => void
}

export function StepSchoolContext({ data, updateData, onNext, onBack }: StepSchoolContextProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [schools, setSchools] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Determine if we need to filter for partner schools only (School Admin registration)
    const isSchoolAdmin = data.role === UserRole.SCHOOL_ADMIN

    // Search schools - Teachers see all active schools, School Admins see only VALIDATED partner schools
    useEffect(() => {
        const searchSchools = async () => {
            if (!searchQuery) {
                setSchools([])
                return
            }
            setLoading(true)
            try {
                // For School Admins, filter to validated/partner schools only
                const endpoint = isSchoolAdmin
                    ? `/api/schools/public?search=${searchQuery}`
                    : `/api/schools?search=${searchQuery}`

                const res = await fetch(endpoint)
                const result = await res.json()
                if (result.success) {
                    setSchools(result.data)
                }
            } catch (error) {
                console.error("Failed to search schools", error)
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(searchSchools, 500)
        return () => clearTimeout(timeoutId)
    }, [searchQuery, isSchoolAdmin])

    // Fetch classes when school is selected (for students)
    useEffect(() => {
        const fetchClasses = async () => {
            if (data.schoolId && data.role === UserRole.STUDENT) {
                try {
                    const res = await fetch(`/api/schools/${data.schoolId}/classes`)
                    const result = await res.json()
                    if (result.success) {
                        setClasses(result.data)
                    }
                } catch (error) {
                    console.error("Failed to fetch classes", error)
                }
            }
        }
        fetchClasses()
    }, [data.schoolId, data.role])

    const handleSchoolSelect = (schoolId: string) => {
        updateData({ schoolId, newSchoolData: undefined })
    }

    // Get description text based on role
    const getDescriptionText = () => {
        switch (data.role) {
            case UserRole.STUDENT:
                return "Recherchez votre école et sélectionnez votre classe."
            case UserRole.TEACHER:
                return "Recherchez et sélectionnez l'établissement où vous enseignez."
            case UserRole.SCHOOL_ADMIN:
                return "Recherchez votre établissement partenaire. Seuls les établissements validés sont disponibles."
            default:
                return "Sélectionnez votre établissement."
        }
    }

    // Check if can proceed based on role requirements
    const canProceed = () => {
        if (!data.schoolId) return false
        if (data.role === UserRole.STUDENT && !data.classId) return false
        return true
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Votre Établissement
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {getDescriptionText()}
                </p>
            </div>

            {/* Info banner for School Admins */}
            {isSchoolAdmin && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium">Établissements Partenaires</p>
                        <p className="mt-1">Seuls les établissements officiellement validés par QuizLock apparaissent ici. Si votre établissement n'est pas listé, contactez-nous.</p>
                    </div>
                </div>
            )}

            {/* Info banner for Teachers */}
            {data.role === UserRole.TEACHER && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                        <p className="font-medium">Association Établissement</p>
                        <p className="mt-1">Votre association à l'établissement sera en attente de validation par l'administrateur de l'école.</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={isSchoolAdmin ? "Rechercher un établissement partenaire..." : "Rechercher votre école..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none"
                    />
                </div>

                {/* Schools List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {loading && (
                        <div className="text-center py-4 text-gray-500">
                            <div className="animate-spin inline-block w-5 h-5 border-2 border-gray-300 border-t-secondary rounded-full" />
                        </div>
                    )}

                    {!loading && schools.map((school) => (
                        <button
                            key={school._id}
                            onClick={() => handleSchoolSelect(school._id)}
                            className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${data.schoolId === school._id
                                ? "border-secondary bg-secondary/5"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                        >
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                {school.logoUrl ? (
                                    <img src={school.logoUrl} alt="" className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    <SchoolIcon className="h-5 w-5 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">{school.name}</h4>
                                    {school.status === 'VALIDATED' && (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">{school.address || "Adresse non renseignée"}</p>
                            </div>
                            {data.schoolId === school._id && (
                                <div className="text-secondary">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            )}
                        </button>
                    ))}

                    {!loading && searchQuery && schools.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                            Aucune école trouvée.
                        </div>
                    )}
                </div>

                {/* Class Selection (Student only) */}
                {data.role === UserRole.STUDENT && data.schoolId && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Sélectionnez votre classe
                        </h3>
                        <select
                            value={data.classId || ""}
                            onChange={(e) => updateData({ classId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none"
                        >
                            <option value="">Choisir une classe...</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>
                                    {cls.name} ({cls.level?.name})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
                >
                    Retour
                </button>
                <button
                    onClick={onNext}
                    disabled={!canProceed()}
                    className="px-8 py-3 bg-secondary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors"
                >
                    Continuer
                </button>
            </div>
        </div>
    )
}
