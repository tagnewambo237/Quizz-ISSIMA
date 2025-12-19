import { EventBus, DomainEvent, EventType, publishEvent, EventPriority } from '@/lib/events';

/**
 * Handler pour l'événement USER_PROFILE_COMPLETED
 * 
 * Actions:
 * - Attribuer XP bonus pour complétion du profil
 * - Vérifier badges liés au profil
 * - Envoyer notification de confirmation
 */
class ProfileCompletedHandler {
    constructor() {
        const eventBus = EventBus.getInstance();
        eventBus.subscribe(EventType.USER_PROFILE_COMPLETED, this.handle.bind(this));
        console.log('[Auth] ProfileCompletedHandler initialisé ✅');
    }

    private async handle(event: DomainEvent): Promise<void> {
        const { role, institution, completedAt } = event.data;
        const userId = event.userId;

        if (!userId) {
            console.warn('[Auth] ProfileCompletedHandler: userId manquant');
            return;
        }

        console.log(`[Auth] Profil complété pour ${userId} (${role})`);

        try {
            // 1. Attribuer XP bonus pour complétion du profil
            await publishEvent(
                EventType.XP_GAINED,
                {
                    amount: 25,
                    source: 'profile_completed',
                    sourceId: userId.toString(),
                    description: 'Bonus pour avoir complété votre profil'
                },
                {
                    userId,
                    priority: EventPriority.NORMAL,
                    correlationId: event.metadata?.correlationId
                }
            );

            // 2. Vérifier si badge "Profil Complet" devrait être attribué
            await publishEvent(
                EventType.BADGE_EARNED,
                {
                    badgeId: 'profile-complete',
                    badgeName: 'Profil Complet',
                    badgeIcon: '📋',
                    badgeRarity: 'common',
                    pointsAwarded: 10,
                    category: 'onboarding'
                },
                {
                    userId,
                    priority: EventPriority.NORMAL,
                    correlationId: event.metadata?.correlationId
                }
            );

            // 3. Envoyer notification de confirmation
            const roleLabel = role === 'STUDENT' ? 'étudiant' :
                role === 'TEACHER' ? 'enseignant' : 'utilisateur';

            await publishEvent(
                EventType.NOTIFICATION_CREATED,
                {
                    type: 'profile_completed',
                    title: 'Profil complété! 🎉',
                    message: `Votre profil ${roleLabel} est maintenant complet. Vous pouvez commencer à utiliser toutes les fonctionnalités de QuizLock!`,
                    priority: 'normal',
                    channel: 'in-app',
                    action: {
                        label: role === 'STUDENT' ? 'Voir mes cours' : 'Gérer mes classes',
                        url: role === 'STUDENT' ? '/student' : '/teacher'
                    }
                },
                {
                    userId,
                    priority: EventPriority.NORMAL,
                    correlationId: event.metadata?.correlationId
                }
            );

            console.log(`[Auth] Événements post-profil publiés pour ${userId}`);
        } catch (error) {
            console.error('[Auth] Erreur ProfileCompletedHandler:', error);
            throw error; // Laisser DLQ gérer
        }
    }
}

// Instancier le handler
new ProfileCompletedHandler();

export { ProfileCompletedHandler };
