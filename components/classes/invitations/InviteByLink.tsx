import { useState, useEffect } from "react";
import { Copy, Link as LinkIcon, Check, RefreshCw, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export function InviteByLink() {
    const params = useParams();
    const classId = params.classId as string;

    const [inviteUrl, setInviteUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchLink = async (forceNew = false) => {
        setLoading(true);
        try {
            const endpoint = `/api/classes/${classId}/invitations`;
            const options = forceNew ? {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'LINK' })
            } : { method: 'GET' };

            const res = await fetch(endpoint, options);
            const data = await res.json();

            if (data.url) {
                setInviteUrl(data.url);
            }
        } catch (error) {
            console.error("Failed to fetch invitation link", error);
            toast.error("Impossible de récupérer le lien d'invitation");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (classId) {
            fetchLink();
        }
    }, [classId]);

    const handleCopy = () => {
        if (!inviteUrl) return;
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        toast.success("Lien copié !");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                <p>
                    Le lien d'invitation permet aux élèves de rejoindre la classe instantanément.
                    Partagez ce lien avec vos élèves (par email, WhatsApp, etc.).
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lien d'invitation unique
                </label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LinkIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            readOnly
                            value={loading ? "Chargement..." : inviteUrl}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleCopy}
                        disabled={loading || !inviteUrl}
                        className="px-4 py-2 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-colors flex items-center gap-2 min-w-[100px] justify-center"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copié" : "Copier"}
                    </button>
                </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-end">
                <button
                    onClick={() => fetchLink(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1.5 transition-colors"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Générer un nouveau lien
                </button>
            </div>
        </div>
    );
}
