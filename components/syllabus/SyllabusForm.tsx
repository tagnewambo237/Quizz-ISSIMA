"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Save, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, FileText, Video, Link as LinkIcon, Layers, File, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SyllabusFormProps {
    initialData?: any
    onSuccess?: (id: string) => void
}

// Helper types for local state
type ResourceType = 'PDF' | 'VIDEO' | 'LINK' | 'TEXT'

interface Resource {
    title: string
    type: ResourceType
    url?: string
    content?: string
}

interface Topic {
    title: string
    content?: string
    resources: Resource[]
}

interface Chapter {
    title: string
    description?: string
    topics: Topic[]
}

export function SyllabusForm({ initialData, onSuccess }: SyllabusFormProps) {
    const router = useRouter()
    const isEditMode = !!initialData
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'info' | 'structure'>('info')

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

    // Complex State
    const [learningObjectives, setLearningObjectives] = useState<string[]>(initialData?.learningObjectives || [])
    const [currentObjective, setCurrentObjective] = useState("")

    const [chapters, setChapters] = useState<Chapter[]>(initialData?.structure?.chapters || [])

    // --- State Management Helpers ---

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
        setChapters([...chapters, { title: "Nouveau Chapitre", topics: [] }])
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
        newChapters[chapterIndex].topics.push({ title: "Nouveau Sujet", resources: [] })
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

    const addResource = (chapterIndex: number, topicIndex: number) => {
        const newChapters = [...chapters]
        newChapters[chapterIndex].topics[topicIndex].resources.push({
            title: "Nouvelle Ressource",
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
        setSubmitting(true)

        // Construct payload
        const payload = {
            title,
            description,
            subject,
            school,
            classes: selectedClasses,
            learningObjectives,
            structure: {
                chapters
            }
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
                toast.success(isEditMode ? "Programme mis à jour" : "Programme créé")
                if (onSuccess) onSuccess(data.data._id)
                else router.push(`/teacher/syllabus/${data.data._id}`)
            } else {
                toast.error(data.message || "Operation failed")
            }
        } catch (error) {
            console.error("Submit error", error)
            toast.error("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-12 text-center text-gray-500 flex flex-col items-center"><Loader2 className="h-8 w-8 animate-spin mb-2" /> Chargement...</div>

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
                <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'info'
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    Informations Générales
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('structure')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'structure'
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    Structure du Programme
                </button>
            </div>

            <div className={`space-y-6 ${activeTab === 'info' ? 'block' : 'hidden'}`}>
                {/* General Info Section */}
                <div className="max-w-3xl p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre du Programme</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Programme Terminale C - Physique"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Matière</label>
                            <select
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                            >
                                <option value="">Sélectionner une matière</option>
                                {subjects.map(subj => (
                                    <option key={subj._id} value={subj._id}>
                                        {subj.name} ({subj.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">École (Optionnel)</label>
                            <select
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                            >
                                <option value="">Aucune (Personnel)</option>
                                {schools.map(sch => (
                                    <option key={sch._id} value={sch._id}>
                                        {sch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigner aux classes (Optionnel)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableClasses.map(cls => (
                                <button
                                    key={cls._id}
                                    type="button"
                                    onClick={() => {
                                        if (selectedClasses.includes(cls._id)) {
                                            setSelectedClasses(selectedClasses.filter(id => id !== cls._id))
                                        } else {
                                            setSelectedClasses([...selectedClasses, cls._id])
                                        }
                                    }}
                                    className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${selectedClasses.includes(cls._id)
                                            ? "bg-secondary/10 border-secondary text-secondary"
                                            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-secondary/50"
                                        }`}
                                >
                                    {cls.name}
                                </button>
                            ))}
                            {availableClasses.length === 0 && (
                                <p className="text-sm text-gray-500 col-span-full">Aucune classe disponible</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                            rows={4}
                            placeholder="Description du programme, objectifs généraux..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Objectifs Pédagogiques</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Ajouter un objectif..."
                                value={currentObjective}
                                onChange={(e) => setCurrentObjective(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none"
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
                                <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-sm border border-secondary/20">
                                    <span>{obj}</span>
                                    <button onClick={() => removeObjective(idx)} className="hover:text-red-500">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`space-y-6 ${activeTab === 'structure' ? 'block' : 'hidden'}`}>
                {/* Structure Editor */}
                <div className="space-y-4">
                    {chapters.map((chapter, cIndex) => (
                        <StructureChapter
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

                    <button
                        type="button"
                        onClick={addChapter}
                        className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-secondary hover:border-secondary/50 hover:bg-secondary/5 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-medium">Ajouter un Chapitre</span>
                    </button>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-4 z-10 pt-4 flex justify-end">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all font-medium flex items-center gap-2 shadow-lg shadow-secondary/20 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {isEditMode ? "Enregistrer" : "Créer le programme"}
                    </button>
                </div>
            </div>
        </form>
    )
}

// --- Sub-Components (Clean Separation) ---

const StructureChapter = ({
    chapter, cIndex,
    updateChapter, removeChapter,
    addTopic, updateTopic, removeTopic,
    addResource, updateResource, removeResource
}: any) => {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Chapter Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/80 flex items-start gap-4 border-b border-gray-100 dark:border-gray-700 group">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>

                <div className="flex-1 space-y-2">
                    <input
                        type="text"
                        placeholder="Titre du Chapitre"
                        value={chapter.title}
                        onChange={(e) => updateChapter(cIndex, 'title', e.target.value)}
                        className="w-full bg-transparent text-lg font-bold text-gray-900 dark:text-white placeholder-gray-400 outline-none border-b border-transparent focus:border-secondary/30 transition-colors"
                    />
                    <input
                        type="text"
                        placeholder="Description courte (optionnel)"
                        value={chapter.description || ""}
                        onChange={(e) => updateChapter(cIndex, 'description', e.target.value)}
                        className="w-full bg-transparent text-sm text-gray-500 dark:text-gray-400 placeholder-gray-300 outline-none"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => removeChapter(cIndex)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            {/* Topics List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 space-y-4"
                    >
                        {chapter.topics.map((topic: any, tIndex: number) => (
                            <StructureTopic
                                key={tIndex}
                                topic={topic}
                                cIndex={cIndex}
                                tIndex={tIndex}
                                updateTopic={updateTopic}
                                removeTopic={removeTopic}
                                addResource={addResource}
                                updateResource={updateResource}
                                removeResource={removeResource}
                            />
                        ))}

                        <button
                            type="button"
                            onClick={() => addTopic(cIndex)}
                            className="w-full py-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-secondary hover:border-secondary/30 hover:bg-secondary/5 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter un Sujet
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const StructureTopic = ({
    topic, cIndex, tIndex,
    updateTopic, removeTopic,
    addResource, updateResource, removeResource
}: any) => {
    return (
        <div className="pl-6 relative border-l-2 border-gray-100 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 group hover:border-secondary/20 transition-colors">
                <div className="flex justify-between items-start gap-3 mb-2">
                    <input
                        type="text"
                        placeholder="Titre du Sujet"
                        value={topic.title}
                        onChange={(e) => updateTopic(cIndex, tIndex, 'title', e.target.value)}
                        className="flex-1 bg-transparent font-medium text-gray-900 dark:text-white outline-none border-b border-transparent focus:border-secondary/30"
                    />
                    <button
                        type="button"
                        onClick={() => removeTopic(cIndex, tIndex)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <textarea
                    rows={2}
                    placeholder="Contenu du sujet..."
                    value={topic.content || ""}
                    onChange={(e) => updateTopic(cIndex, tIndex, 'content', e.target.value)}
                    className="w-full bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 outline-none resize-none mb-3"
                />

                {/* Resources */}
                <div className="space-y-2">
                    {topic.resources?.map((resource: any, rIndex: number) => (
                        <div key={rIndex} className="flex items-center gap-2 text-xs bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                            <select
                                value={resource.type}
                                onChange={(e) => updateResource(cIndex, tIndex, rIndex, 'type', e.target.value)}
                                className="bg-transparent font-medium text-gray-500 outline-none"
                            >
                                <option value="LINK">Lien</option>
                                <option value="PDF">PDF</option>
                                <option value="VIDEO">Vidéo</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Titre"
                                value={resource.title}
                                onChange={(e) => updateResource(cIndex, tIndex, rIndex, 'title', e.target.value)}
                                className="flex-1 bg-transparent outline-none"
                            />
                            <input
                                type="text"
                                placeholder="URL"
                                value={resource.url || ""}
                                onChange={(e) => updateResource(cIndex, tIndex, rIndex, 'url', e.target.value)}
                                className="flex-1 bg-transparent outline-none text-blue-500"
                            />
                            <button onClick={() => removeResource(cIndex, tIndex, rIndex)} className="text-gray-300 hover:text-red-500">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addResource(cIndex, tIndex)}
                        className="text-xs text-secondary font-medium flex items-center gap-1 hover:underline"
                    >
                        + Ajouter une ressource
                    </button>
                </div>
            </div>
        </div>
    )
}
