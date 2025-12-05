import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Target, Check, Briefcase, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Step2Props {
    data: any
    onUpdate: (data: any) => void
}

export function Step2TargetAudience({ data, onUpdate }: Step2Props) {
    const [fields, setFields] = useState<any[]>([])
    const [competencies, setCompetencies] = useState<any[]>([])

    const [selectedFields, setSelectedFields] = useState<string[]>(data.targetFields || [])
    const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>(data.targetedCompetencies || [])

    const [internalStep, setInternalStep] = useState(0)
    const [direction, setDirection] = useState(0)

    // Fetch fields based on selected levels
    useEffect(() => {
        if (data.targetLevels && data.targetLevels.length > 0) {
            const levelsParam = data.targetLevels.join(',')
            fetch(`/api/fields?level=${levelsParam}`)
                .then(res => res.json())
                .then(data => setFields(data.data || []))
                .catch(err => console.error(err))
        }
    }, [data.targetLevels])

    // Fetch competencies based on selected subject
    useEffect(() => {
        if (data.subject) {
            fetch(`/api/competencies?subject=${data.subject}`)
                .then(res => res.json())
                .then(data => setCompetencies(data.data || []))
                .catch(err => console.error(err))
        }
    }, [data.subject])

    // Update parent
    useEffect(() => {
        onUpdate({
            targetFields: selectedFields,
            targetedCompetencies: selectedCompetencies,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFields, selectedCompetencies])

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
        { title: "Filières", icon: Briefcase },
        { title: "Compétences", icon: Target },
    ]

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="flex justify-center items-center gap-12 px-4 mb-8">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = index === internalStep
                    const isCompleted = index < internalStep
                    return (
                        <div key={index} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                isActive ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg" :
                                    isCompleted ? "bg-green-500 border-green-500 text-white" :
                                        "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                            )}>
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                            </div>
                            <span className={cn(
                                "text-sm font-bold transition-colors duration-300",
                                isActive ? "text-indigo-600 dark:text-indigo-400" :
                                    isCompleted ? "text-green-500" :
                                        "text-gray-400"
                            )}>{step.title}</span>
                        </div>
                    )
                })}
            </div>

            <div className="min-h-[400px] relative">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    {/* Step 0: Fields */}
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
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Filières / Séries</h2>
                                <p className="text-gray-500 dark:text-gray-400">Optionnel : Ciblez des filières spécifiques</p>
                            </div>

                            {fields.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {fields.map((field) => {
                                        const isSelected = selectedFields.includes(field._id)
                                        return (
                                            <button
                                                key={field._id}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedFields(selectedFields.filter(id => id !== field._id))
                                                    } else {
                                                        setSelectedFields([...selectedFields, field._id])
                                                    }
                                                }}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group hover:shadow-md",
                                                    isSelected
                                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                                                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                )}
                                            >
                                                <span className={cn(
                                                    "font-medium",
                                                    isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200"
                                                )}>
                                                    {field.name}
                                                </span>
                                                {isSelected ? (
                                                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-indigo-300" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Aucune filière spécifique disponible pour ce niveau.</p>
                                    <p className="text-gray-400 text-sm mt-2">Vous pouvez passer à l'étape suivante.</p>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={nextStep}
                                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-full"
                                >
                                    Suivant <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Competencies */}
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
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Compétences Ciblées</h2>
                                <p className="text-gray-500 dark:text-gray-400">Optionnel : Sélectionnez les compétences évaluées</p>
                            </div>

                            {competencies.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {competencies.map((comp) => {
                                        const isSelected = selectedCompetencies.includes(comp._id)
                                        return (
                                            <button
                                                key={comp._id}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedCompetencies(selectedCompetencies.filter(id => id !== comp._id))
                                                    } else {
                                                        setSelectedCompetencies([...selectedCompetencies, comp._id])
                                                    }
                                                }}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-4 hover:shadow-md bg-white dark:bg-gray-800",
                                                    isSelected
                                                        ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                                                        : "border-gray-200 dark:border-gray-700 hover:border-rose-300"
                                                )}
                                            >
                                                <div className={cn(
                                                    "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                                    isSelected ? "bg-rose-500 border-rose-500" : "border-gray-300 bg-white"
                                                )}>
                                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                                <div>
                                                    <p className={cn(
                                                        "font-bold text-lg",
                                                        isSelected ? "text-rose-700 dark:text-rose-300" : "text-gray-700 dark:text-gray-200"
                                                    )}>
                                                        {comp.name}
                                                    </p>
                                                    {comp.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {comp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Aucune compétence spécifique disponible pour cette matière.</p>
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={prevStep} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </Button>
                                <div className="text-green-600 font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Public défini
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
