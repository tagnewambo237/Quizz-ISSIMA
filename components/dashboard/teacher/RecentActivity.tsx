import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Activity {
    id: string
    type: 'EXAM_CREATED' | 'EXAM_PUBLISHED' | 'ATTEMPT_SUBMITTED'
    title: string
    description: string
    timestamp: Date
    user?: {
        name: string
        image?: string
    }
}

interface RecentActivityProps {
    activities: Activity[]
}

import { motion } from "framer-motion"

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="col-span-3 border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                    Activité Récente
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-8">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8 italic">
                            Aucune activité récente à afficher.
                        </p>
                    ) : (
                        activities.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center group p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 dark:hover:bg-gray-800"
                            >
                                <div className="relative">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-200">
                                        <AvatarImage src={activity.user?.image} alt="Avatar" />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                            {activity.user?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
                                </div>
                                <div className="ml-4 space-y-1 flex-1">
                                    <p className="text-sm font-semibold leading-none text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {activity.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {activity.description}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                    {new Date(activity.timestamp).toLocaleDateString()}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
