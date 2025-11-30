import { ProfileFactory } from '@/lib/factories/ProfileFactory'
import User from '@/models/User'
import LearnerProfile from '@/models/LearnerProfile'
import PedagogicalProfile from '@/models/PedagogicalProfile'
import { UserRole, SubSystem } from '@/models/enums'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../../helpers/db-setup'
import mongoose from 'mongoose'

describe('ProfileFactory', () => {
    beforeAll(async () => {
        await setupTestDB()
    })

    afterAll(async () => {
        await teardownTestDB()
    })

    afterEach(async () => {
        await clearTestDB()
    })

    describe('createUser', () => {
        it('should create a Student user with LearnerProfile', async () => {
            const userData = {
                name: 'John Student',
                email: 'student@example.com',
                password: 'password123',
                role: UserRole.STUDENT,
                subSystem: SubSystem.FRANCOPHONE,
                institution: 'Lycée Test'
            }

            const { user, profile } = await ProfileFactory.createUser(userData)

            expect(user).toBeDefined()
            expect(user.role).toBe(UserRole.STUDENT)
            expect(profile).toBeDefined()

            const learnerProfile = await LearnerProfile.findOne({ user: user._id })
            expect(learnerProfile).toBeDefined()
            expect(learnerProfile?._id.toString()).toBe(profile?._id.toString())
        })

        it('should create a Teacher user with PedagogicalProfile', async () => {
            const userData = {
                name: 'Jane Teacher',
                email: 'teacher@example.com',
                password: 'password123',
                role: UserRole.TEACHER,
                subSystem: SubSystem.ANGLOPHONE,
                institution: 'College Test'
            }

            const { user, profile } = await ProfileFactory.createUser(userData)

            expect(user).toBeDefined()
            expect(user.role).toBe(UserRole.TEACHER)
            expect(profile).toBeDefined()

            const pedagogicalProfile = await PedagogicalProfile.findOne({ user: user._id })
            expect(pedagogicalProfile).toBeDefined()
            expect(pedagogicalProfile?._id.toString()).toBe(profile?._id.toString())
        })

        it('should rollback if profile creation fails', async () => {
            // Mock LearnerProfile.create to throw error
            const originalCreate = LearnerProfile.create
            jest.spyOn(LearnerProfile, 'create').mockRejectedValueOnce(new Error('Profile creation failed') as never)

            const userData = {
                name: 'Fail Student',
                email: 'fail@example.com',
                password: 'password123',
                role: UserRole.STUDENT
            }

            await expect(ProfileFactory.createUser(userData)).rejects.toThrow('Profile creation failed')

            // Verify user was not created
            const user = await User.findOne({ email: 'fail@example.com' })
            expect(user).toBeNull()

            // Restore mock
            jest.spyOn(LearnerProfile, 'create').mockImplementation(originalCreate)
        })
    })
})
