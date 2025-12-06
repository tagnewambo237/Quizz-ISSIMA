"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/guards/RoleGuard"
import { UserRole, ExamStatus, DifficultyLevel } from "@/models/enums"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Loader2, GripVertical, Clock, Users, BookOpen, Search, Eye, Edit, Send, CheckCircle2, AlertCircle, Sparkles, Calendar, Trophy, BarChart3, LayoutGrid, List as ListIcon, MoreHorizontal, Play, Activity } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDistanceToNow, format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExamData {
    _id: string
    title: string
    description?: string
    status: ExamStatus
    subject?: { name: string; code: string }
    targetLevels?: { name: string; code: string }[]
    duration: number
    startTime: string
    endTime: string
    closeMode: string
    difficultyLevel?: DifficultyLevel
    createdAt: string
    stats?: {
        totalAttempts: number
        averageScore: number
    }
}

const COLUMNS = [
    {
        id: ExamStatus.DRAFT,
        title: "Brouillons",
        icon: Sparkles,
        color: "bg-slate-50/50 dark:bg-slate-900/20",
        borderColor: "border-slate-200 dark:border-slate-700",
        activeColor: "bg-slate-100 dark:bg-slate-800",
        iconColor: "text-slate-500",
        badge: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
    },
    {
        id: ExamStatus.PENDING_VALIDATION,
        title: "En Validation",
        icon: Clock,
        color: "bg-amber-50/50 dark:bg-amber-900/10",
        borderColor: "border-amber-200 dark:border-amber-800",
        activeColor: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-500",
        badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
    },
    {
        id: ExamStatus.VALIDATED,
        title: "Validés",
        icon: CheckCircle2,
        color: "bg-emerald-50/50 dark:bg-emerald-900/10",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        activeColor: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-500",
        badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
    },
    {
        id: ExamStatus.PUBLISHED,
        title: "Publiés",
        icon: Send,
        color: "bg-blue-50/50 dark:bg-blue-900/10",
        borderColor: "border-blue-200 dark:border-blue-800",
        activeColor: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-500",
        badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
    },
]

