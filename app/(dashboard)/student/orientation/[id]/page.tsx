"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Star,
  Globe,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  DollarSign,
  TrendingUp,
  Check,
  Users,
  Calendar,
  BookOpen,
} from "lucide-react"
import { ORIENTATION_SCHOOLS_MOCK } from "@/lib/mocks/orientationSchools"

// Fonction utilitaire pour formater les nombres de manière cohérente (évite les erreurs d'hydratation)
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

export default function SchoolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState<"presentation" | "specialites" | "partenaires" | "debouches" | "cout">(
    "presentation"
  )

  // Trouver l'école dans les mocks
  const school = ORIENTATION_SCHOOLS_MOCK.find((s) => s._id === resolvedParams.id)

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">École non trouvée</h2>
          <button
            onClick={() => router.push("/student/orientation")}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "presentation" as const, label: "Présentation", icon: BookOpen },
    { id: "specialites" as const, label: "Spécialités", icon: GraduationCap },
    { id: "partenaires" as const, label: "Partenaires", icon: Users },
    { id: "debouches" as const, label: "Débouchés", icon: Briefcase },
    { id: "cout" as const, label: "Coût", icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header avec image de fond */}
      <div className="relative h-64 bg-gradient-to-r from-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        
        {/* Bouton retour */}
        <button
          onClick={() => router.push("/student/orientation")}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </button>

        {/* Info école dans le header */}
        <div className="relative z-10 container mx-auto px-6 h-full flex items-end pb-8">
          <div className="flex items-end gap-6">
            {/* Logo */}
            <div className="h-24 w-24 rounded-2xl bg-white flex items-center justify-center shadow-xl overflow-hidden border-4 border-white">
              {school.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={school.logoUrl} alt={school.name} className="h-full w-full object-cover" />
              ) : (
                <GraduationCap className="h-12 w-12 text-primary" />
              )}
            </div>

            {/* Nom et localisation */}
            <div className="flex-1 text-white pb-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{school.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {school.city}, {school.country}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Fondée en {school.foundedYear}</span>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-xl text-center mb-2">
              <div className="text-4xl font-bold text-secondary mb-1">{school.xkorientaScore}%</div>
              <div className="flex items-center gap-1 text-yellow-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-current" : ""}`} />
                ))}
              </div>
              <div className="text-xs text-gray-600">Score Xkorienta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-secondary border-secondary"
                      : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === "presentation" && <PresentationTab school={school} />}
        {activeTab === "specialites" && <SpecialitesTab school={school} />}
        {activeTab === "partenaires" && <PartenairesTab school={school} />}
        {activeTab === "debouches" && <DebouchesTab school={school} />}
        {activeTab === "cout" && <CoutTab school={school} />}
      </div>
    </div>
  )
}

// Onglet Présentation
function PresentationTab({ school }: { school: typeof ORIENTATION_SCHOOLS_MOCK[0] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Colonne principale */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">À propos</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{school.description}</p>
        </div>

        {/* Ce que tu vas apprendre */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ce que tu vas apprendre</h2>
          <div className="space-y-3">
            {school.learningOutcomes?.map((outcome, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colonne latérale - Infos pratiques */}
      <div className="space-y-6">
        {/* Contact */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Contact</h3>
          <div className="space-y-3">
            {school.contactInfo?.website && (
              <a
                href={school.contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Site web</span>
              </a>
            )}
            {school.contactInfo?.email && (
              <a
                href={`mailto:${school.contactInfo.email}`}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{school.contactInfo.email}</span>
              </a>
            )}
            {school.contactInfo?.phone && (
              <a
                href={`tel:${school.contactInfo.phone}`}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{school.contactInfo.phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Chiffres clés */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Chiffres clés</h3>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-primary">{school.studentCount ? formatNumber(school.studentCount) : "0"}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Étudiants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">{school.employability}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taux d&apos;employabilité</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{school.recognition?.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accréditations</div>
            </div>
          </div>
        </div>

        {/* Modalité */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Modalité</h3>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{school.modality}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mode d&apos;enseignement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Onglet Spécialités
function SpecialitesTab({ school }: { school: typeof ORIENTATION_SCHOOLS_MOCK[0] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Programmes disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {school.programs?.map((program, i) => (
            <div
              key={i}
              className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-6 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{program.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{program.degree}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{program.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Domaines d'études */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Domaines d&apos;études</h2>
        <div className="flex flex-wrap gap-3">
          {school.specialties?.map((spec, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium border border-primary/20"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Onglet Partenaires
function PartenairesTab({ school }: { school: typeof ORIENTATION_SCHOOLS_MOCK[0] }) {
  return (
    <div className="space-y-6">
      {/* Partenaires entreprises */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Partenaires Entreprises</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {school.partnerships?.map((partner, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-primary/40 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{partner}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Partenaire officiel</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reconnaissances */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Accréditations & Reconnaissances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {school.recognition?.map((rec, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl"
            >
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{rec}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Certification officielle</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Onglet Débouchés
function DebouchesTab({ school }: { school: typeof ORIENTATION_SCHOOLS_MOCK[0] }) {
  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "high":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "low":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
    }
  }

  const getDemandLabel = (demand: string) => {
    switch (demand) {
      case "high":
        return "Forte demande"
      case "medium":
        return "Demande moyenne"
      case "low":
        return "Demande faible"
      default:
        return "Non spécifié"
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Débouchés professionnels</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Taux d&apos;employabilité : <span className="font-bold text-secondary">{school.employability}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {school.careerPaths?.map((career, i) => (
            <div
              key={i}
              className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-6 hover:border-secondary/40 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{career.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span>{career.salary}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getDemandColor(career.demand)}`}>
                  <TrendingUp className="h-3 w-3" />
                  {getDemandLabel(career.demand)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Onglet Coût
function CoutTab({ school }: { school: typeof ORIENTATION_SCHOOLS_MOCK[0] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coûts détaillés */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frais de scolarité</h2>
          
          <div className="space-y-6">
            {/* Frais d'inscription */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Frais d&apos;inscription</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Paiement unique</div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {school.tuitionDetails?.registrationFee ? formatNumber(school.tuitionDetails.registrationFee) : "0"} FCFA
              </div>
            </div>

            {/* Frais annuels */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Frais de scolarité annuels</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Par année académique</div>
              </div>
              <div className="text-2xl font-bold text-secondary">
                {school.tuitionDetails?.tuitionPerYear ? formatNumber(school.tuitionDetails.tuitionPerYear) : "0"} FCFA
              </div>
            </div>

            {/* Modalités de paiement */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Modalités de paiement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {school.tuitionDetails?.paymentOptions.map((option, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 border-2 border-gray-100 dark:border-gray-700 rounded-lg"
                  >
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bourses */}
            {school.tuitionDetails?.scholarships && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Bourses disponibles</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Cet établissement propose des programmes de bourses pour les étudiants méritants. Renseignez-vous
                  auprès de l&apos;administration.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Résumé & CTA */}
      <div className="space-y-6">
        {/* Fourchette de prix */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white shadow-xl">
          <h3 className="font-bold text-lg mb-4">Coût total</h3>
          <div className="space-y-2">
            <div className="text-sm opacity-80">Fourchette annuelle</div>
            <div className="text-3xl font-bold">
              {school.tuitionFee?.min ? formatNumber(school.tuitionFee.min) : "0"} - {school.tuitionFee?.max ? formatNumber(school.tuitionFee.max) : "0"} FCFA
            </div>
            <div className="text-sm opacity-80">Par an</div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Intéressé(e) ?</h3>
          <div className="space-y-3">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              Candidater maintenant
            </button>
            <button className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Demander une brochure
            </button>
          </div>
        </div>

        {/* Langues */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Langues d&apos;enseignement</h3>
          <div className="flex flex-wrap gap-2">
            {school.languages?.map((lang, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
