"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, Palette, Camera, Loader2, Save, Mail, UserCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// Note: Assuming upload functionality is separate or handled later. 
// For now, simple fields.

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Form States
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "")
            setEmail(session.user.email || "")
        }
    }, [session])

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email })
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Profil mis à jour !")
                // Update session client-side
                await update({ name: data.user.name, email: data.user.email })
            } else {
                toast.error(data.message || "Erreur lors de la mise à jour")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erreur inattendue")
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword })
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Mot de passe modifié avec succès")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                toast.error(data.message || "Erreur lors du changement de mot de passe")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erreur inattendue")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6 lg:p-10 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-2">
                    Paramètres du Compte
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Gérez vos informations personnelles et vos préférences de sécurité.
                </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="general" className="w-full flex flex-col lg:flex-row gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:w-64 flex-shrink-0"
                    >
                        <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
                            <TabsTrigger
                                value="general"
                                className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                <UserCircle className="w-5 h-5 mr-3" />
                                Général
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                <Lock className="w-5 h-5 mr-3" />
                                Sécurité
                            </TabsTrigger>
                            <TabsTrigger
                                value="appearance"
                                className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                <Palette className="w-5 h-5 mr-3" />
                                Apparence
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                <Bell className="w-5 h-5 mr-3" />
                                Notifications
                            </TabsTrigger>
                        </TabsList>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1"
                    >
                        {/* GENERAL TAB */}
                        <TabsContent value="general" className="mt-0 space-y-6">
                            <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="h-32 bg-gradient-to-r from-emerald-500 to-blue-600 dark:from-emerald-700 dark:to-blue-800 w-full relative">
                                    <div className="absolute -bottom-12 left-8">
                                        <div className="relative group">
                                            <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-900 shadow-lg">
                                                <AvatarImage src={session?.user?.image || ""} />
                                                <AvatarFallback className="text-2xl">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                            <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <CardHeader className="pt-16 pb-4">
                                    <CardTitle>Informations Personnelles</CardTitle>
                                    <CardDescription>Mettez à jour votre photo et vos détails personnels.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nom complet</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="pl-10 h-10 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-10 h-10 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Sauvegarder les modifications
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* SECURITY TAB */}
                        <TabsContent value="security" className="mt-0 space-y-6">
                            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Mot de passe</CardTitle>
                                    <CardDescription>Modifiez votre mot de passe pour sécuriser votre compte.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="current">Mot de passe actuel</Label>
                                            <Input
                                                id="current"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="bg-gray-50 dark:bg-gray-900/50"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="new">Nouveau mot de passe</Label>
                                            <Input
                                                id="new"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="bg-gray-50 dark:bg-gray-900/50"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
                                            <Input
                                                id="confirm"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="bg-gray-50 dark:bg-gray-900/50"
                                            />
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={loading} variant="outline" className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                Changer le mot de passe
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* APPEARANCE TAB (Placeholder) */}
                        <TabsContent value="appearance" className="mt-0">
                            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Apparence</CardTitle>
                                    <CardDescription>Personnalisez l'interface de l'application (Bientôt disponible).</CardDescription>
                                </CardHeader>
                                <CardContent className="py-10 text-center text-gray-500">
                                    <Palette className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Les paramètres de thème seront bientôt disponibles.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* NOTIFICATIONS TAB (Placeholder) */}
                        <TabsContent value="notifications" className="mt-0">
                            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>Gérez vos préférences de notifications (Bientôt disponible).</CardDescription>
                                </CardHeader>
                                <CardContent className="py-10 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>La gestion des notifications arrive bientôt.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </motion.div>
                </Tabs>
            </div>
        </div>
    )
}
