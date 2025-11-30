import Exam, { IExam } from "@/models/Exam"
import Question from "@/models/Question"
import { ExamStatus, EvaluationType, DifficultyLevel, PedagogicalObjective } from "@/models/enums"
import { EvaluationStrategyFactory } from "@/lib/patterns/EvaluationStrategy"
import mongoose from "mongoose"

/**
 * Service V2 pour la gestion avancée des examens
 * Intègre les nouveaux champs V2 et le pattern Strategy
 */
export class ExamServiceV2 {
    /**
     * Récupère les examens avec filtres avancés
     */
    static async getExams(filters: {
        status?: ExamStatus
        level?: string
        subject?: string
        field?: string
        learningUnit?: string
        competency?: string
        evaluationType?: EvaluationType
        difficultyLevel?: DifficultyLevel
        createdBy?: string
        isPublished?: boolean
        limit?: number
        skip?: number
    } = {}) {
        const query: any = {}

        if (filters.status) query.status = filters.status
        if (filters.level) query.targetLevels = filters.level
        if (filters.subject) query.subject = filters.subject
        if (filters.field) query.targetFields = filters.field
        if (filters.learningUnit) query.learningUnit = filters.learningUnit
        if (filters.competency) query.targetedCompetencies = filters.competency
        if (filters.evaluationType) query.evaluationType = filters.evaluationType
        if (filters.difficultyLevel) query.difficultyLevel = filters.difficultyLevel
        if (filters.createdBy) query.createdById = filters.createdBy
        if (filters.isPublished !== undefined) query.isPublished = filters.isPublished

        const limit = filters.limit || 20
        const skip = filters.skip || 0

        const exams = await Exam.find(query)
            .populate('targetLevels', 'name code cycle')
            .populate('subject', 'name code')
            .populate('learningUnit', 'name code')
            .populate('targetFields', 'name code')
            .populate('targetedCompetencies', 'name description')
            .populate('createdById', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean()

        const total = await Exam.countDocuments(query)

        return { exams, total, limit, skip }
    }

    /**
     * Récupère un examen par ID avec toutes les relations
     */
    static async getExamById(id: string, includeQuestions: boolean = false) {
        const exam = await Exam.findById(id)
            .populate('targetLevels', 'name code cycle')
            .populate('subject', 'name code')
            .populate('learningUnit', 'name code')
            .populate('targetFields', 'name code')
            .populate('targetedCompetencies', 'name description')
            .populate('createdById', 'name email')
            .lean()

        if (!exam) return null

        if (includeQuestions) {
            const questions = await Question.find({ examId: id })
                .populate('competencies', 'name')
                .lean()
            return { ...exam, questions }
        }

        return exam
    }

    /**
     * Crée un nouvel examen V2
     */
    static async createExam(examData: Partial<IExam>, createdBy: string) {
        // Valider les données
        if (!examData.title || !examData.subject) {
            throw new Error("Title and subject are required")
        }

        // Définir les valeurs par défaut V2
        const exam = await Exam.create({
            ...examData,
            createdById: createdBy,
            status: ExamStatus.DRAFT,
            isPublished: false,
            version: 1,
            config: {
                shuffleQuestions: examData.config?.shuffleQuestions ?? false,
                shuffleOptions: examData.config?.shuffleOptions ?? false,
                showResultsImmediately: examData.config?.showResultsImmediately ?? true,
                allowReview: examData.config?.allowReview ?? true,
                passingScore: examData.config?.passingScore ?? 50,
                maxAttempts: examData.config?.maxAttempts ?? 1,
                timeBetweenAttempts: examData.config?.timeBetweenAttempts ?? 0,
                antiCheat: {
                    fullscreenRequired: examData.config?.antiCheat?.fullscreenRequired ?? false,
                    disableCopyPaste: examData.config?.antiCheat?.disableCopyPaste ?? false,
                    trackTabSwitches: examData.config?.antiCheat?.trackTabSwitches ?? false,
                    blockRightClick: examData.config?.antiCheat?.blockRightClick ?? false,
                    preventScreenshot: examData.config?.antiCheat?.preventScreenshot ?? false,
                    webcamRequired: examData.config?.antiCheat?.webcamRequired ?? false,
                    maxTabSwitches: examData.config?.antiCheat?.maxTabSwitches ?? 3
                }
            },
            stats: {
                totalAttempts: 0,
                totalCompletions: 0,
                averageScore: 0,
                passRate: 0,
                averageTime: 0
            }
        } as any)

        return exam
    }

    /**
     * Met à jour un examen
     */
    static async updateExam(id: string, updateData: Partial<IExam>, userId: string) {
        const exam = await Exam.findById(id)
        if (!exam) throw new Error("Exam not found")

        // Vérifier les permissions (à améliorer avec AccessHandler)
        if (exam.createdById.toString() !== userId) {
            throw new Error("Unauthorized to update this exam")
        }

        // Ne pas permettre la modification si l'examen est publié (sauf certains champs)
        if (exam.status === ExamStatus.PUBLISHED) {
            const allowedFields = ['isPublished', 'endTime']
            const attemptedFields = Object.keys(updateData)
            const unauthorized = attemptedFields.filter(f => !allowedFields.includes(f))

            if (unauthorized.length > 0) {
                throw new Error("Cannot modify published exam except isPublished and endTime")
            }
        }

        // Incrémenter la version si modification majeure
        if ((updateData as any).questions || updateData.config) {
            updateData.version = (exam.version || 1) + 1
        }

        const updatedExam = await Exam.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('targetLevels', 'name code')
            .populate('subject', 'name code')
            .populate('learningUnit', 'name code')

        return updatedExam
    }

    /**
     * Suppression douce (archive)
     */
    static async deleteExam(id: string, userId: string) {
        const exam = await Exam.findById(id)
        if (!exam) throw new Error("Exam not found")

        // Vérifier les permissions
        if (exam.createdById.toString() !== userId) {
            throw new Error("Unauthorized to delete this exam")
        }

        // Soft delete: changer le statut à ARCHIVED
        exam.status = ExamStatus.ARCHIVED
        exam.isPublished = false
        await exam.save()

        return { success: true, message: "Exam archived successfully" }
    }

    /**
     * Recherche full-text
     */
    static async searchExams(query: string, filters: any = {}) {
        const searchQuery: any = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }

        // Ajouter les filtres additionnels
        if (filters.status) searchQuery.status = filters.status
        if (filters.subject) searchQuery.subject = filters.subject
        if (filters.level) searchQuery.targetLevels = filters.level

        const exams = await Exam.find(searchQuery)
            .populate('targetLevels', 'name code')
            .populate('subject', 'name code')
            .populate('createdById', 'name')
            .limit(20)
            .lean()

        return exams
    }

