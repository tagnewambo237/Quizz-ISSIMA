import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, Languages, Library, CheckCircle2, Circle, ArrowRight, ArrowLeft, Scroll, BookCopy, Target, Layers, Lightbulb, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { QuickSyllabusCreator } from "./QuickSyllabusCreator"

interface Step1Props {
    data: any
    onUpdate: (data: any) => void
    onNext: () => void
    onPrev: () => void
}

// Evaluation Mode Types
type EvaluationMode = 'SESSION' | 'CONCEPT'

const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn("animate-pulse bg-gray-200 dark:bg-gray-700", className)} />
)

export function Step1Classification({ data, onUpdate, onNext, onPrev }: Step1Props) {
    const [subSystems, setSubSystems] = useState<any[]>([])
    const [levels, setLevels] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [syllabuses, setSyllabuses] = useState<any[]>([])
    const [units, setUnits] = useState<any[]>([])
    const [concepts, setConcepts] = useState<any[]>([])

    // Loading States
    const [loadingLevels, setLoadingLevels] = useState(false)
    const [loadingSubjects, setLoadingSubjects] = useState(false)
    const [loadingSyllabuses, setLoadingSyllabuses] = useState(false)
    const [loadingConcepts, setLoadingConcepts] = useState(false)

    // Selection State
    const [selectedSubSystem, setSelectedSubSystem] = useState(data.subSystem || "")
    const [selectedLevels, setSelectedLevels] = useState<string[]>(data.targetLevels || [])
    const [selectedSubject, setSelectedSubject] = useState(data.subject || "")
    const [selectedSyllabus, setSelectedSyllabus] = useState(data.syllabus || "")
    const [selectedContext, setSelectedContext] = useState(data.learningUnit || data.chapterId || "")

    // NEW: Evaluation Mode & Concepts
    const [evaluationMode, setEvaluationMode] = useState<EvaluationMode>(
        data.linkedConcepts?.length > 0 ? 'CONCEPT' : 'SESSION'
    )
    const [selectedConcepts, setSelectedConcepts] = useState<string[]>(data.linkedConcepts || [])

    const [internalStep, setInternalStep] = useState(0)
    const [direction, setDirection] = useState(0)
    const [showSyllabusCreator, setShowSyllabusCreator] = useState(false)

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
            setLoadingLevels(true)
            fetch(`/api/education-levels?subSystem=${selectedSubSystem}`)
                .then(res => res.json())
                .then(data => setLevels(data.data || []))
                .catch(err => console.error("Error fetching levels:", err))
                .finally(() => setLoadingLevels(false))
        }
    }, [selectedSubSystem])

    // Fetch subjects
    useEffect(() => {
        if (selectedLevels.length > 0) {
            setLoadingSubjects(true)
            fetch(`/api/subjects?level=${selectedLevels.join(',')}`)
                .then(res => res.json())
                .then(data => setSubjects(data.data || []))
                .catch(err => console.error("Error fetching subjects:", err))
                .finally(() => setLoadingSubjects(false))
        }
    }, [selectedLevels])

    // Fetch Syllabuses AND Units when Subject changes
    useEffect(() => {
        if (selectedSubject) {
            setLoadingSyllabuses(true)
            Promise.all([
                fetch(`/api/syllabus?subject=${selectedSubject}`).then(res => res.json()),
                fetch(`/api/learning-units?subject=${selectedSubject}`).then(res => res.json())
            ])
                .then(([syllabusesData, unitsData]) => {
                    setSyllabuses(syllabusesData.data || [])
                    setUnits(unitsData.data || [])
                })
                .catch(err => console.error("Error fetching syllabus/units:", err))
                .finally(() => setLoadingSyllabuses(false))
        }
    }, [selectedSubject])

    // Fetch Concepts when Syllabus changes
    useEffect(() => {
        if (selectedSyllabus) {
            setLoadingConcepts(true)
            fetch(`/api/concepts?syllabusId=${selectedSyllabus}`)
                .then(res => res.json())
                .then(data => setConcepts(data.data || []))
                .catch(err => console.error("Error fetching concepts:", err))
                .finally(() => setLoadingConcepts(false))
        } else {
            setConcepts([])
        }
    }, [selectedSyllabus])

    // Update parent
    useEffect(() => {
        onUpdate({
            subSystem: selectedSubSystem,
            targetLevels: selectedLevels,
            subject: selectedSubject,
            syllabus: selectedSyllabus,
            learningUnit: !selectedSyllabus ? selectedContext : undefined,
            chapterId: selectedSyllabus ? selectedContext : undefined,
            evaluationMode,
            linkedConcepts: evaluationMode === 'CONCEPT' ? selectedConcepts : [],
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubSystem, selectedLevels, selectedSubject, selectedSyllabus, selectedContext, evaluationMode, selectedConcepts])

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
        { title: "Mode", icon: Target },
        { title: "Contexte", icon: Library },
    ]

    // Toggle concept selection
    const toggleConcept = (conceptId: string) => {
        setSelectedConcepts(prev =>
            prev.includes(conceptId)
                ? prev.filter(id => id !== conceptId)
                : [...prev, conceptId]
        )
    }

    // Handle syllabus creation
    const handleSyllabusCreated = (syllabusId: string) => {
        // Add the new syllabus to the list
        fetch(`/api/syllabus?subject=${selectedSubject}`)
            .then(res => res.json())
            .then(data => {
                setSyllabuses(data.data || [])
                // Select the new syllabus
                setSelectedSyllabus(syllabusId)
                setSelectedContext("")
                setSelectedConcepts([])
                // Move to next step
                handleNext()
            })
            .catch(err => console.error("Error refreshing syllabuses:", err))
    }

    // Navigation Handlers
    const handleNext = () => {
        if (internalStep < steps.length - 1) {
            setDirection(1)
            setInternalStep(prev => prev + 1)
        } else {
            onNext() // Go to Step 2 of parent
        }
    }

    const handlePrev = () => {
        if (internalStep > 0) {
            setDirection(-1)
            setInternalStep(prev => prev - 1)
        } else {
            onPrev() // Go to previous parent step
        }
    }

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
                                    <button key={sys._id} onClick={() => { setSelectedSubSystem(sys._id); handleNext() }}
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
                                {loadingLevels ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <Skeleton key={i} className="h-20 rounded-2xl" />
                                    ))
                                ) : (
                                    levels.map((level) => {
                                        const isSelected = selectedLevels.includes(level._id)
                                        return (
                                            <button key={level._id} onClick={() => isSelected ? setSelectedLevels(selectedLevels.filter(id => id !== level._id)) : setSelectedLevels([...selectedLevels, level._id])}
                                                className={cn("p-6 rounded-2xl border-2 font-bold text-lg transition-all hover:scale-105", isSelected ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800")}>
                                                {level.name}
                                            </button>
                                        )
                                    })
                                )}
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
                                {loadingSubjects ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <Skeleton key={i} className="h-32 rounded-2xl" />
                                    ))
                                ) : (
                                    subjects.map((subject) => (
                                        <button key={subject._id} onClick={() => { setSelectedSubject(subject._id); handleNext() }}
                                            className={cn("p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg bg-white dark:bg-gray-800 flex flex-col items-center gap-4", selectedSubject === subject._id ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-gray-200 dark:border-gray-700")}>
                                            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold", selectedSubject === subject._id ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500")}>{subject.name.charAt(0)}</div>
                                            <span className={cn("font-bold text-lg", selectedSubject === subject._id ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-200")}>{subject.name}</span>
                                        </button>
                                    ))
                                )}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {loadingSyllabuses ? (
                                    Array(4).fill(0).map((_, i) => (
                                        <Skeleton key={i} className="h-24 rounded-2xl" />
                                    ))
                                ) : (
                                    <>
                                        <button onClick={() => {
                                            setSelectedSyllabus("");
                                            setSelectedContext("");
                                            setSelectedConcepts([]);
                                            setEvaluationMode('SESSION');
                                            // Skip Mode and Context steps - go directly to next parent step
                                            onNext();
                                        }}
                                            className={cn("p-6 rounded-2xl border-2 border-dashed text-left transition-all hover:border-gray-400 flex items-center gap-4", !selectedSyllabus ? "border-gray-800 bg-gray-50 dark:border-gray-200 dark:bg-gray-800" : "border-gray-300")}>
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><Circle className="w-6 h-6 text-gray-400" /></div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">Aucun programme</h3>
                                                <p className="text-sm text-gray-500">Passer directement à la configuration</p>
                                            </div>
                                            {!selectedSyllabus && <CheckCircle2 className="ml-auto w-6 h-6 text-gray-900 dark:text-white" />}
                                        </button>

                                        <button
                                            onClick={() => setShowSyllabusCreator(true)}
                                            className="p-6 rounded-2xl border-2 border-dashed border-green-300 dark:border-green-700 text-left transition-all hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-4 bg-white dark:bg-gray-800"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-green-700 dark:text-green-300">Créer un nouveau programme</h3>
                                                <p className="text-sm text-green-600 dark:text-green-400">Créer et lier un programme à cet examen</p>
                                            </div>
                                        </button>

                                        {syllabuses.map((syllabus) => (
                                            <button key={syllabus._id} onClick={() => { setSelectedSyllabus(syllabus._id); setSelectedContext(""); setSelectedConcepts([]); handleNext() }}
                                                className={cn("p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md flex items-center gap-4 bg-white dark:bg-gray-800", selectedSyllabus === syllabus._id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700")}>
                                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center"><BookCopy className="w-6 h-6 text-indigo-600" /></div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{syllabus.title}</h3>
                                                    <p className="text-sm text-gray-500">{syllabus.structure?.chapters?.length || 0} Chapitres</p>
                                                </div>
                                                {selectedSyllabus === syllabus._id && <CheckCircle2 className="ml-auto w-6 h-6 text-indigo-600" />}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: EVALUATION MODE */}
                    {internalStep === 4 && (
                        <motion.div key="step4" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mode d'évaluation</h2>
                                <p className="text-gray-500">Comment souhaitez-vous structurer cette évaluation ?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Session Complete Mode */}
                                <button
                                    onClick={() => { setEvaluationMode('SESSION'); setSelectedConcepts([]); handleNext() }}
                                    className={cn(
                                        "p-8 rounded-3xl border-2 text-left transition-all hover:shadow-xl group",
                                        evaluationMode === 'SESSION'
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                        evaluationMode === 'SESSION'
                                            ? "bg-blue-100 dark:bg-blue-800"
                                            : "bg-gray-100 dark:bg-gray-700"
                                    )}>
                                        <Layers className={cn(
                                            "w-8 h-8 transition-colors",
                                            evaluationMode === 'SESSION' ? "text-blue-600" : "text-gray-500"
                                        )} />
                                    </div>
                                    <h3 className={cn(
                                        "text-xl font-bold mb-2",
                                        evaluationMode === 'SESSION' ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"
                                    )}>
                                        Session Complète
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Évaluation d'un chapitre ou d'une unité entière.
                                    </p>
                                </button>

                                {/* Concept-Based Mode */}
                                <button
                                    onClick={() => { setEvaluationMode('CONCEPT'); handleNext() }}
                                    disabled={!selectedSyllabus || concepts.length === 0}
                                    className={cn(
                                        "p-8 rounded-3xl border-2 text-left transition-all hover:shadow-xl group relative",
                                        evaluationMode === 'CONCEPT'
                                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300",
                                        (!selectedSyllabus || concepts.length === 0) && "opacity-50 cursor-not-allowed hover:shadow-none"
                                    )}
                                >
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                        evaluationMode === 'CONCEPT'
                                            ? "bg-purple-100 dark:bg-purple-800"
                                            : "bg-gray-100 dark:bg-gray-700"
                                    )}>
                                        <Lightbulb className={cn(
                                            "w-8 h-8 transition-colors",
                                            evaluationMode === 'CONCEPT' ? "text-purple-600" : "text-gray-500"
                                        )} />
                                    </div>
                                    <h3 className={cn(
                                        "text-xl font-bold mb-2",
                                        evaluationMode === 'CONCEPT' ? "text-purple-700 dark:text-purple-300" : "text-gray-900 dark:text-white"
                                    )}>
                                        Par Concept(s)
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Évaluation ciblée sur des concepts spécifiques.
                                    </p>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 6: CONTEXT */}
                    {internalStep === 5 && (
                        <motion.div key="step5" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {evaluationMode === 'CONCEPT'
                                        ? "Sélectionner les concepts"
                                        : "Sélectionner un chapitre"
                                    }
                                </h2>
                                <p className="text-gray-500">
                                    {evaluationMode === 'CONCEPT'
                                        ? "Choisissez un ou plusieurs concepts"
                                        : "Précisez le contexte de l'évaluation"
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {evaluationMode === 'CONCEPT' ? (
                                    loadingConcepts ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <Skeleton key={i} className="h-16 rounded-xl" />
                                        ))
                                    ) : (
                                        <>
                                            {concepts.map((concept: any) => {
                                                const isSelected = selectedConcepts.includes(concept._id)
                                                return (
                                                    <button
                                                        key={concept._id}
                                                        onClick={() => toggleConcept(concept._id)}
                                                        className={cn(
                                                            "p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 bg-white dark:bg-gray-800",
                                                            isSelected
                                                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                                                : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center",
                                                            isSelected ? "bg-purple-100 dark:bg-purple-800" : "bg-gray-100 dark:bg-gray-700"
                                                        )}>
                                                            <Lightbulb className={cn(
                                                                "w-5 h-5",
                                                                isSelected ? "text-purple-600" : "text-gray-400"
                                                            )} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className={cn(
                                                                "font-medium text-lg block",
                                                                isSelected ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"
                                                            )}>
                                                                {concept.title}
                                                            </span>
                                                        </div>
                                                        {isSelected && <CheckCircle2 className="w-6 h-6 text-purple-500" />}
                                                    </button>
                                                )
                                            })}
                                        </>
                                    )
                                ) : selectedSyllabus ? (
                                    // Chapters
                                    currentSyllabus?.structure?.chapters?.map((chapter: any, index: number) => (
                                        <button key={index} onClick={() => setSelectedContext(selectedContext === chapter.title ? "" : chapter.title)}
                                            className={cn("p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 bg-white dark:bg-gray-800", selectedContext === chapter.title ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300")}>
                                            <span className="font-mono text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">Ch.{index + 1}</span>
                                            <span className={cn("font-medium text-lg flex-1", selectedContext === chapter.title ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300")}>{chapter.title}</span>
                                            {selectedContext === chapter.title ? <CheckCircle2 className="w-6 h-6 text-indigo-500" /> : <Circle className="w-6 h-6 text-gray-300" />}
                                        </button>
                                    ))
                                ) : (
                                    // Units
                                    units.map((unit) => (
                                        <button key={unit._id} onClick={() => setSelectedContext(selectedContext === unit._id ? "" : unit._id)}
                                            className={cn("p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 bg-white dark:bg-gray-800", selectedContext === unit._id ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-gray-200 dark:border-gray-700 hover:border-orange-300")}>
                                            <span className={cn("font-medium text-lg flex-1", selectedContext === unit._id ? "text-orange-700 dark:text-orange-300" : "text-gray-600 dark:text-gray-300")}>{unit.name}</span>
                                            {selectedContext === unit._id ? <CheckCircle2 className="w-6 h-6 text-orange-500" /> : <Circle className="w-6 h-6 text-gray-300" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Unified Navigation Bar for Step 1 */}
            <div className="flex justify-between pt-8 border-t border-gray-100 dark:border-gray-800 mt-8">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={internalStep === 0 && !onPrev} // Disable if no onPrev prop and at start
                    className="px-6 py-5 text-base font-semibold border-2"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                </Button>

                <Button
                    onClick={handleNext}
                    disabled={
                        (internalStep === 1 && selectedLevels.length === 0) || // Level required
                        (internalStep === 5 && evaluationMode === 'SESSION' && !selectedContext) || // Context required for Session
                        (internalStep === 5 && evaluationMode === 'CONCEPT' && selectedConcepts.length === 0) // Concepts required
                    }
                    className="bg-[#3a4794] hover:bg-[#2a3575] text-white px-8 py-5 rounded-lg font-bold shadow-lg flex items-center gap-2"
                >
                    {internalStep === steps.length - 1 ? "Continuer" : "Suivant"} <ArrowRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Quick Syllabus Creator Modal */}
            <QuickSyllabusCreator
                open={showSyllabusCreator}
                onOpenChange={setShowSyllabusCreator}
                subjectId={selectedSubject}
                onSyllabusCreated={handleSyllabusCreated}
            />
        </div>
    )
}
