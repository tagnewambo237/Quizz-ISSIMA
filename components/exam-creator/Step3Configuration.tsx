import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Clock, Shield, Award, Calendar, FileText, Lock, Eye, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Step3Props {
    data: any
    onUpdate: (data: any) => void
    onNext: () => void
    onPrev: () => void
}

export function Step3Configuration({ data, onUpdate, onNext, onPrev }: Step3Props) {
    const [title, setTitle] = useState(data.title || "")
    const [description, setDescription] = useState(data.description || "")
    const [duration, setDuration] = useState(data.duration || 60)
    const [startTime, setStartTime] = useState(data.startTime || "")
    const [endTime, setEndTime] = useState(data.endTime || "")
    const [closeMode, setCloseMode] = useState(data.closeMode === "MANUAL" ? "STRICT" : (data.closeMode || "STRICT"))
    const [pedagogicalObjective, setPedagogicalObjective] = useState(data.pedagogicalObjective || "FORMATIVE_EVAL")
    const [evaluationType, setEvaluationType] = useState(data.evaluationType || "QCM")
    const [difficultyLevel, setDifficultyLevel] = useState(data.difficultyLevel || "INTERMEDIATE")
    const [learningMode, setLearningMode] = useState(data.learningMode || "EXAM")

    // Anti-cheat settings
    const [antiCheatEnabled, setAntiCheatEnabled] = useState(data.config?.antiCheat?.fullscreenRequired || false)
    const [disableCopyPaste, setDisableCopyPaste] = useState(data.config?.antiCheat?.disableCopyPaste || false)
    const [trackTabSwitches, setTrackTabSwitches] = useState(data.config?.antiCheat?.trackTabSwitches || false)

    // AI Reformulation (Hugging Face)
    const [aiReformulation, setAiReformulation] = useState(data.config?.antiCheat?.aiReformulation || false)
    const [reformulationIntensity, setReformulationIntensity] = useState<'LIGHT' | 'MODERATE' | 'STRONG'>(
        data.config?.antiCheat?.reformulationIntensity || 'MODERATE'
    )

    // Immediate feedback for formative evaluations
    const [enableImmediateFeedback, setEnableImmediateFeedback] = useState(
        data.config?.enableImmediateFeedback ||
        data.pedagogicalObjective === "FORMATIVE_EVAL" ||
        data.pedagogicalObjective === "SELF_ASSESSMENT" ||
        false
    )

    // Late Exam configuration
    const [lateDuration, setLateDuration] = useState(data.config?.lateDuration || 0)
    const [delayResultsUntilLateEnd, setDelayResultsUntilLateEnd] = useState(
        data.config?.delayResultsUntilLateEnd ?? true
    )

    const [internalStep, setInternalStep] = useState(0)
    const [direction, setDirection] = useState(0)

    // Mutually Exclusive Logic
    const handleImmediateFeedbackChange = (checked: boolean) => {
        setEnableImmediateFeedback(checked)
        if (checked) {
            setDelayResultsUntilLateEnd(false) // Cannot hide results if feedback is immediate
        }
    }

    const handleDelayResultsChange = (checked: boolean) => {
        setDelayResultsUntilLateEnd(checked)
        if (checked) {
            setEnableImmediateFeedback(false) // Cannot have immediate feedback if results are hidden
        }
    }

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
            learningMode,
            config: {
                shuffleQuestions: false,
                shuffleOptions: false,
                showResultsImmediately: !delayResultsUntilLateEnd, // Inverse car on veut retarder si true
                allowReview: true,
                passingScore: 50,
                maxAttempts: 1,
                timeBetweenAttempts: 0,
                enableImmediateFeedback,
                lateDuration: lateDuration > 0 ? lateDuration : undefined,
                delayResultsUntilLateEnd: lateDuration > 0 ? delayResultsUntilLateEnd : false,
                antiCheat: {
                    fullscreenRequired: antiCheatEnabled,
                    disableCopyPaste,
                    trackTabSwitches,
                    blockRightClick: disableCopyPaste,
                    preventScreenshot: false,
                    webcamRequired: false,
                    maxTabSwitches: 3,
                    aiReformulation,
                    reformulationIntensity: aiReformulation ? reformulationIntensity : undefined,
                }
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, description, duration, startTime, endTime, closeMode, pedagogicalObjective, evaluationType, difficultyLevel, learningMode, antiCheatEnabled, disableCopyPaste, trackTabSwitches, enableImmediateFeedback, aiReformulation, reformulationIntensity, lateDuration, delayResultsUntilLateEnd])


    const handleNext = () => {
        if (internalStep < steps.length - 1) {
            setDirection(1)
            setInternalStep(prev => prev + 1)
        } else {
            onNext()
        }
    }

    const handlePrev = () => {
        if (internalStep > 0) {
            setDirection(-1)
            setInternalStep(prev => prev - 1)
        } else {
            onPrev()
        }
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

    const Switch = ({ checked, onChange, label, icon: Icon, disabled }: any) => (
        <motion.div
            className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors",
                checked
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
                disabled && "opacity-50 cursor-not-allowed grayscale"
            )}
            onClick={() => !disabled && onChange(!checked)}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
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

                                {/* Close Mode Selector */}
                                <div className="mt-6">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                        Mode de fermeture
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setCloseMode("STRICT")}
                                            className={cn(
                                                "p-4 rounded-xl border-2 text-left transition-all",
                                                closeMode === "STRICT"
                                                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-red-300"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                                    closeMode === "STRICT" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                                                )}>
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <span className={cn(
                                                    "font-bold",
                                                    closeMode === "STRICT" ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-300"
                                                )}>Strict</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                L'examen ferme automatiquement à l'heure exacte. Aucun accès tardif.
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCloseMode("PERMISSIVE")}
                                            className={cn(
                                                "p-4 rounded-xl border-2 text-left transition-all",
                                                closeMode === "PERMISSIVE"
                                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                                    closeMode === "PERMISSIVE" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                                                )}>
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <span className={cn(
                                                    "font-bold",
                                                    closeMode === "PERMISSIVE" ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"
                                                )}>Permissif (avec code)</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Permet l'accès tardif via un code que vous générerez après création.
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                {/* Late Exam Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-5 h-5 text-amber-500" />
                                        <span className="font-bold text-gray-800 dark:text-white">Retardataires (Late Exam)</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Durée additionnelle (minutes)
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    value={lateDuration}
                                                    onChange={(e) => setLateDuration(Math.max(0, parseInt(e.target.value) || 0))}
                                                    min="0"
                                                    max={duration}
                                                    placeholder="0"
                                                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    min (max: {duration} min)
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Temps supplémentaire après la fin normale pour les retardataires. 0 = pas de période late.
                                            </p>
                                        </div>

                                        {lateDuration > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="space-y-4"
                                            >
                                                <Switch
                                                    checked={delayResultsUntilLateEnd}
                                                    onChange={handleDelayResultsChange}
                                                    label="Cacher les résultats jusqu'à la fin de la période late"
                                                    icon={Eye}
                                                    disabled={enableImmediateFeedback}
                                                />

                                                {delayResultsUntilLateEnd && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl"
                                                    >
                                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                                            <strong>🔒 Anti-triche :</strong> Les résultats ne seront visibles qu'après
                                                            la fin de la période retardataires, empêchant le partage de réponses.
                                                        </p>
                                                    </motion.div>
                                                )}
                                                {enableImmediateFeedback && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl opacity-70"
                                                    >
                                                        <p className="text-xs text-gray-500">
                                                            Option désactivée car le Feedback Immédiat est actif.
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
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
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Objectif Pédagogique</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {[
                                            { value: "FORMATIVE_EVAL", label: "Formatif", desc: "Sans pression, focus sur l'apprentissage", color: "green" },
                                            { value: "SUMMATIVE_EVAL", label: "Sommatif", desc: "Évaluation notée officielle", color: "blue" },
                                            { value: "DIAGNOSTIC_EVAL", label: "Diagnostic", desc: "Identifier les lacunes", color: "purple" },
                                            { value: "SELF_ASSESSMENT", label: "Auto-évaluation", desc: "L'apprenant s'évalue", color: "orange" },
                                            { value: "REMEDIATION", label: "Remédiation", desc: "Combler les lacunes", color: "red" },
                                            { value: "PREP_EXAM", label: "Prépa Examen", desc: "Simulation d'examen", color: "indigo" }
                                        ].map((obj) => (
                                            <button
                                                key={obj.value}
                                                onClick={() => {
                                                    setPedagogicalObjective(obj.value)
                                                    // Auto-enable immediate feedback for formative evaluations
                                                    if (obj.value === "FORMATIVE_EVAL" || obj.value === "SELF_ASSESSMENT" || obj.value === "REMEDIATION") {
                                                        handleImmediateFeedbackChange(true)
                                                    }
                                                }}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 text-left transition-all",
                                                    pedagogicalObjective === obj.value
                                                        ? `border-${obj.color}-500 bg-${obj.color}-50 dark:bg-${obj.color}-900/20`
                                                        : "border-gray-200 hover:border-purple-300"
                                                )}
                                            >
                                                <span className={cn(
                                                    "block text-sm font-bold",
                                                    pedagogicalObjective === obj.value ? `text-${obj.color}-700 dark:text-${obj.color}-300` : "text-gray-700 dark:text-gray-300"
                                                )}>{obj.label}</span>
                                                <span className="block text-xs text-gray-500 mt-0.5">{obj.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Type de Questions</label>
                                    <select
                                        value={evaluationType}
                                        onChange={(e) => setEvaluationType(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                    >
                                        <option value="QCM">QCM (Choix Multiples)</option>
                                        <option value="TRUE_FALSE">Vrai/Faux</option>
                                        <option value="OPEN_QUESTION">Réponse Ouverte</option>
                                        <option value="MIXED">Mixte</option>
                                        <option value="ADAPTIVE">Adaptatif</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Difficulté</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { value: "BEGINNER", label: "Débutant", emoji: "🌱" },
                                            { value: "INTERMEDIATE", label: "Intermédiaire", emoji: "🌿" },
                                            { value: "ADVANCED", label: "Avancé", emoji: "🌳" },
                                            { value: "EXPERT", label: "Expert", emoji: "🏆" }
                                        ].map((diff) => (
                                            <button
                                                key={diff.value}
                                                onClick={() => setDifficultyLevel(diff.value)}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 text-center transition-all",
                                                    difficultyLevel === diff.value
                                                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                                        : "border-gray-200 hover:border-purple-300 text-gray-700 dark:text-gray-300"
                                                )}
                                            >
                                                <span className="block text-xl mb-1">{diff.emoji}</span>
                                                <span className="block text-xs font-bold">{diff.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Immediate Feedback Toggle */}
                                <div className={cn(
                                    "mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-2xl border border-green-100 dark:border-green-800",
                                    delayResultsUntilLateEnd && "opacity-70"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                enableImmediateFeedback ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                                            )}>
                                                <Award className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white">Feedback Immédiat</p>
                                                <p className="text-xs text-gray-500">Les apprenants voient la correction après chaque réponse</p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => !delayResultsUntilLateEnd && handleImmediateFeedbackChange(!enableImmediateFeedback)}
                                            className={cn(
                                                "w-12 h-6 rounded-full p-1 transition-colors relative",
                                                enableImmediateFeedback ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600",
                                                delayResultsUntilLateEnd ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                            )}
                                        >
                                            <motion.div
                                                className="w-4 h-4 rounded-full bg-white shadow-sm"
                                                animate={{ x: enableImmediateFeedback ? 24 : 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </div>
                                    </div>
                                    {enableImmediateFeedback && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-3 text-sm text-green-700 dark:text-green-300 bg-green-100/50 dark:bg-green-900/30 p-3 rounded-lg"
                                        >
                                            ✨ Idéal pour les évaluations formatives ! Les étudiants apprennent de leurs erreurs en temps réel.
                                        </motion.p>
                                    )}
                                    {delayResultsUntilLateEnd && (
                                        <p className="mt-2 text-xs text-amber-600">
                                            Désactivé car les résultats sont masqués jusqu'à la fin de la période late.
                                        </p>
                                    )}
                                </div>
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

                                {/* AI Reformulation Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-purple-500" />
                                        <span className="font-bold text-gray-800 dark:text-white">Reformulation IA</span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Hugging Face</span>
                                    </div>

                                    <Switch
                                        checked={aiReformulation}
                                        onChange={setAiReformulation}
                                        label="Reformuler les questions avec l'IA"
                                        icon={Wand2}
                                    />

                                    {aiReformulation && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 space-y-3"
                                        >
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                L'IA reformule chaque question différemment pour chaque étudiant,
                                                empêchant la recherche de réponses identiques en ligne.
                                            </p>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Intensité de la reformulation
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {([
                                                        { value: 'LIGHT', label: 'Légère', desc: 'Structure modifiée' },
                                                        { value: 'MODERATE', label: 'Modérée', desc: 'Synonymes utilisés' },
                                                        { value: 'STRONG', label: 'Forte', desc: 'Réécriture complète' }
                                                    ] as const).map((option) => (
                                                        <motion.button
                                                            key={option.value}
                                                            type="button"
                                                            className={cn(
                                                                "p-3 rounded-xl border-2 text-left transition-all",
                                                                reformulationIntensity === option.value
                                                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                                                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                                                            )}
                                                            onClick={() => setReformulationIntensity(option.value)}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <div className={cn(
                                                                "font-medium text-sm",
                                                                reformulationIntensity === option.value
                                                                    ? "text-purple-700 dark:text-purple-300"
                                                                    : "text-gray-700 dark:text-gray-300"
                                                            )}>
                                                                {option.label}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {option.desc}
                                                            </div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* AI Warning Indicator */}
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-600 rounded-xl"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                                                        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                                            ⚠️ Contenu généré par IA
                                                        </h4>
                                                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                            Les reformulations sont générées automatiquement par intelligence artificielle.
                                                            <strong> Vérifiez que les questions reformulées gardent leur sens original</strong> avant
                                                            de publier l'examen.
                                                        </p>
                                                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-800/50 rounded-full">
                                                                <Wand2 className="w-3 h-3" />
                                                                Intensité : {reformulationIntensity === 'LIGHT' ? 'Légère' : reformulationIntensity === 'MODERATE' ? 'Modérée' : 'Forte'}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-800/50 rounded-full">
                                                                🔍 Contrôle requis
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Unified Navigation Bar for Step 3 */}
            <div className="flex justify-between pt-8 border-t border-gray-100 dark:border-gray-800 mt-8">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    // disabled={internalStep === 0} // Always allow back to previous global step
                    className="px-6 py-5 text-base font-semibold border-2"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                </Button>

                <Button
                    onClick={handleNext}
                    disabled={internalStep === 0 && !title}
                    className="bg-[#3a4794] hover:bg-[#2a3575] text-white px-8 py-5 rounded-lg font-bold shadow-lg flex items-center gap-2"
                >
                    {internalStep === steps.length - 1 ? "Continuer" : "Suivant"} <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}
