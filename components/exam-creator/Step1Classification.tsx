import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, Languages, Library, CheckCircle2, Circle, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step1Props {
    data: any
    onUpdate: (data: any) => void
}

export function Step1Classification({ data, onUpdate }: Step1Props) {
    const [subSystems, setSubSystems] = useState<any[]>([])
    const [levels, setLevels] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [units, setUnits] = useState<any[]>([])

    const [selectedSubSystem, setSelectedSubSystem] = useState(data.subSystem || "")
    const [selectedLevels, setSelectedLevels] = useState<string[]>(data.targetLevels || [])
    const [selectedSubject, setSelectedSubject] = useState(data.subject || "")
    const [selectedUnit, setSelectedUnit] = useState(data.learningUnit || "")

    const [internalStep, setInternalStep] = useState(0)
    const [direction, setDirection] = useState(0)

    // Fetch sub-systems on mount
    useEffect(() => {
        setSubSystems([
            { _id: "FRANCOPHONE", name: "Francophone", icon: "🇫🇷", description: "Système éducatif francophone" },
            { _id: "ANGLOPHONE", name: "Anglophone", icon: "🇬🇧", description: "English education system" },
        ])
    }, [])

    // Fetch levels when subsystem changes
    useEffect(() => {
        if (selectedSubSystem) {
            fetch(`/api/education-levels?subSystem=${selectedSubSystem}`)
                .then(res => res.json())
                .then(data => setLevels(data.data || []))
                .catch(err => console.error(err))
        }
    }, [selectedSubSystem])

    // Fetch subjects when levels change
    useEffect(() => {
        if (selectedLevels.length > 0) {
            fetch(`/api/subjects?level=${selectedLevels.join(',')}`)
                .then(res => res.json())
                .then(data => setSubjects(data.data || []))
                .catch(err => console.error(err))
        }
    }, [selectedLevels])

    // Fetch units when subject changes
    useEffect(() => {
        if (selectedSubject) {
            fetch(`/api/learning-units?subject=${selectedSubject}`)
                .then(res => res.json())
                .then(data => setUnits(data.data || []))
                .catch(err => console.error(err))
        }
    }, [selectedSubject])

    // Update parent component
    useEffect(() => {
        onUpdate({
            subSystem: selectedSubSystem,
            targetLevels: selectedLevels,
            subject: selectedSubject,
            learningUnit: selectedUnit,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubSystem, selectedLevels, selectedSubject, selectedUnit])

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
        { title: "Système", icon: Languages },
        { title: "Niveaux", icon: GraduationCap },
        { title: "Matière", icon: BookOpen },
        { title: "Unité", icon: Library },
    ]

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
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quel système éducatif ?</h2>
                                <p className="text-gray-500 dark:text-gray-400">Choisissez le cadre de référence pour cet examen</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {subSystems.map((sys) => (
                                    <button
                                        key={sys._id}
                                        onClick={() => {
                                            setSelectedSubSystem(sys._id)
                                            nextStep()
                                        }}
                                        className={cn(
                                            "group relative p-8 rounded-3xl border-2 text-left transition-all duration-200 hover:shadow-xl",
                                            selectedSubSystem === sys._id
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 bg-white dark:bg-gray-800"
                                        )}
                                    >
                                        <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-200">{sys.icon}</span>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{sys.name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400">{sys.description}</p>
                                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                                            <ArrowRight className="w-6 h-6" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

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
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pour quel(s) niveau(x) ?</h2>
                                <p className="text-gray-500 dark:text-gray-400">Sélectionnez une ou plusieurs classes cibles</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {levels.map((level) => {
                                    const isSelected = selectedLevels.includes(level._id)
                                    return (
                                        <button
                                            key={level._id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedLevels(selectedLevels.filter(id => id !== level._id))
                                                } else {
                                                    setSelectedLevels([...selectedLevels, level._id])
                                                }
                                            }}
                                            className={cn(
                                                "p-6 rounded-2xl border-2 font-bold text-lg transition-all duration-200 hover:scale-105",
                                                isSelected
                                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-green-300"
                                            )}
                                        >
                                            {level.name}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={prevStep} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    disabled={selectedLevels.length === 0}
                                    className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8 rounded-full"
                                >
                                    Suivant <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

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
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quelle matière ?</h2>
                                <p className="text-gray-500 dark:text-gray-400">Choisissez la discipline concernée</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {subjects.map((subject) => (
                                    <button
                                        key={subject._id}
                                        onClick={() => {
                                            setSelectedSubject(subject._id)
                                            nextStep()
                                        }}
                                        className={cn(
                                            "group p-6 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col items-center gap-4 hover:shadow-lg bg-white dark:bg-gray-800",
                                            selectedSubject === subject._id
                                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-transform group-hover:scale-110",
                                            selectedSubject === subject._id ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {subject.name.charAt(0)}
                                        </div>
                                        <span className={cn(
                                            "font-bold text-lg text-center",
                                            selectedSubject === subject._id ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-200"
                                        )}>
                                            {subject.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-start pt-4">
                                <Button variant="ghost" onClick={prevStep} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </Button>
                            </div>
                        </motion.div>
                    )}

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
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Unité d'apprentissage</h2>
                                <p className="text-gray-500 dark:text-gray-400">Optionnel : précisez le chapitre ou l'unité</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {units.map((unit) => (
                                    <button
                                        key={unit._id}
                                        onClick={() => setSelectedUnit(unit._id === selectedUnit ? "" : unit._id)}
                                        className={cn(
                                            "p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 bg-white dark:bg-gray-800",
                                            selectedUnit === unit._id
                                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                                        )}
                                    >
                                        {selectedUnit === unit._id ? (
                                            <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                                        )}
                                        <span className={cn(
                                            "font-medium text-lg",
                                            selectedUnit === unit._id ? "text-orange-700 dark:text-orange-300" : "text-gray-600 dark:text-gray-300"
                                        )}>
                                            {unit.name}
                                        </span>
                                    </button>
                                ))}
                                {units.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Aucune unité disponible pour cette matière.
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={prevStep} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </Button>
                                {/* This is the last internal step, so no "Next" button here, the user proceeds via the main wizard "Next" button which is controlled by the parent page. 
                                    However, visually we might want to show completion. */}
                                <div className="text-green-600 font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Classification terminée
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
