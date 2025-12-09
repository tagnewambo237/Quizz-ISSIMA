import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

interface StudentPerformanceTableProps {
    attempts: Array<{
        _id: string
        userId: {
            name: string
            email: string
        }
        score: number
        maxScore: number
        percentage: number
        passed: boolean
        timeSpent: number
        submittedAt: Date
    }>
}

export function StudentPerformanceTable({ attempts }: StudentPerformanceTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance des Apprenants</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">Étudiant</th>
                                <th className="text-left py-3 px-4">Score</th>
                                <th className="text-left py-3 px-4">Pourcentage</th>
                                <th className="text-left py-3 px-4">Temps</th>
                                <th className="text-left py-3 px-4">Statut</th>
                                <th className="text-left py-3 px-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        Aucune tentative pour le moment
                                    </td>
                                </tr>
                            ) : (
                                attempts.map((attempt) => (
                                    <tr key={attempt._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium">{attempt.userId.name}</p>
                                                <p className="text-sm text-gray-500">{attempt.userId.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {attempt.score}/{attempt.maxScore}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`font-medium ${attempt.percentage >= 50 ? "text-green-600" : "text-red-600"
                                                }`}>
                                                {attempt.percentage.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {Math.round(attempt.timeSpent / 60)} min
                                        </td>
                                        <td className="py-3 px-4">
                                            {attempt.passed ? (
                                                <div className="flex items-center text-green-600">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Réussi
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-red-600">
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Échoué
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(attempt.submittedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
