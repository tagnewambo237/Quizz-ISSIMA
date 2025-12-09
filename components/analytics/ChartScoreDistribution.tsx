import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartScoreDistributionProps {
    scores: number[]
}

export function ChartScoreDistribution({ scores }: ChartScoreDistributionProps) {
    // Create distribution buckets (0-20, 20-40, 40-60, 60-80, 80-100)
    const buckets = [
        { label: '0-20%', min: 0, max: 20, count: 0, color: 'bg-red-500' },
        { label: '20-40%', min: 20, max: 40, count: 0, color: 'bg-orange-500' },
        { label: '40-60%', min: 40, max: 60, count: 0, color: 'bg-yellow-500' },
        { label: '60-80%', min: 60, max: 80, count: 0, color: 'bg-blue-500' },
        { label: '80-100%', min: 80, max: 100, count: 0, color: 'bg-green-500' },
    ]

    // Count scores in each bucket
    scores.forEach(score => {
        const bucket = buckets.find(b => score >= b.min && score < b.max) || buckets[buckets.length - 1]
        bucket.count++
    })

    const maxCount = Math.max(...buckets.map(b => b.count), 1)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribution des Scores</CardTitle>
            </CardHeader>
            <CardContent>
                {scores.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        Aucune donnée disponible
                    </p>
                ) : (
                    <div className="space-y-4">
                        {buckets.map((bucket) => (
                            <div key={bucket.label} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{bucket.label}</span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {bucket.count} étudiant{bucket.count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                                    <div
                                        className={`${bucket.color} h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all`}
                                        style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                                    >
                                        {bucket.count > 0 && (
                                            <span>{((bucket.count / scores.length) * 100).toFixed(0)}%</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="mt-6 pt-4 border-t">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold">{scores.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Moyenne</p>
                                    <p className="text-2xl font-bold">
                                        {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Médiane</p>
                                    <p className="text-2xl font-bold">
                                        {scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)]?.toFixed(1) || 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
