import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface Step4Props {
    data: any
    onUpdate: (data: any) => void
}

interface Question {
    id: string
    text: string
    type: string
    points: number
    options: Array<{ id: string; text: string; isCorrect: boolean }>
}

export function Step4QuestionEditor({ data, onUpdate }: Step4Props) {
    const [questions, setQuestions] = useState<Question[]>(data.questions || [])

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            text: "",
            type: "QCM",
            points: 1,
            options: [
                { id: "1", text: "", isCorrect: false },
                { id: "2", text: "", isCorrect: false },
                { id: "3", text: "", isCorrect: false },
                { id: "4", text: "", isCorrect: false },
            ]
        }
        const updated = [...questions, newQuestion]
        setQuestions(updated)
        onUpdate({ questions: updated })
    }

    const removeQuestion = (id: string) => {
        const updated = questions.filter(q => q.id !== id)
        setQuestions(updated)
        onUpdate({ questions: updated })
    }

    const updateQuestion = (id: string, field: string, value: any) => {
        const updated = questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        )
        setQuestions(updated)
        onUpdate({ questions: updated })
    }

    const updateOption = (questionId: string, optionId: string, field: string, value: any) => {
        const updated = questions.map(q => {
            if (q.id === questionId) {
                const updatedOptions = q.options.map(opt =>
                    opt.id === optionId ? { ...opt, [field]: value } : opt
                )
                return { ...q, options: updatedOptions }
            }
            return q
        })
        setQuestions(updated)
        onUpdate({ questions: updated })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Questions</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Créez les questions de votre examen
                    </p>
                </div>
                <Button onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une Question
                </Button>
            </div>

            {questions.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        Aucune question. Cliquez sur "Ajouter une Question" pour commencer.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {questions.map((question, index) => (
                        <Card key={question.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Question {index + 1}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeQuestion(question.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Question Text */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Énoncé de la question *</label>
                                    <textarea
                                        value={question.text}
                                        onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                        rows={3}
                                        placeholder="Entrez votre question..."
                                        required
                                    />
                                </div>

                                {/* Points */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Points</label>
                                        <input
                                            type="number"
                                            value={question.points}
                                            onChange={(e) => updateQuestion(question.id, "points", parseInt(e.target.value))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type</label>
                                        <select
                                            value={question.type}
                                            onChange={(e) => updateQuestion(question.id, "type", e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                        >
                                            <option value="QCM">QCM</option>
                                            <option value="TRUE_FALSE">Vrai/Faux</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Options */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Options de réponse</label>
                                    <div className="space-y-2">
                                        {question.options.map((option, optIndex) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${question.id}`}
                                                    checked={option.isCorrect}
                                                    onChange={() => {
                                                        // Set all to false first
                                                        question.options.forEach(opt => {
                                                            updateOption(question.id, opt.id, "isCorrect", false)
                                                        })
                                                        // Then set this one to true
                                                        updateOption(question.id, option.id, "isCorrect", true)
                                                    }}
                                                    className="rounded-full"
                                                />
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => updateOption(question.id, option.id, "text", e.target.value)}
                                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                                    placeholder={`Option ${optIndex + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Sélectionnez la bonne réponse en cliquant sur le bouton radio
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
