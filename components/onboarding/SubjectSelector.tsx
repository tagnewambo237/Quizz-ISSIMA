"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

interface SubjectSelectorProps {
    selectedSubjects: string[]
    onToggle: (subject: string) => void
}

const SUBJECTS = [
    'Mathématiques', 'Physique', 'Chimie', 'SVT',
    'Informatique', 'Anglais', 'Français', 'Histoire-Géo',
    'Philosophie', 'ECM', 'Allemand', 'Espagnol',
    'Littérature', 'Latin', 'Grec', 'Arts Plastiques'
]

export default function SubjectSelector({ selectedSubjects, onToggle }: SubjectSelectorProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {SUBJECTS.map((subject) => {
                const isSelected = selectedSubjects.includes(subject)

                return (
                    <motion.button
                        key={subject}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onToggle(subject)}
                        className={cn(
                            "p-3 rounded-lg border text-left transition-all flex justify-between items-center",
                            isSelected
                                ? "border-primary bg-primary/5 text-primary font-medium"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-300"
                        )}
                    >
                        <span className="truncate mr-2">{subject}</span>
                        {isSelected && (
                            <div className="bg-primary text-white rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                            </div>
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}
