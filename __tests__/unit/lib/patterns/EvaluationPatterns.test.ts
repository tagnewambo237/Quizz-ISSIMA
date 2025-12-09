import { EvaluationStrategyFactory } from '@/lib/patterns/EvaluationStrategy'
import { ExamDecoratorFactory } from '@/lib/patterns/ExamDecorator'
import Exam, { IExam } from '@/models/Exam'
import { EvaluationType, PedagogicalObjective, DifficultyLevel, SubSystem, ExamStatus, LearningMode, CloseMode } from '@/models/enums'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../../helpers/db-setup'
import mongoose from 'mongoose'

describe('Evaluation Strategy Pattern', () => {
    beforeAll(async () => {
        await setupTestDB()
    })

    afterAll(async () => {
        await teardownTestDB()
    })

    afterEach(async () => {
        await clearTestDB()
    })

    describe('QCMEvaluationStrategy', () => {
        it('should evaluate QCM correctly', async () => {
            const exam = {
                evaluationType: EvaluationType.QCM,
                config: { passingScore: 50 }
            } as IExam

            const questions = [
                { _id: new mongoose.Types.ObjectId(), points: 10 },
                { _id: new mongoose.Types.ObjectId(), points: 10 },
                { _id: new mongoose.Types.ObjectId(), points: 10 }
            ]

            const responses = [
                { questionId: questions[0]._id, isCorrect: true },
                { questionId: questions[1]._id, isCorrect: false },
                { questionId: questions[2]._id, isCorrect: true }
            ]

            const result = await EvaluationStrategyFactory.evaluateExam(exam, responses, questions)

            expect(result.score).toBe(20)
            expect(result.maxScore).toBe(30)
            expect(result.percentage).toBeCloseTo(66.67, 1)
            expect(result.passed).toBe(true)
        })
    })

    describe('TrueFalseEvaluationStrategy', () => {
        it('should evaluate True/False correctly', async () => {
            const exam = {
                evaluationType: EvaluationType.TRUE_FALSE,
                config: { passingScore: 60 }
            } as IExam

            const questions = [
                { _id: new mongoose.Types.ObjectId() },
                { _id: new mongoose.Types.ObjectId() },
                { _id: new mongoose.Types.ObjectId() },
                { _id: new mongoose.Types.ObjectId() },
                { _id: new mongoose.Types.ObjectId() }
            ]

            const responses = [
                { questionId: questions[0]._id, isCorrect: true },
                { questionId: questions[1]._id, isCorrect: true },
                { questionId: questions[2]._id, isCorrect: true },
                { questionId: questions[3]._id, isCorrect: false },
                { questionId: questions[4]._id, isCorrect: false }
            ]

            const result = await EvaluationStrategyFactory.evaluateExam(exam, responses, questions)

            expect(result.score).toBe(3)
            expect(result.maxScore).toBe(5)
            expect(result.percentage).toBe(60)
            expect(result.passed).toBe(true)
        })
    })

    describe('AdaptiveEvaluationStrategy', () => {
        it('should apply difficulty multipliers', async () => {
            const exam = {
                evaluationType: EvaluationType.ADAPTIVE,
                config: { passingScore: 50 }
            } as IExam

            const questions = [
                { _id: new mongoose.Types.ObjectId(), points: 10, difficulty: 'BEGINNER' },
                { _id: new mongoose.Types.ObjectId(), points: 10, difficulty: 'EXPERT' }
            ]

            const responses = [
                { questionId: questions[0]._id, isCorrect: true, answeredAt: new Date() },
                { questionId: questions[1]._id, isCorrect: true, answeredAt: new Date() }
            ]

            const result = await EvaluationStrategyFactory.evaluateExam(exam, responses, questions)

            // BEGINNER: 10 * 1.0 = 10
            // EXPERT: 10 * 2.0 = 20
            expect(result.score).toBe(30)
            expect(result.maxScore).toBe(20)
            expect(result.details?.difficultyBonus).toBe(10)
        })
    })

    describe('ExamSimulationStrategy', () => {
        it('should apply penalties for wrong answers', async () => {
            const exam = {
                evaluationType: EvaluationType.EXAM_SIMULATION,
                config: { passingScore: 50 }
            } as IExam

            const questions = [
                { _id: new mongoose.Types.ObjectId(), points: 10 },
                { _id: new mongoose.Types.ObjectId(), points: 10 }
            ]

            const responses = [
                { questionId: questions[0]._id, isCorrect: true },
                { questionId: questions[1]._id, isCorrect: false }
            ]

            const result = await EvaluationStrategyFactory.evaluateExam(exam, responses, questions)

            // Correct: +10, Wrong: -2.5 (25% penalty)
            expect(result.score).toBe(7.5)
            expect(result.details?.penalties).toBe(2.5)
        })
    })
})

describe('Exam Decorator Pattern', () => {
    const mockExam = {
        duration: 60,
        config: { passingScore: 50 }
    } as IExam

    const baseResult = {
        score: 80,
        maxScore: 100,
        percentage: 80,
        passed: true,
        feedback: 'Good job!',
        details: {}
    }

    describe('TimeBonusDecorator', () => {
        it('should add time bonus for fast completion', () => {
            const result = ExamDecoratorFactory.applyDecorators(baseResult, mockExam, {
                timeSpent: 40, // 40 minutes out of 60
                enableTimeBonus: true
            })

            // timePercentage = 66.67%
            // bonus = (75 - 66.67) / 10 = 0.833%
            // bonusPoints = 100 * 0.833 / 100 = 0.833
            expect(result.score).toBeGreaterThan(80)
            expect(result.details?.timeBonus).toBeDefined()
        })

        it('should not add bonus if too slow', () => {
            const result = ExamDecoratorFactory.applyDecorators(baseResult, mockExam, {
                timeSpent: 55,
                enableTimeBonus: true
            })

            expect(result.score).toBe(80)
            expect(result.details?.timeBonus).toBeUndefined()
        })
    })

    describe('StreakBonusDecorator', () => {
        it('should add streak bonus for consecutive correct answers', () => {
            const responses = [
                { isCorrect: true, answeredAt: new Date('2024-01-01T10:00:00') },
                { isCorrect: true, answeredAt: new Date('2024-01-01T10:01:00') },
                { isCorrect: true, answeredAt: new Date('2024-01-01T10:02:00') },
                { isCorrect: true, answeredAt: new Date('2024-01-01T10:03:00') }
            ]

            const result = ExamDecoratorFactory.applyDecorators(baseResult, mockExam, {
                responses,
                enableStreakBonus: true
            })

            // Streak of 4: bonus = 0.5 * (4-2) = 1.0
            expect(result.score).toBeGreaterThan(80)
            expect(result.details?.maxStreak).toBe(4)
        })
    })

    describe('BadgeDecorator', () => {
        it('should award perfection badge', () => {
            const perfectResult = { ...baseResult, percentage: 100 }

            const result = ExamDecoratorFactory.applyDecorators(perfectResult, mockExam, {
                enableBadges: true
            })

            expect(result.details?.badges).toContain('🏆 Perfection')
        })

        it('should award excellence badge', () => {
            const excellentResult = { ...baseResult, percentage: 92 }

            const result = ExamDecoratorFactory.applyDecorators(excellentResult, mockExam, {
                enableBadges: true
            })

            expect(result.details?.badges).toContain('⭐ Excellence')
        })
    })
})
