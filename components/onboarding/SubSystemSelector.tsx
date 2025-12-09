"use client"

import { SubSystem } from "@/models/enums"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SubSystemSelectorProps {
    selected: SubSystem | null
    onSelect: (system: SubSystem) => void
}

export default function SubSystemSelector({ selected, onSelect }: SubSystemSelectorProps) {
    const systems = [
        {
            value: SubSystem.FRANCOPHONE,
            label: "Système Francophone",
            description: "Enseignement en français (Collège, Lycée...)"
        },
        {
            value: SubSystem.ANGLOPHONE,
            label: "Anglophone System",
            description: "Education in English (Form 1-5, Lower/Upper 6)"
        },
        {
            value: SubSystem.BILINGUAL,
            label: "Système Bilingue / Bilingual",
            description: "Programme mixte / Mixed curriculum"
        }
    ]

    return (
        <div className="grid gap-4">
            {systems.map((system) => (
                <motion.button
                    key={system.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(system.value)}
                    className={cn(
                        "p-6 rounded-xl border-2 text-left transition-all",
                        selected === system.value
                            ? "border-secondary bg-secondary/5 ring-1 ring-secondary/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-secondary/30"
                    )}
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {system.label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {system.description}
                    </p>
                </motion.button>
            ))}
        </div>
    )
}
