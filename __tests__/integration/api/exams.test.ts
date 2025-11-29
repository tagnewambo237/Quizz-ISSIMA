import { POST } from '@/app/api/exams/route'
import Exam from '@/models/Exam'
import User from '@/models/User'
import Question from '@/models/Question'
import Option from '@/models/Option'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import { NextRequest } from 'next/server'
import { addHours } from 'date-fns'
import mongoose from 'mongoose'

// Mock NextAuth
const mockTeacherId = new mongoose.Types.ObjectId().toString()
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() =>
        Promise.resolve({
            user: { id: mockTeacherId, role: 'TEACHER' },
        })
    ),
}))

describe('POST /api/exams', () => {
    beforeAll(async () => {
        await setupTestDB()
    }, 30000)

    afterAll(async () => {
        await teardownTestDB()
    })

    beforeEach(async () => {
        // Create teacher user before each test
        await User.create({
            _id: new mongoose.Types.ObjectId(mockTeacherId),
            name: 'Teacher',
            email: 'teacher@example.com',
            password: 'hashedpassword',
            role: 'TEACHER',
        })
    })

    afterEach(async () => {
        await clearTestDB()
    })

    it('should create an exam with questions and options', async () => {
        const examData = {
            title: 'Test Exam',
            description: 'A test exam',
            startTime: new Date().toISOString(),
            endTime: addHours(new Date(), 24).toISOString(),
            duration: 60,
            closeMode: 'STRICT',
            questions: [
                {
                    text: 'What is 2 + 2?',
                    points: 1,
                    options: [
                        { text: '3', isCorrect: false },
                        { text: '4', isCorrect: true },
                        { text: '5', isCorrect: false },
                    ],
                },
                {
                    text: 'What is the capital of France?',
                    points: 1,
                    options: [
                        { text: 'London', isCorrect: false },
                        { text: 'Paris', isCorrect: true },
                        { text: 'Berlin', isCorrect: false },
                    ],
                },
            ],
        }

        const request = new NextRequest('http://localhost:3000/api/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(examData),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.exam.title).toBe('Test Exam')
        expect(data.exam.duration).toBe(60)

        // Verify questions were created
        const questions = await Question.find({ examId: data.exam.id })
        expect(questions).toHaveLength(2)

        // Verify options were created
        const options = await Option.find({ questionId: questions[0]._id })
        expect(options).toHaveLength(3)
    })

    it('should reject exam creation for students', async () => {
        const { getServerSession } = require('next-auth/next')
        getServerSession.mockResolvedValueOnce({
            user: { id: 'student-id', role: 'STUDENT' },
        })

        const request = new NextRequest('http://localhost:3000/api/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Test Exam',
                startTime: new Date().toISOString(),
                endTime: addHours(new Date(), 24).toISOString(),
                duration: 60,
                questions: [],
            }),
        })

        const response = await POST(request)

        expect(response.status).toBe(401)
    })

    it('should require authentication', async () => {
        const { getServerSession } = require('next-auth/next')
        getServerSession.mockResolvedValueOnce(null)

        const request = new NextRequest('http://localhost:3000/api/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Test Exam',
                startTime: new Date().toISOString(),
                endTime: addHours(new Date(), 24).toISOString(),
                duration: 60,
                questions: [],
            }),
        })

        const response = await POST(request)

        expect(response.status).toBe(401)
    })

    it('should validate required fields', async () => {
        const request = new NextRequest('http://localhost:3000/api/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Missing required fields
                title: 'Test Exam',
            }),
        })

        const response = await POST(request)

        expect(response.status).toBe(400)
    })

    it('should set default closeMode to STRICT', async () => {
        const examData = {
            title: 'Test Exam',
            startTime: new Date().toISOString(),
            endTime: addHours(new Date(), 24).toISOString(),
            duration: 60,
            questions: [],
        }

        const request = new NextRequest('http://localhost:3000/api/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(examData),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.exam.closeMode).toBe('STRICT')
    })
})
