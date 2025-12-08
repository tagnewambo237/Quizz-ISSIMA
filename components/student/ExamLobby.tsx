"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Play, AlertTriangle, Clock, HelpCircle, Calendar, Trophy, Shield, Eye, Copy, Maximize, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ExamLobbyProps {
    exam: any
    user: any
}

export function ExamLobby({ exam, user }: ExamLobbyProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [lateCode, setLateCode] = useState("")
    const [error, setError] = useState("")

    const now = new Date()
    const isStarted = new Date(exam.startTime) <= now
    const isEnded = new Date(exam.endTime) <= now

    // Teachers can preview exams regardless of date restrictions
    const isTeacher = user.role === "TEACHER"
    const isOpen = isTeacher || (isStarted && !isEnded)

    const handleStart = async () => {
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/attempts/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examId: exam.id,
                    lateCode: isEnded ? lateCode : undefined,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to start exam")
            }

            const { attemptId } = await res.json()
            router.push(`/student/exam/${exam.id}/take`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-b-4 border-gray-200 dark:border-gray-700">
                    {/* Header Image/Icon Area */}
                    <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-20"
                            style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2.5px)', backgroundSize: '20px 20px' }} />

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                <Trophy className="h-12 w-12 text-yellow-300 drop-shadow-md" />
                            </div>
                            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">{exam.title}</h1>
                            <p className="text-indigo-100 font-medium">{exam.description || "Ready to test your knowledge?"}</p>
                            {isTeacher && (
                                <div className="mt-4 inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                                    🎭 Preview Mode
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border-2 border-blue-100 dark:border-blue-800/50 flex flex-col items-center text-center">
                                <Clock className="h-6 w-6 text-blue-500 mb-2" />
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Time</span>
                                <span className="text-lg font-black text-blue-700 dark:text-blue-300">{exam.duration}m</span>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border-2 border-purple-100 dark:border-purple-800/50 flex flex-col items-center text-center">
                                <HelpCircle className="h-6 w-6 text-purple-500 mb-2" />
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Questions</span>
                                <span className="text-lg font-black text-purple-700 dark:text-purple-300">{exam._count?.questions || 0}</span>
                            </div>
                        </div>

                        {/* Timeline Info */}
                        <div className="space-y-3 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Opens
                                </span>
                                <span className="font-bold text-gray-700 dark:text-gray-300">{format(new Date(exam.startTime), "MMM d, h:mm a")}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 font-medium flex items-center gap-2">
                                    <Lock className="h-4 w-4" /> Closes
                                </span>
                                <span className="font-bold text-gray-700 dark:text-gray-300">{format(new Date(exam.endTime), "MMM d, h:mm a")}</span>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {isEnded && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border-2 border-amber-100 dark:border-amber-800/50 flex gap-3">
                                <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                                <div>
                                    <p className="font-bold text-amber-800 dark:text-amber-200">Exam Closed</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 leading-tight">
                                        {exam.closeMode === "PERMISSIVE"
                                            ? "Enter a late code to start."
                                            : "Late submissions are not allowed."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {isEnded && exam.closeMode === "PERMISSIVE" && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Late Code</label>
                                <input
                                    type="text"
                                    value={lateCode}
                                    onChange={(e) => setLateCode(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                                    placeholder="ENTER-CODE-HERE"
                                />
                            </div>
                        )}

                        {/* Anti-Cheat Warning Section */}
                        {exam.config?.antiCheat && (
                            exam.config.antiCheat.fullscreenRequired ||
                            exam.config.antiCheat.trackTabSwitches ||
                            exam.config.antiCheat.disableCopyPaste ||
                            exam.config.antiCheat.blockRightClick
                        ) && (
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 rounded-2xl border-2 border-red-200 dark:border-red-800/50">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 bg-red-100 dark:bg-red-800/50 rounded-xl flex items-center justify-center shrink-0">
                                            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-red-800 dark:text-red-200 text-lg">
                                                🔒 Examen Surveillé
                                            </h3>
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                Des mesures anti-triche sont activées pour cet examen
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {exam.config.antiCheat.trackTabSwitches && (
                                            <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl">
                                                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                                                    <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        Changement d'onglet détecté
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        1er → Avertissement • 2nd → Question marquée "Sans réponse"
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {exam.config.antiCheat.disableCopyPaste && (
                                            <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl">
                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                                                    <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        Copier/Coller désactivé
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Ctrl+C, Ctrl+V et clic droit sont bloqués
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {exam.config.antiCheat.fullscreenRequired && (
                                            <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl">
                                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                                                    <Maximize className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        Mode plein écran recommandé
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Restez concentré sur votre examen
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {exam.config.antiCheat.aiReformulation && (
                                            <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl">
                                                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center">
                                                    <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        Questions reformulées par IA
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Chaque étudiant voit des questions uniques
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800">
                                        <p className="text-xs text-center text-red-600 dark:text-red-400 font-medium">
                                            ⚠️ Toute tentative de triche sera enregistrée
                                        </p>
                                    </div>
                                </div>
                            )}

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 py-3 rounded-xl font-medium border border-red-100 dark:border-red-800">
                                {error}
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleStart}
                            disabled={loading || (!isOpen && (!lateCode || exam.closeMode === "STRICT"))}
                            className={cn(
                                "w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]",
                                isOpen || (isEnded && lateCode)
                                    ? "bg-green-500 hover:bg-green-600 text-white shadow-[0_4px_0_0_#15803d] hover:shadow-[0_2px_0_0_#15803d] translate-y-[-2px] hover:translate-y-[0px]"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    START EXAM <Play className="h-5 w-5 fill-current" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
