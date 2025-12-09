import { useState } from "react"
import { UserRole } from "@/models/enums"
import { Loader2, Eye, EyeOff } from "lucide-react"

interface StepProfileDetailsProps {
    data: any
    updateData: (data: any) => void
    onSubmit: () => void
    onBack: () => void
    loading: boolean
}

export function StepProfileDetails({ data, updateData, onSubmit, onBack, loading }: StepProfileDetailsProps) {
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        updateData({ [e.target.name]: e.target.value })
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Finalisons votre inscription
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Entrez vos informations personnelles pour créer votre compte.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nom complet</label>
                    <input
                        name="name"
                        value={data.name || ""}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none"
                        placeholder="Jean Dupont"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={data.email || ""}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none"
                        placeholder="jean@exemple.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Mot de passe</label>
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={data.password || ""}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-secondary outline-none"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Additional fields based on Role can be added here */}
                {/* For now, we keep it simple as the core requirements are School/Class context */}
            </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
                >
                    Retour
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!data.name || !data.email || !data.password || loading}
                    className="px-8 py-3 bg-secondary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors flex items-center gap-2"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Créer mon compte
                </button>
            </div>
        </div>
    )
}
