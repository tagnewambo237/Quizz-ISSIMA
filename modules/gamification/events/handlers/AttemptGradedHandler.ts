import {
  createEventHandler,
  DomainEvent,
  EventPriority,
  EventType,
  publishEvent,
} from "@/lib/events";
import { GamificationService } from "../../services/GamificationService";
import { BadgeDefinitions, XP_REWARDS } from "../types";

/**
 * Handler pour l'événement ATTEMPT_GRADED
 *
 * Écoute: ATTEMPT_GRADED (publié par module exam-execution)
 * Publie: XP_GAINED, BADGE_EARNED, LEVEL_UP
 */
createEventHandler(EventType.ATTEMPT_GRADED, async (event: DomainEvent) => {
  try {
    if (!event.userId) {
      console.warn("[Gamification] ATTEMPT_GRADED sans userId, skip");
      return;
    }

    const { score, maxScore, attemptId, examId } = event.data;

    // 1. Calculer XP basé sur le score
    const percentage = (score / maxScore) * 100;
    let xpAmount = XP_REWARDS.EXAM_COMPLETION;

    // Bonus pour score élevé
    if (percentage >= 90) {
      xpAmount += 30;
    } else if (percentage >= 75) {
      xpAmount += 15;
    }

    // 2. Attribuer XP
    const result = await GamificationService.addXP(
      event.userId,
      xpAmount,
      "exam",
      examId?.toString(),
      event.id
    );

    // 3. Publier événement XP_GAINED
    await publishEvent(
      EventType.XP_GAINED,
      {
        amount: xpAmount,
        source: "exam",
        sourceId: examId?.toString(),
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

    // 4. Si level up, publier LEVEL_UP
    if (result.leveledUp) {
      await publishEvent(
        EventType.LEVEL_UP,
        {
          oldLevel: result.oldLevel,
          newLevel: result.level,
          totalXP: result.totalXP,
        },
        {
          userId: event.userId,
          priority: EventPriority.HIGH,
          correlationId: event.metadata?.correlationId,
          causationId: event.id,
        }
      );
    }

    // 5. Vérifier badges
    // Badge: Perfect Score
    if (percentage >= 100) {
      const awarded = await GamificationService.awardBadge(
        event.userId,
        BadgeDefinitions.PERFECT_SCORE.id
      );

      if (awarded) {
        await publishEvent(
          EventType.BADGE_EARNED,
          {
            badgeId: BadgeDefinitions.PERFECT_SCORE.id,
            badgeName: BadgeDefinitions.PERFECT_SCORE.name,
            badgeIcon: BadgeDefinitions.PERFECT_SCORE.icon,
            badgeRarity: BadgeDefinitions.PERFECT_SCORE.rarity,
            pointsAwarded: BadgeDefinitions.PERFECT_SCORE.xpBonus,
          },
          {
            userId: event.userId,
            priority: EventPriority.HIGH,
            correlationId: event.metadata?.correlationId,
            causationId: event.id,
          }
        );

        // Attribuer XP bonus du badge
        await GamificationService.addXP(
          event.userId,
          BadgeDefinitions.PERFECT_SCORE.xpBonus,
          "badge",
          BadgeDefinitions.PERFECT_SCORE.id
        );
      }
    }

    console.log(
      `[Gamification] Traité ATTEMPT_GRADED: +${xpAmount}XP, Level ${result.level}`
    );
  } catch (error) {
    console.error("[Gamification] Erreur dans AttemptGradedHandler:", error);
    throw error; // Re-throw pour Dead Letter Queue
  }
});
