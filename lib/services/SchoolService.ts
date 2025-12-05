import School, { ISchool, SchoolType } from "@/models/School"
import { SchoolStatus } from "@/models/enums"
import User from "@/models/User"
import mongoose from "mongoose"

export class SchoolService {
    /**
     * Create a new school (Pending Validation)
     */
    static async createSchool(data: Partial<ISchool>, ownerId: string) {
        const schools = await School.create([{
            ...data,
            owner: ownerId,
            status: SchoolStatus.PENDING,
            admins: [ownerId],
            teachers: [ownerId]
        }] as any) as any

        const school = schools[0]

        // Add to user's schools
        await User.findByIdAndUpdate(ownerId, {
            $addToSet: { schools: school._id }
        })

        return school
    }

    /**
     * Validate a school (Admin only)
     */
    static async validateSchool(schoolId: string, adminId: string) {
        // TODO: Check if adminId has rights (SuperAdmin)

        const school = await School.findByIdAndUpdate(
            schoolId,
            { status: SchoolStatus.VALIDATED },
            { new: true }
        )
        return school
    }

    /**
     * Get schools by owner
     */
    static async getMySchools(userId: string) {
        return await School.find({
            $or: [
                { owner: userId },
                { admins: userId },
                { teachers: userId }
            ]
        }).sort({ createdAt: -1 })
    }

    /**
     * Search schools (for students to join)
     */
    static async searchSchools(query: string) {
        return await School.find({
            name: { $regex: query, $options: 'i' },
            status: SchoolStatus.VALIDATED,
            isActive: true
        }).select('name type address logoUrl')
    }
}
