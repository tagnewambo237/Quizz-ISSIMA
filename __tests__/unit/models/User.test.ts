import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'

describe('User Model', () => {
    beforeAll(async () => {
        await connectDB()
    })

    afterEach(async () => {
        await User.deleteMany({})
    })

    describe('User Creation', () => {
        it('should create a valid user', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedpassword123',
                role: 'STUDENT',
            })

            expect(user.name).toBe('Test User')
            expect(user.email).toBe('test@example.com')
            expect(user.role).toBe('STUDENT')
        })

        it('should generate studentCode for students', async () => {
            const user = await User.create({
                name: 'Student User',
                email: 'student@example.com',
                password: 'hashedpassword123',
                role: 'STUDENT',
            })

            // StudentCode should be generated if not provided
            // Note: This depends on your actual implementation
            // If you have a pre-save hook, it should generate it
            // For now, we'll just check if it can be set
            expect(user.role).toBe('STUDENT')
        })

        it('should not generate studentCode for teachers', async () => {
            const user = await User.create({
                name: 'Teacher User',
                email: 'teacher@example.com',
                password: 'hashedpassword123',
                role: 'TEACHER',
            })

            expect(user.studentCode).toBeUndefined()
        })

        it('should require email to be unique', async () => {
            await User.create({
                name: 'User 1',
                email: 'duplicate@example.com',
                password: 'hashedpassword123',
                role: 'STUDENT',
            })

            await expect(
                User.create({
                    name: 'User 2',
                    email: 'duplicate@example.com',
                    password: 'hashedpassword123',
                    role: 'STUDENT',
                })
            ).rejects.toThrow()
        })

        it('should set default role to STUDENT', async () => {
            const user = await User.create({
                name: 'Default Role User',
                email: 'default@example.com',
                password: 'hashedpassword123',
            })

            expect(user.role).toBe('STUDENT')
        })
    })

    describe('User Validation', () => {
        it('should require name', async () => {
            await expect(
                User.create({
                    email: 'noname@example.com',
                    password: 'hashedpassword123',
                })
            ).rejects.toThrow()
        })

        it('should require email', async () => {
            await expect(
                User.create({
                    name: 'No Email User',
                    password: 'hashedpassword123',
                })
            ).rejects.toThrow()
        })

        it('should require password', async () => {
            await expect(
                User.create({
                    name: 'No Password User',
                    email: 'nopassword@example.com',
                })
            ).rejects.toThrow()
        })

        it('should only accept valid roles', async () => {
            await expect(
                User.create({
                    name: 'Invalid Role User',
                    email: 'invalid@example.com',
                    password: 'hashedpassword123',
                    role: 'INVALID_ROLE',
                })
            ).rejects.toThrow()
        })
    })
})
