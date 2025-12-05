"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Plus, Search, MoreVertical, FileText, Calendar, Layers, ChevronRight } from "lucide-react"
import Link from "next/link"

// Mock Data
const syllabuses = [
    { id: 1, title: "Programme Terminale C - Physique", subject: "Physique", level: "Terminale C", chapters: 12, topics: 45, lastUpdated: "2 days ago" },
    { id: 2, title: "Programme Terminale C - Mathématiques", subject: "Mathématiques", level: "Terminale C", chapters: 15, topics: 60, lastUpdated: "5 days ago" },
    { id: 3, title: "Programme Première C - Physique", subject: "Physique", level: "Première C", chapters: 10, topics: 38, lastUpdated: "1 week ago" },
]

export default function TeacherSyllabusPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Programmes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez vos syllabus et assignez-les à vos classes</p>
                </div>
                <Link href="/teacher/syllabus/create">
                    <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 active:scale-95 font-medium">
                        <Plus className="h-5 w-5" />
                        Nouveau Programme
                    </button>
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        placeholder="Rechercher un programme..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-secondary"
                    />
                </div>
                <select className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-secondary">
                    <option>Toutes les matières</option>
                    <option>Physique</option>
                    <option>Mathématiques</option>
                </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {syllabuses.map((syllabus, index) => (
                    <motion.div
                        key={syllabus.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-secondary/20 transition-all duration-300 relative overflow-hidden cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="h-14 w-14 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="h-7 w-7" />
                            </div>
                            <div>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {syllabus.subject}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 group-hover:text-secondary transition-colors line-clamp-2">
                                    {syllabus.title}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4" />
                                    <span>{syllabus.chapters} Chapitres</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{syllabus.topics} Sujets</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <span className="text-xs text-gray-400">Mis à jour {syllabus.lastUpdated}</span>
                                <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Add New Card */}
                <Link href="/teacher/syllabus/create">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: syllabuses.length * 0.1 }}
                        className="h-full min-h-[200px] bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-secondary hover:border-secondary/50 hover:bg-secondary/5 transition-all cursor-pointer group"
                    >
                        <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="h-8 w-8" />
                        </div>
                        <span className="font-medium">Créer un nouveau programme</span>
                    </motion.div>
                </Link>
            </div>
        </div>
    )
}
