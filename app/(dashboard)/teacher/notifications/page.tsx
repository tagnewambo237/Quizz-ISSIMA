"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Trophy, Zap, Star, Check, Filter, Trash2, Info, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"

interface Notification {
    id: string
    type: 'badge' | 'xp' | 'level_up' | 'achievement' | 'info' | 'system'
    title: string
    message: string
    timestamp: Date
    read: boolean
    icon?: any
}

export default function NotificationsPage() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [filter, setFilter] = useState<'all' | 'unread' | 'system'>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            // Mock data - Replace with API call
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    type: 'badge',
                    title: 'Nouveau Badge!',
                    message: 'Badge "Mentor Expert" débloqué',
                    timestamp: new Date(Date.now() - 5 * 60000),
                    read: false,
                    icon: Trophy
                },
                {
                    id: '2',
                    type: 'xp',
                    title: '+200 XP',
                    message: 'Classe complétée avec succès',
                    timestamp: new Date(Date.now() - 60 * 60000),
                    read: false,
                    icon: Zap
                },
                {
                    id: '3',
                    type: 'level_up',
                    title: 'Level Up!',
                    message: 'Vous êtes maintenant niveau 15',
                    timestamp: new Date(Date.now() - 2 * 60 * 60000),
                    read: true,
                    icon: Star
                },
                {
                    id: '4',
                    type: 'system',
                    title: 'Maintenance Prévue',
                    message: 'La plateforme sera en maintenance ce soir à 22h.',
                    timestamp: new Date(Date.now() - 24 * 60 * 60000),
                    read: true,
                    icon: Info
                },
            ]
            setNotifications(mockNotifications)
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'badge': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
            case 'xp': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
            case 'level_up': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            case 'achievement': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
            case 'system': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'badge': return Trophy
            case 'xp': return Zap
            case 'level_up': return Star
            case 'achievement': return Trophy
            case 'system': return AlertCircle
            default: return Bell
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read
        if (filter === 'system') return n.type === 'system'
        return true
    })

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Bell className="h-8 w-8 text-secondary" />
                        Notifications
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Restez informé de votre progression et des mises à jour système
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <Check className="h-4 w-4" />
                        Tout marquer lu
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'Toutes' },
                    { id: 'unread', label: 'Non lues' },
                    { id: 'system', label: 'Système' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === f.id
                                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"
                        >
                            <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Aucune notification pour le moment</p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((notif) => {
                            const Icon = getIcon(notif.type)
                            return (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative group p-6 rounded-2xl border transition-all ${notif.read
                                            ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                            : 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center ${getNotificationColor(notif.type)}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className={`font-bold text-lg ${notif.read ? 'text-gray-900 dark:text-white' : 'text-blue-900 dark:text-blue-100'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(notif.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                        {!notif.read && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-600"
                                                title="Marquer comme lu"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notif.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
