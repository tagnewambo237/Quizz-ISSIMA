# Strategy & Decorator Patterns - Exam Evaluation System

## Vue d'ensemble

Le système d'évaluation des examens utilise deux design patterns complémentaires:
- **Strategy Pattern**: Pour choisir la méthode d'évaluation selon le type d'examen
- **Decorator Pattern**: Pour enrichir dynamiquement les résultats avec des bonus, badges, et statistiques

## Architecture

### Strategy Pattern

#### Problème Résolu
Différents types d'examens nécessitent différentes méthodes d'évaluation. Le Strategy Pattern permet de définir une famille d'algorithmes d'évaluation et de les rendre interchangeables.

#### Stratégies Disponibles

##### 1. QCMEvaluationStrategy
```typescript
// Pour les Questions à Choix Multiples
- Évaluation binaire (correct/incorrect)
- Score = somme des points des réponses correctes
- Feedback standard
```

##### 2. TrueFalseEvaluationStrategy
```typescript
// Pour les questions Vrai/Faux
- Validation stricte
- 1 point par question
- Feedback adapté au niveau
```

##### 3. AdaptiveEvaluationStrategy
```typescript
// Pour les évaluations adaptatives
- Bonus selon la difficulté des questions
- Multiplicateurs:
  * BEGINNER: 1.0x
  * INTERMEDIATE: 1.2x
  * ADVANCED: 1.5x
  * EXPERT: 2.0x
- Encourage la prise de risque
```

##### 4. ExamSimulationStrategy
```typescript
// Pour les simulations d'examen
- Pénalités pour les erreurs (-25% des points)
- Évaluation stricte
- Prépare aux examens officiels
```

### Decorator Pattern

#### Problème Résolu
Besoin d'ajouter dynamiquement des fonctionnalités aux résultats d'évaluation sans modifier le code de base.

#### Décorateurs Disponibles

##### 1. TimeBonusDecorator
```typescript
// Bonus pour rapidité
- Si terminé en < 75% du temps
- Bonus = (75 - timePercentage) / 10
- Max 7.5% de bonus
```

##### 2. StreakBonusDecorator
```typescript
// Bonus pour séries de bonnes réponses
- Streak de 3+ réponses correctes
- +0.5 point par réponse au-delà de 2
- Encourage la constance
```

##### 3. TimePenaltyDecorator
```typescript
// Pénalité pour dépassement
- -1% par minute de dépassement
- Max 20% de pénalité
- Encourage la gestion du temps
```

##### 4. BadgeDecorator
```typescript
// Système de badges
- 🏆 Perfection (100%)
- ⚡ Éclair (bonus temps)
- 🔥 En feu (streak 5+)
- ⭐ Excellence (90%+)
- ✨ Très bien (75%+)
```

##### 5. DetailedStatsDecorator
```typescript
// Statistiques avancées
- Temps moyen par question
- Performance par difficulté
- Question la plus rapide/lente
- Points forts et faibles
```

## Utilisation

### Exemple 1: Évaluation Simple

```typescript
import { ExamEvaluationService } from '@/lib/services/ExamEvaluationService'

// Évaluer une tentative
const result = await ExamEvaluationService.evaluateAttempt(attemptId)

console.log(result)
// {
//   score: 85,
//   maxScore: 100,
//   percentage: 85,
//   passed: true,
//   feedback: "Félicitations ! Vous avez réussi. Bonus temps: +5 points !",
//   details: {
//     correctAnswers: 17,
//     totalQuestions: 20,
//     timeBonus: 5,
//     badges: ["⭐ Excellence", "⚡ Éclair"]
//   }
// }
```

### Exemple 2: Évaluation Personnalisée

```typescript
// Désactiver certains bonus
const result = await ExamEvaluationService.evaluateAttempt(attemptId, {
    enableTimeBonus: false,
    enableStreakBonus: true,
    enableBadges: true,
    enableDetailedStats: true
})
```

### Exemple 3: Prévisualisation

```typescript
// Prévisualiser sans sauvegarder
const preview = await ExamEvaluationService.previewEvaluation(
    examId,
    responses,
    questions
)
```

### Exemple 4: Statistiques Globales

```typescript
const stats = await ExamEvaluationService.getExamStatistics(examId)

console.log(stats)
// {
//   totalAttempts: 150,
//   totalCompletions: 145,
//   averageScore: 76.5,
//   averageTime: 45.2,
//   passRate: 82.3,
//   distribution: {
//     excellent: 45,  // 90-100%
//     good: 60,       // 75-89%
//     average: 30,    // 50-74%
//     poor: 10        // 0-49%
//   }
// }
```

