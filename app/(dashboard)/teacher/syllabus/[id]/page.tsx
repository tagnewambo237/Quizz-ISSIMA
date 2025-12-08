"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Layers, FileText, Plus, MoreVertical, Edit, Calendar, Trash2, ChevronDown, ChevronRight, Save, Link as LinkIcon, Video, File, Brain } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { SyllabusForm } from "@/components/syllabus/SyllabusForm"

// Components for structure visualization
const ResourceIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'VIDEO': return <Video className="h-4 w-4 text-red-500" />
        case 'LINK': return <LinkIcon className="h-4 w-4 text-blue-500" />
        case 'PDF': return <File className="h-4 w-4 text-orange-500" />
        default: return <FileText className="h-4 w-4 text-gray-500" />
    }
}

export default function SyllabusDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [syllabus, setSyllabus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    // Structure Builder State (Simplified for now - just viewing/rendering)
    // To implement full builder, we'd need complex drag-drop or nested forms.
    // Let's start with Display + "Create Exam" action.

    useEffect(() => {
        const fetchSyllabus = async () => {
            try {
                const res = await fetch(`/api/syllabus/${params.id}`)
                const data = await res.json()
                if (data.success) {
                    setSyllabus(data.data)
                } else {
                    router.push('/teacher/syllabus')
                }
            } catch (error) {
                console.error("Failed to fetch syllabus", error)
            } finally {
                setLoading(false)
            }
        }
        if (params.id) fetchSyllabus()
    }, [params.id, router])

    const handleCreateExam = () => {
        // Redirect to exam creation with syllabus ID and subject pre-filled
        const query = new URLSearchParams({
            syllabusId: syllabus._id,
            subjectId: syllabus.subject?._id,
            // Pre-fill generic title
            title: `Examen - ${syllabus.title}`
        }).toString()

        router.push(`/teacher/exams/create?${query}`)
    }

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div></div>
    if (!syllabus) return null

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-gray-500" />
                    </button>
                    <h1 className="text-2xl font-bold">Modifier le Programme</h1>
                </div>
                <SyllabusForm
                    initialData={syllabus}
                    onSuccess={(id) => {
                        setIsEditing(false)
                        // Refresh data
                        window.location.reload()
                    }}
                />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4">
                    <Link href="/teacher/syllabus">
                        <button className="p-2 mt-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="h-6 w-6 text-gray-500" />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold uppercase tracking-wider">
                                {syllabus.subject?.name}
                            </span>
                            {syllabus.school && (
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                                    {syllabus.school?.name}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{syllabus.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl">{syllabus.description || "Aucune description"}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        Modifier
                    </button>
                    <button
                        onClick={handleCreateExam}
                        className="px-6 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 active:scale-95 font-medium flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Créer un Examen
                    </button>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Content Structure */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Chapters & Topics */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Layers className="h-5 w-5 text-secondary" />
                            Structure du Programme
                        </h2>
                        {/* Placeholder for future builder actions */}
                        {/* <button className="text-sm text-secondary font-medium">+ Ajouter un chapitre</button> */}
                    </div>

                    <div className="space-y-4">
                        {syllabus.structure?.chapters?.length > 0 ? (
                            syllabus.structure.chapters.map((chapter: any, index: number) => (
                                <div key={chapter.id || index} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    {/* Chapter Header */}
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center font-bold text-gray-500 text-sm shadow-sm">
                                                {index + 1}
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{chapter.title}</h3>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {chapter.topics?.length || 0} sujets
                                        </div>
                                    </div>

                                    {/* Topics List */}
                                    <div className="p-2">
                                        {chapter.topics?.map((topic: any, tIndex: number) => (
                                            <div key={topic.id || tIndex} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1">
                                                        <div className="h-2 w-2 rounded-full bg-secondary/30 ring-4 ring-secondary/10"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-800 dark:text-gray-200">{topic.title}</h4>
                                                        {topic.content && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{topic.content}</p>}

                                                        {/* Concepts Section */}
                                                        {topic.concepts && topic.concepts.length > 0 && (
                                                            <div className="mt-4 mb-3">
                                                                <h5 className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                                                    <Brain className="h-3 w-3" /> Concepts Clés
                                                                </h5>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {topic.concepts.map((concept: any, cIdx: number) => (
                                                                        <div key={cIdx} className="flex items-start gap-2 p-2 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                                                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                                            <div>
                                                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">
                                                                                    {concept.title}
                                                                                </p>
                                                                                {concept.description && (
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                                                        {concept.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Resources */}
                                                        {topic.resources?.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                                                {topic.resources.map((res: any, rIndex: number) => (
                                                                    <a
                                                                        key={rIndex}
                                                                        href={res.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-white hover:shadow-sm hover:text-secondary border border-transparent hover:border-gray-200 transition-all"
                                                                    >
                                                                        <ResourceIcon type={res.type} />
                                                                        {res.title || "Ressource"}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!chapter.topics || chapter.topics.length === 0) && (
                                            <div className="p-4 text-center text-sm text-gray-400 italic">
                                                Aucun sujet dans ce chapitre
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">La structure du programme est vide.</p>
                                <button className="mt-4 text-secondary font-medium hover:underline">
                                    Utiliser le constructeur de programme (Bientôt)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Objectives & Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-secondary" />
                            Objectifs Pédagogiques
                        </h3>
                        {syllabus.learningObjectives?.length > 0 ? (
                            <ul className="space-y-3">
                                {syllabus.learningObjectives.map((obj: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0" />
                                        {obj}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Aucun objectif défini</p>
                        )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Centre d'examen</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                            Créez des examens basés directement sur ce programme pour évaluer vos élèves sur des chapitres spécifiques.
                        </p>
                        <button
                            onClick={handleCreateExam}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Créer un Examen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
