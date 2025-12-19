import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de notation automatique
 */
export class GradingService {
  /**
   * Note une tentative automatiquement
   */
  static async gradeAttempt(
    attemptId: mongoose.Types.ObjectId | string,
    examId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId | string
  ): Promise<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
  }> {
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

    // TODO: Logique métier pour noter
    // - Récupérer toutes les réponses
    // - Récupérer les bonnes réponses
    // - Comparer et calculer score
    // - Gérer questions à correction manuelle

    // Simulation pour la démo
    const score = 85;
    const maxScore = 100;
    const percentage = (score / maxScore) * 100;
    const passed = percentage >= 50; // TODO: Utiliser passingScore de l'examen

    // TODO: Mettre à jour Attempt avec le score
    // await Attempt.updateOne({ _id: attemptId }, { score, maxScore, percentage, passed, gradedAt: new Date() });

    // Publier événement ATTEMPT_GRADED
    await publishEvent(
      EventType.ATTEMPT_GRADED,
      {
        attemptId: attemptIdObj,
        examId: examIdObj,
        score: score,
        maxScore: maxScore,
        percentage: percentage,
        passed: passed,
        gradedAt: new Date(),
      },
      {
        userId: userIdObj,
        priority: EventPriority.HIGH,
      }
    );

    console.log(
      `[ExamExecution] Tentative notée: ${score}/${maxScore} (${percentage}%)`
    );

    return { score, maxScore, percentage, passed };
  }

  /**
   * Calcule le score d'une question
   */
  static calculateQuestionScore(
    userAnswer: any,
    correctAnswer: any,
    points: number
  ): number {
    // TODO: Logique de notation selon le type de question
    // - QCM: comparaison stricte
    // - Vrai/Faux: comparaison booléenne
    // - Réponse courte: comparaison avec tolérance
    // - Essai: notation manuelle nécessaire

    return userAnswer === correctAnswer ? points : 0;
  }
}

