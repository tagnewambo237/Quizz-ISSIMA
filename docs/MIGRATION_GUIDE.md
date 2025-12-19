# 📘 Guide de Migration vers l'Architecture Modulaire

## Vue d'ensemble

Ce guide vous accompagne dans la migration progressive de votre code existant vers la nouvelle architecture modulaire événementielle de QuizLock.

---

## 🎯 Objectifs de la Migration

1. **Découpler** les composants via des événements
2. **Améliorer** la maintenabilité et la testabilité  
3. **Augmenter** la scalabilité
4. **Faciliter** l'ajout de nouvelles fonctionnalités
5. **Garantir** la résilience (Dead Letter Queue, retry automatique)

---

## 📋 Prérequis

Avant de commencer la migration, assurez-vous que :

- ✅ L'infrastructure événementielle est installée (`/lib/events/`)
- ✅ Les 8 modules sont créés (`/modules/`)
- ✅ Les API routes admin sont en place
- ✅ Les variables d'environnement sont configurées

---

## 🔄 Stratégie de Migration : Progressive

### Phase 1: Mode Dual (Recommandé pour Production)

```env
# .env
USE_NEW_EVENT_BUS="true"
USE_MODULAR_STRUCTURE="true"
EVENT_PUBLISHING_MODE="dual"  # Publie dans ancien ET nouveau système

# Activer modules un par un
MODULE_GAMIFICATION_ENABLED="true"
MODULE_MESSAGING_ENABLED="true"
# ... autres modules à false initialement
```

**Avantages** :
- ✅ Pas de régression (ancien code continue de fonctionner)
- ✅ Test progressif du nouveau système
- ✅ Rollback facile si problème

**Inconvénients** :
- ⚠️ Légère baisse de performance (double publication)
- ⚠️ Code de transition à maintenir temporairement

### Phase 2: Mode New-Only (Après validation)

```env
EVENT_PUBLISHING_MODE="new-only"  # Nouveau système uniquement
```

---

## 🛠️ Migration Pas à Pas

### Étape 1: Identifier un Workflow Simple

Commencez par un workflow simple, par exemple : **Attribution XP après un examen**.

**Code existant** (couplé) :
```typescript
// Dans ExamEvaluationService.ts
async gradeAttempt(attemptId: string) {
  const result = await this.calculateScore(attemptId);
  
  // Couplage direct avec GamificationService ❌
  await GamificationService.addXP(
    result.userId,
    result.score,
    'exam',
    attemptId
  );
  
  return result;
}
```

**Problèmes** :
- Couplage fort entre modules
- Difficile à tester
- Pas de traçabilité
- Pas de retry si erreur

### Étape 2: Refactorer avec Événements

**Nouveau code** (découplé) :
```typescript
// Dans ExamEvaluationService.ts
import { publishEvent, EventType, EventPriority } from '@/lib/events';

async gradeAttempt(attemptId: string) {
  const result = await this.calculateScore(attemptId);
  
  // Publier événement ✅
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
      userId: result.userId,
      priority: EventPriority.HIGH
    }
  );
  
  return result;
}
```

**Avantages** :
- ✅ Découplé (ne connaît plus GamificationService)
- ✅ Événement tracé dans MongoDB
- ✅ Retry automatique si échec
- ✅ Facile à tester (mock de publishEvent)

### Étape 3: Créer le Handler

Le module Gamification écoute l'événement :

```typescript
// modules/gamification/events/handlers/AttemptGradedHandler.ts
import { createEventHandler, EventType } from '@/lib/events';
import { GamificationService } from '../../services/GamificationService';

createEventHandler(EventType.ATTEMPT_GRADED, async (event) => {
  const { userId, examId, score, maxScore } = event.data;
  
  // Calculer XP
  const xp = Math.floor((score / maxScore) * 100);
  
  // Attribuer XP
  await GamificationService.addXP(
    userId.toString(),
    xp,
    'exam',
    examId.toString()
  );
  
  console.log(`[Gamification] Awarded ${xp} XP to user ${userId}`);
});
```

**Résultat** :
- ExamEvaluationService n'importe plus GamificationService
- La logique XP est dans le module Gamification
- Si GamificationService plante, l'événement va en Dead Letter Queue

### Étape 4: Tester le Workflow Complet

1. **Lancer l'application** avec `EVENT_PUBLISHING_MODE="dual"`
2. **Passer un examen** en tant qu'étudiant
3. **Vérifier les logs** :
   ```
   [EventBus] Published ATTEMPT_GRADED (priority: HIGH)
   [Gamification] Awarded 85 XP to user 123
   [EventStore] Persisted event abc-123
   ```
4. **Vérifier le dashboard admin** : `/admin/events`
   - Statistiques EventBus
   - Historique des événements
   - Dead Letter Queue (devrait être vide)

### Étape 5: Activer le Module

