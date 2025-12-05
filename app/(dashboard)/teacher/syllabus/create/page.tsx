"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function CreateSyllabusPage() {
    const [chapters, setChapters] = useState<any[]>([
        { id: 1, title: "Chapitre 1: Introduction", topics: [{ id: 1, title: "Notions de base" }] }
    ])

    const addChapter = () => {
        setChapters([...chapters, { id: Date.now(), title: "Nouveau Chapitre", topics: [] }])
    }

    const addTopic = (chapterId: number) => {
        setChapters(chapters.map(c => {
            if (c.id === chapterId) {
                return { ...c, topics: [...c.topics, { id: Date.now(), title: "Nouveau Sujet" }] }
            }
            return c
        }))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Créer un Programme</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Structurez votre cours en chapitres et sujets</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/teacher/syllabus">
                        <button className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium">
                            Annuler
                        </button>
                    </Link>
                    <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 font-medium">
                        <Save className="h-5 w-5" />
                        Enregistrer
                    </button>
                </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Titre du Programme</label>
                        <input
                            placeholder="Ex: Physique Terminale C"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Matière</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-secondary">
                            <option>Physique</option>
                            <option>Mathématiques</option>
                            <option>SVT</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Description / Objectifs</label>
                    <textarea
                        rows={3}
                        placeholder="Décrivez les objectifs pédagogiques..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-secondary resize-none"
                    />
                </div>
            </div>

            {/* Builder */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Structure du Cours</h3>
                    <button
                        onClick={addChapter}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter un Chapitre
                    </button>
                </div>

                {chapters.map((chapter, index) => (
                    <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-4">
                            <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                            <div className="h-8 w-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm">
                                {index + 1}
                            </div>
                            <input
                                value={chapter.title}
                                onChange={(e) => {
                                    const newChapters = [...chapters]
                                    newChapters[index].title = e.target.value
                                    setChapters(newChapters)
                                }}
                                className="flex-1 bg-transparent border-none outline-none font-semibold text-gray-900 dark:text-white"
                            />
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            {chapter.topics.map((topic: any, tIndex: number) => (
                                <div key={topic.id} className="flex items-center gap-4 pl-12">
                                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                                    <input
                                        value={topic.title}
                                        onChange={(e) => {
                                            const newChapters = [...chapters]
                                            newChapters[index].topics[tIndex].title = e.target.value
                                            setChapters(newChapters)
                                        }}
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 outline-none focus:border-secondary text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            const newChapters = [...chapters]
                                            newChapters[index].topics.splice(tIndex, 1)
                                            setChapters(newChapters)
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => addTopic(chapter.id)}
                                className="ml-12 text-sm text-secondary font-medium flex items-center gap-1 hover:underline"
                            >
                                <Plus className="h-3 w-3" />
                                Ajouter un sujet
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