const DIFFICULTY_COLORS = {
    [DifficultyLevel.BEGINNER]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    [DifficultyLevel.INTERMEDIATE]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    [DifficultyLevel.ADVANCED]: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    [DifficultyLevel.EXPERT]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

const STATUS_CONFIG = {
    [ExamStatus.DRAFT]: { label: "Brouillon", color: "bg-slate-100 text-slate-700" },
    [ExamStatus.PENDING_VALIDATION]: { label: "En Validation", color: "bg-amber-100 text-amber-700" },
    [ExamStatus.VALIDATED]: { label: "Validé", color: "bg-emerald-100 text-emerald-700" },
    [ExamStatus.PUBLISHED]: { label: "Publié", color: "bg-blue-100 text-blue-700" },
    [ExamStatus.ARCHIVED]: { label: "Archivé", color: "bg-gray-100 text-gray-700" },
}

export default function ExamsManagementPage() {
    const router = useRouter()
    const [exams, setExams] = useState<ExamData[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchExams()
    }, [])

    const fetchExams = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/exams/v2`)
            const data = await res.json()

            if (data.success) {
                setExams(data.data || [])
            }
        } catch (error) {
            console.error("Error fetching exams:", error)
            toast.error("Erreur lors du chargement des examens")
        } finally {
            setLoading(false)
        }
    }

    const filteredExams = useMemo(() => {
        return exams.filter(exam =>
            exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exam.subject?.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [exams, searchQuery])

    const handleUpdateStatus = async (examId: string, newStatus: ExamStatus) => {
        try {
            const res = await fetch(`/api/exams/${examId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })

            const data = await res.json()

            if (data.success) {
                setExams(prev => prev.map(exam =>
                    exam._id === examId ? { ...exam, status: newStatus } : exam
                ))

                if (newStatus === ExamStatus.PUBLISHED) {
                    toast.success("Examen publié!", { description: "Les apprenants ont été notifiés." })
                } else if (newStatus === ExamStatus.PENDING_VALIDATION) {
                    toast.info("Examen soumis pour validation")
                } else if (newStatus === ExamStatus.VALIDATED) {
                    toast.success("Examen validé!")
                }
            } else {
                toast.error(data.message || "Erreur lors de la mise à jour")
            }
        } catch (error) {
            console.error("Error updating exam:", error)
            toast.error("Erreur lors de la mise à jour")
        }
    }

    return (
        <RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
            <div className="p-6 h-full flex flex-col bg-gray-50/50 dark:bg-black/20">
                <div className="max-w-full mx-auto h-full flex flex-col w-full">
                    {/* Header */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-sm sticky top-0 z-10 transition-all">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                Mes Examens
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-orange-500" />
                                Gerez vos évaluations et suivez les performances
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 xl:justify-end">
                            {/* View Toggle */}
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('kanban')}
                                    className={cn(
                                        "rounded-lg px-3",
                                        viewMode === 'kanban' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500"
                                    )}
                                >
                                    <LayoutGrid className="w-4 h-4 mr-2" />
                                    Kanban
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "rounded-lg px-3",
                                        viewMode === 'list' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500"
                                    )}
                                >
                                    <ListIcon className="w-4 h-4 mr-2" />
                                    Liste
                                </Button>
                            </div>

                            <div className="relative w-full md:w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    placeholder="Rechercher..."
                                    className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Link href="/teacher/exams/create">
                                <Button className="w-full md:w-auto gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]">
                                    <PlusCircle className="h-4 w-4" />
                                    Créer
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12 flex-1">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden">
                            <AnimatePresence mode="wait">
                                {viewMode === 'kanban' ? (
                                    <KanbanView
                                        exams={filteredExams}
                                        onUpdateStatus={handleUpdateStatus}
                                    />
                                ) : (
                                    <ListView
                                        exams={filteredExams}
                                        onUpdateStatus={handleUpdateStatus}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    )
}

function KanbanView({ exams, onUpdateStatus }: { exams: ExamData[], onUpdateStatus: (id: string, status: ExamStatus) => void }) {
    const [movingExam, setMovingExam] = useState<string | null>(null)

    const getExamsByStatus = (status: ExamStatus) => {
        return exams.filter(exam => exam.status === status)
    }

    const handleDrop = (examId: string, targetStatus: ExamStatus) => {
        const exam = exams.find(e => e._id === examId)
        if (!exam || exam.status === targetStatus) return

        setMovingExam(examId)
        onUpdateStatus(examId, targetStatus)
        setTimeout(() => setMovingExam(null), 500) // Reset after animation
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full items-start overflow-x-auto pb-4 custom-scrollbar"
        >
            {COLUMNS.map((column) => (
                <KanbanColumn
                    key={column.id}
                    column={column}
                    exams={getExamsByStatus(column.id)}
                    onDrop={handleDrop}
                    movingExam={movingExam}
                    onMoveExam={onUpdateStatus}
                />
            ))}
        </motion.div>
    )
}

