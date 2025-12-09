import { POST } from '@/app/api/attempts/start/route'
import Exam from '@/models/Exam'
import User from '@/models/User'
import Attempt from '@/models/Attempt'
import LateCode from '@/models/LateCode'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import { NextRequest } from 'next/server'
import { addHours, subHours } from 'date-fns'
import mongoose from 'mongoose'

// Mock NextAuth
const mockStudentId = new mongoose.Types.ObjectId().toString()
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() =>
        Promise.resolve({
            user: { id: mockStudentId, role: 'STUDENT' },
        })
    ),
}))

describe('POST /api/attempts/start', () => {
    let teacherId: string
    let examId: string

    beforeAll(async () => {
        await setupTestDB()
    }, 30000)

    afterAll(async () => {
        await teardownTestDB()
    })

    beforeEach(async () => {
        // Create teacher
        const teacher = await User.create({
            name: 'Teacher',
            email: 'teacher@example.com',
            password: 'hashedpassword',
            role: 'TEACHER',
        })
        teacherId = teacher._id.toString()

        // Create student
        await User.create({
            _id: new mongoose.Types.ObjectId(mockStudentId),
            name: 'Student',
            email: 'student@example.com',
            password: 'hashedpassword',
            role: 'STUDENT',
        })

        // Create exam
        const exam = await Exam.create({
            title: 'Test Exam',
            startTime: subHours(new Date(), 1), // Started 1 hour ago
            endTime: addHours(new Date(), 23), // Ends in 23 hours
            duration: 60,
            closeMode: 'STRICT',
            createdById: teacherId,
        })
        examId = exam._id.toString()
    })

    afterEach(async () => {
        await clearTestDB()
    })

    it('should start a new attempt for an active exam', async () => {
        const request = new NextRequest('http://localhost:3000/api/attempts/start', {
            method: 'POST',
            body: JSON.stringify({
                examId,
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.attemptId).toBeDefined()
        expect(data.resumeToken).toBeDefined()

        // Verify attempt was created in DB
        const attempt = await Attempt.findById(data.attemptId)
        expect(attempt).toBeDefined()
        expect(attempt?.examId.toString()).toBe(examId)
        expect(attempt?.userId.toString()).toBe(mockStudentId)
    })

    it('should resume existing attempt', async () => {
        // Create existing attempt
        const existingAttempt = await Attempt.create({
            examId,
            userId: mockStudentId,
            expiresAt: addHours(new Date(), 1),
            resumeToken: 'existing-token',
        })

        const request = new NextRequest('http://localhost:3000/api/attempts/start', {
            method: 'POST',
            body: JSON.stringify({
                examId,
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.attemptId).toBe(existingAttempt._id.toString())
        expect(data.message).toContain('Resuming')
    })

    it('should reject attempt before exam starts', async () => {
        // Create future exam
        const futureExam = await Exam.create({
            title: 'Future Exam',
            startTime: addHours(new Date(), 1), // Starts in 1 hour
            endTime: addHours(new Date(), 25),
            duration: 60,
            closeMode: 'STRICT',
            createdById: teacherId,
        })

        const request = new NextRequest('http://localhost:3000/api/attempts/start', {
            method: 'POST',
            body: JSON.stringify({
                examId: futureExam._id.toString(),
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.message).toContain('not started')
    })

    it('should reject attempt after exam ends (STRICT mode)', async () => {
        // Create past exam
        const pastExam = await Exam.create({
            title: 'Past Exam',
            startTime: subHours(new Date(), 25),
            endTime: subHours(new Date(), 1), // Ended 1 hour ago
            duration: 60,
            closeMode: 'STRICT',
            createdById: teacherId,
        })

        const request = new NextRequest('http://localhost:3000/api/attempts/start', {
            method: 'POST',
            body: JSON.stringify({
                examId: pastExam._id.toString(),
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.message).toContain('closed')
    })

    it('should allow late access with valid code (PERMISSIVE mode)', async () => {
        // Create past exam with PERMISSIVE mode
        const pastExam = await Exam.create({
            title: 'Past Exam',
            startTime: subHours(new Date(), 25),
            endTime: subHours(new Date(), 1), // Ended 1 hour ago
            duration: 60,
            closeMode: 'PERMISSIVE',
            createdById: teacherId,
        })

        // Create late code
        const lateCode = await LateCode.create({
            code: 'LATE123',
            examId: pastExam._id,
            usagesRemaining: 1,
        })

        const request = new NextRequest('http://localhost:3000/api/attempts/start', {
            method: 'POST',
            body: JSON.stringify({
                examId: pastExam._id.toString(),
                lateCode: 'LATE123',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.attemptId).toBeDefined()

        // Verify late code usage was decremented
        const updatedCode = await LateCode.findById(lateCode._id)
        expect(updatedCode?.usagesRemaining).toBe(0)
    })

    it('should reject invalid late code', async () => {
        // Create past exam with PERMISSIVE mode
        const pastExam = await Exam.create({
            title: 'Past Exam',
            startTime: subHours(new Date(), 25),
            endTime: subHours(new Date(), 1),
            duration: 60,
            closeMode: 'PERMISSIVE',
            createdById: teacherId,
        })

        const request = new NextRequest('http://localhost:3000/api/attempts/start', {
            method: 'POST',
            body: JSON.stringify({
                examId: pastExam._id.toString(),
                lateCode: 'INVALID',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.message).toContain('Invalid')
    })

    it('should require authentication', async () => {
        const { getServerSession } = require('next-auth/next')
        getServerSession.mockResolvedValueOnce(null)

        const request = new NextRequest('http://localhost:3000/api/attempts/start', {
            method: 'POST',
            body: JSON.stringify({
                examId,
            }),
        })

        const response = await POST(request)

        expect(response.status).toBe(401)
    })
})
