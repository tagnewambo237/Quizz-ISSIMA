"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Trash2, BookOpen, Lightbulb, ArrowLeft, ArrowRight, CheckCircle2, FileText, Layers } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface QuickSyllabusCreatorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    subjectId: string
    onSyllabusCreated: (syllabusId: string) => void
}

interface Chapter {
    id: string
    title: string
    description: string
}

interface Concept {
    id: string
    title: string
    description: string
}

export function QuickSyllabusCreator({ open, onOpenChange, subjectId, onSyllabusCreated }: QuickSyllabusCreatorProps) {
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(0)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [chapters, setChapters] = useState<Chapter[]>([
        { id: "1", title: "", description: "" }
    ])
    const [concepts, setConcepts] = useState<Concept[]>([
        { id: "1", title: "", description: "" }
    ])

    const steps = [
        { title: "Informations", icon: FileText },
        { title: "Chapitres", icon: Layers },
        { title: "Concepts", icon: Lightbulb },
    ]

    const addChapter = () => {
        setChapters([...chapters, { id: Date.now().toString(), title: "", description: "" }])
    }

    const removeChapter = (id: string) => {
        if (chapters.length > 1) {
            setChapters(chapters.filter(ch => ch.id !== id))
        }
    }

    const updateChapter = (id: string, field: keyof Chapter, value: string) => {
        setChapters(chapters.map(ch => ch.id === id ? { ...ch, [field]: value } : ch))
    }

    const addConcept = () => {
        setConcepts([...concepts, { id: Date.now().toString(), title: "", description: "" }])
    }

    const removeConcept = (id: string) => {
        if (concepts.length > 1) {
            setConcepts(concepts.filter(c => c.id !== id))
        }
    }

    const updateConcept = (id: string, field: keyof Concept, value: string) => {
        setConcepts(concepts.map(c => c.id === id ? { ...c, [field]: value } : c))
    }

    const handleNext = () => {
        // Validation
        if (currentStep === 0 && !title.trim()) {
            toast.error("Le titre est requis")
            return
        }
        if (currentStep === 1 && chapters.filter(ch => ch.title.trim()).length === 0) {
            toast.error("Ajoutez au moins un chapitre")
            return
        }

        if (currentStep < steps.length - 1) {
            setDirection(1)
            setCurrentStep(prev => prev + 1)
        } else {
            handleCreate()
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setDirection(-1)
            setCurrentStep(prev => prev - 1)
        }
    }

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
    }

    const handleCreate = async () => {
        if (!title.trim()) {
            toast.error("Le titre est requis")
            return
        }

        // Filter out empty chapters
        const validChapters = chapters.filter(ch => ch.title.trim())

        if (validChapters.length === 0) {
            toast.error("Ajoutez au moins un chapitre")
            return
        }

        setLoading(true)

        try {
            // Step 1: Create the syllabus
            const res = await fetch("/api/syllabus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    subject: subjectId,
                    structure: {
                        chapters: validChapters.map(ch => ({
                            title: ch.title,
                            description: ch.description,
                            topics: []
                        }))
                    },
                    learningObjectives: []
                })
            })

            const data = await res.json()

            if (!data.success) {
                toast.error(data.message || "Erreur lors de la création du syllabus")
                return
            }

            const syllabusId = data.data._id

            // Step 2: Create concepts (if any)
            const validConcepts = concepts.filter(c => c.title.trim())

            if (validConcepts.length > 0) {
                const conceptPromises = validConcepts.map((concept, index) =>
                    fetch("/api/concepts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: concept.title,
                            description: concept.description,
                            syllabusId: syllabusId,
                            order: index
                        })
                    })
                )

                await Promise.all(conceptPromises)
            }

            toast.success("Programme créé avec succès!")
            onSyllabusCreated(syllabusId)

            // Reset form
            setTitle("")
            setDescription("")
            setChapters([{ id: "1", title: "", description: "" }])
            setConcepts([{ id: "1", title: "", description: "" }])
            setCurrentStep(0)
            onOpenChange(false)

        } catch (error) {
            console.error("Error creating syllabus:", error)
            toast.error("Erreur lors de la création du programme")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                        Créer un Programme Rapide
                    </DialogTitle>
                    <DialogDescription>
                        Créez un nouveau programme qui sera automatiquement lié à cet examen
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex justify-center items-center gap-8 px-4 py-4 border-b">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = index === currentStep
                        const isCompleted = index < currentStep
                        return (
                            <div key={index} className="flex flex-col items-center gap-2 relative z-10">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                    isActive ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg" :
                                        isCompleted ? "bg-green-500 border-green-500 text-white" :
                                            "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={cn(
                                    "text-xs font-bold transition-colors duration-300",
                                    isActive ? "text-indigo-600 dark:text-indigo-400" :
                                        isCompleted ? "text-green-500" :
                                            "text-gray-400"
                                )}>{step.title}</span>
                            </div>
                        )
                    })}
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto py-4 px-1">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        {/* STEP 0: BASIC INFO */}
                        {currentStep === 0 && (
                            <motion.div
                                key="step0"
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Informations de base</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Définissez le titre et la description du programme</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-base font-semibold">
                                        Titre du Programme <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Ex: Programme de Mathématiques - Seconde"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-base font-semibold">
                                        Description (optionnel)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Décrivez brièvement le contenu de ce programme..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 1: CHAPTERS */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Chapitres du programme</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Ajoutez les différents chapitres de votre programme</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-semibold">
                                            Chapitres <span className="text-red-500">*</span>
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addChapter}
                                            className="gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Ajouter
                                        </Button>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {chapters.map((chapter, index) => (
                                            <div key={chapter.id} className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl space-y-3 bg-gray-50 dark:bg-gray-800/50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-gray-500">
                                                        Chapitre {index + 1}
                                                    </span>
                                                    {chapters.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeChapter(chapter.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Input
                                                    placeholder="Titre du chapitre"
                                                    value={chapter.title}
                                                    onChange={(e) => updateChapter(chapter.id, "title", e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Description (optionnel)"
                                                    value={chapter.description}
                                                    onChange={(e) => updateChapter(chapter.id, "description", e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: CONCEPTS */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Concepts du programme</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Les concepts permettent une évaluation plus ciblée et granulaire</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-semibold">
                                            Concepts (optionnel)
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addConcept}
                                            className="gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Ajouter
                                        </Button>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {concepts.map((concept, index) => (
                                            <div key={concept.id} className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-xl space-y-3 bg-purple-50 dark:bg-purple-900/20">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Lightbulb className="w-4 h-4 text-purple-600" />
                                                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                                            Concept {index + 1}
                                                        </span>
                                                    </div>
                                                    {concepts.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeConcept(concept.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Input
                                                    placeholder="Titre du concept"
                                                    value={concept.title}
                                                    onChange={(e) => updateConcept(concept.id, "title", e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Description (optionnel)"
                                                    value={concept.description}
                                                    onChange={(e) => updateConcept(concept.id, "description", e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            💡 Vous pourrez ajouter plus de détails après la création de l'examen
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex justify-between gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={currentStep === 0 ? () => onOpenChange(false) : handlePrev}
                        disabled={loading}
                        className="px-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {currentStep === 0 ? "Annuler" : "Précédent"}
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 px-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Création...
                            </>
                        ) : currentStep === steps.length - 1 ? (
                            <>
                                <BookOpen className="w-4 h-4 mr-2" />
                                Créer le Programme
                            </>
                        ) : (
                            <>
                                Suivant
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
