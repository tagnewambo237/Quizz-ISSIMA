import mongoose, { Schema, Document, Model } from 'mongoose'

export enum CloseMode {
    STRICT = 'STRICT',
    PERMISSIVE = 'PERMISSIVE'
}

export interface IExam extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    description?: string
    startTime: Date
    endTime: Date
    duration: number // in minutes
    closeMode: CloseMode
    createdById: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const ExamSchema = new Schema<IExam>(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        closeMode: {
            type: String,
            enum: Object.values(CloseMode),
            default: CloseMode.STRICT,
        },
        createdById: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const Exam: Model<IExam> = mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema)

export default Exam