function ListView({ exams, onUpdateStatus }: { exams: ExamData[], onUpdateStatus: (id: string, status: ExamStatus) => void }) {
    const router = useRouter()

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-visible"
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[300px]">Titre</TableHead>
                        <TableHead>Matière</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Difficulté</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {exams.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                Aucun examen trouvé
                            </TableCell>
                        </TableRow>
                    ) : (
                        exams.map((exam) => (
                            <TableRow key={exam._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-base text-gray-900 dark:text-white">{exam.title}</span>
                                        <span className="text-xs text-gray-500">{exam.duration} min • {exam.targetLevels?.[0]?.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-purple-500" />
                                        <span>{exam.subject?.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", STATUS_CONFIG[exam.status]?.color)}>
                                        {STATUS_CONFIG[exam.status]?.label}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {exam.difficultyLevel && (
                                        <span className={cn("px-2 py-1 rounded-md text-xs font-bold uppercase", DIFFICULTY_COLORS[exam.difficultyLevel])}>
                                            {exam.difficultyLevel}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {exam.stats?.totalAttempts || 0} tentatives
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-500 text-sm">
                                    {format(new Date(exam.createdAt), 'dd MMM yyyy', { locale: fr })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/teacher/exams/${exam._id}`)}>
                                                <Eye className="mr-2 h-4 w-4" /> Voir détails
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/teacher/exams/${exam._id}/preview`)}>
                                                <Play className="mr-2 h-4 w-4" /> Tester l'examen
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/teacher/exams/${exam._id}/edit`)}>
                                                <Edit className="mr-2 h-4 w-4" /> Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => router.push(`/teacher/exams/${exam._id}/results`)}>
                                                <BarChart3 className="mr-2 h-4 w-4" /> Résultats
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/teacher/exams/${exam._id}/monitor`)}>
                                                <Activity className="mr-2 h-4 w-4" /> Moniteur
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {exam.status === ExamStatus.DRAFT && (
                                                <DropdownMenuItem onClick={() => onUpdateStatus(exam._id, ExamStatus.PENDING_VALIDATION)}>
                                                    <Clock className="mr-2 h-4 w-4" /> Soumettre
                                                </DropdownMenuItem>
                                            )}
                                            {exam.status === ExamStatus.PENDING_VALIDATION && (
                                                <DropdownMenuItem onClick={() => onUpdateStatus(exam._id, ExamStatus.VALIDATED)}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Valider
                                                </DropdownMenuItem>
                                            )}
                                            {exam.status === ExamStatus.VALIDATED && (
                                                <DropdownMenuItem onClick={() => onUpdateStatus(exam._id, ExamStatus.PUBLISHED)}>
                                                    <Send className="mr-2 h-4 w-4" /> Publier
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </motion.div>
    )
}

function KanbanColumn({
    column,
    exams,
    onDrop,
    movingExam,
    onMoveExam
}: {
    column: typeof COLUMNS[0]
    exams: ExamData[]
    onDrop: (examId: string, status: ExamStatus) => void
    movingExam: string | null
    onMoveExam: (examId: string, status: ExamStatus) => void
}) {
    const [isDragOver, setIsDragOver] = useState(false)
    const Icon = column.icon

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = () => {
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const examId = e.dataTransfer.getData("examId")
        if (examId) {
            onDrop(examId, column.id)
        }
    }

    return (
        <div
            className={cn(
                "flex flex-col rounded-3xl border transition-all duration-300 h-full max-h-full",
                column.color,
                column.borderColor,
                isDragOver ? cn("ring-4 ring-blue-500/20 scale-[1.01] shadow-xl", column.activeColor) : "",
                "backdrop-blur-sm"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Column Header */}
            <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 bg-inherit z-10 rounded-t-3xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700", column.iconColor)}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {column.title}
                        </h3>
                    </div>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold shadow-sm", column.badge)}>
                        {exams.length}
                    </span>
                </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[150px]">
                <AnimatePresence mode="popLayout">
                    {exams.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-10 text-center opacity-40 hover:opacity-100 transition-opacity"
                        >
                            <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600", column.badge)}>
                                <Icon className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Aucun examen ici
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Glissez une carte ici
                            </p>
                        </motion.div>
                    ) : (
                        exams.map((exam) => (
                            <ExamKanbanCard
                                key={exam._id}
                                exam={exam}
                                isMoving={movingExam === exam._id}
                                onMove={onMoveExam}
                                currentStatus={column.id}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function ExamKanbanCard({
    exam,
    isMoving,
    onMove,
    currentStatus
}: {
    exam: ExamData
    isMoving: boolean
    onMove: (examId: string, status: ExamStatus) => void
    currentStatus: ExamStatus
}) {
    const router = useRouter()

    const handleDragStart = (e: React.DragEvent) => {
        // Create a custom drag image if possible, or just standard
        e.dataTransfer.setData("examId", exam._id)
        e.dataTransfer.effectAllowed = "move"
    }

    const getNextAction = () => {
        switch (currentStatus) {
            case ExamStatus.DRAFT:
                return { label: "Soumettre", status: ExamStatus.PENDING_VALIDATION, icon: Clock, color: "text-amber-600 bg-amber-50 hover:bg-amber-100" }
            case ExamStatus.PENDING_VALIDATION:
                return { label: "Valider", status: ExamStatus.VALIDATED, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" }
            case ExamStatus.VALIDATED:
                return { label: "Publier", status: ExamStatus.PUBLISHED, icon: Send, color: "text-blue-600 bg-blue-50 hover:bg-blue-100" }
            default:
                return null
        }
    }

    const nextAction = getNextAction()
    const diffColor = exam.difficultyLevel ? DIFFICULTY_COLORS[exam.difficultyLevel] : "bg-gray-100 text-gray-600"

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
        >
            <div
                draggable
                onDragStart={handleDragStart}
                className={cn(
                    "group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700",
                    "cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-1 transition-all duration-200",
                    isMoving && "opacity-40 grayscale animate-pulse ring-2 ring-blue-500",
                    "relative overflow-hidden"
                )}
            >
                {/* Side Status Indicator */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    currentStatus === ExamStatus.PUBLISHED ? "bg-blue-500" :
                        currentStatus === ExamStatus.VALIDATED ? "bg-emerald-500" :
                            currentStatus === ExamStatus.PENDING_VALIDATION ? "bg-amber-500" : "bg-slate-300"
                )} />

                <div className="pl-2">
                    {/* Top Meta */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-wrap gap-2">
                            {exam.subject && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    {exam.subject.code || exam.subject.name.substring(0, 3)}
                                </span>
                            )}
                            {exam.difficultyLevel && (
                                <span className={cn("inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase", diffColor)}>
                                    {exam.difficultyLevel}
                                </span>
                            )}
                        </div>
                        <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2" title={exam.title}>
                        {exam.title}
                    </h4>

                    {/* Date Details */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar className="w-3 h-3" />
                        <span>Créé {formatDistanceToNow(new Date(exam.createdAt), { addSuffix: true, locale: fr })}</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex flex-col p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                            <span className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Durée
                            </span>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {exam.duration} min
                            </span>
                        </div>
                        <div className="flex flex-col p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                            <span className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Tentatives
                            </span>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {exam.stats?.totalAttempts || 0}
                            </span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all"
                                onClick={() => router.push(`/teacher/exams/${exam._id}`)}
                                title="Voir les détails"
                            >
                                <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-green-600 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all"
                                onClick={() => router.push(`/teacher/exams/${exam._id}/preview`)}
                                title="Tester l'examen"
                            >
                                <Play className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-amber-600 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all"
                                onClick={() => router.push(`/teacher/exams/${exam._id}/edit`)}
                                title="Modifier"
                            >
                                <Edit className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        {nextAction && (
                            <Button
                                size="sm"
                                className={cn("ml-auto h-8 text-xs font-semibold px-3 rounded-lg border border-transparent shadow-sm transition-all", nextAction.color)}
                                onClick={() => onMove(exam._id, nextAction.status)}
                                disabled={isMoving}
                            >
                                <nextAction.icon className="w-3 h-3 mr-1.5" />
                                {nextAction.label}
                            </Button>
                        )}
                        {!nextAction && currentStatus === ExamStatus.PUBLISHED && (
                            <Link href={`/teacher/exams/${exam._id}`} className="ml-auto">
                                <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg">
                                    <BarChart3 className="w-3 h-3 mr-1.5" />
                                    Résultats
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
