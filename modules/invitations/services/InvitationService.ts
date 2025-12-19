import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de gestion des invitations
 *
 * Publie des événements pour communication inter-modules
 */
export class InvitationService {
  /**
   * Accepte une invitation et inscrit l'étudiant
   */
  static async acceptInvitation(
    invitationId: string,
    userId: mongoose.Types.ObjectId | string,
    classId: mongoose.Types.ObjectId | string,
    className: string,
    userName: string,
    userEmail: string
  ): Promise<void> {
    const userIdObj =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const classIdObj =
      typeof classId === "string"
        ? new mongoose.Types.ObjectId(classId)
        : classId;

    // TODO: Logique métier pour accepter l'invitation
    // (mise à jour de la DB, etc.)

    // Publier événement INVITATION_ACCEPTED
    await publishEvent(
      EventType.INVITATION_ACCEPTED,
      {
        invitationId,
        classId: classIdObj,
        className,
      },
      {
        userId: userIdObj,
        priority: EventPriority.HIGH,
      }
    );

    // Publier événement STUDENT_ENROLLED
    await publishEvent(
      EventType.STUDENT_ENROLLED,
      {
        classId: classIdObj,
        className,
        userName,
        userEmail,
        enrolledAt: new Date(),
      },
      {
        userId: userIdObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[Invitations] Étudiant ${userName} inscrit à ${className}`);
  }

  /**
   * Crée une invitation
   */
  static async createInvitation(
    classId: mongoose.Types.ObjectId | string,
    email: string,
    createdBy: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const classIdObj =
      typeof classId === "string"
        ? new mongoose.Types.ObjectId(classId)
        : classId;

    const createdByObj =
      typeof createdBy === "string"
        ? new mongoose.Types.ObjectId(createdBy)
        : createdBy;

    // TODO: Logique métier pour créer l'invitation

    // Publier événement
    await publishEvent(
      EventType.INVITATION_CREATED,
      {
        classId: classIdObj,
        email,
        createdBy: createdByObj,
        createdAt: new Date(),
      },
      {
        userId: createdByObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[Invitations] Invitation créée pour ${email}`);
  }
}
