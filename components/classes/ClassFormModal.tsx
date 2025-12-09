"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Save } from "lucide-react"

interface ClassFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialData?: any // If provided, it's edit mode
}

export function ClassFormModal({ isOpen, onClose, onSuccess, initialData }: ClassFormModalProps) {
    const isEditMode = !!(initialData?._id)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Dependencies
    const [schools, setSchools] = useState<any[]>([])
    const [levels, setLevels] = useState<any[]>([])
    const [fields, setFields] = useState<any[]>([])
    const [specialties, setSpecialties] = useState<any[]>([])

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        school: "",
        level: "",
        field: "",
        specialty: "",
        academicYear: "2024-2025"
    })

    // Reset or Load Data
    useEffect(() => {
        if (isOpen) {
            fetchDependencies()
            if (initialData) {
                setFormData({
                    name: initialData.name || "",
                    school: initialData.school?._id || initialData.school || "",
                    level: initialData.level?._id || initialData.level || "",
                    field: initialData.field?._id || initialData.field || "",
                    specialty: initialData.specialty?._id || initialData.specialty || "",
                    academicYear: initialData.academicYear || "2024-2025"
                })
            } else {
                setFormData({
                    name: "",
                    school: "",
                    level: "",
                    field: "",
                    specialty: "",
                    academicYear: "2024-2025"
                })
            }
        }
    }, [isOpen, initialData])

    // Fetch Fields when Level changes (and clear downstream)
    useEffect(() => {
        if (formData.level) {
            fetchFields(formData.level)
        } else {
            setFields([])
            setSpecialties([])
        }
    }, [formData.level])

    // Fetch Specialties when Field changes
    useEffect(() => {
        if (formData.field) {
            // Logic to find specialties for this field (usually filtering fields that have parentField = this field)
            // But if API doesn't support parentField filter, we might need client side filtering or specific endpoint
            // Let's rely on fetchFields logic which hopefully handles "children of specific field" or use the retrieved fields if they contain hierarchy

            // IMPORTANT: If API /api/fields?level=XYZ returns ALL fields for that level, we need to distinguish parents (Filière) from children (Specialty)
            // Or better, fetch specialties specifically. 
            // Let's assume /api/fields can filter by parentField.
            fetchSpecialties(formData.field)
        } else {
            setSpecialties([])
        }
    }, [formData.field])

    const fetchDependencies = async () => {
        setLoading(true)
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
        } finally {
            setLoading(false)
        }
    }

    const fetchFields = async (levelId: string) => {
        try {
            // Fetch fields applicable to this level
            // We assume query param support: /api/fields?level={levelId}
            // And potentially we only want "main" fields (parentField is null/undefined)
            const res = await fetch(`/api/fields?level=${levelId}&isParent=true`)
            const data = await res.json()
            if (data.success) {
                // Determine if we need to filter client-side if API ignores isParent
                // Safe bet: filter client side just in case
                const mainFields = data.data.filter((f: any) => !f.parentField)
                setFields(mainFields)
            }
        } catch (error) {
            console.error("Failed to fetch fields", error)
        }
    }

    const fetchSpecialties = async (parentFieldId: string) => {
        try {
            const res = await fetch(`/api/fields?parentField=${parentFieldId}`)
            const data = await res.json()
            if (data.success) {
                setSpecialties(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch specialties", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const url = isEditMode ? `/api/classes/${initialData._id}` : "/api/classes"
        const method = isEditMode ? "PUT" : "POST"

        // Sanitize payload: convert empty strings to null for optional ObjectId fields
        const payload = {
            ...formData,
            field: formData.field || null,
            specialty: formData.specialty || null
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (data.success) {
                onSuccess()
                onClose()
            } else {
                alert(data.message || "Operation failed")
            }
        } catch (error) {
            console.error("Submit error", error)
            alert("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>

                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                {isEditMode ? "Modifier la classe" : "Créer une classe"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la classe</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Tle C 1"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Année Académique</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.academicYear}
                                            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">École</label>
                                        <select
                                            required
                                            value={formData.school}
                                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                        >
                                            <option value="">Sélectionner</option>
                                            {schools.map(school => (
                                                <option key={school._id} value={school._id}>{school.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Niveau (Cycle)</label>
                                    <select
                                        required
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value, field: "", specialty: "" })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                    >
                                        <option value="">Sélectionner un niveau</option>
                                        {Object.entries(
                                            levels.reduce((acc: any, level: any) => {
                                                const key = `${level.subSystem} - ${level.cycle}`
                                                if (!acc[key]) acc[key] = []
                                                acc[key].push(level)
                                                return acc
                                            }, {})
                                        ).map(([groupName, groupLevels]: [string, any]) => (
                                            <optgroup key={groupName} label={groupName}>
                                                {groupLevels.map((level: any) => (
                                                    <option key={level._id} value={level._id}>
                                                        {level.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                {fields.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filière / Série</label>
                                        <select
                                            value={formData.field}
                                            onChange={(e) => setFormData({ ...formData, field: e.target.value, specialty: "" })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                        >
                                            <option value="">Sélectionner une filière (Optionnel)</option>
                                            {fields.map(field => (
                                                <option key={field._id} value={field._id}>{field.name} ({field.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {specialties.length > 0 &&
                                    (levels.find(l => l._id === formData.level)?.cycle === 'LICENCE' ||
                                        levels.find(l => l._id === formData.level)?.cycle === 'MASTER') && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sous-spécialité</label>
                                            <select
                                                value={formData.specialty}
                                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                            >
                                                <option value="">Sélectionner une spécialité (Optionnel)</option>
                                                {specialties.map(spec => (
                                                    <option key={spec._id} value={spec._id}>{spec.name} ({spec.code})</option>
                                                ))}
                                            </select>
                                        </motion.div>
                                    )}

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                <Save className="h-5 w-5" />
                                                {isEditMode ? "Enregistrer" : "Créer"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
