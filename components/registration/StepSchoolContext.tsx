import { useState, useEffect } from "react"
import { UserRole } from "@/models/enums"
import { Search, Plus, School as SchoolIcon, Users } from "lucide-react"

interface StepSchoolContextProps {
    data: any
    updateData: (data: any) => void
    onNext: () => void
    onBack: () => void
}

export function StepSchoolContext({ data, updateData, onNext, onBack }: StepSchoolContextProps) {
    const [mode, setMode] = useState<'SEARCH' | 'CREATE'>(data.newSchoolData ? 'CREATE' : 'SEARCH')
    const [searchQuery, setSearchQuery] = useState("")
    const [schools, setSchools] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Search schools
    useEffect(() => {
        const searchSchools = async () => {
            if (!searchQuery) {
                setSchools([])
                return
            }
            setLoading(true)
            try {
                const res = await fetch(`/api/schools?search=${searchQuery}`)
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
    }, [searchQuery])

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
        if (data.role === UserRole.TEACHER) {
            // Teachers can join immediately (pending validation)
        }
    }

    const handleCreateSchool = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        updateData({
            newSchoolData: {
                ...data.newSchoolData,
                [e.target.name]: e.target.value
            },
            schoolId: undefined
        })
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Votre Établissement
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {data.role === UserRole.STUDENT
                        ? "Recherchez votre école et sélectionnez votre classe."
                        : "Rejoignez un établissement existant ou créez le vôtre."}
                </p>
            </div>

            {/* Toggle Mode (Teacher only) */}
            {data.role === UserRole.TEACHER && (
                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
                    <button
                        onClick={() => setMode('SEARCH')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'SEARCH'
                            ? "bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        Rejoindre une école
                    </button>
                    <button
                        onClick={() => setMode('CREATE')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'CREATE'
                            ? "bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        Créer une école
                    </button>
                </div>
            )}

            {mode === 'SEARCH' ? (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher votre école..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none"
                        />
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {schools.map((school) => (
                            <button
                                key={school._id}
                                onClick={() => handleSchoolSelect(school._id)}
                                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${data.schoolId === school._id
                                    ? "border-secondary bg-secondary/5"
                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                            >
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    {school.logoUrl ? (
                                        <img src={school.logoUrl} alt="" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <SchoolIcon className="h-5 w-5 text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{school.name}</h4>
                                    <p className="text-sm text-gray-500">{school.address || "Adresse non renseignée"}</p>
                                </div>
                            </button>
                        ))}
                        {searchQuery && schools.length === 0 && !loading && (
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
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nom de l'école</label>
                        <input
                            name="name"
                            value={data.newSchoolData?.name || ""}
                            onChange={handleCreateSchool}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none"
                            placeholder="Ex: Lycée Classique de..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            name="type"
                            value={data.newSchoolData?.type || ""}
                            onChange={handleCreateSchool}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none"
                        >
                            <option value="">Sélectionner un type...</option>
                            <option value="PRIMARY">Primaire</option>
                            <option value="SECONDARY">Secondaire (Collège/Lycée)</option>
                            <option value="HIGHER_ED">Supérieur</option>
                            <option value="TRAINING_CENTER">Centre de Formation</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Adresse</label>
                        <input
                            name="address"
                            value={data.newSchoolData?.address || ""}
                            onChange={handleCreateSchool}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none"
                            placeholder="Ville, Quartier..."
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
                >
                    Retour
                </button>
                <button
                    onClick={onNext}
                    disabled={
                        (mode === 'SEARCH' && !data.schoolId) ||
                        (mode === 'SEARCH' && data.role === UserRole.STUDENT && !data.classId) ||
                        (mode === 'CREATE' && (!data.newSchoolData?.name || !data.newSchoolData?.type))
                    }
                    className="px-8 py-3 bg-secondary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors"
                >
                    Continuer
                </button>
            </div>
        </div>
    )
}