## Flux d'Évaluation

```
1. Récupération des données
   ↓
2. Strategy Pattern (Évaluation de base)
   ├─ QCM → QCMEvaluationStrategy
   ├─ True/False → TrueFalseEvaluationStrategy
   ├─ Adaptive → AdaptiveEvaluationStrategy
   └─ Simulation → ExamSimulationStrategy
   ↓
3. Decorator Pattern (Enrichissement)
   ├─ TimeBonusDecorator (si applicable)
   ├─ StreakBonusDecorator (si applicable)
   ├─ BadgeDecorator
   └─ DetailedStatsDecorator
   ↓
4. Sauvegarde et mise à jour des stats
   ↓
5. Retour du résultat enrichi
```

## Configuration par Type d'Examen

### QCM Standard
```typescript
{
  evaluationType: EvaluationType.QCM,
  config: {
    passingScore: 50,
    maxAttempts: 3
  }
}
// → QCMEvaluationStrategy
// → Tous les décorateurs activés
```

### Simulation d'Examen
```typescript
{
  evaluationType: EvaluationType.EXAM_SIMULATION,
  config: {
    passingScore: 60,
    maxAttempts: 1
  }
}
// → ExamSimulationStrategy (avec pénalités)
// → Pas de bonus temps (trop strict)
```

### Évaluation Adaptative
```typescript
{
  evaluationType: EvaluationType.ADAPTIVE,
  difficultyLevel: DifficultyLevel.ADVANCED,
  config: {
    passingScore: 70
  }
}
// → AdaptiveEvaluationStrategy (avec multiplicateurs)
// → Bonus streak activé
```

## Extension

### Ajouter une Nouvelle Stratégie

```typescript
export class CustomEvaluationStrategy implements EvaluationStrategy {
    async evaluate(
        exam: IExam,
        responses: any[],
        questions: any[]
    ): Promise<EvaluationResult> {
        // Logique personnalisée
        return {
            score: 0,
            maxScore: 100,
            percentage: 0,
            passed: false
        }
    }
}

// Dans EvaluationStrategyFactory
case EvaluationType.CUSTOM:
    return new CustomEvaluationStrategy()
```

### Ajouter un Nouveau Décorateur

```typescript
export class CustomDecorator extends BaseExamDecorator {
    decorate(exam: IExam): IExam {
        return exam
    }

    enhanceResult(result: EvaluationResult, exam: IExam): EvaluationResult {
        // Logique d'enrichissement
        return {
            ...result,
            feedback: `${result.feedback} Custom enhancement!`
        }
    }
}

// Dans ExamDecoratorFactory
if (options.enableCustom) {
    const decorator = new CustomDecorator()
    enhancedResult = decorator.enhanceResult(enhancedResult, exam)
}
```

## Avantages

### Strategy Pattern
1. **Séparation des préoccupations**: Chaque stratégie est indépendante
2. **Extensibilité**: Facile d'ajouter de nouveaux types d'évaluation
3. **Testabilité**: Chaque stratégie peut être testée isolément
4. **Flexibilité**: Changement de stratégie à l'exécution

### Decorator Pattern
1. **Composition**: Combine plusieurs fonctionnalités
2. **Réutilisabilité**: Décorateurs réutilisables
3. **Flexibilité**: Activation/désactivation dynamique
4. **Open/Closed Principle**: Ouvert à l'extension, fermé à la modification

## Performance

- **Cache**: Les stratégies sont des singletons
- **Lazy Loading**: Les décorateurs ne s'appliquent que si activés
- **Optimisation**: Calculs incrémentaux pour les stats

## Tests

```bash
# Tester les stratégies
npm test __tests__/unit/lib/patterns/EvaluationStrategy.test.ts

# Tester les décorateurs
npm test __tests__/unit/lib/patterns/ExamDecorator.test.ts

# Tester le service
npm test __tests__/unit/lib/services/ExamEvaluationService.test.ts
```

## Intégration API

```typescript
// Dans une API route
import { ExamEvaluationService } from '@/lib/services/ExamEvaluationService'

export async function POST(req: Request) {
    const { attemptId } = await req.json()
    
    const result = await ExamEvaluationService.evaluateAttempt(attemptId)
    
    return Response.json(result)
}
```

## Sécurité

- ✅ Validation des entrées
- ✅ Vérification des permissions
- ✅ Prévention de la manipulation des scores
- ✅ Audit trail des évaluations