```env
MODULE_GAMIFICATION_ENABLED="true"
```

**Redémarrer l'application** et vérifier les logs :
```
[Bootstrap] ✅ Loaded module: gamification
[Module] Gamification chargé ✅
```

---

## 📊 Checklist de Migration par Module

### Module Gamification

- [ ] Identifier tous les appels directs à `GamificationService`
- [ ] Remplacer par publication d'événements :
  - `ATTEMPT_GRADED` → attribue XP
  - `STUDENT_ENROLLED` → attribue XP bienvenue
  - `EXAM_COMPLETED` → vérifie badges
- [ ] Créer handlers dans `/modules/gamification/events/handlers/`
- [ ] Tester workflow complet
- [ ] Activer module : `MODULE_GAMIFICATION_ENABLED="true"`
- [ ] Supprimer ancien code (optionnel, en phase 2)

### Module Messaging

- [ ] Identifier envois de notifications
- [ ] Remplacer par handlers d'événements :
  - `BADGE_EARNED` → notification badge
  - `LEVEL_UP` → notification niveau
  - `EXAM_PUBLISHED` → notification étudiants
- [ ] Créer handlers dans `/modules/messaging/events/handlers/`
- [ ] Tester notifications
- [ ] Activer module : `MODULE_MESSAGING_ENABLED="true"`

### Module Analytics

- [ ] Identifier mises à jour de statistiques
- [ ] Remplacer par handlers :
  - `ATTEMPT_GRADED` → MAJ stats examen
  - `STUDENT_ENROLLED` → MAJ stats classe
  - `XP_GAINED` → MAJ stats gamification
- [ ] Créer handlers dans `/modules/analytics/events/handlers/`
- [ ] Tester dashboards
- [ ] Activer module : `MODULE_ANALYTICS_ENABLED="true"`

---

## 🚨 Pièges à Éviter

### 1. ❌ Attendre la Réponse d'un Événement

**MAUVAIS** :
```typescript
await publishEvent('BADGE_EARNED', data);
// Attendre que le handler traite... ❌
const badge = await getBadge(); // Risque de race condition
```

**BON** :
```typescript
await publishEvent('BADGE_EARNED', data);
// Le handler s'exécute de manière asynchrone ✅
// Ne pas attendre de résultat immédiat
```

**Solution** : Si besoin de résultat immédiat, utiliser un appel de service direct (import autorisé vers niveaux inférieurs).

### 2. ❌ Oublier l'Idempotence

**MAUVAIS** :
```typescript
createEventHandler('XP_GAINED', async (event) => {
  // Si l'événement est rejoué, XP sera crédité en double ❌
  await UserXP.updateOne(
    { userId: event.userId },
    { $inc: { totalXP: event.data.amount } }
  );
});
```

**BON** :
```typescript
createEventHandler('XP_GAINED', async (event) => {
  // Vérifier si déjà traité ✅
  const exists = await XPTransaction.findOne({ eventId: event.id });
  if (exists) return; // Déjà traité
  
  // Traiter
  await XPTransaction.create({
    eventId: event.id,
    userId: event.userId,
    amount: event.data.amount
  });
});
```

### 3. ❌ Publier Trop de Données Inutiles

**MAUVAIS** :
```typescript
await publishEvent('USER_REGISTERED', {
  ...entireUserObject, // 50+ champs ❌
  ...entireProfileObject
});
```

**BON** :
```typescript
await publishEvent('USER_REGISTERED', {
  userId: user._id,
  name: user.name,
  email: user.email,
  role: user.role
  // Seulement données nécessaires ✅
});
```

### 4. ❌ Ne Pas Utiliser correlationId pour les Workflows

**MAUVAIS** :
```typescript
await publishEvent('STEP_1', data1);
await publishEvent('STEP_2', data2);
await publishEvent('STEP_3', data3);
// Impossible de tracer le workflow complet ❌
```

**BON** :
```typescript
const correlationId = uuidv4();

await publishEvent('STEP_1', data1, { correlationId });
await publishEvent('STEP_2', data2, { correlationId });
await publishEvent('STEP_3', data3, { correlationId });

// Plus tard : récupérer tout le workflow
const workflow = await getEventHistory({ correlationId });
```

---

## 🧪 Tests de Migration

### Test 1: Workflow Examen Complet

