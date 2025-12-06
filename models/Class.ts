import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClass extends Document {
    _id: mongoose.Types.ObjectId
    name: string // Ex: "Tle C 2"
    school: mongoose.Types.ObjectId // Ref: 'School'
    mainTeacher: mongoose.Types.ObjectId // Ref: 'User'

    level: mongoose.Types.ObjectId // Ref: 'EducationLevel'
    field?: mongoose.Types.ObjectId // Ref: 'Field'
    specialty?: mongoose.Types.ObjectId // Ref: 'Field' (Sous-spécialité)


    students: mongoose.Types.ObjectId[] // Ref: 'User'
    academicYear: string // Ex: "2024-2025"

    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const ClassSchema = new Schema<IClass>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: true
        },
        mainTeacher: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        level: {
            type: Schema.Types.ObjectId,
            ref: 'EducationLevel',
            required: true
        },
        field: {
            type: Schema.Types.ObjectId,
            ref: 'Field'
        },
        specialty: {
            type: Schema.Types.ObjectId,
            ref: 'Field'
        },
        students: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        academicYear: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

// Indexes
ClassSchema.index({ school: 1, academicYear: 1 })
ClassSchema.index({ mainTeacher: 1 })
ClassSchema.index({ students: 1 })

const Class: Model<IClass> = mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema)

export default Class
