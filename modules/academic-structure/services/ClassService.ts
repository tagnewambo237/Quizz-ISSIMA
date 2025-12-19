import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de gestion des classes
 */
export class ClassService {
  /**
   * Crée une nouvelle classe
   */
  static async createClass(data: {
    name: string;
    schoolId: mongoose.Types.ObjectId | string;
    teacherId: mongoose.Types.ObjectId | string;
    syllabusId?: mongoose.Types.ObjectId | string;
    maxStudents?: number;
  }): Promise<{ classId: mongoose.Types.ObjectId }> {
    const schoolIdObj =
      typeof data.schoolId === "string"
        ? new mongoose.Types.ObjectId(data.schoolId)
        : data.schoolId;

    const teacherIdObj =
      typeof data.teacherId === "string"
        ? new mongoose.Types.ObjectId(data.teacherId)
        : data.teacherId;

    // TODO: Logique métier pour créer la classe dans la DB
    // const classDoc = await Class.create({ ...data });

    const classId = new mongoose.Types.ObjectId();

    // Publier événement CLASS_CREATED
    await publishEvent(
      EventType.CLASS_CREATED,
      {
        classId: classId,
        className: data.name,
        schoolId: schoolIdObj,
        teacherId: teacherIdObj,
        syllabusId: data.syllabusId,
        maxStudents: data.maxStudents || 50,
        createdAt: new Date(),
      },
      {
        userId: teacherIdObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[AcademicStructure] Classe créée: ${data.name}`);

    return { classId };
  }

  /**
   * Met à jour une classe
   */
  static async updateClass(
    classId: mongoose.Types.ObjectId | string,
    className: string,
    updates: {
      name?: string;
      maxStudents?: number;
      syllabusId?: mongoose.Types.ObjectId | string;
    },
    updatedBy: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const classIdObj =
      typeof classId === "string"
        ? new mongoose.Types.ObjectId(classId)
        : classId;

    const updatedByObj =
      typeof updatedBy === "string"
        ? new mongoose.Types.ObjectId(updatedBy)
        : updatedBy;

    // TODO: Logique métier pour mettre à jour la classe

    // Publier événement CLASS_UPDATED
    await publishEvent(
      EventType.CLASS_UPDATED,
      {
        classId: classIdObj,
        className: className,
        updates: updates,
        updatedAt: new Date(),
      },
      {
        userId: updatedByObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[AcademicStructure] Classe mise à jour: ${className}`);
  }

  /**
   * Ajoute un professeur à une classe
   */
  static async addTeacher(
    classId: mongoose.Types.ObjectId | string,
    className: string,
    teacherId: mongoose.Types.ObjectId | string,
    teacherName: string
  ): Promise<void> {
    const classIdObj =
      typeof classId === "string"
        ? new mongoose.Types.ObjectId(classId)
        : classId;

    const teacherIdObj =
      typeof teacherId === "string"
        ? new mongoose.Types.ObjectId(teacherId)
        : teacherId;

    // TODO: Logique métier pour ajouter le professeur

    // Publier événement TEACHER_ADDED_TO_CLASS
    await publishEvent(
      EventType.TEACHER_ADDED_TO_CLASS,
      {
        classId: classIdObj,
        className: className,
        teacherId: teacherIdObj,
        teacherName: teacherName,
        addedAt: new Date(),
      },
      {
        userId: teacherIdObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(
      `[AcademicStructure] Professeur ${teacherName} ajouté à ${className}`
    );
  }
}
