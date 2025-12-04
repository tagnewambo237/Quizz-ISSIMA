import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FileText, QrCode, Settings } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
    return (
        <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm h-full">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-xl font-semibold text-[#3a4794] dark:text-white">
                    Actions Rapides
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
                <Link href="/exams/create">
                    <Button className="w-full justify-start h-auto py-4 bg-[#3a4794] hover:bg-[#2a3575] text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] border-0" size="lg">
                        <div className="bg-white/20 p-2.5 rounded-xl mr-4 backdrop-blur-sm">
                            <PlusCircle className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-base">Créer un Examen</div>
                            <div className="text-xs text-blue-100/90 font-medium mt-0.5">Configurer une nouvelle évaluation</div>
                        </div>
                    </Button>
                </Link>
                <Link href="/exams">
                    <Button variant="outline" className="w-full justify-start h-auto py-4 border-gray-200 dark:border-gray-800 hover:bg-white hover:border-[#3a4794] hover:text-[#3a4794] dark:hover:bg-gray-800 dark:hover:border-blue-900 transition-all hover:shadow-md group bg-transparent" size="lg">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mr-3 group-hover:bg-[#3a4794]/10 transition-colors">
                            <FileText className="h-5 w-5 text-gray-500 group-hover:text-[#3a4794] dark:text-gray-400" />
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-[#3a4794]">Gérer mes Examens</span>
                    </Button>
                </Link>
                <Link href="/late-codes">
                    <Button variant="outline" className="w-full justify-start h-auto py-4 border-gray-200 dark:border-gray-800 hover:bg-white hover:border-[#359a53] hover:text-[#359a53] dark:hover:bg-gray-800 dark:hover:border-green-900 transition-all hover:shadow-md group bg-transparent" size="lg">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mr-3 group-hover:bg-[#359a53]/10 transition-colors">
                            <QrCode className="h-5 w-5 text-gray-500 group-hover:text-[#359a53] dark:text-gray-400" />
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-[#359a53]">Générer Code Tardif</span>
                    </Button>
                </Link>
                <Link href="/settings">
                    <Button variant="ghost" className="w-full justify-start h-auto py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" size="lg">
                        <Settings className="mr-3 h-5 w-5" />
                        <span className="font-medium">Paramètres</span>
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
