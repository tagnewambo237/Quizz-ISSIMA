import Question from '@/models/Question'
import Exam from '@/models/Exam'
import User from '@/models/User'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import { addMinutes } from 'date-fns'

describe('Question Model', () => {
    beforeAll(async () => {
        await setupTestDB()
    }, 30000)

    afterAll(async () => {
        await teardownTestDB()
    })

    afterEach(async () => {
        await clearTestDB()
    })

    describe('Question Creation', () => {
        it('should create a valid question', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                startTime: new Date(),
                endTime: addMinutes(new Date(), 120),
                duration: 60,
                createdById: teacher._id,
            })

            const question = await Question.create({
                examId: exam._id,
                text: 'What is 2 + 2?',
                points: 1,
            })

            expect(question.examId.toString()).toBe(exam._id.toString())
            expect(question.text).toBe('What is 2 + 2?')
            expect(question.points).toBe(1)
        })

        it('should set default points to 1', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                startTime: new Date(),
                endTime: addMinutes(new Date(), 120),
                duration: 60,
                createdById: teacher._id,
            })

            const question = await Question.create({
                examId: exam._id,
                text: 'What is 2 + 2?',
            })

            expect(question.points).toBe(1)
        })

        it('should allow custom points value', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                startTime: new Date(),
                endTime: addMinutes(new Date(), 120),
                duration: 60,
                createdById: teacher._id,
            })

            const question = await Question.create({
                examId: exam._id,
                text: 'Complex question',
                points: 5,
            })

            expect(question.points).toBe(5)
        })

        it('should allow optional imageUrl', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                startTime: new Date(),
                endTime: addMinutes(new Date(), 120),
                duration: 60,
                createdById: teacher._id,
            })

            const question = await Question.create({
                examId: exam._id,
                text: 'What is shown in the image?',
                imageUrl: 'https://example.com/image.jpg',
                points: 2,
            })

            expect(question.imageUrl).toBe('https://example.com/image.jpg')
        })
    })

    describe('Question Validation', () => {
        it('should require examId', async () => {
            await expect(
                Question.create({
                    text: 'What is 2 + 2?',
                    points: 1,
                })
            ).rejects.toThrow()
        })

        it('should require text', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                startTime: new Date(),
                endTime: addMinutes(new Date(), 120),
                duration: 60,
                createdById: teacher._id,
            })

            await expect(
                Question.create({
                    examId: exam._id,
                    points: 1,
                })
            ).rejects.toThrow()
        })
    })
})
