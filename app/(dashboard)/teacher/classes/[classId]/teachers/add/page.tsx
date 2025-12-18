"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, UserPlus, BookOpen, Shield, Check, Mail,
    ArrowLeft, Loader2, AlertCircle, Info, ChevronRight, User,
    FileSpreadsheet, Download, Upload, X, CheckCircle2, Users, Plus
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

// Types
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

interface ExcelTeacher {
    name: string
    email: string
    status?: 'pending' | 'success' | 'error'
    message?: string
    teacherId?: string
}

// Permissions Data
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
    { id: 'VIEW_ANALYTICS', label: 'Voir les statistiques', description: 'Peut consulter les rapports et analyses', group: 'Administration' },
]

const ROLE_PRESETS = [
    {
        id: 'COLLABORATOR',
        label: 'Collaborateur',
        description: 'Peut gérer les évaluations et noter les élèves',
        color: 'bg-blue-500',
        icon: Users,
        defaultPermissions: ['CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'PUBLISH_EXAM', 'GRADE_STUDENTS', 'VIEW_STUDENTS', 'CREATE_FORUM', 'SEND_MESSAGES', 'VIEW_ANALYTICS']
    },
    {
        id: 'ASSISTANT',
        label: 'Assistant',
        description: 'Peut noter les élèves et voir les statistiques',
        color: 'bg-green-500',
        icon: User,
        defaultPermissions: ['VIEW_STUDENTS', 'GRADE_STUDENTS', 'VIEW_ANALYTICS']
    }
]

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export default function AddClassTeacherPage() {
    const router = useRouter()
    const params = useParams()
    const classId = params.classId as string

    // Steps State
    const [currentStep, setCurrentStep] = useState(1)
    const [submitting, setSubmitting] = useState(false)

    // Data State
    const [searchQuery, setSearchQuery] = useState('')
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loadingTeachers, setLoadingTeachers] = useState(false)
    const [loadingSubjects, setLoadingSubjects] = useState(true)

    // Selection State
    const [teacherMode, setTeacherMode] = useState<'search' | 'manual' | 'excel'>('search')
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
    // MULTIPLE SUBJECTS SELECTION
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
    const [selectedRole, setSelectedRole] = useState<string>('COLLABORATOR')
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(ROLE_PRESETS[0].defaultPermissions)

    // Manual Creation State
    const [manualName, setManualName] = useState('')
    const [manualEmail, setManualEmail] = useState('')
    const [creatingTeacher, setCreatingTeacher] = useState(false)

    // Excel Import State
    const [excelTeachers, setExcelTeachers] = useState<ExcelTeacher[]>([])
    const [importingExcel, setImportingExcel] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    // --- Effects ---

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoadingSubjects(true)
                const res = await fetch('/api/subjects?isActive=true')
                if (res.ok) {
                    const data = await res.json()
                    setSubjects(data.data || [])
                }
            } catch (err) {
                console.error('Error fetching subjects:', err)
            } finally {
                setLoadingSubjects(false)
            }
        }
        fetchSubjects()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery && teacherMode === 'search') {
                searchTeachers(searchQuery)
            } else if (!searchQuery) {
                setTeachers([])
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, teacherMode])

    // --- Actions ---

    const searchTeachers = async (query: string) => {
        if (query.length < 2) {
            setTeachers([])
            return
        }
        setLoadingTeachers(true)
        try {
            const res = await fetch(`/api/teachers?search=${encodeURIComponent(query)}`)
            if (res.ok) {
                const data = await res.json()
                setTeachers(data.data || data.teachers || [])
            }
        } catch (err) {
            console.error('Error searching teachers:', err)
        } finally {
            setLoadingTeachers(false)
        }
    }

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
                toast.success(data.message || 'Enseignant créé avec succès!')
                setCurrentStep(2)
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

    // Submit for MULTIPLE subjects
    const handleSubmit = async () => {
        if (!selectedTeacher || selectedSubjects.length === 0) return

        setSubmitting(true)
        let successCount = 0
        let errorCount = 0

        // Create one entry per subject
        for (const subject of selectedSubjects) {
            try {
                const res = await fetch(`/api/classes/${classId}/teachers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teacherId: selectedTeacher._id,
                        subjectId: subject._id,
                        role: selectedRole,
                        permissions: selectedPermissions
                    })
                })

                const data = await res.json()

                if (res.ok && data.success) {
                    successCount++
                } else {
                    errorCount++
                    console.error(`Error adding for subject ${subject.name}:`, data.error)
                }
            } catch (err) {
                errorCount++
                console.error('Error adding teacher:', err)
            }
        }

        setSubmitting(false)

        if (successCount > 0) {
            const subjectNames = selectedSubjects.map(s => s.name).join(', ')
            toast.success(
                `${selectedTeacher.name} ajouté${selectedSubjects.length > 1 ? ' pour ' + successCount + ' matière(s)' : ''}: ${subjectNames}`,
                { duration: 5000 }
            )
            router.push(`/teacher/classes/${classId}?tab=teachers`)
        } else {
            toast.error('Erreur lors de l\'ajout')
        }
    }

    // --- Excel Functions ---

    const downloadTemplate = () => {
        const templateData = [
            { 'Nom complet': 'Jean Dupont', 'Email': 'jean.dupont@ecole.com' },
            { 'Nom complet': 'Marie Martin', 'Email': 'marie.martin@ecole.com' },
        ]

        const ws = XLSX.utils.json_to_sheet(templateData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Enseignants')

        ws['!cols'] = [{ wch: 25 }, { wch: 35 }]

        XLSX.writeFile(wb, 'modele_enseignants.xlsx')
        toast.success('Modèle téléchargé!')
    }

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)

        const file = e.dataTransfer.files[0]
        if (file) processExcelFile(file)
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) processExcelFile(file)
    }

    const processExcelFile = async (file: File) => {
        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            const teachers: ExcelTeacher[] = jsonData.map((row: any) => ({
                name: row['Nom complet'] || row['name'] || row['Nom'] || '',
                email: row['Email'] || row['email'] || row['E-mail'] || '',
                status: 'pending' as const
            })).filter(t => t.name && t.email)

            if (teachers.length === 0) {
                toast.error('Aucun enseignant valide trouvé dans le fichier')
                return
            }

            setExcelTeachers(teachers)
            toast.success(`${teachers.length} enseignant(s) détecté(s)`)
        } catch (err) {
            console.error('Error processing Excel:', err)
            toast.error('Erreur lors de la lecture du fichier')
        }
    }

    const importExcelTeachers = async () => {
        if (excelTeachers.length === 0) return

        setImportingExcel(true)
        const updatedTeachers = [...excelTeachers]

        for (let i = 0; i < updatedTeachers.length; i++) {
            try {
                const res = await fetch('/api/teachers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: updatedTeachers[i].name,
                        email: updatedTeachers[i].email
                    })
                })
                const data = await res.json()

                if (res.ok && data.success) {
                    updatedTeachers[i].status = 'success'
                    updatedTeachers[i].message = 'Créé avec succès'
                    updatedTeachers[i].teacherId = data.data._id
                } else {
                    updatedTeachers[i].status = 'error'
                    updatedTeachers[i].message = data.error || 'Erreur'
                }
            } catch (err) {
                updatedTeachers[i].status = 'error'
                updatedTeachers[i].message = 'Erreur réseau'
            }
            setExcelTeachers([...updatedTeachers])
        }

        setImportingExcel(false)
        const successCount = updatedTeachers.filter(t => t.status === 'success').length
        toast.success(`${successCount}/${updatedTeachers.length} enseignant(s) importé(s)`)
    }

    const selectExcelTeacher = (teacher: ExcelTeacher) => {
        if (teacher.status === 'success' && teacher.teacherId) {
            setSelectedTeacher({
                _id: teacher.teacherId,
                name: teacher.name,
                email: teacher.email
            })
            setCurrentStep(2)
        }
    }

    // --- Helpers ---

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

    // Toggle subject selection (multi-select)
    const toggleSubject = (subject: Subject) => {
        setSelectedSubjects(prev => {
            const isSelected = prev.some(s => s._id === subject._id)
            if (isSelected) {
                return prev.filter(s => s._id !== subject._id)
            } else {
                return [...prev, subject]
            }
        })
    }

    const permissionGroups = PERMISSION_OPTIONS.reduce((acc, perm) => {
        if (!acc[perm.group]) acc[perm.group] = []
        acc[perm.group].push(perm)
        return acc
    }, {} as Record<string, typeof PERMISSION_OPTIONS>)

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        } else {
            router.back()
        }
    }

    // --- Render ---

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="max-w-5xl mx-auto px-6 py-8 pb-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-secondary mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {currentStep > 1 ? 'Étape précédente' : 'Retour à la classe'}
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                            <UserPlus className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ajouter un enseignant</h1>
                            <p className="text-gray-500 mt-1">Invitez un collègue à collaborer dans cette classe.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Steps Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between relative mb-12 max-w-2xl mx-auto"
                >
                    {/* Connector Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full -z-10" />
                    <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full -z-10"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />

                    {[
                        { id: 1, label: 'Enseignant', icon: User },
                        { id: 2, label: 'Matières', icon: BookOpen },
                        { id: 3, label: 'Permissions', icon: Shield }
                    ].map((step) => {
                        const isActive = currentStep >= step.id
                        const isCurrent = currentStep === step.id
                        const isCompleted = currentStep > step.id
                        return (
                            <motion.div
                                key={step.id}
                                className="flex flex-col items-center gap-2 bg-white dark:bg-gray-900 px-4"
                                whileHover={{ scale: 1.05 }}
                            >
                                <motion.div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                        isActive
                                            ? "bg-secondary border-secondary text-white shadow-lg shadow-secondary/30"
                                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                                    )}
                                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 2 }}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                                </motion.div>
                                <span className={cn(
                                    "text-sm font-semibold transition-colors",
                                    isActive ? "text-secondary" : "text-gray-400"
                                )}>
                                    {step.label}
                                </span>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* Content Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none min-h-[500px] overflow-hidden"
                >
                    <AnimatePresence mode="wait">

                        {/* STEP 1: TEACHER SELECTION */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8"
                            >
                                <div className="max-w-3xl mx-auto space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Qui souhaitez-vous inviter ?</h2>
                                        <p className="text-gray-500 mt-2">Choisissez une méthode pour ajouter un enseignant.</p>
                                    </div>

                                    {/* Mode Selector */}
                                    <div className="flex p-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-2xl w-full max-w-xl mx-auto">
                                        {[
                                            { id: 'search', label: 'Rechercher', icon: Search },
                                            { id: 'manual', label: 'Créer', icon: UserPlus },
                                            { id: 'excel', label: 'Import Excel', icon: FileSpreadsheet },
                                        ].map((mode) => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setTeacherMode(mode.id as any)}
                                                className={cn(
                                                    "flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                                                    teacherMode === mode.id
                                                        ? "bg-white dark:bg-gray-800 text-secondary shadow-md"
                                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                )}
                                            >
                                                <mode.icon className="w-4 h-4" />
                                                <span className="hidden sm:inline">{mode.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {/* SEARCH MODE */}
                                        {teacherMode === 'search' && (
                                            <motion.div
                                                key="search-mode"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-6"
                                            >
                                                <div className="relative">
                                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Nom ou email de l'enseignant..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-lg"
                                                        autoFocus
                                                    />
                                                    {searchQuery && (
                                                        <button
                                                            onClick={() => setSearchQuery('')}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                                                        >
                                                            <X className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="min-h-[280px]">
                                                    {loadingTeachers ? (
                                                        <div className="flex flex-col items-center justify-center py-16 text-secondary">
                                                            <Loader2 className="w-10 h-10 animate-spin mb-3" />
                                                            <p className="font-medium">Recherche en cours...</p>
                                                        </div>
                                                    ) : teachers.length > 0 ? (
                                                        <motion.div
                                                            variants={containerVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            className="grid grid-cols-1 gap-3"
                                                        >
                                                            {teachers.map((teacher) => (
                                                                <motion.button
                                                                    key={teacher._id}
                                                                    variants={itemVariants}
                                                                    onClick={() => { setSelectedTeacher(teacher); setCurrentStep(2); }}
                                                                    whileHover={{ scale: 1.01 }}
                                                                    whileTap={{ scale: 0.99 }}
                                                                    className={cn(
                                                                        "w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 text-left group",
                                                                        selectedTeacher?._id === teacher._id
                                                                            ? "border-secondary bg-secondary/5 ring-2 ring-secondary/20"
                                                                            : "border-gray-200 dark:border-gray-700 hover:border-secondary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                                    )}
                                                                >
                                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-secondary/20">
                                                                        {teacher.name?.charAt(0)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-secondary transition-colors">{teacher.name}</p>
                                                                        <p className="text-gray-500 truncate">{teacher.email}</p>
                                                                    </div>
                                                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                                                                </motion.button>
                                                            ))}
                                                        </motion.div>
                                                    ) : searchQuery.length >= 2 ? (
                                                        <div className="text-center py-16 text-gray-500 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                            <p className="font-semibold text-lg text-gray-700 dark:text-gray-300">Aucun résultat pour "{searchQuery}"</p>
                                                            <p className="text-sm mt-1 mb-4">Cet enseignant n'existe pas encore.</p>
                                                            <button
                                                                onClick={() => { setTeacherMode('manual'); setManualName(searchQuery); }}
                                                                className="px-6 py-2.5 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-colors inline-flex items-center gap-2"
                                                            >
                                                                <UserPlus className="w-4 h-4" />
                                                                Créer cet enseignant
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-16 text-gray-400">
                                                            <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                                            <p className="text-lg">Tapez au moins 2 caractères pour rechercher...</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* MANUAL MODE */}
                                        {teacherMode === 'manual' && (
                                            <motion.form
                                                key="manual-mode"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                onSubmit={handleCreateTeacher}
                                                className="space-y-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-700"
                                            >
                                                <div className="text-center mb-6">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-purple-500/30 mb-4">
                                                        <UserPlus className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Créer un nouveau compte</h3>
                                                    <p className="text-gray-500 text-sm mt-1">L'enseignant recevra ses identifiants par email.</p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-5">
                                                    <div>
                                                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Nom complet</label>
                                                        <input
                                                            required
                                                            value={manualName}
                                                            onChange={(e) => setManualName(e.target.value)}
                                                            className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                                                            placeholder="Ex: Jean Dupont"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Email professionnel</label>
                                                        <input
                                                            required
                                                            type="email"
                                                            value={manualEmail}
                                                            onChange={(e) => setManualEmail(e.target.value)}
                                                            className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                                                            placeholder="Ex: jean.dupont@ecole.com"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={creatingTeacher || !manualName || !manualEmail}
                                                        className="w-full py-4 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-secondary/30 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                                                    >
                                                        {creatingTeacher ? (
                                                            <>
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                                Création du compte...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus className="w-5 h-5" />
                                                                Créer et continuer
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </motion.form>
                                        )}

                                        {/* EXCEL MODE */}
                                        {teacherMode === 'excel' && (
                                            <motion.div
                                                key="excel-mode"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-6"
                                            >
                                                {/* Download Template */}
                                                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                                                            <FileSpreadsheet className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-blue-900 dark:text-blue-300">Modèle Excel</p>
                                                            <p className="text-sm text-blue-600 dark:text-blue-400">Téléchargez le format requis</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={downloadTemplate}
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Télécharger
                                                    </button>
                                                </div>

                                                {/* Drop Zone */}
                                                {excelTeachers.length === 0 ? (
                                                    <div
                                                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                                        onDragLeave={() => setDragActive(false)}
                                                        onDrop={handleFileDrop}
                                                        className={cn(
                                                            "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all",
                                                            dragActive
                                                                ? "border-secondary bg-secondary/5"
                                                                : "border-gray-200 dark:border-gray-700 hover:border-secondary/50"
                                                        )}
                                                    >
                                                        <input
                                                            type="file"
                                                            accept=".xlsx,.xls,.csv"
                                                            onChange={handleFileChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        <Upload className={cn(
                                                            "w-12 h-12 mx-auto mb-4 transition-colors",
                                                            dragActive ? "text-secondary" : "text-gray-300"
                                                        )} />
                                                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                            {dragActive ? "Déposez le fichier ici" : "Glissez-déposez votre fichier Excel"}
                                                        </p>
                                                        <p className="text-gray-500 mt-2">ou cliquez pour parcourir</p>
                                                        <p className="text-xs text-gray-400 mt-4">Formats acceptés: .xlsx, .xls, .csv</p>
                                                    </div>
                                                ) : (
                                                    /* Excel Preview */
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-bold text-gray-900 dark:text-white">
                                                                {excelTeachers.length} enseignant(s) détecté(s)
                                                            </h4>
                                                            <button
                                                                onClick={() => setExcelTeachers([])}
                                                                className="text-sm text-gray-500 hover:text-red-500"
                                                            >
                                                                Réinitialiser
                                                            </button>
                                                        </div>

                                                        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                                                            {excelTeachers.map((teacher, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: idx * 0.05 }}
                                                                    onClick={() => selectExcelTeacher(teacher)}
                                                                    className={cn(
                                                                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                                                        teacher.status === 'success'
                                                                            ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/30 cursor-pointer hover:bg-green-100"
                                                                            : teacher.status === 'error'
                                                                                ? "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30"
                                                                                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0",
                                                                        teacher.status === 'success' ? "bg-green-500" :
                                                                            teacher.status === 'error' ? "bg-red-500" :
                                                                                "bg-gray-400"
                                                                    )}>
                                                                        {teacher.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                                                                            teacher.status === 'error' ? <X className="w-4 h-4" /> :
                                                                                <span className="text-xs font-bold">{idx + 1}</span>}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-gray-900 dark:text-white truncate">{teacher.name}</p>
                                                                        <p className="text-sm text-gray-500 truncate">{teacher.email}</p>
                                                                    </div>
                                                                    {teacher.status === 'success' && (
                                                                        <span className="text-xs text-green-600 font-medium">Sélectionner →</span>
                                                                    )}
                                                                    {teacher.status === 'error' && (
                                                                        <span className="text-xs text-red-600">{teacher.message}</span>
                                                                    )}
                                                                </motion.div>
                                                            ))}
                                                        </div>

                                                        {!excelTeachers.some(t => t.status === 'success') && (
                                                            <button
                                                                onClick={importExcelTeachers}
                                                                disabled={importingExcel}
                                                                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                            >
                                                                {importingExcel ? (
                                                                    <>
                                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                                        Import en cours...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Upload className="w-5 h-5" />
                                                                        Importer les enseignants
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}

                                                        {excelTeachers.some(t => t.status === 'success') && (
                                                            <p className="text-center text-sm text-gray-500">
                                                                Cliquez sur un enseignant importé pour continuer.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: MULTI-SUBJECT SELECTION */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8"
                            >
                                <div className="max-w-4xl mx-auto space-y-8">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                                {selectedTeacher?.name?.charAt(0)}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900 dark:text-white">{selectedTeacher?.name}</p>
                                                <p className="text-sm text-gray-500">{selectedTeacher?.email}</p>
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quelles matières enseignera-t-il ?</h2>
                                        <p className="text-gray-500 mt-2">
                                            Sélectionnez une ou plusieurs matières.
                                            <span className="text-secondary font-medium ml-1">
                                                ({selectedSubjects.length} sélectionnée{selectedSubjects.length > 1 ? 's' : ''})
                                            </span>
                                        </p>
                                    </div>

                                    {loadingSubjects ? (
                                        <div className="flex justify-center py-16">
                                            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                                        </div>
                                    ) : (
                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                                        >
                                            {subjects.map((subject) => {
                                                const isSelected = selectedSubjects.some(s => s._id === subject._id)
                                                return (
                                                    <motion.button
                                                        key={subject._id}
                                                        variants={itemVariants}
                                                        onClick={() => toggleSubject(subject)}
                                                        whileHover={{ scale: 1.03, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={cn(
                                                            "p-5 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 group relative overflow-hidden",
                                                            isSelected
                                                                ? "border-secondary bg-secondary text-white shadow-xl shadow-secondary/30"
                                                                : "border-gray-200 dark:border-gray-700 hover:border-secondary/50 hover:bg-white dark:hover:bg-gray-800 bg-gray-50 dark:bg-gray-900/50"
                                                        )}
                                                    >
                                                        {/* Selection indicator */}
                                                        <div className={cn(
                                                            "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                                            isSelected
                                                                ? "bg-white text-secondary"
                                                                : "bg-gray-200 dark:bg-gray-700 text-gray-400 group-hover:bg-secondary/20 group-hover:text-secondary"
                                                        )}>
                                                            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                        </div>

                                                        <div className={cn(
                                                            "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                                                            isSelected
                                                                ? "bg-white/20 text-white"
                                                                : "bg-white dark:bg-gray-800 text-secondary shadow-sm group-hover:shadow-md"
                                                        )}>
                                                            <BookOpen className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className={cn(
                                                                "font-bold mb-1 line-clamp-2",
                                                                isSelected ? "text-white" : "text-gray-900 dark:text-white"
                                                            )}>
                                                                {subject.name}
                                                            </p>
                                                            {subject.code && (
                                                                <p className={cn(
                                                                    "text-sm",
                                                                    isSelected ? "text-white/80" : "text-gray-500"
                                                                )}>
                                                                    {subject.code}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </motion.button>
                                                )
                                            })}
                                        </motion.div>
                                    )}

                                    {/* Continue Button */}
                                    <div className="pt-6 flex justify-center">
                                        <button
                                            onClick={() => setCurrentStep(3)}
                                            disabled={selectedSubjects.length === 0}
                                            className="px-8 py-4 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                        >
                                            Continuer avec {selectedSubjects.length} matière{selectedSubjects.length > 1 ? 's' : ''}
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: PERMISSIONS */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8"
                            >
                                <div className="max-w-4xl mx-auto space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Définir les permissions</h2>
                                        <p className="text-gray-500 mt-2">Contrôlez ce que {selectedTeacher?.name} peut faire dans cette classe.</p>
                                    </div>

                                    {/* Summary Card */}
                                    <div className="p-5 bg-gradient-to-r from-secondary/5 to-secondary/10 dark:from-secondary/10 dark:to-secondary/5 rounded-2xl border border-secondary/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                {selectedTeacher?.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">{selectedTeacher?.name}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {selectedSubjects.map((subject) => (
                                                        <span
                                                            key={subject._id}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-lg"
                                                        >
                                                            <BookOpen className="w-3.5 h-3.5" />
                                                            {subject.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">{selectedPermissions.length} permissions</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left: Roles */}
                                        <div className="lg:col-span-1 space-y-4">
                                            <p className="font-bold text-gray-900 dark:text-white">Rôle</p>
                                            <motion.div
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="space-y-3"
                                            >
                                                {ROLE_PRESETS.map((role) => (
                                                    <motion.button
                                                        key={role.id}
                                                        variants={itemVariants}
                                                        onClick={() => handleRoleChange(role.id)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={cn(
                                                            "w-full p-4 rounded-2xl border-2 transition-all text-left",
                                                            selectedRole === role.id
                                                                ? "border-secondary bg-secondary/5 ring-2 ring-secondary/20"
                                                                : "border-gray-200 dark:border-gray-700 hover:border-secondary/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", role.color)}>
                                                                <role.icon className="w-4 h-4" />
                                                            </div>
                                                            <p className="font-bold text-gray-900 dark:text-white">{role.label}</p>
                                                            {selectedRole === role.id && (
                                                                <Check className="w-5 h-5 text-secondary ml-auto" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 pl-11">{role.description}</p>
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        </div>

                                        {/* Right: Detailed Permissions */}
                                        <div className="lg:col-span-2">
                                            <p className="font-bold text-gray-900 dark:text-white mb-4">Permissions détaillées</p>
                                            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 max-h-[400px] overflow-y-auto">
                                                <div className="space-y-6">
                                                    {Object.entries(permissionGroups).map(([group, perms]) => (
                                                        <div key={group}>
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{group}</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {perms.map((perm) => (
                                                                    <label
                                                                        key={perm.id}
                                                                        className={cn(
                                                                            "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border-2",
                                                                            selectedPermissions.includes(perm.id)
                                                                                ? "bg-white dark:bg-gray-800 border-secondary/30 shadow-sm"
                                                                                : "bg-transparent border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                                                                        )}
                                                                    >
                                                                        <div className={cn(
                                                                            "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
                                                                            selectedPermissions.includes(perm.id)
                                                                                ? "bg-secondary border-secondary text-white"
                                                                                : "border-gray-300 dark:border-gray-600"
                                                                        )}>
                                                                            {selectedPermissions.includes(perm.id) && <Check className="w-3 h-3" />}
                                                                        </div>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="hidden"
                                                                            checked={selectedPermissions.includes(perm.id)}
                                                                            onChange={() => togglePermission(perm.id)}
                                                                        />
                                                                        <div>
                                                                            <p className={cn(
                                                                                "text-sm font-semibold",
                                                                                selectedPermissions.includes(perm.id) ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                                                                            )}>
                                                                                {perm.label}
                                                                            </p>
                                                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{perm.description}</p>
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <motion.button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="w-full py-4 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    Finalisation...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-6 h-6" />
                                                    Inviter {selectedTeacher?.name} pour {selectedSubjects.length} matière{selectedSubjects.length > 1 ? 's' : ''}
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    )
}
