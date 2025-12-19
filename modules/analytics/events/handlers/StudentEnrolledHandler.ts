import { createEventHandler, DomainEvent, EventType } from "@/lib/events";
import { StatsService } from "../../services/StatsService";

/**
 * Handler pour l'événement STUDENT_ENROLLED
 *
 * Écoute: STUDENT_ENROLLED (publié par module invitations)
 * Action: Met à jour les statistiques de la classe
 */
createEventHandler(EventType.STUDENT_ENROLLED, async (event: DomainEvent) => {
  try {
    const { classId } = event.data;

    // Mettre à jour stats classe
    await StatsService.updateClassStats({
      classId,
      studentCount: 1, // Incrément
    });

    console.log(
      `[Analytics] Stats classe mises à jour après inscription: ${classId}`
    );
  } catch (error) {
    console.error("[Analytics] Erreur dans StudentEnrolledHandler:", error);
    throw error;
  }
});

