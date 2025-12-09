import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Clock, Award } from "lucide-react"

interface ExamStatsProps {
    stats: {
        totalAttempts: number
        totalCompletions: number
        averageScore: number
        passRate: number
        averageTime: number
    }
}

export function ExamStats({ stats }: ExamStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Tentatives Totales
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalAttempts}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.totalCompletions} complétées
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Score Moyen
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Sur toutes les tentatives
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Taux de Réussite
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.passRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Étudiants ayant réussi
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Temps Moyen
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(stats.averageTime / 60)} min</div>
                    <p className="text-xs text-muted-foreground">
                        Durée moyenne de passage
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
