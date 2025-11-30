import { IExam } from '@/models/Exam'
import { EvaluationType } from '@/models/enums'
import mongoose from 'mongoose'

/**
 * Strategy Pattern pour l'évaluation des examens
 * 
 * Permet de définir différentes stratégies d'évaluation selon le type d'examen
 */

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
        // Même logique que QCM mais avec validation stricte
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
 * Ajuste la difficulté en fonction des réponses
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

        // Trier les questions par ordre de réponse
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
                // Bonus pour les questions difficiles réussies
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
 * Évaluation stricte avec pénalités pour les erreurs
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
                    // Pénalité pour mauvaise réponse
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

/**
 * Factory pour créer la stratégie appropriée
 */
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
}
