# Guide de Configuration - Architecture Modulaire

Ce guide explique comment configurer et utiliser l'architecture modulaire avec le bus d'événements.

## 📦 Structure des Modules Créés

```
/modules/
├── gamification/          # XP, badges, niveaux
│   ├── models/
│   │   ├── UserXP.ts
│   │   └── XPTransaction.ts
│   ├── services/
│   │   └── GamificationService.ts
│   ├── events/
│   │   ├── types.ts
│   │   └── handlers/
│   │       ├── AttemptGradedHandler.ts
│   │       ├── StudentEnrolledHandler.ts
│   │       └── index.ts
│   └── index.ts
│
├── invitations/           # Enrollment étudiants
│   ├── services/
│   │   └── InvitationService.ts
│   ├── events/
│   │   └── types.ts
│   └── index.ts
│
└── messaging/             # Notifications
    ├── services/
    │   └── NotificationService.ts
    ├── events/
    │   ├── types.ts
    │   └── handlers/
    │       ├── BadgeEarnedHandler.ts
    │       ├── LevelUpHandler.ts
    │       ├── StudentEnrolledHandler.ts
    │       └── index.ts
    └── index.ts
```

## 🚀 Démarrage Rapide

### 1. Configuration Environnement

Copiez `.env.example.modular` vers `.env` et configurez :

```bash
cp .env.example.modular .env
```

Configuration minimale :

```env
USE_NEW_EVENT_BUS="true"
USE_MODULAR_STRUCTURE="true"
EVENT_PUBLISHING_MODE="new-only"

# Activer les modules
MODULE_GAMIFICATION_ENABLED="true"
MODULE_INVITATIONS_ENABLED="true"
MODULE_MESSAGING_ENABLED="true"

ENABLE_EVENT_SOURCING="true"
ENABLE_DEAD_LETTER_QUEUE="true"
```

### 2. Initialiser au Démarrage

Dans votre fichier `app/layout.tsx` (côté serveur uniquement) :

```typescript
import { bootstrap } from '@/lib/bootstrap';

// Au niveau racine du layout (Server Component)
await bootstrap();
```

**IMPORTANT**: Ne pas appeler `bootstrap()` côté client ! Seulement dans les Server Components ou API Routes.

### 3. Vérifier l'Initialisation

Au démarrage, vous devriez voir dans les logs :

```
========================================
  QuizLock - Modular Architecture
========================================
[FeatureFlags] Configuration:
  - New EventBus: ✅
  - Modular Structure: ✅
  - Event Sourcing: ✅
  - Dead Letter Queue: ✅
  - Publishing Mode: new-only
  - Enabled Modules: 3/8
    ✅ gamification, invitations, messaging
========================================

[Bootstrap] ✅ Loaded module: gamification
[Bootstrap] ✅ Loaded module: invitations
[Bootstrap] ✅ Loaded module: messaging
[Module] Gamification chargé ✅
[Module] Invitations chargé ✅
[Module] Messaging chargé ✅
[Gamification] Event handlers enregistrés
[Messaging] Event handlers enregistrés
[Bootstrap] ✅ Application initialized successfully
```

## 📚 Utilisation

### Exemple 1: Publier un Événement

```typescript
import { publishEvent, EventType, EventPriority } from '@/lib/events';

// Dans une API route ou service
export async function gradeExam(attemptId: string) {
  // ... logique de notation ...
  
  // Publier événement
  await publishEvent(
    EventType.ATTEMPT_GRADED,
    {
      attemptId,
      examId,
      score: 85,
      maxScore: 100,
      percentage: 85,
      passed: true
    },
    {
      userId: userId,
      priority: EventPriority.HIGH
    }
  );
}
```

**Ce qui se passe automatiquement** :
1. ✅ Module `gamification` écoute et attribue XP + badges
2. ✅ Si badge obtenu → Module `messaging` envoie notification
3. ✅ Si level up → Module `messaging` envoie notification
4. ✅ Tous les événements sont persistés (Event Sourcing)
5. ✅ En cas d'erreur → Dead Letter Queue + retry automatique

### Exemple 2: Utiliser un Service de Module

```typescript
import { GamificationService } from '@/modules/gamification';

// Consulter le profil XP d'un utilisateur
const profile = await GamificationService.getUserProfile(userId);
console.log(`Level ${profile.level} - ${profile.totalXP} XP`);

// Récupérer le leaderboard
const leaderboard = await GamificationService.getLeaderboard(10);
```

### Exemple 3: API Routes Créées

Utilisez ces endpoints pour tester :

**Profil Gamification** :
```bash
GET /api/gamification/profile/[userId]
```

**Leaderboard** :
```bash
GET /api/gamification/leaderboard?limit=10
```

**Historique des Événements (Admin)** :
```bash
GET /api/admin/events/history?type=ATTEMPT_GRADED&limit=50
```

**Dead Letter Queue (Admin)** :
```bash
GET /api/admin/events/dlq
POST /api/admin/events/dlq { "action": "retry" }
```

## 🔄 Flux d'Événements Exemple

