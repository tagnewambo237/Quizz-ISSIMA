import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { role } = await req.json()

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

        user.role = role

        // Generate student code if role is STUDENT
        if (role === "STUDENT") {
            user.studentCode = Math.random().toString(36).substring(2, 10).toUpperCase()
        }

        await user.save()

        return NextResponse.json(
            { message: "Role updated successfully", user },
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
