import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import LearnerProfile from "@/models/LearnerProfile"
import PedagogicalProfile from "@/models/PedagogicalProfile"
import { UserRole, SubscriptionStatus } from "@/models/enums"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { role, details } = await req.json()

        if (!role || !["STUDENT", "TEACHER"].includes(role)) {
            return NextResponse.json(
                { message: "Invalid role selected" },
                { status: 400 }
            )
        }

        await connectDB()

        const user = await User.findOne({ email: session.user.email })

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            )
        }

        // Prevent changing role if already set (security measure)
        if (user.role) {
            return NextResponse.json(
                { message: "Role already assigned" },
                { status: 400 }
            )
        }

        // Update User Role
        user.role = role

        // Generate student code if role is STUDENT
        if (role === "STUDENT") {
            user.studentCode = Math.random().toString(36).substring(2, 10).toUpperCase()

            // Create LearnerProfile
            // Note: In a real app, we would resolve level/field IDs from the database
            // Here we store the raw values or look them up if we had the hierarchy populated
            await LearnerProfile.create({
                user: user._id,
                subscriptionStatus: SubscriptionStatus.FREEMIUM,
                // We store these temporarily in metadata or map them to IDs if possible
                // For this implementation, we assume the profile schema might need adjustment 
                // or we just create the basic profile and let the user refine it later
                // But let's try to map what we can
                stats: {
                    totalExamsTaken: 0,
                    averageScore: 0,
                    totalStudyTime: 0
                },
                gamification: {
                    level: 1,
                    xp: 0,
                    badges: [],
                    streak: 0
                }
            })
        } else if (role === "TEACHER") {
            // Create PedagogicalProfile
            await PedagogicalProfile.create({
                user: user._id,
                // Store subjects and levels in metadata or specific fields
                // Assuming the schema supports storing these as strings or we need to map them
                // For now, we create the base profile
                contributionTypes: [],
                accessScope: 'SUBJECT', // Default for teachers
                scopeDetails: {
                    specificSubjects: [], // Would need to map names to IDs
                    specificLevels: [],   // Would need to map names to IDs
                    specificFields: []
                },
                stats: {
                    totalExamsCreated: 0,
                    totalExamsValidated: 0,
                    totalStudentsSupervised: 0,
                    averageStudentScore: 0
                }
            })
        }

        await user.save()

        return NextResponse.json(
            { message: "Onboarding completed successfully", user },
            { status: 200 }
        )

    } catch (error) {
        console.error("[Onboarding API] Error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
