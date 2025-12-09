import { IExam } from '@/models/Exam'
import { EvaluationType } from '@/models/enums'
import mongoose from 'mongoose'

/**
 * Strategy Pattern pour l'évaluation des examens et des concepts
 * 
 * Permet de définir différentes stratégies d'évaluation selon le type d'examen
 */

// ==========================================
// MASTERY LEVELS FOR CONCEPT SELF-EVALUATION
// ==========================================

export enum MasteryLevel {
    UNKNOWN = 'UNKNOWN',                    // Je ne sais pas
    TOTALLY_UNABLE = 'TOTALLY_UNABLE',      // Totalement incapable
    UNABLE_WITH_HELP = 'UNABLE_WITH_HELP',  // Incapable même avec aide
    UNABLE_ALONE = 'UNABLE_ALONE',          // Incapable sans aide
    ABLE_WITH_HELP = 'ABLE_WITH_HELP',      // Capable avec aide
    ABLE_ALONE = 'ABLE_ALONE',              // Capable sans aide
    PERFECTLY_ABLE = 'PERFECTLY_ABLE'       // Je suis parfaitement capable
}

export const MASTERY_LEVEL_PERCENTAGES: Record<MasteryLevel, number> = {
    [MasteryLevel.UNKNOWN]: 0,
    [MasteryLevel.TOTALLY_UNABLE]: 10,
    [MasteryLevel.UNABLE_WITH_HELP]: 25,
    [MasteryLevel.UNABLE_ALONE]: 40,
    [MasteryLevel.ABLE_WITH_HELP]: 60,
    [MasteryLevel.ABLE_ALONE]: 80,
    [MasteryLevel.PERFECTLY_ABLE]: 100
}

export const MASTERY_LEVEL_INFO: Record<MasteryLevel, { label: string; color: string; description: string }> = {
    [MasteryLevel.UNKNOWN]: { label: "Je ne sais pas", color: "#9ca3af", description: "Niveau non évalué" },
    [MasteryLevel.TOTALLY_UNABLE]: { label: "Totalement incapable", color: "#ef4444", description: "Aucune compréhension" },
    [MasteryLevel.UNABLE_WITH_HELP]: { label: "Incapable même avec aide", color: "#f97316", description: "Difficultés persistantes" },
    [MasteryLevel.UNABLE_ALONE]: { label: "Incapable sans aide", color: "#eab308", description: "Besoin d'accompagnement" },
    [MasteryLevel.ABLE_WITH_HELP]: { label: "Capable avec aide", color: "#3b82f6", description: "Maîtrise partielle" },
    [MasteryLevel.ABLE_ALONE]: { label: "Capable sans aide", color: "#6366f1", description: "Bonne maîtrise" },
    [MasteryLevel.PERFECTLY_ABLE]: { label: "Parfaitement capable", color: "#22c55e", description: "Maîtrise totale" }
}

// ==========================================
// INTERFACES
// ==========================================

export interface EvaluationResult {
    score: number
    maxScore: number
    percentage: number
    passed: boolean
    feedback?: string
    details?: Record<string, any>
}

export interface EvaluationStrategy {
    evaluate(
        exam: IExam,
        responses: any[],
        questions: any[]
    ): Promise<EvaluationResult>
}

// Additional interface for concept self-evaluation
export interface ConceptEvaluationInput {
    userId: string
    conceptId: string
    syllabusId: string
    level: MasteryLevel
    reflection?: string
}

export interface ConceptEvaluationResult {
    level: MasteryLevel
    percentage: number
    label: string
    color: string
    reflection?: string
    evaluatedAt: Date
}

// ==========================================
// EXAM EVALUATION STRATEGIES
// ==========================================

/**
 * Stratégie pour les QCM (Questions à Choix Multiples)
 */
