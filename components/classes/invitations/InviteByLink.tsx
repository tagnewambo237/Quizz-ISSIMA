"use client"

import { useState, useEffect } from "react";
import { Copy, Link as LinkIcon, Check, RefreshCw, Loader2, QrCode, Settings2, Clock, Users, Download } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import QRCodeLib from "qrcode";

interface InvitationData {
    _id: string;
    token: string;
    expiresAt?: string;
    maxUses?: number;
    currentUses: number;
    status: string;
}

export function InviteByLink() {
    const params = useParams();
    const classId = params.classId as string;

    const [inviteUrl, setInviteUrl] = useState<string>("");
    const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    // Options for new link
    const [options, setOptions] = useState({
        expiresIn: '30d' as '24h' | '7d' | '30d' | 'never',
        maxUses: null as number | null,
        description: ''
    });

    const fetchLink = async (forceNew = false, createOptions?: typeof options) => {
        setLoading(true);
        try {
            const endpoint = `/api/classes/${classId}/invitations`;
            let fetchOptions: RequestInit;

            if (forceNew) {
                fetchOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'LINK',
                        options: createOptions || options
                    })
                };
            } else {
                fetchOptions = { method: 'GET' };
            }

            const res = await fetch(endpoint, fetchOptions);
            const data = await res.json();

            if (data.url) {
                setInviteUrl(data.url);
                setInvitationData(data.invitation);
                generateQRCode(data.url);
            }
        } catch (error) {
            console.error("Failed to fetch invitation link", error);
            toast.error("Impossible de récupérer le lien d'invitation");
        } finally {
            setLoading(false);
        }
    };

    const generateQRCode = async (url: string) => {
        try {
            const qrDataUrl = await QRCodeLib.toDataURL(url, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#1f2937',
                    light: '#ffffff'
                }
            });
            setQrCodeUrl(qrDataUrl);
        } catch (error) {
            console.error("Failed to generate QR code", error);
        }
    };

    const downloadQRCode = () => {
        if (!qrCodeUrl) return;
        const link = document.createElement('a');
        link.download = 'invitation-qrcode.png';
        link.href = qrCodeUrl;
        link.click();
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

    const handleGenerateNew = () => {
        setShowOptions(false);
        fetchLink(true, options);
        toast.success("Nouveau lien généré !");
    };

    const formatExpiry = (expiresAt?: string) => {
        if (!expiresAt) return "Jamais";
        const date = new Date(expiresAt);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                <p>
                    Le lien d'invitation permet aux élèves de rejoindre la classe instantanément.
                    Partagez ce lien avec vos élèves (par email, WhatsApp, etc.).
                </p>
            </div>

            {/* Current invitation stats */}
            {invitationData && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                            <Clock className="h-3 w-3" />
                            Expire le
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatExpiry(invitationData.expiresAt)}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                            <Users className="h-3 w-3" />
                            Utilisations
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {invitationData.currentUses}
                            {invitationData.maxUses ? ` / ${invitationData.maxUses}` : ' (illimité)'}
                        </p>
                    </div>
                </div>
            )}

            {/* Link input and copy */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lien d'invitation
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 focus:outline-none text-sm"
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

            {/* QR Code */}
            {qrCodeUrl && (
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl">
                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 rounded-lg" />
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">QR Code</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Les élèves peuvent scanner ce code pour rejoindre la classe
                        </p>
                        <button
                            onClick={downloadQRCode}
                            className="text-sm text-secondary hover:text-secondary/80 font-medium flex items-center gap-1.5"
                        >
                            <Download className="h-4 w-4" />
                            Télécharger
                        </button>
                    </div>
                </div>
            )}

            {/* Options panel */}
            {showOptions && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-4 border border-gray-100 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        Options du nouveau lien
                    </h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Expiration
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: '24h', label: '24 heures' },
                                { value: '7d', label: '7 jours' },
                                { value: '30d', label: '30 jours' },
                                { value: 'never', label: 'Jamais' }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setOptions({ ...options, expiresIn: opt.value as any })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${options.expiresIn === opt.value
                                            ? 'bg-secondary text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre maximum d'utilisations
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                placeholder="Illimité"
                                value={options.maxUses || ''}
                                onChange={(e) => setOptions({
                                    ...options,
                                    maxUses: e.target.value ? parseInt(e.target.value) : null
                                })}
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 outline-none"
                            />
                            <button
                                onClick={handleGenerateNew}
                                className="px-4 py-2 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-colors"
                            >
                                Générer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center">
                <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1.5 transition-colors"
                >
                    <Settings2 className="h-3.5 w-3.5" />
                    {showOptions ? 'Masquer les options' : 'Options avancées'}
                </button>
                <button
                    onClick={() => fetchLink(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1.5 transition-colors"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Régénérer le lien
                </button>
            </div>
        </div>
    );
}
