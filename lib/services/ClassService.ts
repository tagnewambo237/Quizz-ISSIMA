import Class, { IClass } from "@/models/Class"
import User from "@/models/User"
import mongoose from "mongoose"

export class ClassService {
    /**
     * Create a new class
     */
    static async createClass(data: Partial<IClass>, teacherId: string) {
        const newClass = await Class.create({
            ...data,
            mainTeacher: teacherId,
            students: []
        })
        return newClass
    }

    /**
     * Enroll a student in a class
     */
    static async enrollStudent(classId: string, studentId: string) {
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { $addToSet: { students: studentId } },
            { new: true }
        )
        return updatedClass
    }

    /**
     * Get classes for a teacher
     */
    static async getTeacherClasses(teacherId: string) {
        return await Class.find({ mainTeacher: teacherId })
            .populate('level', 'name code')
            .populate('school', 'name')
            .sort({ createdAt: -1 })
    }

    /**
     * Get classes for a school
     */
    static async getSchoolClasses(schoolId: string) {
        return await Class.find({ school: schoolId })
            .populate('level', 'name code')
            .populate('mainTeacher', 'name')
            .sort({ name: 1 })
    }

    /**
     * Update a class
     */
    static async updateClass(classId: string, data: Partial<IClass>) {
        return await Class.findByIdAndUpdate(classId, data, { new: true })
    }

    /**
     * Delete a class
     */
    static async deleteClass(classId: string) {
        return await Class.findByIdAndDelete(classId)
    }

    /**
     * Get class by ID with details
     */
    static async getClassById(classId: string) {
        return await Class.findById(classId)
            .populate('level', 'name code')
            .populate('school', 'name')
            .populate('students', 'name email image')
            .populate('mainTeacher', 'name')
    }
}
