"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    BookOpen,
    AlertCircle,
    Loader2,
    Filter
} from "lucide-react"
import { ClassValidationStatus } from "@/models/enums"

interface ClassData {
    _id: string
    name: string
    academicYear: string
    validationStatus: ClassValidationStatus
    mainTeacher: { _id: string; name: string; email: string }
    level: { name: string; code: string }
    field?: { name: string; code: string }
    specialty?: { name: string; code: string }
    students: any[]
    schoolName: string
    createdAt: string
}

export default function AdminClassesPage() {
    const { data: session } = useSession()
    const [classes, setClasses] = useState<ClassData[]>([])
    const [schools, setSchools] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<ClassValidationStatus | ''>('')
    const [rejectingClass, setRejectingClass] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    // Fetch classes
    const fetchClasses = async () => {
        setLoading(true)
        try {
            const url = statusFilter
                ? `/api/admin/classes?status=${statusFilter}`
                : '/api/admin/classes'
            const res = await fetch(url)
            const data = await res.json()
            if (data.success) {
                setClasses(data.data)
                setSchools(data.schools)
            }
        } catch (error) {
            console.error("Failed to fetch classes", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClasses()
    }, [statusFilter])

    // Validate a class
    const handleValidate = async (classId: string) => {
        setActionLoading(classId)
        try {
            const res = await fetch(`/api/admin/classes/${classId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'VALIDATE' })
            })
            if (res.ok) {
                await fetchClasses()
            }
        } catch (error) {
            console.error("Failed to validate class", error)
        } finally {
            setActionLoading(null)
        }
    }

    // Reject a class
    const handleReject = async (classId: string) => {
        if (!rejectionReason.trim()) return

        setActionLoading(classId)
        try {
            const res = await fetch(`/api/admin/classes/${classId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'REJECT', reason: rejectionReason })
            })
            if (res.ok) {
                setRejectingClass(null)
                setRejectionReason('')
                await fetchClasses()
            }
        } catch (error) {
            console.error("Failed to reject class", error)
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusBadge = (status: ClassValidationStatus) => {
        switch (status) {
            case ClassValidationStatus.PENDING:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        <Clock className="h-3 w-3" /> En attente
                    </span>
                )
            case ClassValidationStatus.VALIDATED:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3" /> Validée
                    </span>
                )
            case ClassValidationStatus.REJECTED:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        <XCircle className="h-3 w-3" /> Rejetée
                    </span>
                )
        }
    }

    // Count by status
    const pendingCount = classes.filter(c => c.validationStatus === ClassValidationStatus.PENDING).length
    const validatedCount = classes.filter(c => c.validationStatus === ClassValidationStatus.VALIDATED).length
    const rejectedCount = classes.filter(c => c.validationStatus === ClassValidationStatus.REJECTED).length

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Gestion des Classes
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Validez ou rejetez les classes créées par les enseignants de vos établissements.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div
                    onClick={() => setStatusFilter(ClassValidationStatus.PENDING)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${statusFilter === ClassValidationStatus.PENDING
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
                            <p className="text-sm text-gray-500">En attente</p>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter(ClassValidationStatus.VALIDATED)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${statusFilter === ClassValidationStatus.VALIDATED
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{validatedCount}</p>
                            <p className="text-sm text-gray-500">Validées</p>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter(ClassValidationStatus.REJECTED)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${statusFilter === ClassValidationStatus.REJECTED
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{rejectedCount}</p>
                            <p className="text-sm text-gray-500">Rejetées</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                        {statusFilter ? `Filtre: ${statusFilter}` : 'Toutes les classes'}
                    </span>
                    {statusFilter && (
                        <button
                            onClick={() => setStatusFilter('')}
                            className="text-sm text-secondary hover:underline"
                        >
                            Effacer le filtre
                        </button>
                    )}
                </div>
            </div>

            {/* Classes List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            ) : classes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucune classe à afficher.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {classes.map((classData) => (
                        <div
                            key={classData._id}
                            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {classData.name}
                                        </h3>
                                        {getStatusBadge(classData.validationStatus)}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Établissement</span>
                                            <p className="font-medium text-gray-900 dark:text-white">{classData.schoolName}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Enseignant</span>
                                            <p className="font-medium text-gray-900 dark:text-white">{classData.mainTeacher?.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Niveau</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {classData.level?.name} {classData.field ? `- ${classData.field.code}` : ''}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Élèves</span>
                                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                <Users className="h-4 w-4" /> {classData.students?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {classData.validationStatus === ClassValidationStatus.PENDING && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleValidate(classData._id)}
                                            disabled={actionLoading === classData._id}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {actionLoading === classData._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4" />
                                            )}
                                            Valider
                                        </button>
                                        <button
                                            onClick={() => setRejectingClass(classData._id)}
                                            disabled={actionLoading === classData._id}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Rejeter
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Rejection Modal */}
                            {rejectingClass === classData._id && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex items-start gap-3 mb-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-800 dark:text-red-300">Rejeter cette classe</p>
                                            <p className="text-sm text-red-600 dark:text-red-400">Indiquez la raison du rejet pour l'enseignant.</p>
                                        </div>
                                    </div>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Raison du rejet..."
                                        className="w-full p-3 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 mb-3"
                                        rows={2}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setRejectingClass(null)
                                                setRejectionReason('')
                                            }}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={() => handleReject(classData._id)}
                                            disabled={!rejectionReason.trim() || actionLoading === classData._id}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                        >
                                            Confirmer le rejet
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
