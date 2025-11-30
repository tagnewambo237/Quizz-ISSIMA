import { AccessHandlerChain, AccessRequest } from '@/lib/patterns/AccessHandler'
import PedagogicalProfile, { IPedagogicalProfile } from '@/models/PedagogicalProfile'
import User from '@/models/User'
import { UserRole, AccessScope, ContributionType, ReportingAccess, SubSystem } from '@/models/enums'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../../helpers/db-setup'
import mongoose from 'mongoose'

describe('AccessHandler - Chain of Responsibility Pattern', () => {
    beforeAll(async () => {
        await setupTestDB()
    })

    afterAll(async () => {
        await teardownTestDB()
    })

    afterEach(async () => {
        await clearTestDB()
    })

    describe('GlobalAccessHandler', () => {
        it('should grant access to all resources for GLOBAL scope', async () => {
            const user = await User.create({
                name: 'Global Admin',
                email: 'admin@example.com',
                password: 'password123',
                role: UserRole.DG_M4M,
                subSystem: SubSystem.FRANCOPHONE
            })

            const profile = await PedagogicalProfile.create({
                user: user._id,
                accessScope: AccessScope.GLOBAL,
                contributionTypes: [ContributionType.MANAGER],
                reportingAccess: ReportingAccess.GLOBAL,
                scopeDetails: {
                    specificSubjects: [],
                    specificLevels: [],
                    specificFields: []
                }
            })

            const request: AccessRequest = {
                profile: profile as IPedagogicalProfile,
                resourceType: 'exam',
                resourceId: new mongoose.Types.ObjectId()
            }

            const hasAccess = await AccessHandlerChain.checkAccess(request)
            expect(hasAccess).toBe(true)
        })
    })

    describe('LocalAccessHandler', () => {
        it('should grant access to resources from same institution', async () => {
            const user = await User.create({
                name: 'Principal',
                email: 'principal@lycee.com',
                password: 'password123',
                role: UserRole.PRINCIPAL,
                subSystem: SubSystem.FRANCOPHONE,
                institution: 'Lycée Joss'
            })

            const profile = await PedagogicalProfile.create({
                user: user._id,
                accessScope: AccessScope.LOCAL,
                contributionTypes: [ContributionType.MANAGER],
                reportingAccess: ReportingAccess.ESTABLISHMENT,
                scopeDetails: {
                    specificInstitution: 'Lycée Joss',
                    specificSubjects: [],
                    specificLevels: [],
                    specificFields: []
                }
            })

            const request: AccessRequest = {
                profile: profile as IPedagogicalProfile,
                resourceType: 'exam',
                institution: 'Lycée Joss'
            }

            const hasAccess = await AccessHandlerChain.checkAccess(request)
            expect(hasAccess).toBe(true)
        })

        it('should deny access to resources from different institution', async () => {
            const user = await User.create({
                name: 'Principal',
                email: 'principal@lycee.com',
                password: 'password123',
                role: UserRole.PRINCIPAL,
                subSystem: SubSystem.FRANCOPHONE,
                institution: 'Lycée Joss'
            })

            const profile = await PedagogicalProfile.create({
                user: user._id,
                accessScope: AccessScope.LOCAL,
                contributionTypes: [ContributionType.MANAGER],
                reportingAccess: ReportingAccess.ESTABLISHMENT,
                scopeDetails: {
                    specificInstitution: 'Lycée Joss',
                    specificSubjects: [],
                    specificLevels: [],
                    specificFields: []
                }
            })

            const request: AccessRequest = {
                profile: profile as IPedagogicalProfile,
                resourceType: 'exam',
                institution: 'Lycée Leclerc'
            }

            const hasAccess = await AccessHandlerChain.checkAccess(request)
            expect(hasAccess).toBe(false)
        })
    })

    describe('SubjectAccessHandler', () => {
        it('should grant access to authorized subjects', async () => {
            const user = await User.create({
                name: 'Math Teacher',
                email: 'math@example.com',
                password: 'password123',
                role: UserRole.TEACHER,
                subSystem: SubSystem.FRANCOPHONE
            })

            const mathSubjectId = new mongoose.Types.ObjectId()

            const profile = await PedagogicalProfile.create({
                user: user._id,
                accessScope: AccessScope.SUBJECT,
                contributionTypes: [ContributionType.CREATOR],
                reportingAccess: ReportingAccess.CLASS,
                scopeDetails: {
                    specificSubjects: [mathSubjectId],
                    specificLevels: [],
                    specificFields: []
                }
            })

            const request: AccessRequest = {
                profile: profile as IPedagogicalProfile,
                resourceType: 'subject',
                resourceId: mathSubjectId
            }

            const hasAccess = await AccessHandlerChain.checkAccess(request)
            expect(hasAccess).toBe(true)
        })

        it('should deny access to unauthorized subjects', async () => {
            const user = await User.create({
                name: 'Math Teacher',
                email: 'math@example.com',
                password: 'password123',
                role: UserRole.TEACHER,
                subSystem: SubSystem.FRANCOPHONE
            })

            const mathSubjectId = new mongoose.Types.ObjectId()
            const physicsSubjectId = new mongoose.Types.ObjectId()

            const profile = await PedagogicalProfile.create({
                user: user._id,
                accessScope: AccessScope.SUBJECT,
                contributionTypes: [ContributionType.CREATOR],
                reportingAccess: ReportingAccess.CLASS,
                scopeDetails: {
                    specificSubjects: [mathSubjectId],
                    specificLevels: [],
                    specificFields: []
                }
            })

            const request: AccessRequest = {
                profile: profile as IPedagogicalProfile,
                resourceType: 'subject',
                resourceId: physicsSubjectId
            }

            const hasAccess = await AccessHandlerChain.checkAccess(request)
            expect(hasAccess).toBe(false)
        })
    })

    describe('LevelAccessHandler', () => {
        it('should grant access to authorized levels', async () => {
            const user = await User.create({
                name: 'Level Coordinator',
                email: 'coordinator@example.com',
                password: 'password123',
                role: UserRole.PREFET,
                subSystem: SubSystem.FRANCOPHONE
            })

            const level6emeId = new mongoose.Types.ObjectId()

            const profile = await PedagogicalProfile.create({
                user: user._id,
                accessScope: AccessScope.LEVEL,
                contributionTypes: [ContributionType.SUPERVISOR],
                reportingAccess: ReportingAccess.FIELD,
                scopeDetails: {
                    specificSubjects: [],
                    specificLevels: [level6emeId],
                    specificFields: []
                }
            })

            const request: AccessRequest = {
                profile: profile as IPedagogicalProfile,
                resourceType: 'level',
                resourceId: level6emeId
            }

            const hasAccess = await AccessHandlerChain.checkAccess(request)
            expect(hasAccess).toBe(true)
        })
    })

    describe('FieldAccessHandler', () => {
        it('should grant access to authorized fields', async () => {
            const user = await User.create({
                name: 'Field Inspector',
                email: 'inspector@example.com',
                password: 'password123',
                role: UserRole.INSPECTOR,
                subSystem: SubSystem.FRANCOPHONE
            })

            const serieAFieldId = new mongoose.Types.ObjectId()

            const profile = await PedagogicalProfile.create({
                user: user._id,
                accessScope: AccessScope.FIELD,
                contributionTypes: [ContributionType.VALIDATOR],
                reportingAccess: ReportingAccess.FIELD,
                scopeDetails: {
                    specificSubjects: [],
                    specificLevels: [],
                    specificFields: [serieAFieldId]
                }
            })

            const request: AccessRequest = {
                profile: profile as IPedagogicalProfile,
                resourceType: 'field',
                resourceId: serieAFieldId
            }

            const hasAccess = await AccessHandlerChain.checkAccess(request)
            expect(hasAccess).toBe(true)
        })
    })
})
