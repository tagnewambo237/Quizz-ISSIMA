import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ILateCode extends Document {
    _id: mongoose.Types.ObjectId
    code: string
    examId: mongoose.Types.ObjectId
    usagesRemaining: number
    expiresAt?: Date
    assignedUserId?: mongoose.Types.ObjectId
}

const LateCodeSchema = new Schema<ILateCode>({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    examId: {
        type: Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },
    usagesRemaining: {
        type: Number,
        default: 1,
    },
    expiresAt: {
        type: Date,
    },
    assignedUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
})

const LateCode: Model<ILateCode> = mongoose.models.LateCode || mongoose.model<ILateCode>('LateCode', LateCodeSchema)

export default LateCode
