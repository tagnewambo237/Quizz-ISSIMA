import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function InviteImport() {
    const params = useParams();
    const classId = params.classId as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setErrors([]);
            parseFile(selectedFile);
        }
    };

    const parseFile = async (file: File) => {
        setAnalyzing(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Normalize keys and validate
            const normalizedData = jsonData.map((row: any) => {
                // Try to find Name and Email columns specifically
                // Or map by position if keys are generic
                const keys = Object.keys(row);
                // Simple heuristic: check for "nom", "name" and "email", "mail"
                const nameKey = keys.find(k => k.toLowerCase().includes('nom') || k.toLowerCase().includes('name'));
                const emailKey = keys.find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mail'));

                return {
                    name: nameKey ? row[nameKey] : null,
                    email: emailKey ? row[emailKey] : null
                };
            }).filter(item => item.name && item.email);

            if (normalizedData.length === 0) {
                setErrors(["Aucune donnée valide trouvée. Assurez-vous d'avoir des colonnes 'Nom' et 'Email'."]);
            } else {
                setParsedData(normalizedData);
            }

        } catch (error) {
            console.error("Error parsing Excel", error);
            setErrors(["Erreur lors de la lecture du fichier."]);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        if (parsedData.length === 0) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/classes/${classId}/invitations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "BATCH",
                    students: parsedData
                })
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(`${result.invited + result.enrolled} élèves traités avec succès`);
                setFile(null);
                setParsedData([]);
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

    return (
        <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-sm text-green-700 dark:text-green-300">
                <p className="font-semibold mb-1">Format attendu :</p>
                <p>Un fichier Excel (.xlsx) contenant au moins deux colonnes : <strong>Nom</strong> et <strong>Email</strong>.</p>
            </div>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-secondary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-center"
                >
                    <Upload className="h-10 w-10 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cliquez pour importer un fichier</h3>
                    <p className="text-sm text-gray-500 mt-1">ou glissez-déposez votre fichier Excel ici</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB • {parsedData.length} élèves détectés
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setFile(null);
                                setParsedData([]);
                                setErrors([]);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>

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
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {parsedData.map((student, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{student.name}</td>
                                                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{student.email}</td>
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
                            disabled={loading || parsedData.length === 0}
                            className="px-6 py-2 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Importer {parsedData.length} élèves
                        </button>
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
