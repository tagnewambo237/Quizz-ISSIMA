import { createEventHandler, DomainEvent, EventType } from "@/lib/events";
import { StatsService } from "../../services/StatsService";

/**
 * Handler pour l'événement XP_GAINED
 *
 * Écoute: XP_GAINED (publié par module gamification)
 * Action: Met à jour les statistiques de gamification
 */
createEventHandler(EventType.XP_GAINED, async (event: DomainEvent) => {
  try {
    if (!event.userId) {
      console.warn("[Analytics] XP_GAINED sans userId, skip");
      return;
    }

    const { amount, source } = event.data;

    // Mettre à jour stats gamification
    await StatsService.updateGamificationStats({
      userId: event.userId,
      xpGained: amount,
      source: source,
    });

    console.log(
      `[Analytics] Stats gamification mises à jour: +${amount}XP`
    );
  } catch (error) {
    console.error("[Analytics] Erreur dans XPGainedHandler:", error);
    throw error;
  }
});

