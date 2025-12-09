"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Loader2, Save, Plus, Trash2, ChevronDown, ChevronRight,
    BookOpen, FileText, Video, Link as LinkIcon, Layers,
    ArrowRight, ArrowLeft, Check, AlertCircle, Lightbulb,
    GripVertical, Target, Brain
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SyllabusFormProps {
    initialData?: any
    onSuccess?: (id: string) => void
}

type ResourceType = 'PDF' | 'VIDEO' | 'LINK' | 'TEXT'

interface Resource {
    title: string
    type: ResourceType
    url?: string
    content?: string
}

interface Concept {
    id: string
    title: string
    description?: string
}

interface Topic {
    title: string
    content?: string
    concepts: Concept[]
    resources: Resource[]
}

interface Chapter {
    title: string
    description?: string
    topics: Topic[]
}

// Steps for wizard
const STEPS = [
    { id: 'info', title: 'Informations', icon: BookOpen, description: 'Titre, matière et objectifs' },
    { id: 'structure', title: 'Structure', icon: Layers, description: 'Chapitres et sujets' },
    { id: 'concepts', title: 'Concepts', icon: Brain, description: 'Notions clés à maîtriser' },
    { id: 'review', title: 'Vérification', icon: Check, description: 'Relecture avant création' }
]

