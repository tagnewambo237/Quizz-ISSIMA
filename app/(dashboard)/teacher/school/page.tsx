"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { School, Users, MapPin, Mail, Phone, Globe, Shield, Plus, MoreVertical, Edit2, Award } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock Data
const schoolStats = {
    totalStudents: 1250,
    totalTeachers: 45,
    activeClasses: 32,
    averageScore: 13.8
}

const teachersList = [
    { id: 1, name: "Marie Curie", subject: "Physique", role: "Admin", status: "Active" },
    { id: 2, name: "Albert Einstein", subject: "Mathématiques", role: "Teacher", status: "Active" },
    { id: 3, name: "Isaac Newton", subject: "Physique", role: "Teacher", status: "Active" },
    { id: 4, name: "Charles Darwin", subject: "SVT", role: "Teacher", status: "Away" },
]

export default function TeacherSchoolPage() {
    const [activeTab, setActiveTab] = useState('overview')
    const [isEditing, setIsEditing] = useState(false)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <School className="h-64 w-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="h-32 w-32 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                        <School className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lycée Classique de Douala</h1>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Validé</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">Enseignement Secondaire Général</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                Douala, Cameroun
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                www.lycee-classique.cm
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                        <Edit2 className="h-4 w-4" />
                        Modifier
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700">
                {['overview', 'teachers', 'settings'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-2 font-medium capitalize transition-colors relative ${activeTab === tab
                            ? "text-secondary"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTabSchool"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                    <Users className="h-6 w-6" />
                                </div>
                                <span className="text-sm text-gray-500">Élèves</span>
                            </div>
                            <h4 className="text-3xl font-bold">{schoolStats.totalStudents}</h4>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <span className="text-sm text-gray-500">Enseignants</span>
                            </div>
                            <h4 className="text-3xl font-bold">{schoolStats.totalTeachers}</h4>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                                    <School className="h-6 w-6" />
                                </div>
                                <span className="text-sm text-gray-500">Classes</span>
                            </div>
                            <h4 className="text-3xl font-bold">{schoolStats.activeClasses}</h4>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                    <Award className="h-6 w-6" />
                                </div>
                                <span className="text-sm text-gray-500">Moyenne</span>
                            </div>
                            <h4 className="text-3xl font-bold">{schoolStats.averageScore}/20</h4>
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Équipe Pédagogique</h3>
                            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors text-sm font-medium">
                                <Plus className="h-4 w-4" />
                                Inviter
                            </button>
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-left">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nom</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Matière</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {teachersList.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                                {teacher.name[0]}
                                            </div>
                                            {teacher.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{teacher.subject}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${teacher.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {teacher.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${teacher.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {teacher.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                                                <MoreVertical className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm max-w-2xl">
                        <h3 className="text-xl font-bold mb-6">Paramètres de l'établissement</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nom de l'école</label>
                                <input
                                    defaultValue="Lycée Classique de Douala"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-secondary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email de contact</label>
                                    <input
                                        defaultValue="contact@lycee-classique.cm"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Téléphone</label>
                                    <input
                                        defaultValue="+237 699 99 99 99"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Adresse</label>
                                <textarea
                                    defaultValue="Douala, Cameroun"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-secondary resize-none"
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button className="px-8 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-colors">
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
