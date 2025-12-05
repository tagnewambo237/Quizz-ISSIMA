import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Check, AlertCircle, Clock, BookOpen, Target, Shield, HelpCircle, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step5Props {
    data: any
}

export function Step5Preview({ data }: Step5Props) {
    const isValid = data.title && data.subject && data.questions && data.questions.length > 0

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Prêt à lancer ?</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    Vérifiez les détails de votre mission avant le décollage
                </p>
            </div>

            {!isValid && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 flex items-start gap-4"
                >
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 dark:text-red-400">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-red-800 dark:text-red-200">Informations manquantes</h4>
                        <p className="text-red-700 dark:text-red-300 mt-1">
                            Assurez-vous d'avoir rempli le titre, choisi une matière et ajouté au moins une question.
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Info */}
                <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                        <Rocket className="w-6 h-6 text-blue-500" />
                        Mission
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Titre</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{data.title || "Non défini"}</p>
                        </div>
                        {data.description && (
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</p>
                                <p className="text-gray-700 dark:text-gray-300">{data.description}</p>
                            </div>
                        )}
                        <div className="flex gap-4">
                            <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Durée</span>
                                </div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.duration || 0} min</p>
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                    <Target className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Difficulté</span>
                                </div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.difficultyLevel || "Non défini"}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Classification */}
                <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                        <BookOpen className="w-6 h-6 text-purple-500" />
                        Contexte
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-1">Matière</p>
                            <p className="font-bold text-gray-900 dark:text-white">{data.subject || "Non défini"}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Système</p>
                            <p className="font-bold text-gray-900 dark:text-white">{data.subSystem || "Non défini"}</p>
                        </div>
                        <div className="col-span-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Niveaux Cibles</p>
                            <div className="flex flex-wrap gap-2">
                                {data.targetLevels?.length > 0 ? (
                                    data.targetLevels.map((l: string) => (
                                        <span key={l} className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-700">
                                            {l}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 italic">Aucun niveau sélectionné</span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Questions Summary */}
            <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                        <HelpCircle className="w-6 h-6 text-orange-500" />
                        Défis ({data.questions?.length || 0})
                    </h3>
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-bold">
                        Total: {data.questions?.reduce((acc: number, q: any) => acc + (q.points || 0), 0) || 0} pts
                    </span>
                </div>

                {data.questions && data.questions.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {data.questions.map((q: any, index: number) => (
                            <div key={q.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 flex items-center justify-center font-bold text-orange-600 dark:text-orange-400 shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{q.text}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-500">
                                            {q.type}
                                        </span>
                                        <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-500">
                                            {q.points} pts
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500">Aucune question ajoutée pour le moment</p>
                    </div>
                )}
            </motion.div>

            {/* Anti-Cheat */}
            {data.config?.antiCheat && (
                <motion.div variants={item} className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg p-6 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-green-400" />
                        Sécurité Active
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {data.config.antiCheat.fullscreenRequired && (
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <Check className="h-4 w-4 text-green-400" />
                                <span className="font-medium">Plein écran</span>
                            </div>
                        )}
                        {data.config.antiCheat.disableCopyPaste && (
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <Check className="h-4 w-4 text-green-400" />
                                <span className="font-medium">Anti Copier/Coller</span>
                            </div>
                        )}
                        {data.config.antiCheat.trackTabSwitches && (
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <Check className="h-4 w-4 text-green-400" />
                                <span className="font-medium">Suivi Onglets</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
