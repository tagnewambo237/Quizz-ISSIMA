"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    MessagesSquare,
    ArrowLeft,
    Users,
    BookOpen,
    Lock,
    Unlock,
    MessageCircle,
    Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ClassOption {
    _id: string
    name: string
    studentsCount?: number
}

interface SubjectOption {
    _id: string
    name: string
    code?: string
}

export default function CreateForumPage() {
    const { data: session } = useSession()
    const router = useRouter()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<'CLASS' | 'SUBJECT' | 'GENERAL'>('CLASS')
    const [classId, setClassId] = useState('')
    const [subjectId, setSubjectId] = useState('')
    const [isPrivate, setIsPrivate] = useState(false)
    const [allowStudentPosts, setAllowStudentPosts] = useState(true)

    const [classes, setClasses] = useState<ClassOption[]>([])
    const [subjects, setSubjects] = useState<SubjectOption[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Fetch teacher's classes and subjects
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch classes
                const classesRes = await fetch('/api/classes')
                if (classesRes.ok) {
                    const classesData = await classesRes.json()
                    setClasses(classesData.data || classesData.classes || [])
                }

                // Fetch subjects
                const subjectsRes = await fetch('/api/subjects?isActive=true')
                if (subjectsRes.ok) {
                    const subjectsData = await subjectsRes.json()
                    setSubjects(subjectsData.data || [])
                }
            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/forums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    type,
                    classId: type === 'CLASS' ? classId : undefined,
                    subjectId: type === 'SUBJECT' ? subjectId : undefined,
                    isPrivate,
                    allowStudentPosts
                })
            })

            if (res.ok) {
                router.push('/teacher/messages?tab=forums')
            } else {
                const data = await res.json()
                alert(data.error || 'Erreur lors de la création')
            }
        } catch (err) {
            console.error('Error creating forum:', err)
            alert('Erreur lors de la création du forum')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/teacher/messages"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <MessagesSquare className="w-6 h-6 text-[#2a3575]" />
                            Créer un Forum
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Créez un espace de discussion pour votre classe
                        </p>
                    </div>
                </div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6"
                >
                    {/* Forum Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom du forum *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-[#2a3575] focus:border-transparent transition-all"
                            placeholder="Ex: Discussion Mathématiques 3ème A"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-[#2a3575] focus:border-transparent transition-all resize-none"
                            placeholder="Décrivez l'objectif de ce forum..."
                        />
                    </div>

                    {/* Forum Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Type de forum
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'CLASS', label: 'Classe', icon: Users },
                                { value: 'SUBJECT', label: 'Matière', icon: BookOpen },
                                { value: 'GENERAL', label: 'Général', icon: MessageCircle }
                            ].map(option => {
                                const Icon = option.icon
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setType(option.value as any)}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                            type === option.value
                                                ? "border-[#2a3575] bg-[#2a3575]/5"
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "w-5 h-5",
                                            type === option.value ? "text-[#2a3575]" : "text-gray-400"
                                        )} />
                                        <span className={cn(
                                            "text-sm font-medium",
                                            type === option.value ? "text-[#2a3575]" : "text-gray-600 dark:text-gray-400"
                                        )}>
                                            {option.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Class Selection (only for CLASS type) */}
                    {type === 'CLASS' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Classe associée *
                            </label>
                            <select
                                value={classId}
                                onChange={e => setClassId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-[#2a3575] focus:border-transparent transition-all"
                                required={type === 'CLASS'}
                            >
                                <option value="">Sélectionner une classe...</option>
                                {classes.map(cls => (
                                    <option key={cls._id} value={cls._id}>
                                        {cls.name} {cls.studentsCount ? `(${cls.studentsCount} élèves)` : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Tous les élèves de cette classe seront automatiquement ajoutés au forum
                            </p>
                        </div>
                    )}

                    {/* Subject Selection (only for SUBJECT type) */}
                    {type === 'SUBJECT' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Matière associée *
                            </label>
                            <select
                                value={subjectId}
                                onChange={e => setSubjectId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-[#2a3575] focus:border-transparent transition-all"
                                required={type === 'SUBJECT'}
                            >
                                <option value="">Sélectionner une matière...</option>
                                {subjects.map(subject => (
                                    <option key={subject._id} value={subject._id}>
                                        {subject.name} {subject.code ? `(${subject.code})` : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Ce forum sera dédié aux discussions sur cette matière
                            </p>
                        </div>
                    )}

                    {/* Privacy & Permissions */}
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Paramètres</h3>

                        {/* Private Toggle */}
                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
                            <div className="flex items-center gap-3">
                                {isPrivate ? <Lock className="w-5 h-5 text-amber-500" /> : <Unlock className="w-5 h-5 text-[#359a53]" />}
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Forum privé</p>
                                    <p className="text-xs text-gray-500">Seuls les membres peuvent voir le contenu</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={e => setIsPrivate(e.target.checked)}
                                className="w-5 h-5 rounded text-[#2a3575] focus:ring-[#2a3575]"
                            />
                        </label>

                        {/* Student Posts Toggle */}
                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
                            <div className="flex items-center gap-3">
                                <MessageCircle className={cn("w-5 h-5", allowStudentPosts ? "text-[#359a53]" : "text-gray-400")} />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Permettre les posts étudiants</p>
                                    <p className="text-xs text-gray-500">Les élèves peuvent créer des posts</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={allowStudentPosts}
                                onChange={e => setAllowStudentPosts(e.target.checked)}
                                className="w-5 h-5 rounded text-[#2a3575] focus:ring-[#2a3575]"
                            />
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <Link
                            href="/teacher/messages"
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || !name.trim() || (type === 'CLASS' && !classId) || (type === 'SUBJECT' && !subjectId)}
                            className="flex-1 px-4 py-3 bg-[#2a3575] text-white rounded-xl font-medium hover:bg-[#2a3575]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>Création...</>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Créer le forum
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    )
}
