"use client"

import { useState, useEffect, Suspense } from "react"
import { TeacherInvitationModal } from "@/components/school/TeacherInvitationModal"
import { ClassFormModal } from "@/components/classes/ClassFormModal"
import { useSession } from "next-auth/react"
import { Award, Camera, Edit2, Globe, Mail, MapPin, MoreVertical, Phone, Plus, School, Search, Shield, Users, ChevronDown, Check, TrendingUp, BookOpen, Clock, BarChart3, CalendarDays } from "lucide-react"
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

import { useRouter, useSearchParams } from "next/navigation"

function TeacherSchoolPageContent() {
    const { data: session } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState('overview')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showClassModal, setShowClassModal] = useState(false)
    const [data, setData] = useState<any>(null)
    const [teachers, setTeachers] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [publicSchools, setPublicSchools] = useState<any[]>([])
    const [mySchools, setMySchools] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSchoolSwitcherOpen, setIsSchoolSwitcherOpen] = useState(false)

    // Prioritize URL param
    const urlSchoolId = searchParams.get('schoolId')
    const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(urlSchoolId)

    // Check for redirection if no ID
    useEffect(() => {
        if (!urlSchoolId && mySchools.length > 0) {
            const defaultSchool = mySchools[0]
            router.replace(`/teacher/school?schoolId=${defaultSchool._id}`)
            setCurrentSchoolId(defaultSchool._id)
        } else if (urlSchoolId) {
            setCurrentSchoolId(urlSchoolId)
        }
    }, [urlSchoolId, mySchools, router])

    const schoolId = currentSchoolId

    useEffect(() => {
        setLoading(true)
        const fetchPromises = [
            fetch('/api/schools/public').then(r => r.json()),
            fetch('/api/teacher/schools').then(r => r.json())
        ]

        if (schoolId) {
            fetchPromises.push(
                fetch(`/api/schools/${schoolId}/stats`).then(r => r.json()),
                fetch(`/api/schools/${schoolId}/teachers`).then(r => r.json()),
                fetch(`/api/schools/${schoolId}/classes`).then(r => r.json())
            )
        }

        Promise.all(fetchPromises).then((results) => {
            const [schoolsData, mySchoolsData] = results;
            // API returns { success, data } so extract the data array
            setPublicSchools(schoolsData?.data || schoolsData || [])
            setMySchools(mySchoolsData?.data || mySchoolsData || [])

            // If we didn't have a schoolId but we got schools, trigger the redirect effect above
            // The data fetching for specific school will happen on next render after redirect? 
            // Or better, handle it here if we want immediate feedback without redirect flickers.

            // Actually, if we are redirecting, we can wait. 
            // But let's support loading if we have a schoolId.
            if (schoolId && results.length > 2) {
                setData(results[2])
                setTeachers(results[3])
                setClasses(results[4])
            }
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }, [schoolId])

    const fetchClasses = async () => {
        if (!schoolId) return
        try {
            const res = await fetch(`/api/schools/${schoolId}/classes`)
            const data = await res.json()
            setClasses(data || [])
        } catch (error) {
            console.error("Failed to fetch classes", error)
        }
    }

    const fetchTeachers = async () => {
        if (!schoolId) return
        try {
            const res = await fetch(`/api/schools/${schoolId}/teachers`)
            const data = await res.json()
            setTeachers(data || [])
        } catch (error) {
            console.error("Failed to fetch teachers", error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Get current school from mySchools or from data
    const school = mySchools.find(s => s._id === schoolId) || data?.details || {}
    const stats = data?.stats || { totalStudents: 0, totalTeachers: 0, activeClasses: 0, averageScore: 0, examsCount: 0, completionRate: 0 }
    const charts = data?.charts || {
        scoreDistribution: [],
        recentPerformance: [],
        classDistribution: [],
        recentExams: []
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
                {/* Decorative Background */}
                <div className="absolute inset-0 h-48 bg-gradient-to-r from-[#114D5A] to-[#1a7a8f]">
                    <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                </div>

                <div className="relative pt-24 px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                        {/* Logo */}
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-3xl bg-white shadow-2xl p-1 flex items-center justify-center ring-4 ring-white/50 dark:ring-gray-800/50 backdrop-blur-sm">
                                {school.logoUrl ? (
                                    <img src={school.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                        <School className="h-12 w-12 text-[#114D5A]/50" />
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Text Info & Switcher */}
                        <div className="flex-1 space-y-2 mb-2">
                            <div className="flex flex-wrap items-center gap-3 relative">
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                                    {school.name || "Sélectionnez une école"}
                                </h1>
                                {mySchools.length > 1 && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsSchoolSwitcherOpen(!isSchoolSwitcherOpen)}
                                            className="p-1 rounded-full hover:bg-white/20 transition-colors"
                                        >
                                            <ChevronDown className="h-6 w-6 text-white/70 hover:text-white" />
                                        </button>
                                        <AnimatePresence>
                                            {isSchoolSwitcherOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="absolute top-10 left-0 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                                                >
                                                    <div className="p-3">
                                                        <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Mes Écoles</p>
                                                        {mySchools.map((s) => (
                                                            <button
                                                                key={s._id}
                                                                onClick={() => {
                                                                    router.push(`/teacher/school?schoolId=${s._id}`)
                                                                    setIsSchoolSwitcherOpen(false)
                                                                }}
                                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                                                            >
                                                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                                    {s.logoUrl ? (
                                                                        <img src={s.logoUrl} className="w-full h-full object-cover rounded-lg" />
                                                                    ) : (
                                                                        <School className="h-4 w-4 text-gray-500" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm font-semibold truncate ${s._id === schoolId ? 'text-[#114D5A] dark:text-[#2a9cad]' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                        {s.name}
                                                                    </p>
                                                                    {s.type && <p className="text-xs text-gray-500 dark:text-gray-400">{s.type}</p>}
                                                                </div>
                                                                {s._id === schoolId && <Check className="h-4 w-4 text-[#114D5A] dark:text-[#2a9cad]" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {school.status === 'APPROVED' && (
                                    <span className="px-3 py-1 bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200 dark:border-green-800 backdrop-blur-sm">
                                        Vérifié
                                    </span>
                                )}
                            </div>
                            <p className="text-white/90 font-medium flex items-center gap-2">
                                <School className="h-4 w-4" />
                                {school.type || "Établissement Scolaire"}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm pt-1">
                                {school.address && (
                                    <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-gray-700 shadow-sm">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {school.address}
                                    </div>
                                )}
                                {school.contactInfo?.website && (
                                    <a href={school.contactInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-gray-700 hover:text-[#114D5A] hover:bg-white transition-colors shadow-sm">
                                        <Globe className="h-3.5 w-3.5" />
                                        Site Web
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="px-5 py-2.5 bg-[#114D5A] text-white rounded-xl font-semibold shadow-lg shadow-[#114D5A]/20 hover:bg-[#0e3f4a] active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Inviter
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Edit2 className="h-4 w-4" />
                                Éditer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-2xl w-fit border border-gray-100 dark:border-gray-700 shadow-sm">
                {[
                    { id: 'overview', label: 'Vue d\'ensemble' },
                    { id: 'teachers', label: 'Enseignants', count: teachers.length },
                    { id: 'classes', label: 'Classes', count: classes.length },
                    { id: 'ecoles', label: 'Écoles' },
                    { id: 'settings', label: 'Paramètres' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                            ? "text-[#114D5A] dark:text-white bg-gray-50 dark:bg-gray-700/50"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.id
                                ? "bg-[#114D5A]/10 text-[#114D5A] dark:bg-white/10 dark:text-white"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                }`}>
                                {tab.count}
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 border-2 border-[#114D5A]/10 dark:border-white/10 rounded-xl pointer-events-none"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                <StatCard
                                    title="Apprenants"
                                    value={stats.totalStudents}
                                    icon={Users}
                                    color="blue"
                                />
                                <StatCard
                                    title="Enseignants"
                                    value={stats.totalTeachers}
                                    icon={Shield}
                                    color="purple"
                                />
                                <StatCard
                                    title="Classes"
                                    value={stats.activeClasses}
                                    icon={School}
                                    color="orange"
                                />
                                <StatCard
                                    title="Examens"
                                    value={stats.examsCount || 0}
                                    icon={BookOpen}
                                    color="cyan"
                                />
                                <StatCard
                                    title="Moyenne"
                                    value={`${stats.averageScore}%`}
                                    icon={Award}
                                    color="green"
                                />
                                <StatCard
                                    title="Taux de Complétion"
                                    value={`${stats.completionRate || 0}%`}
                                    icon={TrendingUp}
                                    color="pink"
                                />
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Performance Trend Chart */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance Hebdomadaire</h3>
                                            <p className="text-sm text-gray-500">Évolution des scores sur 8 semaines</p>
                                        </div>
                                        <div className="p-2.5 bg-gradient-to-br from-[#114D5A] to-[#1a7a8f] rounded-xl">
                                            <TrendingUp className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="h-[280px]">
                                        {charts.recentPerformance.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={charts.recentPerformance}>
                                                    <defs>
                                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#114D5A" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#114D5A" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                                        domain={[0, 100]}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#fff',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                                        }}
                                                        formatter={(value: any) => [`${value}%`, 'Score moyen']}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="score"
                                                        stroke="#114D5A"
                                                        strokeWidth={3}
                                                        fill="url(#colorScore)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400">
                                                <div className="text-center">
                                                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                    <p className="text-sm">Aucune donnée de performance disponible</p>
                                                    <p className="text-xs mt-1">Les données apparaîtront après les premiers examens</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Score Distribution Chart */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Répartition des Scores</h3>
                                            <p className="text-sm text-gray-500">Distribution par tranche de notes</p>
                                        </div>
                                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                            <BarChart3 className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="h-[280px]">
                                        {charts.scoreDistribution.some((d: any) => d.count > 0) ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={charts.scoreDistribution}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                    <XAxis
                                                        dataKey="range"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#6b7280', fontSize: 11 }}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#fff',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                                        }}
                                                        formatter={(value: any) => [`${value} Apprenants`, 'Nombre']}
                                                    />
                                                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                                                        {charts.scoreDistribution.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400">
                                                <div className="text-center">
                                                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                    <p className="text-sm">Aucune donnée de distribution</p>
                                                    <p className="text-xs mt-1">Créez des examens pour voir les résultats</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Bottom Row: Pie Chart + Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Class Distribution Pie Chart */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Classes par Niveau</h3>
                                            <p className="text-sm text-gray-500">Répartition des classes</p>
                                        </div>
                                    </div>
                                    <div className="h-[200px]">
                                        {charts.classDistribution.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={charts.classDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {charts.classDistribution.map((_: any, index: number) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={['#114D5A', '#1a7a8f', '#22c55e', '#f97316', '#8b5cf6', '#ec4899'][index % 6]}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#fff',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                                        }}
                                                        formatter={(value: any, name: any) => [`${value} classe(s)`, name]}
                                                    />
                                                    <Legend
                                                        verticalAlign="bottom"
                                                        height={36}
                                                        formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400">
                                                <div className="text-center">
                                                    <School className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm">Aucune classe</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Recent Exams Activity */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Examens Récents</h3>
                                            <p className="text-sm text-gray-500">Dernières évaluations de l'établissement</p>
                                        </div>
                                        <div className="p-2.5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl">
                                            <CalendarDays className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {charts.recentExams.length > 0 ? (
                                            charts.recentExams.map((exam: any, index: number) => (
                                                <motion.div
                                                    key={exam.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * index }}
                                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2.5 rounded-xl ${exam.status === 'COMPLETED'
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            <BookOpen className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#114D5A] transition-colors">{exam.title}</p>
                                                            <p className="text-sm text-gray-500">{exam.subject}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${exam.status === 'COMPLETED'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {exam.status === 'COMPLETED' ? 'Terminé' : 'En cours'}
                                                        </span>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {exam.date ? new Date(exam.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-gray-400">
                                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                <p className="text-sm">Aucun examen récent</p>
                                                <p className="text-xs mt-1">Les examens apparaîtront ici une fois créés</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'teachers' && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un enseignant..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#114D5A] outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {/* Filters could go here */}
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#114D5A] text-white rounded-xl hover:bg-[#0e3f4a] transition-colors text-sm font-medium shadow-lg shadow-[#114D5A]/20"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Inviter
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-left border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Enseignant</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Rôle</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {teachers.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-gray-400">
                                                    Aucun enseignant trouvé.
                                                </td>
                                            </tr>
                                        ) : teachers.map((teacher: any) => (
                                            <tr key={teacher._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#114D5A] to-[#1a7a8f] flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                            {teacher.name.charAt(0)}
                                                        </div>
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100">{teacher.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-500">{teacher.email}</td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${teacher.role === 'ADMIN'
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                        }`}>
                                                        {teacher.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {teacher.isActive ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full w-fit">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                            Actif
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-full w-fit">
                                                            En attente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Classes Tab */}
                    {activeTab === 'classes' && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h3 className="text-lg font-bold">Classes de l'établissement</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowClassModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#114D5A] text-white rounded-xl hover:bg-[#0e3f4a] transition-colors text-sm font-medium shadow-lg shadow-[#114D5A]/20"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Nouvelle Classe
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-left border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Nom</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Niveau</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Filière</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Année</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Elèves</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Titulaire</th>
                                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {classes.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-gray-400">
                                                    Aucune classe trouvée pour cette école.
                                                </td>
                                            </tr>
                                        ) : classes.map((cls: any) => (
                                            <tr key={cls._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <Link href={`/teacher/classes/${cls._id}`}>
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100 hover:text-[#114D5A] cursor-pointer">{cls.name}</div>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-500">{cls.level?.name || "N/A"}</td>
                                                <td className="px-6 py-5 text-sm text-gray-500">
                                                    {cls.field?.name || cls.specialty?.name || "-"}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-500">{cls.academicYear || "N/A"}</td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                        {cls.students?.length || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-500">
                                                    {cls.mainTeacher?.name || "Non assigné"}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Link href={`/teacher/classes/${cls._id}`}>
                                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ecoles' && (
                        <div className="space-y-8">
                            {/* My Schools Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <School className="h-5 w-5 text-[#114D5A]" />
                                    Mes Écoles
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {mySchools.map((school) => (
                                        <div key={school._id} className={`group bg-white dark:bg-gray-800 p-6 rounded-[2rem] border shadow-sm transition-all duration-300 ${school._id === schoolId ? 'border-[#114D5A] ring-2 ring-[#114D5A]/10' : 'border-gray-100 dark:border-gray-700 hover:shadow-xl'}`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                                                    {school.logoUrl ? (
                                                        <img src={school.logoUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <School className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>
                                                {school._id === schoolId && (
                                                    <span className="px-3 py-1 bg-[#114D5A]/10 text-[#114D5A] rounded-full text-xs font-bold">Actif</span>
                                                )}
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">{school.name}</h4>
                                            <p className="text-sm text-gray-500 mb-4">{school.type}</p>

                                            {school._id !== schoolId && (
                                                <button
                                                    onClick={() => router.push(`/teacher/school?schoolId=${school._id}`)}
                                                    className="w-full py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm hover:bg-[#114D5A] hover:text-white transition-colors"
                                                >
                                                    Gérer
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-700" />

                            {/* Public Schools (Discovery) */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-[#114D5A]" />
                                    Écoles Disponibles
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {publicSchools.filter(ps => !mySchools.find(ms => ms._id === ps._id)).length === 0 ? (
                                        <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <p className="text-gray-500">Aucune autre école disponible.</p>
                                        </div>
                                    ) : publicSchools.filter(ps => !mySchools.find(ms => ms._id === ps._id)).map((school: any) => {
                                        const isApplied = school.applicants?.includes(session?.user?.id);
                                        return (
                                            <div key={school._id} className="group bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-[#114D5A]/20 transition-all duration-300">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="h-14 w-14 rounded-2xl bg-[#eff6f7] dark:bg-[#114D5A]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                        <School className="h-7 w-7 text-[#114D5A] dark:text-[#2a9cad]" />
                                                    </div>
                                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wide">
                                                        {school.type}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#114D5A] transition-colors">{school.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                                    <MapPin className="h-4 w-4" />
                                                    {school.address || "Localisation non renseignée"}
                                                </div>

                                                {isApplied ? (
                                                    <button disabled className="w-full py-3 bg-yellow-50 text-yellow-600 rounded-xl font-bold text-sm cursor-not-allowed border border-yellow-100">
                                                        Demande envoyée
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const res = await fetch('/api/schools/apply', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ schoolId: school._id })
                                                                });
                                                                if (res.ok) {
                                                                    // Refresh public schools to show "Applied"
                                                                    const updated = await fetch('/api/schools/public').then(r => r.json());
                                                                    setPublicSchools(updated);
                                                                } else {
                                                                    alert("Failed to apply");
                                                                }
                                                            } catch (e) {
                                                                alert("Error applying");
                                                            }
                                                        }}
                                                        className="w-full py-3 bg-[#114D5A] text-white hover:bg-[#0e3f4a] rounded-xl font-bold transition-all text-sm shadow-lg shadow-[#114D5A]/20"
                                                    >
                                                        Postuler
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres de l'établissement</h2>
                                <p className="text-gray-500 text-sm mt-1">Gérez les informations publiques et les coordonnées.</p>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nom de l'école</label>
                                        <input defaultValue={school.name} className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#114D5A]/30 focus:bg-white dark:focus:bg-black transition-all outline-none font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</label>
                                        <select defaultValue={school.type} className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent outline-none font-medium">
                                            <option value="PRIMARY">Primaire</option>
                                            <option value="SECONDARY">Secondaire</option>
                                            <option value="HIGHER_ED">Supérieur</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input defaultValue={school.contactInfo?.email} className="w-full pl-11 pr-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent outline-none font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input defaultValue={school.contactInfo?.phone} className="w-full pl-11 pr-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent outline-none font-medium" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Adresse complète</label>
                                    <textarea defaultValue={school.address} rows={3} className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent outline-none font-medium resize-none" />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button className="px-8 py-3 bg-[#114D5A] hover:bg-[#0e3f4a] text-white rounded-xl font-bold shadow-lg shadow-[#114D5A]/20 transition-all active:scale-95">
                                        Enregistrer les modifications
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {schoolId && (
                <TeacherInvitationModal
                    isOpen={showInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    schoolId={schoolId}
                />
            )}

            <ClassFormModal
                isOpen={showClassModal}
                onClose={() => setShowClassModal(false)}
                onSuccess={() => {
                    fetchClasses()
                    setShowClassModal(false)
                }}
                initialData={{ school: schoolId }}
            />
        </div>
    )
}

export default function TeacherSchoolPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <TeacherSchoolPageContent />
        </Suspense>
    )
}

function StatCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: {
            bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20",
            icon: "bg-blue-500 text-white",
            text: "text-blue-600 dark:text-blue-400"
        },
        purple: {
            bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20",
            icon: "bg-purple-500 text-white",
            text: "text-purple-600 dark:text-purple-400"
        },
        orange: {
            bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20",
            icon: "bg-orange-500 text-white",
            text: "text-orange-600 dark:text-orange-400"
        },
        green: {
            bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20",
            icon: "bg-green-500 text-white",
            text: "text-green-600 dark:text-green-400"
        },
        cyan: {
            bg: "bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20",
            icon: "bg-cyan-500 text-white",
            text: "text-cyan-600 dark:text-cyan-400"
        },
        pink: {
            bg: "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20",
            icon: "bg-pink-500 text-white",
            text: "text-pink-600 dark:text-pink-400"
        },
    }

    const colorStyle = colors[color] || colors.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={`${colorStyle.bg} p-5 rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group`}
        >
            {/* Decorative circle */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/20 dark:bg-white/5 blur-xl group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${colorStyle.icon} shadow-lg`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                <div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-xs uppercase tracking-wider mb-1">{title}</p>
                    <h4 className={`text-2xl font-extrabold ${colorStyle.text}`}>{value}</h4>
                </div>
            </div>
        </motion.div>
    )
}
