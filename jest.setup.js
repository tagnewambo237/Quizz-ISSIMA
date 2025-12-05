// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for TextEncoder/TextDecoder (required for MongoDB in tests)
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            pathname: '/',
            query: {},
            asPath: '/',
        }
    },
    usePathname() {
        return '/'
    },
    useSearchParams() {
        return new URLSearchParams()
    },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
    useSession() {
        return {
            data: null,
            status: 'unauthenticated',
        }
    },
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
}))

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/Xkorin School-test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
