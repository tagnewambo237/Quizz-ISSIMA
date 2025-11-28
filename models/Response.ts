import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IResponse extends Document {
    _id: mongoose.Types.ObjectId
    attemptId: mongoose.Types.ObjectId
    questionId: mongoose.Types.ObjectId
    selectedOptionId: mongoose.Types.ObjectId
    isCorrect: boolean
}

const ResponseSchema = new Schema<IResponse>({
    attemptId: {
        type: Schema.Types.ObjectId,
        ref: 'Attempt',
        required: true,
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    selectedOptionId: {
        type: Schema.Types.ObjectId,
        ref: 'Option',
        required: true,
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
})

const Response: Model<IResponse> = mongoose.models.Response || mongoose.model<IResponse>('Response', ResponseSchema)

export default Response
