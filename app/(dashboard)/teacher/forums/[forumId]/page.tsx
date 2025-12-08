"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PusherProvider, useChannel } from '@/components/chat/ChatProvider'
import {
    MessagesSquare,
    ArrowLeft,
    Users,
    Pin,
    Send,
    RefreshCw,
    Clock,
    Settings,
    MoreVertical,
    Plus,
    MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Forum {
    _id: string
    name: string
    description?: string
    type: string
    postCount: number
    members: { _id: string; name: string; image?: string }[]
    allowStudentPosts: boolean
    createdBy: { _id: string; name: string }
    relatedClass?: { name: string }
}

interface Post {
    _id: string
    title?: string
    content: string
    authorId: { _id: string; name: string; image?: string; role?: string }
    isPinned: boolean
    isAnnouncement: boolean
    replies: {
        _id: string
        authorId: { _id: string; name: string; image?: string }
        content: string
        createdAt: string
    }[]
    replyCount: number
    createdAt: string
}

function ForumDetailContent() {
    const { data: session } = useSession()
    const params = useParams()
    const router = useRouter()
    const forumId = params.forumId as string

    const [forum, setForum] = useState<Forum | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [postsLoading, setPostsLoading] = useState(false)

    const [newPost, setNewPost] = useState({ title: '', content: '' })
    const [showNewPost, setShowNewPost] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Real-time updates
    useChannel(
        forumId ? `forum-${forumId}` : null,
        'new-post',
        (data) => {
            setPosts(prev => [data.post, ...prev])
        }
    )

    // Fetch forum details
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

    // Fetch posts
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
        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchForum(), fetchPosts()])
            setLoading(false)
        }
        if (forumId) loadData()
    }, [forumId])

    // Submit new post
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
                fetchPosts()
            }
        } catch (err) {
            console.error('Error creating post:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#2a3575] animate-spin" />
            </div>
        )
    }

    if (!forum) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <MessagesSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Forum introuvable</h2>
                    <Link href="/teacher/messages" className="text-[#2a3575] hover:underline mt-2 inline-block">
                        Retour aux messages
                    </Link>
                </div>
            </div>
        )
    }

    const isOwner = forum.createdBy._id === session?.user?.id
    const canPost = session?.user?.role === 'TEACHER' || forum.allowStudentPosts

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/teacher/messages?tab=forums"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MessagesSquare className="w-5 h-5 text-[#2a3575]" />
                                    {forum.name}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {forum.relatedClass?.name || forum.type} • {forum.members.length} membres • {posts.length} posts
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { fetchForum(); fetchPosts(); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <RefreshCw className={cn("w-5 h-5", postsLoading && "animate-spin")} />
                            </button>
                            {isOwner && (
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <Settings className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {/* New Post Button/Form */}
                {canPost && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {!showNewPost ? (
                            <button
                                onClick={() => setShowNewPost(true)}
                                className="w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold">
                                    {session?.user?.name?.charAt(0) || '?'}
                                </div>
                                <span className="text-gray-500">Créer un nouveau post...</span>
                            </button>
                        ) : (
                            <form onSubmit={handleSubmitPost} className="p-4 space-y-4">
                                <input
                                    type="text"
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    placeholder="Titre (optionnel)"
                                />
                                <textarea
                                    value={newPost.content}
                                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
                                    placeholder="Écrivez votre message..."
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowNewPost(false); setNewPost({ title: '', content: '' }); }}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !newPost.content.trim()}
                                        className="px-4 py-2 bg-[#2a3575] text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                        {submitting ? 'Envoi...' : 'Publier'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Posts List */}
                {postsLoading && posts.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-[#2a3575] animate-spin" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun post</h3>
                        <p className="text-gray-500">Soyez le premier à poster dans ce forum</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5",
                                    post.isPinned && "border-[#2a3575]/50 bg-[#2a3575]/5"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {post.authorId?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {post.authorId?.name || 'Anonyme'}
                                            </span>
                                            {post.authorId?.role === 'TEACHER' && (
                                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#2a3575]/10 text-[#2a3575]">
                                                    Enseignant
                                                </span>
                                            )}
                                            {post.isPinned && (
                                                <Pin className="w-3 h-3 text-[#2a3575]" />
                                            )}
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(post.createdAt)}
                                            </span>
                                        </div>
                                        {post.title && (
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                                        )}
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>

                                        {/* Replies Preview */}
                                        {post.replyCount > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <p className="text-sm text-gray-500">
                                                    {post.replyCount} réponse{post.replyCount > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
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
