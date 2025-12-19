import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de gestion des tentatives d'examen
 */
export class AttemptService {
  /**
   * Démarre une nouvelle tentative
   */
  static async startAttempt(data: {
    examId: mongoose.Types.ObjectId | string;
    examTitle: string;
    userId: mongoose.Types.ObjectId | string;
    duration: number;
  }): Promise<{ attemptId: mongoose.Types.ObjectId; expiresAt: Date }> {
    const userIdObj =
      typeof data.userId === "string"
        ? new mongoose.Types.ObjectId(data.userId)
        : data.userId;

    const examIdObj =
      typeof data.examId === "string"
        ? new mongoose.Types.ObjectId(data.examId)
        : data.examId;

    // TODO: Logique métier pour créer la tentative
    // - Vérifier nombre tentatives restantes
    // - Vérifier code retard si nécessaire
    // - Créer document Attempt
    // const attempt = await Attempt.create({ examId, userId, status: 'STARTED' });

    const attemptId = new mongoose.Types.ObjectId();
    const expiresAt = new Date(Date.now() + data.duration * 60 * 1000);

    // Publier événement ATTEMPT_STARTED
    await publishEvent(
      EventType.ATTEMPT_STARTED,
      {
        attemptId: attemptId,
        examId: examIdObj,
        examTitle: data.examTitle,
        startedAt: new Date(),
        expiresAt: expiresAt,
        duration: data.duration,
      },
      {
        userId: userIdObj,
        priority: EventPriority.HIGH,
      }
    );

    console.log(
      `[ExamExecution] Tentative démarrée pour ${data.examTitle}`
    );

    return { attemptId, expiresAt };
  }

  /**
   * Sauvegarde une réponse
   */
  static async saveAnswer(data: {
    attemptId: mongoose.Types.ObjectId | string;
    questionId: mongoose.Types.ObjectId | string;
    answer: any;
    userId: mongoose.Types.ObjectId | string;
  }): Promise<void> {
    const userIdObj =
      typeof data.userId === "string"
        ? new mongoose.Types.ObjectId(data.userId)
        : data.userId;

    const attemptIdObj =
      typeof data.attemptId === "string"
        ? new mongoose.Types.ObjectId(data.attemptId)
        : data.attemptId;

    const questionIdObj =
      typeof data.questionId === "string"
        ? new mongoose.Types.ObjectId(data.questionId)
        : data.questionId;

    // TODO: Logique métier pour sauvegarder la réponse
    // await Response.updateOne(
    //   { attemptId, questionId },
    //   { answer, answeredAt: new Date() },
    //   { upsert: true }
    // );

    // Publier événement QUESTION_ANSWERED
    await publishEvent(
      EventType.QUESTION_ANSWERED,
      {
        attemptId: attemptIdObj,
        questionId: questionIdObj,
        answeredAt: new Date(),
      },
      {
        userId: userIdObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[ExamExecution] Réponse sauvegardée pour question ${questionIdObj}`);
  }

  /**
   * Soumet une tentative
   */
  static async submitAttempt(
    attemptId: mongoose.Types.ObjectId | string,
    examId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const userIdObj =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const attemptIdObj =
      typeof attemptId === "string"
        ? new mongoose.Types.ObjectId(attemptId)
        : attemptId;

    const examIdObj =
      typeof examId === "string"
        ? new mongoose.Types.ObjectId(examId)
        : examId;

    // TODO: Logique métier pour soumettre
    // await Attempt.updateOne({ _id: attemptId }, { status: 'COMPLETED', submittedAt: new Date() });

    // Publier événement ATTEMPT_SUBMITTED
    await publishEvent(
      EventType.ATTEMPT_SUBMITTED,
      {
        attemptId: attemptIdObj,
        examId: examIdObj,
        submittedAt: new Date(),
      },
      {
        userId: userIdObj,
        priority: EventPriority.HIGH,
      }
    );

    console.log(`[ExamExecution] Tentative soumise: ${attemptIdObj}`);
  }
}

