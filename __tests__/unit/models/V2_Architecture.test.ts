import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import EducationLevel from '@/models/EducationLevel'
import Field from '@/models/Field'
import Subject from '@/models/Subject'
import User from '@/models/User'
import { ProfileFactory } from '@/lib/profile-factory'
import { Cycle, SubSystem, FieldCategory, SubjectType, UserRole } from '@/models/enums'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri)
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

afterEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
})

describe('V2 Core Architecture', () => {
    describe('Education Structure (Composite Pattern)', () => {
        it('should create a valid EducationLevel', async () => {
            const level = await EducationLevel.create({
                name: 'Terminale C',
                code: 'TLE_C',
                cycle: Cycle.LYCEE,
                subSystem: SubSystem.FRANCOPHONE,
                order: 12,
                metadata: {
                    displayName: { fr: 'Terminale C', en: 'Upper Sixth Science' }
                }
            })

            expect(level._id).toBeDefined()
            expect(level.code).toBe('TLE_C')
        })

        it('should create a Field linked to a Level', async () => {
            const level = await EducationLevel.create({
                name: 'Terminale',
                code: 'TLE',
                cycle: Cycle.LYCEE,
                subSystem: SubSystem.FRANCOPHONE,
                order: 12,
                metadata: { displayName: { fr: 'Tle', en: 'U6' } }
            })

            const field = await Field.create({
                name: 'Série C',
                code: 'SERIE_C',
                category: FieldCategory.SERIE,
                cycle: Cycle.LYCEE,
                subSystem: SubSystem.FRANCOPHONE,
                applicableLevels: [level._id],
                metadata: { displayName: { fr: 'Série C', en: 'Science' } }
            })

            expect(field.applicableLevels).toContainEqual(level._id)
        })

        it('should create a Subject linked to Level and Field', async () => {
            const subject = await Subject.create({
                name: 'Mathématiques',
                code: 'MATH_TLE_C',
                subSystem: SubSystem.FRANCOPHONE,
                subjectType: SubjectType.DISCIPLINE,
                metadata: { displayName: { fr: 'Maths', en: 'Maths' } }
            })

            expect(subject._id).toBeDefined()
        })
    })

    describe('User Profile System (Factory Pattern)', () => {
        it('should create a LearnerProfile for a STUDENT user', async () => {
            const user = await User.create({
                name: 'Student Test',
                email: 'student@test.com',
                role: UserRole.STUDENT,
                subSystem: SubSystem.FRANCOPHONE
            })

            const profile = await ProfileFactory.createProfile(user)

            expect(profile).toBeDefined()
            // Check if it's a LearnerProfile (has gamification)
            expect((profile as any).gamification).toBeDefined()
            expect((profile as any).user).toEqual(user._id)
        })

        it('should create a PedagogicalProfile for a TEACHER user', async () => {
            const user = await User.create({
                name: 'Teacher Test',
                email: 'teacher@test.com',
                role: UserRole.TEACHER,
                subSystem: SubSystem.FRANCOPHONE
            })

            const profile = await ProfileFactory.createProfile(user)

            expect(profile).toBeDefined()
            // Check if it's a PedagogicalProfile (has stats.totalExamsCreated)
            expect((profile as any).stats.totalExamsCreated).toBeDefined()
            expect((profile as any).user).toEqual(user._id)
        })
    })
})
