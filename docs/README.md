# QuizLock - Architecture Modulaire

Ce dossier contient les modules métier de QuizLock, organisés selon une architecture modulaire événementielle.

## Structure des Modules

### 1. auth
Authentification, utilisateurs et profils

### 2. academic-structure
Écoles, classes, niveaux, filières, matières, syllabus

### 3. invitations
Invitations et enrollment des utilisateurs

### 4. assessments
Examens, questions, codes de retard

### 5. exam-execution
Tentatives, réponses, évaluation

### 6. gamification
XP, badges, challenges, leaderboards

### 7. analytics
Analytics, prédictions, insights IA

### 8. messaging
Forums, messages, notifications

## Organisation d'un Module

Chaque module suit cette structure :

```
/modules/[module-name]/
├── models/              # Modèles Mongoose
├── services/            # Logique métier
├── events/
│   ├── handlers/        # Event handlers
│   └── types.ts         # Types d'événements
└── index.ts            # API publique du module
```

## Règles de Dépendances

**Hiérarchie (du bas vers le haut) :**
1. auth
2. academic-structure, invitations
3. assessments
4. exam-execution
5. gamification, analytics
6. messaging

**Règles :**
- Import direct autorisé **uniquement** vers niveaux inférieurs
- Communication par **événements** pour niveaux supérieurs/pairs
- **Pas de dépendances circulaires**

## Communication Inter-Modules

Les modules communiquent via le **bus d'événements** (`EventBus`) situé dans `/lib/events/core/`.

**Exemple :**
```typescript
import { EventBus } from '@/lib/events/core/EventBus';
import { publishEvent } from '@/lib/events/helpers';

// Publier un événement
await publishEvent('ATTEMPT_GRADED', { userId, score }, { priority: EventPriority.HIGH });

// Écouter un événement
EventBus.getInstance().subscribe('ATTEMPT_GRADED', async (event) => {
  // Traiter l'événement
});
```

## Migration Progressive

Les modules sont activés progressivement via feature flags dans `/lib/config/features.ts`.

Pendant la migration, l'ancien code cohabite avec le nouveau via `LegacyEventAdapter`.
