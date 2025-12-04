import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Step1Props {
    data: any
    onUpdate: (data: any) => void
}

export function Step1Classification({ data, onUpdate }: Step1Props) {
    const [subSystems, setSubSystems] = useState<any[]>([])
    const [levels, setLevels] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [units, setUnits] = useState<any[]>([])

    const [selectedSubSystem, setSelectedSubSystem] = useState(data.subSystem || "")
    const [selectedLevels, setSelectedLevels] = useState<string[]>(data.targetLevels || [])
    const [selectedSubject, setSelectedSubject] = useState(data.subject || "")
    const [selectedUnit, setSelectedUnit] = useState(data.learningUnit || "")

    // Fetch sub-systems on mount
    useEffect(() => {
        // Use actual SubSystem enum values
        setSubSystems([
            { _id: "FRANCOPHONE", name: "Francophone" },
            { _id: "ANGLOPHONE", name: "Anglophone" },
        ])
    }, [])

    // Fetch levels when subsystem changes
    useEffect(() => {
        if (selectedSubSystem) {
            // Simulate API call
            fetch(`/api/education-levels?subSystem=${selectedSubSystem}`)
                .then(res => res.json())
                .then(data => setLevels(data.data || []))
                .catch(err => console.error(err))
        }
    }, [selectedSubSystem])

    // Fetch subjects when levels change
    useEffect(() => {
        if (selectedLevels.length > 0) {
            fetch(`/api/subjects?level=${selectedLevels[0]}`)
                .then(res => res.json())
                .then(data => setSubjects(data.data || []))
                .catch(err => console.error(err))
        }
    }, [selectedLevels])

    // Fetch units when subject changes
    useEffect(() => {
        if (selectedSubject) {
            fetch(`/api/learning-units?subject=${selectedSubject}`)
                .then(res => res.json())
                .then(data => setUnits(data.data || []))
                .catch(err => console.error(err))
        }
    }, [selectedSubject])

    // Update parent component
    useEffect(() => {
        onUpdate({
            subSystem: selectedSubSystem,
            targetLevels: selectedLevels,
            subject: selectedSubject,
            learningUnit: selectedUnit,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubSystem, selectedLevels, selectedSubject, selectedUnit])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Classification Éducative</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Sélectionnez la structure éducative de votre examen
                </p>
            </div>

            {/* SubSystem */}
            <Card>
                <CardHeader>
                    <CardTitle>Sous-Système</CardTitle>
                </CardHeader>
                <CardContent>
                    <select
                        value={selectedSubSystem}
                        onChange={(e) => setSelectedSubSystem(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                        <option value="">Sélectionner un sous-système</option>
                        {subSystems.map((sys) => (
                            <option key={sys._id} value={sys._id}>
                                {sys.name}
                            </option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            {/* Levels */}
            {selectedSubSystem && (
                <Card>
                    <CardHeader>
                        <CardTitle>Niveaux Cibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {levels.map((level) => (
                                <label key={level._id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedLevels.includes(level._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedLevels([...selectedLevels, level._id])
                                            } else {
                                                setSelectedLevels(selectedLevels.filter(id => id !== level._id))
                                            }
                                        }}
                                        className="rounded"
                                    />
                                    <span>{level.name}</span>
                                </label>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Subject */}
            {selectedLevels.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Matière</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            <option value="">Sélectionner une matière</option>
                            {subjects.map((subject) => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </CardContent>
                </Card>
            )}

            {/* Learning Unit */}
            {selectedSubject && (
                <Card>
                    <CardHeader>
                        <CardTitle>Unité d'Apprentissage (Optionnel)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <select
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            <option value="">Sélectionner une unité</option>
                            {units.map((unit) => (
                                <option key={unit._id} value={unit._id}>
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
