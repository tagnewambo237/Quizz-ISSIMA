import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertCircle } from "lucide-react"

interface Step5Props {
    data: any
}

export function Step5Preview({ data }: Step5Props) {
    const isValid = data.title && data.subject && data.questions && data.questions.length > 0

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Aperçu de l'Examen</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Vérifiez les informations avant de créer l'examen
                </p>
            </div>

            {!isValid && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">Informations manquantes</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Veuillez remplir tous les champs obligatoires (titre, matière, au moins une question)
                        </p>
                    </div>
                </div>
            )}

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations Générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Titre</p>
                            <p className="font-medium">{data.title || "Non défini"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Durée</p>
                            <p className="font-medium">{data.duration || 0} minutes</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Objectif Pédagogique</p>
                            <p className="font-medium">{data.pedagogicalObjective || "Non défini"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Niveau de Difficulté</p>
                            <p className="font-medium">{data.difficultyLevel || "Non défini"}</p>
                        </div>
                    </div>
                    {data.description && (
                        <div>
                            <p className="text-sm text-gray-500">Description</p>
                            <p className="text-sm">{data.description}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Classification */}
            <Card>
                <CardHeader>
                    <CardTitle>Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Sous-Système</p>
                            <p className="font-medium">{data.subSystem || "Non défini"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Matière</p>
                            <p className="font-medium">{data.subject || "Non défini"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Niveaux Cibles</p>
                            <p className="font-medium">{data.targetLevels?.length || 0} niveau(x)</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Unité d'Apprentissage</p>
                            <p className="font-medium">{data.learningUnit || "Non défini"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Questions ({data.questions?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.questions && data.questions.length > 0 ? (
                        <div className="space-y-3">
                            {data.questions.map((q: any, index: number) => (
                                <div key={q.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                    <p className="font-medium">Question {index + 1}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{q.text}</p>
                                    <p className="text-xs text-gray-500 mt-1">{q.points} point(s) - {q.type}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Aucune question ajoutée</p>
                    )}
                </CardContent>
            </Card>

            {/* Anti-Cheat */}
            {data.config?.antiCheat && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sécurité Anti-Triche</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {data.config.antiCheat.fullscreenRequired && (
                            <div className="flex items-center space-x-2 text-green-600">
                                <Check className="h-4 w-4" />
                                <span>Mode plein écran requis</span>
                            </div>
                        )}
                        {data.config.antiCheat.disableCopyPaste && (
                            <div className="flex items-center space-x-2 text-green-600">
                                <Check className="h-4 w-4" />
                                <span>Copier-coller désactivé</span>
                            </div>
                        )}
                        {data.config.antiCheat.trackTabSwitches && (
                            <div className="flex items-center space-x-2 text-green-600">
                                <Check className="h-4 w-4" />
                                <span>Suivi des changements d'onglet</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
