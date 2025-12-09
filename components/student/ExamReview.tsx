"use client"

import { ArrowLeft, CheckCircle, XCircle, Trophy, Clock, Calendar, MessageSquare, HelpCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ExamReviewProps {
    exam: any
    attempt: any
}

interface ResponseData {
    id: string
    attemptId: string
    questionId: string
    selectedOptionId: string
    textResponse: string
    isCorrect: boolean
}

export function ExamReview({ exam, attempt }: ExamReviewProps) {
    // Create maps for responses
    const responsesMap = new Map<string, ResponseData>(
        attempt.responses.map((r: ResponseData) => [r.questionId.toString(), r])
    )

    // Calculate stats - handle different question types
    const totalQuestions = exam.questions.length
    const correctAnswers = exam.questions.filter((q: any) => {
        const response = responsesMap.get(q.id)
        if (!response) return false
        return response.isCorrect
    }).length

    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    // Render question based on type
    const renderQuestionContent = (question: any, response: any) => {
        const questionType = question.type || 'QCM'

        switch (questionType) {
            case 'TRUE_FALSE':
                return renderTrueFalseQuestion(question, response)
            case 'OPEN_QUESTION':
                return renderOpenQuestion(question, response)
            default:
                return renderQCMQuestion(question, response)
        }
    }

    // Render QCM question (multiple choice)
    const renderQCMQuestion = (question: any, response: any) => {
        const selectedOptionId = response?.selectedOptionId

        return (
            <div className="space-y-3">
                {question.options?.map((option: any, optIndex: number) => {
                    const isSelected = option.id === selectedOptionId
                    const isCorrectOption = option.isCorrect

                    return (
                        <div
                            key={option.id}
                            className={cn(
                                "p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
                                isCorrectOption && "bg-green-50 dark:bg-green-900/20 border-green-500",
                                isSelected && !isCorrectOption && "bg-red-50 dark:bg-red-900/20 border-red-500",
                                !isSelected && !isCorrectOption && "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-lg border-2 flex items-center justify-center font-bold text-sm shrink-0",
                                isCorrectOption && "border-green-500 bg-green-500 text-white",
                                isSelected && !isCorrectOption && "border-red-500 bg-red-500 text-white",
                                !isSelected && !isCorrectOption && "border-gray-300 dark:border-gray-600 text-gray-400"
                            )}>
                                {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span className={cn(
                                "flex-1 font-semibold",
                                isCorrectOption && "text-green-700 dark:text-green-300",
                                isSelected && !isCorrectOption && "text-red-700 dark:text-red-300",
                                !isSelected && !isCorrectOption && "text-gray-700 dark:text-gray-300"
                            )}>
                                {option.text}
                            </span>
                            {isCorrectOption && (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                                    <CheckCircle className="h-5 w-5 fill-current" />
                                    Bonne réponse
                                </div>
                            )}
                            {isSelected && !isCorrectOption && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                                    <XCircle className="h-5 w-5 fill-current" />
                                    Votre réponse
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    // Render TRUE_FALSE question
    const renderTrueFalseQuestion = (question: any, response: any) => {
        const correctAnswer = question.correctAnswer // true or false
        const studentAnswer = response?.textResponse?.toLowerCase() === 'true' || response?.selectedOptionId === 'true'
        const hasAnswered = response !== undefined

        const options = [
            { value: true, label: 'Vrai' },
            { value: false, label: 'Faux' }
        ]

        return (
            <div className="space-y-3">
                {options.map((option) => {
                    const isCorrectOption = option.value === correctAnswer
                    const isSelected = hasAnswered && studentAnswer === option.value

                    return (
                        <div
                            key={option.label}
                            className={cn(
                                "p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
                                isCorrectOption && "bg-green-50 dark:bg-green-900/20 border-green-500",
                                isSelected && !isCorrectOption && "bg-red-50 dark:bg-red-900/20 border-red-500",
                                !isSelected && !isCorrectOption && "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold shrink-0",
                                isCorrectOption && "border-green-500 bg-green-500 text-white",
                                isSelected && !isCorrectOption && "border-red-500 bg-red-500 text-white",
                                !isSelected && !isCorrectOption && "border-gray-300 dark:border-gray-600 text-gray-400"
                            )}>
                                {option.value ? '✓' : '✗'}
                            </div>
                            <span className={cn(
                                "flex-1 font-bold text-lg",
                                isCorrectOption && "text-green-700 dark:text-green-300",
                                isSelected && !isCorrectOption && "text-red-700 dark:text-red-300",
                                !isSelected && !isCorrectOption && "text-gray-700 dark:text-gray-300"
                            )}>
                                {option.label}
                            </span>
                            {isCorrectOption && (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                                    <CheckCircle className="h-5 w-5" />
                                    Bonne réponse
                                </div>
                            )}
                            {isSelected && !isCorrectOption && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                                    <XCircle className="h-5 w-5" />
                                    Votre réponse
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    // Render OPEN_QUESTION
    const renderOpenQuestion = (question: any, response: any) => {
        const studentAnswer = response?.textResponse || ''
        const modelAnswer = question.modelAnswer || ''
        const isCorrect = response?.isCorrect

        return (
            <div className="space-y-4">
                {/* Student's Answer */}
                <div className={cn(
                    "p-5 rounded-xl border-2",
                    isCorrect
                        ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                        : "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                )}>
                    <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className={cn(
                            "h-5 w-5",
                            isCorrect ? "text-green-600" : "text-amber-600"
                        )} />
                        <span className={cn(
                            "font-bold",
                            isCorrect ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
                        )}>
                            Votre réponse
                        </span>
                        {isCorrect && (
                            <span className="ml-auto flex items-center gap-1 text-green-600 text-sm font-medium">
                                <CheckCircle className="h-4 w-4" /> Validée
                            </span>
                        )}
                    </div>
                    <p className={cn(
                        "text-gray-700 dark:text-gray-300 whitespace-pre-wrap",
                        !studentAnswer && "italic text-gray-400"
                    )}>
                        {studentAnswer || "Aucune réponse fournie"}
                    </p>
                </div>

                {/* Model Answer */}
                {modelAnswer && (
                    <div className="p-5 rounded-xl border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-3">
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                            <span className="font-bold text-blue-700 dark:text-blue-300">
                                Réponse modèle
                            </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {modelAnswer}
                        </p>
                    </div>
                )}

                {/* Explanation if available */}
                {question.explanation && (
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">💡 Explication</p>
                        <p className="text-purple-600 dark:text-purple-400 text-sm">{question.explanation}</p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/student/history"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{exam.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Révisez vos réponses et voyez les corrections
                    </p>
                </div>
            </div>

            {/* Score Summary */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="h-8 w-8 text-yellow-300" />
                                <h2 className="text-2xl font-bold">Vos Résultats</h2>
                            </div>
                            <div className="flex items-center gap-4 text-indigo-100 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(attempt.submittedAt), "PPP")}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {format(new Date(attempt.submittedAt), "p")}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <p className="text-indigo-100 text-sm font-medium mb-1">Score</p>
                                <p className="text-5xl font-black">{attempt.score}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-indigo-100 text-sm font-medium mb-1">Précision</p>
                                <p className="text-5xl font-black">{percentage}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-indigo-100 text-sm font-medium mb-1">Correct</p>
                                <p className="text-5xl font-black">{correctAnswers}/{totalQuestions}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Révision Question par Question
                </h2>

                {exam.questions.map((question: any, index: number) => {
                    const response = responsesMap.get(question.id)
                    const isCorrect = response?.isCorrect || false
                    const questionType = question.type || 'QCM'

                    // Type badge text
                    const typeLabels: Record<string, string> = {
                        'QCM': 'Choix Multiple',
                        'TRUE_FALSE': 'Vrai / Faux',
                        'OPEN_QUESTION': 'Question Ouverte',
                        'CASE_STUDY': 'Étude de Cas',
                        'MIXED': 'Mixte'
                    }

                    return (
                        <div
                            key={question.id}
                            className={cn(
                                "bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border-2 shadow-lg transition-all",
                                isCorrect
                                    ? "border-green-200 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/10"
                                    : "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10"
                            )}
                        >
                            {/* Question Header */}
                            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white",
                                        isCorrect ? "bg-green-500" : "bg-red-500"
                                    )}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {question.text}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {question.points} {question.points === 1 ? 'point' : 'points'}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                {typeLabels[questionType] || questionType}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm",
                                    isCorrect
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}>
                                    {isCorrect ? (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Correct
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4" />
                                            Incorrect
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Question Image */}
                            {question.imageUrl && (
                                <div className="mb-6 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                    <img
                                        src={question.imageUrl}
                                        alt="Question"
                                        className="w-full h-auto max-h-[400px] object-contain bg-gray-50 dark:bg-gray-900"
                                    />
                                </div>
                            )}

                            {/* Render content based on question type */}
                            {renderQuestionContent(question, response)}

                            {/* Explanation for QCM/TRUE_FALSE */}
                            {questionType !== 'OPEN_QUESTION' && question.explanation && (
                                <div className="mt-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">💡 Explication</p>
                                    <p className="text-purple-600 dark:text-purple-400 text-sm">{question.explanation}</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ExamReview

