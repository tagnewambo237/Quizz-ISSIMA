import { EventBus, DomainEvent, EventType, publishEvent, EventPriority } from '@/lib/events';
import { User } from '../../models';

/**
 * Handler pour l'événement USER_REGISTERED
 * 
 * Actions:
 * - Envoyer notification de bienvenue
 * - Attribuer XP de bonus d'inscription
 */
class UserRegisteredHandler {
    constructor() {
        const eventBus = EventBus.getInstance();
        eventBus.subscribe(EventType.USER_REGISTERED, this.handle.bind(this));
        console.log('[Auth] UserRegisteredHandler initialisé ✅');
    }

    private async handle(event: DomainEvent): Promise<void> {
        const { name, email, role, registrationMethod } = event.data;
        const userId = event.userId;

        console.log(`[Auth] Nouvel utilisateur inscrit: ${email} (${role})`);

        try {
            // 1. Publier notification de bienvenue
            await publishEvent(
                EventType.NOTIFICATION_CREATED,
                {
                    type: 'welcome',
                    title: 'Bienvenue sur QuizLock! 🎉',
                    message: `Bonjour ${name}, votre compte a été créé avec succès. Complétez votre profil pour commencer!`,
                    priority: 'high',
                    channel: 'in-app'
                },
                {
                    userId,
                    priority: EventPriority.HIGH,
                    correlationId: event.metadata?.correlationId
                }
            );

            // 2. Attribuer XP de bienvenue (si gamification activée)
            await publishEvent(
                EventType.XP_GAINED,
                {
                    amount: 10,
                    source: 'registration',
                    sourceId: userId?.toString(),
                    description: 'Bonus de bienvenue pour inscription'
                },
                {
                    userId,
                    priority: EventPriority.NORMAL,
                    correlationId: event.metadata?.correlationId
                }
            );

            console.log(`[Auth] Notifications envoyées pour ${email}`);
        } catch (error) {
            console.error('[Auth] Erreur UserRegisteredHandler:', error);
            throw error; // Laisser DLQ gérer
        }
    }
}

// Instancier le handler
new UserRegisteredHandler();

export { UserRegisteredHandler };
