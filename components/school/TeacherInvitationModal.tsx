"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Copy, Mail, FileSpreadsheet, Check } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

// --- Sub-Components (Inline for simplicity, but could be separate files if reused) ---

function InviteByLink({ schoolId }: { schoolId: string }) {
    const [link, setLink] = useState("")
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    const fetchLink = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/schools/${schoolId}/invitations`)
            const data = await res.json()
            if (data.link) setLink(data.link)
        } catch (err) {
            console.error(err)
            toast.error("Erreur lors de la génération du lien")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLink()
    }, [schoolId])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success("Lien copié !")
    }

    return (
        <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto text-blue-600">
                    <Copy className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Partager le lien d'invitation</h3>
                <p className="text-sm text-gray-500">
                    Envoyez ce lien aux enseignants pour qu'ils rejoignent l'établissement.
                </p>
            </div>

            <div className="relative">
                <input
                    type="text"
                    readOnly
                    value={loading ? "Génération du lien..." : link}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-12 text-sm text-gray-600 dark:text-gray-300 font-mono"
                />
                <button
                    onClick={copyToClipboard}
                    disabled={loading || !link}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500"
                >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
            </div>
        </div>
    )
}

function InviteManual({ schoolId, onClose }: { schoolId: string, onClose: () => void }) {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`/api/schools/${schoolId}/invitations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "INDIVIDUAL", email, name })
            })
            if (res.ok) {
                toast.success("Invitation envoyée !")
                onClose()
            } else {
                toast.error("Erreur lors de l'envoi")
            }
        } catch (err) {
            console.error(err)
            toast.error("Erreur technique")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto text-purple-600">
                    <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inviter par email</h3>
                <p className="text-sm text-gray-500">L'enseignant recevra un email pour rejoindre l'établissement.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Nom complet</label>
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="Ex: Jean Dupont"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Email</label>
                    <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="Ex: jean.dupont@ecole.com"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 mt-4"
            >
                {loading ? "Envoi..." : "Envoyer l'invitation"}
            </button>
        </form>
    )
}

function InviteImport({ schoolId, onClose }: { schoolId: string, onClose: () => void }) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFile(file)
        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws)
            // Expecting columns 'name' and 'email'
            setPreview(data.slice(0, 5)) // Preview first 5
        }
        reader.readAsBinaryString(file)
    }

    const handleImport = async () => {
        if (!file) return
        setLoading(true)

        // Re-read file to get full data
        const reader = new FileReader()
        reader.onload = async (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws)

            // Normalize keys
            const normalizedData = data.map((row: any) => ({
                name: row.name || row.Nom || row.Name,
                email: row.email || row.Email
            })).filter((r: any) => r.name && r.email)

            try {
                const res = await fetch(`/api/schools/${schoolId}/invitations`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "BATCH", teachers: normalizedData })
                })
                const result = await res.json()
                if (res.ok) {
                    toast.success(`${result.invited + result.enrolled} enseignants traités !`)
                    onClose()
                } else {
                    toast.error("Erreur lors de l'import")
                }
            } catch (err) {
                console.error(err)
                toast.error("Erreur technique")
            } finally {
                setLoading(false)
            }
        }
        reader.readAsBinaryString(file)
    }

    return (
        <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Importer depuis Excel</h3>
                <p className="text-sm text-gray-500">Importez une liste d'enseignants (colonnes: nom, email).</p>
            </div>

            {!file ? (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <p className="text-gray-500">Cliquez ou glissez un fichier Excel ici</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex justify-between items-center">
                        <span className="font-medium truncate">{file.name}</span>
                        <button onClick={() => { setFile(null); setPreview([]) }} className="text-red-500 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {preview.length > 0 && (
                        <div className="border rounded-xl overflow-hidden text-sm">
                            <table className="w-full">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Nom</th>
                                        <th className="px-4 py-2 text-left">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row: any, i) => (
                                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                                            <td className="px-4 py-2">{row.name || row.Nom}</td>
                                            <td className="px-4 py-2">{row.email || row.Email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="p-2 text-xs text-center text-gray-400 bg-gray-50 dark:bg-gray-800">
                                Aperçu des 5 premières lignes
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleImport}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Importation..." : "Importer les enseignants"}
                    </button>
                </div>
            )}
        </div>
    )
}

// --- Main Modal Component ---

export function TeacherInvitationModal({ isOpen, onClose, schoolId }: { isOpen: boolean, onClose: () => void, schoolId: string }) {
    const [activeTab, setActiveTab] = useState<'link' | 'manual' | 'import'>('link')

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inviter des enseignants</h2>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex p-2 gap-2 bg-gray-50 dark:bg-gray-900/50 mx-6 mt-6 rounded-xl">
                                {[
                                    { id: 'link', label: 'Lien', icon: Copy },
                                    { id: 'manual', label: 'Email', icon: Mail },
                                    { id: 'import', label: 'Import', icon: FileSpreadsheet },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id
                                                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            }`}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'link' && (
                                        <motion.div key="link" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                            <InviteByLink schoolId={schoolId} />
                                        </motion.div>
                                    )}
                                    {activeTab === 'manual' && (
                                        <motion.div key="manual" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                            <InviteManual schoolId={schoolId} onClose={onClose} />
                                        </motion.div>
                                    )}
                                    {activeTab === 'import' && (
                                        <motion.div key="import" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                            <InviteImport schoolId={schoolId} onClose={onClose} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
