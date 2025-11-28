import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOption extends Document {
    _id: mongoose.Types.ObjectId
    questionId: mongoose.Types.ObjectId
    text: string
    isCorrect: boolean
}

const OptionSchema = new Schema<IOption>({
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        default: false,
    },
})

const Option: Model<IOption> = mongoose.models.Option || mongoose.model<IOption>('Option', OptionSchema)

export default Option
