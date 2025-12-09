# 03 - Design Patterns Implémentés

> **Document:** Patterns de Conception
> **Version:** 2.0
> **Dernière mise à jour:** Décembre 2024
> **Patterns implémentés:** 6

---

## 📚 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Strategy Pattern](#strategy-pattern---évaluation)
3. [Decorator Pattern](#decorator-pattern---enrichissement)
4. [Chain of Responsibility](#chain-of-responsibility---permissions)
5. [Observer Pattern](#observer-pattern---événements)
6. [Factory Pattern](#factory-pattern---création)
7. [Singleton Pattern](#singleton-pattern---instances-uniques)
8. [Diagrammes d'Architecture](#diagrammes-darchitecture)

---

## 🎯 Vue d'ensemble

Xkorin School utilise plusieurs **design patterns reconnus** pour garantir une architecture scalable, maintenable et extensible. Ces patterns résolvent des problèmes architecturaux spécifiques identifiés dans le domaine éducatif.

### Patterns Implémentés

| Pattern | Fichier | Problème Résolu | Bénéfice |
|---------|---------|-----------------|----------|
| **Strategy** | `/lib/patterns/EvaluationStrategy.ts` | Différents types d'évaluation | Ajout facile de nouveaux types sans modifier le code existant |
| **Decorator** | `/lib/patterns/ExamDecorator.ts` | Enrichissement dynamique des résultats | Composition flexible de fonctionnalités (bonuses, pénalités, badges) |
| **Chain of Responsibility** | `/lib/patterns/AccessHandler.ts` | Permissions multi-niveaux complexes | Validation hiérarchique extensible |
| **Observer** | `/lib/events/EventPublisher.ts` | Notifications et side-effects | Découplage entre producteurs et consommateurs d'événements |
| **Factory** | `/lib/factories/ProfileFactory.ts` | Création de profils utilisateurs | Centralisation de la logique de création |
| **Singleton** | Plusieurs fichiers | Instance unique partagée | Cohérence globale (EventPublisher, AuthStrategyManager) |

### Principes SOLID Appliqués

- ✅ **Single Responsibility:** Chaque classe a une seule raison de changer
- ✅ **Open/Closed:** Ouvert à l'extension, fermé à la modification
- ✅ **Liskov Substitution:** Les sous-classes sont interchangeables
- ✅ **Interface Segregation:** Interfaces spécifiques aux clients
- ✅ **Dependency Inversion:** Dépendances sur abstractions, pas sur implémentations

---

## 🎮 Strategy Pattern - Évaluation

### Problème

Différents types d'examens nécessitent **différentes méthodes d'évaluation** :
- QCM : Score binaire (correct/incorrect)
- Adaptatif : Difficulté dynamique avec multiplicateur
- Simulation d'examen : Pénalités pour mauvaises réponses
- Etc.

**Sans Strategy Pattern :** Code avec nombreux `if/else` ou `switch` qui devient rapidement illisible et difficile à maintenir.

### Solution

Encapsuler chaque algorithme d'évaluation dans une classe séparée implémentant une interface commune.

### Structure

#### Interface Principale

**Fichier:** `/lib/patterns/EvaluationStrategy.ts`

```typescript
// Résultat d'évaluation standardisé
export interface EvaluationResult {
  score: number;                         // Score obtenu
  maxScore: number;                      // Score maximum possible
  percentage: number;                    // Pourcentage (0-100)
  passed: boolean;                       // A-t-il réussi ?
  feedback: string;                      // Message de feedback
  details: Record<string, any>;          // Détails supplémentaires
}

// Interface Strategy
export interface IEvaluationStrategy {
  evaluate(
    exam: IExam,
    attempt: IAttempt,
    responses: IResponse[],
    questions: IQuestion[]
  ): Promise<EvaluationResult>;
}
```

#### Stratégies Concrètes

##### 1. QCMEvaluationStrategy

**Usage:** Questions à choix multiples standard

```typescript
export class QCMEvaluationStrategy implements IEvaluationStrategy {
  async evaluate(
    exam: IExam,
    attempt: IAttempt,
    responses: IResponse[],
    questions: IQuestion[]
  ): Promise<EvaluationResult> {
    let score = 0;
    let maxScore = 0;

    for (const question of questions) {
      maxScore += question.points;

      const response = responses.find(
        r => r.questionId.toString() === question._id.toString()
      );

      if (response && response.isCorrect) {
        score += question.points;
      }
    }

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed = percentage >= (exam.config.passingScore || 50);

    return {
      score,
      maxScore,
      percentage,
      passed,
      feedback: passed
        ? 'Félicitations ! Vous avez réussi cet examen.'
        : 'Vous n\'avez pas atteint le score minimum requis.',
      details: {
        correctAnswers: responses.filter(r => r.isCorrect).length,
        totalQuestions: questions.length,
        evaluationType: 'QCM'
      }
    };
  }
}
```

**Caractéristiques:**
- Scoring binaire (correct = points, incorrect = 0)
- Pas de pénalité pour mauvaises réponses
- Simple et direct

---

##### 2. TrueFalseEvaluationStrategy

**Usage:** Questions Vrai/Faux

```typescript
export class TrueFalseEvaluationStrategy implements IEvaluationStrategy {
  async evaluate(
    exam: IExam,
    attempt: IAttempt,
    responses: IResponse[],
    questions: IQuestion[]
  ): Promise<EvaluationResult> {
    let score = 0;
    let maxScore = 0;

    for (const question of questions) {
      maxScore += question.points;

      const response = responses.find(
        r => r.questionId.toString() === question._id.toString()
      );

      // Strict validation : une seule option correcte attendue
      if (response && response.isCorrect) {
        score += question.points;
      }
    }

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed = percentage >= (exam.config.passingScore || 50);

    return {
      score,
      maxScore,
      percentage,
      passed,
      feedback: this.generateFeedback(percentage, passed),
      details: {
        correctAnswers: responses.filter(r => r.isCorrect).length,
        totalQuestions: questions.length,
        evaluationType: 'TRUE_FALSE'
      }
    };
  }

  private generateFeedback(percentage: number, passed: boolean): string {
    if (percentage === 100) return 'Parfait ! 100% de bonnes réponses !';
    if (percentage >= 80) return 'Excellent travail !';
    if (percentage >= 70) return 'Bien joué !';
    if (passed) return 'Vous avez réussi, continuez vos efforts.';
    return 'Continuez à pratiquer pour vous améliorer.';
  }
}
```

**Caractéristiques:**
- Validation stricte (Vrai ou Faux uniquement)
- Feedback gradué selon le pourcentage
- Pas de pénalité

---

##### 3. AdaptiveEvaluationStrategy

**Usage:** Examens adaptatifs avec multiplicateur de difficulté

```typescript
export class AdaptiveEvaluationStrategy implements IEvaluationStrategy {
  private readonly DIFFICULTY_MULTIPLIERS = {
    [DifficultyLevel.BEGINNER]: 1.0,
    [DifficultyLevel.INTERMEDIATE]: 1.25,
    [DifficultyLevel.ADVANCED]: 1.5,
    [DifficultyLevel.EXPERT]: 2.0
  };

  async evaluate(
    exam: IExam,
    attempt: IAttempt,
    responses: IResponse[],
    questions: IQuestion[]
  ): Promise<EvaluationResult> {
    let score = 0;
    let maxScore = 0;
    const difficultyBreakdown: Record<string, any> = {};

    for (const question of questions) {
      const multiplier = this.DIFFICULTY_MULTIPLIERS[question.difficulty] || 1.0;
      const adjustedPoints = question.points * multiplier;
      maxScore += adjustedPoints;

      // Track per-difficulty stats
      if (!difficultyBreakdown[question.difficulty]) {
        difficultyBreakdown[question.difficulty] = {
          correct: 0,
          total: 0,
          points: 0
        };
      }
      difficultyBreakdown[question.difficulty].total++;

      const response = responses.find(
        r => r.questionId.toString() === question._id.toString()
      );

      if (response && response.isCorrect) {
        score += adjustedPoints;
        difficultyBreakdown[question.difficulty].correct++;
        difficultyBreakdown[question.difficulty].points += adjustedPoints;
      }
    }

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed = percentage >= (exam.config.passingScore || 50);

    return {
      score: Math.round(score * 100) / 100,
      maxScore: Math.round(maxScore * 100) / 100,
      percentage,
      passed,
      feedback: this.generateAdaptiveFeedback(difficultyBreakdown, passed),
      details: {
        difficultyBreakdown,
        evaluationType: 'ADAPTIVE',
        averageMultiplier: this.calculateAverageMultiplier(questions)
      }
    };
  }

  private generateAdaptiveFeedback(
    breakdown: Record<string, any>,
    passed: boolean
  ): string {
    const expertCorrect = breakdown[DifficultyLevel.EXPERT]?.correct || 0;
    const expertTotal = breakdown[DifficultyLevel.EXPERT]?.total || 0;

    if (expertCorrect > 0 && expertCorrect === expertTotal) {
      return 'Incroyable ! Vous maîtrisez les questions EXPERT !';
    }

    if (passed) {
      return 'Bon travail ! Continuez à vous challenger avec des questions plus difficiles.';
    }

    return 'Commencez par maîtriser les questions de niveau BEGINNER et INTERMEDIATE.';
  }

  private calculateAverageMultiplier(questions: IQuestion[]): number {
    const total = questions.reduce(
      (sum, q) => sum + (this.DIFFICULTY_MULTIPLIERS[q.difficulty] || 1.0),
      0
    );
    return total / questions.length;
  }
}
```

**Caractéristiques:**
- Multiplicateur selon difficulté (BEGINNER x1.0 → EXPERT x2.0)
- Statistiques par niveau de difficulté
- Feedback adapté à la performance

---

##### 4. ExamSimulationStrategy

**Usage:** Simulations d'examens officiels avec pénalités

```typescript
export class ExamSimulationStrategy implements IEvaluationStrategy {
  private readonly PENALTY_RATE = 0.25;  // -25% du score de la question

  async evaluate(
    exam: IExam,
    attempt: IAttempt,
    responses: IResponse[],
    questions: IQuestion[]
  ): Promise<EvaluationResult> {
    let score = 0;
    let maxScore = 0;
    let penalties = 0;

    for (const question of questions) {
      maxScore += question.points;

      const response = responses.find(
        r => r.questionId.toString() === question._id.toString()
      );

      if (response) {
        if (response.isCorrect) {
          score += question.points;
        } else {
          // Pénalité pour mauvaise réponse
          const penalty = question.points * this.PENALTY_RATE;
          score -= penalty;
          penalties += penalty;
        }
      }
      // Pas de réponse = 0 points (pas de pénalité)
    }

    // Score ne peut pas être négatif
    score = Math.max(0, score);

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed = percentage >= (exam.config.passingScore || 50);

    return {
      score: Math.round(score * 100) / 100,
      maxScore,
      percentage,
      passed,
      feedback: this.generateSimulationFeedback(penalties, passed),
      details: {
        penalties: Math.round(penalties * 100) / 100,
        unansweredQuestions: questions.length - responses.length,
        evaluationType: 'EXAM_SIMULATION'
      }
    };
  }

  private generateSimulationFeedback(penalties: number, passed: boolean): string {
    if (penalties === 0 && passed) {
      return 'Excellent ! Aucune pénalité et examen réussi !';
    }

    if (penalties > 0) {
      return `Attention : vous avez perdu ${penalties.toFixed(2)} points en pénalités. Évitez les réponses hasardeuses.`;
    }

    if (passed) {
      return 'Examen réussi ! Continuez à vous préparer pour l\'examen officiel.';
    }

    return 'Révisez bien avant le vrai examen. Les pénalités peuvent faire la différence.';
  }
}
```

**Caractéristiques:**
- Pénalité de 25% pour mauvaises réponses
- Pas de pénalité pour questions non répondues
- Score minimum de 0 (pas de score négatif)
- Feedback sur les pénalités

---

### Factory pour Stratégies

**EvaluationStrategyFactory** centralise la création des stratégies :

```typescript
export class EvaluationStrategyFactory {
  private static strategies = new Map<EvaluationType, IEvaluationStrategy>([
    [EvaluationType.QCM, new QCMEvaluationStrategy()],
    [EvaluationType.TRUE_FALSE, new TrueFalseEvaluationStrategy()],
    [EvaluationType.ADAPTIVE, new AdaptiveEvaluationStrategy()],
    [EvaluationType.EXAM_SIMULATION, new ExamSimulationStrategy()]
  ]);

  static getStrategy(type: EvaluationType): IEvaluationStrategy {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      throw new Error(`Unknown evaluation type: ${type}`);
    }

    return strategy;
  }

  // Méthode de commodité pour évaluation directe
  static async evaluateExam(
    exam: IExam,
    attempt: IAttempt,
    responses: IResponse[],
    questions: IQuestion[]
  ): Promise<EvaluationResult> {
    const strategy = this.getStrategy(exam.evaluationType);
    return strategy.evaluate(exam, attempt, responses, questions);
  }
}
```

### Utilisation

```typescript
// Dans ExamEvaluationService
import { EvaluationStrategyFactory } from '@/lib/patterns/EvaluationStrategy';

class ExamEvaluationService {
  async evaluateAttempt(attemptId: string): Promise<EvaluationResult> {
    const attempt = await Attempt.findById(attemptId).populate('examId');
    const exam = attempt.examId as IExam;
    const responses = await Response.find({ attemptId });
    const questions = await Question.find({ examId: exam._id });

    // Strategy Pattern en action !
    const result = await EvaluationStrategyFactory.evaluateExam(
      exam,
      attempt,
      responses,
      questions
    );

    return result;
  }
}
```

### Avantages

✅ **Extensibilité:** Ajouter un nouveau type d'évaluation = créer une nouvelle classe
✅ **Testabilité:** Chaque stratégie est testable indépendamment
✅ **Maintenabilité:** Logique d'évaluation isolée et claire
✅ **Open/Closed Principle:** Ouvert à l'extension, fermé à la modification

---

## 🎨 Decorator Pattern - Enrichissement

### Problème

Les résultats d'évaluation peuvent nécessiter des **enrichissements dynamiques** :
- Bonus pour temps rapide
- Pénalité pour dépassement de temps
- Attribution de badges
- Bonus pour streaks de réponses correctes
- Statistiques détaillées

**Sans Decorator Pattern :** Explosion combinatoire de classes ou méthodes géantes avec logique imbriquée.

### Solution

Envelopper dynamiquement les résultats avec des décorateurs composables.

### Structure

#### Interface de Base

**Fichier:** `/lib/patterns/ExamDecorator.ts`

```typescript
// Interface commune pour résultats décorés
export interface IExamResultDecorator {
  decorate(result: EvaluationResult, context: DecorationContext): Promise<EvaluationResult>;
}

// Contexte pour décoration
export interface DecorationContext {
  exam: IExam;
  attempt: IAttempt;
  responses: IResponse[];
  questions: IQuestion[];
  timeSpent: number;
}
```

#### Décorateurs Concrets

##### 1. TimeBonusDecorator

**Bonus pour finir rapidement**

```typescript
export class TimeBonusDecorator implements IExamResultDecorator {
  private readonly MAX_BONUS_PERCENTAGE = 7.5;  // Bonus maximum: +7.5%

  async decorate(
    result: EvaluationResult,
    context: DecorationContext
  ): Promise<EvaluationResult> {
    const { exam, attempt } = context;
    const timeSpent = attempt.timeSpent || 0;
    const duration = exam.duration;

    // Bonus si terminé en moins de 75% du temps
    const timeRatio = timeSpent / duration;

    if (timeRatio < 0.75) {
      const bonusPercentage = (0.75 - timeRatio) * 10; // Échelle linéaire
      const cappedBonus = Math.min(bonusPercentage, this.MAX_BONUS_PERCENTAGE);
      const bonusPoints = (result.maxScore * cappedBonus) / 100;

      const newScore = result.score + bonusPoints;
      const newPercentage = (newScore / result.maxScore) * 100;

      return {
        ...result,
        score: Math.round(newScore * 100) / 100,
        percentage: Math.round(newPercentage * 100) / 100,
        passed: newPercentage >= (exam.config.passingScore || 50),
        feedback: result.feedback + `\n⚡ Bonus vitesse: +${cappedBonus.toFixed(1)}% !`,
        details: {
          ...result.details,
          timeBonus: {
            applied: true,
            bonusPercentage: cappedBonus,
            bonusPoints: Math.round(bonusPoints * 100) / 100,
            timeSpentMinutes: timeSpent,
            timeSavedMinutes: duration - timeSpent
          }
        }
      };
    }

    return {
      ...result,
      details: {
        ...result.details,
        timeBonus: { applied: false }
      }
    };
  }
}
```

**Règles:**
- Bonus seulement si temps < 75% de la durée
- Bonus max: +7.5%
- Échelle linéaire

---

##### 2. StreakBonusDecorator

**Bonus pour séries de bonnes réponses consécutives**

```typescript
export class StreakBonusDecorator implements IExamResultDecorator {
  private readonly MIN_STREAK_FOR_BONUS = 3;   // Streak minimum
  private readonly BONUS_PER_STREAK = 0.5;     // +0.5 points par streak

  async decorate(
    result: EvaluationResult,
    context: DecorationContext
  ): Promise<EvaluationResult> {
    const { responses, questions } = context;

    // Calculer les streaks
    const streaks = this.calculateStreaks(responses, questions);
    const longestStreak = Math.max(...streaks, 0);

    if (longestStreak >= this.MIN_STREAK_FOR_BONUS) {
      const bonusPoints = longestStreak * this.BONUS_PER_STREAK;
      const newScore = result.score + bonusPoints;
      const newPercentage = (newScore / result.maxScore) * 100;

      return {
        ...result,
        score: Math.round(newScore * 100) / 100,
        percentage: Math.round(newPercentage * 100) / 100,
        feedback: result.feedback + `\n🔥 Streak bonus: ${longestStreak} réponses consécutives !`,
        details: {
          ...result.details,
          streakBonus: {
            applied: true,
            longestStreak,
            bonusPoints: Math.round(bonusPoints * 100) / 100,
            allStreaks: streaks
          }
        }
      };
    }

    return {
      ...result,
      details: {
        ...result.details,
        streakBonus: { applied: false, longestStreak: 0 }
      }
    };
  }

  private calculateStreaks(responses: IResponse[], questions: IQuestion[]): number[] {
    const streaks: number[] = [];
    let currentStreak = 0;

    // Trier réponses par ordre de question
    const sortedResponses = responses.sort((a, b) => {
      const qA = questions.find(q => q._id.toString() === a.questionId.toString());
      const qB = questions.find(q => q._id.toString() === b.questionId.toString());
      return (qA?.order || 0) - (qB?.order || 0);
    });

    for (const response of sortedResponses) {
      if (response.isCorrect) {
        currentStreak++;
      } else {
        if (currentStreak >= this.MIN_STREAK_FOR_BONUS) {
          streaks.push(currentStreak);
        }
        currentStreak = 0;
      }
    }

    // Push dernière streak
    if (currentStreak >= this.MIN_STREAK_FOR_BONUS) {
      streaks.push(currentStreak);
    }

    return streaks;
  }
}
```

**Règles:**
- Streak minimum: 3 réponses consécutives
- Bonus: +0.5 points par réponse dans la streak
- Tracking de toutes les streaks

---

##### 3. TimePenaltyDecorator

**Pénalité pour dépassement de temps**

```typescript
export class TimePenaltyDecorator implements IExamResultDecorator {
  private readonly MAX_PENALTY_PERCENTAGE = 20;  // Pénalité max: -20%

  async decorate(
    result: EvaluationResult,
    context: DecorationContext
  ): Promise<EvaluationResult> {
    const { exam, attempt } = context;
    const timeSpent = attempt.timeSpent || 0;
    const duration = exam.duration;

    // Pénalité si dépassement
    if (timeSpent > duration) {
      const overtimeMinutes = timeSpent - duration;
      const overtimeRatio = overtimeMinutes / duration;

      // Pénalité proportionnelle (linéaire)
      const penaltyPercentage = Math.min(
        overtimeRatio * 100,
        this.MAX_PENALTY_PERCENTAGE
      );

      const penaltyPoints = (result.maxScore * penaltyPercentage) / 100;
      const newScore = Math.max(0, result.score - penaltyPoints);
      const newPercentage = (newScore / result.maxScore) * 100;

      return {
        ...result,
        score: Math.round(newScore * 100) / 100,
        percentage: Math.round(newPercentage * 100) / 100,
        passed: newPercentage >= (exam.config.passingScore || 50),
        feedback: result.feedback + `\n⏱️ Pénalité temps: -${penaltyPercentage.toFixed(1)}% (dépassement de ${overtimeMinutes} min)`,
        details: {
          ...result.details,
          timePenalty: {
            applied: true,
            penaltyPercentage,
            penaltyPoints: Math.round(penaltyPoints * 100) / 100,
            overtimeMinutes
          }
        }
      };
    }

    return {
      ...result,
      details: {
        ...result.details,
        timePenalty: { applied: false }
      }
    };
  }
}
```

**Règles:**
- Pénalité seulement si timeSpent > duration
- Pénalité max: -20%
- Score minimum: 0

---

##### 4. BadgeDecorator

**Attribution de badges**

```typescript
export class BadgeDecorator implements IExamResultDecorator {
  private readonly badges = {
    PERFECT: { id: 'PERFECT', name: 'Perfection', emoji: '🏆', condition: (p: number) => p === 100 },
    LIGHTNING: { id: 'LIGHTNING', name: 'Éclair', emoji: '⚡', condition: (p: number, t: number, d: number) => p >= 80 && t < d * 0.5 },
    ON_FIRE: { id: 'ON_FIRE', name: 'En feu', emoji: '🔥', condition: (p: number) => p >= 90 },
    EXCELLENCE: { id: 'EXCELLENCE', name: 'Excellence', emoji: '⭐', condition: (p: number) => p >= 95 }
  };

  async decorate(
    result: EvaluationResult,
    context: DecorationContext
  ): Promise<EvaluationResult> {
    const { exam, attempt } = context;
    const timeSpent = attempt.timeSpent || 0;
    const duration = exam.duration;
    const percentage = result.percentage;

    const earnedBadges: any[] = [];

    // Vérifier chaque badge
    for (const [key, badge] of Object.entries(this.badges)) {
      if (badge.condition(percentage, timeSpent, duration)) {
        earnedBadges.push({
          badgeId: badge.id,
          name: badge.name,
          emoji: badge.emoji,
          earnedAt: new Date()
        });
      }
    }

    if (earnedBadges.length > 0) {
      const badgeText = earnedBadges.map(b => `${b.emoji} ${b.name}`).join(', ');

      return {
        ...result,
        feedback: result.feedback + `\n\n🎖️ Badges obtenus: ${badgeText}`,
        details: {
          ...result.details,
          badges: {
            earned: earnedBadges,
            count: earnedBadges.length
          }
        }
      };
    }

    return {
      ...result,
      details: {
        ...result.details,
        badges: { earned: [], count: 0 }
      }
    };
  }
}
```

**Badges disponibles:**
- 🏆 **Perfection:** 100% de bonnes réponses
- ⚡ **Éclair:** ≥80% en moins de 50% du temps
- 🔥 **En feu:** ≥90% de bonnes réponses
- ⭐ **Excellence:** ≥95% de bonnes réponses

---

##### 5. DetailedStatsDecorator

**Statistiques détaillées**

```typescript
export class DetailedStatsDecorator implements IExamResultDecorator {
  async decorate(
    result: EvaluationResult,
    context: DecorationContext
  ): Promise<EvaluationResult> {
    const { responses, questions, attempt } = context;

    // Performance par difficulté
    const performanceByDifficulty = this.calculatePerformanceByDifficulty(
      responses,
      questions
    );

    // Vitesse moyenne par question
    const averageTimePerQuestion = this.calculateAverageTimePerQuestion(
      responses,
      questions,
      attempt.timeSpent || 0
    );

    // Questions les plus difficiles (pour ce student)
    const hardestQuestions = this.findHardestQuestions(responses, questions);

    return {
      ...result,
      details: {
        ...result.details,
        detailedStats: {
          performanceByDifficulty,
          averageTimePerQuestion,
          hardestQuestions,
          quickestQuestion: this.findQuickestQuestion(responses),
          slowestQuestion: this.findSlowestQuestion(responses)
        }
      }
    };
  }

  private calculatePerformanceByDifficulty(
    responses: IResponse[],
    questions: IQuestion[]
  ): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const difficulty of Object.values(DifficultyLevel)) {
      const questionsAtDifficulty = questions.filter(q => q.difficulty === difficulty);
      const responsesAtDifficulty = responses.filter(r =>
        questionsAtDifficulty.some(q => q._id.toString() === r.questionId.toString())
      );

      const correct = responsesAtDifficulty.filter(r => r.isCorrect).length;
      const total = questionsAtDifficulty.length;

      stats[difficulty] = {
        correct,
        total,
        percentage: total > 0 ? (correct / total) * 100 : 0
      };
    }

    return stats;
  }

  private calculateAverageTimePerQuestion(
    responses: IResponse[],
    questions: IQuestion[],
    totalTime: number
  ): number {
    return questions.length > 0 ? totalTime / questions.length : 0;
  }

  private findHardestQuestions(
    responses: IResponse[],
    questions: IQuestion[]
  ): any[] {
    return responses
      .filter(r => !r.isCorrect)
      .map(r => {
        const question = questions.find(q => q._id.toString() === r.questionId.toString());
        return {
          questionId: r.questionId,
          difficulty: question?.difficulty,
          timeSpent: r.timeSpent
        };
      })
      .sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0))
      .slice(0, 3);
  }

  private findQuickestQuestion(responses: IResponse[]): any {
    return responses.reduce((quickest, current) =>
      (current.timeSpent || Infinity) < (quickest.timeSpent || Infinity) ? current : quickest
    , responses[0]);
  }

  private findSlowestQuestion(responses: IResponse[]): any {
    return responses.reduce((slowest, current) =>
      (current.timeSpent || 0) > (slowest.timeSpent || 0) ? current : slowest
    , responses[0]);
  }
}
```

---

### Factory pour Décorateurs

```typescript
export class ExamDecoratorFactory {
  private static decorators: IExamResultDecorator[] = [
    new TimeBonusDecorator(),
    new StreakBonusDecorator(),
    new TimePenaltyDecorator(),
    new BadgeDecorator(),
    new DetailedStatsDecorator()
  ];

  // Appliquer tous les décorateurs
  static async applyDecorators(
    result: EvaluationResult,
    context: DecorationContext
  ): Promise<EvaluationResult> {
    let decoratedResult = result;

    for (const decorator of this.decorators) {
      decoratedResult = await decorator.decorate(decoratedResult, context);
    }

    return decoratedResult;
  }

  // Appliquer décorateurs sélectifs
  static async applySelectiveDecorators(
    result: EvaluationResult,
    context: DecorationContext,
    options: {
      timeBonus?: boolean;
      streakBonus?: boolean;
      timePenalty?: boolean;
      badges?: boolean;
      detailedStats?: boolean;
    }
  ): Promise<EvaluationResult> {
    let decoratedResult = result;

    if (options.timeBonus) {
      decoratedResult = await new TimeBonusDecorator().decorate(decoratedResult, context);
    }

    if (options.streakBonus) {
      decoratedResult = await new StreakBonusDecorator().decorate(decoratedResult, context);
    }

    if (options.timePenalty) {
      decoratedResult = await new TimePenaltyDecorator().decorate(decoratedResult, context);
    }

    if (options.badges) {
      decoratedResult = await new BadgeDecorator().decorate(decoratedResult, context);
    }

    if (options.detailedStats) {
      decoratedResult = await new DetailedStatsDecorator().decorate(decoratedResult, context);
    }

    return decoratedResult;
  }
}
```

### Utilisation

```typescript
// Dans ExamEvaluationService
import { ExamDecoratorFactory } from '@/lib/patterns/ExamDecorator';

class ExamEvaluationService {
  async evaluateAttempt(attemptId: string, options?: any): Promise<EvaluationResult> {
    // 1. Évaluation de base (Strategy Pattern)
    let result = await EvaluationStrategyFactory.evaluateExam(/*...*/);

    // 2. Enrichissement (Decorator Pattern)
    const context: DecorationContext = {
      exam,
      attempt,
      responses,
      questions,
      timeSpent: attempt.timeSpent || 0
    };

    result = await ExamDecoratorFactory.applyDecorators(result, context);

    return result;
  }
}
```

### Avantages

✅ **Composition flexible:** Appliquer n'importe quelle combinaison de décorateurs
✅ **Ordre contrôlable:** Définir l'ordre d'application (bonus avant pénalités)
✅ **Extensibilité:** Ajouter de nouveaux décorateurs sans toucher au code existant
✅ **Testabilité:** Chaque décorateur testable indépendamment

---

## 🔗 Chain of Responsibility - Permissions

### Problème

Le système de permissions est **hiérarchique et complexe** :
- DG/Recteur : Accès GLOBAL (tous les examens)
- Principal : Accès LOCAL (établissement spécifique)
- Inspecteur : Accès SUBJECT (matières spécifiques)
- Enseignant : Accès LEVEL + FIELD (niveaux et filières spécifiques)

**Sans Chain of Responsibility :** Logique de permissions imbriquée, difficile à maintenir et étendre.

### Solution

Chaîne de handlers où chaque handler vérifie un niveau de permission et passe au suivant si nécessaire.

### Structure

#### Classe Abstraite de Base

**Fichier:** `/lib/patterns/AccessHandler.ts`

```typescript
// Requête d'accès
export interface AccessRequest {
  user: IUser;
  pedagogicalProfile?: IPedagogicalProfile;
  resource: IExam;
  action: AccessAction;
}

export enum AccessAction {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  VALIDATE = 'VALIDATE',
  PUBLISH = 'PUBLISH'
}

// Handler abstrait
export abstract class AccessHandler {
  protected next: AccessHandler | null = null;

  setNext(handler: AccessHandler): AccessHandler {
    this.next = handler;
    return handler;
  }

  abstract handle(request: AccessRequest): Promise<boolean>;

  protected async passToNext(request: AccessRequest): Promise<boolean> {
    if (this.next) {
      return this.next.handle(request);
    }
    return false;
  }
}
```

#### Handlers Concrets

##### 1. GlobalAccessHandler

**Accès complet pour DG/Recteur**

```typescript
export class GlobalAccessHandler extends AccessHandler {
  private readonly GLOBAL_ROLES = [
    UserRole.DG_ISIMMA,
    UserRole.RECTOR,
    UserRole.DG_M4M
  ];

  async handle(request: AccessRequest): Promise<boolean> {
    const { user, pedagogicalProfile } = request;

    // Vérifier rôle global
    if (this.GLOBAL_ROLES.includes(user.role)) {
      return true;
    }

    // Vérifier scope global dans profil
    if (pedagogicalProfile?.accessScope === AccessScope.GLOBAL) {
      return true;
    }

    // Passer au handler suivant
    return this.passToNext(request);
  }
}
```

---

##### 2. LocalAccessHandler

**Accès établissement spécifique**

```typescript
export class LocalAccessHandler extends AccessHandler {
  private readonly LOCAL_ROLES = [
    UserRole.PRINCIPAL,
    UserRole.PREFET
  ];

  async handle(request: AccessRequest): Promise<boolean> {
    const { user, pedagogicalProfile, resource } = request;

    // Vérifier rôle local
    if (!this.LOCAL_ROLES.includes(user.role)) {
      return this.passToNext(request);
    }

    // Vérifier scope local
    if (pedagogicalProfile?.accessScope !== AccessScope.LOCAL) {
      return this.passToNext(request);
    }

    // Vérifier établissement
    const examCreator = await User.findById(resource.createdBy);
    if (examCreator && examCreator.institution === user.institution) {
      return true;
    }

    // Vérifier via scopeDetails
    if (pedagogicalProfile.scopeDetails?.specificInstitution === user.institution) {
      return true;
    }

    return this.passToNext(request);
  }
}
```

---

##### 3. SubjectAccessHandler

**Accès matières spécifiques**

```typescript
export class SubjectAccessHandler extends AccessHandler {
  async handle(request: AccessRequest): Promise<boolean> {
    const { pedagogicalProfile, resource } = request;

    if (!pedagogicalProfile) {
      return this.passToNext(request);
    }

    // Vérifier scope matière
    if (pedagogicalProfile.accessScope !== AccessScope.SUBJECT) {
      return this.passToNext(request);
    }

    // Vérifier si la matière de l'examen est dans les matières enseignées
    const subjectId = resource.subject.toString();
    const hasSubjectAccess = pedagogicalProfile.teachingSubjects.some(
      (s: any) => s.toString() === subjectId
    );

    if (hasSubjectAccess) {
      return true;
    }

    // Vérifier via scopeDetails
    if (pedagogicalProfile.scopeDetails?.specificSubjects) {
      const hasDetailAccess = pedagogicalProfile.scopeDetails.specificSubjects.some(
        (s: any) => s.toString() === subjectId
      );

      if (hasDetailAccess) {
        return true;
      }
    }

    return this.passToNext(request);
  }
}
```

---

##### 4. LevelAccessHandler

**Accès niveaux spécifiques**

```typescript
export class LevelAccessHandler extends AccessHandler {
  async handle(request: AccessRequest): Promise<boolean> {
    const { pedagogicalProfile, resource } = request;

    if (!pedagogicalProfile) {
      return this.passToNext(request);
    }

    // Vérifier scope niveau
    if (pedagogicalProfile.accessScope !== AccessScope.LEVEL) {
      return this.passToNext(request);
    }

    // Vérifier si un des niveaux ciblés est dans les niveaux d'intervention
    const targetLevels = resource.targetLevels.map((l: any) => l.toString());
    const interventionLevels = pedagogicalProfile.interventionLevels.map((l: any) => l.toString());

    const hasLevelAccess = targetLevels.some(tl => interventionLevels.includes(tl));

    if (hasLevelAccess) {
      return true;
    }

    // Vérifier via scopeDetails
    if (pedagogicalProfile.scopeDetails?.specificLevels) {
      const detailLevels = pedagogicalProfile.scopeDetails.specificLevels.map((l: any) => l.toString());
      const hasDetailAccess = targetLevels.some(tl => detailLevels.includes(tl));

      if (hasDetailAccess) {
        return true;
      }
    }

    return this.passToNext(request);
  }
}
```

---

##### 5. FieldAccessHandler

**Accès filières spécifiques**

```typescript
export class FieldAccessHandler extends AccessHandler {
  async handle(request: AccessRequest): Promise<boolean> {
    const { pedagogicalProfile, resource } = request;

    if (!pedagogicalProfile) {
      return false; // Fin de chaîne
    }

    // Vérifier scope filière
    if (pedagogicalProfile.accessScope !== AccessScope.FIELD) {
      return false;
    }

    // Vérifier si une des filières ciblées est dans les filières d'intervention
    const targetFields = resource.targetFields.map((f: any) => f.toString());
    const interventionFields = pedagogicalProfile.interventionFields.map((f: any) => f.toString());

    const hasFieldAccess = targetFields.some(tf => interventionFields.includes(tf));

    if (hasFieldAccess) {
      return true;
    }

    // Vérifier via scopeDetails
    if (pedagogicalProfile.scopeDetails?.specificFields) {
      const detailFields = pedagogicalProfile.scopeDetails.specificFields.map((f: any) => f.toString());
      const hasDetailAccess = targetFields.some(tf => detailFields.includes(tf));

      if (hasDetailAccess) {
        return true;
      }
    }

    return false; // Fin de chaîne
  }
}
```

---

### Builder de Chaîne

```typescript
export class AccessHandlerChain {
  static getChain(): AccessHandler {
    const globalHandler = new GlobalAccessHandler();
    const localHandler = new LocalAccessHandler();
    const subjectHandler = new SubjectAccessHandler();
    const levelHandler = new LevelAccessHandler();
    const fieldHandler = new FieldAccessHandler();

    // Construire la chaîne
    globalHandler
      .setNext(localHandler)
      .setNext(subjectHandler)
      .setNext(levelHandler)
      .setNext(fieldHandler);

    return globalHandler;
  }

  static async checkAccess(request: AccessRequest): Promise<boolean> {
    const chain = this.getChain();
    return chain.handle(request);
  }
}
```

### Utilisation

```typescript
// Dans ExamAccessService
import { AccessHandlerChain, AccessRequest, AccessAction } from '@/lib/patterns/AccessHandler';

class ExamAccessService {
  async canEditExam(userId: string, examId: string): Promise<boolean> {
    const user = await User.findById(userId);
    const pedagogicalProfile = await PedagogicalProfile.findOne({ user: userId });
    const exam = await Exam.findById(examId);

    if (!user || !exam) {
      return false;
    }

    const request: AccessRequest = {
      user,
      pedagogicalProfile,
      resource: exam,
      action: AccessAction.EDIT
    };

    // Chain of Responsibility en action !
    return AccessHandlerChain.checkAccess(request);
  }
}
```

### Avantages

✅ **Séparation des responsabilités:** Chaque handler gère un niveau de permission
✅ **Extensibilité:** Ajouter un nouveau niveau = ajouter un handler
✅ **Ordre flexible:** Réorganiser la chaîne facilement
✅ **Debugging facile:** Tracer quel handler a accordé/refusé l'accès

---

## 🔔 Observer Pattern - Événements

### Problème

Après certaines actions (tentative soumise, examen créé, etc.), plusieurs **side-effects doivent se produire** :
- Envoyer un email de notification
- Mettre à jour les statistiques
- Attribuer des XP et badges
- Logger l'activité

**Sans Observer Pattern :** Couplage fort entre l'action et les side-effects, rendant le code rigide.

### Solution

Système d'événements découplé où les producteurs émettent des événements et les consommateurs (observers) y réagissent.

### Structure

#### Publisher (Singleton)

**Fichier:** `/lib/events/EventPublisher.ts`

```typescript
// Type d'événement
export enum EventType {
  // Attempts
  ATTEMPT_STARTED = 'ATTEMPT_STARTED',
  ATTEMPT_SUBMITTED = 'ATTEMPT_SUBMITTED',
  ANSWER_RECORDED = 'ANSWER_RECORDED',

  // Exams
  EXAM_CREATED = 'EXAM_CREATED',
  EXAM_PUBLISHED = 'EXAM_PUBLISHED',
  EXAM_VALIDATED = 'EXAM_VALIDATED',

  // Users
  USER_REGISTERED = 'USER_REGISTERED',
  USER_ONBOARDED = 'USER_ONBOARDED'
}

// Structure d'événement
export interface AppEvent {
  type: EventType;
  data: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Interface Observer
export interface IObserver {
  update(event: AppEvent): Promise<void>;
}

// Publisher Singleton
export class EventPublisher {
  private static instance: EventPublisher;
  private observers: Map<EventType, IObserver[]> = new Map();

  private constructor() {}

  static getInstance(): EventPublisher {
    if (!EventPublisher.instance) {
      EventPublisher.instance = new EventPublisher();
    }
    return EventPublisher.instance;
  }

  subscribe(eventType: EventType, observer: IObserver): void {
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, []);
    }

    this.observers.get(eventType)!.push(observer);
  }

  unsubscribe(eventType: EventType, observer: IObserver): void {
    const observers = this.observers.get(eventType);
    if (observers) {
      const index = observers.indexOf(observer);
      if (index > -1) {
        observers.splice(index, 1);
      }
    }
  }

  async publish(event: AppEvent): Promise<void> {
    const observers = this.observers.get(event.type);

    if (observers && observers.length > 0) {
      // Exécuter tous les observers en parallèle
      await Promise.all(
        observers.map(observer => observer.update(event).catch(error => {
          console.error(`Observer error for event ${event.type}:`, error);
        }))
      );
    }
  }
}

// Helper function
export async function publishEvent(type: EventType, data: any, metadata?: Record<string, any>) {
  const event: AppEvent = {
    type,
    data,
    timestamp: new Date(),
    metadata
  };

  await EventPublisher.getInstance().publish(event);
}
```

#### Observers Concrets

##### 1. EmailNotificationObserver

**Fichier:** `/lib/events/observers/EmailNotificationObserver.ts`

```typescript
import { IObserver, AppEvent, EventType } from '../EventPublisher';
import { sendEmail } from '@/lib/email';

export class EmailNotificationObserver implements IObserver {
  async update(event: AppEvent): Promise<void> {
    switch (event.type) {
      case EventType.ATTEMPT_SUBMITTED:
        await this.handleAttemptSubmitted(event.data);
        break;

      case EventType.EXAM_PUBLISHED:
        await this.handleExamPublished(event.data);
        break;

      case EventType.USER_REGISTERED:
        await this.handleUserRegistered(event.data);
        break;

      // Autres événements...
    }
  }

  private async handleAttemptSubmitted(data: any): Promise<void> {
    const { userId, examId, score, percentage } = data;

    const user = await User.findById(userId);
    const exam = await Exam.findById(examId);

    if (user && exam) {
      await sendEmail({
        to: user.email,
        subject: `Résultats: ${exam.title}`,
        template: 'attempt-results',
        data: {
          userName: user.name,
          examTitle: exam.title,
          score,
          percentage,
          passed: percentage >= (exam.config.passingScore || 50)
        }
      });
    }
  }

  private async handleExamPublished(data: any): Promise<void> {
    const { examId, createdBy } = data;

    const exam = await Exam.findById(examId);
    const creator = await User.findById(createdBy);

    if (exam && creator) {
      // Notifier les étudiants concernés
      const targetLevels = exam.targetLevels;
      const students = await User.find({
        role: UserRole.STUDENT,
        // ... filtrage par niveau
      });

      for (const student of students) {
        await sendEmail({
          to: student.email,
          subject: `Nouvel examen disponible: ${exam.title}`,
          template: 'new-exam',
          data: {
            studentName: student.name,
            examTitle: exam.title,
            teacherName: creator.name,
            startTime: exam.startTime
          }
        });
      }
    }
  }

  private async handleUserRegistered(data: any): Promise<void> {
    const { userId } = data;
    const user = await User.findById(userId);

    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Bienvenue sur Xkorin School !',
        template: 'welcome',
        data: {
          userName: user.name
        }
      });
    }
  }
}
```

---

##### 2. XPUpdateObserver

**Fichier:** `/lib/events/observers/XPUpdateObserver.ts`

```typescript
import { IObserver, AppEvent, EventType } from '../EventPublisher';
import { LearnerProfile } from '@/models/LearnerProfile';

export class XPUpdateObserver implements IObserver {
  private readonly XP_RULES = {
    ATTEMPT_COMPLETED: 10,                // Base XP
    PERFECT_SCORE: 50,                    // 100% correct
    FIRST_EXAM_OF_DAY: 5,                 // Bonus quotidien
    STREAK_MULTIPLIER: 1.2                // x1.2 si streak actif
  };

  async update(event: AppEvent): Promise<void> {
    if (event.type === EventType.ATTEMPT_SUBMITTED) {
      await this.handleAttemptSubmitted(event.data);
    }
  }

  private async handleAttemptSubmitted(data: any): Promise<void> {
    const { userId, score, maxScore, percentage } = data;

    const profile = await LearnerProfile.findOne({ user: userId });
    if (!profile) return;

    // Calculer XP
    let xpEarned = this.XP_RULES.ATTEMPT_COMPLETED;

    // Bonus score parfait
    if (percentage === 100) {
      xpEarned += this.XP_RULES.PERFECT_SCORE;
    }

    // Bonus premier examen du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!profile.stats.lastActivityDate || profile.stats.lastActivityDate < today) {
      xpEarned += this.XP_RULES.FIRST_EXAM_OF_DAY;
    }

    // Multiplier par streak
    if (profile.gamification.streak > 0) {
      xpEarned *= this.XP_RULES.STREAK_MULTIPLIER;
    }

    // Mettre à jour profil
    profile.gamification.xp += Math.round(xpEarned);
    profile.gamification.level = Math.floor(profile.gamification.xp / 100) + 1;

    // Mettre à jour streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (profile.stats.lastActivityDate && profile.stats.lastActivityDate >= yesterday) {
      profile.gamification.streak++;
    } else {
      profile.gamification.streak = 1;
    }

    profile.stats.lastActivityDate = new Date();

    await profile.save();

    console.log(`XP Update: User ${userId} earned ${xpEarned} XP (Total: ${profile.gamification.xp})`);
  }
}
```

---

##### 3. StatsUpdateObserver

**Fichier:** `/lib/events/observers/StatsUpdateObserver.ts`

```typescript
import { IObserver, AppEvent, EventType } from '../EventPublisher';
import { LearnerProfile, PedagogicalProfile } from '@/models';

export class StatsUpdateObserver implements IObserver {
  async update(event: AppEvent): Promise<void> {
    switch (event.type) {
      case EventType.ATTEMPT_SUBMITTED:
        await this.handleAttemptSubmitted(event.data);
        break;

      case EventType.EXAM_CREATED:
        await this.handleExamCreated(event.data);
        break;

      case EventType.EXAM_VALIDATED:
        await this.handleExamValidated(event.data);
        break;
    }
  }

  private async handleAttemptSubmitted(data: any): Promise<void> {
    const { userId, examId, score, percentage, timeSpent } = data;

    // Mettre à jour profil apprenant
    const learnerProfile = await LearnerProfile.findOne({ user: userId });
    if (learnerProfile) {
      learnerProfile.stats.totalExamsTaken++;
      learnerProfile.stats.totalStudyTime += timeSpent;

      // Moyenne mobile
      const currentAvg = learnerProfile.stats.averageScore;
      const totalExams = learnerProfile.stats.totalExamsTaken;
      learnerProfile.stats.averageScore =
        (currentAvg * (totalExams - 1) + percentage) / totalExams;

      // Identifier matières fortes/faibles
      await this.updateSubjectPerformance(learnerProfile, examId, percentage);

      await learnerProfile.save();
    }

    // Mettre à jour stats enseignant
    const exam = await Exam.findById(examId);
    if (exam) {
      const pedagogicalProfile = await PedagogicalProfile.findOne({ user: exam.createdBy });
      if (pedagogicalProfile) {
        pedagogicalProfile.stats.totalStudentsSupervised = await this.countUniqueStudents(exam.createdBy);

        // Recalculer moyenne scores étudiants
        pedagogicalProfile.stats.averageStudentScore = await this.calculateAverageStudentScore(exam.createdBy);

        await pedagogicalProfile.save();
      }
    }
  }

  private async handleExamCreated(data: any): Promise<void> {
    const { createdBy } = data;

    const profile = await PedagogicalProfile.findOne({ user: createdBy });
    if (profile) {
      profile.stats.totalExamsCreated++;
      profile.stats.lastActivityDate = new Date();
      await profile.save();
    }
  }

  private async handleExamValidated(data: any): Promise<void> {
    const { validatedBy } = data;

    const profile = await PedagogicalProfile.findOne({ user: validatedBy });
    if (profile) {
      profile.stats.totalExamsValidated++;
      profile.stats.lastActivityDate = new Date();
      await profile.save();
    }
  }

  private async updateSubjectPerformance(
    profile: any,
    examId: string,
    percentage: number
  ): Promise<void> {
    const exam = await Exam.findById(examId).select('subject');
    if (!exam) return;

    const subjectId = exam.subject.toString();

    // Si performance > 80%, ajouter aux matières fortes
    if (percentage >= 80) {
      if (!profile.stats.strongSubjects.includes(subjectId)) {
        profile.stats.strongSubjects.push(subjectId);
      }

      // Retirer des matières faibles si présent
      profile.stats.weakSubjects = profile.stats.weakSubjects.filter(
        (s: any) => s.toString() !== subjectId
      );
    }

    // Si performance < 50%, ajouter aux matières faibles
    if (percentage < 50) {
      if (!profile.stats.weakSubjects.includes(subjectId)) {
        profile.stats.weakSubjects.push(subjectId);
      }

      // Retirer des matières fortes si présent
      profile.stats.strongSubjects = profile.stats.strongSubjects.filter(
        (s: any) => s.toString() !== subjectId
      );
    }
  }

  private async countUniqueStudents(teacherId: string): Promise<number> {
    const exams = await Exam.find({ createdBy: teacherId }).select('_id');
    const examIds = exams.map(e => e._id);

    const uniqueStudents = await Attempt.distinct('userId', { examId: { $in: examIds } });
    return uniqueStudents.length;
  }

  private async calculateAverageStudentScore(teacherId: string): Promise<number> {
    const exams = await Exam.find({ createdBy: teacherId }).select('_id');
    const examIds = exams.map(e => e._id);

    const attempts = await Attempt.find({
      examId: { $in: examIds },
      status: AttemptStatus.COMPLETED
    }).select('percentage');

    if (attempts.length === 0) return 0;

    const total = attempts.reduce((sum, att) => sum + (att.percentage || 0), 0);
    return total / attempts.length;
  }
}
```

---

##### 4. BadgeAwardObserver

**Fichier:** `/lib/events/observers/BadgeAwardObserver.ts`

```typescript
import { IObserver, AppEvent, EventType } from '../EventPublisher';
import { LearnerProfile } from '@/models/LearnerProfile';

export class BadgeAwardObserver implements IObserver {
  async update(event: AppEvent): Promise<void> {
    if (event.type === EventType.ATTEMPT_SUBMITTED) {
      await this.checkBadges(event.data);
    }
  }

  private async checkBadges(data: any): Promise<void> {
    const { userId, percentage, result } = data;

    const profile = await LearnerProfile.findOne({ user: userId });
    if (!profile) return;

    const newBadges: any[] = [];

    // Badge "First Blood" - Premier examen terminé
    if (profile.stats.totalExamsTaken === 1) {
      newBadges.push({
        badgeId: 'FIRST_BLOOD',
        earnedAt: new Date()
      });
    }

    // Badge "Perfectionist" - 5 scores parfaits
    const perfectCount = await Attempt.countDocuments({
      userId,
      status: AttemptStatus.COMPLETED,
      percentage: 100
    });

    if (perfectCount === 5 && !profile.gamification.badges.some(b => b.badgeId === 'PERFECTIONIST')) {
      newBadges.push({
        badgeId: 'PERFECTIONIST',
        earnedAt: new Date()
      });
    }

    // Badge "Marathon" - 50 examens terminés
    if (profile.stats.totalExamsTaken === 50 && !profile.gamification.badges.some(b => b.badgeId === 'MARATHON')) {
      newBadges.push({
        badgeId: 'MARATHON',
        earnedAt: new Date()
      });
    }

    // Badge "Fire Streak" - 7 jours consécutifs
    if (profile.gamification.streak === 7 && !profile.gamification.badges.some(b => b.badgeId === 'FIRE_STREAK')) {
      newBadges.push({
        badgeId: 'FIRE_STREAK',
        earnedAt: new Date()
      });
    }

    // Ajouter badges au profil
    if (newBadges.length > 0) {
      profile.gamification.badges.push(...newBadges);
      await profile.save();

      console.log(`Badge Award: User ${userId} earned ${newBadges.length} new badge(s)`);
    }
  }
}
```

---

### Initialisation du Publisher

**Fichier:** `/lib/events/index.ts`

```typescript
import { EventPublisher, EventType } from './EventPublisher';
import { EmailNotificationObserver } from './observers/EmailNotificationObserver';
import { XPUpdateObserver } from './observers/XPUpdateObserver';
import { StatsUpdateObserver } from './observers/StatsUpdateObserver';
import { BadgeAwardObserver } from './observers/BadgeAwardObserver';

// Initialiser tous les observers
export function initializeEventSystem() {
  const publisher = EventPublisher.getInstance();

  // Email notifications
  const emailObserver = new EmailNotificationObserver();
  publisher.subscribe(EventType.ATTEMPT_SUBMITTED, emailObserver);
  publisher.subscribe(EventType.EXAM_PUBLISHED, emailObserver);
  publisher.subscribe(EventType.USER_REGISTERED, emailObserver);

  // XP updates
  const xpObserver = new XPUpdateObserver();
  publisher.subscribe(EventType.ATTEMPT_SUBMITTED, xpObserver);

  // Stats updates
  const statsObserver = new StatsUpdateObserver();
  publisher.subscribe(EventType.ATTEMPT_SUBMITTED, statsObserver);
  publisher.subscribe(EventType.EXAM_CREATED, statsObserver);
  publisher.subscribe(EventType.EXAM_VALIDATED, statsObserver);

  // Badge awards
  const badgeObserver = new BadgeAwardObserver();
  publisher.subscribe(EventType.ATTEMPT_SUBMITTED, badgeObserver);

  console.log('Event system initialized with all observers');
}
```

### Utilisation

```typescript
// Dans une API route ou service
import { publishEvent, EventType } from '@/lib/events/EventPublisher';

// Après soumission d'une tentative
await publishEvent(EventType.ATTEMPT_SUBMITTED, {
  userId: attempt.userId,
  examId: attempt.examId,
  attemptId: attempt._id,
  score: result.score,
  percentage: result.percentage,
  timeSpent: attempt.timeSpent
});

// Les 4 observers seront notifiés automatiquement :
// - Email envoyé
// - XP mis à jour
// - Stats mises à jour
// - Badges vérifiés
```

### Avantages

✅ **Découplage:** Les services ne connaissent pas les observers
✅ **Extensibilité:** Ajouter un observer = s'abonner à un événement
✅ **Parallélisme:** Tous les observers s'exécutent en parallèle
✅ **Testabilité:** Chaque observer testable indépendamment

---

## 🏭 Factory Pattern - Création

### Problème

Créer des utilisateurs nécessite également de créer leur **profil associé** (LearnerProfile ou PedagogicalProfile). La logique de création doit être atomique et centralisée.

### Solution

Factory Pattern pour centraliser la création d'utilisateurs avec leurs profils.

### Structure

**Fichier:** `/lib/factories/ProfileFactory.ts`

```typescript
import mongoose from 'mongoose';
import { User, LearnerProfile, PedagogicalProfile } from '@/models';
import { UserRole } from '@/models/User';

export interface CreateProfileData {
  // User data
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  subSystem: string;
  institution?: string;

  // Profile-specific data
  profileData?: any;
}

export class ProfileFactory {
  /**
   * Créer un utilisateur avec son profil associé
   * Transaction Mongoose pour garantir l'atomicité
   */
  static async createUserWithProfile(data: CreateProfileData): Promise<any> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Créer l'utilisateur
      const user = new User({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        subSystem: data.subSystem,
        institution: data.institution
      });

      await user.save({ session });

      // 2. Créer le profil approprié
      let profile;

      if (data.role === UserRole.STUDENT) {
        profile = await this.createLearnerProfile(user._id, data.profileData, session);
      } else {
        profile = await this.createPedagogicalProfile(user._id, data.profileData, session);
      }

      // 3. Commit transaction
      await session.commitTransaction();
      session.endSession();

      return { user, profile };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Créer un LearnerProfile
   */
  private static async createLearnerProfile(
    userId: any,
    data: any = {},
    session: any
  ): Promise<any> {
    const profile = new LearnerProfile({
      user: userId,
      currentLevel: data.currentLevel,
      currentField: data.currentField,
      cognitiveProfile: data.cognitiveProfile || 'VISUAL',
      learnerType: data.learnerType || 'EXAM_PREP',
      subscriptionStatus: data.subscriptionStatus || 'FREEMIUM',
      preferredLearningMode: data.preferredLearningMode || 'AUTO_EVAL',
      stats: {
        totalExamsTaken: 0,
        averageScore: 0,
        totalStudyTime: 0,
        strongSubjects: [],
        weakSubjects: []
      },
      gamification: {
        level: 1,
        xp: 0,
        badges: [],
        streak: 0
      }
    });

    await profile.save({ session });
    return profile;
  }

  /**
   * Créer un PedagogicalProfile
   */
  private static async createPedagogicalProfile(
    userId: any,
    data: any = {},
    session: any
  ): Promise<any> {
    const profile = new PedagogicalProfile({
      user: userId,
      teachingSubjects: data.teachingSubjects || [],
      interventionLevels: data.interventionLevels || [],
      interventionFields: data.interventionFields || [],
      contributionTypes: data.contributionTypes || ['CREATOR'],
      accessScope: data.accessScope || 'SUBJECT',
      reportingAccess: data.reportingAccess || 'CLASS',
      stats: {
        totalExamsCreated: 0,
        totalExamsValidated: 0,
        totalStudentsSupervised: 0,
        averageStudentScore: 0
      }
    });

    await profile.save({ session });
    return profile;
  }
}
```

### Utilisation

```typescript
// Dans une API route d'enregistrement
import { ProfileFactory } from '@/lib/factories/ProfileFactory';

export async function POST(req: Request) {
  const { name, email, password, role, currentLevel } = await req.json();

  const { user, profile } = await ProfileFactory.createUserWithProfile({
    name,
    email,
    password,
    role,
    subSystem: 'FRANCOPHONE',
    profileData: {
      currentLevel,
      subscriptionStatus: 'FREEMIUM'
    }
  });

  return NextResponse.json({ userId: user._id, profileId: profile._id });
}
```

### Avantages

✅ **Atomicité:** Transaction Mongoose garantit cohérence
✅ **Centralisation:** Logique de création en un seul endroit
✅ **Extensibilité:** Ajouter un nouveau type de profil = ajouter une méthode
✅ **Testabilité:** Facile à mocker pour tests

---

## 🎯 Singleton Pattern - Instances Uniques

### Implémentations

#### 1. EventPublisher

**Problème:** Tous les services doivent partager le même publisher d'événements.

**Solution:**

```typescript
export class EventPublisher {
  private static instance: EventPublisher;

  private constructor() {}  // Constructeur privé

  static getInstance(): EventPublisher {
    if (!EventPublisher.instance) {
      EventPublisher.instance = new EventPublisher();
    }
    return EventPublisher.instance;
  }
}
```

---

#### 2. AuthStrategyManager

**Fichier:** `/lib/auth/strategies/AuthStrategyManager.ts`

**Problème:** Gérer toutes les stratégies d'authentification (Credentials, Google, GitHub) depuis une instance unique.

**Solution:**

```typescript
export class AuthStrategyManager {
  private static instance: AuthStrategyManager;
  private strategies: Map<string, any> = new Map();

  private constructor() {
    this.registerStrategies();
  }

  static getInstance(): AuthStrategyManager {
    if (!AuthStrategyManager.instance) {
      AuthStrategyManager.instance = new AuthStrategyManager();
    }
    return AuthStrategyManager.instance;
  }

  private registerStrategies() {
    this.strategies.set('credentials', new CredentialsStrategy());
    this.strategies.set('google', new GoogleStrategy());
    this.strategies.set('github', new GitHubStrategy());
  }

  getStrategy(name: string): any {
    return this.strategies.get(name);
  }

  getEnabledProviders(): string[] {
    return Array.from(this.strategies.keys());
  }
}
```

### Avantages

✅ **Cohérence globale:** Une seule instance partagée par toute l'application
✅ **Contrôle d'instanciation:** Constructeur privé empêche instanciation externe
✅ **Lazy initialization:** Instance créée seulement quand nécessaire

---

## 📊 Diagrammes d'Architecture

### Workflow Complet avec Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT SUBMITS EXAM                          │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│           1. STRATEGY PATTERN (Évaluation)                       │
│                                                                  │
│   EvaluationStrategyFactory.evaluateExam()                      │
│     → QCMStrategy / AdaptiveStrategy / etc.                     │
│     → Returns EvaluationResult (score, percentage, passed)      │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│           2. DECORATOR PATTERN (Enrichissement)                  │
│                                                                  │
│   ExamDecoratorFactory.applyDecorators()                        │
│     → TimeBonusDecorator (bonus vitesse)                        │
│     → StreakBonusDecorator (bonus streak)                       │
│     → TimePenaltyDecorator (pénalité temps)                     │
│     → BadgeDecorator (attribution badges)                       │
│     → DetailedStatsDecorator (stats détaillées)                 │
│   → Returns Enriched EvaluationResult                           │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│           3. OBSERVER PATTERN (Notifications)                    │
│                                                                  │
│   EventPublisher.publish(ATTEMPT_SUBMITTED)                     │
│     → EmailNotificationObserver (envoyer email)                 │
│     → XPUpdateObserver (maj XP et niveau)                       │
│     → StatsUpdateObserver (maj stats profils)                   │
│     → BadgeAwardObserver (vérifier nouveaux badges)             │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RESULTS DISPLAYED TO STUDENT                  │
└─────────────────────────────────────────────────────────────────┘
```

### Permission Check avec Chain of Responsibility

```
User wants to EDIT exam
        │
        ↓
┌─────────────────────────────────────────────────────────────────┐
│  AccessHandlerChain.checkAccess(request)                        │
└─────────────────────────────────────────────────────────────────┘
        │
        ↓
┌──────────────────┐
│ GlobalAccessHandler │
│ Is user DG/Rector? │
│ Is scope GLOBAL?   │
└──────────────────┘
   │ No
   ↓
┌──────────────────┐
│ LocalAccessHandler │
│ Is user Principal? │
│ Same institution?  │
└──────────────────┘
   │ No
   ↓
┌──────────────────┐
│ SubjectAccessHandler │
│ Teaches this subject? │
└──────────────────┘
   │ No
   ↓
┌──────────────────┐
│ LevelAccessHandler │
│ Teaches this level? │
└──────────────────┘
   │ No
   ↓
┌──────────────────┐
│ FieldAccessHandler │
│ Teaches this field? │
└──────────────────┘
   │ No
   ↓
Access DENIED
```

---

## 📝 Prochaines Étapes

Pour voir comment ces patterns sont utilisés dans l'application :

1. **[04_API_ENDPOINTS.md](./04_API_ENDPOINTS.md)** - Comment les patterns sont appelés depuis les API
2. **[07_SERVICES.md](./07_SERVICES.md)** - Services qui orchestrent ces patterns
3. **[02_DATABASE_MODELS.md](./02_DATABASE_MODELS.md)** - Modèles manipulés par les patterns

---

**Dernière mise à jour:** Décembre 2024
