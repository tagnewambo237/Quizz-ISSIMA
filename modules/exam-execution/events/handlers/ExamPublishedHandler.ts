import { createEventHandler, DomainEvent, EventType } from "@/lib/events";

/**
 * Handler pour l'événement EXAM_PUBLISHED
 *
 * Écoute: EXAM_PUBLISHED (publié par module assessments)
 * Action: Prépare l'infrastructure pour les tentatives
 */
createEventHandler(EventType.EXAM_PUBLISHED, async (event: DomainEvent) => {
  try {
    const { examId, examTitle, classId } = event.data;

    // TODO: Préparer infrastructure
    // - Initialiser cache des questions
    // - Préparer configuration anti-triche
    // - Créer index pour performance

    console.log(
      `[ExamExecution] Infrastructure préparée pour examen: ${examTitle}`
    );
  } catch (error) {
    console.error("[ExamExecution] Erreur dans ExamPublishedHandler:", error);
    throw error;
  }
});