export class QCMEvaluationStrategy implements EvaluationStrategy {
    async evaluate(
        exam: IExam,
        responses: any[],
        questions: any[]
    ): Promise<EvaluationResult> {
        let score = 0
        let maxScore = 0

        for (const question of questions) {
            maxScore += question.points || 1

            const response = responses.find(
                r => r.questionId.toString() === question._id.toString()
            )

            if (response && response.isCorrect) {
                score += question.points || 1
            }
        }

        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
        const passed = percentage >= exam.config.passingScore

        return {
            score,
            maxScore,
            percentage: Math.round(percentage * 100) / 100,
            passed,
            feedback: passed ? 'Félicitations ! Vous avez réussi.' : 'Continuez vos efforts.',
            details: {
                correctAnswers: responses.filter(r => r.isCorrect).length,
                totalQuestions: questions.length
            }
        }
    }
}

/**
 * Stratégie pour les questions Vrai/Faux
 */
export class TrueFalseEvaluationStrategy implements EvaluationStrategy {
    async evaluate(
        exam: IExam,
        responses: any[],
        questions: any[]
    ): Promise<EvaluationResult> {
        let score = 0
        let maxScore = questions.length

        for (const question of questions) {
            const response = responses.find(
                r => r.questionId.toString() === question._id.toString()
            )

            if (response && response.isCorrect) {
                score += 1
            }
        }

        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
        const passed = percentage >= exam.config.passingScore

        return {
            score,
            maxScore,
            percentage: Math.round(percentage * 100) / 100,
            passed,
            feedback: passed ? 'Excellent travail !' : 'Revoyez les concepts de base.',
            details: {
                correctAnswers: score,
                totalQuestions: maxScore
            }
        }
    }
}

/**
 * Stratégie pour les évaluations adaptatives
 */
export class AdaptiveEvaluationStrategy implements EvaluationStrategy {
    async evaluate(
        exam: IExam,
        responses: any[],
        questions: any[]
    ): Promise<EvaluationResult> {
        let score = 0
        let maxScore = 0
        let difficultyBonus = 0

        const orderedResponses = responses.sort((a, b) =>
            new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime()
        )

        for (let i = 0; i < orderedResponses.length; i++) {
            const response = orderedResponses[i]
            const question = questions.find(
                q => q._id.toString() === response.questionId.toString()
            )

            if (!question) continue

            const basePoints = question.points || 1
            maxScore += basePoints

            if (response.isCorrect) {
                const difficultyMultiplier = this.getDifficultyMultiplier(question.difficulty)
                const earnedPoints = basePoints * difficultyMultiplier
                score += earnedPoints
                difficultyBonus += earnedPoints - basePoints
            }
        }

        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
        const passed = percentage >= exam.config.passingScore

        return {
            score,
            maxScore,
            percentage: Math.round(percentage * 100) / 100,
            passed,
            feedback: passed
                ? `Excellent ! Bonus de difficulté: +${Math.round(difficultyBonus)} points`
                : 'Continuez à vous entraîner sur les questions difficiles.',
            details: {
                correctAnswers: responses.filter(r => r.isCorrect).length,
                totalQuestions: questions.length,
                difficultyBonus: Math.round(difficultyBonus)
            }
        }
    }

    private getDifficultyMultiplier(difficulty?: string): number {
        switch (difficulty) {
            case 'BEGINNER': return 1.0
            case 'INTERMEDIATE': return 1.2
            case 'ADVANCED': return 1.5
            case 'EXPERT': return 2.0
            default: return 1.0
        }
    }
}

/**
 * Stratégie pour les simulations d'examen
 */
export class ExamSimulationStrategy implements EvaluationStrategy {
    async evaluate(
        exam: IExam,
        responses: any[],
        questions: any[]
    ): Promise<EvaluationResult> {
        let score = 0
        let maxScore = 0
        let penalties = 0

        for (const question of questions) {
            maxScore += question.points || 1

            const response = responses.find(
                r => r.questionId.toString() === question._id.toString()
            )

            if (response) {
                if (response.isCorrect) {
                    score += question.points || 1
                } else {
                    const penalty = (question.points || 1) * 0.25
                    penalties += penalty
                    score = Math.max(0, score - penalty)
                }
            }
        }

        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
        const passed = percentage >= exam.config.passingScore

        return {
            score: Math.round(score * 100) / 100,
            maxScore,
            percentage: Math.round(percentage * 100) / 100,
            passed,
            feedback: passed
                ? 'Vous êtes prêt pour l\'examen officiel !'
                : `Pénalités: -${Math.round(penalties)} points. Révisez les erreurs.`,
            details: {
                correctAnswers: responses.filter(r => r.isCorrect).length,
                incorrectAnswers: responses.filter(r => !r.isCorrect).length,
                totalQuestions: questions.length,
                penalties: Math.round(penalties * 100) / 100
            }
        }
    }
}

