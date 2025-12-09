"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
    HelpCircle, Send, Clock, CheckCircle, AlertCircle,
    MessageSquare, Loader2, BookOpen, Target, Plus, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const REQUEST_TYPES = [
    { value: 'CONCEPT_HELP', label: 'Aide sur un concept', icon: BookOpen },
    { value: 'EXAM_PREP', label: 'Préparation examen', icon: Target },
    { value: 'REMEDIATION', label: 'Remédiation', icon: AlertCircle },
    { value: 'GENERAL', label: 'Question générale', icon: HelpCircle }
]

const PRIORITY_LEVELS = [
    { value: 'LOW', label: 'Normal', color: 'bg-gray-100 text-gray-700' },
    { value: 'MEDIUM', label: 'Important', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'HIGH', label: 'Urgent', color: 'bg-orange-100 text-orange-700' }
]

interface AssistanceRequest {
    id: string
    type: string
    title: string
    description: string
    priority: string
    status: string
    createdAt: string
    resolution?: {
        notes: string
        resolvedAt: string
    }
}

export default function StudentAssistancePage() {
    const { data: session } = useSession()
    const [requests, setRequests] = useState<AssistanceRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        type: 'CONCEPT_HELP',
        title: '',
        description: '',
        priority: 'MEDIUM'
    })

    useEffect(() => {
        if (session?.user?.id) {
            fetchRequests()
        }
    }, [session])

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/assistance')
            const data = await res.json()
            if (data.success) {
                setRequests(data.requests || [])
            }
        } catch (error) {
            console.error('Error fetching requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim() || !formData.description.trim()) {
            toast.error('Veuillez remplir tous les champs')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/assistance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Demande envoyée avec succès!')
                setShowForm(false)
                setFormData({
                    type: 'CONCEPT_HELP',
                    title: '',
                    description: '',
                    priority: 'MEDIUM'
                })
                fetchRequests()
            } else {
                toast.error(data.message || 'Erreur lors de l\'envoi')
            }
        } catch (error) {
            toast.error('Erreur lors de l\'envoi')
        } finally {
            setSubmitting(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />
            case 'IN_PROGRESS': return <MessageSquare className="h-4 w-4 text-blue-500" />
            case 'RESOLVED': return <CheckCircle className="h-4 w-4 text-green-500" />
            default: return <HelpCircle className="h-4 w-4 text-gray-400" />
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'En attente'
            case 'IN_PROGRESS': return 'En cours'
            case 'RESOLVED': return 'Résolu'
            case 'CLOSED': return 'Fermé'
            default: return status
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <HelpCircle className="h-8 w-8 text-primary" />
                        </div>
                        Demande d'Assistance
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Besoin d'aide ? Envoyez une demande à vos enseignants
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all",
                        showForm
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            : "bg-primary text-white hover:bg-primary/90 shadow-lg"
                    )}
                >
                    {showForm ? (
                        <>
                            <X className="h-5 w-5" />
                            Annuler
                        </>
                    ) : (
                        <>
                            <Plus className="h-5 w-5" />
                            Nouvelle demande
                        </>
                    )}
                </button>
            </div>

            {/* New Request Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-primary/20 shadow-lg"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Nouvelle demande d'aide
                            </h3>

                            {/* Type selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Type de demande
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {REQUEST_TYPES.map((type) => {
                                        const Icon = type.icon
                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: type.value })}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all",
                                                    formData.type === type.value
                                                        ? "border-primary bg-primary/5"
                                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "h-5 w-5 mb-2",
                                                    formData.type === type.value ? "text-primary" : "text-gray-400"
                                                )} />
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    formData.type === type.value
                                                        ? "text-primary"
                                                        : "text-gray-600 dark:text-gray-400"
                                                )}>
                                                    {type.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sujet
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Je ne comprends pas les équations du second degré"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    maxLength={200}
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description détaillée
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Décrivez votre problème en détail..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    maxLength={2000}
                                />
                            </div>

                            {/* Priority */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Priorité
                                </label>
                                <div className="flex gap-3">
                                    {PRIORITY_LEVELS.map((priority) => (
                                        <button
                                            key={priority.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: priority.value })}
                                            className={cn(
                                                "px-4 py-2 rounded-xl font-medium transition-all",
                                                formData.priority === priority.value
                                                    ? priority.color + " ring-2 ring-offset-2 ring-primary"
                                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            )}
                                        >
                                            {priority.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                            >
                                {submitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        Envoyer la demande
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Existing Requests */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Mes demandes ({requests.length})
                </h2>

                {requests.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <HelpCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Aucune demande
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Vous n'avez pas encore fait de demande d'assistance.
                        </p>
                    </div>
                ) : (
                    requests.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 transition-all",
                                request.status === 'RESOLVED'
                                    ? "border-green-100 dark:border-green-900/30"
                                    : "border-gray-100 dark:border-gray-700"
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-medium",
                                            request.type === 'CONCEPT_HELP' && "bg-blue-100 text-blue-700",
                                            request.type === 'EXAM_PREP' && "bg-purple-100 text-purple-700",
                                            request.type === 'REMEDIATION' && "bg-orange-100 text-orange-700",
                                            request.type === 'GENERAL' && "bg-gray-100 text-gray-700"
                                        )}>
                                            {REQUEST_TYPES.find(t => t.value === request.type)?.label}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {request.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        {request.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(request.status)}
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {getStatusLabel(request.status)}
                                    </span>
                                </div>
                            </div>

                            {request.resolution && (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                                        Réponse de l'enseignant:
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-300">
                                        {request.resolution.notes}
                                    </p>
                                </div>
                            )}

                            <div className="mt-3 text-xs text-gray-400">
                                Créée le {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
