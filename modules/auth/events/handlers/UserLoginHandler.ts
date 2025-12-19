import { EventBus, DomainEvent, EventType, publishEvent, EventPriority } from '@/lib/events';
import { User } from '../../models';

/**
 * Handler pour l'événement USER_LOGIN
 * 
 * Actions:
 * - Vérifier et mettre à jour le streak de connexion
 * - Attribuer XP si connexion quotidienne
 * - Publier événement DAILY_LOGIN_STREAK si nouveau streak
 */
class UserLoginHandler {
    constructor() {
        const eventBus = EventBus.getInstance();
        eventBus.subscribe(EventType.USER_LOGIN, this.handle.bind(this));
        console.log('[Auth] UserLoginHandler initialisé ✅');
    }

    private async handle(event: DomainEvent): Promise<void> {
        const { email, loginMethod, loginAt } = event.data;
        const userId = event.userId;

        if (!userId) {
            console.warn('[Auth] UserLoginHandler: userId manquant');
            return;
        }

        console.log(`[Auth] Connexion utilisateur: ${email}`);

        try {
            // 1. Récupérer l'utilisateur
            const user = await User.findById(userId);
            if (!user) {
                console.warn(`[Auth] Utilisateur non trouvé: ${userId}`);
                return;
            }

            // 2. Calculer le streak de connexion
            const now = new Date();
            const lastActivity = user.gamification?.lastActivityDate;
            let newStreak = user.gamification?.currentStreak || 0;
            let streakBroken = false;
            let isNewDay = false;

            if (lastActivity) {
                const lastDate = new Date(lastActivity);
                const diffDays = Math.floor(
                    (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (diffDays === 0) {
                    // Même jour, pas de changement
                    isNewDay = false;
                } else if (diffDays === 1) {
                    // Jour consécutif, incrémenter le streak
                    newStreak += 1;
                    isNewDay = true;
                } else {
                    // Plus d'un jour, streak reset
                    streakBroken = true;
                    newStreak = 1;
                    isNewDay = true;
                }
            } else {
                // Première connexion
                newStreak = 1;
                isNewDay = true;
            }

            // 3. Mettre à jour l'utilisateur
            const longestStreak = Math.max(
                user.gamification?.longestStreak || 0,
                newStreak
            );

            await User.findByIdAndUpdate(userId, {
                'gamification.currentStreak': newStreak,
                'gamification.longestStreak': longestStreak,
                'gamification.lastActivityDate': now
            });

            // 4. Si nouveau jour, attribuer XP
            if (isNewDay) {
                const xpAmount = 5 + Math.min(newStreak * 2, 20); // 5 base + 2 par jour de streak (max 20 bonus)

                await publishEvent(
                    EventType.XP_GAINED,
                    {
                        amount: xpAmount,
                        source: 'daily_login',
                        sourceId: userId.toString(),
                        description: `Connexion quotidienne (streak: ${newStreak} jours)`
                    },
                    {
                        userId,
                        priority: EventPriority.LOW,
                        correlationId: event.metadata?.correlationId
                    }
                );

                console.log(`[Auth] XP quotidien attribué: ${xpAmount} (streak: ${newStreak})`);
            }

            // 5. Si nouveau record de streak, publier événement spécial
            if (newStreak > (user.gamification?.longestStreak || 0)) {
                await publishEvent(
                    'DAILY_LOGIN_STREAK',
                    {
                        currentStreak: newStreak,
                        previousStreak: user.gamification?.longestStreak || 0,
                        isNewRecord: true
                    },
                    {
                        userId,
                        priority: EventPriority.NORMAL,
                        correlationId: event.metadata?.correlationId
                    }
                );
            }
        } catch (error) {
            console.error('[Auth] Erreur UserLoginHandler:', error);
            // Ne pas throw pour ne pas bloquer la connexion
        }
    }
}

// Instancier le handler
new UserLoginHandler();

export { UserLoginHandler };
