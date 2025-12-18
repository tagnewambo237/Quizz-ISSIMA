"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    X,
    Copy,
    Mail,
    FileSpreadsheet,
    Check,
    Search,
    UserPlus,
    BookOpen,
    Shield,
    ChevronDown,
    Loader2,
    AlertCircle,
    Info,
    Users
} from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type InvitationMode = 'school' | 'class'

interface Teacher {
    _id: string
    name: string
    email: string
    image?: string
}

interface Subject {
    _id: string
    name: string
    code?: string
}

/**
 * Permission options for teachers in a class
 */
const PERMISSION_OPTIONS = [
    { id: 'CREATE_EXAM', label: 'Créer des évaluations', description: 'Peut créer de nouveaux examens et quiz', group: 'Évaluations' },
    { id: 'EDIT_EXAM', label: 'Modifier les évaluations', description: 'Peut modifier les examens existants', group: 'Évaluations' },
    { id: 'DELETE_EXAM', label: 'Supprimer les évaluations', description: 'Peut supprimer des examens', group: 'Évaluations' },
    { id: 'PUBLISH_EXAM', label: 'Publier les évaluations', description: 'Peut rendre les examens accessibles aux élèves', group: 'Évaluations' },
    { id: 'GRADE_STUDENTS', label: 'Noter les élèves', description: 'Peut corriger et noter les copies', group: 'Élèves' },
    { id: 'VIEW_STUDENTS', label: 'Voir les élèves', description: 'Peut voir la liste et les infos des élèves', group: 'Élèves' },
    { id: 'MANAGE_STUDENTS', label: 'Gérer les élèves', description: 'Peut ajouter/retirer des élèves', group: 'Élèves' },
    { id: 'CREATE_FORUM', label: 'Créer des forums', description: 'Peut créer des espaces de discussion', group: 'Communication' },
    { id: 'SEND_MESSAGES', label: 'Envoyer des messages', description: 'Peut communiquer avec la classe', group: 'Communication' },
    { id: 'INVITE_TEACHERS', label: 'Inviter des enseignants', description: 'Peut inviter d\'autres collègues', group: 'Administration' },
    { id: 'VIEW_ANALYTICS', label: 'Voir les statistiques', description: 'Peut consulter les rapports et analyses', group: 'Administration' },
    { id: 'EDIT_CLASS_INFO', label: 'Modifier la classe', description: 'Peut modifier les infos de la classe', group: 'Administration' }
]

/**
 * Role presets with their default permissions
 */
