import { UserRole } from "@/models/enums"
import { GraduationCap, School, Building2, Check } from "lucide-react"

interface StepRoleSelectionProps {
    data: any
    updateData: (data: any) => void
    onNext: () => void
}

export function StepRoleSelection({ data, updateData, onNext }: StepRoleSelectionProps) {
    const roles = [
        {
            id: UserRole.STUDENT,
            title: "Je suis un Apprenant",
            description: "Je veux accéder aux cours, quiz et suivre ma progression.",
            icon: GraduationCap
        },
        {
            id: UserRole.TEACHER,
            title: "Je suis un Enseignant",
            description: "Je veux créer des cours, des quiz et gérer mes classes.",
            icon: School
        },
        {
            id: UserRole.SCHOOL_ADMIN,
            title: "Je suis un Administrateur d'École",
            description: "Je gère un établissement partenaire et valide les enseignants.",
            icon: Building2
        }
    ]

    const handleSelect = (role: UserRole) => {
        updateData({ role })
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bienvenue sur QuizLock
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Pour commencer, dites-nous qui vous êtes.
                </p>
            </div>

            <div className="grid gap-4">
                {roles.map((role) => {
                    const Icon = role.icon
                    const isSelected = data.role === role.id

                    return (
                        <button
                            key={role.id}
                            onClick={() => handleSelect(role.id)}
                            className={`relative p-6 rounded-xl border-2 text-left transition-all ${isSelected
                                ? "border-secondary bg-secondary/5 ring-2 ring-secondary/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-secondary/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${isSelected ? "bg-secondary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                                    }`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {role.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        {role.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-6 right-6 text-secondary">
                                        <Check className="h-6 w-6" />
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={onNext}
                    disabled={!data.role}
                    className="px-8 py-3 bg-secondary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors"
                >
                    Continuer
                </button>
            </div>
        </div>
    )
}
