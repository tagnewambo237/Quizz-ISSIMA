"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserRole } from "@/models/enums"
import { StepRoleSelection } from "./StepRoleSelection"
import { StepSchoolContext } from "./StepSchoolContext"
import { StepProfileDetails } from "./StepProfileDetails"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export type RegistrationData = {
    // Basic Info
    name: string
    email: string
    password: string

    // Role
    role: UserRole

    // School Context
    schoolId?: string
    classId?: string // For students
    newSchoolData?: {
        name: string
        type: string
        address: string
    } // For teachers creating a school

    // Profile Details
    levelId?: string
    fieldId?: string
    subjects?: string[]
    // ... other profile fields
}

export function RegistrationWizard() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<Partial<RegistrationData>>({})

    const updateData = (newData: Partial<RegistrationData>) => {
        setData(prev => ({ ...prev, ...newData }))
    }

    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/register/v2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || "Registration failed")
            }

            // Auto-login
            const { signIn } = await import("next-auth/react")
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            if (result?.error) {
                throw new Error("Login failed")
            }

            router.push("/dashboard")
        } catch (error) {
            console.error(error)
            alert("Registration failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
                {/* Progress Bar */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 -z-10" />
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s
                                    ? "bg-secondary text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                }`}
                        >
                            {s}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {step === 1 && (
                            <StepRoleSelection
                                data={data}
                                updateData={updateData}
                                onNext={nextStep}
                            />
                        )}
                        {step === 2 && (
                            <StepSchoolContext
                                data={data}
                                updateData={updateData}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {step === 3 && (
                            <StepProfileDetails
                                data={data}
                                updateData={updateData}
                                onSubmit={handleSubmit}
                                onBack={prevStep}
                                loading={loading}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
