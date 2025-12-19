import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de détection anti-triche
 */
export class AntiCheatService {
  /**
   * Enregistre une violation anti-triche
   */
  static async logViolation(data: {
    attemptId: mongoose.Types.ObjectId | string;
    examId: mongoose.Types.ObjectId | string;
    userId: mongoose.Types.ObjectId | string;
    violationType: string;
    metadata?: any;
  }): Promise<void> {
    const userIdObj =
      typeof data.userId === "string"
        ? new mongoose.Types.ObjectId(data.userId)
        : data.userId;

    const attemptIdObj =
      typeof data.attemptId === "string"
        ? new mongoose.Types.ObjectId(data.attemptId)
        : data.attemptId;

    const examIdObj =
      typeof data.examId === "string"
        ? new mongoose.Types.ObjectId(data.examId)
        : data.examId;

    // TODO: Logique métier pour enregistrer la violation
    // - Ajouter violation à Attempt.antiCheatEvents
    // - Vérifier seuils de violations
    // - Invalider tentative si trop de violations

    // Publier événement ANTI_CHEAT_VIOLATION
    await publishEvent(
      EventType.ANTI_CHEAT_VIOLATION,
      {
        attemptId: attemptIdObj,
        examId: examIdObj,
        violationType: data.violationType,
        metadata: data.metadata,
        timestamp: new Date(),
      },
      {
        userId: userIdObj,
        priority: EventPriority.CRITICAL,
      }
    );

    console.log(
      `[ExamExecution] ⚠️  Violation anti-triche détectée: ${data.violationType}`
    );
  }

  /**
   * Vérifie si une tentative a trop de violations
   */
  static async checkViolationThreshold(
    attemptId: mongoose.Types.ObjectId | string
  ): Promise<{ exceeded: boolean; count: number }> {
    // TODO: Logique métier pour vérifier le seuil
    // - Récupérer Attempt
    // - Compter violations
    // - Comparer au seuil configuré

    return { exceeded: false, count: 0 };
  }

  /**
   * Types de violations supportés
   */
  static readonly ViolationTypes = {
    TAB_SWITCH: "TAB_SWITCH",
    FULLSCREEN_EXIT: "FULLSCREEN_EXIT",
    COPY_ATTEMPT: "COPY_ATTEMPT",
    PASTE_ATTEMPT: "PASTE_ATTEMPT",
    RIGHT_CLICK: "RIGHT_CLICK",
    BLUR_EVENT: "BLUR_EVENT",
    MULTIPLE_DEVICES: "MULTIPLE_DEVICES",
    SUSPICIOUS_PATTERN: "SUSPICIOUS_PATTERN",
  } as const;
}

