import { createEventHandler, DomainEvent, EventType } from "@/lib/events";
import { StatsService } from "../../services/StatsService";

/**
 * Handler pour l'événement ATTEMPT_GRADED
 *
 * Écoute: ATTEMPT_GRADED (publié par module exam-execution)
 * Action: Met à jour les statistiques de l'examen
 */
createEventHandler(EventType.ATTEMPT_GRADED, async (event: DomainEvent) => {
  try {
    const { examId, score, maxScore, passed } = event.data;

    // Mettre à jour stats examen
    await StatsService.updateExamStats({
      examId,
      score,
      maxScore,
      passed,
    });

    console.log(
      `[Analytics] Stats examen mises à jour après notation: ${examId}`
    );
  } catch (error) {
    console.error("[Analytics] Erreur dans AttemptGradedHandler:", error);
    throw error;
  }
});

