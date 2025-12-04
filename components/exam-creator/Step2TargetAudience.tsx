import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Step2Props {
    data: any
    onUpdate: (data: any) => void
}

export function Step2TargetAudience({ data, onUpdate }: Step2Props) {
    const [fields, setFields] = useState<any[]>([])
    const [competencies, setCompetencies] = useState<any[]>([])

    const [selectedFields, setSelectedFields] = useState<string[]>(data.targetFields || [])
    const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>(data.targetedCompetencies || [])

    // Fetch fields based on selected levels
    useEffect(() => {
        if (data.targetLevels && data.targetLevels.length > 0) {
            fetch(`/api/fields?level=${data.targetLevels[0]}`)
                .then(res => res.json())
                .then(data => setFields(data.data || []))
                .catch(err => console.error(err))
        }
    }, [data.targetLevels])

    // Fetch competencies based on selected subject
    useEffect(() => {
        if (data.subject) {
            fetch(`/api/competencies?subject=${data.subject}`)
                .then(res => res.json())
                .then(data => setCompetencies(data.data || []))
                .catch(err => console.error(err))
        }
    }, [data.subject])

    // Update parent
    useEffect(() => {
        onUpdate({
            targetFields: selectedFields,
            targetedCompetencies: selectedCompetencies,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFields, selectedCompetencies])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Public Cible</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Sélectionnez les filières et compétences ciblées
                </p>
            </div>

            {/* Fields/Series */}
            <Card>
                <CardHeader>
                    <CardTitle>Filières / Séries (Optionnel)</CardTitle>
                </CardHeader>
                <CardContent>
                    {fields.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {fields.map((field) => (
                                <label key={field._id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedFields.includes(field._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedFields([...selectedFields, field._id])
                                            } else {
                                                setSelectedFields(selectedFields.filter(id => id !== field._id))
                                            }
                                        }}
                                        className="rounded"
                                    />
                                    <span>{field.name}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Aucune filière disponible pour ce niveau</p>
                    )}
                </CardContent>
            </Card>

            {/* Competencies */}
            <Card>
                <CardHeader>
                    <CardTitle>Compétences Ciblées (Optionnel)</CardTitle>
                </CardHeader>
                <CardContent>
                    {competencies.length > 0 ? (
                        <div className="space-y-2">
                            {competencies.map((comp) => (
                                <label key={comp._id} className="flex items-start space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedCompetencies.includes(comp._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCompetencies([...selectedCompetencies, comp._id])
                                            } else {
                                                setSelectedCompetencies(selectedCompetencies.filter(id => id !== comp._id))
                                            }
                                        }}
                                        className="rounded mt-1"
                                    />
                                    <div>
                                        <p className="font-medium">{comp.name}</p>
                                        {comp.description && (
                                            <p className="text-sm text-gray-500">{comp.description}</p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Aucune compétence disponible pour cette matière</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
