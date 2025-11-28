import mongoose, { Schema, Document, Model } from 'mongoose'

export enum AttemptStatus {
    STARTED = 'STARTED',
    COMPLETED = 'COMPLETED'
}

export interface IAttempt extends Document {
    _id: mongoose.Types.ObjectId
    examId: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    startedAt: Date
    expiresAt: Date
    submittedAt?: Date
    status: AttemptStatus
    score?: number
    resumeToken: string
}

const AttemptSchema = new Schema<IAttempt>({
    examId: {
        type: Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    submittedAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: Object.values(AttemptStatus),
        default: AttemptStatus.STARTED,
    },
    score: {
        type: Number,
    },
    resumeToken: {
        type: String,
        required: true,
        unique: true,
    },
})

const Attempt: Model<IAttempt> = mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema)

export default Attempt
