import { Types } from 'mongoose'

// Mock User Data
export const mockUser = {
    _id: new Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    role: 'STUDENT',
    subSystem: 'FRANCOPHONE',
    institution: 'Test School',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
}

export const mockTeacher = {
    ...mockUser,
    _id: new Types.ObjectId(),
    email: 'teacher@example.com',
    role: 'TEACHER',
}

// Mock Exam Data
export const mockExam = {
    _id: new Types.ObjectId(),
    title: 'Test Exam',
    description: 'A test exam for unit testing',
    startTime: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
    duration: 60, // 60 minutes
    closeMode: 'STRICT',
    createdById: mockTeacher._id,
    createdAt: new Date(),
    updatedAt: new Date(),
}

// Mock Question Data
export const mockQuestion = {
    _id: new Types.ObjectId(),
    examId: mockExam._id,
    text: 'What is 2 + 2?',
    points: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
}

// Mock Option Data
export const mockOptions = [
    {
        _id: new Types.ObjectId(),
        questionId: mockQuestion._id,
        text: '3',
        isCorrect: false,
    },
    {
        _id: new Types.ObjectId(),
        questionId: mockQuestion._id,
        text: '4',
        isCorrect: true,
    },
    {
        _id: new Types.ObjectId(),
        questionId: mockQuestion._id,
        text: '5',
        isCorrect: false,
    },
]

// Mock Attempt Data
export const mockAttempt = {
    _id: new Types.ObjectId(),
    examId: mockExam._id,
    userId: mockUser._id,
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    status: 'STARTED',
    resumeToken: 'test-resume-token-123',
}

// Mock Response Data
export const mockResponse = {
    _id: new Types.ObjectId(),
    attemptId: mockAttempt._id,
    questionId: mockQuestion._id,
    selectedOptionId: mockOptions[1]._id, // Correct answer
    isCorrect: true,
}

// Mock LateCode Data
export const mockLateCode = {
    _id: new Types.ObjectId(),
    code: 'LATE123',
    examId: mockExam._id,
    usagesRemaining: 1,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
}

// Helper to create mock exam with questions
export function createMockExamWithQuestions(questionCount = 5) {
    const exam = { ...mockExam, _id: new Types.ObjectId() }
    const questions = Array.from({ length: questionCount }, (_, i) => ({
        ...mockQuestion,
        _id: new Types.ObjectId(),
        examId: exam._id,
        text: `Question ${i + 1}`,
    }))

    return { exam, questions }
}

// Helper to create mock session
export function createMockSession(overrides = {}) {
    return {
        user: {
            id: mockUser._id.toString(),
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            ...overrides,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
}
