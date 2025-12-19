import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de gestion des écoles
 */
export class SchoolService {
  /**
   * Crée une nouvelle école
   */
  static async createSchool(data: {
    name: string;
    type: string;
    address?: string;
    contactEmail?: string;
    createdBy: mongoose.Types.ObjectId | string;
  }): Promise<{ schoolId: mongoose.Types.ObjectId }> {
    const createdByObj =
      typeof data.createdBy === "string"
        ? new mongoose.Types.ObjectId(data.createdBy)
        : data.createdBy;

    // TODO: Logique métier pour créer l'école dans la DB
    // const school = await School.create({ ...data });

    const schoolId = new mongoose.Types.ObjectId();

    // Publier événement SCHOOL_CREATED
    await publishEvent(
      EventType.SCHOOL_CREATED,
      {
        schoolId: schoolId,
        name: data.name,
        type: data.type,
        address: data.address,
        contactEmail: data.contactEmail,
        createdAt: new Date(),
      },
      {
        userId: createdByObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[AcademicStructure] École créée: ${data.name}`);

    return { schoolId };
  }

  /**
   * Valide une école
   */
  static async validateSchool(
    schoolId: mongoose.Types.ObjectId | string,
    schoolName: string,
    validatedBy: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const schoolIdObj =
      typeof schoolId === "string"
        ? new mongoose.Types.ObjectId(schoolId)
        : schoolId;

    const validatedByObj =
      typeof validatedBy === "string"
        ? new mongoose.Types.ObjectId(validatedBy)
        : validatedBy;

    // TODO: Logique métier pour valider l'école
    // - Vérifier permissions
    // - Mettre à jour statut

    // Publier événement SCHOOL_VALIDATED
    await publishEvent(
      EventType.SCHOOL_VALIDATED,
      {
        schoolId: schoolIdObj,
        schoolName: schoolName,
        validatedAt: new Date(),
      },
      {
        userId: validatedByObj,
        priority: EventPriority.HIGH,
      }
    );

    console.log(`[AcademicStructure] École validée: ${schoolName}`);
  }
}