    /**
     * Filtrage avancé avec critères multiples
     */
    static async filterExams(criteria: {
        targetLevels?: string[]
        targetFields?: string[]
        competencies?: string[]
        subject?: string
        evaluationType?: EvaluationType
        difficultyLevel?: DifficultyLevel
        pedagogicalObjective?: PedagogicalObjective
        status?: ExamStatus
    }) {
        const query: any = {}

        if (criteria.targetLevels?.length) {
            query.targetLevels = { $in: criteria.targetLevels }
        }
        if (criteria.targetFields?.length) {
            query.targetFields = { $in: criteria.targetFields }
        }
        if (criteria.competencies?.length) {
            query.targetedCompetencies = { $in: criteria.competencies }
        }
        if (criteria.subject) {
            query.subject = criteria.subject
        }
        if (criteria.evaluationType) {
            query.evaluationType = criteria.evaluationType
        }
        if (criteria.difficultyLevel) {
            query.difficultyLevel = criteria.difficultyLevel
        }
        if (criteria.pedagogicalObjective) {
            query.pedagogicalObjective = criteria.pedagogicalObjective
        }
        if (criteria.status) {
            query.status = criteria.status
        }

        const exams = await Exam.find(query)
            .populate('targetLevels', 'name code')
            .populate('subject', 'name code')
            .populate('targetFields', 'name code')
            .populate('targetedCompetencies', 'name')
            .populate('createdById', 'name')
            .lean()

        return exams
    }

    /**
     * Évalue un examen avec la stratégie appropriée
     */
    static async evaluateExam(exam: IExam, responses: any[], questions: any[]) {
        return await EvaluationStrategyFactory.evaluateExam(exam, responses, questions)
    }
}
