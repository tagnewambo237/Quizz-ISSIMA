"use client"

import { RegistrationWizard } from "@/components/registration/RegistrationWizard"
import { motion } from "framer-motion"

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Créer un compte
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Rejoignez la communauté QuizLock
                    </p>
                </div>

                <RegistrationWizard />
            </motion.div>
        </div>
    )
}
