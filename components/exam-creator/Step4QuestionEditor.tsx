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

interface OpenQuestionKeyword {
    word: string
    weight: number
    required: boolean
    synonyms?: string[]
}

interface OpenQuestionConfig {
    gradingMode?: 'keywords' | 'semantic' | 'manual' | 'hybrid'
    keywords?: OpenQuestionKeyword[]
    semanticThreshold?: number
    minLength?: number
    maxLength?: number
    caseSensitive?: boolean
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
    openQuestionConfig?: OpenQuestionConfig // Advanced config for Open Question
    allowMultipleAnswers?: boolean // For QCM with multiple correct answers
    feedback?: string // General feedback for the question
}

interface Option {
    id: string
    text: string
    isCorrect: boolean
    feedback?: string // Explanation for why this answer is correct/incorrect
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
            modelAnswer: defaultType === EvaluationType.OPEN_QUESTION ? "" : undefined,
            openQuestionConfig: defaultType === EvaluationType.OPEN_QUESTION ? {
                gradingMode: 'hybrid',
                keywords: [],
                semanticThreshold: 0.7,
                caseSensitive: false
            } : undefined
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
                        return { ...base, options: [{ id: crypto.randomUUID(), text: "", isCorrect: false }, { id: crypto.randomUUID(), text: "", isCorrect: false }], correctAnswer: undefined, modelAnswer: undefined, openQuestionConfig: undefined }
                    }
                    if (updates.type === EvaluationType.TRUE_FALSE) {
                        return { ...base, options: undefined, correctAnswer: true, modelAnswer: undefined, openQuestionConfig: undefined }
                    }
                    if (updates.type === EvaluationType.OPEN_QUESTION) {
                        return {
                            ...base,
                            options: undefined,
                            correctAnswer: undefined,
                            modelAnswer: "",
                            openQuestionConfig: {
                                gradingMode: 'hybrid',
                                keywords: [],
                                semanticThreshold: 0.7,
                                caseSensitive: false
                            }
                        }
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
                                key={q.id || `question-${index}`}
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
                                    <div className="space-y-4">
                                        {/* Multi-answer toggle */}
                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Réponses multiples</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">Autoriser plusieurs bonnes réponses</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => updateQuestion(activeQuestion.id, { allowMultipleAnswers: !activeQuestion.allowMultipleAnswers })}
                                                className={cn(
                                                    "w-11 h-6 rounded-full p-0.5 transition-colors",
                                                    activeQuestion.allowMultipleAnswers ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                                                )}
                                            >
                                                <motion.div
                                                    className="w-5 h-5 rounded-full bg-white shadow-sm"
                                                    animate={{ x: activeQuestion.allowMultipleAnswers ? 20 : 0 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            </button>
                                        </div>

                                        {/* Options */}
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {activeQuestion.options?.map((option, idx) => (
                                                    <motion.div
                                                        key={option.id}
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-2"
                                                    >
                                                        <div className="flex items-center gap-3 group">
                                                            <div className={cn(
                                                                "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm transition-colors",
                                                                option.isCorrect
                                                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                                            )}>
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
                                                                        onClick={() => {
                                                                            if (!activeQuestion.allowMultipleAnswers) {
                                                                                // Single answer mode: uncheck others
                                                                                const newOptions = activeQuestion.options?.map(opt => ({
                                                                                    ...opt,
                                                                                    isCorrect: opt.id === option.id ? !option.isCorrect : false
                                                                                }))
                                                                                updateQuestion(activeQuestion.id, { options: newOptions })
                                                                            } else {
                                                                                updateOption(activeQuestion.id, option.id, { isCorrect: !option.isCorrect })
                                                                            }
                                                                        }}
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
                                                        </div>

                                                        {/* Feedback field for this option */}
                                                        <div className="ml-11 mr-10">
                                                            <input
                                                                value={option.feedback || ""}
                                                                onChange={(e) => updateOption(activeQuestion.id, option.id, { feedback: e.target.value })}
                                                                placeholder={option.isCorrect ? "💡 Feedback: Pourquoi c'est correct..." : "💡 Feedback: Pourquoi c'est incorrect..."}
                                                                className="w-full h-8 px-3 text-xs rounded-md border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none placeholder:text-gray-400"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => addOption(activeQuestion.id)}
                                            className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Ajouter une option
                                        </Button>

                                        {/* Correct answers count indicator */}
                                        {activeQuestion.options && (
                                            <div className="text-xs text-center text-gray-500">
                                                {activeQuestion.options.filter(o => o.isCorrect).length === 0 && (
                                                    <span className="text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> Aucune réponse correcte sélectionnée
                                                    </span>
                                                )}
                                                {activeQuestion.options.filter(o => o.isCorrect).length > 0 && (
                                                    <span className="text-green-600 dark:text-green-400">
                                                        ✓ {activeQuestion.options.filter(o => o.isCorrect).length} réponse(s) correcte(s)
                                                    </span>
                                                )}
                                            </div>
                                        )}
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

                                {/* Open Question Editor - Hybrid Mode */}
                                {activeQuestion.type === EvaluationType.OPEN_QUESTION && (
                                    <div className="space-y-6">
                                        {/* AI Banner */}
                                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                                            <div className="relative flex items-start gap-4">
                                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                                        <path d="M2 17l10 5 10-5" />
                                                        <path d="M2 12l10 5 10-5" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold">Correction Intelligente par IA</h3>
                                                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                                                            Hybride
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-white/80">
                                                        Combinez l'analyse sémantique par intelligence artificielle avec des mots-clés
                                                        pour une correction automatique précise et équitable.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Grading Mode Selector */}
                                        <div className="grid grid-cols-4 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                            {[
                                                { id: 'hybrid', label: 'Hybride', icon: '🔀', desc: 'IA + Mots-clés' },
                                                { id: 'semantic', label: 'IA Seule', icon: '🧠', desc: 'Analyse sémantique' },
                                                { id: 'keywords', label: 'Mots-clés', icon: '🏷️', desc: 'Correspondance exacte' },
                                                { id: 'manual', label: 'Manuelle', icon: '✍️', desc: 'Correction humaine' },
                                            ].map((mode) => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => updateQuestion(activeQuestion.id, {
                                                        openQuestionConfig: {
                                                            ...activeQuestion.openQuestionConfig,
                                                            gradingMode: mode.id as any
                                                        }
                                                    })}
                                                    className={cn(
                                                        "p-3 rounded-lg text-center transition-all",
                                                        (activeQuestion.openQuestionConfig?.gradingMode || 'hybrid') === mode.id
                                                            ? "bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-white"
                                                            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                                    )}
                                                >
                                                    <span className="text-xl mb-1 block">{mode.icon}</span>
                                                    <span className="text-xs font-bold block">{mode.label}</span>
                                                    <span className="text-[10px] text-gray-400 block">{mode.desc}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Model Answer */}
                                        <div className="space-y-3 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                </div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Réponse Modèle</label>
                                                <span className="text-xs text-gray-400">(Référence pour l'IA)</span>
                                            </div>
                                            <textarea
                                                value={activeQuestion.modelAnswer || ""}
                                                onChange={(e) => updateQuestion(activeQuestion.id, { modelAnswer: e.target.value })}
                                                placeholder="Entrez la réponse idéale que vous attendez de l'apprenant..."
                                                className="w-full min-h-[100px] p-4 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            />
                                        </div>

                                        {/* Semantic (AI) Settings */}
                                        {['hybrid', 'semantic'].includes(activeQuestion.openQuestionConfig?.gradingMode || 'hybrid') && (
                                            <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-xl">
                                                        <svg className="w-5 h-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <path d="M12 16v-4M12 8h.01" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-violet-900 dark:text-violet-100">Configuration IA</h4>
                                                        <p className="text-xs text-violet-600 dark:text-violet-400">Analyse sémantique par intelligence artificielle</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="text-sm font-medium text-violet-800 dark:text-violet-200">
                                                                Seuil de similarité: {Math.round((activeQuestion.openQuestionConfig?.semanticThreshold || 0.7) * 100)}%
                                                            </label>
                                                            <span className="text-xs text-violet-500">
                                                                {(activeQuestion.openQuestionConfig?.semanticThreshold || 0.7) >= 0.8 ? '🎯 Strict' :
                                                                    (activeQuestion.openQuestionConfig?.semanticThreshold || 0.7) >= 0.6 ? '⚖️ Équilibré' : '🌊 Flexible'}
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0.3"
                                                            max="0.95"
                                                            step="0.05"
                                                            value={activeQuestion.openQuestionConfig?.semanticThreshold || 0.7}
                                                            onChange={(e) => updateQuestion(activeQuestion.id, {
                                                                openQuestionConfig: {
                                                                    ...activeQuestion.openQuestionConfig,
                                                                    semanticThreshold: parseFloat(e.target.value)
                                                                }
                                                            })}
                                                            className="w-full h-2 bg-violet-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                                        />
                                                        <div className="flex justify-between text-[10px] text-violet-400 mt-1">
                                                            <span>Flexible (30%)</span>
                                                            <span>Strict (95%)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Keywords Section */}
                                        {['hybrid', 'keywords'].includes(activeQuestion.openQuestionConfig?.gradingMode || 'hybrid') && (
                                            <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                                                            <span className="text-lg">🏷️</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-amber-900 dark:text-amber-100">Mots-clés Attendus</h4>
                                                            <p className="text-xs text-amber-600 dark:text-amber-400">Points bonus pour chaque mot-clé présent</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            const currentKeywords = activeQuestion.openQuestionConfig?.keywords || []
                                                            updateQuestion(activeQuestion.id, {
                                                                openQuestionConfig: {
                                                                    ...activeQuestion.openQuestionConfig,
                                                                    keywords: [...currentKeywords, { word: '', weight: 10, required: false, synonyms: [] }]
                                                                }
                                                            })
                                                        }}
                                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" /> Ajouter
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    {(activeQuestion.openQuestionConfig?.keywords || []).length === 0 ? (
                                                        <div className="text-center py-6 text-amber-600/60">
                                                            <p className="text-sm">Aucun mot-clé défini</p>
                                                            <p className="text-xs">Ajoutez des mots-clés pour améliorer la précision de la correction</p>
                                                        </div>
                                                    ) : (
                                                        (activeQuestion.openQuestionConfig?.keywords || []).map((kw, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-100 dark:border-amber-800">
                                                                <div className="flex-1">
                                                                    <input
                                                                        value={kw.word}
                                                                        onChange={(e) => {
                                                                            const newKeywords = [...(activeQuestion.openQuestionConfig?.keywords || [])]
                                                                            newKeywords[idx] = { ...newKeywords[idx], word: e.target.value }
                                                                            updateQuestion(activeQuestion.id, {
                                                                                openQuestionConfig: {
                                                                                    ...activeQuestion.openQuestionConfig,
                                                                                    keywords: newKeywords
                                                                                }
                                                                            })
                                                                        }}
                                                                        placeholder="Mot-clé..."
                                                                        className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                                    />
                                                                </div>
                                                                <div className="w-20">
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max="100"
                                                                        value={kw.weight}
                                                                        onChange={(e) => {
                                                                            const newKeywords = [...(activeQuestion.openQuestionConfig?.keywords || [])]
                                                                            newKeywords[idx] = { ...newKeywords[idx], weight: parseInt(e.target.value) || 10 }
                                                                            updateQuestion(activeQuestion.id, {
                                                                                openQuestionConfig: {
                                                                                    ...activeQuestion.openQuestionConfig,
                                                                                    keywords: newKeywords
                                                                                }
                                                                            })
                                                                        }}
                                                                        className="w-full h-9 px-2 text-center rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                                                    />
                                                                    <span className="text-[10px] text-gray-400 block text-center">% points</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const newKeywords = [...(activeQuestion.openQuestionConfig?.keywords || [])]
                                                                        newKeywords[idx] = { ...newKeywords[idx], required: !newKeywords[idx].required }
                                                                        updateQuestion(activeQuestion.id, {
                                                                            openQuestionConfig: {
                                                                                ...activeQuestion.openQuestionConfig,
                                                                                keywords: newKeywords
                                                                            }
                                                                        })
                                                                    }}
                                                                    className={cn(
                                                                        "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                                                        kw.required
                                                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                                            : "bg-gray-100 text-gray-500 dark:bg-gray-700"
                                                                    )}
                                                                    title={kw.required ? "Requis pour valider" : "Optionnel (bonus)"}
                                                                >
                                                                    {kw.required ? '⚠️ Requis' : 'Bonus'}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const newKeywords = (activeQuestion.openQuestionConfig?.keywords || []).filter((_, i) => i !== idx)
                                                                        updateQuestion(activeQuestion.id, {
                                                                            openQuestionConfig: {
                                                                                ...activeQuestion.openQuestionConfig,
                                                                                keywords: newKeywords
                                                                            }
                                                                        })
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Manual Mode Info */}
                                        {activeQuestion.openQuestionConfig?.gradingMode === 'manual' && (
                                            <div className="p-5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-xl">
                                                        <span className="text-lg">✍️</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-700 dark:text-gray-200">Correction Manuelle</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Les réponses seront évaluées manuellement par l'enseignant.
                                                            La réponse modèle servira de guide de correction.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Length Constraints */}
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 font-medium block mb-1">
                                                    Longueur min. (caractères)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Aucune limite"
                                                    value={activeQuestion.openQuestionConfig?.minLength || ''}
                                                    onChange={(e) => updateQuestion(activeQuestion.id, {
                                                        openQuestionConfig: {
                                                            ...activeQuestion.openQuestionConfig,
                                                            minLength: parseInt(e.target.value) || undefined
                                                        }
                                                    })}
                                                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 font-medium block mb-1">
                                                    Longueur max. (caractères)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Aucune limite"
                                                    value={activeQuestion.openQuestionConfig?.maxLength || ''}
                                                    onChange={(e) => updateQuestion(activeQuestion.id, {
                                                        openQuestionConfig: {
                                                            ...activeQuestion.openQuestionConfig,
                                                            maxLength: parseInt(e.target.value) || undefined
                                                        }
                                                    })}
                                                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
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
