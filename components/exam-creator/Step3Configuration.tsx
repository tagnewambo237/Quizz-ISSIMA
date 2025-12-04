import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Step3Props {
    data: any
    onUpdate: (data: any) => void
}

export function Step3Configuration({ data, onUpdate }: Step3Props) {
    const [title, setTitle] = useState(data.title || "")
    const [description, setDescription] = useState(data.description || "")
    const [duration, setDuration] = useState(data.duration || 60)
    const [startTime, setStartTime] = useState(data.startTime || "")
    const [endTime, setEndTime] = useState(data.endTime || "")
    const [closeMode, setCloseMode] = useState(data.closeMode || "MANUAL")
    const [pedagogicalObjective, setPedagogicalObjective] = useState(data.pedagogicalObjective || "FORMATIVE")
    const [evaluationType, setEvaluationType] = useState(data.evaluationType || "QCM")
    const [difficultyLevel, setDifficultyLevel] = useState(data.difficultyLevel || "MEDIUM")

    // Anti-cheat settings
    const [antiCheatEnabled, setAntiCheatEnabled] = useState(data.config?.antiCheat?.fullscreenRequired || false)
    const [disableCopyPaste, setDisableCopyPaste] = useState(data.config?.antiCheat?.disableCopyPaste || false)
    const [trackTabSwitches, setTrackTabSwitches] = useState(data.config?.antiCheat?.trackTabSwitches || false)

    useEffect(() => {
        onUpdate({
            title,
            description,
            duration,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined,
            closeMode,
            pedagogicalObjective,
            evaluationType,
            difficultyLevel,
            config: {
                shuffleQuestions: false,
                shuffleOptions: false,
                showResultsImmediately: true,
                allowReview: true,
                passingScore: 50,
                maxAttempts: 1,
                timeBetweenAttempts: 0,
                antiCheat: {
                    fullscreenRequired: antiCheatEnabled,
                    disableCopyPaste,
                    trackTabSwitches,
                    blockRightClick: disableCopyPaste,
                    preventScreenshot: false,
                    webcamRequired: false,
                    maxTabSwitches: 3,
                }
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, description, duration, startTime, endTime, closeMode, pedagogicalObjective, evaluationType, difficultyLevel, antiCheatEnabled, disableCopyPaste, trackTabSwitches])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Configuration de l'Examen</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Définissez les paramètres de votre examen
                </p>
            </div>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations de Base</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Titre *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            placeholder="Ex: Contrôle de Mathématiques - Chapitre 3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            rows={3}
                            placeholder="Description de l'examen..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Timing */}
            <Card>
                <CardHeader>
                    <CardTitle>Planification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Durée (minutes) *</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            min="1"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date de début</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date de fin</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pedagogical Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Paramètres Pédagogiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Objectif Pédagogique</label>
                            <select
                                value={pedagogicalObjective}
                                onChange={(e) => setPedagogicalObjective(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                <option value="FORMATIVE">Formatif</option>
                                <option value="SUMMATIVE">Sommatif</option>
                                <option value="DIAGNOSTIC">Diagnostic</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type d'Évaluation</label>
                            <select
                                value={evaluationType}
                                onChange={(e) => setEvaluationType(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                <option value="QCM">QCM</option>
                                <option value="TRUE_FALSE">Vrai/Faux</option>
                                <option value="OPEN_ENDED">Réponse Ouverte</option>
                                <option value="MIXED">Mixte</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Niveau de Difficulté</label>
                        <select
                            value={difficultyLevel}
                            onChange={(e) => setDifficultyLevel(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            <option value="EASY">Facile</option>
                            <option value="MEDIUM">Moyen</option>
                            <option value="HARD">Difficile</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Anti-Cheat */}
            <Card>
                <CardHeader>
                    <CardTitle>Sécurité Anti-Triche</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={antiCheatEnabled}
                            onChange={(e) => setAntiCheatEnabled(e.target.checked)}
                            className="rounded"
                        />
                        <span>Exiger le mode plein écran</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={disableCopyPaste}
                            onChange={(e) => setDisableCopyPaste(e.target.checked)}
                            className="rounded"
                        />
                        <span>Désactiver copier-coller et clic droit</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={trackTabSwitches}
                            onChange={(e) => setTrackTabSwitches(e.target.checked)}
                            className="rounded"
                        />
                        <span>Suivre les changements d'onglet</span>
                    </label>
                </CardContent>
            </Card>
        </div>
    )
}
