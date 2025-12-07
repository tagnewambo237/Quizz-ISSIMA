"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChannel } from './ChatProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
    Send,
    Loader2,
    ArrowLeft,
    MoreVertical,
    Check,
    CheckCheck,
    Smile,
    Image as ImageIcon,
    Paperclip
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Common emojis for quick access
const QUICK_EMOJIS = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🙏', '💯', '✨', '🔥', '👌', '💪']

// Helper function to deduplicate messages
const deduplicateMessages = (messages: Message[]): Message[] => {
    const seen = new Map<string, Message>()
    messages.forEach(msg => {
        seen.set(msg._id, msg)
    })
    return Array.from(seen.values())
}

interface Message {
    _id: string
    content: string
    senderId: {
        _id: string
        name: string
        image?: string
    }
    readBy?: string[]
    createdAt: string
    type: string
}

interface ChatWindowProps {
    conversationId: string
    participant?: {
        _id: string
        name: string
        image?: string
    }
    onBack?: () => void
}

export function ChatWindow({ conversationId, participant, onBack }: ChatWindowProps) {
    const { data: session } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [showEmojis, setShowEmojis] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const emojiRef = useRef<HTMLDivElement>(null)

    // Deduplicate messages to prevent React key errors
    const dedupedMessages = useMemo(() => deduplicateMessages(messages), [messages])

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
                setShowEmojis(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch messages
    useEffect(() => {
        if (!conversationId) return

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/conversations/${conversationId}/messages`)
                const data = await res.json()
                if (data.success) {
                    setMessages(data.data)
                }
            } catch (error) {
                console.error('Error fetching messages:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()
    }, [conversationId])

    // Subscribe to real-time messages
    // Subscribe to real-time messages via Pusher
    const handleNewMessage = useCallback((messageData: Message) => {
        console.log('[Chat] Real-time message received:', messageData)
        setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m._id === messageData._id)) return prev
            return [...prev, messageData]
        })
    }, [])

    useChannel(
        conversationId ? `conversation-${conversationId}` : null,
        'new-message',
        handleNewMessage
    )

    // Polling fallback when Ably is not connected
    useEffect(() => {
        if (!conversationId) return

        // Poll every 3 seconds for new messages
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/conversations/${conversationId}/messages`)
                const data = await res.json()
                if (data.success && data.data) {
                    setMessages(prev => {
                        // Create a map to deduplicate messages by ID
                        const messageMap = new Map<string, Message>()

                        // Add existing non-temp messages
                        prev.filter(m => !m._id.startsWith('temp-')).forEach(m => {
                            messageMap.set(m._id, m)
                        })

                        // Add new messages from server (overwrites if exists)
                        data.data.forEach((msg: Message) => {
                            messageMap.set(msg._id, msg)
                        })

                        // Get temp messages
                        const tempMessages = prev.filter(m => m._id.startsWith('temp-'))

                        // Combine: real messages (deduplicated) + temp messages
                        const uniqueRealMessages = Array.from(messageMap.values())

                        if (uniqueRealMessages.length !== prev.filter(m => !m._id.startsWith('temp-')).length) {
                            console.log('[Chat] Polling found new messages:', uniqueRealMessages.length - prev.filter(m => !m._id.startsWith('temp-')).length)
                        }

                        return [...uniqueRealMessages, ...tempMessages]
                    })
                }
            } catch (error) {
                // Silently fail on polling errors
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [conversationId])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return

        setSending(true)
        const content = newMessage.trim()
        setNewMessage('')
        setShowEmojis(false)

        // Optimistic update
        const tempId = `temp-${Date.now()}`
        const optimisticMessage: Message = {
            _id: tempId,
            content,
            senderId: {
                _id: session?.user?.id || '',
                name: session?.user?.name || '',
                image: session?.user?.image || ''
            },
            readBy: [session?.user?.id || ''],
            createdAt: new Date().toISOString(),
            type: 'TEXT'
        }
        setMessages(prev => [...prev, optimisticMessage])

        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })

            const data = await res.json()

            if (data.success) {
                // Replace optimistic message with real one
                // Check if real message already exists (from polling) to avoid duplicates
                setMessages(prev => {
                    const realMessageExists = prev.some(m => m._id === data.data._id)
                    if (realMessageExists) {
                        // Real message already added by polling, just remove temp
                        return prev.filter(m => m._id !== tempId)
                    }
                    // Replace temp with real
                    return prev.map(m => m._id === tempId ? data.data : m)
                })
            }
        } catch (error) {
            console.error('Error sending message:', error)
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m._id !== tempId))
        } finally {
            setSending(false)
            inputRef.current?.focus()
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji)
        inputRef.current?.focus()
    }

    // Message status indicator
    const MessageStatus = ({ message }: { message: Message }) => {
        const isOwn = message.senderId._id === session?.user?.id
        if (!isOwn) return null

        const isSending = message._id.startsWith('temp-')
        const isRead = message.readBy && message.readBy.length > 1 // More than just sender

        if (isSending) {
            return <Loader2 className="w-3 h-3 animate-spin text-emerald-200" />
        }

        if (isRead) {
            return <CheckCheck className="w-3.5 h-3.5 text-blue-400" /> // Blue = read
        }

        return <Check className="w-3.5 h-3.5 text-emerald-200" /> // Single check = sent
    }

    // Format time
    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                {onBack && (
                    <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                )}
                <div className="relative">
                    <Avatar>
                        <AvatarImage src={participant?.image} />
                        <AvatarFallback>{participant?.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
                </div>
                <div className="flex-1">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                        {participant?.name || 'Conversation'}
                    </h2>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        En ligne
                    </p>
                </div>
                <Button variant="ghost" size="sm">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/50">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : dedupedMessages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">👋</span>
                        </div>
                        <p className="text-lg font-medium mb-1">Dites bonjour !</p>
                        <p className="text-sm">Commencez la conversation avec {participant?.name}</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {dedupedMessages.map((message, index) => {
                            const isOwn = message.senderId._id === session?.user?.id
                            const showAvatar = !isOwn && (
                                index === 0 ||
                                dedupedMessages[index - 1]?.senderId._id !== message.senderId._id
                            )

                            return (
                                <motion.div
                                    key={message._id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className={cn(
                                        "flex gap-2",
                                        isOwn ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {!isOwn && (
                                        <div className="w-8">
                                            {showAvatar && (
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={message.senderId.image} />
                                                    <AvatarFallback className="text-xs">
                                                        {message.senderId.name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-[70%] group"
                                    )}>
                                        <div className={cn(
                                            "px-4 py-2.5 rounded-2xl shadow-sm",
                                            isOwn
                                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md"
                                                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-100 dark:border-gray-700"
                                        )}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {message.content}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1.5 mt-1 px-1",
                                            isOwn ? "justify-end" : "justify-start"
                                        )}>
                                            <span className={cn(
                                                "text-[10px]",
                                                isOwn ? "text-gray-400" : "text-gray-400"
                                            )}>
                                                {formatTime(message.createdAt)}
                                            </span>
                                            <MessageStatus message={message} />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                {/* Emoji Picker */}
                <AnimatePresence>
                    {showEmojis && (
                        <motion.div
                            ref={emojiRef}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex flex-wrap gap-2">
                                {QUICK_EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => addEmoji(emoji)}
                                        className="text-2xl hover:scale-125 transition-transform p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-2">
                    {/* Attachment button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>

                    {/* Emoji button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmojis(!showEmojis)}
                        className={cn(
                            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                            showEmojis && "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
                        )}
                    >
                        <Smile className="w-5 h-5" />
                    </Button>

                    {/* Input */}
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Écrire un message..."
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl pr-4 focus-visible:ring-emerald-500"
                        />
                    </div>

                    {/* Send button */}
                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className={cn(
                            "rounded-xl transition-all",
                            newMessage.trim()
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25"
                                : "bg-gray-200 dark:bg-gray-700"
                        )}
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
