"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, BookOpen, Users, Settings, LogOut, School, FileText, GraduationCap } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Bell } from "lucide-react"

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const isTeacher = session?.user?.role === "TEACHER"

    const teacherLinks = [
        { href: "/teacher", label: "Overview", icon: LayoutDashboard },
        { href: "/teacher/classes", label: "My Classes", icon: Users },
        { href: "/teacher/school", label: "My School", icon: School },
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
                <div className="p-6 flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Xkorin School"
                        width={150}
                        height={40}
                        className="h-8 w-auto"
                    />
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href || pathname?.startsWith(link.href + "/")
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => onClose?.()}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
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
                    <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Theme</span>
                        <ThemeToggle />
                    </div>

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
