"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface FieldSelectorProps {
    level: string
    selectedField: string | null
    onSelect: (field: string) => void
}

// Données simulées
const FIELDS: Record<string, string[]> = {
    '2nde': ['A', 'C'],
    '1ère': ['A', 'C', 'D', 'TI', 'E'],
    'Tle': ['A', 'C', 'D', 'TI', 'E'],
    'L1': ['Informatique', 'Mathématiques', 'Physique', 'Biologie', 'Chimie', 'Droit', 'Économie'],
    'L2': ['Génie Logiciel', 'Réseaux', 'Mathématiques Fondamentales', 'Physique Appliquée'],
    'L3': ['Génie Logiciel', 'Sécurité', 'Data Science', 'Intelligence Artificielle'],
}

export default function FieldSelector({ level, selectedField, onSelect }: FieldSelectorProps) {
    const fields = FIELDS[level] || []

    if (fields.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No specific fields for this level. You can proceed.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fields.map((field) => (
                <motion.button
                    key={field}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(field)}
                    className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all",
                        selectedField === field
                            ? "border-secondary bg-secondary/5 text-secondary font-bold ring-1 ring-secondary/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-secondary/30 text-gray-600 dark:text-gray-300"
                    )}
                >
                    {field}
                </motion.button>
            ))}
        </div>
    )
}
