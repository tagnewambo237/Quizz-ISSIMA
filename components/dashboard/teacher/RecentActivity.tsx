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

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Aucune activité récente.
                        </p>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={activity.user?.image} alt="Avatar" />
                                    <AvatarFallback>
                                        {activity.user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {activity.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {activity.description}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">
                                    {new Date(activity.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
