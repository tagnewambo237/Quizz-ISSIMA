import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuestionStats {
    questionId: string
    questionText: string
    totalResponses: number
    correctResponses: number
    percentageCorrect: number
    averageTimeSpent: number
}

interface QuestionAnalysisProps {
    questions: QuestionStats[]
}

export function QuestionAnalysis({ questions }: QuestionAnalysisProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analyse par Question</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {questions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            Aucune donnée disponible
                        </p>
                    ) : (
                        questions.map((q, index) => (
                            <div key={q.questionId} className="border-b pb-4 last:border-b-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="font-medium">Question {index + 1}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {q.questionText}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`text-2xl font-bold ${q.percentageCorrect >= 70 ? 'text-green-600' :
                                                q.percentageCorrect >= 50 ? 'text-yellow-600' :
                                                    'text-red-600'
                                            }`}>
                                            {q.percentageCorrect.toFixed(0)}%
                                        </p>
                                        <p className="text-xs text-gray-500">de réussite</p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${q.percentageCorrect >= 70 ? 'bg-green-500' :
                                                q.percentageCorrect >= 50 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                            }`}
                                        style={{ width: `${q.percentageCorrect}%` }}
                                    />
                                </div>

                                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>
                                        {q.correctResponses}/{q.totalResponses} réponses correctes
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Temps moyen: {Math.round(q.averageTimeSpent)}s
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
