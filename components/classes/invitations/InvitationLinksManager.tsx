"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    Link as LinkIcon,
    Users,
    Clock,
    MoreVertical,
    Trash2,
    RefreshCw,
    Copy,
    Check,
    Ban,
    Eye,
    QrCode,
    Download,
    Loader2,
    Plus
} from "lucide-react"
import { toast } from "sonner"
import QRCodeLib from "qrcode"

interface InvitationLink {
    _id: string
    token: string
    status: 'PENDING' | 'EXPIRED' | 'REVOKED'
    expiresAt?: string
    maxUses?: number
    currentUses: number
    description?: string
    createdAt: string
    registeredStudents: { _id: string; name: string; email: string }[]
}

export function InvitationLinksManager() {
    const params = useParams()
    const classId = params.classId as string

    const [links, setLinks] = useState<InvitationLink[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [showQR, setShowQR] = useState<string | null>(null)
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

    const fetchLinks = async () => {
        try {
            const res = await fetch(`/api/classes/${classId}/invitations/links`)
            const data = await res.json()
            if (data.success) {
                setLinks(data.data)
            }
        } catch (error) {
            console.error("Error fetching links:", error)
            toast.error("Erreur lors du chargement des liens")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (classId) {
            fetchLinks()
        }
    }, [classId])

    const handleCopy = async (link: InvitationLink) => {
        const url = `${window.location.origin}/join/${link.token}`
        await navigator.clipboard.writeText(url)
        setCopiedId(link._id)
        toast.success("Lien copié !")
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleRevoke = async (linkId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir révoquer ce lien ?")) return

        setActionLoading(linkId)
        try {
            const res = await fetch(`/api/classes/${classId}/invitations/links/${linkId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success("Lien révoqué")
                fetchLinks()
            } else {
                toast.error("Erreur lors de la révocation")
            }
        } catch (error) {
            toast.error("Erreur de connexion")
        } finally {
            setActionLoading(null)
        }
    }

    const handleShowQR = async (link: InvitationLink) => {
        const url = `${window.location.origin}/join/${link.token}`
        try {
            const qrDataUrl = await QRCodeLib.toDataURL(url, {
                width: 300,
                margin: 2,
                color: { dark: '#1f2937', light: '#ffffff' }
            })
            setQrCodeUrl(qrDataUrl)
            setShowQR(link._id)
        } catch (error) {
            toast.error("Erreur lors de la génération du QR code")
        }
    }

    const downloadQR = () => {
        if (!qrCodeUrl) return
        const a = document.createElement('a')
        a.href = qrCodeUrl
        a.download = 'invitation-qrcode.png'
        a.click()
    }

    const getStatusBadge = (link: InvitationLink) => {
        if (link.status === 'REVOKED') {
            return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">Révoqué</span>
        }
        if (link.status === 'EXPIRED' || (link.expiresAt && new Date(link.expiresAt) < new Date())) {
            return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 rounded-full">Expiré</span>
        }
        if (link.maxUses && link.currentUses >= link.maxUses) {
            return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">Limite atteinte</span>
        }
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">Actif</span>
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Liens d'invitation ({links.length})
                </h3>
                <button
                    onClick={fetchLinks}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                    <RefreshCw className="h-4 w-4" />
                    Actualiser
                </button>
            </div>

            {links.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <LinkIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Aucun lien d'invitation créé</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {links.map((link) => (
                        <motion.div
                            key={link._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                        >
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <LinkIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getStatusBadge(link)}
                                            {link.description && (
                                                <span className="text-sm text-gray-500 truncate">
                                                    {link.description}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {link.currentUses}{link.maxUses ? `/${link.maxUses}` : ''} inscriptions
                                            </span>
                                            {link.expiresAt && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Expire le {new Date(link.expiresAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy(link)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Copier le lien"
                                    >
                                        {copiedId === link._id ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-gray-500" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleShowQR(link)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="QR Code"
                                    >
                                        <QrCode className="h-4 w-4 text-gray-500" />
                                    </button>
                                    <button
                                        onClick={() => setExpandedId(expandedId === link._id ? null : link._id)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Détails"
                                    >
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    </button>
                                    {link.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleRevoke(link._id)}
                                            disabled={actionLoading === link._id}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Révoquer"
                                        >
                                            {actionLoading === link._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                            ) : (
                                                <Ban className="h-4 w-4 text-red-500" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded details */}
                            {expandedId === link._id && link.registeredStudents.length > 0 && (
                                <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Apprenants inscrits via ce lien :
                                    </p>
                                    <div className="space-y-2">
                                        {link.registeredStudents.map((student) => (
                                            <div key={student._id} className="flex items-center gap-2 text-sm">
                                                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-medium text-purple-600">
                                                    {student.name[0]}
                                                </div>
                                                <span className="text-gray-900 dark:text-white">{student.name}</span>
                                                <span className="text-gray-500">{student.email}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowQR(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-sm w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4 text-center">QR Code d'invitation</h3>
                        <div className="flex justify-center mb-4">
                            <img src={qrCodeUrl} alt="QR Code" className="rounded-lg" />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={downloadQR}
                                className="flex-1 py-2 bg-secondary text-white rounded-xl font-medium flex items-center justify-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Télécharger
                            </button>
                            <button
                                onClick={() => setShowQR(null)}
                                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-xl font-medium"
                            >
                                Fermer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
