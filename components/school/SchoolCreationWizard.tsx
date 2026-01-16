"use client"

import { useMemo, useState } from "react"
import { 
    CheckCircle2, ChevronLeft, ChevronRight, FileText, Plus, Trash2, Upload, Link as LinkIcon,
    Building2, MapPin, Globe, Phone, Mail, Hash, GraduationCap, BookOpen, Languages, Calendar,
    Scale, ShieldCheck, Award, TrendingUp, Users, Network, Briefcase, Building,
    Wifi, Library, FlaskConical, Monitor, Accessibility, DollarSign, CreditCard,
    Heart, Smile, UsersRound, Star, School, Link as LinkIcon2,
    FileCheck, Trophy, BriefcaseBusiness, Landmark, Home, Award as AwardIcon,
    CheckCircle, AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type Partner = {
    name: string
    sector: string
    type: string
    proof: string
    country?: string
}

type SchoolCreationForm = {
    identity: {
        name: string
        acronym: string
        type: string
        city: string
        department: string
        region: string
        country: string
        address: string
        website: string
        contactEmail: string
        contactPhone: string
    }
    training: {
        dominantFields: string[]
        dominantSpecialties: string[]
        specialtiesOffered: string[]
        diplomas: string[]
        teachingLanguages: string[]
        modalities: string
    }
    legal: {
        accreditationNumber: string
        openingAuthorization: string
        authorizationDate: string
        mainSupervision: string
        secondarySupervisions: string[]
        verificationDocs: string[]
        foreignDiplomasNoAccreditation: string
        foreignDiplomasWithAccreditation: string
        status: string
    }
    performance: {
        foundedYear: string
        yearsOfExistence: string
        successRates: string
        officialRanking: string
        accreditations: string
    }
    insertion: {
        localPartners: Partner[]
        internationalPartners: Partner[]
        internshipAgreements: string
        internshipAgreementCount: string
        alumniTracking: string
        alumniExamples: string
        topRecruiters: string[]
        insertionRate6: string
        insertionRate12: string
    }
    infrastructure: {
        campusCompliant: string
        libraryResources: string
        libraryQuality: string
        labs: string
        labEquipment: string
        itPark: string
        itParkVolume: string
        internetQuality: string
        accessibility: string
        safetyNotes: string
    }
    financial: {
        annualCost: string
        feeRegistration: string
        feeTuition: string
        feeExams: string
        feeMaterials: string
        otherFees: string
        scholarships: string
        cityCostOfLiving: string
    }
    studentExperience: {
        clubs: string
        mentoring: string
        satisfactionRate: string
        mobility: string
        discipline: string
    }
    score: {
        legality: string
        performance: string
        insertion: string
        infrastructures: string
        affordability: string
        global: string
    }
}

const emptyForm: SchoolCreationForm = {
    identity: {
        name: "",
        acronym: "",
        type: "",
        city: "",
        department: "",
        region: "",
        country: "",
        address: "",
        website: "",
        contactEmail: "",
        contactPhone: "",
    },
    training: {
        dominantFields: [""],
        dominantSpecialties: [""],
        specialtiesOffered: [""],
        diplomas: [""],
        teachingLanguages: [""],
        modalities: "",
    },
    legal: {
        accreditationNumber: "",
        openingAuthorization: "",
        authorizationDate: "",
        mainSupervision: "",
        secondarySupervisions: [""],
        verificationDocs: [""],
        foreignDiplomasNoAccreditation: "",
        foreignDiplomasWithAccreditation: "",
        status: "A_VERIFIER",
    },
    performance: {
        foundedYear: "",
        yearsOfExistence: "",
        successRates: "",
        officialRanking: "",
        accreditations: "",
    },
    insertion: {
        localPartners: [{ name: "", sector: "", type: "", proof: "" }],
        internationalPartners: [{ name: "", sector: "", type: "", proof: "", country: "" }],
        internshipAgreements: "",
        internshipAgreementCount: "",
        alumniTracking: "",
        alumniExamples: "",
        topRecruiters: [""],
        insertionRate6: "",
        insertionRate12: "",
    },
    infrastructure: {
        campusCompliant: "",
        libraryResources: "",
        libraryQuality: "",
        labs: "",
        labEquipment: "",
        itPark: "",
        itParkVolume: "",
        internetQuality: "",
        accessibility: "",
        safetyNotes: "",
    },
    financial: {
        annualCost: "",
        feeRegistration: "",
        feeTuition: "",
        feeExams: "",
        feeMaterials: "",
        otherFees: "",
        scholarships: "",
        cityCostOfLiving: "",
    },
    studentExperience: {
        clubs: "",
        mentoring: "",
        satisfactionRate: "",
        mobility: "",
        discipline: "",
    },
    score: {
        legality: "",
        performance: "",
        insertion: "",
        infrastructures: "",
        affordability: "",
        global: "",
    },
}

const mockForm: SchoolCreationForm = {
    identity: {
        name: "Institut Polytechnique Saint-Marc",
        acronym: "IPESM",
        type: "Institut",
        city: "Yaoundé",
        department: "Mfoundi",
        region: "Centre",
        country: "Cameroun",
        address: "Rue du Lac, BP 1234",
        website: "https://ipesm.edu.cm",
        contactEmail: "contact@ipesm.edu.cm",
        contactPhone: "+237 6 99 00 00 00",
    },
    training: {
        dominantFields: ["Informatique", "Génie industriel"],
        dominantSpecialties: ["Data & IA", "Cybersécurité"],
        specialtiesOffered: ["Développement web", "Systèmes embarqués", "Management SI"],
        diplomas: ["BTS", "Licence Pro", "Master"],
        teachingLanguages: ["Français", "Anglais"],
        modalities: "Hybride",
    },
    legal: {
        accreditationNumber: "MINESUP-AGR-2023-1457",
        openingAuthorization: "Délivrée",
        authorizationDate: "2023-09-12",
        mainSupervision: "MINESUP",
        secondarySupervisions: ["MINEFOP", "MINPOSTEL"],
        verificationDocs: ["scan_arrete_ouverture.pdf", "lien_drive_documents"],
        foreignDiplomasNoAccreditation: "Non",
        foreignDiplomasWithAccreditation: "Oui",
        status: "CONFORME",
    },
    performance: {
        foundedYear: "2008",
        yearsOfExistence: "17",
        successRates: "88% / 91% / 90%",
        officialRanking: "Top 10 MINESUP 2024",
        accreditations: "ISO 21001, CISCO Academy",
    },
    insertion: {
        localPartners: [
            { name: "Camtel", sector: "Télécoms", type: "Stage", proof: "convention_camtel.pdf" },
            { name: "MTN Cameroon", sector: "Télécoms", type: "Emploi", proof: "mou_mtn.pdf" },
        ],
        internationalPartners: [
            { name: "ESIGELEC", sector: "Éducation", type: "Double diplôme", proof: "accord_esigelec.pdf", country: "France" },
        ],
        internshipAgreements: "Oui",
        internshipAgreementCount: "42",
        alumniTracking: "Oui",
        alumniExamples: "Promotion 2018: suivi semestriel via LinkedIn",
        topRecruiters: ["Orange", "Camtel", "GIZ", "MTN", "KPMG"],
        insertionRate6: "72%",
        insertionRate12: "84%",
    },
    infrastructure: {
        campusCompliant: "Oui",
        libraryResources: "Oui",
        libraryQuality: "Élevée",
        labs: "Oui",
        labEquipment: "IA, réseaux, électronique",
        itPark: "Oui",
        itParkVolume: "240 postes",
        internetQuality: "Forte",
        accessibility: "Oui",
        safetyNotes: "Sécurité 24/7, navettes partenaires",
    },
    financial: {
        annualCost: "850000",
        feeRegistration: "50000",
        feeTuition: "700000",
        feeExams: "50000",
        feeMaterials: "50000",
        otherFees: "Assurance 15000",
        scholarships: "Oui",
        cityCostOfLiving: "Moyen",
    },
    studentExperience: {
        clubs: "Robotique, Débat, ESG",
        mentoring: "Coaching académique trimestriel",
        satisfactionRate: "4.3/5",
        mobility: "Partenariats Afrique/Europe",
        discipline: "Règlement intérieur strict",
    },
    score: {
        legality: "92",
        performance: "86",
        insertion: "81",
        infrastructures: "88",
        affordability: "74",
        global: "84",
    },
}

const schoolTypes = ["IPES", "Université publique", "Université privée", "Institut", "Grande école"]
const modalities = ["Présentiel", "Hybride", "Online"]
const statusOptions = [
    { value: "CONFORME", label: "Conforme" },
    { value: "A_VERIFIER", label: "À vérifier" },
    { value: "RISQUE_ELEVE", label: "Risque élevé" },
]
const yesNoOptions = ["Oui", "Non"]
const internetQualities = ["Faible", "Moyenne", "Forte"]
const cityCostLevels = ["Faible", "Moyen", "Élevé"]

const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    identity: Building2,
    training: GraduationCap,
    legal: Scale,
    performance: TrendingUp,
    insertion: Network,
    infrastructure: Building,
    financial: DollarSign,
    experience: Heart,
    score: Star,
}

