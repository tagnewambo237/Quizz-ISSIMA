import { createEventHandler, DomainEvent, EventType } from "@/lib/events";

/**
 * Handler pour l'événement LATE_CODE_USED
 *
 * Écoute: LATE_CODE_USED (publié par module assessments)
 * Action: Logger l'utilisation pour audit
 */
createEventHandler(EventType.LATE_CODE_USED, async (event: DomainEvent) => {
  try {
    const { examId, lateCode, usedAt } = event.data;

    // TODO: Logger utilisation
    // - Enregistrer dans audit log
    // - Mettre à jour statistiques
    // - Notifier professeur si configuré

    console.log(
      `[ExamExecution] Code retard utilisé pour examen ${examId}: ${lateCode}`
    );
  } catch (error) {
    console.error("[ExamExecution] Erreur dans LateCodeUsedHandler:", error);
    throw error;
  }
});

