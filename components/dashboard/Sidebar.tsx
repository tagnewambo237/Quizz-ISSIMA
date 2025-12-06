"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LayoutDashboard, PlusCircle, BookOpen, Users, Settings, LogOut, School, FileText, GraduationCap, ChevronDown, Check } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()

    // State for schools
    const [schools, setSchools] = useState<any[]>([])
    const [selectedSchool, setSelectedSchool] = useState<any>(null)
    const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false)

    // Get current school ID from URL or session
    const currentSchoolId = searchParams?.get('schoolId')

    const isTeacher = session?.user?.role === "TEACHER"

    useEffect(() => {
        if (isTeacher) {
            fetch('/api/teacher/schools')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSchools(data)
                        // If we have a URL param, match it
                        if (currentSchoolId) {
                            const found = data.find(s => s._id === currentSchoolId)
                            if (found) setSelectedSchool(found)
                        }
                        // Else if we don't have one selected yet, pick the first
                        else if (!selectedSchool && data.length > 0) {
                            setSelectedSchool(data[0])
                        }
                    }
                })
                .catch(err => console.error("Failed to fetch schools", err))
        }
    }, [isTeacher, currentSchoolId])

    const handleSchoolSwitch = (school: any) => {
        setSelectedSchool(school)
        setIsSchoolMenuOpen(false)
        // If we are on a school related page, update the param
        // For now, let's force navigate to the school page to see the context
        // Or if we just want to update context without moving:
        // router.push(`${pathname}?schoolId=${school._id}`)
        // But user might want to go to the "School" page
        router.push(`/teacher/school?schoolId=${school._id}`)
        onClose?.()
    }

    const teacherLinks = [
        { href: "/teacher", label: "Overview", icon: LayoutDashboard },
        { href: "/teacher/classes", label: "My Classes", icon: Users },
        { href: `/teacher/school?schoolId=${selectedSchool?._id || ''}`, label: "My School", icon: School },
        { href: "/teacher/syllabus", label: "Syllabus", icon: BookOpen },
        { href: "/teacher/exams", label: "Exams", icon: FileText },
        { href: "/teacher/students", label: "All Students", icon: GraduationCap },
    ]

    const studentLinks = [
        { href: "/student", label: "Dashboard", icon: LayoutDashboard },
        { href: "/student/history", label: "History", icon: BookOpen },
    ]

    const links = isTeacher ? teacherLinks : studentLinks

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <div className={cn(
                "w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="p-6 pb-2 flex flex-col gap-4">
                    <img
                        src="/logo.png"
                        alt="Xkorin School"
                        className="h-12 w-auto object-contain"
                    />

                    {/* School Switcher for Teachers */}
                    {isTeacher && schools.length > 0 && (
                        <div className="relative mt-2">
                            <button
                                onClick={() => setIsSchoolMenuOpen(!isSchoolMenuOpen)}
                                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-[#114D5A] transition-colors group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center border border-gray-100 dark:border-gray-500 shadow-sm p-1">
                                        {selectedSchool?.logoUrl ? (
                                            <img src={selectedSchool.logoUrl} alt="" className="w-full h-full object-cover rounded-md" />
                                        ) : (
                                            <School className="h-4 w-4 text-[#114D5A]" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start min-w-0">
                                        <span className="text-xs text-gray-400 font-medium">Établissement</span>
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate w-full text-left">
                                            {selectedSchool?.name || "Sélectionner"}
                                        </span>
                                    </div>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-[#114D5A] transition-transform duration-200 ${isSchoolMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isSchoolMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600 z-50 overflow-hidden"
                                    >
                                        <div className="max-h-60 overflow-y-auto py-1">
                                            {schools.map((school) => (
                                                <button
                                                    key={school._id}
                                                    onClick={() => handleSchoolSwitch(school)}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center p-1">
                                                        {school.logoUrl ? (
                                                            <img src={school.logoUrl} alt="" className="w-full h-full object-cover rounded-md" />
                                                        ) : (
                                                            <School className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold truncate ${selectedSchool?._id === school._id ? 'text-[#114D5A] dark:text-[#2a9cad]' : 'text-gray-700 dark:text-gray-200'}`}>
                                                            {school.name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 uppercase">{school.type}</p>
                                                    </div>
                                                    {selectedSchool?._id === school._id && (
                                                        <Check className="h-4 w-4 text-[#114D5A]" />
                                                    )}
                                                </button>
                                            ))}
                                            <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                                                <Link
                                                    href="/teacher/schools/join" // Placeholder for join/create page
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#114D5A] hover:bg-[#114D5A]/5 transition-colors"
                                                    onClick={() => setIsSchoolMenuOpen(false)}
                                                >
                                                    <PlusCircle className="h-3.5 w-3.5" />
                                                    Rejoindre / Créer une école
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon
                        // Adjust active check to ignore query params
                        const isActive = pathname === link.href.split('?')[0] || pathname?.startsWith(link.href.split('?')[0] + "/")
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => onClose?.()}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                    isActive
                                        ? "bg-[#114D5A]/10 text-[#114D5A] font-bold"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {/* <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Theme</span>
                        <ThemeToggle />
                    </div> */}

                    {/* Settings Link */}
                    <Link
                        href="/settings"
                        onClick={() => onClose?.()}
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">Paramètres</span>
                        </div>
                    </Link>

                    {/* Notification Link */}
                    <Link
                        href="/teacher/notifications"
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                    >
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">Notifications</span>
                        <div className="relative">
                            <Bell className="h-5 w-5 text-gray-400 group-hover:text-secondary transition-colors" />
                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                            {session?.user?.name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {session?.user?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {session?.user?.role}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    )
}