// ==========================================
// CONCEPT SELF-EVALUATION STRATEGY
// ==========================================

/**
 * Stratégie pour l'auto-évaluation des concepts (7 niveaux de maîtrise)
 */
export class ConceptSelfEvaluationStrategy {
    /**
     * Evaluate a concept based on student self-assessment
     */
    evaluate(input: ConceptEvaluationInput): ConceptEvaluationResult {
        const levelInfo = MASTERY_LEVEL_INFO[input.level]
        const percentage = MASTERY_LEVEL_PERCENTAGES[input.level]

        return {
            level: input.level,
            percentage,
            label: levelInfo.label,
            color: levelInfo.color,
            reflection: input.reflection,
            evaluatedAt: new Date()
        }
    }

    /**
     * Save the evaluation to database
     */
    async save(input: ConceptEvaluationInput): Promise<any> {
        const ConceptEvaluation = mongoose.models.ConceptEvaluation

        return await ConceptEvaluation.create({
            student: input.userId,
            concept: input.conceptId,
            syllabus: input.syllabusId,
            level: input.level,
            reflection: input.reflection,
            evaluatedAt: new Date()
        })
    }

    /**
     * Get all evaluations for a student on a syllabus
     */
    async getStudentProgress(studentId: string, syllabusId: string): Promise<any[]> {
        const ConceptEvaluation = mongoose.models.ConceptEvaluation

        return await ConceptEvaluation.find({
            student: studentId,
            syllabus: syllabusId
        }).populate('concept', 'title').sort({ evaluatedAt: -1 })
    }

    /**
     * Calculate overall mastery percentage for a syllabus
     */
    calculateOverallMastery(evaluations: ConceptEvaluationResult[]): number {
        if (evaluations.length === 0) return 0

        const totalPercentage = evaluations.reduce((sum, e) => sum + e.percentage, 0)
        return Math.round(totalPercentage / evaluations.length)
    }
}

// ==========================================
// FACTORY
// ==========================================

export class EvaluationStrategyFactory {
    static getStrategy(evaluationType: EvaluationType): EvaluationStrategy {
        switch (evaluationType) {
            case EvaluationType.QCM:
                return new QCMEvaluationStrategy()

            case EvaluationType.TRUE_FALSE:
                return new TrueFalseEvaluationStrategy()

            case EvaluationType.ADAPTIVE:
                return new AdaptiveEvaluationStrategy()

            case EvaluationType.EXAM_SIMULATION:
                return new ExamSimulationStrategy()

            default:
                return new QCMEvaluationStrategy()
        }
    }

    /**
     * Get the Concept Self-Evaluation Strategy
     */
    static getConceptSelfEvaluationStrategy(): ConceptSelfEvaluationStrategy {
        return new ConceptSelfEvaluationStrategy()
    }

    /**
     * Évalue un examen avec la stratégie appropriée
     */
    static async evaluateExam(
        exam: IExam,
        responses: any[],
        questions: any[]
    ): Promise<EvaluationResult> {
        const strategy = this.getStrategy(exam.evaluationType)
        return strategy.evaluate(exam, responses, questions)
    }

    /**
     * Evaluate a concept self-assessment
     */
    static evaluateConcept(input: ConceptEvaluationInput): ConceptEvaluationResult {
        const strategy = this.getConceptSelfEvaluationStrategy()
        return strategy.evaluate(input)
    }
}

