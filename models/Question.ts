import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IQuestion extends Document {
    _id: mongoose.Types.ObjectId
    examId: mongoose.Types.ObjectId
    text: string
    imageUrl?: string
    points: number
}

const QuestionSchema = new Schema<IQuestion>({
    examId: {
        type: Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
    },
    points: {
        type: Number,
        default: 1,
    },
})

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema)

export default Question
