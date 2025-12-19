import { createEventHandler, EventType, DomainEvent } from '@/lib/events';
import { NotificationService } from '../../services/NotificationService';

/**
 * Handler pour l'événement LEVEL_UP
 * 
 * Écoute: LEVEL_UP (publié par module gamification)
 * Action: Envoie une notification à l'utilisateur
 */
createEventHandler(EventType.LEVEL_UP, async (event: DomainEvent) => {
  try {
    if (!event.userId) {
      console.warn('[Messaging] LEVEL_UP sans userId, skip');
      return;
    }

    const { oldLevel, newLevel, totalXP } = event.data;

    // Envoyer notification
    await NotificationService.send(event.userId, {
      title: '⭐ Niveau supérieur!',
      message: `Félicitations! Vous êtes passé au niveau ${newLevel}!`,
      type: 'level_up',
      priority: 'high',
      metadata: {
        oldLevel,
        newLevel,
        totalXP
      }
    });

    console.log(`[Messaging] Notification level up envoyée: Level ${newLevel}`);
  } catch (error) {
    console.error('[Messaging] Erreur dans LevelUpHandler:', error);
    throw error;
  }
});

