import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IInvitation extends Document {
    token: string
    classId?: mongoose.Types.ObjectId // Optional if school invitation
    schoolId?: mongoose.Types.ObjectId // Optional if class invitation
    role?: string // Role to assign (e.g. TEACHER, ADMIN, STUDENT)
    email?: string // Optional for link invitations
    type: 'LINK' | 'INDIVIDUAL'
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED'
    expiresAt?: Date
    createdBy: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const InvitationSchema = new Schema<IInvitation>(
    {
        token: {
            type: String,
            required: true,
            unique: true
        },
        classId: {
            type: Schema.Types.ObjectId,
            ref: 'Class'
        },
        schoolId: {
            type: Schema.Types.ObjectId,
            ref: 'School'
        },
        role: {
            type: String,
            default: 'STUDENT'
        },
        email: {
            type: String,
            // Only required for individual invitations
        },
        type: {
            type: String,
            enum: ['LINK', 'INDIVIDUAL'],
            required: true
        },
        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'EXPIRED'],
            default: 'PENDING'
        },
        expiresAt: {
            type: Date
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
)

// Indexes
InvitationSchema.index({ token: 1 })
InvitationSchema.index({ classId: 1 })
InvitationSchema.index({ email: 1 })

const Invitation: Model<IInvitation> = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema)

export default Invitation
