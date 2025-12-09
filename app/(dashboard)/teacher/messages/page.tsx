"use client"

/**
 * Teacher Messages Hub
 * 
 * Comprehensive messaging system including:
 * - Direct messaging with students
 * - Class/subject forums
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
    Calendar,
    X
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
    createdBy: { name: string }
}

interface Request {
    _id: string
    studentId: { _id: string; name: string; image?: string; studentCode?: string }
    type: string
    subject?: { name: string }
    title: string
    message: string
    priority: string
    status: string
    createdAt: string
}

type TabType = 'messages' | 'forums' | 'requests' | 'assistance'

function MessagesContent() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState<TabType>('messages')
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // Forums state
    const [forums, setForums] = useState<Forum[]>([])
    const [forumsLoading, setForumsLoading] = useState(false)
    const [showCreateForum, setShowCreateForum] = useState(false)

    // Requests state
    const [requests, setRequests] = useState<Request[]>([])
    const [requestsLoading, setRequestsLoading] = useState(false)

    // Listen for real-time request updates
    useChannel(
        session?.user?.id ? `requests-${session.user.id}` : null,
        'request-created',
        (data) => {
            setRequests(prev => [data.request, ...prev])
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

    // Handle request action
    const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            const res = await fetch(`/api/requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
                    responseMessage: action === 'accept' ? 'Demande acceptée' : 'Demande refusée'
                })
            })
            if (res.ok) {
                fetchRequests() // Refresh list
            }
        } catch (err) {
            console.error('Error updating request:', err)
        }
    }

    // Fetch data when tab changes
    useEffect(() => {
        if (activeTab === 'forums' && forums.length === 0) {
            fetchForums()
        }
        if (activeTab === 'requests' && requests.length === 0) {
            fetchRequests()
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
        { id: 'requests', label: 'Demandes', icon: HelpCircle, badge: pendingRequests },
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
                                Centre de Communication
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Messagerie, forums et demandes d'assistance
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <Search className="w-5 h-5 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
                                <Bell className="w-5 h-5 text-gray-500" />
                                {pendingRequests > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                )}
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
                                                : "bg-red-500 text-white"
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
                                                Sélectionnez une conversation ou démarrez une nouvelle discussion
                                            </p>
                                            <div className="mt-6">
                                                <NewConversationModal onConversationCreated={handleConversationCreated} />
                                            </div>
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
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <MessagesSquare className="w-6 h-6 text-[#2a3575]" />
                                            Forums de Discussion
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Échanges par classe et par matière
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={fetchForums}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <RefreshCw className={cn("w-5 h-5 text-gray-500", forumsLoading && "animate-spin")} />
                                        </button>
                                        <Link
                                            href="/teacher/forums/create"
                                            className="px-4 py-2 bg-[#2a3575] text-white rounded-xl font-medium hover:bg-[#2a3575]/90 transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Créer un forum
                                        </Link>
                                    </div>
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
                                        <p className="text-gray-500 mb-4">Créez votre premier forum de discussion</p>
                                        <Link
                                            href="/teacher/forums/create"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2a3575] text-white rounded-xl font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Créer un forum
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {forums.map((forum) => (
                                            <Link
                                                key={forum._id}
                                                href={`/teacher/forums/${forum._id}`}
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
                                                            {forum.type === 'CLASS' ? forum.relatedClass?.name || 'Classe' : 'Matière'}
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
                                                            {forum.lastPostAt && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatDate(forum.lastPostAt)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
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
                                            Demandes d'Assistance
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Tutorat, évaluations supplémentaires et aide pédagogique
                                        </p>
                                    </div>
                                    <button
                                        onClick={fetchRequests}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <RefreshCw className={cn("w-5 h-5 text-gray-500", requestsLoading && "animate-spin")} />
                                    </button>
                                </div>

                                {/* Request Cards */}
                                {requestsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <RefreshCw className="w-8 h-8 text-[#2a3575] animate-spin" />
                                    </div>
                                ) : requests.length === 0 ? (
                                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                        <CheckCircle2 className="w-12 h-12 text-[#359a53] mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune demande</h3>
                                        <p className="text-gray-500">Vous n'avez pas de demandes d'assistance en attente</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {requests.map((request) => (
                                            <div
                                                key={request._id}
                                                className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold">
                                                            {request.studentId?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                    {request.studentId?.name || 'Étudiant'}
                                                                </h3>
                                                                <span className={cn(
                                                                    "px-2 py-0.5 text-xs font-medium rounded-full",
                                                                    request.priority === 'URGENT' || request.priority === 'HIGH'
                                                                        ? "bg-red-100 text-red-700"
                                                                        : request.priority === 'MEDIUM'
                                                                            ? "bg-amber-100 text-amber-700"
                                                                            : "bg-gray-100 text-gray-700"
                                                                )}>
                                                                    {request.priority === 'URGENT' ? 'Urgent' :
                                                                        request.priority === 'HIGH' ? 'Élevé' :
                                                                            request.priority === 'MEDIUM' ? 'Moyen' : 'Normal'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                                                                <span className="flex items-center gap-1">
                                                                    <HelpCircle className="w-3 h-3" />
                                                                    {request.type === 'TUTORING' ? 'Tutorat' :
                                                                        request.type === 'EVALUATION' ? 'Évaluation' :
                                                                            request.type === 'REMEDIATION' ? 'Remédiation' : 'Assistance'}
                                                                </span>
                                                                {request.subject && (
                                                                    <span className="flex items-center gap-1">
                                                                        <BookOpen className="w-3 h-3" />
                                                                        {request.subject.name}
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatDate(request.createdAt)}
                                                                </span>
                                                            </div>
                                                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                                                                {request.title}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {request.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {request.status === 'PENDING' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleRequestAction(request._id, 'accept')}
                                                                    className="px-3 py-1.5 bg-[#359a53] text-white rounded-lg text-sm font-medium hover:bg-[#359a53]/90 transition-colors"
                                                                >
                                                                    Accepter
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRequestAction(request._id, 'reject')}
                                                                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                                >
                                                                    Refuser
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className={cn(
                                                                "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1",
                                                                request.status === 'ACCEPTED' ? "bg-[#359a53]/10 text-[#359a53]" :
                                                                    request.status === 'REJECTED' ? "bg-red-100 text-red-600" :
                                                                        request.status === 'COMPLETED' ? "bg-blue-100 text-blue-600" :
                                                                            "bg-gray-100 text-gray-600"
                                                            )}>
                                                                {request.status === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3" />}
                                                                {request.status === 'ACCEPTED' ? 'Acceptée' :
                                                                    request.status === 'REJECTED' ? 'Refusée' :
                                                                        request.status === 'COMPLETED' ? 'Terminée' :
                                                                            request.status === 'CANCELLED' ? 'Annulée' : request.status}
                                                            </span>
                                                        )}
                                                    </div>
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
                                    Un système complet d'aide et de ressources pédagogiques sera bientôt disponible.
                                </p>

                                {/* Features Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    {[
                                        { icon: Users, title: 'Tutorat entre pairs', description: 'Mise en relation automatique' },
                                        { icon: GraduationCap, title: 'Enseignants spécialisés', description: 'Accès à des experts' },
                                        { icon: BookOpen, title: 'Ressources en ligne', description: 'Bibliothèque pédagogique' },
                                        { icon: Target, title: 'Exercices de remédiation', description: 'Activités ciblées' }
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

                                <div className="mt-8 p-4 bg-[#359a53]/10 rounded-xl border border-[#359a53]/20">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong className="text-[#359a53]">Notification:</strong> Cette fonctionnalité sera disponible dans une prochaine mise à jour.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default function MessagesPage() {
    return (
        <PusherProvider>
            <MessagesContent />
        </PusherProvider>
    )
}
