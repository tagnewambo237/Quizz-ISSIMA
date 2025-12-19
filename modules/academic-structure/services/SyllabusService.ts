import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de gestion des syllabus
 */
export class SyllabusService {
  /**
   * Crée un nouveau syllabus
   */
  static async createSyllabus(data: {
    title: string;
    description?: string;
    subjectId: mongoose.Types.ObjectId | string;
    educationLevelId: mongoose.Types.ObjectId | string;
    createdBy: mongoose.Types.ObjectId | string;
  }): Promise<{ syllabusId: mongoose.Types.ObjectId }> {
    const createdByObj =
      typeof data.createdBy === "string"
        ? new mongoose.Types.ObjectId(data.createdBy)
        : data.createdBy;

    // TODO: Logique métier pour créer le syllabus dans la DB
    // const syllabus = await Syllabus.create({ ...data });

    const syllabusId = new mongoose.Types.ObjectId();

    // Publier événement SYLLABUS_CREATED
    await publishEvent(
      EventType.SYLLABUS_CREATED,
      {
        syllabusId: syllabusId,
        title: data.title,
        description: data.description,
        subjectId: data.subjectId,
        educationLevelId: data.educationLevelId,
        createdAt: new Date(),
      },
      {
        userId: createdByObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[AcademicStructure] Syllabus créé: ${data.title}`);

    return { syllabusId };
  }

  /**
   * Met à jour un syllabus
   */
  static async updateSyllabus(
    syllabusId: mongoose.Types.ObjectId | string,
    title: string,
    updates: {
      title?: string;
      description?: string;
      content?: any;
    },
    updatedBy: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const syllabusIdObj =
      typeof syllabusId === "string"
        ? new mongoose.Types.ObjectId(syllabusId)
        : syllabusId;

    const updatedByObj =
      typeof updatedBy === "string"
        ? new mongoose.Types.ObjectId(updatedBy)
        : updatedBy;

    // TODO: Logique métier pour mettre à jour le syllabus

    // Publier événement SYLLABUS_UPDATED
    await publishEvent(
      EventType.SYLLABUS_UPDATED,
      {
        syllabusId: syllabusIdObj,
        title: title,
        updates: updates,
        updatedAt: new Date(),
      },
      {
        userId: updatedByObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[AcademicStructure] Syllabus mis à jour: ${title}`);
  }
}

