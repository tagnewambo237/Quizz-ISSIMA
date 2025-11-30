import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FileText, QrCode, Settings } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Link href="/exams/create">
                    <Button className="w-full justify-start" size="lg">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Créer un Examen
                    </Button>
                </Link>
                <Link href="/exams">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                        <FileText className="mr-2 h-4 w-4" />
                        Gérer mes Examens
                    </Button>
                </Link>
                <Link href="/late-codes">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                        <QrCode className="mr-2 h-4 w-4" />
                        Générer Code Tardif
                    </Button>
                </Link>
                <Link href="/settings">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
