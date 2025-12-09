import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExamStatusBadge } from "./ExamStatusBadge"
import { Edit, Eye, Archive, QrCode, TrendingUp } from "lucide-react"

interface ExamCardProps {
    exam: any
    onArchive?: (id: string) => void
    onGenerateLateCode?: (id: string) => void
}

export function ExamCard({ exam, onArchive, onGenerateLateCode }: ExamCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{exam.title}</CardTitle>
                        <ExamStatusBadge status={exam.status} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                            <p className="text-gray-500">Durée</p>
                            <p className="font-medium">{exam.duration || 0} min</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Tentatives</p>
                            <p className="font-medium">{exam.stats?.totalAttempts || 0}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Moyenne</p>
                            <p className="font-medium">{exam.stats?.averageScore || 0}%</p>
                        </div>
                    </div>

                    {exam.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {exam.description}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Link href={`/teacher/exams/${exam._id}`}>
                            <Button variant="outline" size="sm">
                                <Eye className="mr-1 h-3 w-3" />
                                Voir
                            </Button>
                        </Link>

                        {exam.status === "DRAFT" && (
                            <Link href={`/teacher/exams/${exam._id}/edit`}>
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-1 h-3 w-3" />
                                    Modifier
                                </Button>
                            </Link>
                        )}

                        {exam.status === "PUBLISHED" && (
                            <>
                                <Link href={`/teacher/exams/${exam._id}/results`}>
                                    <Button variant="outline" size="sm">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        Résultats
                                    </Button>
                                </Link>
                                {onGenerateLateCode && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onGenerateLateCode(exam._id)}
                                    >
                                        <QrCode className="mr-1 h-3 w-3" />
                                        Code Tardif
                                    </Button>
                                )}
                            </>
                        )}

                        {(exam.status === "PUBLISHED" || exam.status === "VALIDATED") && onArchive && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onArchive(exam._id)}
                            >
                                <Archive className="mr-1 h-3 w-3" />
                                Archiver
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
