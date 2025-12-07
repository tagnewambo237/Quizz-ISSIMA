"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Users, MessageSquare, Loader2, X, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Student {
    _id: string
    name: string
    email: string
    image?: string
    studentCode?: string
    classes: { _id: string; name: string }[]
}

interface ClassOption {
    _id: string
    name: string
    studentCount: number
}

interface NewConversationModalProps {
    onConversationCreated: (conversation: any) => void
}

export function NewConversationModal({ onConversationCreated }: NewConversationModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [students, setStudents] = useState<Student[]>([])
    const [classes, setClasses] = useState<ClassOption[]>([])
    const [search, setSearch] = useState('')
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        if (!open) return

        const fetchStudents = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (search) params.set('search', search)
                if (selectedClassId) params.set('classId', selectedClassId)

                const res = await fetch(`/api/teachers/students?${params}`)
                const data = await res.json()

                if (data.success) {
                    setStudents(data.data.students)
                    if (!classes.length) {
                        setClasses(data.data.classes)
                    }
                }
            } catch (error) {
                console.error('Error fetching students:', error)
            } finally {
                setLoading(false)
            }
        }

        const debounce = setTimeout(fetchStudents, 300)
        return () => clearTimeout(debounce)
    }, [open, search, selectedClassId])

    const handleStartConversation = async (student: Student) => {
        setCreating(true)
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participantIds: [student._id],
                    type: 'DIRECT'
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success(`Conversation avec ${student.name} créée`)
                onConversationCreated(data.data)
                setOpen(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error creating conversation:', error)
            toast.error('Erreur lors de la création')
        } finally {
            setCreating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Nouvelle conversation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Contacter un apprenant</DialogTitle>
                </DialogHeader>

                {/* Search and Filter */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par nom, email ou code..."
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl"
                        />
                    </div>

                    {/* Class Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedClassId(null)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                !selectedClassId
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            )}
                        >
                            Toutes les classes
                        </button>
                        {classes.map(cls => (
                            <button
                                key={cls._id}
                                onClick={() => setSelectedClassId(cls._id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                    selectedClassId === cls._id
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                )}
                            >
                                {cls.name} ({cls.studentCount})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Students List */}
                <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            <p className="font-medium">Aucun apprenant trouvé</p>
                            <p className="text-sm">
                                {search ? 'Essayez une autre recherche' : 'Ajoutez des apprenants à vos classes'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {students.map(student => (
                                <motion.div
                                    key={student._id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <Avatar>
                                        <AvatarImage src={student.image} />
                                        <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {student.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{student.email}</span>
                                            {student.studentCode && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-mono">{student.studentCode}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex gap-1 mt-1">
                                            {student.classes.map(cls => (
                                                <span
                                                    key={cls._id}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                >
                                                    <BookOpen className="w-2.5 h-2.5" />
                                                    {cls.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleStartConversation(student)}
                                        disabled={creating}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
