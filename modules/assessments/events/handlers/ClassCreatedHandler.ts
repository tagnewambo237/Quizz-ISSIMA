import { createEventHandler, DomainEvent, EventType } from "@/lib/events";

/**
 * Handler pour l'événement CLASS_CREATED
 *
 * Écoute: CLASS_CREATED (publié par module academic-structure)
 * Action: Initialise la configuration par défaut pour les examens de cette classe
 */
createEventHandler(EventType.CLASS_CREATED, async (event: DomainEvent) => {
  try {
    const { classId, className } = event.data;

    // TODO: Initialiser config par défaut pour les examens
    // - Créer paramètres anti-triche par défaut
    // - Créer modèles d'examens
    // - Initialiser permissions

    console.log(
      `[Assessments] Configuration examens initialisée pour ${className}`
    );
  } catch (error) {
    console.error("[Assessments] Erreur dans ClassCreatedHandler:", error);
    throw error;
  }
});