// Mapping des icônes pour les champs
const fieldIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    // Identity
    "name": Building2,
    "acronym": Hash,
    "type": School,
    "city": MapPin,
    "department": MapPin,
    "region": Globe,
    "country": Globe,
    "address": Home,
    "website": LinkIcon2,
    "contactEmail": Mail,
    "contactPhone": Phone,
    // Training
    "dominantFields": BookOpen,
    "dominantSpecialties": AwardIcon,
    "specialtiesOffered": GraduationCap,
    "diplomas": Trophy,
    "teachingLanguages": Languages,
    "modalities": Calendar,
    // Legal
    "accreditationNumber": FileCheck,
    "openingAuthorization": ShieldCheck,
    "authorizationDate": Calendar,
    "mainSupervision": Landmark,
    "secondarySupervisions": Landmark,
    "verificationDocs": FileText,
    "foreignDiplomasNoAccreditation": AlertCircle,
    "foreignDiplomasWithAccreditation": CheckCircle2,
    "status": ShieldCheck,
    // Performance
    "foundedYear": Calendar,
    "yearsOfExistence": TrendingUp,
    "successRates": TrendingUp,
    "officialRanking": Award,
    "accreditations": Award,
    // Insertion
    "localPartners": BriefcaseBusiness,
    "internationalPartners": Network,
    "internshipAgreements": FileCheck,
    "internshipAgreementCount": Hash,
    "alumniTracking": Users,
    "alumniExamples": UsersRound,
    "topRecruiters": Briefcase,
    "insertionRate6": TrendingUp,
    "insertionRate12": TrendingUp,
    // Infrastructure
    "campusCompliant": Building,
    "libraryResources": Library,
    "libraryQuality": BookOpen,
    "labs": FlaskConical,
    "labEquipment": FlaskConical,
    "itPark": Monitor,
    "itParkVolume": Monitor,
    "internetQuality": Wifi,
    "accessibility": Accessibility,
    "safetyNotes": ShieldCheck,
    // Financial
    "annualCost": DollarSign,
    "feeRegistration": CreditCard,
    "feeTuition": CreditCard,
    "feeExams": CreditCard,
    "feeMaterials": CreditCard,
    "otherFees": CreditCard,
    "scholarships": Award,
    "cityCostOfLiving": DollarSign,
    // Experience
    "clubs": Heart,
    "mentoring": UsersRound,
    "satisfactionRate": Smile,
    "mobility": Globe,
    "discipline": Scale,
    // Score
    "legality": Scale,
    "performance": TrendingUp,
    "insertion": Briefcase,
    "infrastructures": Building,
    "affordability": DollarSign,
    "global": Star,
}

