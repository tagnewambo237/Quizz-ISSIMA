"use client"

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Loader2, Download, FileText, Shield, ShieldAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
    sanitizeCell,
    sanitizeName,
    sanitizeEmail,
    validateFileBasic,
    validateRowCount,
    SECURITY_LIMITS,
    logSecurityEvent
} from "@/lib/security/fileUploadSecurity";

interface ParsedStudent {
    name: string;
    email: string;
    valid: boolean;
    error?: string;
    securityWarning?: boolean;
}

export function InviteImport() {
    const params = useParams();
    const classId = params.classId as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [securityWarnings, setSecurityWarnings] = useState<number>(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Security: Validate file before processing
            const validation = validateFileBasic(selectedFile);
            if (!validation.valid) {
                setErrors([validation.error || 'Fichier invalide']);
                logSecurityEvent({ type: 'INVALID_FILE', details: validation.error || 'Unknown' });
                return;
            }

            setFile(selectedFile);
            setErrors([]);
            setSecurityWarnings(0);
            parseFile(selectedFile);
        }
    };

    const parseCSV = (content: string): any[] => {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';
        const headers = lines[0].split(delimiter).map(h => sanitizeCell(h.toLowerCase().replace(/"/g, '')));

        return lines.slice(1).map(line => {
            const values = line.split(delimiter).map(v => sanitizeCell(v.replace(/"/g, '')));
            const row: any = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
            });
            return row;
        });
    };

    const parseFile = async (file: File) => {
        setAnalyzing(true);
        let warningCount = 0;

        try {
            const isCSV = file.name.endsWith('.csv');
            let jsonData: any[] = [];

            if (isCSV) {
                const text = await file.text();
                jsonData = parseCSV(text);
            } else {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, {
                    type: 'array',
                    // Security: Disable formula parsing
                    cellFormula: false,
                    cellHTML: false,
                    cellStyles: false
                });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
            }

            // Security: Validate row count
            const rowValidation = validateRowCount(jsonData.length);
            if (!rowValidation.valid) {
                setErrors([rowValidation.error || 'Trop de lignes']);
                setParsedData([]);
                return;
            }

            const normalizedData: ParsedStudent[] = jsonData.map((row: any) => {
                const keys = Object.keys(row);
                const nameKey = keys.find(k =>
                    k.toLowerCase().includes('nom') ||
                    k.toLowerCase().includes('name') ||
                    k.toLowerCase() === 'prenom' ||
                    k.toLowerCase() === 'prénom'
                );
                const emailKey = keys.find(k =>
                    k.toLowerCase().includes('email') ||
                    k.toLowerCase().includes('mail') ||
                    k.toLowerCase().includes('courriel')
                );

                // Security: Sanitize all cell values
                const rawName = nameKey ? sanitizeCell(row[nameKey]) : '';
                const rawEmail = emailKey ? sanitizeCell(row[emailKey]) : '';

                // Security: Validate and sanitize name
                const nameResult = sanitizeName(rawName);
                const emailResult = sanitizeEmail(rawEmail);

                // Detect if original had dangerous content
                const hadDangerousContent = Boolean(
                    (nameKey && row[nameKey] !== rawName) ||
                    (emailKey && row[emailKey] !== rawEmail)
                );

                if (hadDangerousContent) {
                    warningCount++;
                }

                const valid = nameResult.valid && emailResult.valid;
                const error = !nameResult.valid ? nameResult.error : (!emailResult.valid ? emailResult.error : undefined);

                return {
                    name: nameResult.valid ? nameResult.value : rawName,
                    email: emailResult.valid ? emailResult.value : rawEmail,
                    valid,
                    error,
                    securityWarning: hadDangerousContent
                };
            });

            const validData = normalizedData.filter(item => item.name && item.email);

            if (validData.length === 0) {
                setErrors(["Aucune donnée valide trouvée. Assurez-vous d'avoir des colonnes 'Nom' et 'Email'."]);
            } else {
                setParsedData(validData);
                setSecurityWarnings(warningCount);

                if (warningCount > 0) {
                    logSecurityEvent({
                        type: 'FORMULA_INJECTION',
                        details: `${warningCount} cells sanitized from potential formula injection`
                    });
                }
            }

        } catch (error) {
            console.error("Error parsing file", error);
            setErrors(["Erreur lors de la lecture du fichier."]);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        const validStudents = parsedData.filter(s => s.valid);
        if (validStudents.length === 0) return;

        setLoading(true);

        try {
            const res = await fetch(`/api/classes/${classId}/invitations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "BATCH",
                    students: validStudents.map(s => ({ name: s.name, email: s.email })),
                    fileInfo: file ? {
                        fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
                        fileType: file.name.endsWith('.csv') ? 'CSV' : 'XLSX',
                        fileSize: file.size
                    } : undefined
                })
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(`${result.invited + result.enrolled} élèves traités avec succès`);
                if (result.errors > 0) {
                    toast.warning(`${result.errors} erreurs rencontrées`);
                }
                setFile(null);
                setParsedData([]);
                setSecurityWarnings(0);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                toast.error(result.error || "Erreur lors de l'import");
            }
        } catch (error) {
            console.error("Import error", error);
            toast.error("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = (format: 'csv' | 'xlsx') => {
        const templateData = [
            { Nom: 'Jean Dupont', Email: 'jean.dupont@example.com' },
            { Nom: 'Marie Martin', Email: 'marie.martin@example.com' }
        ];

        if (format === 'csv') {
            const csv = 'Nom,Email\n' + templateData.map(r => `${r.Nom},${r.Email}`).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'template_eleves.csv';
            link.click();
        } else {
            const ws = XLSX.utils.json_to_sheet(templateData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Élèves');
            XLSX.writeFile(wb, 'template_eleves.xlsx');
        }
        toast.success(`Template ${format.toUpperCase()} téléchargé`);
    };

    const validCount = parsedData.filter(s => s.valid).length;
    const invalidCount = parsedData.filter(s => !s.valid).length;

    return (
        <div className="space-y-6">
            {/* Instructions and templates */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-sm text-green-700 dark:text-green-300">
                <p className="font-semibold mb-2">Format attendu :</p>
                <p className="mb-3">Un fichier Excel (.xlsx) ou CSV contenant deux colonnes : <strong>Nom</strong> et <strong>Email</strong>.</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => downloadTemplate('xlsx')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Template Excel
                    </button>
                    <button
                        onClick={() => downloadTemplate('csv')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FileText className="h-4 w-4" />
                        Template CSV
                    </button>
                </div>
            </div>

            {/* Security limits info */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="h-3.5 w-3.5" />
                <span>Max {SECURITY_LIMITS.MAX_ROWS} lignes • Max {SECURITY_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB</span>
            </div>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-secondary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-center"
                >
                    <Upload className="h-10 w-10 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cliquez pour importer un fichier</h3>
                    <p className="text-sm text-gray-500 mt-1">Fichiers Excel (.xlsx) ou CSV supportés</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                                {file.name.endsWith('.csv') ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB •
                                    <span className="text-green-600"> {validCount} valides</span>
                                    {invalidCount > 0 && <span className="text-red-500"> • {invalidCount} invalides</span>}
                                    {securityWarnings > 0 && (
                                        <span className="text-yellow-600"> • {securityWarnings} nettoyés</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setFile(null);
                                setParsedData([]);
                                setErrors([]);
                                setSecurityWarnings(0);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Security warning banner */}
                    {securityWarnings > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30 flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                            <ShieldAlert className="h-4 w-4" />
                            <span>{securityWarnings} cellule(s) contenaient du contenu potentiellement dangereux et ont été nettoyées.</span>
                        </div>
                    )}

                    {analyzing ? (
                        <div className="p-8 flex justify-center text-gray-500">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="p-0">
                            {errors.length > 0 ? (
                                <div className="p-6 text-center text-red-500">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                    <p>{errors[0]}</p>
                                </div>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3">Nom</th>
                                                <th className="px-6 py-3">Email</th>
                                                <th className="px-6 py-3 w-24">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {parsedData.map((student, idx) => (
                                                <tr key={idx} className={`${student.valid ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'bg-red-50/50 dark:bg-red-900/10'}`}>
                                                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                                        {student.name || '-'}
                                                        {student.securityWarning && (
                                                            <ShieldAlert className="inline-block h-3 w-3 ml-1 text-yellow-500" />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{student.email || '-'}</td>
                                                    <td className="px-6 py-3">
                                                        {student.valid ? (
                                                            <span className="text-green-600 flex items-center gap-1">
                                                                <Check className="h-4 w-4" />
                                                            </span>
                                                        ) : (
                                                            <span className="text-red-500 text-xs">{student.error}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || validCount === 0}
                            className="px-6 py-2 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Importer {validCount} élèves
                        </button>
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
