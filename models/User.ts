import mongoose, { Schema, Document, Model } from 'mongoose'

export enum Role {
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER'
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    email: string
    password?: string // Optional for OAuth users
    role?: Role
    studentCode?: string
    image?: string // Profile picture
    googleId?: string // Google OAuth ID
    githubId?: string // GitHub OAuth ID
    emailVerified?: boolean // Email verification status
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
            required: false, // Not required for OAuth users
        },
        image: {
            type: String,
            required: false,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        githubId: {
            type: String,
            unique: true,
            sparse: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: Object.values(Role),
            // No default role - must be selected during onboarding
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
