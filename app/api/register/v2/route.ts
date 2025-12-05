import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import LearnerProfile from "@/models/LearnerProfile"
import PedagogicalProfile from "@/models/PedagogicalProfile"
import { SchoolService } from "@/lib/services/SchoolService"
import { ClassService } from "@/lib/services/ClassService"
import { UserRole } from "@/models/enums"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        await connectDB()
        const data = await req.json()

        const { name, email, password, role, schoolId, classId, newSchoolData } = data

        // 1. Check if user exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "User already exists" },
                { status: 400 }
            )
        }

        // 2. Create User
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            isActive: true
        })

        // 3. Handle Role Specific Logic
        if (role === UserRole.STUDENT) {
            // Create LearnerProfile
            const profile = await LearnerProfile.create({
                user: user._id,
                currentLevel: data.levelId, // Assuming passed
                currentField: data.fieldId, // Assuming passed
                // ... defaults
            })

            // Link profile to user
            user.learnerProfile = profile._id

            // Enroll in class if selected
            if (classId) {
                await ClassService.enrollStudent(classId, user._id.toString())
            }

            // Link to school if selected
            if (schoolId) {
                user.schools = [schoolId]
            }

        } else if (role === UserRole.TEACHER) {
            // Create PedagogicalProfile
            const profile = await PedagogicalProfile.create({
                user: user._id,
                teachingSubjects: data.subjects || [],
                // ... defaults
            })

            // Link profile to user
            user.pedagogicalProfile = profile._id

            // Create School if requested
            if (newSchoolData) {
                const school = await SchoolService.createSchool(newSchoolData, user._id.toString())
                // User is already added to school admins/teachers in createSchool
            } else if (schoolId) {
                // Join existing school (logic to be defined, maybe pending approval?)
                // For now, just link
                user.schools = [schoolId]
            }
        }

        await user.save()

        return NextResponse.json({ success: true, message: "Registration successful" })
    } catch (error: any) {
        console.error("Registration Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
