"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy, Trash2, Key, Users, Calendar, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LateCodeManagerProps {
    examId: string
    examStatus: string
}

export function LateCodeManager({ examId, examStatus }: LateCodeManagerProps) {
    const [codes, setCodes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form state
    const [reason, setReason] = useState("")
    const [usages, setUsages] = useState(1)
    const [expiresIn, setExpiresIn] = useState("24") // hours

    useEffect(() => {
        fetchCodes()
    }, [examId])

    const fetchCodes = async () => {
        try {
            const res = await fetch(`/api/exams/${examId}/late-codes`)
            const data = await res.json()
            if (data.success) {
                setCodes(data.data)
            }
        } catch (error) {
            console.error("Error fetching codes:", error)
            toast.error("Erreur lors du chargement des codes")
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        if (!reason) {
            toast.error("Veuillez indiquer un motif")
            return
        }

        setIsGenerating(true)
        try {
            // Calculate expiration date
            const expiresAt = new Date()
            expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn))

            const res = await fetch("/api/late-codes/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examId,
                    reason,
                    usagesRemaining: usages,
                    expiresAt: expiresAt.toISOString()
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Code généré avec succès")
                setCodes([data.data, ...codes])
                setIsDialogOpen(false)
                // Reset form
                setReason("")
                setUsages(1)
                setExpiresIn("24")
            } else {
                toast.error(data.message || "Erreur lors de la génération")
            }
        } catch (error) {
            console.error("Error generating code:", error)
            toast.error("Erreur lors de la génération")
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success("Code copié !")
    }

    // Helper to check if code is valid
    const isValid = (code: any) => {
        const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date()
        const isUsedUp = code.usagesRemaining <= 0
        return !isExpired && !isUsedUp
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-500" />
                        Codes d'Accès Tardif
                    </CardTitle>
                    <CardDescription>
                        Générez des codes pour permettre aux étudiants en retard d'accéder à l'examen fermé.
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Nouveau Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Générer un Code d'Accès</DialogTitle>
                            <DialogDescription>
                                Ce code permettra à un étudiant de commencer l'examen même si la date limite est passée.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reason">Motif / Étudiant concerné</Label>
                                <Input
                                    id="reason"
                                    placeholder="Ex: Maladie - Jean Dupont"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="usages">Nombre d'utilisations</Label>
                                    <Input
                                        id="usages"
                                        type="number"
                                        min="1"
                                        value={usages}
                                        onChange={(e) => setUsages(parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expires">Expire dans (heures)</Label>
                                    <Input
                                        id="expires"
                                        type="number"
                                        min="1"
                                        value={expiresIn}
                                        onChange={(e) => setExpiresIn(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handleGenerate} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Générer le code
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : codes.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Key className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Aucun code généré</p>
                        <p className="text-sm text-gray-400">Cliquez sur "Nouveau Code" pour en créer un.</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Motif</TableHead>
                                    <TableHead>Utilisations</TableHead>
                                    <TableHead>Expiration</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {codes.map((code) => {
                                    const valid = isValid(code)
                                    return (
                                        <TableRow key={code._id || code.code} className={cn(!valid && "opacity-60 bg-gray-50 dark:bg-gray-800/50")}>
                                            <TableCell className="font-mono font-bold text-lg tracking-wider text-blue-600 dark:text-blue-400">
                                                {code.code}
                                            </TableCell>
                                            <TableCell>{code.reason || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3 text-gray-400" />
                                                    <span>{code.usagesRemaining} restants</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {code.expiresAt ? (
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <Calendar className="w-3 h-3 text-gray-400" />
                                                        {new Date(code.expiresAt).toLocaleString()}
                                                    </div>
                                                ) : "Jamais"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={valid ? "default" : "secondary"} className={cn(valid ? "bg-emerald-500 hover:bg-emerald-600" : "bg-gray-400")}>
                                                    {valid ? "Actif" : "Expiré/Épuisé"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(code.code)}
                                                    className="hover:bg-blue-50 text-blue-600"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
