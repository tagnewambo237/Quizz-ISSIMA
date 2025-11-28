"use client"

import { useState } from "react"
import { format } from "date-fns"
import { RefreshCw, Plus, Copy, Check, Users, Target, TrendingUp, Clock, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function MonitorView({ exam }: { exam: any }) {
    const router = useRouter()
    const [lateCodes, setLateCodes] = useState(exam.lateCodes)
    const [generating, setGenerating] = useState(false)

    const generateCode = async () => {
        setGenerating(true)
        try {
            const res = await fetch("/api/late-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ examId: exam.id }),
            })
            const { code } = await res.json()
            // Normalize the new code object to match the structure of existing codes
            const newCode = { ...code, id: code._id || code.id }
            setLateCodes((prev: any) => [newCode, ...prev])
        } catch (error) {
            console.error(error)
        } finally {
            setGenerating(false)
        }
    }

    // Stats Calculation
    const completedAttempts = exam.attempts.filter((a: any) => a.status === "COMPLETED")
    const totalAttempts = exam.attempts.length
    const maxScore = exam.questions.reduce((acc: number, q: any) => acc + q.points, 0)

    const avgScore = completedAttempts.length > 0
        ? (completedAttempts.reduce((acc: number, a: any) => acc + (a.score || 0), 0) / completedAttempts.length).toFixed(1)
        : "0"

    const passThreshold = maxScore * 0.5
    const passRate = completedAttempts.length > 0
        ? Math.round((completedAttempts.filter((a: any) => (a.score || 0) >= passThreshold).length / completedAttempts.length) * 100)
        : 0

    const isOpen = new Date() < new Date(exam.endTime)

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{exam.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time monitoring and analytics</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2",
                        isOpen ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                        <div className={cn("w-2 h-2 rounded-full", isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                        {isOpen ? "Live Exam" : "Exam Closed"}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Attempts"
                    value={totalAttempts}
                    icon={Users}
                    color="blue"
                    trend={totalAttempts > 0 ? "+1 recently" : undefined}
                />
                <StatCard
                    label="Average Score"
                    value={`${avgScore}`}
                    subValue={`/ ${maxScore}`}
                    icon={Target}
                    color="purple"
                />
                <StatCard
                    label="Pass Rate"
                    value={`${passRate}%`}
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    label="Completion"
                    value={`${totalAttempts > 0 ? Math.round((completedAttempts.length / totalAttempts) * 100) : 0}%`}
                    icon={BarChart3}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attempts List */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                        <button onClick={() => router.refresh()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {exam.attempts.map((attempt: any) => (
                                    <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                    {attempt.user.name.charAt(0)}
                                                </div>
                                                {attempt.user.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold",
                                                attempt.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            )}>
                                                {attempt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium">
                                            {attempt.score !== null ? (
                                                <span className={attempt.score >= passThreshold ? "text-green-600" : "text-red-500"}>
                                                    {attempt.score} <span className="text-gray-400 text-xs">/ {maxScore}</span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {format(new Date(attempt.startedAt), "MMM d, h:mm a")}
                                        </td>
                                    </tr>
                                ))}
                                {exam.attempts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-500">
                                            No attempts recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Late Codes & Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Late Access Codes</h2>
                            <button
                                onClick={generateCode}
                                disabled={generating}
                                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                title="Generate New Code"
                            >
                                {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {lateCodes.map((code: any) => (
                                <div key={code.id || code._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                    <div>
                                        <p className="font-mono font-bold text-lg tracking-wider text-gray-800 dark:text-gray-200">{code.code}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                            {code.usagesRemaining} use(s) remaining
                                        </p>
                                    </div>
                                    <CopyButton text={code.code} />
                                </div>
                            ))}
                            {lateCodes.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-500 text-sm">No active codes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, subValue, icon: Icon, color, trend }: any) {
    const colorStyles: any = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", colorStyles[color])}>
                    <Icon className="h-6 w-6" />
                </div>
                {trend && (
                    <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{value}</h3>
                    {subValue && <span className="text-sm text-gray-400 font-medium">{subValue}</span>}
                </div>
            </div>
        </div>
    )
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
            title="Copy Code"
        >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
    )
}
