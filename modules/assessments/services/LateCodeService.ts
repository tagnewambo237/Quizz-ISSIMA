import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de gestion des codes de retard
 */
export class LateCodeService {
  /**
   * Génère un code de retard pour un examen
   */
  static async generateCode(data: {
    examId: mongoose.Types.ObjectId | string;
    examTitle: string;
    studentId: mongoose.Types.ObjectId | string;
    studentName: string;
    reason: string;
    generatedBy: mongoose.Types.ObjectId | string;
  }): Promise<{ lateCode: string }> {
    const generatedByObj =
      typeof data.generatedBy === "string"
        ? new mongoose.Types.ObjectId(data.generatedBy)
        : data.generatedBy;

    const examIdObj =
      typeof data.examId === "string"
        ? new mongoose.Types.ObjectId(data.examId)
        : data.examId;

    const studentIdObj =
      typeof data.studentId === "string"
        ? new mongoose.Types.ObjectId(data.studentId)
        : data.studentId;

    // TODO: Logique métier pour générer le code
    // const lateCodeDoc = await LateCode.create({ ...data, code: generateUniqueCode() });

    const lateCode = `LATE-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)
      .toUpperCase()}`;

    // Publier événement LATE_CODE_GENERATED
    await publishEvent(
      EventType.LATE_CODE_GENERATED,
      {
        examId: examIdObj,
        examTitle: data.examTitle,
        studentId: studentIdObj,
        studentName: data.studentName,
        lateCode: lateCode,
        reason: data.reason,
        generatedAt: new Date(),
      },
      {
        userId: generatedByObj,
        priority: EventPriority.HIGH,
      }
    );

    console.log(
      `[Assessments] Code retard généré pour ${data.studentName}: ${lateCode}`
    );

    return { lateCode };
  }

  /**
   * Valide et utilise un code de retard
   */
  static async validateCode(
    lateCode: string,
    examId: mongoose.Types.ObjectId | string,
    studentId: mongoose.Types.ObjectId | string
  ): Promise<{ valid: boolean }> {
    const examIdObj =
      typeof examId === "string"
        ? new mongoose.Types.ObjectId(examId)
        : examId;

    const studentIdObj =
      typeof studentId === "string"
        ? new mongoose.Types.ObjectId(studentId)
        : studentId;

    // TODO: Logique métier pour valider
    // - Vérifier que le code existe
    // - Vérifier qu'il n'est pas déjà utilisé
    // - Vérifier qu'il correspond à l'examen et l'étudiant
    // await LateCode.updateOne({ code: lateCode }, { used: true, usedAt: new Date() });

    const valid = true; // TODO: Vraie validation

    if (valid) {
      // Publier événement LATE_CODE_USED
      await publishEvent(
        EventType.LATE_CODE_USED,
        {
          examId: examIdObj,
          lateCode: lateCode,
          usedAt: new Date(),
        },
        {
          userId: studentIdObj,
          priority: EventPriority.HIGH,
        }
      );

      console.log(`[Assessments] Code retard utilisé: ${lateCode}`);
    }

    return { valid };
  }
}

