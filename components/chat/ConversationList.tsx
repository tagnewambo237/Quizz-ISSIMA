"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, MessageSquare, Loader2 } from 'lucide-react'
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
    updatedAt: string
    type: string
}

interface ConversationListProps {
    selectedId?: string
    onSelect: (conversation: Conversation) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
    const { data: session } = useSession()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/conversations')
                const data = await res.json()
                if (data.success) {
                    setConversations(data.data)
                }
            } catch (error) {
                console.error('Error fetching conversations:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchConversations()
    }, [])

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants.find(p => p._id !== session?.user?.id) || conv.participants[0]
    }

    const filteredConversations = conversations.filter(conv => {
        const other = getOtherParticipant(conv)
        return other?.name?.toLowerCase().includes(search.toLowerCase()) ||
            conv.title?.toLowerCase().includes(search.toLowerCase())
    })

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        } else if (days === 1) {
            return 'Hier'
        } else if (days < 7) {
            return date.toLocaleDateString('fr-FR', { weekday: 'short' })
        }
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="pl-10 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium">Aucune conversation</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {search ? 'Aucun résultat trouvé' : 'Commencez une nouvelle discussion'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {filteredConversations.map((conv) => {
                            const other = getOtherParticipant(conv)
                            const isSelected = selectedId === conv._id

                            return (
                                <motion.button
                                    key={conv._id}
                                    onClick={() => onSelect(conv)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left",
                                        isSelected && "bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-emerald-600"
                                    )}
                                >
                                    <Avatar>
                                        <AvatarImage src={other?.image} />
                                        <AvatarFallback>{other?.name?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                {conv.title || other?.name || 'Conversation'}
                                            </p>
                                            {conv.lastMessage?.sentAt && (
                                                <span className="text-xs text-gray-400">
                                                    {formatTime(conv.lastMessage.sentAt)}
                                                </span>
                                            )}
                                        </div>
                                        {conv.lastMessage && (
                                            <p className="text-sm text-gray-500 truncate">
                                                {conv.lastMessage.content}
                                            </p>
                                        )}
                                    </div>
                                </motion.button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
