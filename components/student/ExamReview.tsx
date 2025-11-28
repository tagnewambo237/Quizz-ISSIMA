"use client"

import { ArrowLeft, CheckCircle, XCircle, Trophy, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ExamReviewProps {
    exam: any
    attempt: any
}

export function ExamReview({ exam, attempt }: ExamReviewProps) {
    // Create a map of responses
    const responsesMap = new Map(
        attempt.responses.map((r: any) => [r.questionId.toString(), r.selectedOptionId.toString()])
    )

    // Calculate stats
    const totalQuestions = exam.questions.length
    const correctAnswers = exam.questions.filter((q: any) => {
        const selectedOptionId = responsesMap.get(q.id)
        if (!selectedOptionId) return false
        const correctOption = q.options.find((o: any) => o.isCorrect)
        return correctOption?.id === selectedOptionId
    }).length

    const percentage = Math.round((correctAnswers / totalQuestions) * 100)

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
                        Review your answers and see the correct solutions
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
                                <h2 className="text-2xl font-bold">Your Results</h2>
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
                                <p className="text-indigo-100 text-sm font-medium mb-1">Accuracy</p>
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
                    Question by Question Review
                </h2>

                {exam.questions.map((question: any, index: number) => {
                    const selectedOptionId = responsesMap.get(question.id)
                    const correctOption = question.options.find((o: any) => o.isCorrect)
                    const selectedOption = question.options.find((o: any) => o.id === selectedOptionId)
                    const isCorrect = correctOption?.id === selectedOptionId

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
                            <div className="flex items-start justify-between mb-6">
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
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {question.points} {question.points === 1 ? 'point' : 'points'}
                                        </p>
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

                            {/* Options */}
                            <div className="space-y-3">
                                {question.options.map((option: any, optIndex: number) => {
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
                                                    Correct Answer
                                                </div>
                                            )}
                                            {isSelected && !isCorrectOption && (
                                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                                                    <XCircle className="h-5 w-5 fill-current" />
                                                    Your Answer
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ExamReview