const ROLE_PRESETS = [
    {
        id: 'COLLABORATOR',
        label: 'Collaborateur',
        description: 'Peut gérer les évaluations et noter les élèves',
        color: 'bg-blue-500',
        defaultPermissions: ['CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'PUBLISH_EXAM', 'GRADE_STUDENTS', 'VIEW_STUDENTS', 'CREATE_FORUM', 'SEND_MESSAGES', 'VIEW_ANALYTICS']
    },
    {
        id: 'ASSISTANT',
        label: 'Assistant',
        description: 'Peut noter les élèves et voir les statistiques',
        color: 'bg-green-500',
        defaultPermissions: ['VIEW_STUDENTS', 'GRADE_STUDENTS', 'VIEW_ANALYTICS']
    }
]

// ============================================================================
// SUB-COMPONENTS FOR SCHOOL INVITATIONS
// ============================================================================

function InviteByLink({ schoolId }: { schoolId: string }) {
    const [link, setLink] = useState("")
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    const fetchLink = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/schools/${schoolId}/invitations`)
            const data = await res.json()
            if (data.link) {
                // Construire l'URL complète si c'est un chemin relatif
                const fullLink = data.link.startsWith('http')
                    ? data.link
                    : `${window.location.origin}${data.link.startsWith('/') ? '' : '/'}${data.link}`
                setLink(fullLink)
            }
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

function InviteManualSchool({ schoolId, onClose }: { schoolId: string, onClose: () => void }) {
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

function InviteImportSchool({ schoolId, onClose }: { schoolId: string, onClose: () => void }) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const downloadTemplate = () => {
        // Créer un fichier Excel template
        const templateData = [
            { name: 'Jean Dupont', email: 'jean.dupont@ecole.com' },
            { name: 'Marie Martin', email: 'marie.martin@ecole.com' },
            { name: 'Pierre Durand', email: 'pierre.durand@ecole.com' }
        ]

        const ws = XLSX.utils.json_to_sheet(templateData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Enseignants')

        // Télécharger le fichier
        XLSX.writeFile(wb, 'modele_enseignants.xlsx')
        toast.success('Modèle téléchargé !')
    }

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
            setPreview(data.slice(0, 5))
        }
        reader.readAsBinaryString(file)
    }

    const handleImport = async () => {
        if (!file) return
        setLoading(true)

        const reader = new FileReader()
        reader.onload = async (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws)

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

                {/* Bouton de téléchargement du modèle */}
                <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    Télécharger le modèle
                </button>
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

// ============================================================================
// CLASS MANAGEMENT COMPONENTS
// ============================================================================

/**
 * ManageClassTeachers
 * Component to view, edit, and remove existing teachers in a class
 */
interface ManageClassTeachersProps {
    classId: string
    className?: string
    onClose: () => void
    onTeacherUpdated?: () => void
}

interface ClassTeacher {
    teacher: {
        _id: string
        name: string
        email: string
        image?: string
    }
    subject: {
        _id: string
        name: string
        code?: string
    }
    role: string
    permissions: string[]
    addedBy?: {
        _id: string
        name: string
    }
    addedAt: string
    isActive: boolean
}

function ManageClassTeachers({ classId, className, onClose, onTeacherUpdated }: ManageClassTeachersProps) {
    const [teachers, setTeachers] = useState<ClassTeacher[]>([])
    const [loading, setLoading] = useState(true)
    const [editingTeacher, setEditingTeacher] = useState<ClassTeacher | null>(null)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [selectedRole, setSelectedRole] = useState<string>('COLLABORATOR')
    const [updating, setUpdating] = useState(false)

    // Fetch teachers
    const fetchTeachers = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/classes/${classId}/teachers`)
            if (res.ok) {
                const data = await res.json()
                setTeachers(data.data || [])
            }
        } catch (err) {
            console.error('Error fetching teachers:', err)
            toast.error('Erreur lors du chargement des enseignants')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeachers()
    }, [classId])

    const handleEditTeacher = (teacher: ClassTeacher) => {
        setEditingTeacher(teacher)
        setSelectedPermissions(teacher.permissions)
        setSelectedRole(teacher.role)
    }

    const handleUpdatePermissions = async () => {
        if (!editingTeacher) return
        setUpdating(true)
        try {
            const res = await fetch(`/api/classes/${classId}/teachers`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: editingTeacher.teacher._id,
                    subjectId: editingTeacher.subject._id,
                    permissions: selectedPermissions,
                    role: selectedRole
                })
            })

            const data = await res.json()
            if (res.ok && data.success) {
                toast.success('Permissions mises à jour !')
                setEditingTeacher(null)
                fetchTeachers()
                onTeacherUpdated?.()
            } else {
                toast.error(data.error || 'Erreur lors de la mise à jour')
            }
        } catch (err) {
            console.error('Error updating teacher:', err)
            toast.error('Erreur de connexion')
        } finally {
            setUpdating(false)
        }
    }

    const handleRemoveTeacher = async (teacher: ClassTeacher) => {
        if (!confirm(`Voulez-vous vraiment retirer ${teacher.teacher.name} de cette classe ?`)) {
            return
        }

        try {
            const res = await fetch(
                `/api/classes/${classId}/teachers?teacherId=${teacher.teacher._id}&subjectId=${teacher.subject._id}`,
                { method: 'DELETE' }
            )

            const data = await res.json()
            if (res.ok && data.success) {
                toast.success('Enseignant retiré !')
                fetchTeachers()
                onTeacherUpdated?.()
            } else {
                toast.error(data.error || 'Erreur lors de la suppression')
            }
        } catch (err) {
            console.error('Error removing teacher:', err)
            toast.error('Erreur de connexion')
        }
    }

    const handleRoleChange = (roleId: string) => {
        setSelectedRole(roleId)
        const preset = ROLE_PRESETS.find(r => r.id === roleId)
        if (preset) setSelectedPermissions(preset.defaultPermissions)
    }

    const togglePermission = (permId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
        )
    }

    const permissionGroups = PERMISSION_OPTIONS.reduce((acc, perm) => {
        if (!acc[perm.group]) acc[perm.group] = []
        acc[perm.group].push(perm)
        return acc
    }, {} as Record<string, typeof PERMISSION_OPTIONS>)

    // Edit modal
    if (editingTeacher) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Modifier les droits</h3>
                    <button onClick={() => setEditingTeacher(null)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Teacher info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold">
                            {editingTeacher.teacher.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{editingTeacher.teacher.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {editingTeacher.subject.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Role selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Niveau d'accès</label>
                    <div className="grid grid-cols-2 gap-3">
                        {ROLE_PRESETS.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleChange(role.id)}
                                className={cn(
                                    "p-4 rounded-xl border transition-all text-left",
                                    selectedRole === role.id
                                        ? "border-[#2a3575] bg-[#2a3575]/5"
                                        : "border-gray-200 dark:border-gray-700 hover:border-[#2a3575]/50"
                                )}
                            >
                                <div className={cn("w-3 h-3 rounded-full mb-2", role.color)} />
                                <p className="font-semibold text-gray-900 dark:text-white">{role.label}</p>
                                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4 max-h-60 overflow-y-auto">
                    {Object.entries(permissionGroups).map(([group, perms]) => (
                        <div key={group}>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{group}</p>
                            <div className="space-y-1">
                                {perms.map((perm) => (
                                    <label key={perm.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPermissions.includes(perm.id)}
                                            onChange={() => togglePermission(perm.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#2a3575] focus:ring-[#2a3575]"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{perm.label}</p>
                                            <p className="text-xs text-gray-500">{perm.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setEditingTeacher(null)}
                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleUpdatePermissions}
                        disabled={updating}
                        className="flex-1 py-3 bg-[#2a3575] text-white rounded-xl font-bold hover:bg-[#2a3575]/90 transition-colors disabled:opacity-50"
                    >
                        {updating ? 'Mise à jour...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        )
    }

    // Main list view
    return (
        <div className="p-6 space-y-4">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enseignants de la classe</h3>
                <p className="text-sm text-gray-500">Gérez les enseignants et leurs permissions</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2a3575]" />
                </div>
            ) : teachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Aucun enseignant collaborateur dans cette classe
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto p-1">
                    {teachers.map((teacher) => (
                        <div
                            key={`${teacher.teacher._id}-${teacher.subject._id}`}
                            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#2a3575]/50 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {teacher.teacher.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">{teacher.teacher.name}</p>
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            teacher.role === 'COLLABORATOR' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                            teacher.role === 'ASSISTANT' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        )}>
                                            {teacher.role === 'COLLABORATOR' ? 'Collaborateur' :
                                             teacher.role === 'ASSISTANT' ? 'Assistant' : teacher.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mb-1">{teacher.teacher.email}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{teacher.subject.name}</span>
                                        {teacher.subject.code && (
                                            <span className="text-xs text-gray-400">({teacher.subject.code})</span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {teacher.permissions.slice(0, 3).map(perm => {
                                            const permOption = PERMISSION_OPTIONS.find(p => p.id === perm)
                                            return (
                                                <span key={perm} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-md text-gray-600 dark:text-gray-300">
                                                    {permOption?.label || perm}
                                                </span>
                                            )
                                        })}
                                        {teacher.permissions.length > 3 && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-md text-gray-600 dark:text-gray-300">
                                                +{teacher.permissions.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => handleEditTeacher(teacher)}
                                    className="flex-1 py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    Modifier
                                </button>
                                <button
                                    onClick={() => handleRemoveTeacher(teacher)}
                                    className="flex-1 py-2 px-4 border border-red-200 dark:border-red-900/50 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Retirer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ============================================================================
// CLASS INVITATION COMPONENT (WITH SUBJECT & PERMISSIONS)
// ============================================================================

interface ClassInviteContentProps {
    classId: string
    className?: string
    onClose: () => void
    onTeacherAdded?: () => void
}

function ClassInviteContent({ classId, className, onClose, onTeacherAdded }: ClassInviteContentProps) {
    // State
    const [step, setStep] = useState<'teacher' | 'subject' | 'permissions'>('teacher')
    const [teacherMode, setTeacherMode] = useState<'search' | 'manual'>('search')
    const [searchQuery, setSearchQuery] = useState('')
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Manual teacher creation state
    const [manualName, setManualName] = useState('')
    const [manualEmail, setManualEmail] = useState('')
    const [creatingTeacher, setCreatingTeacher] = useState(false)

    // Selection state
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
    const [selectedRole, setSelectedRole] = useState<string>('COLLABORATOR')
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(ROLE_PRESETS[0].defaultPermissions)
    const [showAdvancedPermissions, setShowAdvancedPermissions] = useState(false)

    // Search teachers
    const searchTeachers = async (query: string) => {
        if (query.length < 2) {
            setTeachers([])
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`/api/teachers?search=${encodeURIComponent(query)}`)
            if (res.ok) {
                const data = await res.json()
                setTeachers(data.data || data.teachers || [])
            }
        } catch (err) {
            console.error('Error searching teachers:', err)
        } finally {
            setLoading(false)
        }
    }

    // Create teacher manually
    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!manualName || !manualEmail) return

        setCreatingTeacher(true)
        try {
            const res = await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: manualName, email: manualEmail })
            })
            const data = await res.json()

            if (res.ok && data.success) {
                const newTeacher = data.data
                setSelectedTeacher({
                    _id: newTeacher._id,
                    name: newTeacher.name,
                    email: newTeacher.email
                })
                toast.success(data.message || 'Enseignant créé !')
                setStep('subject')
            } else {
                toast.error(data.error || 'Erreur lors de la création')
            }
        } catch (err) {
            console.error('Error creating teacher:', err)
            toast.error('Erreur de connexion')
        } finally {
            setCreatingTeacher(false)
        }
    }

    // Fetch subjects
    const fetchSubjects = async () => {
        try {
            const res = await fetch('/api/subjects?isActive=true')
            if (res.ok) {
                const data = await res.json()
                setSubjects(data.data || [])
            }
        } catch (err) {
            console.error('Error fetching subjects:', err)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) searchTeachers(searchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        fetchSubjects()
    }, [])

    const handleRoleChange = (roleId: string) => {
        setSelectedRole(roleId)
        const preset = ROLE_PRESETS.find(r => r.id === roleId)
        if (preset) setSelectedPermissions(preset.defaultPermissions)
    }

    const togglePermission = (permId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
        )
    }

    const handleSubmit = async () => {
        if (!selectedTeacher || !selectedSubject) return

        setSubmitting(true)
        try {
            const res = await fetch(`/api/classes/${classId}/teachers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: selectedTeacher._id,
                    subjectId: selectedSubject._id,
                    role: selectedRole,
                    permissions: selectedPermissions
                })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                toast.success(`${selectedTeacher.name} a été ajouté à la classe !`)
                onTeacherAdded?.()
                onClose()
            } else {
                toast.error(data.error || 'Erreur lors de l\'ajout')
            }
        } catch (err) {
            console.error('Error adding teacher:', err)
            toast.error('Erreur de connexion')
        } finally {
            setSubmitting(false)
        }
    }

    const permissionGroups = PERMISSION_OPTIONS.reduce((acc, perm) => {
        if (!acc[perm.group]) acc[perm.group] = []
        acc[perm.group].push(perm)
        return acc
    }, {} as Record<string, typeof PERMISSION_OPTIONS>)

    return (
        <div className="flex flex-col h-full">
            {/* Progress Steps */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
                {[
                    { id: 'teacher', label: 'Enseignant', icon: UserPlus },
                    { id: 'subject', label: 'Matière', icon: BookOpen },
                    { id: 'permissions', label: 'Droits', icon: Shield }
                ].map((s) => {
                    const isActive = s.id === step
                    const isPast = (step === 'subject' && s.id === 'teacher') ||
                        (step === 'permissions' && ['teacher', 'subject'].includes(s.id))
                    const Icon = s.icon
                    return (
                        <div
                            key={s.id}
                            className={cn(
                                "flex-1 py-2 px-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-all",
                                isActive ? "bg-[#2a3575] text-white" :
                                    isPast ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                        "bg-gray-200 dark:bg-gray-700 text-gray-500"
                            )}
                        >
                            {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                    )
                })}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {/* Step 1: Select Teacher */}
                    {step === 'teacher' && (
                        <motion.div key="teacher" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sélectionner un enseignant</h3>
                                <p className="text-sm text-gray-500">Recherchez ou créez un enseignant</p>
                            </div>

                            {/* Mode Tabs */}
                            <div className="flex p-1 gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                <button
                                    onClick={() => setTeacherMode('search')}
                                    className={cn(
                                        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                                        teacherMode === 'search'
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <Search className="w-4 h-4" />
                                    Rechercher
                                </button>
                                <button
                                    onClick={() => setTeacherMode('manual')}
                                    className={cn(
                                        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                                        teacherMode === 'manual'
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <Mail className="w-4 h-4" />
                                    Créer
                                </button>
                            </div>

                            {teacherMode === 'search' ? (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher par nom ou email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#2a3575]/20 focus:border-[#2a3575] transition-all"
                                            autoFocus
                                        />
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-[#2a3575]" />
                                        </div>
                                    ) : teachers.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
                                            {teachers.map((teacher) => (
                                                <button
                                                    key={teacher._id}
                                                    onClick={() => { setSelectedTeacher(teacher); setStep('subject') }}
                                                    className={cn(
                                                        "p-4 rounded-xl border transition-all flex items-center gap-4 text-left hover:shadow-md",
                                                        selectedTeacher?._id === teacher._id
                                                            ? "border-[#2a3575] bg-[#2a3575]/5"
                                                            : "border-gray-200 dark:border-gray-700 hover:border-[#2a3575]/50"
                                                    )}
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold shrink-0">
                                                        {teacher.name?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{teacher.name}</p>
                                                        <p className="text-sm text-gray-500 truncate">{teacher.email}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchQuery.length >= 2 ? (
                                        <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center h-full">
                                            <AlertCircle className="w-12 h-12 mb-3 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">Aucun enseignant trouvé</p>
                                            <p className="text-sm mb-4">Essayez un autre nom ou ajoutez-le manuellement.</p>
                                            <button
                                                onClick={() => setTeacherMode('manual')}
                                                className="px-4 py-2 bg-[#2a3575]/10 text-[#2a3575] rounded-lg font-medium hover:bg-[#2a3575]/20 transition-colors"
                                            >
                                                Créer un nouvel enseignant
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            Tapez au moins 2 caractères pour rechercher
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Manual creation form */
                                <form onSubmit={handleCreateTeacher} className="space-y-4">
                                    <div className="text-center mb-4">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto text-purple-600 mb-3">
                                            <UserPlus className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm text-gray-500">Créez un nouveau compte enseignant</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Nom complet *</label>
                                        <input
                                            required
                                            value={manualName}
                                            onChange={(e) => setManualName(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#2a3575]/20 focus:border-[#2a3575] outline-none transition-all"
                                            placeholder="Ex: Jean Dupont"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Email *</label>
                                        <input
                                            required
                                            type="email"
                                            value={manualEmail}
                                            onChange={(e) => setManualEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#2a3575]/20 focus:border-[#2a3575] outline-none transition-all"
                                            placeholder="Ex: jean.dupont@ecole.com"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={creatingTeacher || !manualName || !manualEmail}
                                        className="w-full py-3 bg-[#2a3575] text-white rounded-xl font-bold hover:bg-[#2a3575]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {creatingTeacher ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Création...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-5 h-5" />
                                                Créer et continuer
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}

                    {/* Step 2: Select Subject */}
                    {step === 'subject' && (
                        <motion.div key="subject" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Choisir la matière</h3>
                                <p className="text-sm text-gray-500">Quelle matière {selectedTeacher?.name} enseignera-t-il ?</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto p-1">
                                {subjects.map((subject) => (
                                    <button
                                        key={subject._id}
                                        onClick={() => { setSelectedSubject(subject); setStep('permissions') }}
                                        className={cn(
                                            "p-4 rounded-xl border transition-all text-left hover:shadow-md h-full flex flex-col",
                                            selectedSubject?._id === subject._id
                                                ? "border-[#2a3575] bg-[#2a3575]/5"
                                                : "border-gray-200 dark:border-gray-700 hover:border-[#2a3575]/50"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-[#2a3575]/10 flex items-center justify-center mb-3">
                                            <BookOpen className="w-5 h-5 text-[#2a3575]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1" title={subject.name}>
                                                {subject.name}
                                            </p>
                                            {subject.code && <p className="text-xs text-gray-500 mt-1">{subject.code}</p>}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setStep('teacher')} className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
                                ← Retour
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Set Permissions */}
                    {step === 'permissions' && (
                        <motion.div key="permissions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Définir les droits</h3>
                                <p className="text-sm text-gray-500">Que pourra faire {selectedTeacher?.name} ?</p>
                            </div>

                            {/* Summary */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#2a3575] to-[#359a53] flex items-center justify-center text-white font-bold">
                                        {selectedTeacher?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedTeacher?.name}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" />
                                            {selectedSubject?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Role Presets */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Niveau d'accès</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {ROLE_PRESETS.map((role) => (
                                        <button
                                            key={role.id}
                                            onClick={() => handleRoleChange(role.id)}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all text-left",
                                                selectedRole === role.id
                                                    ? "border-[#2a3575] bg-[#2a3575]/5"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-[#2a3575]/50"
                                            )}
                                        >
                                            <div className={cn("w-3 h-3 rounded-full mb-2", role.color)} />
                                            <p className="font-semibold text-gray-900 dark:text-white">{role.label}</p>
                                            <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Advanced Permissions Toggle */}
                            <button
                                onClick={() => setShowAdvancedPermissions(!showAdvancedPermissions)}
                                className="flex items-center gap-2 text-sm text-[#2a3575] font-medium hover:underline"
                            >
                                <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvancedPermissions && "rotate-180")} />
                                Personnaliser les permissions
                            </button>

                            <AnimatePresence>
                                {showAdvancedPermissions && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="space-y-4 pt-2 max-h-48 overflow-y-auto">
                                            {Object.entries(permissionGroups).map(([group, perms]) => (
                                                <div key={group}>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{group}</p>
                                                    <div className="space-y-1">
                                                        {perms.map((perm) => (
                                                            <label key={perm.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedPermissions.includes(perm.id)}
                                                                    onChange={() => togglePermission(perm.id)}
                                                                    className="w-4 h-4 rounded border-gray-300 text-[#2a3575] focus:ring-[#2a3575]"
                                                                />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{perm.label}</p>
                                                                    <p className="text-xs text-gray-500">{perm.description}</p>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button onClick={() => setStep('subject')} className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
                                ← Retour
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            {step === 'permissions' && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-3 bg-[#2a3575] text-white rounded-xl font-bold hover:bg-[#2a3575]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Ajout en cours...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Ajouter à la classe
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================

interface TeacherInvitationModalProps {
    isOpen: boolean
    onClose: () => void
    // For school invitations
    schoolId?: string
    // For class invitations (with subject & permissions)
    classId?: string
    className?: string
    onTeacherAdded?: () => void
}

/**
 * TeacherInvitationModal
 * 
 * A versatile modal for inviting teachers:
 * - To an establishment (school) via link, email, or Excel import
 * - To a class with subject selection and permission management
 * 
 * @example
 * // For school invitation
 * <TeacherInvitationModal isOpen={open} onClose={close} schoolId="xxx" />
 * 
 * // For class invitation with subject & permissions
 * <TeacherInvitationModal isOpen={open} onClose={close} classId="xxx" className="Tle C 2" />
 */
export function TeacherInvitationModal({
    isOpen,
    onClose,
    schoolId,
    classId,
    className,
    onTeacherAdded
}: TeacherInvitationModalProps) {
    const [activeTab, setActiveTab] = useState<'link' | 'manual' | 'import'>('link')
    const [classMode, setClassMode] = useState<'invite' | 'manage'>('invite')

    // Determine mode based on props
    const mode: InvitationMode = classId ? 'class' : 'school'

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setActiveTab('link')
            setClassMode('invite')
        }
    }, [isOpen])

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
                            className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col h-[600px] max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {mode === 'class' ? (
                                            <>
                                                <UserPlus className="w-5 h-5 text-[#2a3575]" />
                                                Inviter un enseignant
                                            </>
                                        ) : (
                                            <>
                                                <Users className="w-5 h-5 text-[#2a3575]" />
                                                Inviter des enseignants
                                            </>
                                        )}
                                    </h2>
                                    {mode === 'class' && className && (
                                        <p className="text-sm text-gray-500 mt-1">Classe: {className}</p>
                                    )}
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content based on mode */}
                            {mode === 'class' && classId ? (
                                <>
                                    {/* Class mode tabs */}
                                    <div className="flex p-2 gap-2 bg-gray-50 dark:bg-gray-900/50 mx-6 mt-6 rounded-xl">
                                        <button
                                            onClick={() => setClassMode('invite')}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all",
                                                classMode === 'invite'
                                                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            )}
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            Inviter
                                        </button>
                                        <button
                                            onClick={() => setClassMode('manage')}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all",
                                                classMode === 'manage'
                                                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            )}
                                        >
                                            <Users className="h-4 w-4" />
                                            Gérer
                                        </button>
                                    </div>

                                    {/* Class content */}
                                    <div className="overflow-y-auto flex-1">
                                        {classMode === 'invite' ? (
                                            <ClassInviteContent
                                                classId={classId}
                                                className={className}
                                                onClose={onClose}
                                                onTeacherAdded={onTeacherAdded}
                                            />
                                        ) : (
                                            <ManageClassTeachers
                                                classId={classId}
                                                className={className}
                                                onClose={onClose}
                                                onTeacherUpdated={onTeacherAdded}
                                            />
                                        )}
                                    </div>
                                </>
                            ) : schoolId ? (
                                <>
                                    {/* Tabs for school mode */}
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

                                    {/* School content */}
                                    <div className="p-6 overflow-y-auto">
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'link' && (
                                                <motion.div key="link" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                                    <InviteByLink schoolId={schoolId} />
                                                </motion.div>
                                            )}
                                            {activeTab === 'manual' && (
                                                <motion.div key="manual" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                                    <InviteManualSchool schoolId={schoolId} onClose={onClose} />
                                                </motion.div>
                                            )}
                                            {activeTab === 'import' && (
                                                <motion.div key="import" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                                    <InviteImportSchool schoolId={schoolId} onClose={onClose} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Veuillez spécifier un schoolId ou un classId</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