Voici ce qui se passe quand un étudiant est inscrit à une classe :

```
1. InvitationService.acceptInvitation()
   └─> Publie: STUDENT_ENROLLED

2. Module Gamification (écoute STUDENT_ENROLLED)
   ├─> Attribue +10 XP
   └─> Publie: XP_GAINED

3. Module Messaging (écoute STUDENT_ENROLLED)
   └─> Envoie notification de bienvenue

4. Module Messaging (écoute XP_GAINED)
   └─> (optionnel) Envoie notification XP
```

Tout ceci se passe **automatiquement** et **de manière découplée** !

## 🧪 Tester le Système

### Test 1: Simuler un Enrollment

```typescript
import { InvitationService } from '@/modules/invitations';

await InvitationService.acceptInvitation(
  'invitation-123',
  userId,
  classId,
  'Math 101',
  'John Doe',
  'john@example.com'
);

// ✅ Vérifie dans les logs:
// - [Invitations] Étudiant inscrit
// - [Gamification] +10 XP
// - [Messaging] Notification bienvenue
// - [Messaging] Notification XP
```

### Test 2: Consulter l'Historique

```typescript
import { getEventHistory } from '@/lib/events';

// Tous les événements d'un utilisateur
const events = await getEventHistory({
  userId: userId,
  limit: 50
});

console.log(`${events.length} événements trouvés`);
```

### Test 3: Vérifier la DLQ

```bash
curl http://localhost:3000/api/admin/events/dlq
```

Si tout fonctionne bien, vous devriez avoir :
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 0,
      "unresolved": 0
    }
  }
}
```

## 🎯 Communication Inter-Modules

### Règle d'Or : Événements, pas d'imports directs

❌ **MAUVAIS** (dépendance directe) :
```typescript
// Dans module messaging
import { GamificationService } from '@/modules/gamification';

// Ne pas faire ça !
const profile = await GamificationService.getUserProfile(userId);
```

✅ **BON** (événements) :
```typescript
// Module A publie
await publishEvent('USER_PROFILE_UPDATED', { userId, data });

// Module B écoute
createEventHandler('USER_PROFILE_UPDATED', async (event) => {
  // Réagir à l'événement
});
```

### Hiérarchie des Modules

```
Niveau 1: auth
Niveau 2: academic-structure, invitations
Niveau 3: assessments
Niveau 4: exam-execution
Niveau 5: gamification, analytics
Niveau 6: messaging
```

**Règles** :
- ✅ Import direct autorisé vers niveaux **inférieurs**
- ✅ Communication par **événements** vers niveaux supérieurs/pairs
- ❌ **Jamais** de dépendances circulaires

## 🐛 Debugging

### Activer les Logs Verbose

```env
VERBOSE_EVENT_LOGGING="true"
```

### Consulter les Statistiques

```typescript
import { getEventBusStats } from '@/lib/events';

const stats = getEventBusStats();
console.log('Queue sizes:', stats);
// { critical: 0, high: 2, normal: 5, low: 1 }
```

### Vérifier les Modules Chargés

```typescript
import { getEnabledModules } from '@/lib/config/features';

console.log('Modules actifs:', getEnabledModules());
```

## 📈 Monitoring en Production

### Métriques Importantes

1. **Queue Stats** : Taille des queues de priorité
2. **DLQ Stats** : Nombre d'événements en échec
3. **Event Store** : Nombre d'événements persistés
4. **Processing Time** : Temps de traitement moyen

### Dashboard Admin (TODO)

Créer un dashboard React pour :
- Visualiser l'historique des événements
- Monitorer la Dead Letter Queue
- Voir les statistiques des modules
- Forcer des retry manuels

## 🚨 Gestion d'Erreurs

### Que se passe-t-il en cas d'erreur ?

1. ✅ L'erreur est catchée par l'EventBus
2. ✅ L'événement est ajouté à la Dead Letter Queue
3. ✅ Retry automatique après 5 minutes (configurable)
4. ✅ Maximum 3 tentatives (configurable)
5. ✅ Si échec définitif → alerte admin (à implémenter)

### Résolution Manuelle

```bash
# Voir les événements en échec
GET /api/admin/events/dlq

# Forcer un retry
POST /api/admin/events/dlq
{
  "action": "retry"
}

# Marquer comme résolu
POST /api/admin/events/dlq
{
  "action": "resolve",
  "eventId": "event-123"
}
```

## 📝 Prochaines Étapes

1. ✅ Modules créés : gamification, invitations, messaging
2. ⏳ À créer : auth, academic-structure, assessments, exam-execution, analytics
3. ⏳ Dashboard admin pour monitoring
4. ⏳ Tests d'intégration complets
5. ⏳ Migration du code existant vers les modules

## 🔗 Ressources

- [EventBus Guide Complet](/docs/features/EVENT_BUS_GUIDE.md)
- [Architecture Modulaire](/modules/README.md)
- [EventBus Source](/lib/events/core/EventBus.ts)
- [Feature Flags](/lib/config/features.ts)

---

**Questions ?** Consultez la documentation ou les exemples dans `/modules/`

