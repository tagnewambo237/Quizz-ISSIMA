"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  School as SchoolIcon,
  MapPin,
  Star,
  Briefcase,
  Award,
  BookOpen,
  DollarSign,
  Globe,
  Filter,
  X,
  ChevronDown,
  Plus,
  GitCompare,
  Eye,
  GraduationCap,
} from "lucide-react"
import type { OrientationSchoolDTO } from "@/lib/mocks/orientationSchools"

// Fonction utilitaire pour formater les nombres de manière cohérente (évite les erreurs d'hydratation)
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

export function OrientationSchoolsClient({ schools }: { schools: OrientationSchoolDTO[] }) {
  // États pour la recherche et les filtres
  const [query, setQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // États pour les filtres avancés
  const [filterType, setFilterType] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("")
  const [filterAccreditation, setFilterAccreditation] = useState("")
  const [filterModality, setFilterModality] = useState("")
  const [filterLanguage, setFilterLanguage] = useState("")
  const [filterCostRange, setFilterCostRange] = useState<[number, number]>([0, 3000000])
  const [filterScoreMin, setFilterScoreMin] = useState(0)

  // États pour la shortlist et la comparaison
  const [shortlist, setShortlist] = useState<string[]>([])
  const [comparison, setComparison] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)

  // Extraire les valeurs uniques pour les filtres
  const countries = useMemo(() => Array.from(new Set(schools.map((s) => s.country).filter(Boolean))), [schools])
  const cities = useMemo(
    () =>
      Array.from(
        new Set(schools.filter((s) => !selectedCountry || s.country === selectedCountry).map((s) => s.city).filter(Boolean))
      ),
    [schools, selectedCountry]
  )
  const levels = useMemo(
    () => Array.from(new Set(schools.flatMap((s) => s.academicLevel || []))),
    [schools]
  )
  const specialties = useMemo(
    () => Array.from(new Set(schools.flatMap((s) => s.specialties || []))),
    [schools]
  )
  const accreditations = useMemo(
    () => Array.from(new Set(schools.flatMap((s) => s.accreditation || []))),
    [schools]
  )
  const languages = useMemo(
    () => Array.from(new Set(schools.flatMap((s) => s.languages || []))),
    [schools]
  )

  // Filtrage des écoles
  const filtered = useMemo(() => {
    return schools.filter((school) => {
      // Recherche textuelle
      if (query) {
        const q = query.trim().toLowerCase()
        const searchText = `${school.name} ${school.address || ""} ${school.specialties?.join(" ") || ""}`.toLowerCase()
        if (!searchText.includes(q)) return false
      }

      // Localisation
      if (selectedCountry && school.country !== selectedCountry) return false
      if (selectedCity && school.city !== selectedCity) return false

      // Niveau académique
      if (selectedLevel && !school.academicLevel?.includes(selectedLevel)) return false

      // Filtres avancés
      if (filterType && school.type !== filterType) return false
      if (filterSpecialty && !school.specialties?.includes(filterSpecialty)) return false
      if (filterAccreditation && !school.accreditation?.includes(filterAccreditation)) return false
      if (filterModality && school.modality !== filterModality) return false
      if (filterLanguage && !school.languages?.includes(filterLanguage)) return false

      // Coût
      if (school.tuitionFee) {
        if (school.tuitionFee.min > filterCostRange[1] || school.tuitionFee.max < filterCostRange[0]) return false
      }

      // Score Xkorienta
      if (school.xkorientaScore !== undefined && school.xkorientaScore < filterScoreMin) return false

      return true
    })
  }, [
    schools,
    query,
    selectedCountry,
    selectedCity,
    selectedLevel,
    filterType,
    filterSpecialty,
    filterAccreditation,
    filterModality,
    filterLanguage,
    filterCostRange,
    filterScoreMin,
  ])

  const toggleShortlist = (id: string) => {
    setShortlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleComparison = (id: string) => {
    setComparison((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const resetFilters = () => {
    setQuery("")
    setSelectedCountry("")
    setSelectedCity("")
    setSelectedLevel("")
    setFilterType("")
    setFilterSpecialty("")
    setFilterAccreditation("")
    setFilterModality("")
    setFilterLanguage("")
    setFilterCostRange([0, 3000000])
    setFilterScoreMin(0)
  }

  return (
    <div className="space-y-6">
      {/* ZONE 1 - BARRE DE RECHERCHE PRINCIPALE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Champ texte libre avec autocomplete */}
          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher un établissement
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nom, spécialité, ville..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none text-sm"
              />
            </div>
          </div>

          {/* Localisation - Pays */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pays</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedCity("")
                }}
                className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none text-sm appearance-none"
              >
                <option value="">Tous les pays</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Localisation - Ville */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ville</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedCountry}
                className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none text-sm appearance-none disabled:opacity-50"
              >
                <option value="">Toutes les villes</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Niveau académique */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Niveau</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none text-sm appearance-none"
              >
                <option value="">Tous les niveaux</option>
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Bouton Filtres */}
          <div className="md:col-span-1 flex items-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary text-white font-semibold text-sm hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden lg:inline">Filtres</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ZONE 2 - FILTRES AVANCÉS (Panneau latéral) */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Filtres avancés</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Type d'établissement */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Type d&apos;établissement
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-secondary outline-none"
                  >
                    <option value="">Tous les types</option>
                    <option value="HIGHER_ED">Enseignement supérieur</option>
                    <option value="TRAINING_CENTER">Centre de formation</option>
                    <option value="SECONDARY">Secondaire</option>
                  </select>
                </div>

                {/* Domaine / Spécialité */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Domaine / Spécialité
                  </label>
                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-secondary outline-none"
                  >
                    <option value="">Toutes les spécialités</option>
                    {specialties.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Accréditation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Accréditation
                  </label>
                  <select
                    value={filterAccreditation}
                    onChange={(e) => setFilterAccreditation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-secondary outline-none"
                  >
                    <option value="">Toutes les accréditations</option>
                    {accreditations.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Coût (slider) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Coût annuel (FCFA)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="3000000"
                      step="50000"
                      value={filterCostRange[1]}
                      onChange={(e) => setFilterCostRange([0, parseInt(e.target.value)])}
                      className="w-full accent-secondary"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 FCFA</span>
                      <span className="font-semibold text-secondary">
                        {formatNumber(filterCostRange[1])} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modalité */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Modalité
                  </label>
                  <select
                    value={filterModality}
                    onChange={(e) => setFilterModality(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-secondary outline-none"
                  >
                    <option value="">Toutes les modalités</option>
                    <option value="PRESENTIEL">Présentiel</option>
                    <option value="HYBRIDE">Hybride</option>
                    <option value="DISTANCE">Distance</option>
                  </select>
                </div>

                {/* Langue */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Langue</label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-secondary outline-none"
                  >
                    <option value="">Toutes les langues</option>
                    {languages.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Score Xkorienta (slider) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Score Xkorienta minimum
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={filterScoreMin}
                      onChange={(e) => setFilterScoreMin(parseInt(e.target.value))}
                      className="w-full accent-secondary"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span className="font-semibold text-secondary">{filterScoreMin}</span>
                    </div>
                  </div>
                </div>

                {/* Bouton Reset */}
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ZONE 3 - LISTE DES RÉSULTATS */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> établissement
              {filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
            </p>
            {(shortlist.length > 0 || comparison.length > 0) && (
              <div className="flex gap-3 text-sm">
                {shortlist.length > 0 && (
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-secondary">{shortlist.length}</span> en shortlist
                  </span>
                )}
                {comparison.length > 0 && (
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-primary">{comparison.length}</span> à comparer
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((school) => (
              <SchoolCard
                key={school._id}
                school={school}
                isInShortlist={shortlist.includes(school._id)}
                isInComparison={comparison.includes(school._id)}
                onToggleShortlist={() => toggleShortlist(school._id)}
                onToggleComparison={() => toggleComparison(school._id)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
              <SchoolIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                Aucun établissement trouvé
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bouton flottant pour ouvrir le comparateur */}
      {comparison.length >= 2 && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105 font-semibold"
          >
            <GitCompare className="h-5 w-5" />
            <span>Comparer {comparison.length} établissements</span>
          </button>
        </div>
      )}

      {/* Modal de comparaison */}
      {showComparison && comparison.length >= 2 && (
        <ComparisonModal
          schools={schools.filter((s) => comparison.includes(s._id)).slice(0, 3)}
          onClose={() => setShowComparison(false)}
          onRemove={(id) => setComparison((prev) => prev.filter((x) => x !== id))}
        />
      )}
    </div>
  )
}

// Composant Carte École (max 7 infos visibles)
function SchoolCard({
  school,
  isInShortlist,
  isInComparison,
  onToggleShortlist,
  onToggleComparison,
}: {
  school: OrientationSchoolDTO
  isInShortlist: boolean
  isInComparison: boolean
  onToggleShortlist: () => void
  onToggleComparison: () => void
}) {
  const router = useRouter()
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-secondary/40 hover:shadow-xl transition-all overflow-hidden group">
      {/* Header avec logo et nom */}
      <div className="p-5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-200 dark:border-gray-600">
            {school.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={school.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <SchoolIcon className="h-7 w-7 text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2">
              {school.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              <span>
                {school.city}, {school.country}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body avec informations clés (max 7 infos) */}
      <div className="p-5 space-y-3">
        {/* 1. Filières clés (max 3) */}
        <div className="flex flex-wrap gap-1.5">
          {school.specialties?.slice(0, 3).map((spec, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md font-medium"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* 2. Score Xkorienta */}
        {school.xkorientaScore !== undefined && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Score Xkorienta</span>
              <span className="font-bold text-secondary">{school.xkorientaScore}/100</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-primary transition-all"
                style={{ width: `${school.xkorientaScore}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. Modalité */}
        {school.modality && (
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{school.modality}</span>
          </div>
        )}

        {/* 4. Coût */}
        {school.tuitionFee && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {school.tuitionFee.min.toLocaleString()} - {school.tuitionFee.max.toLocaleString()} FCFA
            </span>
          </div>
        )}

        {/* 5-7. Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {school.badges?.employment && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium border border-green-200 dark:border-green-800">
              <Briefcase className="h-3 w-3" />
              <span>Emploi</span>
            </div>
          )}
          {school.badges?.alternance && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800">
              <Star className="h-3 w-3" />
              <span>Alternance</span>
            </div>
          )}
          {school.accreditation && school.accreditation.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-800">
              <Award className="h-3 w-3" />
              <span>{school.accreditation[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer avec CTAs */}
      <div className="p-4 pt-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onToggleShortlist}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isInShortlist
                ? "bg-secondary text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-secondary"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Shortlist</span>
          </button>
          <button
            onClick={onToggleComparison}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isInComparison
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-primary"
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Comparer</span>
          </button>
          <button 
            onClick={() => router.push(`/student/orientation/${school._id}`)}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Détails</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant Modal de Comparaison
function ComparisonModal({
  schools,
  onClose,
  onRemove,
}: {
  schools: OrientationSchoolDTO[]
  onClose: () => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Comparer les Établissements</h2>
            <p className="text-white/80 text-sm">
              Comparaison détaillée de {schools.length} établissement{schools.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenu du comparateur */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: `200px repeat(${schools.length}, 1fr)` }}>
            {/* Colonne des critères */}
            <div className="space-y-2 sticky left-0 bg-white dark:bg-gray-800 z-10">
              <div className="h-32"></div> {/* Espace pour les logos */}
              <ComparisonRow label="Détails" />
              <ComparisonRow label="Diplômes" />
              <ComparisonRow label="Durée" />
              <ComparisonRow label="Coût" />
              <ComparisonRow label="Employabilité" />
              <ComparisonRow label="Partenariats" />
              <ComparisonRow label="Reconnaissance" />
              <ComparisonRow label="Score Xkorienta" />
              <ComparisonRow label="Étudiants" />
              <ComparisonRow label="Année création" />
            </div>

            {/* Colonnes des écoles */}
            {schools.map((school) => (
              <div key={school._id} className="space-y-2">
                {/* Logo et nom de l'école */}
                <div className="h-32 flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl relative">
                  <button
                    onClick={() => onRemove(school._id)}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-2 overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                    {school.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={school.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <SchoolIcon className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-center line-clamp-2">{school.name}</h3>
                </div>

                {/* Détails */}
                <ComparisonCell>
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>
                      {school.city}, {school.country}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{school.modality}</p>
                </ComparisonCell>

                {/* Diplômes */}
                <ComparisonCell>
                  <div className="space-y-1">
                    {school.degrees?.slice(0, 3).map((deg, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded mr-1"
                      >
                        {deg}
                      </span>
                    ))}
                  </div>
                </ComparisonCell>

                {/* Durée */}
                <ComparisonCell>
                  <p className="font-semibold">
                    {school.duration?.min} - {school.duration?.max} {school.duration?.unit}
                  </p>
                </ComparisonCell>

                {/* Coût */}
                <ComparisonCell>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Min: {school.tuitionFee?.min ? formatNumber(school.tuitionFee.min) : "0"} FCFA</p>
                    <p className="text-xs text-gray-500">Max: {school.tuitionFee?.max ? formatNumber(school.tuitionFee.max) : "0"} FCFA</p>
                  </div>
                </ComparisonCell>

                {/* Employabilité */}
                <ComparisonCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">{school.employability}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        style={{ width: `${school.employability}%` }}
                      />
                    </div>
                  </div>
                </ComparisonCell>

                {/* Partenariats */}
                <ComparisonCell>
                  <div className="space-y-1">
                    {school.partnerships?.slice(0, 3).map((p, i) => (
                      <p key={i} className="text-xs text-gray-600 dark:text-gray-400">
                        • {p}
                      </p>
                    ))}
                    {school.partnerships && school.partnerships.length > 3 && (
                      <p className="text-xs text-gray-400">+{school.partnerships.length - 3} autres</p>
                    )}
                  </div>
                </ComparisonCell>

                {/* Reconnaissance */}
                <ComparisonCell>
                  <div className="flex flex-wrap gap-1">
                    {school.recognition?.slice(0, 3).map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-xs"
                      >
                        <Award className="h-3 w-3" />
                        {r}
                      </span>
                    ))}
                  </div>
                </ComparisonCell>

                {/* Score Xkorienta */}
                <ComparisonCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-secondary text-lg">{school.xkorientaScore}/100</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-secondary to-primary"
                        style={{ width: `${school.xkorientaScore}%` }}
                      />
                    </div>
                  </div>
                </ComparisonCell>

                {/* Nombre d'étudiants */}
                <ComparisonCell>
                  <p className="font-semibold">{school.studentCount ? formatNumber(school.studentCount) : "0"} étudiants</p>
                </ComparisonCell>

                {/* Année de création */}
                <ComparisonCell>
                  <p className="font-semibold">{school.foundedYear}</p>
                </ComparisonCell>
              </div>
            ))}
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous comparez {schools.length} établissement{schools.length > 1 ? "s" : ""} sur 3 maximum
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Fermer
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg transition-all">
                Exporter la comparaison
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant ligne de critère
function ComparisonRow({ label }: { label: string }) {
  return (
    <div className="h-20 flex items-center">
      <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">{label}</p>
    </div>
  )
}

// Composant cellule de comparaison
function ComparisonCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-20 flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className="w-full">{children}</div>
    </div>
  )
}