const steps = [
    { id: "identity", title: "Identité & Localisation", description: "Informations officielles et coordonnées." },
    { id: "training", title: "Offre de Formation", description: "Filières, spécialités, diplômes." },
    { id: "legal", title: "Légalité & Conformité", description: "Données non négociables." },
    { id: "performance", title: "Performance Académique", description: "Ancienneté & indicateurs." },
    { id: "insertion", title: "Insertion & Partenariats", description: "Réseaux locaux et internationaux." },
    { id: "infrastructure", title: "Infrastructures", description: "Campus, équipements, accessibilité." },
    { id: "financial", title: "Conditions Financières", description: "Frais & coût de vie." },
    { id: "experience", title: "Expérience Étudiante", description: "Différenciants optionnels." },
    { id: "score", title: "Score Xkorienta", description: "Scores par axe de comparaison." },
]

export function SchoolCreationWizard() {
    const [step, setStep] = useState(0)
    const [form, setForm] = useState<SchoolCreationForm>(emptyForm)
    const [submitted, setSubmitted] = useState(false)

    const currentStep = steps[step]

    const progress = useMemo(() => {
        return Math.round(((step + 1) / steps.length) * 100)
    }, [step])

    // Fonction pour interpoler les couleurs de manière progressive
    const interpolateColor = (start: number[], end: number[], factor: number): string => {
        const r = Math.round(start[0] + (end[0] - start[0]) * factor)
        const g = Math.round(start[1] + (end[1] - start[1]) * factor)
        const b = Math.round(start[2] + (end[2] - start[2]) * factor)
        return `rgb(${r}, ${g}, ${b})`
    }

    // Style de dégradé pour la barre de progression (bleu → vert progressif)
    const progressBarStyle = useMemo(() => {
        const factor = progress / 100 // 0 à 1
        
        // Couleurs de départ (bleu) et d'arrivée (vert) en RGB
        const startColor = [17, 77, 90] // #114D5A
        const endColor = [34, 197, 94]  // #22c55e
        
        // Calcul des couleurs intermédiaires pour un dégradé fluide
        const color1 = interpolateColor(startColor, endColor, Math.max(0, factor - 0.2))
        const color2 = interpolateColor(startColor, endColor, factor)
        const color3 = interpolateColor(startColor, endColor, Math.min(1, factor + 0.2))
        
        return {
            background: `linear-gradient(to right, ${color1}, ${color2}, ${color3})`
        }
    }, [progress])

    // Couleur du texte du pourcentage (transition progressive bleu → vert)
    const progressTextColor = useMemo(() => {
        const factor = progress / 100
        const startColor = [17, 77, 90] // #114D5A
        const endColor = [34, 197, 94]  // #22c55e
        const color = interpolateColor(startColor, endColor, factor)
        return { color }
    }, [progress])

    const canProceed = useMemo(() => {
        if (currentStep.id === "identity") {
            return form.identity.name.trim() && form.identity.type.trim() && form.identity.city.trim()
        }
        if (currentStep.id === "legal") {
            return form.legal.accreditationNumber.trim() && form.legal.openingAuthorization.trim()
        }
        return true
    }, [currentStep.id, form])

    const handleSubmit = () => {
        setSubmitted(true)
        console.log("School creation payload (mock)", form)
    }

    if (submitted) {
        return <SchoolSummary form={form} onBack={() => setSubmitted(false)} />
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                        Création d&apos;une institution
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Formulaire légal pour enseignants — modèle Xkorienta.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-2 sm:flex-row"
                >
                    <Button
                        variant="outline"
                        onClick={() => setForm(mockForm)}
                        className="border-[#114D5A]/30 text-[#114D5A] hover:bg-[#114D5A]/5 hover:border-[#114D5A] transition-all"
                    >
                        Pré-remplir (mock)
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setForm(emptyForm)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Réinitialiser
                    </Button>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl p-6 md:p-8 space-y-8"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-wider font-bold">
                        <motion.span
                            key={`step-${step}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            Étape {step + 1} / {steps.length}
                        </motion.span>
                        <motion.span
                            key={`progress-${progress}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={progressTextColor}
                            className="font-extrabold text-base"
                        >
                            {progress}%
                        </motion.span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <motion.div
                            className="h-3 rounded-full shadow-lg"
                            style={progressBarStyle}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="hidden md:grid grid-cols-9 gap-2 text-[11px] text-gray-500">
                        {steps.map((s, index) => (
                            <motion.div
                                key={s.id}
                                className="flex flex-col items-center gap-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <motion.div
                                    className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-md",
                                        index < step
                                            ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                                            : index === step
                                            ? "bg-gradient-to-br from-[#114D5A] to-[#1a7a8f] text-white ring-4 ring-[#114D5A]/20"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                    )}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {index < step ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                                </motion.div>
                                <span className={cn(
                                    "text-center transition-colors duration-300",
                                    index === step ? "text-[#114D5A] font-bold" : ""
                                )}>
                                    {s.title}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#114D5A]/5 to-transparent rounded-2xl border-l-4 border-[#114D5A]">
                            <motion.div
                                className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#114D5A] to-[#1a7a8f] text-white flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {(() => {
                                    const IconComponent = stepIcons[currentStep.id] || FileText
                                    return <IconComponent className="h-6 w-6" />
                                })()}
                            </motion.div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentStep.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentStep.description}</p>
                            </div>
                        </div>

                    {currentStep.id === "identity" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Nom de l'institution" required icon={fieldIcons.name} value={form.identity.name}>
                                <Input
                                    value={form.identity.name}
                                    onChange={(e) => update("identity", "name", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.identity.name, true) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Sigle" icon={fieldIcons.acronym} value={form.identity.acronym}>
                                <Input
                                    value={form.identity.acronym}
                                    onChange={(e) => update("identity", "acronym", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.identity.acronym) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Type d'établissement" required icon={fieldIcons.type} value={form.identity.type}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.identity.type, true) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.identity.type}
                                    onChange={(e) => update("identity", "type", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {schoolTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Ville" required icon={fieldIcons.city} value={form.identity.city}>
                                <Input 
                                    value={form.identity.city} 
                                    onChange={(e) => update("identity", "city", e.target.value)} 
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.identity.city, true) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Département" icon={fieldIcons.department} value={form.identity.department}>
                                <Input 
                                    value={form.identity.department} 
                                    onChange={(e) => update("identity", "department", e.target.value)} 
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.identity.department) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Région" icon={fieldIcons.region} value={form.identity.region}>
                                <Input 
                                    value={form.identity.region} 
                                    onChange={(e) => update("identity", "region", e.target.value)} 
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.identity.region) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Pays" icon={fieldIcons.country} value={form.identity.country}>
                                <Input 
                                    value={form.identity.country} 
                                    onChange={(e) => update("identity", "country", e.target.value)} 
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.identity.country) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Site web" icon={fieldIcons.website} value={form.identity.website}>
                                <Input 
                                    value={form.identity.website} 
                                    onChange={(e) => update("identity", "website", e.target.value)} 
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.identity.website) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Email officiel" icon={fieldIcons.contactEmail} value={form.identity.contactEmail}>
                                <Input 
                                    type="email" 
                                    value={form.identity.contactEmail} 
                                    onChange={(e) => update("identity", "contactEmail", e.target.value)} 
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.identity.contactEmail) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Téléphone" icon={fieldIcons.contactPhone} value={form.identity.contactPhone}>
                                <Input 
                                    value={form.identity.contactPhone} 
                                    onChange={(e) => update("identity", "contactPhone", e.target.value)} 
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.identity.contactPhone) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Adresse fixe / Localisation" icon={fieldIcons.address} value={form.identity.address}>
                                    <Textarea 
                                        rows={3} 
                                        value={form.identity.address} 
                                        onChange={(e) => update("identity", "address", e.target.value)} 
                                        className={cn(
                                            "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all",
                                            isValidField(form.identity.address) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {currentStep.id === "training" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ListField
                                label="Filières dominantes"
                                values={form.training.dominantFields}
                                onChange={(values) => updateNested("training", "dominantFields", values)}
                                icon={fieldIcons.dominantFields}
                            />
                            <ListField
                                label="Spécialités dominantes"
                                values={form.training.dominantSpecialties}
                                onChange={(values) => updateNested("training", "dominantSpecialties", values)}
                                icon={fieldIcons.dominantSpecialties}
                            />
                            <ListField
                                label="Spécialités proposées"
                                values={form.training.specialtiesOffered}
                                onChange={(values) => updateNested("training", "specialtiesOffered", values)}
                                icon={fieldIcons.specialtiesOffered}
                            />
                            <ListField
                                label="Diplômes délivrés"
                                values={form.training.diplomas}
                                onChange={(values) => updateNested("training", "diplomas", values)}
                                icon={fieldIcons.diplomas}
                            />
                            <ListField
                                label="Langues d'enseignement"
                                values={form.training.teachingLanguages}
                                onChange={(values) => updateNested("training", "teachingLanguages", values)}
                                icon={fieldIcons.teachingLanguages}
                            />
                            <Field label="Modalités" icon={fieldIcons.modalities} value={form.training.modalities}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.training.modalities) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.training.modalities}
                                    onChange={(e) => update("training", "modalities", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {modalities.map((mod) => (
                                        <option key={mod} value={mod}>{mod}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    )}

                    {currentStep.id === "legal" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Numéro d'agrément" required icon={fieldIcons.accreditationNumber} value={form.legal.accreditationNumber}>
                                <Input 
                                    value={form.legal.accreditationNumber} 
                                    onChange={(e) => update("legal", "accreditationNumber", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.legal.accreditationNumber, true) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Autorisation d'ouverture" required icon={fieldIcons.openingAuthorization} value={form.legal.openingAuthorization}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.legal.openingAuthorization, true) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.legal.openingAuthorization}
                                    onChange={(e) => update("legal", "openingAuthorization", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {["Délivrée", "Non délivrée"].map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Date d'autorisation" icon={fieldIcons.authorizationDate} value={form.legal.authorizationDate}>
                                <Input 
                                    type="date" 
                                    value={form.legal.authorizationDate} 
                                    onChange={(e) => update("legal", "authorizationDate", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.legal.authorizationDate) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Tutelle académique principale" icon={fieldIcons.mainSupervision} value={form.legal.mainSupervision}>
                                <Input 
                                    value={form.legal.mainSupervision} 
                                    onChange={(e) => update("legal", "mainSupervision", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.legal.mainSupervision) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <ListField
                                label="Tutelles secondaires (1→10)"
                                values={form.legal.secondarySupervisions}
                                onChange={(values) => updateNested("legal", "secondarySupervisions", values)}
                                icon={fieldIcons.secondarySupervisions}
                            />
                            <ListField
                                label="Documents vérifiables (scan / lien)"
                                values={form.legal.verificationDocs}
                                onChange={(values) => updateNested("legal", "verificationDocs", values)}
                                icon={fieldIcons.verificationDocs}
                            />
                            <Field label="Diplômes étrangers sans accréditation" icon={fieldIcons.foreignDiplomasNoAccreditation} value={form.legal.foreignDiplomasNoAccreditation}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.legal.foreignDiplomasNoAccreditation) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.legal.foreignDiplomasNoAccreditation}
                                    onChange={(e) => update("legal", "foreignDiplomasNoAccreditation", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {yesNoOptions.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Diplômes étrangers avec accréditation" icon={fieldIcons.foreignDiplomasWithAccreditation} value={form.legal.foreignDiplomasWithAccreditation}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.legal.foreignDiplomasWithAccreditation) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.legal.foreignDiplomasWithAccreditation}
                                    onChange={(e) => update("legal", "foreignDiplomasWithAccreditation", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {yesNoOptions.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Statut Xkorienta" icon={fieldIcons.status} value={form.legal.status}>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => update("legal", "status", option.value)}
                                                className={cn(
                                                    "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all",
                                                    form.legal.status === option.value
                                                        ? "border-[#114D5A] bg-[#114D5A]/10 text-[#114D5A]"
                                                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#114D5A]/40"
                                                )}
                                            >
                                                {option.label}
                                                {form.legal.status === option.value && <CheckCircle2 className="h-4 w-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                            </div>
                        </div>
                    )}

                    {currentStep.id === "performance" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Année de création" icon={fieldIcons.foundedYear} value={form.performance.foundedYear}>
                                <Input 
                                    value={form.performance.foundedYear} 
                                    onChange={(e) => update("performance", "foundedYear", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.performance.foundedYear) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Années d'existence" icon={fieldIcons.yearsOfExistence} value={form.performance.yearsOfExistence}>
                                <Input 
                                    value={form.performance.yearsOfExistence} 
                                    onChange={(e) => update("performance", "yearsOfExistence", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.performance.yearsOfExistence) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Taux de réussite BTS/HND (3 ans)" icon={fieldIcons.successRates} value={form.performance.successRates}>
                                <Input 
                                    value={form.performance.successRates} 
                                    onChange={(e) => update("performance", "successRates", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.performance.successRates) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Classement officiel MINESUP" icon={fieldIcons.officialRanking} value={form.performance.officialRanking}>
                                <Input 
                                    value={form.performance.officialRanking} 
                                    onChange={(e) => update("performance", "officialRanking", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.performance.officialRanking) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Accréditations / reconnaissances" icon={fieldIcons.accreditations} value={form.performance.accreditations}>
                                    <Textarea 
                                        rows={3} 
                                        value={form.performance.accreditations} 
                                        onChange={(e) => update("performance", "accreditations", e.target.value)}
                                        className={cn(
                                            "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all",
                                            isValidField(form.performance.accreditations) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {currentStep.id === "insertion" && (
                        <div className="space-y-6">
                            <PartnerField
                                label="Partenaires locaux (1→10)"
                                partners={form.insertion.localPartners}
                                onChange={(partners) => updateNested("insertion", "localPartners", partners)}
                                icon={fieldIcons.localPartners}
                            />
                            <PartnerField
                                label="Partenaires internationaux (1→10)"
                                partners={form.insertion.internationalPartners}
                                onChange={(partners) => updateNested("insertion", "internationalPartners", partners)}
                                showCountry
                                icon={fieldIcons.internationalPartners}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="Conventions de stage" icon={fieldIcons.internshipAgreements} value={form.insertion.internshipAgreements}>
                                    <select
                                        className={cn(
                                            "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                            isValidField(form.insertion.internshipAgreements) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                        value={form.insertion.internshipAgreements}
                                        onChange={(e) => update("insertion", "internshipAgreements", e.target.value)}
                                    >
                                        <option value="">Choisir...</option>
                                        {yesNoOptions.map((value) => (
                                            <option key={value} value={value}>{value}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Nombre de conventions" icon={fieldIcons.internshipAgreementCount} value={form.insertion.internshipAgreementCount}>
                                    <Input 
                                        value={form.insertion.internshipAgreementCount} 
                                        onChange={(e) => update("insertion", "internshipAgreementCount", e.target.value)}
                                        className={cn(
                                            "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                            isValidField(form.insertion.internshipAgreementCount) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                    />
                                </Field>
                                <Field label="Suivi Alumni" icon={fieldIcons.alumniTracking} value={form.insertion.alumniTracking}>
                                    <select
                                        className={cn(
                                            "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                            isValidField(form.insertion.alumniTracking) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                        value={form.insertion.alumniTracking}
                                        onChange={(e) => update("insertion", "alumniTracking", e.target.value)}
                                    >
                                        <option value="">Choisir...</option>
                                        {yesNoOptions.map((value) => (
                                            <option key={value} value={value}>{value}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Exemples de suivi alumni" icon={fieldIcons.alumniExamples} value={form.insertion.alumniExamples}>
                                    <Input 
                                        value={form.insertion.alumniExamples} 
                                        onChange={(e) => update("insertion", "alumniExamples", e.target.value)}
                                        className={cn(
                                            "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                            isValidField(form.insertion.alumniExamples) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                    />
                                </Field>
                                <ListField
                                    label="Entreprises recruteuses (Top 5)"
                                    values={form.insertion.topRecruiters}
                                    onChange={(values) => updateNested("insertion", "topRecruiters", values)}
                                    icon={fieldIcons.topRecruiters}
                                />
                                <Field label="Taux d'insertion à 6 mois" icon={fieldIcons.insertionRate6} value={form.insertion.insertionRate6}>
                                    <Input 
                                        value={form.insertion.insertionRate6} 
                                        onChange={(e) => update("insertion", "insertionRate6", e.target.value)}
                                        className={cn(
                                            "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                            isValidField(form.insertion.insertionRate6) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                    />
                                </Field>
                                <Field label="Taux d'insertion à 12 mois" icon={fieldIcons.insertionRate12} value={form.insertion.insertionRate12}>
                                    <Input 
                                        value={form.insertion.insertionRate12} 
                                        onChange={(e) => update("insertion", "insertionRate12", e.target.value)}
                                        className={cn(
                                            "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                            isValidField(form.insertion.insertionRate12) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {currentStep.id === "infrastructure" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Campus aux normes" icon={fieldIcons.campusCompliant} value={form.infrastructure.campusCompliant}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.infrastructure.campusCompliant) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.infrastructure.campusCompliant}
                                    onChange={(e) => update("infrastructure", "campusCompliant", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {yesNoOptions.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Bibliothèque / ressources numériques" icon={fieldIcons.libraryResources} value={form.infrastructure.libraryResources}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.infrastructure.libraryResources) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.infrastructure.libraryResources}
                                    onChange={(e) => update("infrastructure", "libraryResources", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {yesNoOptions.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Qualité des ressources" icon={fieldIcons.libraryQuality} value={form.infrastructure.libraryQuality}>
                                <Input 
                                    value={form.infrastructure.libraryQuality} 
                                    onChange={(e) => update("infrastructure", "libraryQuality", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.infrastructure.libraryQuality) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Laboratoires" icon={fieldIcons.labs} value={form.infrastructure.labs}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.infrastructure.labs) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.infrastructure.labs}
                                    onChange={(e) => update("infrastructure", "labs", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {yesNoOptions.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Équipements de laboratoire" icon={fieldIcons.labEquipment} value={form.infrastructure.labEquipment}>
                                <Input 
                                    value={form.infrastructure.labEquipment} 
                                    onChange={(e) => update("infrastructure", "labEquipment", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.infrastructure.labEquipment) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Parc informatique" icon={fieldIcons.itPark} value={form.infrastructure.itPark}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.infrastructure.itPark) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.infrastructure.itPark}
                                    onChange={(e) => update("infrastructure", "itPark", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {yesNoOptions.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Volume parc informatique" icon={fieldIcons.itParkVolume} value={form.infrastructure.itParkVolume}>
                                <Input 
                                    value={form.infrastructure.itParkVolume} 
                                    onChange={(e) => update("infrastructure", "itParkVolume", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.infrastructure.itParkVolume) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Connexion internet" icon={fieldIcons.internetQuality} value={form.infrastructure.internetQuality}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.infrastructure.internetQuality) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.infrastructure.internetQuality}
                                    onChange={(e) => update("infrastructure", "internetQuality", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {internetQualities.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Accessibilité handicap" icon={fieldIcons.accessibility} value={form.infrastructure.accessibility}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.infrastructure.accessibility) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.infrastructure.accessibility}
                                    onChange={(e) => update("infrastructure", "accessibility", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {yesNoOptions.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Sécurité / transport / logement (notes)" icon={fieldIcons.safetyNotes} value={form.infrastructure.safetyNotes}>
                                    <Textarea 
                                        rows={3} 
                                        value={form.infrastructure.safetyNotes} 
                                        onChange={(e) => update("infrastructure", "safetyNotes", e.target.value)}
                                        className={cn(
                                            "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all",
                                            isValidField(form.infrastructure.safetyNotes) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {currentStep.id === "financial" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Coût total annuel (frais)" icon={fieldIcons.annualCost} value={form.financial.annualCost}>
                                <Input 
                                    value={form.financial.annualCost} 
                                    onChange={(e) => update("financial", "annualCost", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.financial.annualCost) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Frais d'inscription" icon={fieldIcons.feeRegistration} value={form.financial.feeRegistration}>
                                <Input 
                                    value={form.financial.feeRegistration} 
                                    onChange={(e) => update("financial", "feeRegistration", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.financial.feeRegistration) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Frais de scolarité" icon={fieldIcons.feeTuition} value={form.financial.feeTuition}>
                                <Input 
                                    value={form.financial.feeTuition} 
                                    onChange={(e) => update("financial", "feeTuition", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.financial.feeTuition) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Frais d'examens" icon={fieldIcons.feeExams} value={form.financial.feeExams}>
                                <Input 
                                    value={form.financial.feeExams} 
                                    onChange={(e) => update("financial", "feeExams", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.financial.feeExams) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Supports / matériels" icon={fieldIcons.feeMaterials} value={form.financial.feeMaterials}>
                                <Input 
                                    value={form.financial.feeMaterials} 
                                    onChange={(e) => update("financial", "feeMaterials", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.financial.feeMaterials) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Autres frais" icon={fieldIcons.otherFees} value={form.financial.otherFees}>
                                <Input 
                                    value={form.financial.otherFees} 
                                    onChange={(e) => update("financial", "otherFees", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.financial.otherFees) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Bourses / facilités de paiement" icon={fieldIcons.scholarships} value={form.financial.scholarships}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.financial.scholarships) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.financial.scholarships}
                                    onChange={(e) => update("financial", "scholarships", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {yesNoOptions.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Coût estimé de la vie" icon={fieldIcons.cityCostOfLiving} value={form.financial.cityCostOfLiving}>
                                <select
                                    className={cn(
                                        "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all outline-none pr-10",
                                        isValidField(form.financial.cityCostOfLiving) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                    value={form.financial.cityCostOfLiving}
                                    onChange={(e) => update("financial", "cityCostOfLiving", e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    {cityCostLevels.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    )}

                    {currentStep.id === "experience" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Clubs / vie étudiante" icon={fieldIcons.clubs} value={form.studentExperience.clubs}>
                                <Textarea 
                                    rows={3} 
                                    value={form.studentExperience.clubs} 
                                    onChange={(e) => update("studentExperience", "clubs", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all",
                                        isValidField(form.studentExperience.clubs) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Encadrement / suivi" icon={fieldIcons.mentoring} value={form.studentExperience.mentoring}>
                                <Textarea 
                                    rows={3} 
                                    value={form.studentExperience.mentoring} 
                                    onChange={(e) => update("studentExperience", "mentoring", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all",
                                        isValidField(form.studentExperience.mentoring) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Taux de satisfaction" icon={fieldIcons.satisfactionRate} value={form.studentExperience.satisfactionRate}>
                                <Input 
                                    value={form.studentExperience.satisfactionRate} 
                                    onChange={(e) => update("studentExperience", "satisfactionRate", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.studentExperience.satisfactionRate) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Mobilité / international" icon={fieldIcons.mobility} value={form.studentExperience.mobility}>
                                <Input 
                                    value={form.studentExperience.mobility} 
                                    onChange={(e) => update("studentExperience", "mobility", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.studentExperience.mobility) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Discipline / règles" icon={fieldIcons.discipline} value={form.studentExperience.discipline}>
                                    <Textarea 
                                        rows={3} 
                                        value={form.studentExperience.discipline} 
                                        onChange={(e) => update("studentExperience", "discipline", e.target.value)}
                                        className={cn(
                                            "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all",
                                            isValidField(form.studentExperience.discipline) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                        )}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {currentStep.id === "score" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Score Légalité /100" icon={fieldIcons.legality} value={form.score.legality}>
                                <Input 
                                    value={form.score.legality} 
                                    onChange={(e) => update("score", "legality", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.score.legality) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Score Performance /100" icon={fieldIcons.performance} value={form.score.performance}>
                                <Input 
                                    value={form.score.performance} 
                                    onChange={(e) => update("score", "performance", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.score.performance) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Score Insertion /100" icon={fieldIcons.insertion} value={form.score.insertion}>
                                <Input 
                                    value={form.score.insertion} 
                                    onChange={(e) => update("score", "insertion", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.score.insertion) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Score Infrastructures /100" icon={fieldIcons.infrastructures} value={form.score.infrastructures}>
                                <Input 
                                    value={form.score.infrastructures} 
                                    onChange={(e) => update("score", "infrastructures", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.score.infrastructures) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Score Accessibilité-Coût /100" icon={fieldIcons.affordability} value={form.score.affordability}>
                                <Input 
                                    value={form.score.affordability} 
                                    onChange={(e) => update("score", "affordability", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.score.affordability) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                            <Field label="Score global établissement /100" icon={fieldIcons.global} value={form.score.global}>
                                <Input 
                                    value={form.score.global} 
                                    onChange={(e) => update("score", "global", e.target.value)}
                                    className={cn(
                                        "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all pr-10",
                                        isValidField(form.score.global) && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                                    )}
                                />
                            </Field>
                        </div>
                    )}
                    </motion.div>
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-gray-100 dark:border-gray-700 pt-6"
                >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
                            disabled={step === 0}
                            className="gap-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Retour
                        </Button>
                    </motion.div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))}
                                disabled={!canProceed}
                                className="gap-2 bg-gradient-to-r from-[#114D5A] to-[#1a7a8f] hover:from-[#0e3f4a] hover:to-[#156575] text-white shadow-lg shadow-[#114D5A]/30 transition-all"
                            >
                                Suivant
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </motion.div>
                        {step === steps.length - 1 && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitted}
                                    className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30 transition-all"
                                >
                                    {submitted ? "Dossier envoyé" : "Soumettre le dossier"}
                                    <CheckCircle2 className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    )

    function update(section: keyof SchoolCreationForm, field: string, value: string) {
        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }))
    }

    function updateNested<K extends keyof SchoolCreationForm>(section: K, field: keyof SchoolCreationForm[K], value: unknown) {
        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }))
    }
}

// Fonction de validation pour déterminer si un champ est valide
function isValidField(value: string | string[] | undefined, required?: boolean): boolean {
    if (required) {
        if (Array.isArray(value)) {
            return value.length > 0 && value.some(v => v.trim() !== "")
        }
        return typeof value === "string" && value.trim() !== ""
    }
    // Pour les champs optionnels, on considère qu'ils sont valides s'ils ont une valeur
    if (Array.isArray(value)) {
        return value.length > 0 && value.some(v => v.trim() !== "")
    }
    return typeof value === "string" && value.trim() !== ""
}

function Field({ 
    label, 
    children, 
    required, 
    icon: Icon,
    value 
}: { 
    label: string
    children: React.ReactNode
    required?: boolean
    icon?: React.ComponentType<{ className?: string }>
    value?: string | string[]
}) {
    const isValid = value !== undefined ? isValidField(value, required) : false
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
        >
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-[#114D5A]" />}
                {label} {required && <span className="text-red-500 text-base">*</span>}
            </Label>
            <div className="relative">
                {children}
                {isValid && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

function ListField({ 
    label, 
    values, 
    onChange, 
    icon: Icon,
    required 
}: { 
    label: string
    values: string[]
    onChange: (values: string[]) => void
    icon?: React.ComponentType<{ className?: string }>
    required?: boolean
}) {
    const isValid = isValidField(values, required)
    const hasValidValues = values.some(v => v.trim() !== "")
    
    return (
        <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-[#114D5A]" />}
                {label} {required && <span className="text-red-500 text-base">*</span>}
                {isValid && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
            </Label>
            <div className={cn(
                "space-y-2 p-4 rounded-xl border transition-all",
                hasValidValues && "border-green-500/50 bg-green-50/30 dark:bg-green-950/20"
            )}>
                {values.map((value, index) => (
                    <motion.div
                        key={`${label}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        <Input
                            value={value}
                            onChange={(e) => {
                                const next = [...values]
                                next[index] = e.target.value
                                onChange(next)
                            }}
                            className={cn(
                                "focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A] transition-all",
                                value.trim() !== "" && "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                            )}
                        />
                        <motion.button
                            type="button"
                            onClick={() => onChange(values.filter((_, i) => i !== index))}
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-600 transition-all shadow-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </motion.button>
                    </motion.div>
                ))}
                <motion.button
                    type="button"
                    onClick={() => onChange([...values, ""])}
                    className="flex items-center gap-2 text-sm font-bold text-[#114D5A] hover:text-[#0e3f4a] transition-colors py-2 px-3 rounded-lg hover:bg-[#114D5A]/5"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus className="h-4 w-4" />
                    Ajouter un élément
                </motion.button>
            </div>
        </div>
    )
}

function PartnerField({
    label,
    partners,
    onChange,
    showCountry,
    icon: Icon,
}: {
    label: string
    partners: Partner[]
    onChange: (partners: Partner[]) => void
    showCountry?: boolean
    icon?: React.ComponentType<{ className?: string }>
}) {
    const hasValidPartners = partners.some(p => p.name.trim() !== "" || p.sector.trim() !== "")
    
    return (
        <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-[#114D5A]" />}
                {label}
                {hasValidPartners && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
            </Label>
            <div className="space-y-4">
                {partners.map((partner, index) => (
                    <motion.div
                        key={`${label}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#114D5A]/30 transition-all"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
                            <Input
                                placeholder="Nom"
                                value={partner.name}
                                onChange={(e) => updatePartner(index, "name", e.target.value)}
                                className="focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A]"
                            />
                            <Input
                                placeholder="Secteur"
                                value={partner.sector}
                                onChange={(e) => updatePartner(index, "sector", e.target.value)}
                                className="focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A]"
                            />
                            {showCountry && (
                                <Input
                                    placeholder="Pays"
                                    value={partner.country || ""}
                                    onChange={(e) => updatePartner(index, "country", e.target.value)}
                                    className="focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A]"
                                />
                            )}
                            <Input
                                placeholder="Type (stage / emploi)"
                                value={partner.type}
                                onChange={(e) => updatePartner(index, "type", e.target.value)}
                                className="focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A]"
                            />
                            <div className="flex items-center gap-2">
                                <FileUploadInput
                                    value={partner.proof}
                                    onChange={(value) => updatePartner(index, "proof", value)}
                                    placeholder="PDF ou URL"
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => onChange(partners.filter((_, i) => i !== index))}
                                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-600 transition-all shadow-sm"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
                <motion.button
                    type="button"
                    onClick={() => onChange([...partners, { name: "", sector: "", type: "", proof: "", country: "" }])}
                    className="flex items-center gap-2 text-sm font-bold text-[#114D5A] hover:text-[#0e3f4a] transition-colors py-2 px-3 rounded-lg hover:bg-[#114D5A]/5"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus className="h-4 w-4" />
                    Ajouter un partenaire
                </motion.button>
            </div>
        </div>
    )

    function updatePartner(index: number, field: keyof Partner, value: string) {
        const next = [...partners]
        next[index] = { ...next[index], [field]: value }
        onChange(next)
    }
}

function FileUploadInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
    const [mode, setMode] = useState<"url" | "file">("url")
    const [showOptions, setShowOptions] = useState(false)

    return (
        <div className="flex-1 relative">
            <div className="flex items-center gap-2">
                <Input
                    placeholder={placeholder || "URL ou fichier"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pr-24 focus:ring-2 focus:ring-[#114D5A]/30 focus:border-[#114D5A]"
                />
                <motion.button
                    type="button"
                    onClick={() => setShowOptions(!showOptions)}
                    className="absolute right-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {mode === "url" ? <LinkIcon className="h-4 w-4 text-[#114D5A]" /> : <Upload className="h-4 w-4 text-[#114D5A]" />}
                </motion.button>
            </div>
            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden min-w-[200px]"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setMode("url")
                                setShowOptions(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <LinkIcon className="h-4 w-4 text-[#114D5A]" />
                            <span className="text-sm font-medium">Saisir URL</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("file")
                                const input = document.createElement("input")
                                input.type = "file"
                                input.accept = ".pdf"
                                input.onchange = (e: Event) => {
                                    const target = e.target as HTMLInputElement
                                    const file = target.files?.[0]
                                    if (file) {
                                        onChange(`file:${file.name}`)
                                    }
                                }
                                input.click()
                                setShowOptions(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <Upload className="h-4 w-4 text-[#114D5A]" />
                            <span className="text-sm font-medium">Importer PDF</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
