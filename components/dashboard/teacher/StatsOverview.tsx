import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, GraduationCap, TrendingUp } from "lucide-react"

interface StatsOverviewProps {
    stats: {
        totalExamsCreated: number
        totalStudentsReached: number
        averageClassScore: number
        activeExams: number
    }
}

import { motion } from "framer-motion"

export function StatsOverview({ stats }: StatsOverviewProps) {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    const hoverEffect = {
        y: -5,
        transition: { type: "spring" as const, stiffness: 300 }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={cardVariants} whileHover={hoverEffect}>
                <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-gray-900 relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BookOpen className="h-24 w-24 text-[#3a4794] transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Examens Créés
                        </CardTitle>
                        <div className="p-2 rounded-full bg-[#3a4794]/10">
                            <BookOpen className="h-4 w-4 text-[#3a4794]" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-[#3a4794]">{stats.totalExamsCreated}</div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                            <span className="text-[#359a53] font-bold">+2</span> depuis le mois dernier
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={hoverEffect}>
                <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-gray-900 relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="h-24 w-24 text-[#359a53] transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Étudiants Touchés
                        </CardTitle>
                        <div className="p-2 rounded-full bg-[#359a53]/10">
                            <Users className="h-4 w-4 text-[#359a53]" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-[#359a53]">{stats.totalStudentsReached}</div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                            <span className="text-[#359a53] font-bold">+12%</span> depuis le mois dernier
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={hoverEffect}>
                <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-gray-900 relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <GraduationCap className="h-24 w-24 text-[#3a4794] transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Moyenne de Classe
                        </CardTitle>
                        <div className="p-2 rounded-full bg-[#3a4794]/10">
                            <GraduationCap className="h-4 w-4 text-[#3a4794]" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-[#3a4794]">{stats.averageClassScore}/20</div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                            <span className="text-[#359a53] font-bold">+0.5</span> vs moyenne générale
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={hoverEffect}>
                <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-gray-900 relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="h-24 w-24 text-[#359a53] transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Examens Actifs
                        </CardTitle>
                        <div className="p-2 rounded-full bg-[#359a53]/10">
                            <TrendingUp className="h-4 w-4 text-[#359a53]" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-[#359a53]">{stats.activeExams}</div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                            En cours actuellement
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
