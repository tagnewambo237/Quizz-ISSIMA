"use client"

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { PusherProvider } from '@/components/chat/ChatProvider'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { NewConversationModal } from '@/components/chat/NewConversationModal'
import { MessageSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export default function MessagesPage() {
    const { data: session } = useSession()
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

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
        // Trigger refresh of conversation list
        setRefreshKey(prev => prev + 1)
    }, [])

    // Get other participant for the chat header
    const getOtherParticipant = (conv: Conversation | null) => {
        if (!conv || !session?.user?.id) return undefined
        return conv.participants.find(p => p._id !== session.user.id)
    }

    return (
        <PusherProvider>
            <div className="h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-gray-900">
                {/* Sidebar - Conversation List */}
                <div className={cn(
                    "w-full lg:w-80 xl:w-96 flex-shrink-0",
                    showMobileChat ? "hidden lg:block" : "block"
                )}>
                    <div className="h-full flex flex-col">
                        {/* New Conversation Button */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                            <NewConversationModal onConversationCreated={handleConversationCreated} />
                        </div>

                        <ConversationList
                            key={refreshKey}
                            selectedId={selectedConversation?._id}
                            onSelect={handleSelectConversation}
                        />
                    </div>
                </div>

                {/* Main Chat Area */}
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
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Vos Messages
                                </h2>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Sélectionnez une conversation existante ou démarrez une nouvelle discussion avec un de vos apprenants.
                                </p>
                                <div className="mt-6">
                                    <NewConversationModal onConversationCreated={handleConversationCreated} />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </PusherProvider>
    )
}

