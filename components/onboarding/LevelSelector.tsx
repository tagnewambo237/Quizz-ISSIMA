"use client"

import { Cycle } from "@/models/enums"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface LevelSelectorProps {
    subSystem: string
    selectedCycle: string | null
    selectedLevel: string | null
    onSelectCycle: (cycle: string) => void
    onSelectLevel: (level: string) => void
}

// Données simulées (à remplacer par API plus tard)
const LEVELS: Record<string, string[]> = {
    [Cycle.COLLEGE]: ['6ème', '5ème', '4ème', '3ème'],
    [Cycle.LYCEE]: ['2nde', '1ère', 'Tle'],
    [Cycle.LICENCE]: ['L1', 'L2', 'L3'],
    [Cycle.MASTER]: ['M1', 'M2']
}

export default function LevelSelector({
    subSystem,
    selectedCycle,
    selectedLevel,
    onSelectCycle,
    onSelectLevel
}: LevelSelectorProps) {

    return (
        <div className="space-y-8">
            {/* Cycle Selection */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Select Cycle
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {Object.values(Cycle).map((cycle) => (
                        <button
                            key={cycle}
                            onClick={() => onSelectCycle(cycle)}
                            className={cn(
                                "p-4 rounded-xl border-2 text-center transition-all",
                                selectedCycle === cycle
                                    ? "border-secondary bg-secondary/5 text-secondary font-bold"
                                    : "border-gray-200 dark:border-gray-700 hover:border-secondary/30 text-gray-600 dark:text-gray-300"
                            )}
                        >
                            {cycle.charAt(0) + cycle.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Level Selection */}
            {selectedCycle && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Select Level
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {LEVELS[selectedCycle]?.map((level) => (
                            <button
                                key={level}
                                onClick={() => onSelectLevel(level)}
                                className={cn(
                                    "p-3 rounded-lg border text-center transition-all",
                                    selectedLevel === level
                                        ? "border-secondary bg-secondary/10 text-secondary font-bold ring-1 ring-secondary/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-300"
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
