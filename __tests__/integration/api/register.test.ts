import { POST } from '@/app/api/register/route'
import User from '@/models/User'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import { NextRequest } from 'next/server'
import mongoose from 'mongoose'

// Mock NextAuth
const mockAdminId = new mongoose.Types.ObjectId().toString()
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() =>
        Promise.resolve({
            user: { id: mockAdminId, role: 'TEACHER' },
        })
    ),
}))

describe('POST /api/register', () => {
    beforeAll(async () => {
        await setupTestDB()
    }, 30000)

    afterAll(async () => {
        await teardownTestDB()
    })

    afterEach(async () => {
        await clearTestDB()
    })

    it('should register a new student', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New Student',
                email: 'newstudent@example.com',
                password: 'password123',
                role: 'STUDENT',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.user.name).toBe('New Student')
        expect(data.user.email).toBe('newstudent@example.com')
        expect(data.user.role).toBe('STUDENT')
        expect(data.user.studentCode).toBeDefined()
        expect(data.user.studentCode).toHaveLength(8)
    })

    it('should register a new teacher', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New Teacher',
                email: 'newteacher@example.com',
                password: 'password123',
                role: 'TEACHER',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.user.name).toBe('New Teacher')
        expect(data.user.email).toBe('newteacher@example.com')
        expect(data.user.role).toBe('TEACHER')
        expect(data.user.studentCode).toBeUndefined()
    })

    it('should reject duplicate email', async () => {
        // Create first user
        await User.create({
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'hashedpassword',
            role: 'STUDENT',
        })

        const request = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Another User',
                email: 'existing@example.com',
                password: 'password123',
                role: 'STUDENT',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.message).toContain('already exists')
    })

    it('should hash the password', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'plainpassword',
                role: 'STUDENT',
            }),
        })

        await POST(request)

        const user = await User.findOne({ email: 'test@example.com' })
        expect(user?.password).not.toBe('plainpassword')
        expect(user?.password).toMatch(/^\$2[aby]\$/)
    })

    it('should reject invalid role', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'INVALID_ROLE',
            }),
        })

        const response = await POST(request)

        expect(response.status).toBe(400)
    })

    it('should require authentication', async () => {
        // Mock unauthenticated session
        const { getServerSession } = require('next-auth/next')
        getServerSession.mockResolvedValueOnce(null)

        const request = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'STUDENT',
            }),
        })

        const response = await POST(request)

        expect(response.status).toBe(401)
    })
})
