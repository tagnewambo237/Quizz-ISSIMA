"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Plus, Trash2, Save, Loader2, Image as ImageIcon, CheckCircle2, Circle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const optionSchema = z.object({
    text: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean().default(false),
})

const questionSchema = z.object({
    text: z.string().min(1, "Question text is required"),
    imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    points: z.coerce.number().min(1).default(1),
    options: z.array(optionSchema).min(2, "At least 2 options required"),
})

const examSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    closeMode: z.enum(["STRICT", "PERMISSIVE"]),
    questions: z.array(questionSchema).min(1, "At least 1 question required"),
})

type ExamFormValues = z.infer<typeof examSchema>

interface ExamFormProps {
    initialData?: any
}

export function ExamForm({ initialData }: ExamFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<ExamFormValues>({
        resolver: zodResolver(examSchema) as any,
        defaultValues: initialData ? {
            title: initialData.title,
            description: initialData.description || "",
            startTime: new Date(initialData.startTime).toISOString().slice(0, 16),
            endTime: new Date(initialData.endTime).toISOString().slice(0, 16),
            duration: initialData.duration,
            closeMode: initialData.closeMode,
            questions: initialData.questions.map((q: any) => ({
                text: q.text,
                imageUrl: q.imageUrl || "",
                points: q.points,
                options: q.options.map((o: any) => ({
                    text: o.text,
                    isCorrect: o.isCorrect
                }))
            }))
        } : {
            title: "",
            description: "",
            duration: 60,
            closeMode: "STRICT",
            questions: [
                {
                    text: "",
                    imageUrl: "",
                    points: 1,
                    options: [
                        { text: "", isCorrect: false },
                        { text: "", isCorrect: false },
                    ],
                },
            ],
        },
    })

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control: form.control,
        name: "questions",
    })

    const onSubmit = async (data: ExamFormValues) => {
        setLoading(true)
        try {
            const url = initialData ? `/api/exams/${initialData.id}` : "/api/exams"
            const method = initialData ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error("Failed to save exam")

            const result = await res.json()
            if (result.warning) {
                toast.warning(result.message)
            } else {
                toast.success(initialData ? "Exam updated successfully" : "Exam created successfully")
            }

            router.push("/teacher/exams")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 pb-20">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-100/50 dark:shadow-none space-y-6 md:space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {initialData ? "Edit Exam" : "Create Exam"}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {initialData ? "Update the details of your exam" : "Configure the basic settings for this exam"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Exam Title</label>
                        <input
                            {...form.register("title")}
                            className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Advanced Mathematics Midterm"
                        />
                        {form.formState.errors.title && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full" />
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                            {...form.register("description")}
                            className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[100px]"
                            placeholder="Instructions for students..."
                        />
                    </div>

                    <div className="col-span-1 lg:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Scheduling & Settings
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                                <input
                                    type="datetime-local"
                                    {...form.register("startTime")}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                                {form.formState.errors.startTime && (
                                    <p className="text-red-500 text-sm mt-2">{form.formState.errors.startTime.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                                <input
                                    type="datetime-local"
                                    {...form.register("endTime")}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                                {form.formState.errors.endTime && (
                                    <p className="text-red-500 text-sm mt-2">{form.formState.errors.endTime.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        {...form.register("duration")}
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                    <span className="absolute right-5 top-3.5 text-gray-400 text-sm">min</span>
                                </div>
                                {form.formState.errors.duration && (
                                    <p className="text-red-500 text-sm mt-2">{form.formState.errors.duration.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Close Mode</label>
                                <select
                                    {...form.register("closeMode")}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                                >
                                    <option value="STRICT">Strict (Hard close)</option>
                                    <option value="PERMISSIVE">Permissive (Allow late w/ code)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Questions</h2>
                    <button
                        type="button"
                        onClick={() => appendQuestion({ text: "", imageUrl: "", points: 1, options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] })}
                        className="group flex items-center gap-2 bg-white dark:bg-gray-800 text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-gray-700 border border-primary/20 dark:border-gray-700 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md font-medium"
                    >
                        <div className="bg-primary/10 dark:bg-primary/20 p-1 rounded-lg group-hover:scale-110 transition-transform">
                            <Plus className="h-4 w-4" />
                        </div>
                        Add Question
                    </button>
                </div>

                <div className="space-y-6">
                    {questionFields.map((field, index) => (
                        <QuestionItem
                            key={field.id}
                            index={index}
                            control={form.control}
                            register={form.register}
                            remove={() => removeQuestion(index)}
                            errors={form.formState.errors}
                            watch={form.watch}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => appendQuestion({ text: "", imageUrl: "", points: 1, options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] })}
                    className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-all flex items-center justify-center gap-2 font-medium hover:bg-primary/5 dark:hover:bg-primary/10"
                >
                    <Plus className="h-5 w-5" />
                    Add Another Question
                </button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 z-10">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/25"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {initialData ? "Save Changes" : "Create Exam"}
                </button>
            </div>
        </form>
    )
}

function QuestionItem({ index, control, register, remove, errors, watch }: any) {
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: `questions.${index}.options`,
    })

    const imageUrl = watch(`questions.${index}.imageUrl`)

    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-100/50 dark:shadow-none relative group transition-all hover:border-primary/30 dark:hover:border-primary/30">
            <div className="flex items-center justify-between mb-6">
                <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Question {index + 1}
                </div>
                <button
                    type="button"
                    onClick={remove}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Text</label>
                            <input
                                {...register(`questions.${index}.text`)}
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-lg"
                                placeholder="What is the capital of France?"
                            />
                            {errors?.questions?.[index]?.text && (
                                <p className="text-red-500 text-sm mt-2">{errors.questions[index].text.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Image URL (Optional)
                            </label>
                            <input
                                {...register(`questions.${index}.imageUrl`)}
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-mono text-primary"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Points</label>
                            <input
                                type="number"
                                {...register(`questions.${index}.points`)}
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-center text-lg"
                            />
                        </div>
                        {imageUrl && (
                            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group/image">
                                <img src={imageUrl} alt="Question preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                    Preview
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Answer Options</label>
                    <div className="grid gap-3">
                        {optionFields.map((field, optIndex) => (
                            <div key={field.id} className="flex items-center gap-3 group/option">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        {...register(`questions.${index}.options.${optIndex}.isCorrect`)}
                                        className="peer h-6 w-6 rounded-full border-2 border-gray-300 text-secondary focus:ring-secondary cursor-pointer appearance-none checked:bg-secondary checked:border-secondary transition-all"
                                    />
                                    <CheckCircle2 className="h-4 w-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>

                                <input
                                    {...register(`questions.${index}.options.${optIndex}.text`)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder={`Option ${optIndex + 1}`}
                                />

                                <button
                                    type="button"
                                    onClick={() => removeOption(optIndex)}
                                    className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => appendOption({ text: "", isCorrect: false })}
                        className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-2 mt-2 px-2 py-1 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors w-fit"
                    >
                        <Plus className="h-4 w-4" /> Add Another Option
                    </button>
                </div>
            </div>
        </div>
    )
}
