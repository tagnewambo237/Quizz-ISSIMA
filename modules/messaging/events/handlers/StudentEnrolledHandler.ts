import { createEventHandler, EventType, DomainEvent } from '@/lib/events';
import { NotificationService } from '../../services/NotificationService';

/**
 * Handler pour l'événement STUDENT_ENROLLED
 * 
 * Écoute: STUDENT_ENROLLED (publié par module invitations)
 * Action: Envoie une notification de bienvenue
 */
createEventHandler(EventType.STUDENT_ENROLLED, async (event: DomainEvent) => {
  try {
    if (!event.userId) {
      console.warn('[Messaging] STUDENT_ENROLLED sans userId, skip');
      return;
    }

    const { className } = event.data;

    // Envoyer notification de bienvenue
    await NotificationService.send(event.userId, {
      title: '🎓 Bienvenue!',
      message: `Vous êtes maintenant inscrit au cours "${className}". Bon apprentissage!`,
      type: 'success',
      priority: 'normal',
      metadata: {
        classId: event.data.classId,
        className
      }
    });

    console.log(`[Messaging] Notification bienvenue envoyée pour ${className}`);
  } catch (error) {
    console.error('[Messaging] Erreur dans StudentEnrolledHandler:', error);
    throw error;
  }
});

