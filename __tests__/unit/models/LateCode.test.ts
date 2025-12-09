import LateCode from '@/models/LateCode'
import Exam from '@/models/Exam'
import User from '@/models/User'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import { addMinutes, addDays } from 'date-fns'

describe('LateCode Model', () => {
    beforeAll(async () => {
        await setupTestDB()
    })

    afterAll(async () => {
        await teardownTestDB()
    })

    afterEach(async () => {
        await clearTestDB()
    })

    describe('LateCode Creation', () => {
        it('should create a valid late code', async () => {
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
                closeMode: 'PERMISSIVE',
                createdById: teacher._id,
            })

            const lateCode = await LateCode.create({
                code: 'LATE123',
                examId: exam._id,
                usagesRemaining: 1,
            })

            expect(lateCode.code).toBe('LATE123')
            expect(lateCode.examId.toString()).toBe(exam._id.toString())
            expect(lateCode.usagesRemaining).toBe(1)
        })

        it('should allow optional expiresAt', async () => {
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
                closeMode: 'PERMISSIVE',
                createdById: teacher._id,
            })

            const expiryDate = addDays(new Date(), 1)
            const lateCode = await LateCode.create({
                code: 'LATE123',
                examId: exam._id,
                usagesRemaining: 1,
                expiresAt: expiryDate,
            })

            expect(lateCode.expiresAt).toBeDefined()
            expect(lateCode.expiresAt?.getTime()).toBe(expiryDate.getTime())
        })

        it('should allow optional assignedUserId', async () => {
            const teacher = await User.create({
                name: 'Teacher',
                email: 'teacher@example.com',
                password: 'hashedpassword',
                role: 'TEACHER',
            })

            const student = await User.create({
                name: 'Student',
                email: 'student@example.com',
                password: 'hashedpassword',
                role: 'STUDENT',
            })

            const exam = await Exam.create({
                title: 'Test Exam',
                startTime: new Date(),
                endTime: addMinutes(new Date(), 120),
                duration: 60,
                closeMode: 'PERMISSIVE',
                createdById: teacher._id,
            })

            const lateCode = await LateCode.create({
                code: 'LATE123',
                examId: exam._id,
                usagesRemaining: 1,
                assignedUserId: student._id,
            })

            expect(lateCode.assignedUserId).toBeDefined()
            expect(lateCode.assignedUserId?.toString()).toBe(student._id.toString())
        })
    })

    describe('LateCode Validation', () => {
        it('should require code', async () => {
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
                closeMode: 'PERMISSIVE',
                createdById: teacher._id,
            })

            await expect(
                LateCode.create({
                    examId: exam._id,
                    usagesRemaining: 1,
                })
            ).rejects.toThrow()
        })

        it('should require examId', async () => {
            await expect(
                LateCode.create({
                    code: 'LATE123',
                    usagesRemaining: 1,
                })
            ).rejects.toThrow()
        })

        it('should default usagesRemaining to 1', async () => {
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
                closeMode: 'PERMISSIVE',
                createdById: teacher._id,
            })

            const lateCode = await LateCode.create({
                code: 'LATE123',
                examId: exam._id,
            })

            expect(lateCode.usagesRemaining).toBe(1)
        })
    })

    describe('LateCode Usage', () => {
        it('should allow decrementing usagesRemaining', async () => {
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
                closeMode: 'PERMISSIVE',
                createdById: teacher._id,
            })

            const lateCode = await LateCode.create({
                code: 'LATE123',
                examId: exam._id,
                usagesRemaining: 3,
            })

            lateCode.usagesRemaining -= 1
            await lateCode.save()

            const updated = await LateCode.findById(lateCode._id)
            expect(updated?.usagesRemaining).toBe(2)
        })
    })
})
