import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["STUDENT", "TEACHER"]),
})

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        await connectDB()

        const body = await req.json()
        const { name, email, password, role } = registerSchema.parse(body)

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            studentCode: role === "STUDENT" ? Math.random().toString(36).substring(2, 10).toUpperCase() : undefined,
        })

        return NextResponse.json(
            {
                message: "User created successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    studentCode: user.studentCode
                }
            },
            { status: 201 }
        )
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { message: "Invalid input data" },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