export function SyllabusForm({ initialData, onSuccess }: SyllabusFormProps) {
    const router = useRouter()
    const isEditMode = !!initialData
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    // Dependencies
    const [subjects, setSubjects] = useState<any[]>([])
    const [schools, setSchools] = useState<any[]>([])
    const [availableClasses, setAvailableClasses] = useState<any[]>([])

    // Form State
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [subject, setSubject] = useState(initialData?.subject?._id || initialData?.subject || "")
    const [school, setSchool] = useState(initialData?.school?._id || initialData?.school || "")
    const [selectedClasses, setSelectedClasses] = useState<string[]>(initialData?.classes || [])
    const [learningObjectives, setLearningObjectives] = useState<string[]>(initialData?.learningObjectives || [])
    const [currentObjective, setCurrentObjective] = useState("")
    const [chapters, setChapters] = useState<Chapter[]>(initialData?.structure?.chapters || [])

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({})

    // --- Validation ---
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        if (step === 0) {
            if (!title.trim()) newErrors.title = "Le titre est requis"
            if (!subject) newErrors.subject = "La matière est requise"
        }

        if (step === 1) {
            if (chapters.length === 0) {
                newErrors.chapters = "Ajoutez au moins un chapitre"
            } else {
                const hasEmptyChapter = chapters.some(c => !c.title.trim())
                if (hasEmptyChapter) newErrors.chapters = "Tous les chapitres doivent avoir un titre"
            }
        }

        if (step === 2) {
            const hasNoConcepts = chapters.every(c =>
                c.topics.every(t => (t.concepts?.length || 0) === 0)
            )
            if (hasNoConcepts && chapters.some(c => c.topics.length > 0)) {
                newErrors.concepts = "Ajoutez au moins un concept à vos sujets"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(Math.min(currentStep + 1, STEPS.length - 1))
        }
    }

    const prevStep = () => {
        setCurrentStep(Math.max(currentStep - 1, 0))
    }

    // --- State Management Helpers ---
    const generateId = () => Math.random().toString(36).substr(2, 9)

    const addObjective = () => {
        if (currentObjective.trim()) {
            setLearningObjectives([...learningObjectives, currentObjective.trim()])
            setCurrentObjective("")
        }
    }

    const removeObjective = (index: number) => {
        setLearningObjectives(learningObjectives.filter((_, i) => i !== index))
    }

    const addChapter = () => {
        setChapters([...chapters, { title: "", description: "", topics: [] }])
    }

    const updateChapter = (index: number, field: keyof Chapter, value: any) => {
        const newChapters = [...chapters]
        newChapters[index] = { ...newChapters[index], [field]: value }
        setChapters(newChapters)
    }

    const removeChapter = (index: number) => {
        setChapters(chapters.filter((_, i) => i !== index))
    }

    const addTopic = (chapterIndex: number) => {
        const newChapters = [...chapters]
        newChapters[chapterIndex].topics.push({ title: "", concepts: [], resources: [] })
        setChapters(newChapters)
    }

    const updateTopic = (chapterIndex: number, topicIndex: number, field: keyof Topic, value: any) => {
        const newChapters = [...chapters]
        newChapters[chapterIndex].topics[topicIndex] = {
            ...newChapters[chapterIndex].topics[topicIndex],
            [field]: value
        }
        setChapters(newChapters)
    }

    const removeTopic = (chapterIndex: number, topicIndex: number) => {
        const newChapters = [...chapters]
        newChapters[chapterIndex].topics = newChapters[chapterIndex].topics.filter((_, i) => i !== topicIndex)
        setChapters(newChapters)
    }

    const addConcept = (chapterIndex: number, topicIndex: number) => {
        const newChapters = [...chapters]
        // Initialize concepts array if it doesn't exist
        if (!newChapters[chapterIndex].topics[topicIndex].concepts) {
            newChapters[chapterIndex].topics[topicIndex].concepts = []
        }
        newChapters[chapterIndex].topics[topicIndex].concepts.push({
            id: generateId(),
            title: "",
            description: ""
        })
        setChapters(newChapters)
    }

    const updateConcept = (cIndex: number, tIndex: number, conceptIndex: number, field: keyof Concept, value: string) => {
        const newChapters = [...chapters]
        newChapters[cIndex].topics[tIndex].concepts[conceptIndex] = {
            ...newChapters[cIndex].topics[tIndex].concepts[conceptIndex],
            [field]: value
        }
        setChapters(newChapters)
    }

    const removeConcept = (cIndex: number, tIndex: number, conceptIndex: number) => {
        const newChapters = [...chapters]
        newChapters[cIndex].topics[tIndex].concepts = newChapters[cIndex].topics[tIndex].concepts.filter((_, i) => i !== conceptIndex)
        setChapters(newChapters)
    }

    const addResource = (chapterIndex: number, topicIndex: number) => {
        const newChapters = [...chapters]
        newChapters[chapterIndex].topics[topicIndex].resources.push({
            title: "",
            type: 'LINK',
            url: ""
        })
        setChapters(newChapters)
    }

    const updateResource = (cIndex: number, tIndex: number, rIndex: number, field: keyof Resource, value: any) => {
        const newChapters = [...chapters]
        newChapters[cIndex].topics[tIndex].resources[rIndex] = {
            ...newChapters[cIndex].topics[tIndex].resources[rIndex],
            [field]: value
        }
        setChapters(newChapters)
    }

    const removeResource = (cIndex: number, tIndex: number, rIndex: number) => {
        const newChapters = [...chapters]
        newChapters[cIndex].topics[tIndex].resources = newChapters[cIndex].topics[tIndex].resources.filter((_, i) => i !== rIndex)
        setChapters(newChapters)
    }

    // --- Effects ---
    useEffect(() => {
        const fetchDependencies = async () => {
            setLoading(true)
            try {
                const [subjectsRes, schoolsRes, classesRes] = await Promise.all([
                    fetch("/api/subjects"),
                    fetch("/api/teacher/schools"),
                    fetch("/api/classes")
                ])

                const subjectsData = await subjectsRes.json()
                const schoolsData = await schoolsRes.json()
                const classesData = await classesRes.json()

                if (subjectsData.success) setSubjects(subjectsData.data)
                else if (Array.isArray(subjectsData.data)) setSubjects(subjectsData.data)

                setSchools(Array.isArray(schoolsData) ? schoolsData : schoolsData.data || [])
                if (classesData.success) setAvailableClasses(classesData.data)

            } catch (error) {
                console.error("Failed to fetch dependencies", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDependencies()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Only allow submission on the final review step
        if (currentStep !== STEPS.length - 1) {
            return
        }

        if (!validateStep(currentStep)) return

        setSubmitting(true)

        const payload = {
            title,
            description,
            subject,
            school,
            classes: selectedClasses,
            learningObjectives,
            structure: { chapters }
        }

        try {
            const url = isEditMode ? `/api/syllabus/${initialData._id}` : "/api/syllabus"
            const method = isEditMode ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            if (data.success) {
                // Sync Concepts explicitly to collection
                try {
                    const allConcepts: any[] = []
                    chapters.forEach((chap, cIndex) => {
                        chap.topics.forEach((topic, tIndex) => {
                            topic.concepts?.forEach((concept, conceptIndex) => {
                                allConcepts.push({
                                    _id: (concept.id && concept.id.length === 24) ? concept.id : undefined, // Keep existing Mongo ID if valid
                                    title: concept.title,
                                    description: concept.description,
                                    order: conceptIndex
                                })
                            })
                        })
                    })

                    if (data.data && data.data._id && allConcepts.length > 0) {
                        await fetch('/api/concepts/sync', {
                            method: 'POST',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                syllabusId: data.data._id,
                                concepts: allConcepts
                            })
                        })
                    }
                } catch (syncError) {
                    console.error("Concept sync warning:", syncError)
                }

                toast.success(isEditMode ? "Programme mis à jour" : "Programme créé avec succès!")
                if (onSuccess) onSuccess(data.data._id)
                else router.push(`/teacher/syllabus/${data.data._id}`)
            } else {
                toast.error(data.message || "Erreur lors de l'opération")
            }
        } catch (error) {
            console.error("Submit error", error)
            toast.error("Une erreur est survenue")
        } finally {
            setSubmitting(false)
        }
    }

    // Calculate stats for review
    const totalConcepts = chapters.reduce((sum, c) =>
        sum + c.topics.reduce((tSum, t) => tSum + (t.concepts?.length || 0), 0), 0
    )
    const totalTopics = chapters.reduce((sum, c) => sum + c.topics.length, 0)

    if (loading) return (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            Chargement...
        </div>
    )

    return (
        <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
                // Prevent Enter key from submitting form except on last step
                if (e.key === 'Enter' && currentStep !== STEPS.length - 1) {
                    e.preventDefault()
                }
            }}
            className="max-w-4xl mx-auto"
        >
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -z-10">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#3a4795] to-[#359b52]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {STEPS.map((step, index) => {
                        const Icon = step.icon
                        const isActive = index === currentStep
                        const isCompleted = index < currentStep

                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => index < currentStep && setCurrentStep(index)}
                                disabled={index > currentStep}
                                className={`flex flex-col items-center gap-2 transition-all ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                                    ? 'bg-gradient-to-br from-[#3a4795] to-[#359b52] text-white shadow-lg shadow-[#3a4795]/30 scale-110'
                                    : isCompleted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                    }`}>
                                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                </div>
                                <div className="text-center">
                                    <p className={`text-sm font-semibold ${isActive ? 'text-[#3a4795]' : 'text-gray-500'}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-400 hidden sm:block">{step.description}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Step 1: Info */}
                    {currentStep === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-[#3a4795]/10 rounded-xl text-[#3a4795]">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Informations Générales</h2>
                                    <p className="text-sm text-gray-500">Définissez les informations de base de votre programme</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Titre du Programme <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Programme Terminale C - Physique"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#3a4795]/20 outline-none transition-all`}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Matière <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.subject ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#3a4795]/20 outline-none transition-all`}
                                    >
                                        <option value="">Sélectionner une matière</option>
                                        {subjects.map(subj => (
                                            <option key={subj._id} value={subj._id}>
                                                {subj.name} ({subj.code})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">École (Optionnel)</label>
                                    <select
                                        value={school}
                                        onChange={(e) => setSchool(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#3a4795]/20 outline-none transition-all"
                                    >
                                        <option value="">Aucune (Personnel)</option>
                                        {schools.map(sch => (
                                            <option key={sch._id} value={sch._id}>{sch.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Description du programme, objectifs généraux..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#3a4795]/20 outline-none transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Objectifs Pédagogiques
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Ajouter un objectif..."
                                        value={currentObjective}
                                        onChange={(e) => setCurrentObjective(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#3a4795]/20 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={addObjective}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {learningObjectives.map((obj, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-[#3a4795]/10 text-[#3a4795] rounded-lg text-sm border border-[#3a4795]/20">
                                            <Target className="h-3 w-3" />
                                            <span>{obj}</span>
                                            <button type="button" onClick={() => removeObjective(idx)} className="hover:text-red-500">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Structure */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-[#3a4795]/10 rounded-xl text-[#3a4795]">
                                            <Layers className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Structure du Programme</h2>
                                            <p className="text-sm text-gray-500">Organisez vos chapitres et sujets</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addChapter}
                                        className="px-4 py-2 bg-[#3a4795] text-white rounded-xl hover:bg-[#3a4795]/90 transition-colors flex items-center gap-2 font-medium"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Ajouter un Chapitre
                                    </button>
                                </div>

                                {errors.chapters && (
                                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <span className="text-sm">{errors.chapters}</span>
                                    </div>
                                )}

                                {chapters.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <Layers className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-500 mb-2">Aucun chapitre</h3>
                                        <p className="text-sm text-gray-400 mb-6">Commencez par ajouter votre premier chapitre</p>
                                        <button
                                            type="button"
                                            onClick={addChapter}
                                            className="px-6 py-3 bg-gradient-to-r from-[#3a4795] to-[#359b52] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                                        >
                                            <Plus className="h-5 w-5 inline mr-2" />
                                            Ajouter un Chapitre
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {chapters.map((chapter, cIndex) => (
                                            <ChapterBlock
                                                key={cIndex}
                                                chapter={chapter}
                                                cIndex={cIndex}
                                                updateChapter={updateChapter}
                                                removeChapter={removeChapter}
                                                addTopic={addTopic}
                                                updateTopic={updateTopic}
                                                removeTopic={removeTopic}
                                                addResource={addResource}
                                                updateResource={updateResource}
                                                removeResource={removeResource}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Concepts */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                                        <Brain className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Concepts à Maîtriser</h2>
                                        <p className="text-sm text-gray-500">Définissez les notions clés pour chaque sujet. Les apprenants pourront s'auto-évaluer sur ces concepts.</p>
                                    </div>
                                </div>

                                {errors.concepts && (
                                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-3 text-yellow-700">
                                        <Lightbulb className="h-5 w-5 flex-shrink-0" />
                                        <span className="text-sm">{errors.concepts}</span>
                                    </div>
                                )}

                                {chapters.length === 0 ? (
                                    <div className="py-12 text-center text-gray-400">
                                        <p>Retournez à l'étape précédente pour ajouter des chapitres et sujets.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {chapters.map((chapter, cIndex) => (
                                            <div key={cIndex} className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{chapter.title || `Chapitre ${cIndex + 1}`}</h3>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    {chapter.topics.length === 0 ? (
                                                        <p className="text-sm text-gray-400 text-center py-4">Aucun sujet dans ce chapitre</p>
                                                    ) : (
                                                        chapter.topics.map((topic, tIndex) => (
                                                            <ConceptEditor
                                                                key={tIndex}
                                                                topic={topic}
                                                                cIndex={cIndex}
                                                                tIndex={tIndex}
                                                                addConcept={addConcept}
                                                                updateConcept={updateConcept}
                                                                removeConcept={removeConcept}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
                                        <Check className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vérification Finale</h2>
                                        <p className="text-sm text-gray-500">Relisez les informations avant de créer votre programme</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 bg-[#3a4795]/10 rounded-2xl text-center">
                                        <p className="text-3xl font-bold text-[#3a4795]">{chapters.length}</p>
                                        <p className="text-sm text-gray-600">Chapitres</p>
                                    </div>
                                    <div className="p-4 bg-[#359b52]/10 rounded-2xl text-center">
                                        <p className="text-3xl font-bold text-[#359b52]">{totalTopics}</p>
                                        <p className="text-sm text-gray-600">Sujets</p>
                                    </div>
                                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-center">
                                        <p className="text-3xl font-bold text-purple-600">{totalConcepts}</p>
                                        <p className="text-sm text-gray-600">Concepts</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Titre</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Matière</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {subjects.find(s => s._id === subject)?.name || '-'}
                                        </p>
                                    </div>
                                    {description && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                            <p className="text-sm text-gray-500 mb-1">Description</p>
                                            <p className="text-gray-700 dark:text-gray-300">{description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Footer Navigation */}
            <div className="mt-8 flex justify-between items-center">
                <button
                    type="button"
                    onClick={currentStep === 0 ? () => router.back() : prevStep}
                    className="px-6 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {currentStep === 0 ? 'Annuler' : 'Précédent'}
                </button>

                {currentStep < STEPS.length - 1 ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="px-8 py-3 bg-gradient-to-r from-[#3a4795] to-[#359b52] text-white rounded-xl hover:shadow-lg hover:shadow-[#3a4795]/20 transition-all font-medium flex items-center gap-2"
                    >
                        Suivant
                        <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-gradient-to-r from-[#3a4795] to-[#359b52] text-white rounded-xl hover:shadow-lg hover:shadow-[#3a4795]/20 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {isEditMode ? "Enregistrer" : "Créer le programme"}
                    </button>
                )}
            </div>
        </form>
    )
}

// --- Sub-Components ---

const ChapterBlock = ({
    chapter, cIndex,
    updateChapter, removeChapter,
    addTopic, updateTopic, removeTopic,
    addResource, updateResource, removeResource
}: any) => {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Titre du Chapitre"
                        value={chapter.title}
                        onChange={(e) => updateChapter(cIndex, 'title', e.target.value)}
                        className="w-full bg-transparent font-bold text-gray-900 dark:text-white placeholder-gray-400 outline-none text-lg"
                    />
                </div>
                <button type="button" onClick={() => removeChapter(cIndex)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 space-y-4"
                    >
                        {chapter.topics.map((topic: any, tIndex: number) => (
                            <div key={tIndex} className="pl-4 border-l-2 border-[#3a4795]/30">
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                                    {/* Topic Header */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#3a4795]/10 rounded-lg text-[#3a4795]">
                                            <Layers className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Titre du sujet"
                                            value={topic.title}
                                            onChange={(e) => updateTopic(cIndex, tIndex, 'title', e.target.value)}
                                            className="flex-1 bg-transparent font-bold text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                                        />
                                        <button type="button" onClick={() => removeTopic(cIndex, tIndex)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Topic Resources */}
                                    <div className="pl-2 space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <LinkIcon className="h-3 w-3" /> Ressources Pédagogiques
                                        </p>

                                        {(topic.resources || []).map((resource: any, rIndex: number) => (
                                            <div key={rIndex} className="flex flex-col sm:flex-row gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                <select
                                                    value={resource.type}
                                                    onChange={(e) => updateResource(cIndex, tIndex, rIndex, 'type', e.target.value)}
                                                    className="px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#3a4795]/20 outline-none"
                                                >
                                                    <option value="PDF">PDF</option>
                                                    <option value="VIDEO">Vidéo</option>
                                                    <option value="LINK">Lien</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Titre de la ressource"
                                                    value={resource.title}
                                                    onChange={(e) => updateResource(cIndex, tIndex, rIndex, 'title', e.target.value)}
                                                    className="flex-1 px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#3a4795]/20 outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="URL (https://...)"
                                                    value={resource.url}
                                                    onChange={(e) => updateResource(cIndex, tIndex, rIndex, 'url', e.target.value)}
                                                    className="flex-1 px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#3a4795]/20 outline-none"
                                                />
                                                <button type="button" onClick={() => removeResource(cIndex, tIndex, rIndex)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => addResource(cIndex, tIndex)}
                                            className="text-xs font-medium text-[#3a4795] hover:text-[#3a4795]/80 flex items-center gap-1 px-2 py-1 hover:bg-[#3a4795]/5 rounded-md transition-colors w-fit"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Ajouter une ressource
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addTopic(cIndex)}
                            className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:text-[#3a4795] hover:border-[#3a4795]/50 hover:bg-[#3a4795]/5 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter un sujet
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const ConceptEditor = ({
    topic, cIndex, tIndex,
    addConcept, updateConcept, removeConcept
}: any) => {
    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{topic.title || 'Sujet sans titre'}</h4>
                <button
                    type="button"
                    onClick={() => addConcept(cIndex, tIndex)}
                    className="text-xs text-purple-600 font-medium flex items-center gap-1 hover:underline"
                >
                    <Plus className="h-3 w-3" />
                    Ajouter un concept
                </button>
            </div>

            {(!topic.concepts || topic.concepts.length === 0) ? (
                <p className="text-sm text-gray-400 py-3 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    Aucun concept défini
                </p>
            ) : (
                <div className="space-y-2">
                    {(topic.concepts || []).map((concept: any, conceptIndex: number) => (
                        <div key={concept.id || conceptIndex} className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
                            <Brain className="h-4 w-4 text-purple-500 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Nom du concept"
                                value={concept.title}
                                onChange={(e) => updateConcept(cIndex, tIndex, conceptIndex, 'title', e.target.value)}
                                className="flex-1 bg-transparent text-sm font-medium text-purple-900 dark:text-purple-100 placeholder-purple-300 outline-none"
                            />
                            <button type="button" onClick={() => removeConcept(cIndex, tIndex, conceptIndex)} className="text-purple-400 hover:text-red-500">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
