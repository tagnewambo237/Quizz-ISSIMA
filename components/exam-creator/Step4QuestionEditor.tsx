import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, GripVertical, Check, X, AlertCircle, Copy, Clock, Award, BarChart3, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { EvaluationType, DifficultyLevel } from "@/models/enums"

interface Step4Props {
    data: any
    onUpdate: (data: any) => void
}

interface Question {
    id: string
    type: EvaluationType
    text: string
    points: number
    difficulty: DifficultyLevel
    timeLimit?: number // in seconds
    options?: Option[]
    correctAnswer?: boolean // For True/False
    modelAnswer?: string // For Open Question
}

interface Option {
    id: string
    text: string
    isCorrect: boolean
}

export function Step4QuestionEditor({ data, onUpdate }: Step4Props) {
    const [questions, setQuestions] = useState<Question[]>(data.questions || [])
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)

    // Determine if question type is restricted
    // Handle both 'OPEN_ENDED' (from Step 3 UI) and 'OPEN_QUESTION' (from Enum)
    const getRestrictedType = () => {
        if (!data.evaluationType || data.evaluationType === 'MIXED') return null
        if (data.evaluationType === 'OPEN_ENDED') return EvaluationType.OPEN_QUESTION
        return data.evaluationType as EvaluationType
    }

    const restrictedType = getRestrictedType()

    // Update parent when questions change
    useEffect(() => {
        onUpdate({ questions })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questions])

    const addQuestion = () => {
        const defaultType = restrictedType || EvaluationType.QCM

        const newQuestion: Question = {
            id: crypto.randomUUID(),
            type: defaultType,
            text: "",
            points: 1,
            difficulty: DifficultyLevel.INTERMEDIATE,
            options: defaultType === EvaluationType.QCM ? [
                { id: crypto.randomUUID(), text: "", isCorrect: false },
                { id: crypto.randomUUID(), text: "", isCorrect: false }
            ] : undefined,
            correctAnswer: defaultType === EvaluationType.TRUE_FALSE ? true : undefined,
            modelAnswer: defaultType === EvaluationType.OPEN_QUESTION ? "" : undefined
        }
        setQuestions([...questions, newQuestion])
        setActiveQuestionId(newQuestion.id)
    }

    const removeQuestion = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const newQuestions = questions.filter(q => q.id !== id)
        setQuestions(newQuestions)
        if (activeQuestionId === id) {
            setActiveQuestionId(newQuestions.length > 0 ? newQuestions[0].id : null)
        }
    }

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                // Reset specific fields when type changes
                if (updates.type && updates.type !== q.type) {
                    const base = { ...q, ...updates }
                    if (updates.type === EvaluationType.QCM) {
                        return { ...base, options: [{ id: crypto.randomUUID(), text: "", isCorrect: false }, { id: crypto.randomUUID(), text: "", isCorrect: false }], correctAnswer: undefined, modelAnswer: undefined }
                    }
                    if (updates.type === EvaluationType.TRUE_FALSE) {
                        return { ...base, options: undefined, correctAnswer: true, modelAnswer: undefined }
                    }
                    if (updates.type === EvaluationType.OPEN_QUESTION) {
                        return { ...base, options: undefined, correctAnswer: undefined, modelAnswer: "" }
                    }
                    return base
                }
                return { ...q, ...updates }
            }
            return q
        }))
    }

    const activeQuestion = questions.find(q => q.id === activeQuestionId)

    // QCM Helpers
    const addOption = (questionId: string) => {
        const question = questions.find(q => q.id === questionId)
        if (!question || !question.options) return

        const newOption = { id: crypto.randomUUID(), text: "", isCorrect: false }
        updateQuestion(questionId, { options: [...question.options, newOption] })
    }

    const updateOption = (questionId: string, optionId: string, updates: Partial<Option>) => {
        const question = questions.find(q => q.id === questionId)
        if (!question || !question.options) return

        const newOptions = question.options.map(opt =>
            opt.id === optionId ? { ...opt, ...updates } : opt
        )
        updateQuestion(questionId, { options: newOptions })
    }

    const removeOption = (questionId: string, optionId: string) => {
        const question = questions.find(q => q.id === questionId)
        if (!question || !question.options) return

        updateQuestion(questionId, { options: question.options.filter(opt => opt.id !== optionId) })
    }

    return (
        <div className="h-[calc(100vh-200px)] min-h-[600px] flex flex-col md:flex-row gap-6">
            {/* Sidebar: Question List */}
            <div className="w-full md:w-80 flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">Questions ({questions.length})</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            Total: {questions.reduce((acc, q) => acc + (q.points || 0), 0)} pts
                        </span>
                    </div>

                    <Button
                        onClick={addQuestion}
                        className={cn(
                            "w-full gap-2 transition-all duration-500",
                            questions.length === 0 ? "animate-pulse bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                        )}
                    >
                        <Plus className="w-4 h-4" /> Ajouter une question
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {questions.map((q, index) => (
                            <motion.div
                                key={q.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onClick={() => setActiveQuestionId(q.id)}
                                className={cn(
                                    "group relative p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                                    activeQuestionId === q.id
                                        ? "bg-white dark:bg-gray-800 border-blue-500 shadow-md ring-1 ring-blue-500"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <span className={cn(
                                        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5",
                                        activeQuestionId === q.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                                    )}>
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {q.text || "Nouvelle question"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                {q.type === EvaluationType.QCM ? "QCM" : q.type === EvaluationType.TRUE_FALSE ? "Vrai/Faux" : "Ouverte"}
                                            </span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                                <Award className="w-3 h-3" /> {q.points} pts
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => removeQuestion(q.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {questions.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-sm">Commencez par ajouter votre première question</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main: Active Question Editor */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                {activeQuestion ? (
                    <motion.div
                        key={activeQuestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col h-full"
                    >
                        {/* Editor Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-start justify-between bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex-1 min-w-[200px] space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 uppercase font-bold mb-1.5 block">Type de question</label>
                                        <select
                                            value={activeQuestion.type}
                                            onChange={(e) => updateQuestion(activeQuestion.id, { type: e.target.value as EvaluationType })}
                                            disabled={!!restrictedType}
                                            className={cn(
                                                "w-full h-10 px-3 rounded-md border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                restrictedType && "opacity-70 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                                            )}
                                        >
                                            <option value={EvaluationType.QCM}>QCM (Choix Multiples)</option>
                                            <option value={EvaluationType.TRUE_FALSE}>Vrai ou Faux</option>
                                            <option value={EvaluationType.OPEN_QUESTION}>Question Ouverte</option>
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <label className="text-xs text-gray-500 uppercase font-bold mb-1.5 block">Difficulté</label>
                                        <select
                                            value={activeQuestion.difficulty}
                                            onChange={(e) => updateQuestion(activeQuestion.id, { difficulty: e.target.value as DifficultyLevel })}
                                            className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={DifficultyLevel.BEGINNER}>Débutant</option>
                                            <option value={DifficultyLevel.INTERMEDIATE}>Intermédiaire</option>
                                            <option value={DifficultyLevel.ADVANCED}>Avancé</option>
                                            <option value={DifficultyLevel.EXPERT}>Expert</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 items-end">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold mb-1.5 block">Points</label>
                                    <div className="relative">
                                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            min={1}
                                            value={activeQuestion.points}
                                            onChange={(e) => updateQuestion(activeQuestion.id, { points: parseInt(e.target.value) || 0 })}
                                            className="w-24 h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold mb-1.5 block">
                                        Temps (sec) <span className="text-[10px] font-normal text-gray-400 lowercase">(optionnel)</span>
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            min={0}
                                            placeholder="∞"
                                            value={activeQuestion.timeLimit || ""}
                                            onChange={(e) => updateQuestion(activeQuestion.id, { timeLimit: parseInt(e.target.value) || undefined })}
                                            className="w-24 h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Question Text */}
                            <div className="space-y-2">
                                <label className="text-base font-semibold text-gray-900 dark:text-gray-100">Énoncé de la question</label>
                                <textarea
                                    value={activeQuestion.text}
                                    onChange={(e) => updateQuestion(activeQuestion.id, { text: e.target.value })}
                                    placeholder="Posez votre question ici..."
                                    className="w-full min-h-[100px] text-lg p-4 rounded-md resize-none bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Dynamic Answer Section */}
                            <div className="space-y-4">
                                <label className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    {activeQuestion.type === EvaluationType.QCM ? "Options de réponse" : "Réponse attendue"}
                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                        {activeQuestion.type === EvaluationType.QCM ? "Cochez la/les bonne(s) réponse(s)" : "Définissez la validation"}
                                    </span>
                                </label>

                                {/* QCM Editor */}
                                {activeQuestion.type === EvaluationType.QCM && (
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {activeQuestion.options?.map((option, idx) => (
                                                <motion.div
                                                    key={option.id}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="flex items-center gap-3 group"
                                                >
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold text-sm">
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            value={option.text}
                                                            onChange={(e) => updateOption(activeQuestion.id, option.id, { text: e.target.value })}
                                                            placeholder={`Option ${idx + 1}`}
                                                            className={cn(
                                                                "w-full h-10 px-3 pr-12 rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                                option.isCorrect
                                                                    ? "border-green-500 bg-green-50/50 dark:bg-green-900/10 ring-1 ring-green-500/20"
                                                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                                            )}
                                                        />
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                            <button
                                                                onClick={() => updateOption(activeQuestion.id, option.id, { isCorrect: !option.isCorrect })}
                                                                className={cn(
                                                                    "p-1.5 rounded-md transition-all",
                                                                    option.isCorrect
                                                                        ? "text-green-600 bg-green-100 hover:bg-green-200"
                                                                        : "text-gray-300 hover:text-green-500 hover:bg-gray-100"
                                                                )}
                                                                title={option.isCorrect ? "Marquée comme correcte" : "Marquer comme correcte"}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeOption(activeQuestion.id, option.id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <Button
                                            variant="outline"
                                            onClick={() => addOption(activeQuestion.id)}
                                            className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Ajouter une option
                                        </Button>
                                    </div>
                                )}

                                {/* True/False Editor */}
                                {activeQuestion.type === EvaluationType.TRUE_FALSE && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => updateQuestion(activeQuestion.id, { correctAnswer: true })}
                                            className={cn(
                                                "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                                                activeQuestion.correctAnswer === true
                                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-md"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-green-300 bg-white dark:bg-gray-800"
                                            )}
                                        >
                                            <CheckCircle2 className="w-8 h-8" />
                                            <span className="font-bold text-lg">VRAI</span>
                                        </button>
                                        <button
                                            onClick={() => updateQuestion(activeQuestion.id, { correctAnswer: false })}
                                            className={cn(
                                                "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                                                activeQuestion.correctAnswer === false
                                                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 shadow-md"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-red-300 bg-white dark:bg-gray-800"
                                            )}
                                        >
                                            <X className="w-8 h-8" />
                                            <span className="font-bold text-lg">FAUX</span>
                                        </button>
                                    </div>
                                )}

                                {/* Open Question Editor */}
                                {activeQuestion.type === EvaluationType.OPEN_QUESTION && (
                                    <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Correction Manuelle ou par Mots-clés</p>
                                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                                    Pour une correction automatique, fournissez les mots-clés attendus ou la réponse modèle exacte.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Réponse modèle / Mots-clés</label>
                                            <textarea
                                                value={activeQuestion.modelAnswer || ""}
                                                onChange={(e) => updateQuestion(activeQuestion.id, { modelAnswer: e.target.value })}
                                                placeholder="Entrez la réponse attendue..."
                                                className="w-full min-h-[80px] p-3 rounded-md border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
                            <Settings2 className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Aucune question sélectionnée</h3>
                        <p className="text-center max-w-md">
                            Sélectionnez une question dans la liste de gauche pour l'éditer, ou créez-en une nouvelle.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
