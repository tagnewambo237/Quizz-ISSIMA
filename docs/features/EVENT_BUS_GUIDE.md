# Guide du Système d'Événements - QuizLock

## Vue d'ensemble

Le système d'événements de QuizLock est basé sur une architecture événementielle (Event-Driven Architecture) avec les fonctionnalités suivantes :

- **Priority Queues** : 4 niveaux de priorité (CRITICAL, HIGH, NORMAL, LOW)
- **Event Sourcing** : Tous les événements sont persistés dans MongoDB
- **Dead Letter Queue** : Retry automatique des événements en échec
- **Event Replay** : Reconstruit l'état en rejouant les événements
- **Async Processing** : Traitement asynchrone avec queues

## Table des matières

1. [Installation et Configuration](#installation-et-configuration)
2. [Publier un événement](#publier-un-événement)
3. [Écouter un événement](#écouter-un-événement)
4. [Priorités des événements](#priorités-des-événements)
5. [Event Sourcing](#event-sourcing)
6. [Dead Letter Queue](#dead-letter-queue)
7. [Migration progressive](#migration-progressive)
8. [Bonnes pratiques](#bonnes-pratiques)
9. [Exemples concrets](#exemples-concrets)

---

## Installation et Configuration

### 1. Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```bash
# Activer le nouveau système
USE_NEW_EVENT_BUS="true"
USE_MODULAR_STRUCTURE="true"

# Mode de publication pendant la migration
EVENT_PUBLISHING_MODE="dual"  # ou "new-only" ou "legacy-only"

# Activer les fonctionnalités
ENABLE_DEAD_LETTER_QUEUE="true"
ENABLE_EVENT_SOURCING="true"

# Configuration fine
DLQ_MAX_RETRIES="3"
DLQ_RETRY_INTERVAL="300000"  # 5 minutes
EVENT_QUEUE_PROCESSING_INTERVAL="100"  # 100ms
EVENT_STORE_TTL_DAYS="90"

# Debug
VERBOSE_EVENT_LOGGING="false"
```

### 2. Initialiser le système

Dans votre fichier principal (ex: `app/layout.tsx` ou middleware) :

```typescript
import { bootstrap } from '@/lib/bootstrap';

// Au démarrage de l'application
await bootstrap();
```

---

## Publier un événement

### Méthode simple (recommandée)

```typescript
import { publishEvent, EventType, EventPriority } from '@/lib/events';

// Publier un événement basique
await publishEvent(EventType.STUDENT_ENROLLED, {
  classId: classId,
  className: 'Math 101',
  userName: 'John Doe',
  userEmail: 'john@example.com'
}, {
  priority: EventPriority.NORMAL,
  userId: userId
});
```

### Méthode avancée

```typescript
import { EventBus, DomainEvent, EventPriority } from '@/lib/events';

const event: DomainEvent = {
  id: uuidv4(),
  type: 'ATTEMPT_GRADED',
  priority: EventPriority.HIGH,
  timestamp: new Date(),
  userId: userId,
  data: {
    attemptId: '123',
    score: 85,
    maxScore: 100,
    percentage: 85,
    passed: true
  },
  metadata: {
    correlationId: uuidv4(),
    version: 1
  }
};

const eventBus = EventBus.getInstance();
await eventBus.publish(event);
```

---

## Écouter un événement

### Méthode 1 : Handler simple

```typescript
import { createEventHandler, EventType } from '@/lib/events';

createEventHandler(EventType.BADGE_EARNED, async (event) => {
  console.log('Badge earned:', event.data);
  
  // Logique métier
  await sendNotification(event.userId, event.data.badgeName);
});
```

### Méthode 2 : Handler avec gestion d'erreur

```typescript
import { createSafeEventHandler, EventType } from '@/lib/events';

createSafeEventHandler(
  EventType.ATTEMPT_GRADED,
  async (event) => {
    // Code qui peut throw une erreur
    await updateLeaderboard(event.data);
  },
  (error, event) => {
    // Gestion d'erreur personnalisée
    console.error('Custom error handling:', error);
    // L'événement sera quand même ajouté à la Dead Letter Queue
  }
);
```

### Méthode 3 : Class-based handler

```typescript
import { EventBus, DomainEvent } from '@/lib/events';

class AttemptGradedHandler {
  constructor() {
    const eventBus = EventBus.getInstance();
    eventBus.subscribe('ATTEMPT_GRADED', this.handle.bind(this));
  }

  private async handle(event: DomainEvent): Promise<void> {
    const { userId, examId, score } = event.data;
    
    // Logique métier
    await this.awardXP(userId, score);
    await this.checkBadges(userId, examId);
  }

  private async awardXP(userId: string, score: number): Promise<void> {
    // ...
  }

  private async checkBadges(userId: string, examId: string): Promise<void> {
    // ...
  }
}

// Instancier pour activer
new AttemptGradedHandler();
```

---

## Priorités des événements

Le système utilise 4 niveaux de priorité :

### CRITICAL (0) - Traité immédiatement

```typescript
import { EventPriority } from '@/lib/events';

await publishEvent('SECURITY_BREACH', data, {
  priority: EventPriority.CRITICAL  // Traité IMMÉDIATEMENT
});
```

**Cas d'usage :**
- Violations de sécurité
- Erreurs critiques
- Alertes système

### HIGH (1) - Haute priorité

```typescript
await publishEvent('ATTEMPT_GRADED', data, {
  priority: EventPriority.HIGH  // Traité en priorité
});
```

**Cas d'usage :**
- Notation d'examen
- Attribution de badges
- Notifications importantes

### NORMAL (2) - Priorité standard (défaut)

```typescript
await publishEvent('STUDENT_ENROLLED', data, {
  priority: EventPriority.NORMAL  // Par défaut
});
```

**Cas d'usage :**
- Enrôlement d'étudiants
- Création de contenu
- Mises à jour standard

### LOW (3) - Basse priorité

```typescript
await publishEvent('ANALYTICS_UPDATE', data, {
  priority: EventPriority.LOW  // Traité en dernier
});
```

**Cas d'usage :**
- Analytics
- Logs
- Nettoyage de données

---

## Event Sourcing

### Récupérer l'historique des événements

```typescript
import { getEventHistory } from '@/lib/events';

// Tous les événements d'un utilisateur
const userEvents = await getEventHistory({
  userId: '123',
  limit: 50
});

// Événements par type
const attemptEvents = await getEventHistory({
  type: 'ATTEMPT_GRADED',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});

// Événements par correlation ID (suivre un workflow)
const workflowEvents = await getEventHistory({
  correlationId: 'abc-123'
});
```

### Rejouer des événements

```typescript
import { replayEvents } from '@/lib/events';

// Rejouer tous les événements d'une période
await replayEvents(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);

// Rejouer uniquement certains types
await replayEvents(
  new Date('2024-01-01'),
  new Date('2024-01-31'),
  ['ATTEMPT_GRADED', 'BADGE_EARNED']
);
```

**Cas d'usage :**
- Reconstruire l'état après un bug
- Tester de nouveaux handlers
- Audit et conformité

---

## Dead Letter Queue

### Visualiser les événements en échec

```typescript
import { EventBus } from '@/lib/events';

const eventBus = EventBus.getInstance();
const dlq = eventBus.deadLetterQueue;

// Récupérer les événements non résolus
const failed = await dlq.getUnresolved({ limit: 50 });

// Statistiques
const stats = await dlq.getStats();
console.log(stats);
// {
//   total: 100,
//   unresolved: 5,
//   maxRetriesReached: 2,
//   byType: { 'ATTEMPT_GRADED': 3, 'BADGE_EARNED': 2 }
// }
```

### Résolution manuelle

```typescript
// Marquer comme résolu (sans retry)
await dlq.resolve('event-id-123');

// Forcer un retry maintenant
await dlq.retryFailed();
```

### Dashboard API (à créer)

```typescript
// app/api/admin/dlq/route.ts
import { EventBus } from '@/lib/events';

export async function GET() {
  const dlq = EventBus.getInstance().deadLetterQueue;
  
  const [unresolved, stats] = await Promise.all([
    dlq.getUnresolved({ limit: 100 }),
    dlq.getStats()
  ]);
  
  return Response.json({ unresolved, stats });
}
```

---

## Migration progressive

### Phase de transition (Dual Mode)

Pendant la migration, utilisez le `LegacyEventAdapter` :

```typescript
import { LegacyEventAdapter } from '@/lib/events';

const adapter = new LegacyEventAdapter();

// Publier dans les deux systèmes
await adapter.publishBoth({
  type: 'STUDENT_ENROLLED',
  timestamp: new Date(),
  userId: userId,
  data: { ... }
});

// Subscribe aux deux systèmes
adapter.subscribeBoth('BADGE_EARNED', async (event) => {
  // Handler reçoit les événements des deux sources
  console.log('Badge earned:', event.data);
});
```

### Configuration par feature flags

```env
# .env

# Phase 1: Tester le nouveau système en parallèle
USE_NEW_EVENT_BUS="true"
EVENT_PUBLISHING_MODE="dual"
MODULE_GAMIFICATION_ENABLED="true"

# Phase 2: Passer au nouveau système uniquement
USE_NEW_EVENT_BUS="true"
EVENT_PUBLISHING_MODE="new-only"

# Phase 3: Architecture modulaire complète
USE_MODULAR_STRUCTURE="true"
```

---

## Bonnes pratiques

### 1. Nommage des événements

```typescript
// ✅ BON - Passé, spécifique, domaine clair
EventType.STUDENT_ENROLLED
EventType.BADGE_EARNED
EventType.ATTEMPT_GRADED

// ❌ MAUVAIS - Présent, vague
'EnrollStudent'
'GetBadge'
'Grade'
```

### 2. Structure des données

```typescript
// ✅ BON - Données complètes, pas de références
await publishEvent('STUDENT_ENROLLED', {
  studentId: '123',
  studentName: 'John Doe',
  studentEmail: 'john@example.com',
  classId: '456',
  className: 'Math 101',
  enrolledAt: new Date()
});

// ❌ MAUVAIS - Références seulement, données manquantes
await publishEvent('STUDENT_ENROLLED', {
  studentId: '123',
  classId: '456'
});
```

### 3. Idempotence des handlers

```typescript
// ✅ BON - Handler idempotent
createEventHandler('XP_GAINED', async (event) => {
  const { userId, amount, sourceId } = event.data;
  
  // Vérifier si déjà traité
  const exists = await XPTransaction.findOne({
    userId,
    sourceId,
    eventId: event.id
  });
  
  if (exists) {
    console.log('Event already processed, skipping');
    return;
  }
  
  // Traiter
  await XPTransaction.create({
    userId,
    amount,
    sourceId,
    eventId: event.id
  });
});
```

### 4. Correlation ID pour workflows

```typescript
// Créer un workflow avec correlation ID
const correlationId = uuidv4();

await publishEvent('EXAM_STARTED', data1, {
  correlationId
});

await publishEvent('QUESTION_ANSWERED', data2, {
  correlationId,
  causationId: previousEventId
});

await publishEvent('EXAM_SUBMITTED', data3, {
  correlationId,
  causationId: previousEventId
});

// Récupérer tout le workflow
const workflow = await getEventHistory({ correlationId });
```

### 5. Gestion d'erreurs

```typescript
// ✅ BON - Laisser l'erreur remonter pour DLQ
createEventHandler('PROCESS_PAYMENT', async (event) => {
  // Ne pas catcher les erreurs, laisser DLQ gérer
  await processPayment(event.data);
});

// ✅ BON - Catcher uniquement pour logging custom
createSafeEventHandler(
  'PROCESS_PAYMENT',
  async (event) => {
    await processPayment(event.data);
  },
  (error, event) => {
    // Log custom + alertes
    logToSentry(error, event);
    // L'événement ira quand même en DLQ
  }
);
```

---

## Exemples concrets

### Exemple 1 : Gamification complète

```typescript
// modules/exam-execution/services/ExamEvaluationService.ts
import { publishEvent, EventType, EventPriority } from '@/lib/events';

class ExamEvaluationService {
  async gradeAttempt(attemptId: string): Promise<void> {
    // 1. Notation
    const result = await this.calculateScore(attemptId);
    
    // 2. Publier événement HIGH priority
    await publishEvent(
      EventType.ATTEMPT_GRADED,
      {
        attemptId,
        userId: result.userId,
        examId: result.examId,
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        passed: result.passed
      },
      {
        priority: EventPriority.HIGH,
        userId: result.userId
      }
    );
  }
}

// modules/gamification/events/handlers/AttemptGradedHandler.ts
import { createEventHandler, EventType, publishEvent } from '@/lib/events';
import { GamificationService } from '../../services/GamificationService';

createEventHandler(EventType.ATTEMPT_GRADED, async (event) => {
  const { userId, score, maxScore } = event.data;
  
  // 1. Calculer XP
  const xp = Math.floor((score / maxScore) * 100);
  
  // 2. Attribuer XP
  const result = await GamificationService.addXP(userId, xp, 'exam');
  
  // 3. Publier XP_GAINED
  await publishEvent(EventType.XP_GAINED, {
    amount: xp,
    source: 'exam',
    sourceId: event.data.examId,
    newTotal: result.totalXP
  }, {
    userId,
    correlationId: event.metadata.correlationId
  });
  
  // 4. Vérifier badges
  if (score >= maxScore * 0.9) {
    await publishEvent(EventType.BADGE_EARNED, {
      badgeId: 'perfect-score',
      badgeName: 'Perfect Score',
      badgeIcon: '🏆',
      badgeRarity: 'rare',
      pointsAwarded: 50
    }, {
      userId,
      priority: EventPriority.HIGH,
      correlationId: event.metadata.correlationId
    });
  }
});

// modules/messaging/events/handlers/BadgeEarnedHandler.ts
import { createEventHandler, EventType } from '@/lib/events';
import { NotificationService } from '../../services/NotificationService';

createEventHandler(EventType.BADGE_EARNED, async (event) => {
  const { badgeName, badgeIcon } = event.data;
  
  // Envoyer notification
  await NotificationService.send(event.userId, {
    title: 'Nouveau Badge!',
    message: `Vous avez obtenu le badge ${badgeName} ${badgeIcon}`,
    type: 'badge',
    priority: 'high'
  });
});
```

### Exemple 2 : Saga d'enrôlement étudiant

```typescript
// modules/invitations/sagas/StudentEnrollmentSaga.ts
import { createEventHandler, EventType, publishEvent } from '@/lib/events';

class StudentEnrollmentSaga {
  constructor() {
    createEventHandler(EventType.INVITATION_ACCEPTED, this.onInvitationAccepted.bind(this));
  }

  private async onInvitationAccepted(event: any): Promise<void> {
    const correlationId = event.id; // Utiliser l'ID comme correlation
    const { userId, classId, invitationId } = event.data;
    
    try {
      // Étape 1: Enrôler l'étudiant
      const enrollment = await this.enrollStudent(userId, classId);
      
      await publishEvent(EventType.STUDENT_ENROLLED, {
        userId,
        classId,
        className: enrollment.className,
        enrolledAt: new Date()
      }, {
        userId,
        correlationId,
        causationId: event.id
      });
      
      // Étape 2: Attribution XP de bienvenue
      await publishEvent(EventType.XP_GAINED, {
        amount: 10,
        source: 'enrollment',
        sourceId: classId,
        newTotal: 10
      }, {
        userId,
        correlationId
      });
      
      // Étape 3: Créer notification de bienvenue
      await publishEvent(EventType.NOTIFICATION_CREATED, {
        type: 'welcome',
        title: 'Bienvenue!',
        message: `Vous êtes maintenant inscrit à ${enrollment.className}`
      }, {
        userId,
        priority: EventPriority.HIGH,
        correlationId
      });
      
    } catch (error) {
      // Publier événement d'échec
      await publishEvent('ENROLLMENT_FAILED', {
        userId,
        classId,
        invitationId,
        error: error.message
      }, {
        priority: EventPriority.HIGH,
        correlationId
      });
      
      throw error; // DLQ va capturer
    }
  }
}

new StudentEnrollmentSaga();
```

### Exemple 3 : Analytics en temps réel

```typescript
// modules/analytics/events/handlers/AttemptGradedAnalyticsHandler.ts
import { createEventHandler, EventType } from '@/lib/events';

createEventHandler(EventType.ATTEMPT_GRADED, async (event) => {
  const { examId, score, maxScore, userId } = event.data;
  
  // Mettre à jour les stats en temps réel
  await Analytics.updateOne(
    { examId },
    {
      $inc: {
        totalAttempts: 1,
        totalScore: score
      },
      $push: {
        scores: score
      }
    },
    { upsert: true }
  );
  
  // Vérifier si alerte nécessaire (taux d'échec élevé)
  const stats = await Analytics.findOne({ examId });
  const failureRate = stats.scores.filter(s => s < maxScore * 0.5).length / stats.totalAttempts;
  
  if (failureRate > 0.7) {
    await publishEvent('PERFORMANCE_ALERT', {
      examId,
      alertType: 'high_failure_rate',
      failureRate,
      threshold: 0.7
    }, {
      priority: EventPriority.HIGH
    });
  }
});
```

---

## Debugging

### Activer les logs verbose

```env
VERBOSE_EVENT_LOGGING="true"
```

### Récupérer les statistiques

```typescript
import { getEventBusStats } from '@/lib/events';

const stats = getEventBusStats();
console.log('Queue stats:', stats);
// {
//   0: 0,  // CRITICAL queue size
//   1: 5,  // HIGH queue size
//   2: 20, // NORMAL queue size
//   3: 10  // LOW queue size
// }
```

### Vérifier la DLQ

```typescript
import { EventBus } from '@/lib/events';

const dlq = EventBus.getInstance().deadLetterQueue;
const stats = await dlq.getStats();

if (stats.unresolved > 0) {
  console.warn(`⚠️  ${stats.unresolved} events in DLQ!`);
  const failed = await dlq.getUnresolved({ limit: 10 });
  console.log('Failed events:', failed);
}
```

---

## Ressources

- [Plan Architecture Modulaire](/docs/features/MODULAR_ARCHITECTURE_PLAN.md)
- [EventBus Source](/lib/events/core/EventBus.ts)
- [Types d'événements](/lib/events/types.ts)
- [Feature Flags](/lib/config/features.ts)
- [Bootstrap](/lib/bootstrap.ts)