```typescript
// __tests__/migration/exam-workflow.test.ts
describe('Exam Workflow Migration', () => {
  it('should handle complete exam workflow with events', async () => {
    // 1. Étudiant démarre un examen
    const attemptId = await AttemptService.startAttempt(examId, userId);
    
    // 2. Répond aux questions
    await AttemptService.saveAnswer(attemptId, q1, answer1);
    await AttemptService.saveAnswer(attemptId, q2, answer2);
    
    // 3. Soumet l'examen
    await AttemptService.submitAttempt(attemptId);
    
    // 4. Attendre traitement événements
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 5. Vérifier résultats
    const attempt = await Attempt.findById(attemptId);
    expect(attempt.status).toBe('GRADED');
    
    // 6. Vérifier XP attribué
    const userXP = await UserXP.findOne({ userId });
    expect(userXP.totalXP).toBeGreaterThan(0);
    
    // 7. Vérifier événements dans Event Store
    const history = await getEventHistory({ userId });
    expect(history).toContainEqual(
      expect.objectContaining({ type: 'ATTEMPT_GRADED' })
    );
    expect(history).toContainEqual(
      expect.objectContaining({ type: 'XP_GAINED' })
    );
  });
});
```

### Test 2: Dead Letter Queue

```typescript
describe('DLQ Resilience', () => {
  it('should capture failed events in DLQ', async () => {
    // Créer handler qui échoue
    createEventHandler('TEST_FAIL', async () => {
      throw new Error('Intentional failure');
    });
    
    // Publier événement
    await publishEvent('TEST_FAIL', { test: true });
    
    // Attendre traitement
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Vérifier que l'événement est en DLQ
    const dlq = new DeadLetterQueue();
    const unresolved = await dlq.getUnresolved();
    
    expect(unresolved).toContainEqual(
      expect.objectContaining({ eventType: 'TEST_FAIL' })
    );
  });
});
```

---

## 📈 Monitoring de la Migration

### Dashboard Admin

Accéder à : **`/admin/events`**

Vérifier :
- ✅ **EventBus Status** : Initialized
- ✅ **Queues** : Peu d'événements en attente
- ✅ **DLQ** : 0 ou très peu d'événements non résolus
- ✅ **Event Store** : Historique se remplit progressivement

### Logs à Surveiller

```bash
# Démarrage
[Bootstrap] ✅ Application initialized successfully
[Module] Gamification chargé ✅

# Événements
[EventBus] Published ATTEMPT_GRADED (priority: HIGH)
[Gamification] Awarded 85 XP to user 123

# Erreurs
[DeadLetterQueue] Added failed event abc-123 to DLQ
```

### Metrics Clés

| Métrique | Objectif | Action si dépassé |
|----------|----------|-------------------|
| DLQ Unresolved | < 10 | Investiguer handlers en échec |
| Queue Total | < 100 | Augmenter `EVENT_QUEUE_PROCESSING_INTERVAL` |
| Event Store Size | Croissance linéaire | Configurer TTL (90 jours par défaut) |

---

## 🎯 Checklist Finale

### Avant Production

- [ ] Tous les modules activés et testés
- [ ] Mode `EVENT_PUBLISHING_MODE="new-only"`
- [ ] Dashboard admin accessible
- [ ] Dead Letter Queue vide ou < 5 événements
- [ ] Tests end-to-end passent
- [ ] Ancien code supprimé ou marqué deprecated

### Post-Migration

- [ ] Monitoring APM configuré (New Relic, Datadog, etc.)
- [ ] Alertes DLQ configurées
- [ ] Documentation mise à jour
- [ ] Équipe formée sur l'architecture modulaire
- [ ] Rollback plan documenté

---

## 🆘 Dépannage

### Problème : Événements Non Traités

**Symptôme** : Les handlers ne s'exécutent pas.

**Solution** :
1. Vérifier que le module est activé : `MODULE_XXX_ENABLED="true"`
2. Vérifier que le handler est importé dans `/modules/xxx/index.ts`
3. Vérifier les logs : `VERBOSE_EVENT_LOGGING="true"`

### Problème : Dead Letter Queue Pleine

**Symptôme** : Beaucoup d'événements en DLQ.

**Solution** :
1. Accéder au dashboard : `/admin/events`
2. Identifier le type d'événement qui échoue
3. Vérifier les logs du handler correspondant
4. Corriger le bug
5. Retry manuellement : Bouton "Retry All" dans le dashboard

### Problème : Performance Dégradée

**Symptôme** : Latence élevée après migration.

**Solution** :
1. Vérifier `EVENT_QUEUE_PROCESSING_INTERVAL` (diminuer si trop de queued)
2. Passer en mode `new-only` (si encore en dual)
3. Ajouter indexes MongoDB sur EventStore
4. Activer cache pour stats (Redis)

---

## 📚 Ressources

- **Guide EventBus** : `/docs/features/EVENT_BUS_GUIDE.md`
- **Architecture** : `/modules/README.md`
- **Exemples** : `/modules/EXEMPLE_USAGE.ts`
- **Configuration** : `/ENV_MODULAR_CONFIG.md`

---

## ✅ Résumé : 3 Étapes Clés

1. **Identifier** : Trouver couplages directs entre modules
2. **Refactorer** : Remplacer par publication d'événements
3. **Valider** : Tester workflow + vérifier dashboard admin

**Bon courage pour la migration ! 🚀**
