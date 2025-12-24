"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole } from "@/models/enums"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle, Play, Loader2, CheckCircle, Clock, HelpCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Question {
    _id: string
    text: string
    type: string
    points: number
    options: { _id: string; text: string; isCorrect?: boolean }[]
    correctAnswer?: boolean
    modelAnswer?: string
    mediaUrl?: string
    openQuestionConfig?: {
        gradingMode?: 'keywords' | 'semantic' | 'manual' | 'hybrid'
        keywords?: { word: string; weight: number; required: boolean; synonyms?: string[] }[]
        semanticThreshold?: number
        minLength?: number
        maxLength?: number
        caseSensitive?: boolean
    }
}

interface ExamData {
    _id: string
    title: string
    description?: string
    duration: number
    questions?: Question[]
}

export default function ExamPreviewPage() {
    const params = useParams()
    const router = useRouter()
    const [exam, setExam] = useState<ExamData | null>(null)
    const [loading, setLoading] = useState(true)
    const [started, setStarted] = useState(false)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [textAnswers, setTextAnswers] = useState<Record<string, string>>({})
    const [showResults, setShowResults] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        if (params.id) {
            fetchExam()
        }
    }, [params.id])

    useEffect(() => {
        if (started && timeLeft > 0 && !showResults) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleFinish()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [started, timeLeft, showResults])

    const fetchExam = async () => {
        try {
            // Include questions in the response
            const res = await fetch(`/api/exams/v2/${params.id}?includeQuestions=true`)
            const data = await res.json()

            if (data.success && data.data) {
                // Ensure questions array exists
                const examData = {
                    ...data.data,
                    questions: data.data.questions || []
                }
                setExam(examData)
                setTimeLeft(data.data.duration * 60)
            } else {
                toast.error("Examen non trouvé")
            }
        } catch (error) {
            console.error("Error fetching exam:", error)
            toast.error("Erreur de chargement")
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStart = () => {
        setStarted(true)
        toast.info("Mode Preview - Vos réponses ne seront pas enregistrées")
    }

    const handleOptionSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    }

    const handleTrueFalseSelect = (questionId: string, value: boolean) => {
        setAnswers(prev => ({ ...prev, [questionId]: value ? 'true' : 'false' }))
    }

    const handleTextAnswer = (questionId: string, text: string) => {
        setTextAnswers(prev => ({ ...prev, [questionId]: text }))
    }

    // Evaluate open question based on keywords or model answer
    const evaluateOpenQuestion = (studentAnswer: string, question: Question): boolean => {
        const config = question.openQuestionConfig || { gradingMode: 'hybrid' }
        const modelAnswer = (question.modelAnswer || '').toLowerCase().trim()

        // If manual grading mode, always return false (needs teacher review)
        if (config.gradingMode === 'manual') {
            return false
        }

        // Check keywords if available
        if (config.keywords && config.keywords.length > 0) {
            let matchedWeight = 0
            let totalWeight = 0
            let requiredMissing = false

            for (const kw of config.keywords) {
                const word = kw.word.toLowerCase()
                const synonyms = (kw.synonyms || []).map(s => s.toLowerCase())
                const allForms = [word, ...synonyms]

                totalWeight += kw.weight || 10
                const found = allForms.some(form => studentAnswer.includes(form))

                if (found) {
                    matchedWeight += kw.weight || 10
                } else if (kw.required) {
                    requiredMissing = true
                }
            }

            // If a required keyword is missing, fail
            if (requiredMissing) return false

            // Consider correct if at least 50% of keywords matched
            return matchedWeight >= totalWeight * 0.5
        }

        // Fall back to model answer comparison (semantic-like)
        if (modelAnswer) {
            const answerWords = new Set(studentAnswer.split(/\s+/).filter(w => w.length > 2))
            const modelWords = new Set(modelAnswer.split(/\s+/).filter(w => w.length > 2))

            if (modelWords.size === 0) return true // No model answer = accept any

            const intersection = [...answerWords].filter(w => modelWords.has(w)).length
            const similarity = intersection / modelWords.size

            const threshold = config.semanticThreshold || 0.7
            return similarity >= threshold * 0.5 // More lenient for preview
        }

        // If no keywords and no model answer, consider it correct (preview mode)
        return true
    }

    const handleFinish = () => {
        setShowResults(true)
        toast.success("Preview terminée!")
    }

    const calculateScore = () => {
        if (!exam || !exam.questions) return { correct: 0, total: 0, percentage: 0, earnedPoints: 0, totalPoints: 0 }

        let correct = 0
        let totalPoints = 0
        let earnedPoints = 0

        exam.questions.forEach(q => {
            totalPoints += q.points || 1

            if (q.type === 'TRUE_FALSE') {
                const studentAnswer = answers[q._id] === 'true'
                if (studentAnswer === q.correctAnswer) {
                    correct++
                    earnedPoints += q.points || 1
                }
            } else if (q.type === 'OPEN_QUESTION') {
                // Evaluate open question in preview mode
                const studentAnswer = (textAnswers[q._id] || '').toLowerCase().trim()
                if (studentAnswer) {
                    const isCorrect = evaluateOpenQuestion(studentAnswer, q)
                    if (isCorrect) {
                        correct++
                        earnedPoints += q.points || 1
                    }
                }
            } else {
                // QCM
                const selectedOptionId = answers[q._id]
                const correctOption = q.options?.find(o => o.isCorrect)
                if (selectedOptionId && correctOption && selectedOptionId === correctOption._id) {
                    correct++
                    earnedPoints += q.points || 1
                }
            }
        })

        return {
            correct,
            total: exam.questions.length,
            earnedPoints,
            totalPoints,
            percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
        }
    }

    // Render question content based on type
    const renderQuestionContent = (question: Question) => {
        switch (question.type) {
            case 'TRUE_FALSE':
                return (
                    <div className="space-y-3">
                        {[
                            { value: true, label: 'Vrai', icon: '✓' },
                            { value: false, label: 'Faux', icon: '✗' }
                        ].map((option) => (
                            <button
                                key={option.label}
                                onClick={() => handleTrueFalseSelect(question._id, option.value)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border-2 transition-all",
                                    answers[question._id] === (option.value ? 'true' : 'false')
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                                        answers[question._id] === (option.value ? 'true' : 'false')
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                    )}>
                                        {option.icon}
                                    </span>
                                    <span className="flex-1 font-bold text-lg">{option.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )

            case 'OPEN_QUESTION':
                return (
                    <div className="space-y-4">
                        <textarea
                            value={textAnswers[question._id] || ''}
                            onChange={(e) => handleTextAnswer(question._id, e.target.value)}
                            placeholder="Tapez votre réponse ici..."
                            className="w-full h-40 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        {question.modelAnswer && (
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">💡 Réponse attendue (visible en mode preview)</p>
                                <p className="text-blue-600 dark:text-blue-400 text-sm">{question.modelAnswer}</p>
                            </div>
                        )}
                    </div>
                )

            default:
                // QCM
                return (
                    <div className="space-y-3">
                        {(question.options || []).map((option, idx) => (
                            <button
                                key={option._id}
                                onClick={() => handleOptionSelect(question._id, option._id)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border-2 transition-all",
                                    answers[question._id] === option._id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                        answers[question._id] === option._id
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                    )}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="flex-1">{option.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )
        }
    }

    // Type labels for display
    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'QCM': 'Choix Multiple',
            'TRUE_FALSE': 'Vrai / Faux',
            'OPEN_QUESTION': 'Question Ouverte',
            'CASE_STUDY': 'Étude de Cas',
            'MIXED': 'Mixte'
        }
        return labels[type] || type
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!exam) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">Examen non trouvé</p>
                <Link href="/teacher/exams">
                    <Button className="mt-4">Retour aux examens</Button>
                </Link>
            </div>
        )
    }

    // Ensure questions array exists
    const questions = exam.questions || []

    // Results View
    if (showResults) {
        const score = calculateScore()
        return (
            <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Preview Terminée!
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">
                                Voici vos résultats de test
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                                    <p className="text-3xl font-bold text-blue-600">{score.correct}/{score.total}</p>
                                    <p className="text-sm text-gray-500">Bonnes réponses</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4">
                                    <p className="text-3xl font-bold text-emerald-600">{score.percentage}%</p>
                                    <p className="text-sm text-gray-500">Score</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4">
                                    <p className="text-3xl font-bold text-purple-600">{score.earnedPoints}/{score.totalPoints}</p>
                                    <p className="text-sm text-gray-500">Points</p>
                                </div>
                            </div>

                            {/* Review answers */}
                            <div className="text-left space-y-4 mb-8">
                                <h3 className="font-bold text-lg">Récapitulatif</h3>
                                {questions.map((q, idx) => {
                                    let isCorrect = false
                                    let correctAnswerText = "N/A"

                                    if (q.type === 'TRUE_FALSE') {
                                        // For TRUE_FALSE questions
                                        const studentAnswer = answers[q._id] === 'true'
                                        isCorrect = studentAnswer === q.correctAnswer
                                        correctAnswerText = q.correctAnswer ? "Vrai" : "Faux"
                                    } else if (q.type === 'OPEN_QUESTION') {
                                        // Open questions - evaluate with keywords/model answer
                                        const studentAnswer = (textAnswers[q._id] || '').toLowerCase().trim()
                                        isCorrect = studentAnswer ? evaluateOpenQuestion(studentAnswer, q) : false
                                        correctAnswerText = q.modelAnswer || "Réponse libre"
                                    } else {
                                        // QCM
                                        const selectedOptionId = answers[q._id]
                                        const correctOption = (q.options || []).find(o => o.isCorrect)
                                        isCorrect = selectedOptionId === correctOption?._id
                                        correctAnswerText = correctOption?.text || "N/A"
                                    }

                                    return (
                                        <div key={q._id} className={cn(
                                            "p-4 rounded-xl border",
                                            isCorrect ? "border-green-200 bg-green-50 dark:bg-green-900/10" : "border-red-200 bg-red-50 dark:bg-red-900/10"
                                        )}>
                                            <div className="flex items-start gap-3">
                                                <span className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                                    isCorrect ? "bg-green-500" : "bg-red-500"
                                                )}>
                                                    {idx + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{q.text}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Bonne réponse: {correctAnswerText}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowResults(false)
                                        setStarted(false)
                                        setAnswers({})
                                        setCurrentQuestionIndex(0)
                                        setTimeLeft(exam.duration * 60)
                                    }}
                                >
                                    Recommencer
                                </Button>
                                <Link href="/teacher/exams">
                                    <Button>Retour aux examens</Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </RoleGuard>
        )
    }

    // Lobby View (before starting)
    if (!started) {
        return (
            <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
                    <div className="max-w-2xl mx-auto">
                        <Link href="/teacher/exams">
                            <Button variant="ghost" className="mb-6">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Button>
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
                        >
                            {/* Warning Banner */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-4 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="font-semibold text-amber-800 dark:text-amber-200">Mode Preview Enseignant</p>
                                    <p className="text-sm text-amber-600 dark:text-amber-300">Les réponses ne seront pas enregistrées</p>
                                </div>
                            </div>

                            <div className="p-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {exam.title}
                                </h1>
                                {exam.description && (
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        {exam.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Durée</p>
                                            <p className="font-bold">{exam.duration} minutes</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-3">
                                        <HelpCircle className="w-5 h-5 text-purple-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Questions</p>
                                            <p className="font-bold">{questions.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleStart}
                                    className="w-full h-14 text-lg gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    <Play className="w-5 h-5" />
                                    Commencer la Preview
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </RoleGuard>
        )
    }

    // Quiz Taking View
    if (questions.length === 0) {
        return (
            <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
                <div className="min-h-screen flex flex-col items-center justify-center p-8">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Aucune question</h1>
                    <p className="text-gray-500 mb-6">Cet examen n'a pas encore de questions.</p>
                    <Link href="/teacher/exams">
                        <Button>Retour aux examens</Button>
                    </Link>
                </div>
            </RoleGuard>
        )
    }

    const currentQuestion = questions[currentQuestionIndex]

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Timer Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1}/{questions.length}</span>
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all"
                                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold",
                            timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        )}>
                            <Clock className="w-4 h-4" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* Question */}
                <div className="max-w-3xl mx-auto p-8">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                                {currentQuestion.points} point{currentQuestion.points > 1 ? 's' : ''}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium">
                                {getTypeLabel(currentQuestion.type)}
                            </span>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            {currentQuestion.text}
                        </h2>

                        {renderQuestionContent(currentQuestion)}
                    </motion.div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            Précédent
                        </Button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button
                                onClick={handleFinish}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 w-4 h-4" />
                                Terminer
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            >
                                Suivant
                            </Button>
                        )}
                    </div>

                    {/* Question Navigator */}
                    <div className="mt-8 flex flex-wrap gap-2 justify-center">
                        {questions.map((q, idx) => (
                            <button
                                key={q._id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={cn(
                                    "w-10 h-10 rounded-lg font-bold text-sm transition-all",
                                    idx === currentQuestionIndex
                                        ? "bg-blue-500 text-white"
                                        : answers[q._id]
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                )}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
}
