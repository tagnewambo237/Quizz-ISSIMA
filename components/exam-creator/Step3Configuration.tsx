import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Clock, Shield, Award, Calendar, FileText, Lock, Eye, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Step3Props {
    data: any
    onUpdate: (data: any) => void
}

export function Step3Configuration({ data, onUpdate }: Step3Props) {
    const [title, setTitle] = useState(data.title || "")
    const [description, setDescription] = useState(data.description || "")
    const [duration, setDuration] = useState(data.duration || 60)
    const [startTime, setStartTime] = useState(data.startTime || "")
    const [endTime, setEndTime] = useState(data.endTime || "")
    const [closeMode, setCloseMode] = useState(data.closeMode || "MANUAL")
    const [pedagogicalObjective, setPedagogicalObjective] = useState(data.pedagogicalObjective || "FORMATIVE")
    const [evaluationType, setEvaluationType] = useState(data.evaluationType || "QCM")
    const [difficultyLevel, setDifficultyLevel] = useState(data.difficultyLevel || "MEDIUM")

    // Anti-cheat settings
    const [antiCheatEnabled, setAntiCheatEnabled] = useState(data.config?.antiCheat?.fullscreenRequired || false)
    const [disableCopyPaste, setDisableCopyPaste] = useState(data.config?.antiCheat?.disableCopyPaste || false)
    const [trackTabSwitches, setTrackTabSwitches] = useState(data.config?.antiCheat?.trackTabSwitches || false)

    const [internalStep, setInternalStep] = useState(0)
    const [direction, setDirection] = useState(0)

    useEffect(() => {
        onUpdate({
            title,
            description,
            duration,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined,
            closeMode,
            pedagogicalObjective,
            evaluationType,
            difficultyLevel,
            config: {
                shuffleQuestions: false,
                shuffleOptions: false,
                showResultsImmediately: true,
                allowReview: true,
                passingScore: 50,
                maxAttempts: 1,
                timeBetweenAttempts: 0,
                antiCheat: {
                    fullscreenRequired: antiCheatEnabled,
                    disableCopyPaste,
                    trackTabSwitches,
                    blockRightClick: disableCopyPaste,
                    preventScreenshot: false,
                    webcamRequired: false,
                    maxTabSwitches: 3,
                }
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, description, duration, startTime, endTime, closeMode, pedagogicalObjective, evaluationType, difficultyLevel, antiCheatEnabled, disableCopyPaste, trackTabSwitches])

    const nextStep = () => {
        setDirection(1)
        setInternalStep(prev => prev + 1)
    }

    const prevStep = () => {
        setDirection(-1)
        setInternalStep(prev => prev - 1)
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    }

    const steps = [
        { title: "Infos", icon: FileText },
        { title: "Temps", icon: Clock },
        { title: "Pédagogie", icon: Award },
        { title: "Sécurité", icon: Shield },
    ]

    const Switch = ({ checked, onChange, label, icon: Icon }: any) => (
        <motion.div
            className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors",
                checked
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
            onClick={() => onChange(!checked)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-lg",
                    checked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                    "font-medium",
                    checked ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"
                )}>{label}</span>
            </div>
            <div className={cn(
                "w-12 h-6 rounded-full p-1 transition-colors relative",
                checked ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            )}>
                <motion.div
                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                    animate={{ x: checked ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </div>
        </motion.div>
    )

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="flex justify-between items-center px-4 mb-8">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = index === internalStep
                    const isCompleted = index < internalStep
                    return (
                        <div key={index} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                isActive ? "bg-blue-600 border-blue-600 text-white scale-110" :
                                    isCompleted ? "bg-green-500 border-green-500 text-white" :
                                        "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                            )}>
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={cn(
                                "text-xs font-medium transition-colors duration-300",
                                isActive ? "text-blue-600 dark:text-blue-400" :
                                    isCompleted ? "text-green-500" :
                                        "text-gray-400"
                            )}>{step.title}</span>
                        </div>
                    )
                })}
                {/* Progress Bar Background */}
                <div className="absolute top-[4.5rem] left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0 hidden md:block" />
            </div>

            <div className="min-h-[400px] relative">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    {/* Step 0: Basic Info */}
                    {internalStep === 0 && (
                        <motion.div
                            key="step0"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Informations de Base</h2>
                                <p className="text-gray-500 dark:text-gray-400">Donnez une identité à votre examen</p>
                            </div>
                            <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Titre de l'examen</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 dark:bg-gray-900 font-medium text-lg"
                                        placeholder="Ex: Contrôle de Mathématiques - Chapitre 3"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 dark:bg-gray-900"
                                        rows={3}
                                        placeholder="Instructions pour les étudiants..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={nextStep}
                                    disabled={!title}
                                    className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8 rounded-full"
                                >
                                    Suivant <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Timing */}
                    {internalStep === 1 && (
                        <motion.div
                            key="step1"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Planification</h2>
                                <p className="text-gray-500 dark:text-gray-400">Gérez le temps et les délais</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Durée de l'épreuve</label>
                                    <div className="flex items-center gap-6">
                                        <input
                                            type="range"
                                            min="5"
                                            max="180"
                                            step="5"
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value))}
                                            className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                        />
                                        <div className="w-28 text-center font-bold text-3xl text-orange-600 bg-orange-50 dark:bg-orange-900/20 py-3 rounded-xl border-2 border-orange-100 dark:border-orange-800">
                                            {duration}m
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date de début</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="datetime-local"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-gray-50 dark:bg-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date de fin</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="datetime-local"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-gray-50 dark:bg-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={prevStep} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8 rounded-full"
                                >
                                    Suivant <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Pedagogy */}
                    {internalStep === 2 && (
                        <motion.div
                            key="step2"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Paramètres Pédagogiques</h2>
                                <p className="text-gray-500 dark:text-gray-400">Ajustez la difficulté et le type d'évaluation</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Objectif</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["FORMATIVE", "SUMMATIVE", "DIAGNOSTIC"].map((obj) => (
                                            <button
                                                key={obj}
                                                onClick={() => setPedagogicalObjective(obj)}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 text-sm font-bold transition-all",
                                                    pedagogicalObjective === obj
                                                        ? "border-purple-500 bg-purple-50 text-purple-700"
                                                        : "border-gray-200 hover:border-purple-300"
                                                )}
                                            >
                                                {obj === "FORMATIVE" ? "Formatif" : obj === "SUMMATIVE" ? "Sommatif" : "Diagnostic"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Type</label>
                                    <select
                                        value={evaluationType}
                                        onChange={(e) => setEvaluationType(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                    >
                                        <option value="QCM">QCM</option>
                                        <option value="TRUE_FALSE">Vrai/Faux</option>
                                        <option value="OPEN_ENDED">Réponse Ouverte</option>
                                        <option value="MIXED">Mixte</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Difficulté</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["EASY", "MEDIUM", "HARD"].map((diff) => (
                                            <button
                                                key={diff}
                                                onClick={() => setDifficultyLevel(diff)}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 text-sm font-bold transition-all",
                                                    difficultyLevel === diff
                                                        ? "border-purple-500 bg-purple-50 text-purple-700"
                                                        : "border-gray-200 hover:border-purple-300"
                                                )}
                                            >
                                                {diff === "EASY" ? "Facile" : diff === "MEDIUM" ? "Moyen" : "Difficile"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={prevStep} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8 rounded-full"
                                >
                                    Suivant <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Anti-Cheat */}
                    {internalStep === 3 && (
                        <motion.div
                            key="step3"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sécurité Anti-Triche</h2>
                                <p className="text-gray-500 dark:text-gray-400">Protégez l'intégrité de votre examen</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <Switch
                                    checked={antiCheatEnabled}
                                    onChange={setAntiCheatEnabled}
                                    label="Mode plein écran requis"
                                    icon={Eye}
                                />
                                <Switch
                                    checked={disableCopyPaste}
                                    onChange={setDisableCopyPaste}
                                    label="Bloquer copier/coller et clic droit"
                                    icon={Lock}
                                />
                                <Switch
                                    checked={trackTabSwitches}
                                    onChange={setTrackTabSwitches}
                                    label="Suivre les changements d'onglet"
                                    icon={Settings}
                                />
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={prevStep} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </Button>
                                <div className="text-green-600 font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Configuration terminée
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
