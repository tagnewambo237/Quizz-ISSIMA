"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PusherProvider, useChannel } from '@/components/chat/ChatProvider'
import {
    MessagesSquare,
    ArrowLeft,
    Pin,
    Send,
    RefreshCw,
    MessageCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Forum {
    _id: string
    name: string
    description?: string
    type: string
    members: { _id: string; name: string; image?: string }[]
    allowStudentPosts: boolean
    createdBy: { _id: string; name: string }
    relatedClass?: { name: string }
}

interface Reply {
    _id: string
    authorId: { _id: string; name: string; image?: string; role?: string }
    content: string
    createdAt: string
}

interface Post {
    _id: string
    title?: string
    content: string
    authorId: { _id: string; name: string; image?: string; role?: string }
    isPinned: boolean
    replies: Reply[]
    replyCount: number
    createdAt: string
}

function ForumDetailContent() {
    const { data: session } = useSession()
    const params = useParams()
    const forumId = params.forumId as string

    const [forum, setForum] = useState<Forum | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [postsLoading, setPostsLoading] = useState(false)

    // New Post State
    const [newPost, setNewPost] = useState({ title: '', content: '' })
    const [showNewPost, setShowNewPost] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Replies State
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
    const [replyContent, setReplyContent] = useState<Record<string, string>>({})
    const [replyingTo, setReplyingTo] = useState<string | null>(null)

    // -------------------------------------------------------------------------
    // Real-time Updates
    // -------------------------------------------------------------------------

    // Listen for new posts
    useChannel(
        forumId ? `forum-${forumId}` : null,
        'new-post',
        (data) => {
            // Avoid duplicates if user just posted
            setPosts(prev => {
                if (prev.find(p => p._id === data.post._id)) return prev
                return [data.post, ...prev]
            })
        }
    )

    // Listen for new replies
    useChannel(
        forumId ? `forum-${forumId}` : null,
        'new-reply',
        (data) => {
            setPosts(prev => prev.map(post => {
                if (post._id === data.postId) {
                    // Check if reply already exists
                    if (post.replies.find(r => r._id === data.reply._id)) return post

                    return {
                        ...post,
                        replies: [...post.replies, data.reply],
                        replyCount: (post.replyCount || 0) + 1
                    }
                }
                return post
            }))
        }
    )

    // -------------------------------------------------------------------------
    // Data Fetching
    // -------------------------------------------------------------------------

    const fetchForum = async () => {
        try {
            const res = await fetch(`/api/forums/${forumId}`)
            if (res.ok) {
                const data = await res.json()
                if (data.success) setForum(data.data)
            }
        } catch (err) {
            console.error('Error fetching forum:', err)
        }
    }

    const fetchPosts = async () => {
        setPostsLoading(true)
        try {
            const res = await fetch(`/api/forums/${forumId}/posts`)
            if (res.ok) {
                const data = await res.json()
                if (data.success) setPosts(data.data)
            }
        } catch (err) {
            console.error('Error fetching posts:', err)
        } finally {
            setPostsLoading(false)
        }
    }

    useEffect(() => {
        if (forumId) {
            Promise.all([fetchForum(), fetchPosts()]).finally(() => setLoading(false))
        }
    }, [forumId])

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    const togglePost = (postId: string) => {
        const newSet = new Set(expandedPosts)
        if (newSet.has(postId)) {
            newSet.delete(postId)
        } else {
            newSet.add(postId)
        }
        setExpandedPosts(newSet)
    }

    const handleSubmitPost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPost.content.trim()) return

        setSubmitting(true)
        try {
            const res = await fetch(`/api/forums/${forumId}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost)
            })
            if (res.ok) {
                setNewPost({ title: '', content: '' })
                setShowNewPost(false)
                fetchPosts() // Fallback if pusher fails
            }
        } catch (err) {
            console.error('Error creating post:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleSubmitReply = async (postId: string) => {
        const content = replyContent[postId]
        if (!content?.trim()) return

        setReplyingTo(postId)
        try {
            const res = await fetch(`/api/forums/${forumId}/posts/${postId}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })
            if (res.ok) {
                setReplyContent(prev => ({ ...prev, [postId]: '' }))
            }
        } catch (err) {
            console.error('Error sending reply:', err)
        } finally {
            setReplyingTo(null)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        })
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-[#2a3575]" /></div>
    }

    if (!forum) return <div>Forum introuvable</div>

    // Students can post if allowed by forum settings or if they are the creator (unlikely for students in this context, but good to keep logic loose)
    // Actually, in the teacher component: session?.user?.role === 'TEACHER' || forum.allowStudentPosts
    // Since this is the student view, we just check allowStudentPosts (unless the student somehow is the creator? unlikely but possible)
    const canPost = forum.allowStudentPosts

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/student/messages?tab=forums" className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MessagesSquare className="w-5 h-5 text-[#2a3575]" />
                                {forum.name}
                            </h1>
                            <p className="text-sm text-gray-500">{forum.members.length} membres • {posts.length} discussions</p>
                        </div>
                        <button onClick={fetchPosts} className="p-2 hover:bg-gray-100 rounded-lg">
                            <RefreshCw className={cn("w-5 h-5 text-gray-500", postsLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {/* Create Post Card */}
                {canPost && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                        {!showNewPost ? (
                            <div
                                onClick={() => setShowNewPost(true)}
                                className="flex items-center gap-3 cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold">
                                    {session?.user?.name?.charAt(0)}
                                </div>
                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2.5 text-gray-500 text-sm hover:bg-gray-200 transition-colors">
                                    Commencer une discussion...
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitPost} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Titre de la discussion (optionnel)"
                                    className="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-700 focus:outline-none bg-transparent font-medium"
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                    autoFocus
                                />
                                <textarea
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-none focus:ring-2 focus:ring-[#2a3575]/20 resize-none min-h-[100px]"
                                    placeholder="De quoi voulez-vous discuter ?"
                                    value={newPost.content}
                                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPost(false)}
                                        className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !newPost.content.trim()}
                                        className="px-6 py-2 bg-[#2a3575] text-white rounded-lg font-medium hover:bg-[#2a3575]/90 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Publier
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-4">
                    {posts.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Aucune discussion pour le moment.</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <motion.div
                                key={post._id}
                                layoutId={post._id}
                                className={cn(
                                    "bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow",
                                    post.isPinned && "border-l-4 border-l-[#2a3575]"
                                )}
                            >
                                {/* Post Content */}
                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold shrink-0">
                                            {post.authorId?.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900 dark:text-white">{post.authorId?.name}</span>
                                                    {post.authorId?.role === 'TEACHER' && (
                                                        <span className="bg-blue-100 text-[#2a3575] text-[10px] font-bold px-1.5 py-0.5 rounded">PROF</span>
                                                    )}
                                                    {post.isPinned && <Pin className="w-3 h-3 text-[#2a3575]" />}
                                                    <span className="text-xs text-gray-400">• {formatDate(post.createdAt)}</span>
                                                </div>
                                            </div>

                                            {post.title && <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>}
                                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                {post.content}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => togglePost(post._id)}
                                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2a3575] transition-colors"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            {post.replies?.length || 0} réponse{(post.replies?.length || 0) > 1 ? 's' : ''}
                                            {expandedPosts.has(post._id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => togglePost(post._id)}
                                            className="text-sm font-medium text-[#2a3575] hover:underline"
                                        >
                                            Répondre
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Replies Section */}
                                <AnimatePresence>
                                    {expandedPosts.has(post._id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700"
                                        >
                                            <div className="p-5 space-y-4">
                                                {/* Reply Input */}
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {session?.user?.name?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-white dark:bg-gray-800 border focus-within:ring-2 focus-within:ring-[#2a3575]/20 focus-within:border-[#2a3575] border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden transition-all">
                                                            <textarea
                                                                className="w-full p-3 text-sm bg-transparent border-none focus:ring-0 resize-none"
                                                                placeholder="Écrire une réponse..."
                                                                rows={1}
                                                                value={replyContent[post._id] || ''}
                                                                onChange={e => setReplyContent(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault()
                                                                        handleSubmitReply(post._id)
                                                                    }
                                                                }}
                                                            />
                                                            <div className="flex justify-end p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                                                <button
                                                                    onClick={() => handleSubmitReply(post._id)}
                                                                    disabled={!replyContent[post._id]?.trim() || replyingTo === post._id}
                                                                    className="px-3 py-1 bg-[#2a3575] text-white text-xs font-bold rounded-lg hover:bg-[#2a3575]/90 disabled:opacity-50"
                                                                >
                                                                    {replyingTo === post._id ? 'Envoi...' : 'Répondre'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Replies List */}
                                                <div className="space-y-4 pl-11">
                                                    {post.replies?.map((reply) => (
                                                        <div key={reply._id} className="group">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                                                                    {reply.authorId?.name?.charAt(0)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                                {reply.authorId?.name}
                                                                                {reply.authorId?.role === 'TEACHER' && (
                                                                                    <span className="ml-2 bg-blue-50 text-[#2a3575] text-[9px] px-1 rounded border border-blue-100">PROF</span>
                                                                                )}
                                                                            </span>
                                                                            <span className="text-[10px] text-gray-400">{formatDate(reply.createdAt)}</span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ForumDetailPage() {
    return (
        <PusherProvider>
            <ForumDetailContent />
        </PusherProvider>
    )
}
