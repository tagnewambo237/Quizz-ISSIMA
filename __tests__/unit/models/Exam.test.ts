import Exam from '@/models/Exam'
import User from '@/models/User'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import { mockExam, mockTeacher } from '../../helpers/mock-data'
import { Types } from 'mongoose'

describe('Exam Model', () => {
    beforeAll(async () => {
        await setupTestDB()
    })

    afterAll(async () => {
        await teardownTestDB()
    })

    afterEach(async () => {
        await clearTestDB()
    })

    describe('Exam Creation', () => {
        it('should create a valid exam', async () => {
            // Create teacher first
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                description: 'A test exam',
                startTime: new Date(Date.now() + 1000 * 60 * 60),
                endTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                duration: 60,
                closeMode: 'STRICT',
                createdById: teacher._id,
            })

            expect(exam.title).toBe('Test Exam')
            expect(exam.duration).toBe(60)
            expect(exam.closeMode).toBe('STRICT')
            expect(exam.createdById.toString()).toBe(teacher._id.toString())
        })

        it('should set default closeMode to STRICT', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                startTime: new Date(Date.now() + 1000 * 60 * 60),
                endTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                duration: 60,
                createdById: teacher._id,
            })

            expect(exam.closeMode).toBe('STRICT')
        })

        it('should allow PERMISSIVE closeMode', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                startTime: new Date(Date.now() + 1000 * 60 * 60),
                endTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                duration: 60,
                closeMode: 'PERMISSIVE',
                createdById: teacher._id,
            })

            expect(exam.closeMode).toBe('PERMISSIVE')
        })
    })

    describe('Exam Validation', () => {
        it('should require title', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            await expect(
                Exam.create({
                    startTime: new Date(),
                    endTime: new Date(),
                    duration: 60,
                    createdById: teacher._id,
                })
            ).rejects.toThrow()
        })

        it('should require startTime', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            await expect(
                Exam.create({
                    title: 'Test',
                    endTime: new Date(),
                    duration: 60,
                    createdById: teacher._id,
                })
            ).rejects.toThrow()
        })

        it('should require endTime', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            await expect(
                Exam.create({
                    title: 'Test',
                    startTime: new Date(),
                    duration: 60,
                    createdById: teacher._id,
                })
            ).rejects.toThrow()
        })

        it('should require duration', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            await expect(
                Exam.create({
                    title: 'Test',
                    startTime: new Date(),
                    endTime: new Date(),
                    createdById: teacher._id,
                })
            ).rejects.toThrow()
        })

        it('should require createdById', async () => {
            await expect(
                Exam.create({
                    title: 'Test',
                    startTime: new Date(),
                    endTime: new Date(),
                    duration: 60,
                })
            ).rejects.toThrow()
        })

        it('should only accept valid closeMode values', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            await expect(
                Exam.create({
                    title: 'Test',
                    startTime: new Date(),
                    endTime: new Date(),
                    duration: 60,
                    closeMode: 'INVALID',
                    createdById: teacher._id,
                })
            ).rejects.toThrow()
        })
    })

    describe('Exam Timestamps', () => {
        it('should automatically set createdAt and updatedAt', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                startTime: new Date(Date.now() + 1000 * 60 * 60),
                endTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                duration: 60,
                createdById: teacher._id,
            })

            expect(exam.createdAt).toBeDefined()
            expect(exam.updatedAt).toBeDefined()
            expect(exam.createdAt).toBeInstanceOf(Date)
            expect(exam.updatedAt).toBeInstanceOf(Date)
        })
    })
})
