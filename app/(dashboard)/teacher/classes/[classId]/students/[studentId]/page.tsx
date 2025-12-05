"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { User, Mail, Phone, MapPin, Award, TrendingUp, Brain, Target } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"

// Mock Data
const performanceData = [
    { name: 'Exam 1', score: 12, average: 10 },
    { name: 'Exam 2', score: 14, average: 11 },
    { name: 'Exam 3', score: 13, average: 12 },
    { name: 'Exam 4', score: 16, average: 11.5 },
    { name: 'Exam 5', score: 15, average: 12.5 },
]

const skillsData = [
    { subject: 'Math', A: 120, fullMark: 150 },
    { subject: 'Physique', A: 98, fullMark: 150 },
    { subject: 'SVT', A: 86, fullMark: 150 },
    { subject: 'Français', A: 99, fullMark: 150 },
    { subject: 'Anglais', A: 85, fullMark: 150 },
    { subject: 'Philo', A: 65, fullMark: 150 },
]

export default function StudentDetailPage() {
    const params = useParams()
    const [student, setStudent] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Mock fetch
        setTimeout(() => {
            setStudent({
                id: params.studentId,
                name: "Jean Dupont",
                email: "jean.dupont@example.com",
                phone: "+237 699 99 99 99",
                address: "Douala, Cameroun",
                avatar: null,
                level: "Tle C",
                stats: {
                    average: 14.5,
                    rank: 3,
                    attendance: 95
                }
            })
            setLoading(false)
        }, 1000)
    }, [params.studentId])

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="space-y-8">
            {/* Header / Profile Card */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-secondary to-purple-600 flex items-center justify-center text-4xl text-white font-bold shadow-xl shadow-secondary/20">
                    {student.name[0]}
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{student.level} • Rank #{student.stats.rank}</p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {student.email}
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {student.phone}
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {student.address}
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl min-w-[100px]">
                        <div className="text-green-600 font-bold text-2xl">{student.stats.average}</div>
                        <div className="text-xs text-green-700/70 font-medium uppercase tracking-wide">Moyenne</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl min-w-[100px]">
                        <div className="text-blue-600 font-bold text-2xl">{student.stats.attendance}%</div>
                        <div className="text-xs text-blue-700/70 font-medium uppercase tracking-wide">Présence</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold">Évolution des Notes</h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorStudent)" strokeWidth={3} name="Note" />
                                <Area type="monotone" dataKey="average" stroke="#9CA3AF" fill="none" strokeDasharray="5 5" strokeWidth={2} name="Moyenne Classe" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skills Radar */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Brain className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold">Compétences par Matière</h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                                <PolarGrid stroke="#E5E7EB" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar name="Jean" dataKey="A" stroke="#F97316" fill="#F97316" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Recommendations */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Target className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold">Recommandations Pédagogiques</h3>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Renforcer les bases en Physique</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300/80">
                            Les résultats en mécanique sont en baisse. Suggérer des exercices de révision sur les lois de Newton.
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Excellent progrès en Mathématiques</h4>
                        <p className="text-sm text-green-700 dark:text-green-300/80">
                            A féliciter pour sa progression constante. Peut être orienté vers des exercices d'approfondissement.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
