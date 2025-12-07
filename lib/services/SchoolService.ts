import School, { ISchool } from "@/models/School";
import User, { IUser } from "@/models/User";
import Class from "@/models/Class";
import mongoose from "mongoose";

export class SchoolService {

    /**
     * Get School Stats
     * Returns: Total Students, Total Teachers, Active Classes, Average Score
     */
    /**
     * Get School Stats & Details
     */
    static async getSchoolStats(schoolId: string) {
        const Attempt = mongoose.models.Attempt || mongoose.model('Attempt');

        // 1. Basic Counts
        const school = await School.findById(schoolId).select('-teachers -admins'); // Exclude heavy arrays
        if (!school) return null;

        // Re-fetch for counts if needed or rely on array lengths from a separate lightweight query?
        // Better to count via DB queries if arrays are huge, but for now school.teachers.length is fine if we loaded it.
        // Wait, I excluded them. Let's count via distinct queries.

        const teachersCount = await School.findById(schoolId).select('teachers').then(s => s?.teachers.length || 0);
        const adminsCount = await School.findById(schoolId).select('admins').then(s => s?.admins.length || 0);

        const classes = await Class.find({ school: schoolId });
        const classesCount = classes.length;

        // 2. Students Count (Unique students across all classes)
        const allStudents = classes.flatMap((c: any) => c.students);
        // Use Set to count unique IDs
        const uniqueStudents = new Set(allStudents.map((id: any) => id.toString()));
        const studentsCount = uniqueStudents.size;

        // 3. Average Score (Global)
        const studentIds = Array.from(uniqueStudents);

        let averageScore = 0;
        if (studentIds.length > 0) {
            const stats = await Attempt.aggregate([
                {
                    $match: {
                        userId: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id as string)) },
                        status: 'COMPLETED'
                    }
                },
                {
                    $group: {
                        _id: null,
                        avg: { $avg: "$percentage" }
                    }
                }
            ]);
            averageScore = stats.length > 0 ? stats[0].avg : 0;
        }

        return {
            details: school,
            stats: {
                totalStudents: studentsCount,
                totalTeachers: teachersCount,
                adminsCount,
                activeClasses: classesCount,
                averageScore: Math.round(averageScore * 10) / 10
            }
        };
    }

    /**
     * Get Teachers List
     */
    static async getSchoolTeachers(schoolId: string) {
        // Find all users who have this school in their schools array
        const teachers = await User.find({
            schools: schoolId,
            role: 'TEACHER',
            isActive: true
        }).select('name email role isActive metadata.avatar lastLogin createdAt');

        return teachers;
    }

    /**
     * Add Teacher to School
     */
    static async addTeacherToSchool(schoolId: string, userId: string) {
        return await School.findByIdAndUpdate(
            schoolId,
            { $addToSet: { teachers: userId } },
            { new: true }
        );
    }

    /**
     * Remove Teacher from School
     */
    static async removeTeacherFromSchool(schoolId: string, userId: string) {
        // Also remove school from user?
        await User.findByIdAndUpdate(userId, { $pull: { schools: schoolId } });

        return await School.findByIdAndUpdate(
            schoolId,
            { $pull: { teachers: userId } },
            { new: true }
        );
    }

    /**
     * Get Public Schools (for discovery)
     */
    static async getPublicSchools() {
        return await School.find({
            status: 'APPROVED',
            isActive: true
        })
            .select('name type address logoUrl contactInfo createdAt applicants')
            .sort({ name: 1 })
            .limit(20);
    }

    /**
     * Get Teacher's Schools (Owned or Member)
     */
    static async getTeacherSchools(userId: string) {
        // Find schools where user is owner or in teachers list
        return await School.find({
            $or: [
                { owner: userId },
                { teachers: userId },
                { admins: userId }
            ]
        }).select('name type logoUrl status type address');
    }

    /**
     * Get School Classes
     */
    static async getSchoolClasses(schoolId: string) {
        return await Class.find({ school: schoolId })
            .populate('mainTeacher', 'name email') // Main teacher
            .populate('level', 'name')
            .populate('specialty', 'name')
            .populate('field', 'code name')
            .select('name level specialty field academicYear students mainTeacher')
            .sort({ name: 1 });
    }

    // ==========================================
    // TEACHER APPROVAL METHODS (For School Admins)
    // ==========================================

    /**
     * Get pending teacher applications for a school
     */
    static async getPendingTeachers(schoolId: string) {
        const school = await School.findById(schoolId)
            .populate('applicants', 'name email createdAt metadata.avatar')
            .select('applicants');

        return school?.applicants || [];
    }

    /**
     * Approve a teacher application
     */
    static async approveTeacher(schoolId: string, teacherId: string) {
        // Move from applicants to teachers
        const school = await School.findByIdAndUpdate(
            schoolId,
            {
                $pull: { applicants: teacherId },
                $addToSet: { teachers: teacherId }
            },
            { new: true }
        );

        // Add school to teacher's schools list
        await User.findByIdAndUpdate(teacherId, {
            $addToSet: { schools: schoolId }
        });

        return school;
    }

    /**
     * Reject a teacher application
     */
    static async rejectTeacher(schoolId: string, teacherId: string) {
        // Remove from applicants
        const school = await School.findByIdAndUpdate(
            schoolId,
            { $pull: { applicants: teacherId } },
            { new: true }
        );

        // Remove school from teacher's schools list
        await User.findByIdAndUpdate(teacherId, {
            $pull: { schools: schoolId }
        });

        return school;
    }
}

