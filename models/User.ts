import mongoose, { Schema, Document, Model } from 'mongoose'

export enum Role {
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER'
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    email: string
    password: string
    role: Role
    studentCode?: string
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.STUDENT,
        },
        studentCode: {
            type: String,
            unique: true,
            sparse: true, // Allows null values while maintaining uniqueness
        },
    },
    {
        timestamps: true,
    }
)

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
