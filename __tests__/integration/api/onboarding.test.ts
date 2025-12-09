import { POST } from '@/app/api/onboarding/route'
import User from '@/models/User'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import { NextRequest } from 'next/server'

// Mock NextAuth
const mockUserId = 'user-id-123'
const mockUserEmail = 'newuser@example.com'

jest.mock('next-auth', () => ({
    getServerSession: jest.fn(() =>
        Promise.resolve({
            user: {
                id: mockUserId,
                email: mockUserEmail
            },
        })
    ),
}))

describe('POST /api/onboarding', () => {
    beforeAll(async () => {
        await setupTestDB()
    })

    afterAll(async () => {
        await teardownTestDB()
    })

    beforeEach(async () => {
        // Create user without role
        await User.create({
            _id: mockUserId,
            name: 'New User',
            email: mockUserEmail,
            image: 'https://example.com/pic.jpg',
            googleId: 'google-id-123',
            // No role initially
        })
    })

    afterEach(async () => {
        await clearTestDB()
    })

    it('should assign STUDENT role and generate studentCode', async () => {
        const request = new NextRequest('http://localhost:3000/api/onboarding', {
            method: 'POST',
            body: JSON.stringify({
                role: 'STUDENT',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.user.role).toBe('STUDENT')
        expect(data.user.studentCode).toBeDefined()
        expect(data.user.studentCode).toHaveLength(8)

        // Verify in DB
        const user = await User.findById(mockUserId)
        expect(user?.role).toBe('STUDENT')
        expect(user?.studentCode).toBeDefined()
    })

    it('should assign TEACHER role without studentCode', async () => {
        const request = new NextRequest('http://localhost:3000/api/onboarding', {
            method: 'POST',
            body: JSON.stringify({
                role: 'TEACHER',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.user.role).toBe('TEACHER')
        expect(data.user.studentCode).toBeUndefined()

        // Verify in DB
        const user = await User.findById(mockUserId)
        expect(user?.role).toBe('TEACHER')
        expect(user?.studentCode).toBeUndefined()
    })

    it('should reject invalid role', async () => {
        const request = new NextRequest('http://localhost:3000/api/onboarding', {
            method: 'POST',
            body: JSON.stringify({
                role: 'INVALID_ROLE',
            }),
        })

        const response = await POST(request)

        expect(response.status).toBe(400)
    })

    it('should prevent changing role if already set', async () => {
        // Set role first
        await User.findByIdAndUpdate(mockUserId, { role: 'STUDENT' })

        const request = new NextRequest('http://localhost:3000/api/onboarding', {
            method: 'POST',
            body: JSON.stringify({
                role: 'TEACHER',
            }),
        })

        const response = await POST(request)

        expect(response.status).toBe(400)
        expect(await response.json()).toEqual(expect.objectContaining({
            message: 'Role already assigned'
        }))
    })
})
