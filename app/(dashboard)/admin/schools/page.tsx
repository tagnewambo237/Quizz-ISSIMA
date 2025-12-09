"use client"

import { useEffect, useState } from "react"
import { SchoolStatus } from "@/models/enums"
import { Check, X, Loader2, School as SchoolIcon } from "lucide-react"

export default function AdminSchoolsPage() {
    const [schools, setSchools] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPendingSchools = async () => {
        try {
            const res = await fetch("/api/schools?status=PENDING")
            const data = await res.json()
            if (data.success) {
                setSchools(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch schools", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPendingSchools()
    }, [])

    const handleValidation = async (schoolId: string, status: SchoolStatus) => {
        try {
            const res = await fetch(`/api/admin/schools/${schoolId}/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            if (res.ok) {
                // Refresh list
                fetchPendingSchools()
            }
        } catch (error) {
            console.error("Failed to update school status", error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
        )
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Validation des Établissements
            </h1>

            <div className="grid gap-4">
                {schools.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <SchoolIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">Aucun établissement en attente de validation.</p>
                    </div>
                ) : (
                    schools.map((school) => (
                        <div
                            key={school._id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                                    <SchoolIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {school.name}
                                    </h3>
                                    <div className="text-sm text-gray-500 space-x-2">
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                                            {school.type}
                                        </span>
                                        <span>•</span>
                                        <span>{school.address || "Adresse non renseignée"}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Créé par: {school.owner?.name || "Inconnu"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleValidation(school._id, SchoolStatus.REJECTED)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Rejeter"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleValidation(school._id, SchoolStatus.VALIDATED)}
                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                    title="Valider"
                                >
                                    <Check className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
