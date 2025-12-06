import Invitation from "@/models/Invitation";
import User, { IUser } from "@/models/User";
import Class from "@/models/Class";
import School from "@/models/School";
import crypto from "crypto";
import { sendInvitationEmail, sendAccountActivationEmail } from "@/lib/mail";
import { ClassService } from "./ClassService";
import { SchoolService } from "./SchoolService";
import bcrypt from "bcryptjs";
import { UserRole } from "@/models/enums";

export class InvitationService {

    /**
     * Generate or retrieve an active invitation link for a CLASS
     */
    static async getOrCreateLink(classId: string, teacherId: string) {
        // Check for existing active token
        const existing = await Invitation.findOne({
            classId,
            type: 'LINK',
            status: 'PENDING',
            $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: { $exists: false } }]
        });

        if (existing) {
            return existing;
        }

        // Create new token
        const token = crypto.randomBytes(32).toString('hex');
        const invitation = await Invitation.create({
            token,
            classId,
            type: 'LINK',
            status: 'PENDING',
            createdBy: teacherId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        return invitation;
    }

    /**
     * Generate or retrieve an active invitation link for a SCHOOL
     */
    static async getOrCreateSchoolLink(schoolId: string, teacherId: string, role: string = 'TEACHER') {
        const existing = await Invitation.findOne({
            schoolId,
            type: 'LINK',
            status: 'PENDING',
            role,
            $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: { $exists: false } }]
        });

        if (existing) return existing;

        const token = crypto.randomBytes(32).toString('hex');
        return await Invitation.create({
            token,
            schoolId,
            type: 'LINK',
            status: 'PENDING',
            role,
            createdBy: teacherId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
    }

    /**
     * Invite a single student manually
     */
    static async inviteStudent(classId: string, email: string, name: string, teacherId: string) {
        // 1. Check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Already exists -> Enroll directly
            await ClassService.enrollStudent(classId, existingUser._id.toString());
            return { status: 'ENROLLED', user: existingUser };
        }

        // 2. If not, create user (inactive)
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: UserRole.STUDENT,
            isActive: false, // Needs activation
            emailVerified: false,
        });

        // 3. Create Individual Invitation
        const token = crypto.randomBytes(32).toString('hex');

        await Invitation.create({
            token,
            classId,
            email,
            type: 'INDIVIDUAL',
            status: 'PENDING',
            createdBy: teacherId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        // 4. Send Email
        const classData = await Class.findById(classId);
        const joinLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invitations/${token}/join`;

        await sendAccountActivationEmail(email, joinLink, classData?.name || 'la classe', tempPassword);

        return { status: 'INVITED', user: newUser };
    }

    /**
     * Invite a Teacher manually to a School
     */
    static async inviteTeacher(schoolId: string, email: string, name: string, inviterId: string, role: string = 'TEACHER') {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Add to school directly
            await SchoolService.addTeacherToSchool(schoolId, existingUser._id.toString());
            // Ensure they have the role? Or keep existing?
            // For now assume if they exist they are valid.
            return { status: 'ENROLLED', user: existingUser };
        }

        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role as UserRole, // TEACHER or ADMIN
            isActive: false,
            emailVerified: false,
            // metadata: { source: 'SCHOOL_INVITE' }
        });

        const token = crypto.randomBytes(32).toString('hex');

        await Invitation.create({
            token,
            schoolId,
            email,
            role,
            type: 'INDIVIDUAL',
            status: 'PENDING',
            createdBy: inviterId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const schoolData = await School.findById(schoolId);
        const joinLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invitations/${token}/join`;

        await sendAccountActivationEmail(email, joinLink, schoolData?.name || "l'école", tempPassword);

        return { status: 'INVITED', user: newUser };
    }

    /**
     * Accept an invitation (Link or Individual)
     */
    static async acceptInvitation(token: string, userId: string) {
        const invitation = await Invitation.findOne({ token, status: 'PENDING' });

        if (!invitation) throw new Error("Invitation invalide ou expirée");
        if (invitation.expiresAt && invitation.expiresAt < new Date()) {
            invitation.status = 'EXPIRED';
            await invitation.save();
            throw new Error("Invitation expirée");
        }

        let resourceId = null;

        if (invitation.classId) {
            // Enroll in Class
            await ClassService.enrollStudent(invitation.classId.toString(), userId);
            resourceId = invitation.classId;
        } else if (invitation.schoolId) {
            // Join School
            await SchoolService.addTeacherToSchool(invitation.schoolId.toString(), userId);
            resourceId = invitation.schoolId;
        }

        // If Individual, mark as accepted
        if (invitation.type === 'INDIVIDUAL') {
            invitation.status = 'ACCEPTED';
            await invitation.save();

            // Activate user if this was an activation flow
            const user = await User.findById(userId);
            if (user && !user.isActive) {
                user.isActive = true;
                user.emailVerified = true;
                // Update role if invitation specified one and user didn't have one?
                // if (invitation.role) user.role = invitation.role; 
                await user.save();
            }
        }

        return { success: true, classId: invitation.classId, schoolId: invitation.schoolId };
    }

    /**
     * Process Batch Import for Students
     */
    static async processBatch(classId: string, students: { name: string; email: string }[], teacherId: string) {
        const results = {
            enrolled: 0,
            invited: 0,
            errors: 0
        };

        for (const student of students) {
            try {
                if (!student.email || !student.name) continue;

                const result = await this.inviteStudent(classId, student.email, student.name, teacherId);
                if (result.status === 'ENROLLED') results.enrolled++;
                else if (result.status === 'INVITED') results.invited++;
            } catch (err) {
                console.error(`Error processing student ${student.email}:`, err);
                results.errors++;
            }
        }

        return results;
    }

    /**
    * Process Batch Import for Teachers
    */
    static async processTeacherBatch(schoolId: string, teachers: { name: string; email: string }[], inviterId: string) {
        const results = {
            enrolled: 0,
            invited: 0,
            errors: 0
        };

        for (const teacher of teachers) {
            try {
                if (!teacher.email || !teacher.name) continue;

                const result = await this.inviteTeacher(schoolId, teacher.email, teacher.name, inviterId);
                if (result.status === 'ENROLLED') results.enrolled++;
                else if (result.status === 'INVITED') results.invited++;
            } catch (err) {
                console.error(`Error processing teacher ${teacher.email}:`, err);
                results.errors++;
            }
        }
        return results;
    }

}
