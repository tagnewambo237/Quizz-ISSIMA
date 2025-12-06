import { useState } from "react";
import { Mail, User, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export function InviteManual() {
    const params = useParams();
    const classId = params.classId as string;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch(`/api/classes/${classId}/invitations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "INDIVIDUAL",
                    name: formData.name,
                    email: formData.email
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Invitation envoyée à ${formData.email}`);
                setSuccess(true);
                setFormData({ name: "", email: "" });
                // Reset success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000);
            } else {
                toast.error(data.error || "Une erreur est survenue");
            }
        } catch (error) {
            console.error("Invite error", error);
            toast.error("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                <p>
                    L'élève recevra un email contenant ses identifiants temporaires et un lien d'activation.
                    Il sera automatiquement ajouté à la classe dès sa première connexion.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom complet de l'élève
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Jean Dupont"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Adresse Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            required
                            placeholder="Ex: jean.dupont@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all ${success
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-secondary hover:bg-secondary/90"
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : success ? (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                Envoyé avec succès !
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Envoyer l'invitation
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
