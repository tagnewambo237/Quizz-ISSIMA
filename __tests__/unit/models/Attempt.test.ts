import Attempt, { AttemptStatus } from '@/models/Attempt'
import Exam from '@/models/Exam'
import User from '@/models/User'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import { addMinutes } from 'date-fns'

describe('Attempt Model', () => {
    beforeAll(async () => {
        await setupTestDB()
    })

    afterAll(async () => {
        await teardownTestDB()
    })

    afterEach(async () => {
        await clearTestDB()
    })

    describe('Attempt Creation', () => {
        it('should create a valid attempt', async () => {
            // Create user and exam first
            const user = await User.create({
                name: 'Student',
                email: 'student@example.com',
                password: 'hashedpassword',
                role: 'STUDENT',
            })

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

            const attempt = await Attempt.create({
                examId: exam._id,
                userId: user._id,
                expiresAt: addMinutes(new Date(), 60),
                resumeToken: 'test-token-123',
            })

            expect(attempt.examId.toString()).toBe(exam._id.toString())
            expect(attempt.userId.toString()).toBe(user._id.toString())
            expect(attempt.status).toBe('STARTED')
            expect(attempt.resumeToken).toBe('test-token-123')
        })

        it('should set default status to STARTED', async () => {
            const user = await User.create({
                name: 'Student',
                email: 'student@example.com',
                password: 'hashedpassword',
                role: 'STUDENT',
            })

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

            const attempt = await Attempt.create({
                examId: exam._id,
                userId: user._id,
                expiresAt: addMinutes(new Date(), 60),
                resumeToken: 'test-token-123',
            })

            expect(attempt.status).toBe('STARTED')
        })

        it('should automatically set startedAt timestamp', async () => {
            const user = await User.create({
                name: 'Student',
                email: 'student@example.com',
                password: 'hashedpassword',
                role: 'STUDENT',
            })

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

            const attempt = await Attempt.create({
                examId: exam._id,
                userId: user._id,
                expiresAt: addMinutes(new Date(), 60),
                resumeToken: 'test-token-123',
            })

            expect(attempt.startedAt).toBeDefined()
            expect(attempt.startedAt).toBeInstanceOf(Date)
        })
    })

    describe('Attempt Validation', () => {
        it('should require examId', async () => {
            const user = await User.create({
                name: 'Student',
                email: 'student@example.com',
                password: 'hashedpassword',
                role: 'STUDENT',
            })

            await expect(
                Attempt.create({
                    userId: user._id,
                    expiresAt: addMinutes(new Date(), 60),
                    resumeToken: 'test-token-123',
                })
            ).rejects.toThrow()
        })

        it('should require userId', async () => {
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
                Attempt.create({
                    examId: exam._id,
                    expiresAt: addMinutes(new Date(), 60),
                    resumeToken: 'test-token-123',
                })
            ).rejects.toThrow()
        })

        it('should require expiresAt', async () => {
            const user = await User.create({
                name: 'Student',
                email: 'student@example.com',
                password: 'hashedpassword',
                role: 'STUDENT',
            })

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
                Attempt.create({
                    examId: exam._id,
                    userId: user._id,
                    resumeToken: 'test-token-123',
                })
            ).rejects.toThrow()
        })

        it('should require resumeToken', async () => {
            const user = await User.create({
                name: 'Student',
                email: 'student@example.com',
                password: 'hashedpassword',
                role: 'STUDENT',
            })

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
                Attempt.create({
                    examId: exam._id,
                    userId: user._id,
                    expiresAt: addMinutes(new Date(), 60),
                })
            ).rejects.toThrow()
        })

        it('should only accept valid status values', async () => {
            const user = await User.create({
                name: 'Student',
                email: 'student@example.com',
                password: 'hashedpassword',
                role: 'STUDENT',
            })

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
                Attempt.create({
                    examId: exam._id,
                    userId: user._id,
                    expiresAt: addMinutes(new Date(), 60),
                    resumeToken: 'test-token-123',
                    status: 'INVALID_STATUS',
                })
            ).rejects.toThrow()
        })
    })

    describe('Attempt Completion', () => {
        it('should allow updating status to COMPLETED', async () => {
            const user = await User.create({
                name: 'Student',
                email: 'student@example.com',
                password: 'hashedpassword',
                role: 'STUDENT',
            })

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

            const attempt = await Attempt.create({
                examId: exam._id,
                userId: user._id,
                expiresAt: addMinutes(new Date(), 60),
                resumeToken: 'test-token-123',
            })

            attempt.status = AttemptStatus.COMPLETED
            attempt.submittedAt = new Date()
            attempt.score = 85
            await attempt.save()

            const updated = await Attempt.findById(attempt._id)
            expect(updated?.status).toBe(AttemptStatus.COMPLETED)
            expect(updated?.submittedAt).toBeDefined()
            expect(updated?.score).toBe(85)
        })
    })
})
