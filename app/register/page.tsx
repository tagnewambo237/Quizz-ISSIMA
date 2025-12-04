"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            // 1. Register the user
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Registration failed")
            }

            // 2. Auto-login using NextAuth signIn
            const { signIn } = await import("next-auth/react")
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                throw new Error("Registration successful but auto-login failed. Please login manually.")
            }

            // 3. Redirect to onboarding
            router.push("/onboarding")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-center mb-8">
                        <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                            <UserPlus className="h-6 w-6" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                        Create Account
                    </h1>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                        Join QuizLock to start learning
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                placeholder="student@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-4 py-2 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-secondary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
