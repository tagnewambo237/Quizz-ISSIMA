import { createEventHandler, EventType, DomainEvent } from '@/lib/events';
import { NotificationService } from '../../services/NotificationService';

/**
 * Handler pour l'événement BADGE_EARNED
 * 
 * Écoute: BADGE_EARNED (publié par module gamification)
 * Action: Envoie une notification à l'utilisateur
 */
createEventHandler(EventType.BADGE_EARNED, async (event: DomainEvent) => {
  try {
    if (!event.userId) {
      console.warn('[Messaging] BADGE_EARNED sans userId, skip');
      return;
    }

    const { badgeName, badgeIcon, badgeRarity, pointsAwarded } = event.data;

    // Envoyer notification
    await NotificationService.send(event.userId, {
      title: '🎉 Nouveau Badge!',
      message: `Vous avez obtenu le badge ${badgeName} ${badgeIcon}! +${pointsAwarded}XP`,
      type: 'badge',
      priority: 'high',
      metadata: {
        badgeId: event.data.badgeId,
        badgeRarity,
        pointsAwarded
      }
    });

    console.log(`[Messaging] Notification badge envoyée: ${badgeName}`);
  } catch (error) {
    console.error('[Messaging] Erreur dans BadgeEarnedHandler:', error);
    throw error;
  }
});

