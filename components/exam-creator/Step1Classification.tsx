import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, Languages, Library, CheckCircle2, Circle, ArrowRight, ArrowLeft, Scroll, BookCopy } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step1Props {
    data: any
    onUpdate: (data: any) => void
}

export function Step1Classification({ data, onUpdate }: Step1Props) {
    const [subSystems, setSubSystems] = useState<any[]>([])
    const [levels, setLevels] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [syllabuses, setSyllabuses] = useState<any[]>([])
    const [units, setUnits] = useState<any[]>([])

    // Selection State
    const [selectedSubSystem, setSelectedSubSystem] = useState(data.subSystem || "")
    const [selectedLevels, setSelectedLevels] = useState<string[]>(data.targetLevels || [])
    const [selectedSubject, setSelectedSubject] = useState(data.subject || "")
    const [selectedSyllabus, setSelectedSyllabus] = useState(data.syllabus || "")
    const [selectedContext, setSelectedContext] = useState(data.learningUnit || data.chapterId || "") // Stores either Unit ID or Chapter Title/ID

    const [internalStep, setInternalStep] = useState(0)
    const [direction, setDirection] = useState(0)

    // Derived State
    const currentSyllabus = syllabuses.find(s => s._id === selectedSyllabus)

    // Fetch sub-systems on mount
    useEffect(() => {
        setSubSystems([
            { _id: "FRANCOPHONE", name: "Francophone", icon: "🇫🇷", description: "Système éducatif francophone" },
            { _id: "ANGLOPHONE", name: "Anglophone", icon: "🇬🇧", description: "English education system" },
        ])
    }, [])

    // Fetch levels
    useEffect(() => {
        if (selectedSubSystem) {
            fetch(`/api/education-levels?subSystem=${selectedSubSystem}`)
                .then(res => res.json())
                .then(data => setLevels(data.data || []))
        }
    }, [selectedSubSystem])

    // Fetch subjects
    useEffect(() => {
        if (selectedLevels.length > 0) {
            fetch(`/api/subjects?level=${selectedLevels.join(',')}`)
                .then(res => res.json())
                .then(data => setSubjects(data.data || []))
        }
    }, [selectedLevels])

    // Fetch Syllabuses AND Units when Subject changes
    useEffect(() => {
        if (selectedSubject) {
            // Fetch Syllabuses
            fetch(`/api/syllabus?subject=${selectedSubject}`)
                .then(res => res.json())
                .then(data => setSyllabuses(data.data || []))

            // Fetch Units (Legacy/Fallback)
            fetch(`/api/learning-units?subject=${selectedSubject}`)
                .then(res => res.json())
                .then(data => setUnits(data.data || []))
        }
    }, [selectedSubject])

    // Update parent
    useEffect(() => {
        onUpdate({
            subSystem: selectedSubSystem,
            targetLevels: selectedLevels,
            subject: selectedSubject,
            syllabus: selectedSyllabus,
            learningUnit: !selectedSyllabus ? selectedContext : undefined, // Only set learningUnit if no syllabus (legacy)
            chapterId: selectedSyllabus ? selectedContext : undefined, // Custom field for syllabus chapter
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubSystem, selectedLevels, selectedSubject, selectedSyllabus, selectedContext])

    const nextStep = () => {
        setDirection(1)
        setInternalStep(prev => prev + 1)
    }

    const prevStep = () => {
        setDirection(-1)
        setInternalStep(prev => prev - 1)
    }

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
    }

    const steps = [
        { title: "Système", icon: Languages },
        { title: "Niveaux", icon: GraduationCap },
        { title: "Matière", icon: BookOpen },
        { title: "Programme", icon: Scroll },
        { title: "Chapitre", icon: Library },
    ]

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="relative mb-8">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 -translate-y-1/2 hidden md:block" />
                <div className="flex justify-between items-center px-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = index === internalStep
                        const isCompleted = index < internalStep
                        return (
                            <div key={index} className="flex flex-col items-center gap-2 bg-white dark:bg-gray-900 px-2 relative z-10">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                    isActive ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30" :
                                        isCompleted ? "bg-green-500 border-green-500 text-white" :
                                            "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium transition-colors duration-300",
                                    isActive ? "text-blue-600 dark:text-blue-400" :
                                        isCompleted ? "text-green-500" : "text-gray-400"
                                )}>{step.title}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="min-h-[400px] relative">
                <AnimatePresence initial={false} custom={direction} mode="wait">

                    {/* STEP 1: SYSTEM */}
                    {internalStep === 0 && (
                        <motion.div key="step0" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quel système éducatif ?</h2>
                                <p className="text-gray-500">Choisissez le cadre de référence</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {subSystems.map((sys) => (
                                    <button key={sys._id} onClick={() => { setSelectedSubSystem(sys._id); nextStep() }}
                                        className={cn("group p-8 rounded-3xl border-2 text-left transition-all hover:shadow-xl", selectedSubSystem === sys._id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300")}>
                                        <span className="text-5xl mb-4 block">{sys.icon}</span>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{sys.name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400">{sys.description}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: LEVELS */}
                    {internalStep === 1 && (
                        <motion.div key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pour quel(s) niveau(x) ?</h2>
                                <p className="text-gray-500">Ciblez une ou plusieurs classes</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {levels.map((level) => {
                                    const isSelected = selectedLevels.includes(level._id)
                                    return (
                                        <button key={level._id} onClick={() => isSelected ? setSelectedLevels(selectedLevels.filter(id => id !== level._id)) : setSelectedLevels([...selectedLevels, level._id])}
                                            className={cn("p-6 rounded-2xl border-2 font-bold text-lg transition-all hover:scale-105", isSelected ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800")}>
                                            {level.name}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={prevStep}><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button>
                                <Button onClick={nextStep} disabled={selectedLevels.length === 0} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8">Suivant <ArrowRight className="w-4 h-4 ml-2" /></Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: SUBJECT */}
                    {internalStep === 2 && (
                        <motion.div key="step2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quelle matière ?</h2>
                                <p className="text-gray-500">Choisissez la discipline</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {subjects.map((subject) => (
                                    <button key={subject._id} onClick={() => { setSelectedSubject(subject._id); nextStep() }}
                                        className={cn("p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg bg-white dark:bg-gray-800 flex flex-col items-center gap-4", selectedSubject === subject._id ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-gray-200 dark:border-gray-700")}>
                                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold", selectedSubject === subject._id ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500")}>{subject.name.charAt(0)}</div>
                                        <span className={cn("font-bold text-lg", selectedSubject === subject._id ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-200")}>{subject.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-start pt-4">
                                <Button variant="ghost" onClick={prevStep}><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: SYLLABUS */}
                    {internalStep === 3 && (
                        <motion.div key="step3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Utiliser un programme ?</h2>
                                <p className="text-gray-500">Liez cet examen à un de vos programmes pour un meilleur suivi</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                <button onClick={() => { setSelectedSyllabus(""); setSelectedContext(""); nextStep() }}
                                    className={cn("p-6 rounded-2xl border-2 border-dashed text-left transition-all hover:border-gray-400 flex items-center gap-4", !selectedSyllabus ? "border-gray-800 bg-gray-50 dark:border-gray-200 dark:bg-gray-800" : "border-gray-300")}>
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><Circle className="w-6 h-6 text-gray-400" /></div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Aucun programme</h3>
                                        <p className="text-sm text-gray-500">Utiliser les unités standards</p>
                                    </div>
                                    {!selectedSyllabus && <CheckCircle2 className="ml-auto w-6 h-6 text-gray-900 dark:text-white" />}
                                </button>

                                {syllabuses.map((syllabus) => (
                                    <button key={syllabus._id} onClick={() => { setSelectedSyllabus(syllabus._id); setSelectedContext(""); nextStep() }}
                                        className={cn("p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md flex items-center gap-4 bg-white dark:bg-gray-800", selectedSyllabus === syllabus._id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700")}>
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center"><BookCopy className="w-6 h-6 text-indigo-600" /></div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{syllabus.title}</h3>
                                            <p className="text-sm text-gray-500">{syllabus.structure?.chapters?.length || 0} Chapitres</p>
                                        </div>
                                        {selectedSyllabus === syllabus._id && <CheckCircle2 className="ml-auto w-6 h-6 text-indigo-600" />}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-start pt-4">
                                <Button variant="ghost" onClick={prevStep}><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: CONTEXT (Chapter or Unit) */}
                    {internalStep === 4 && (
                        <motion.div key="step4" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {selectedSyllabus ? "Sélectionner un chapitre" : "Unité d'apprentissage"}
                                </h2>
                                <p className="text-gray-500">Précisez le contexte de l'évaluation</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedSyllabus ? (
                                    // Render Syllabus Chapters
                                    currentSyllabus?.structure?.chapters?.map((chapter: any, index: number) => (
                                        <button key={index} onClick={() => setSelectedContext(selectedContext === chapter.title ? "" : chapter.title)}
                                            className={cn("p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 bg-white dark:bg-gray-800", selectedContext === chapter.title ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300")}>
                                            <span className="font-mono text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">Ch.{index + 1}</span>
                                            <span className={cn("font-medium text-lg flex-1", selectedContext === chapter.title ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300")}>{chapter.title}</span>
                                            {selectedContext === chapter.title ? <CheckCircle2 className="w-6 h-6 text-indigo-500" /> : <Circle className="w-6 h-6 text-gray-300" />}
                                        </button>
                                    ))
                                ) : (
                                    // Render Standard Units
                                    units.map((unit) => (
                                        <button key={unit._id} onClick={() => setSelectedContext(selectedContext === unit._id ? "" : unit._id)}
                                            className={cn("p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 bg-white dark:bg-gray-800", selectedContext === unit._id ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-gray-200 dark:border-gray-700 hover:border-orange-300")}>
                                            <span className={cn("font-medium text-lg flex-1", selectedContext === unit._id ? "text-orange-700 dark:text-orange-300" : "text-gray-600 dark:text-gray-300")}>{unit.name}</span>
                                            {selectedContext === unit._id ? <CheckCircle2 className="w-6 h-6 text-orange-500" /> : <Circle className="w-6 h-6 text-gray-300" />}
                                        </button>
                                    ))
                                )}

                                {((selectedSyllabus && (!currentSyllabus?.structure?.chapters || currentSyllabus.structure.chapters.length === 0)) ||
                                    (!selectedSyllabus && units.length === 0)) && (
                                        <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                            <Library className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>Aucun contenu disponible pour cette sélection.</p>
                                        </div>
                                    )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={prevStep}><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button>
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
