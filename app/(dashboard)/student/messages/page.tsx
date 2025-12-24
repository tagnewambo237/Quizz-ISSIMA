"use client"

/**
 * Student Messages Hub
 * 
 * Comprehensive communication system for students:
 * - Direct messaging with teachers
 * - Class/subject forums participation
 * - Assistance requests (tutoring, evaluations)
 * - Pedagogical assistance (coming soon)
 */

import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { PusherProvider, useChannel } from '@/components/chat/ChatProvider'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { NewConversationModal } from '@/components/chat/NewConversationModal'
import {
    MessageSquare,
    Users,
    HelpCircle,
    MessagesSquare,
    Bell,
    GraduationCap,
    BookOpen,
    Lightbulb,
    Clock,
    CheckCircle2,
    Send,
    Search,
    RefreshCw,
    Sparkles,
    Target,
    Plus,
    X,
    ChevronRight,
    AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Conversation {
    _id: string
    title?: string
    participants: {
        _id: string
        name: string
        image?: string
    }[]
    lastMessage?: {
        content: string
        senderId: { name: string }
        sentAt: string
    }
    type: string
}

interface Forum {
    _id: string
    name: string
    description?: string
    type: string
    postCount: number
    members: any[]
    lastPostAt?: string
    relatedClass?: { name: string }
    relatedSubject?: { name: string }
    allowStudentPosts: boolean
}

interface Request {
    _id: string
    teacherId: { _id: string; name: string; image?: string }
    type: string
    subject?: { name: string }
    title: string
    message: string
    priority: string
    status: string
    responseMessage?: string
    scheduledAt?: string
    createdAt: string
}

interface Teacher {
    _id: string
    name: string
    image?: string
    subjects?: { name: string }[]
}

type TabType = 'messages' | 'forums' | 'requests' | 'assistance'

function StudentMessagesContent() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState<TabType>('messages')
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // Forums state
    const [forums, setForums] = useState<Forum[]>([])
    const [forumsLoading, setForumsLoading] = useState(false)

    // Requests state
    const [requests, setRequests] = useState<Request[]>([])
    const [requestsLoading, setRequestsLoading] = useState(false)
    const [showNewRequest, setShowNewRequest] = useState(false)

    // New request form
    const [newRequest, setNewRequest] = useState({
        teacherId: '',
        type: 'TUTORING',
        title: '',
        message: '',
        priority: 'MEDIUM'
    })
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [submitting, setSubmitting] = useState(false)

    // Listen for real-time request updates
    useChannel(
        session?.user?.id ? `requests-${session.user.id}` : null,
        'request-updated',
        (data) => {
            setRequests(prev => prev.map(r => r._id === data.request._id ? data.request : r))
        }
    )

    // Fetch forums
    const fetchForums = async () => {
        setForumsLoading(true)
        try {
            const res = await fetch('/api/forums')
            if (res.ok) {
                const data = await res.json()
                if (data.success) setForums(data.data)
            }
        } catch (err) {
            console.error('Error fetching forums:', err)
        } finally {
            setForumsLoading(false)
        }
    }

    // Fetch requests
    const fetchRequests = async () => {
        setRequestsLoading(true)
        try {
            const res = await fetch('/api/requests')
            if (res.ok) {
                const data = await res.json()
                if (data.success) setRequests(data.data)
            }
        } catch (err) {
            console.error('Error fetching requests:', err)
        } finally {
            setRequestsLoading(false)
        }
    }

    // Fetch teachers
    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/teachers')
            if (res.ok) {
                const data = await res.json()
                if (data.success) setTeachers(data.data || data.teachers || [])
            }
        } catch (err) {
            console.error('Error fetching teachers:', err)
        }
    }

    // Submit new request
    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newRequest.teacherId || !newRequest.title || !newRequest.message) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRequest)
            })
            if (res.ok) {
                setShowNewRequest(false)
                setNewRequest({ teacherId: '', type: 'TUTORING', title: '', message: '', priority: 'MEDIUM' })
                fetchRequests()
            }
        } catch (err) {
            console.error('Error creating request:', err)
        } finally {
            setSubmitting(false)
        }
    }

    // Cancel request
    const handleCancelRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/requests/${requestId}`, { method: 'DELETE' })
            if (res.ok) {
                fetchRequests()
            }
        } catch (err) {
            console.error('Error cancelling request:', err)
        }
    }

    // Fetch data when tab changes
    useEffect(() => {
        if (activeTab === 'forums' && forums.length === 0) {
            fetchForums()
        }
        if (activeTab === 'requests') {
            if (requests.length === 0) fetchRequests()
            if (teachers.length === 0) fetchTeachers()
        }
    }, [activeTab])

    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConversation(conv)
        setShowMobileChat(true)
    }

    const handleBack = () => {
        setShowMobileChat(false)
    }

    const handleConversationCreated = useCallback((newConv: Conversation) => {
        setSelectedConversation(newConv)
        setShowMobileChat(true)
        setRefreshKey(prev => prev + 1)
    }, [])

    const getOtherParticipant = (conv: Conversation | null) => {
        if (!conv || !session?.user?.id) return undefined
        return conv.participants.find(p => p._id !== session.user.id)
    }

    const pendingRequests = requests.filter(r => r.status === 'PENDING').length

    const tabs = [
        { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 0 },
        { id: 'forums', label: 'Forums', icon: MessagesSquare, badge: forums.length },
        { id: 'requests', label: 'Mes Demandes', icon: HelpCircle, badge: pendingRequests },
        { id: 'assistance', label: 'Assistance', icon: Lightbulb, badge: 0, comingSoon: true }
    ]

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours < 1) return 'À l\'instant'
        if (hours < 24) return `Il y a ${hours}h`
        const days = Math.floor(hours / 24)
        if (days === 1) return 'Hier'
        return `Il y a ${days} jours`
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header with Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-[#2a3575]" />
                                Messagerie
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Échangez avec vos enseignants et camarades
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
                                <Bell className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap font-medium text-sm relative",
                                        activeTab === tab.id
                                            ? "bg-[#2a3575] text-white shadow-lg"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {tab.badge !== undefined && tab.badge > 0 && (
                                        <span className={cn(
                                            "px-1.5 py-0.5 text-xs font-bold rounded-full",
                                            activeTab === tab.id
                                                ? "bg-white text-[#2a3575]"
                                                : "bg-[#359a53] text-white"
                                        )}>
                                            {tab.badge}
                                        </span>
                                    )}
                                    {tab.comingSoon && (
                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                                            Bientôt
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <motion.div
                            key="messages"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-1 flex"
                        >
                            {/* Sidebar */}
                            <div className={cn(
                                "w-full lg:w-80 xl:w-96 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
                                showMobileChat ? "hidden lg:block" : "block"
                            )}>
                                <div className="h-full flex flex-col">
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                        <NewConversationModal onConversationCreated={handleConversationCreated} />
                                    </div>
                                    <ConversationList
                                        key={refreshKey}
                                        selectedId={selectedConversation?._id}
                                        onSelect={handleSelectConversation}
                                    />
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className={cn(
                                "flex-1 flex flex-col",
                                !showMobileChat && !selectedConversation ? "hidden lg:flex" : "flex"
                            )}>
                                {selectedConversation ? (
                                    <ChatWindow
                                        conversationId={selectedConversation._id}
                                        participant={getOtherParticipant(selectedConversation)}
                                        onBack={handleBack}
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center p-8"
                                        >
                                            <div className="w-20 h-20 bg-[#359a53]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <MessageSquare className="w-10 h-10 text-[#359a53]" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                Vos Messages
                                            </h2>
                                            <p className="text-gray-500 max-w-sm mx-auto">
                                                Discutez avec vos enseignants et camarades
                                            </p>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Forums Tab */}
                    {activeTab === 'forums' && (
                        <motion.div
                            key="forums"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-1 p-6 overflow-auto"
                        >
                            <div className="max-w-5xl mx-auto space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <MessagesSquare className="w-6 h-6 text-[#2a3575]" />
                                            Forums de ma Classe
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Participez aux discussions de votre classe
                                        </p>
                                    </div>
                                    <button
                                        onClick={fetchForums}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <RefreshCw className={cn("w-5 h-5 text-gray-500", forumsLoading && "animate-spin")} />
                                    </button>
                                </div>

                                {/* Forum Grid */}
                                {forumsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <RefreshCw className="w-8 h-8 text-[#2a3575] animate-spin" />
                                    </div>
                                ) : forums.length === 0 ? (
                                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                        <MessagesSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun forum</h3>
                                        <p className="text-gray-500">Vos enseignants n'ont pas encore créé de forum</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {forums.map((forum) => (
                                            <Link
                                                key={forum._id}
                                                href={`/student/forums/${forum._id}`}
                                                className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-[#2a3575]/50 transition-all group"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                                                        forum.type === 'CLASS' ? "bg-blue-500" : "bg-purple-500"
                                                    )}>
                                                        <MessagesSquare className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#2a3575] transition-colors">
                                                            {forum.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {forum.relatedClass?.name || forum.relatedSubject?.name || 'Forum général'}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <MessageSquare className="w-3 h-3" />
                                                                {forum.postCount} posts
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {forum.members?.length || 0} membres
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#2a3575]" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-1 p-6 overflow-auto"
                        >
                            <div className="max-w-5xl mx-auto space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <HelpCircle className="w-6 h-6 text-[#2a3575]" />
                                            Mes Demandes d'Aide
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Demandez du tutorat ou des évaluations supplémentaires
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={fetchRequests}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <RefreshCw className={cn("w-5 h-5 text-gray-500", requestsLoading && "animate-spin")} />
                                        </button>
                                        <button
                                            onClick={() => setShowNewRequest(true)}
                                            className="px-4 py-2 bg-[#2a3575] text-white rounded-xl font-medium hover:bg-[#2a3575]/90 transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Nouvelle demande
                                        </button>
                                    </div>
                                </div>

                                {/* New Request Modal */}
                                {showNewRequest && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nouvelle Demande</h3>
                                            <button onClick={() => setShowNewRequest(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleSubmitRequest} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enseignant</label>
                                                    <select
                                                        value={newRequest.teacherId}
                                                        onChange={e => setNewRequest({ ...newRequest, teacherId: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                                        required
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        {teachers.map(t => (
                                                            <option key={t._id} value={t._id}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                                    <select
                                                        value={newRequest.type}
                                                        onChange={e => setNewRequest({ ...newRequest, type: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                                    >
                                                        <option value="TUTORING">Tutorat</option>
                                                        <option value="EVALUATION">Évaluation supplémentaire</option>
                                                        <option value="REMEDIATION">Remédiation</option>
                                                        <option value="ASSISTANCE">Aide générale</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                                                <input
                                                    type="text"
                                                    value={newRequest.title}
                                                    onChange={e => setNewRequest({ ...newRequest, title: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                                    placeholder="Ex: Aide sur les équations du second degré"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                                <textarea
                                                    value={newRequest.message}
                                                    onChange={e => setNewRequest({ ...newRequest, message: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                                    placeholder="Décrivez votre besoin..."
                                                    required
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewRequest(false)}
                                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="px-4 py-2 bg-[#359a53] text-white rounded-lg font-medium hover:bg-[#359a53]/90 disabled:opacity-50"
                                                >
                                                    {submitting ? 'Envoi...' : 'Envoyer'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* Requests List */}
                                {requestsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <RefreshCw className="w-8 h-8 text-[#2a3575] animate-spin" />
                                    </div>
                                ) : requests.length === 0 && !showNewRequest ? (
                                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune demande</h3>
                                        <p className="text-gray-500 mb-4">Besoin d'aide ? Créez votre première demande</p>
                                        <button
                                            onClick={() => setShowNewRequest(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2a3575] text-white rounded-xl font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Nouvelle demande
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {requests.map((request) => (
                                            <div
                                                key={request._id}
                                                className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold">
                                                            {request.teacherId?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                    {request.title}
                                                                </h3>
                                                                <span className={cn(
                                                                    "px-2 py-0.5 text-xs font-medium rounded-full",
                                                                    request.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                                                                        request.status === 'ACCEPTED' ? "bg-green-100 text-green-700" :
                                                                            request.status === 'REJECTED' ? "bg-red-100 text-red-700" :
                                                                                "bg-gray-100 text-gray-700"
                                                                )}>
                                                                    {request.status === 'PENDING' ? 'En attente' :
                                                                        request.status === 'ACCEPTED' ? 'Acceptée' :
                                                                            request.status === 'REJECTED' ? 'Refusée' :
                                                                                request.status === 'COMPLETED' ? 'Terminée' : request.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mb-2">
                                                                À: {request.teacherId?.name} • {formatDate(request.createdAt)}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{request.message}</p>
                                                            {request.responseMessage && (
                                                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                        <strong>Réponse:</strong> {request.responseMessage}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {request.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleCancelRequest(request._id)}
                                                            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            Annuler
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Assistance Tab - Coming Soon */}
                    {activeTab === 'assistance' && (
                        <motion.div
                            key="assistance"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-1 flex items-center justify-center p-6"
                        >
                            <div className="max-w-2xl mx-auto text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-[#2a3575] to-[#359a53] rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
                                    <Sparkles className="w-12 h-12 text-white" />
                                    <div className="absolute -top-2 -right-2 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                                        Bientôt
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    Assistance Pédagogique
                                </h2>
                                <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                                    Bientôt disponible: tutorat entre pairs, ressources en ligne, et exercices de remédiation.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    {[
                                        { icon: Users, title: 'Tutorat entre pairs', description: 'Apprenez avec vos camarades' },
                                        { icon: GraduationCap, title: 'Enseignants spécialisés', description: 'Aide d\'experts' },
                                        { icon: BookOpen, title: 'Ressources en ligne', description: 'Supports pédagogiques' },
                                        { icon: Target, title: 'Exercices ciblés', description: 'Remédiation personnalisée' }
                                    ].map((feature, idx) => {
                                        const Icon = feature.icon
                                        return (
                                            <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-[#2a3575]/10 rounded-lg">
                                                        <Icon className="w-5 h-5 text-[#2a3575]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                                        <p className="text-sm text-gray-500">{feature.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default function StudentMessagesPage() {
    return (
        <PusherProvider>
            <StudentMessagesContent />
        </PusherProvider>
    )
}
