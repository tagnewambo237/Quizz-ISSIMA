import {
  createEventHandler,
  DomainEvent,
  EventPriority,
  EventType,
  publishEvent,
} from "@/lib/events";
import { GamificationService } from "../../services/GamificationService";
import { XP_REWARDS } from "../types";

/**
 * Handler pour l'événement STUDENT_ENROLLED
 *
 * Écoute: STUDENT_ENROLLED (publié par module invitations)
 * Publie: XP_GAINED
 */
createEventHandler(EventType.STUDENT_ENROLLED, async (event: DomainEvent) => {
  try {
    if (!event.userId) {
      console.warn("[Gamification] STUDENT_ENROLLED sans userId, skip");
      return;
    }

    const { classId } = event.data;

    // Attribuer XP de bienvenue
    const result = await GamificationService.addXP(
      event.userId,
      XP_REWARDS.ENROLLMENT,
      "enrollment",
      classId?.toString(),
      event.id
    );

    // Publier événement XP_GAINED
    await publishEvent(
      EventType.XP_GAINED,
      {
        amount: XP_REWARDS.ENROLLMENT,
        source: "enrollment",
        sourceId: classId?.toString(),
        newTotal: result.totalXP,
        newLevel: result.level,
      },
      {
        userId: event.userId,
        priority: EventPriority.NORMAL,
        correlationId: event.metadata?.correlationId,
        causationId: event.id,
      }
    );

    console.log(`[Gamification] Étudiant inscrit: +${XP_REWARDS.ENROLLMENT}XP`);
  } catch (error) {
    console.error("[Gamification] Erreur dans StudentEnrolledHandler:", error);
    throw error;
  }
});
