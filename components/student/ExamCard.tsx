"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Clock, Star, ArrowRight, CheckCircle, AlertCircle, Key, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { LateCodeModal } from "./LateCodeModal"

interface ExamCardProps {
    exam: any
    status: "upcoming" | "active" | "in_progress" | "completed" | "missed"
}

function StartButton({ examId }: { examId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleClick = () => {
        setLoading(true)
        router.push(`/student/exam/${examId}/lobby`)
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
            {loading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                </>
            ) : (
                <>
                    Start
                    <ArrowRight className="h-5 w-5" />
                </>
            )}
        </button>
    )
}

function ResumeButton({ examId }: { examId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleClick = () => {
        setLoading(true)
        router.push(`/student/exam/${examId}/take`)
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
            {loading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                </>
            ) : (
                <>
                    Resume
                    <ArrowRight className="h-5 w-5" />
                </>
            )}
        </button>
    )
}

export function ExamCard({ exam, status }: ExamCardProps) {
    const [showLateCodeModal, setShowLateCodeModal] = useState(false)
    const attempt = exam.attempts[0]

    return (
        <>
            <div
                className={cn(
                    "group relative bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 transition-all hover:-translate-y-1 hover:shadow-xl",
                    status === 'active' ? 'border-indigo-500 shadow-indigo-500/10' : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-900'
                )}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0",
                            status === 'active' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                    status === 'missed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        )}>
                            {status === 'completed' ? <CheckCircle className="h-8 w-8" /> :
                                status === 'missed' ? <AlertCircle className="h-8 w-8" /> :
                                    exam.title[0]}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{exam.title}</h3>
                                {status === 'active' && (
                                    <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
                                        Live
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-3">
                                {exam.description || "No description provided"}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                                    <Clock className="h-4 w-4" />
                                    {exam.duration}m
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                                    <Star className="h-4 w-4" />
                                    {exam._count.questions} Questions
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                        {status === "active" && !attempt && (
                            <StartButton examId={exam.id} />
                        )}

                        {status === "in_progress" && (
                            <ResumeButton examId={exam.id} />
                        )}

                        {status === "completed" && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Score</p>
                                <p className="text-2xl font-black text-green-600 dark:text-green-400">
                                    {attempt.score ?? "?"} <span className="text-sm text-gray-400 font-normal">pts</span>
                                </p>
                            </div>
                        )}

                        {status === "upcoming" && (
                            <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-3 rounded-xl font-bold text-center text-sm">
                                {format(new Date(exam.startTime), "MMM d, h:mm a")}
                            </div>
                        )}

                        {status === "missed" && !attempt && (
                            <div className="w-full">
                                {exam.closeMode === "PERMISSIVE" ? (
                                    <button
                                        onClick={() => setShowLateCodeModal(true)}
                                        className="w-full bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 border-amber-200 dark:border-amber-800/50 flex items-center justify-center gap-2"
                                    >
                                        <Key className="h-4 w-4" />
                                        Enter Late Code
                                    </button>
                                ) : (
                                    <div className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 px-4 py-3 rounded-xl font-bold text-center text-sm">
                                        Closed
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Late Code Modal */}
            <LateCodeModal
                examId={exam.id}
                examTitle={exam.title}
                isOpen={showLateCodeModal}
                onClose={() => setShowLateCodeModal(false)}
            />
        </>
    )
}
