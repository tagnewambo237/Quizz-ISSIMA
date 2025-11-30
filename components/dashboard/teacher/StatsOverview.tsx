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

export function StatsOverview({ stats }: StatsOverviewProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Examens Créés
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalExamsCreated}</div>
                    <p className="text-xs text-muted-foreground">
                        +2 depuis le mois dernier
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Étudiants Touchés
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStudentsReached}</div>
                    <p className="text-xs text-muted-foreground">
                        +12% depuis le mois dernier
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Moyenne de Classe
                    </CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.averageClassScore}/20</div>
                    <p className="text-xs text-muted-foreground">
                        +0.5 points vs moyenne générale
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Examens Actifs
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeExams}</div>
                    <p className="text-xs text-muted-foreground">
                        En cours actuellement
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
