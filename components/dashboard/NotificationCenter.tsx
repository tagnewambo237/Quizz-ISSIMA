"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Trophy, Zap, Star, X, Check } from "lucide-react"
import { useSession } from "next-auth/react"

interface Notification {
    id: string
    type: 'badge' | 'xp' | 'level_up' | 'achievement' | 'info'
    title: string
    message: string
    timestamp: Date
    read: boolean
    icon?: any
}

export function NotificationCenter() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (session?.user?.id) {
            fetchNotifications()
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000)
            return () => clearInterval(interval)
        }
    }, [session])

    const fetchNotifications = async () => {
        try {
            // Simuler des notifications basées sur les événements
            // Dans une vraie implémentation, cela viendrait de votre API
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
            ]

            setNotifications(mockNotifications)
            setUnreadCount(mockNotifications.filter(n => !n.read).length)
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'badge': return 'from-yellow-500 to-orange-500'
            case 'xp': return 'from-purple-500 to-pink-500'
            case 'level_up': return 'from-blue-500 to-cyan-500'
            case 'achievement': return 'from-green-500 to-emerald-500'
            default: return 'from-gray-500 to-gray-600'
        }
    }

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

        if (seconds < 60) return 'À l\'instant'
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
        return `Il y a ${Math.floor(seconds / 86400)}j`
    }

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Notifications Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-12 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#3a4794] to-[#4a5db0]">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Notifications
                                    </h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-white/80 hover:text-white font-medium flex items-center gap-1"
                                        >
                                            <Check className="h-3 w-3" />
                                            Tout marquer lu
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-y-auto max-h-[500px]">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">Aucune notification</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {notifications.map((notif) => {
                                            const Icon = notif.icon || Bell
                                            return (
                                                <motion.div
                                                    key={notif.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                        }`}
                                                    onClick={() => markAsRead(notif.id)}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br ${getNotificationColor(notif.type)} flex items-center justify-center shadow-lg`}>
                                                            <Icon className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                                                    {notif.title}
                                                                </p>
                                                                {!notif.read && (
                                                                    <span className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full"></span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                {getTimeAgo(notif.timestamp)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <button className="w-full text-center text-sm text-[#3a4794] dark:text-blue-400 hover:text-[#4a5db0] font-medium">
                                        Voir toutes les notifications
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
