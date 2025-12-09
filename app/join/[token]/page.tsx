"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GraduationCap, Users, School, Calendar, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, UserPlus } from "lucide-react"
import Link from "next/link"

interface InvitationInfo {
    type: 'LINK' | 'INDIVIDUAL'
    className: string
    schoolName: string
    teacherName: string
    academicYear: string
    expiresAt?: string
    remainingUses?: number | null
    email?: string // For INDIVIDUAL invitations
    isActivation?: boolean // True if account already exists
}

export default function JoinPage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })

    useEffect(() => {
        const validateToken = async () => {
            try {
                const res = await fetch(`/api/invitations/${token}`)
                const data = await res.json()

                if (data.success) {
                    setInvitationInfo(data.data)
                    // Pre-fill email for INDIVIDUAL invitations
                    if (data.data.email) {
                        setFormData(prev => ({ ...prev, email: data.data.email }))
                    }
                } else {
                    setError(data.message || "Lien d'invitation invalide")
                }
            } catch (err) {
                setError("Erreur de connexion au serveur")
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            validateToken()
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const payload: any = { password: formData.password }

            // Only send name/email for LINK invitations (new account)
            if (!invitationInfo?.isActivation) {
                payload.name = formData.name
                payload.email = formData.email
            }

            const res = await fetch(`/api/invitations/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (data.success) {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/login")
                }, 2000)
            } else {
                setError(data.message || "Une erreur est survenue")
            }
        } catch (err) {
            setError("Erreur de connexion au serveur")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
        )
    }

    if (error && !invitationInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl"
                >
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Lien invalide
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {error}
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-colors"
                    >
                        Aller à la connexion
                    </Link>
                </motion.div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl"
                >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {invitationInfo?.isActivation ? "Compte activé !" : "Inscription réussie !"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Redirection vers la page de connexion...
                    </p>
                </motion.div>
            </div>
        )
    }

    const isActivation = invitationInfo?.isActivation

}
