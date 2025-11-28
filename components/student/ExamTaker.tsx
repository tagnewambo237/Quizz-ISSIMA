"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { differenceInSeconds } from "date-fns"
import { playSound } from "@/lib/sounds"

interface ExamTakerProps {
    exam: any
    attempt: any
}

export function ExamTaker({ exam, attempt }: ExamTakerProps) {
    const router = useRouter()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [timeLeft, setTimeLeft] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [saving, setSaving] = useState(false)

    // Initialize answers from existing responses
    useEffect(() => {
        const initialAnswers: Record<string, string> = {}
        attempt.responses.forEach((r: any) => {
            initialAnswers[r.questionId] = r.selectedOptionId
        })
        setAnswers(initialAnswers)
    }, [attempt.responses])

    // Timer logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            const expires = new Date(attempt.expiresAt)
            const diff = differenceInSeconds(expires, now)

            if (diff <= 0) {
                clearInterval(interval)
                handleSubmit(true) // Auto submit
            } else {
                setTimeLeft(diff)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [attempt.expiresAt])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, "0")}`
    }

    const handleOptionSelect = async (questionId: string, optionId: string) => {
        // Play selection sound
        playSound('select')

        setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
        setSaving(true)

        try {
            await fetch("/api/attempts/answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    attemptId: attempt.id,
                    questionId,
                    selectedOptionId: optionId,
                }),
            })
        } catch (error) {
            console.error("Failed to save answer", error)
        } finally {
            setSaving(false)
        }
    }

    const handleSubmit = useCallback(async (auto = false) => {
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            // Play completion sound
            if (!auto) {
                playSound('complete')
            }

            await fetch("/api/attempts/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attemptId: attempt.id }),
            })

            router.push(`/student/exam/${exam.id}/result`)
        } catch (error) {
            console.error("Failed to submit", error)
            setIsSubmitting(false)
        }
    }, [attempt.id, exam.id, isSubmitting, router])

    const currentQuestion = exam.questions[currentQuestionIndex]
    const progress = ((Object.keys(answers).length) / exam.questions.length) * 100
    const isLastQuestion = currentQuestionIndex === exam.questions.length - 1

    const [isWindowFocused, setIsWindowFocused] = useState(true)

    // Anti-cheating: Block copy/paste/right-click and detect focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsWindowFocused(false)
                // Optional: You could auto-submit or log this event
            } else {
                setIsWindowFocused(true)
            }
        }

        const handleContextMenu = (e: MouseEvent) => e.preventDefault()

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault()
                alert("Screenshots are disabled during the exam.")
                return
            }

            // Block Copy/Paste shortcuts (Ctrl+C, Ctrl+V, Cmd+C, Cmd+V, etc.)
            if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'p', 's'].includes(e.key.toLowerCase())) {
                e.preventDefault()
                return
            }
        }

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault()
            return false
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        document.addEventListener("contextmenu", handleContextMenu)
        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("copy", handleCopy)
        document.addEventListener("cut", handleCopy)
        document.addEventListener("paste", handleCopy)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            document.removeEventListener("contextmenu", handleContextMenu)
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("copy", handleCopy)
            document.removeEventListener("cut", handleCopy)
            document.removeEventListener("paste", handleCopy)
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col select-none">
            {/* Security Overlay */}
            <AnimatePresence>
                {!isWindowFocused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
                    >
                        <div className="bg-red-500/20 p-6 rounded-full mb-6 animate-pulse">
                            <AlertCircle className="h-20 w-20 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">Exam Paused</h2>
                        <p className="text-xl text-gray-300 max-w-md">
                            Please return to the exam window immediately. Leaving the exam page is not allowed.
                        </p>
                        <button
                            onClick={() => setIsWindowFocused(true)}
                            className="mt-8 bg-white text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                            Resume Exam
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
                    {/* Progress Bar Container */}
                    <div className="flex-1 max-w-2xl flex items-center gap-4">
                        <button
                            onClick={() => router.push('/student')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            <span className="text-xl md:text-2xl">✕</span>
                        </button>
                        <div className="h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex-1 overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute top-1 right-2 w-full h-1 bg-white/30 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-mono font-bold text-base md:text-lg shadow-sm border-2",
                            timeLeft < 300
                                ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                                : "bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                        )}>
                            <Clock className="h-4 w-4 md:h-5 md:w-5" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col justify-center min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-160px)]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-full"
                    >
                        <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 leading-tight">
                            {currentQuestion.text}
                        </h2>

                        {currentQuestion.imageUrl && (
                            <div className="mb-6 md:mb-8 rounded-3xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 shadow-lg">
                                <img
                                    src={currentQuestion.imageUrl}
                                    alt="Question Image"
                                    className="w-full h-auto max-h-[300px] md:max-h-[400px] object-contain bg-gray-50 dark:bg-gray-800"
                                />
                            </div>
                        )}

                        <div className="grid gap-3 md:gap-4">
                            {currentQuestion.options.map((option: any, idx: number) => {
                                const isSelected = answers[currentQuestion.id] === option.id
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                                        className={cn(
                                            "w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all flex items-center gap-3 md:gap-4 group relative overflow-hidden",
                                            isSelected
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-[0_4px_0_0_#3b82f6] translate-y-[-2px]"
                                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 shadow-[0_4px_0_0_rgb(0,0,0,0.05)] active:shadow-none active:translate-y-[2px]"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 font-bold text-sm transition-colors",
                                            isSelected
                                                ? "border-blue-500 bg-blue-500 text-white"
                                                : "border-gray-300 dark:border-gray-600 text-gray-400 group-hover:border-gray-400"
                                        )}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="font-semibold text-base md:text-lg">{option.text}</span>

                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500"
                                            >
                                                <CheckCircle className="h-6 w-6 fill-current" />
                                            </motion.div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            <footer className={cn(
                "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-gray-100 dark:border-gray-700 p-3 md:p-4 transition-transform duration-300 z-20",
                answers[currentQuestion.id] ? "translate-y-0" : "translate-y-0"
            )}>
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={() => setCurrentQuestionIndex((p) => Math.max(0, p - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-3 md:px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase tracking-wide text-sm md:text-base"
                    >
                        Previous
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 md:px-8 rounded-2xl font-black text-base md:text-lg shadow-[0_4px_0_0_#15803d] hover:shadow-[0_2px_0_0_#15803d] active:shadow-none active:translate-y-[2px] transition-all uppercase tracking-wide flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    Finish <span className="hidden md:inline">Exam</span> <CheckCircle className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex((p) => Math.min(exam.questions.length - 1, p + 1))}
                            className={cn(
                                "px-6 py-3 md:px-8 rounded-2xl font-black text-base md:text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[2px] transition-all uppercase tracking-wide flex items-center gap-2",
                                answers[currentQuestion.id]
                                    ? "bg-green-500 hover:bg-green-600 text-white shadow-[0_4px_0_0_#15803d] hover:shadow-[0_2px_0_0_#15803d]"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                            )}
                        >
                            Next <ChevronRight className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </footer>
        </div>
    )
}
