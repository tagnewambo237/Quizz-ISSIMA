import mongoose, { Schema, Document, Model } from 'mongoose'
import { CognitiveProfile, LearnerType, SubscriptionStatus, LearningMode } from './enums'

export interface ILearnerProfile extends Document {
    user: mongoose.Types.ObjectId
    currentLevel?: mongoose.Types.ObjectId
    currentField?: mongoose.Types.ObjectId
    enrollmentDate?: Date
    expectedGraduationDate?: Date

    cognitiveProfile?: CognitiveProfile
    learnerType?: LearnerType

    subscriptionStatus: SubscriptionStatus
    subscriptionExpiry?: Date

    preferredLearningMode?: LearningMode

    stats: {
        totalExamsTaken: number
        averageScore: number
        totalStudyTime: number // minutes
        strongSubjects: mongoose.Types.ObjectId[]
        weakSubjects: mongoose.Types.ObjectId[]
        lastActivityDate?: Date
    }

    gamification: {
        level: number
        xp: number
        badges: {
            badgeId: string
            earnedAt: Date
        }[]
        streak: number
    }

    createdAt: Date
    updatedAt: Date
}

const LearnerProfileSchema = new Schema<ILearnerProfile>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        currentLevel: { type: Schema.Types.ObjectId, ref: 'EducationLevel' },
        currentField: { type: Schema.Types.ObjectId, ref: 'Field' },
        enrollmentDate: Date,
        expectedGraduationDate: Date,

        cognitiveProfile: { type: String, enum: Object.values(CognitiveProfile) },
        learnerType: { type: String, enum: Object.values(LearnerType) },

        subscriptionStatus: { type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.FREEMIUM },
        subscriptionExpiry: Date,

        preferredLearningMode: { type: String, enum: Object.values(LearningMode) },

        stats: {
            totalExamsTaken: { type: Number, default: 0 },
            averageScore: { type: Number, default: 0 },
            totalStudyTime: { type: Number, default: 0 },
            strongSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
            weakSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
            lastActivityDate: Date
        },

        gamification: {
            level: { type: Number, default: 1 },
            xp: { type: Number, default: 0 },
            badges: [{
                badgeId: String,
                earnedAt: Date
            }],
            streak: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
)

// Indexes
LearnerProfileSchema.index({ currentLevel: 1, currentField: 1 })
LearnerProfileSchema.index({ subscriptionStatus: 1 })

const LearnerProfile: Model<ILearnerProfile> = mongoose.models.LearnerProfile || mongoose.model<ILearnerProfile>('LearnerProfile', LearnerProfileSchema)

export default LearnerProfile
