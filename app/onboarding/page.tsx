"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GraduationCap, BookOpen, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
    const router = useRouter()
    const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER" | null>(null)
    const [loading, setLoading] = useState(false)

    const handleContinue = () => {
        if (!selectedRole) return
        setLoading(true)

        // Redirect to specific flow
        if (selectedRole === "STUDENT") {
            router.push("/onboarding/student")
        } else {
            router.push("/onboarding/teacher")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Welcome to Xkorin School! 👋
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            To get started, please tell us how you want to use the platform.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {/* Student Option */}
                        <button
                            onClick={() => setSelectedRole("STUDENT")}
                            className={cn(
                                "relative p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] group",
                                selectedRole === "STUDENT"
                                    ? "border-secondary bg-secondary/5 ring-2 ring-secondary/20"
                                    : "border-gray-200 dark:border-gray-700 hover:border-secondary/50"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
                                selectedRole === "STUDENT" ? "bg-secondary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-secondary/10 group-hover:text-secondary"
                            )}>
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                I'm a Student
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                I want to take exams, view my results, and track my progress.
                            </p>
                            {selectedRole === "STUDENT" && (
                                <div className="absolute top-4 right-4 text-secondary">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            )}
                        </button>

                        {/* Teacher Option */}
                        <button
                            onClick={() => setSelectedRole("TEACHER")}
                            className={cn(
                                "relative p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] group",
                                selectedRole === "TEACHER"
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                    : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
                                selectedRole === "TEACHER" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                            )}>
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                I'm a Teacher
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                I want to create exams, manage students, and grade submissions.
                            </p>
                            {selectedRole === "TEACHER" && (
                                <div className="absolute top-4 right-4 text-primary">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            )}
                        </button>
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={!selectedRole || loading}
                        className={cn(
                            "w-full py-4 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center",
                            !selectedRole
                                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                                : selectedRole === "TEACHER"
                                    ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                                    : "bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30"
                        )}
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            "Continue"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
