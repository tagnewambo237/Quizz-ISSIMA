# 07 - Couche Services Métier

> **Document:** Business Services Layer
> **Version:** 2.0
> **Dernière mise à jour:** Décembre 2024
> **Services implémentés:** 8

---

## 📚 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [ExamServiceV2](#examservicev2)
3. [ExamEvaluationService](#examevaluationservice)
4. [ExamAccessService](#examaccessservice)
5. [ExamWorkflowService](#examworkflowservice)
6. [AttemptService](#attemptservice)
7. [ProfileService](#profileservice)
8. [EducationStructureService](#educationstructureservice)
9. [LateCodeService](#latecodeservice)

---

## 🎯 Vue d'ensemble

Les services métier constituent la **couche intermédiaire** entre les API routes et les modèles de données. Ils orchestrent la logique métier complexe et utilisent les design patterns implémentés.

### Architecture en Couches

```
API Routes (Next.js)
        │
        ↓
   SERVICES LAYER  ←──── Cette couche
        │
        ↓
  Design Patterns (Strategy, Decorator, Observer, etc.)
        │
        ↓
  Models (Mongoose)
        │
        ↓
  Database (MongoDB)
```

### Services Disponibles

| Service | Fichier | Responsabilité |
|---------|---------|----------------|
| **ExamServiceV2** | `/lib/services/ExamServiceV2.ts` | CRUD examens avec filtres avancés |
| **ExamEvaluationService** | `/lib/services/ExamEvaluationService.ts` | Évaluation des tentatives (Strategy + Decorator) |
| **ExamAccessService** | `/lib/services/ExamAccessService.ts` | Contrôle d'accès (Chain of Responsibility) |
| **ExamWorkflowService** | `/lib/services/ExamWorkflowService.ts` | Workflow de validation |
| **AttemptService** | `/lib/services/AttemptService.ts` | Gestion des tentatives |
| **ProfileService** | `/lib/services/ProfileService.ts` | Gestion des profils |
| **EducationStructureService** | `/lib/services/EducationStructureService.ts` | Navigation hiérarchie éducative |
| **LateCodeService** | `/lib/services/LateCodeService.ts` | Génération et validation codes |

---

## 📝 ExamServiceV2

**Fichier:** `/lib/services/ExamServiceV2.ts`

### Responsabilités

- CRUD examens avec validation
- Filtrage avancé (multi-critères)
- Pagination et tri
- Recherche full-text
- Enrichissement avec relations

### API Publique

```typescript
export class ExamServiceV2 {
  /**
   * Récupérer examens avec filtres
   */
  async getExams(filters: ExamFilters): Promise<PaginatedResult<IExam>> {
    const query = this.buildQuery(filters);
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const [exams, total] = await Promise.all([
      Exam.find(query)
        .populate('subject', 'name code')
        .populate('targetLevels', 'name code')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Exam.countDocuments(query)
    ]);

    return {
      data: exams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Récupérer examen par ID
   */
  async getExamById(
    examId: string,
    options: { includeQuestions?: boolean; includeStats?: boolean } = {}
  ): Promise<IExam | null> {
    let query = Exam.findById(examId)
      .populate('subject', 'name code')
      .populate('targetLevels', 'name code cycle')
      .populate('targetFields', 'name code')
      .populate('learningUnit', 'title type')
      .populate('createdBy', 'name email');

    if (options.includeQuestions) {
      const exam = await query.lean();
      if (exam) {
        const questions = await Question.find({ examId: exam._id })
          .sort({ order: 1 })
          .lean();

        for (const question of questions) {
          question.options = await Option.find({ questionId: question._id })
            .sort({ order: 1 })
            .lean();
        }

        exam.questions = questions;
      }
      return exam;
    }

    return query.lean();
  }

  /**
   * Créer nouvel examen
   */
  async createExam(examData: CreateExamDTO, createdBy: string): Promise<IExam> {
    // Validation
    this.validateExamData(examData);

    // Create exam
    const exam = new Exam({
      ...examData,
      createdBy,
      status: ExamStatus.DRAFT,
      isPublished: false,
      isActive: true,
      version: 1,
      stats: {
        totalAttempts: 0,
        totalCompletions: 0,
        averageScore: 0,
        averageTime: 0,
        passRate: 0
      }
    });

    await exam.save();

    // Create questions if provided
    if (examData.questions && examData.questions.length > 0) {
      await this.createQuestions(exam._id, examData.questions);
    }

    // Publish event
    await publishEvent(EventType.EXAM_CREATED, {
      examId: exam._id,
      createdBy,
      title: exam.title
    });

    return exam;
  }

  /**
   * Mettre à jour examen
   */
  async updateExam(examId: string, updates: Partial<IExam>): Promise<IExam | null> {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new Error('Exam not found');
    }

    // Only allow updates if DRAFT or VALIDATED
    if (![ExamStatus.DRAFT, ExamStatus.VALIDATED].includes(exam.status)) {
      throw new Error('Cannot update exam in current status');
    }

    Object.assign(exam, updates);
    await exam.save();

    return exam;
  }

  /**
   * Soft delete exam
   */
  async deleteExam(examId: string): Promise<boolean> {
    const exam = await Exam.findById(examId);

    if (!exam) {
      return false;
    }

    exam.isActive = false;
    await exam.save();

    return true;
  }

  /**
   * Recherche full-text
   */
  async searchExams(query: string, filters: ExamFilters = {}): Promise<IExam[]> {
    const searchQuery = {
      ...this.buildQuery(filters),
      $text: { $search: query }
    };

    return Exam.find(searchQuery)
      .select({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean();
  }

  /**
   * Construire query MongoDB
   */
  private buildQuery(filters: ExamFilters): any {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.subSystem) query.subSystem = filters.subSystem;
    if (filters.targetLevels) query.targetLevels = { $in: filters.targetLevels };
    if (filters.subject) query.subject = filters.subject;
    if (filters.learningUnit) query.learningUnit = filters.learningUnit;
    if (filters.targetFields) query.targetFields = { $in: filters.targetFields };
    if (filters.evaluationType) query.evaluationType = filters.evaluationType;
    if (filters.difficultyLevel) query.difficultyLevel = filters.difficultyLevel;
    if (filters.createdBy) query.createdBy = filters.createdBy;
    if (filters.isPublished !== undefined) query.isPublished = filters.isPublished;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    return query;
  }

  /**
   * Créer questions pour exam
   */
  private async createQuestions(examId: string, questionsData: any[]): Promise<void> {
    for (let i = 0; i < questionsData.length; i++) {
      const questionData = questionsData[i];

      const question = await Question.create({
        examId,
        text: questionData.text,
        imageUrl: questionData.imageUrl,
        points: questionData.points,
        order: i + 1,
        difficulty: questionData.difficulty || DifficultyLevel.INTERMEDIATE,
        explanation: questionData.explanation,
        stats: {
          timesAsked: 0,
          timesCorrect: 0,
          timesIncorrect: 0,
          successRate: 0
        }
      });

      // Create options
      if (questionData.options) {
        for (let j = 0; j < questionData.options.length; j++) {
          await Option.create({
            questionId: question._id,
            text: questionData.options[j].text,
            isCorrect: questionData.options[j].isCorrect,
            order: j + 1,
            stats: {
              timesSelected: 0,
              selectionRate: 0
            }
          });
        }
      }
    }
  }

  /**
   * Valider données exam
   */
  private validateExamData(data: CreateExamDTO): void {
    if (!data.title || data.title.length < 3) {
      throw new Error('Title must be at least 3 characters');
    }

    if (!data.duration || data.duration < 1) {
      throw new Error('Duration must be at least 1 minute');
    }

    if (!data.targetLevels || data.targetLevels.length === 0) {
      throw new Error('At least one target level is required');
    }

    if (!data.subject) {
      throw new Error('Subject is required');
    }
  }
}
```

---

## 🎯 ExamEvaluationService

**Fichier:** `/lib/services/ExamEvaluationService.ts`

### Responsabilités

- Évaluation des tentatives avec Strategy Pattern
- Application des décorateurs (bonus/pénalités)
- Mise à jour des statistiques
- Déclenchement des événements

### API Publique

```typescript
export class ExamEvaluationService {
  /**
   * Évaluer une tentative complète
   */
  async evaluateAttempt(
    attemptId: string,
    options: EvaluationOptions = {}
  ): Promise<EvaluationResult> {
    // 1. Charger données
    const attempt = await Attempt.findById(attemptId)
      .populate('examId')
      .populate('userId');

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    const exam = attempt.examId as IExam;
    const questions = await Question.find({ examId: exam._id }).sort({ order: 1 });
    const responses = await Response.find({ attemptId: attempt._id });

    // 2. Strategy Pattern - Évaluation de base
    let result = await EvaluationStrategyFactory.evaluateExam(
      exam,
      attempt,
      responses,
      questions
    );

    // 3. Decorator Pattern - Enrichissement
    if (options.applyDecorators !== false) {
      const context: DecorationContext = {
        exam,
        attempt,
        responses,
        questions,
        timeSpent: attempt.timeSpent || 0
      };

      result = await ExamDecoratorFactory.applyDecorators(result, context);
    }

    // 4. Sauvegarder résultats
    await this.saveResults(attempt, result);

    // 5. Mettre à jour statistiques
    await this.updateExamStats(exam._id, result, attempt.timeSpent);
    await this.updateQuestionStats(responses, questions);

    // 6. Observer Pattern - Notifications
    await publishEvent(EventType.ATTEMPT_SUBMITTED, {
      userId: attempt.userId,
      examId: exam._id,
      attemptId: attempt._id,
      score: result.score,
      percentage: result.percentage,
      passed: result.passed,
      timeSpent: attempt.timeSpent,
      result
    });

    return result;
  }

  /**
   * Preview évaluation sans sauvegarder
   */
  async previewEvaluation(
    examId: string,
    responses: PreviewResponse[]
  ): Promise<EvaluationResult> {
    const exam = await Exam.findById(examId);
    const questions = await Question.find({ examId }).sort({ order: 1 });

    // Create temporary attempt and responses
    const tempAttempt = {
      examId: exam._id,
      status: AttemptStatus.STARTED,
      timeSpent: 0
    };

    const tempResponses = responses.map(r => ({
      questionId: r.questionId,
      selectedOptionId: r.selectedOptionId,
      isCorrect: this.checkIfCorrect(r.selectedOptionId, questions),
      timeSpent: r.timeSpent || 0
    }));

    // Evaluate without saving
    return await EvaluationStrategyFactory.evaluateExam(
      exam,
      tempAttempt as any,
      tempResponses as any,
      questions
    );
  }

  /**
   * Obtenir statistiques détaillées exam
   */
  async getExamStatistics(examId: string): Promise<ExamStatistics> {
    const attempts = await Attempt.find({
      examId,
      status: AttemptStatus.COMPLETED
    });

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        distribution: { excellent: 0, good: 0, average: 0, poor: 0 }
      };
    }

    const scores = attempts.map(a => a.percentage || 0);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    // Distribution
    const distribution = {
      excellent: scores.filter(s => s >= 90).length,
      good: scores.filter(s => s >= 70 && s < 90).length,
      average: scores.filter(s => s >= 50 && s < 70).length,
      poor: scores.filter(s => s < 50).length
    };

    return {
      totalAttempts: attempts.length,
      averageScore,
      distribution,
      passRate: (attempts.filter(a => a.passed).length / attempts.length) * 100
    };
  }

  /**
   * Sauvegarder résultats dans attempt
   */
  private async saveResults(attempt: IAttempt, result: EvaluationResult): Promise<void> {
    attempt.score = result.score;
    attempt.maxScore = result.maxScore;
    attempt.percentage = result.percentage;
    attempt.passed = result.passed;
    attempt.status = AttemptStatus.COMPLETED;
    attempt.submittedAt = new Date();

    await attempt.save();
  }

  /**
   * Mettre à jour stats exam
   */
  private async updateExamStats(
    examId: string,
    result: EvaluationResult,
    timeSpent: number
  ): Promise<void> {
    const exam = await Exam.findById(examId);
    if (!exam) return;

    const currentAvg = exam.stats.averageScore || 0;
    const currentCount = exam.stats.totalCompletions || 0;
    const newCount = currentCount + 1;

    exam.stats.totalAttempts = (exam.stats.totalAttempts || 0) + 1;
    exam.stats.totalCompletions = newCount;
    exam.stats.averageScore = (currentAvg * currentCount + result.percentage) / newCount;
    exam.stats.averageTime = ((exam.stats.averageTime || 0) * currentCount + timeSpent) / newCount;
    exam.stats.passRate = result.passed
      ? ((exam.stats.passRate || 0) * currentCount + 100) / newCount
      : ((exam.stats.passRate || 0) * currentCount) / newCount;
    exam.stats.lastAttemptDate = new Date();

    await exam.save();
  }

  /**
   * Mettre à jour stats questions
   */
  private async updateQuestionStats(
    responses: IResponse[],
    questions: IQuestion[]
  ): Promise<void> {
    for (const response of responses) {
      const question = questions.find(q => q._id.toString() === response.questionId.toString());
      if (!question) continue;

      question.stats.timesAsked++;
      if (response.isCorrect) {
        question.stats.timesCorrect++;
      } else {
        question.stats.timesIncorrect++;
      }
      question.stats.successRate = (question.stats.timesCorrect / question.stats.timesAsked) * 100;

      await question.save();

      // Update option stats
      if (response.selectedOptionId) {
        const option = await Option.findById(response.selectedOptionId);
        if (option) {
          option.stats.timesSelected++;
          await option.save();
        }
      }
    }
  }

  private checkIfCorrect(optionId: string, questions: IQuestion[]): boolean {
    // Implementation to check if option is correct
    return false; // Placeholder
  }
}
```

---

## 🔒 ExamAccessService

**Fichier:** `/lib/services/ExamAccessService.ts`

### Responsabilités

- Vérification des permissions avec Chain of Responsibility
- Contrôle d'accès granulaire
- Validation des droits selon rôle

### API Publique

```typescript
export class ExamAccessService {
  /**
   * Vérifier si user peut voir exam
   */
  async canViewExam(userId: string, examId: string): Promise<boolean> {
    return this.checkAccess(userId, examId, AccessAction.VIEW);
  }

  /**
   * Vérifier si user peut éditer exam
   */
  async canEditExam(userId: string, examId: string): Promise<boolean> {
    return this.checkAccess(userId, examId, AccessAction.EDIT);
  }

  /**
   * Vérifier si user peut supprimer exam
   */
  async canDeleteExam(userId: string, examId: string): Promise<boolean> {
    return this.checkAccess(userId, examId, AccessAction.DELETE);
  }

  /**
   * Vérifier si user peut valider exam
   */
  async canValidateExam(userId: string, examId: string): Promise<boolean> {
    return this.checkAccess(userId, examId, AccessAction.VALIDATE);
  }

  /**
   * Vérifier si user peut publier exam
   */
  async canPublishExam(userId: string, examId: string): Promise<boolean> {
    return this.checkAccess(userId, examId, AccessAction.PUBLISH);
  }

  /**
   * Vérifier accès avec Chain of Responsibility
   */
  private async checkAccess(
    userId: string,
    examId: string,
    action: AccessAction
  ): Promise<boolean> {
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
      action
    };

    // Use Chain of Responsibility Pattern
    return AccessHandlerChain.checkAccess(request);
  }

  /**
   * Obtenir permissions user pour exam
   */
  async getPermissions(userId: string, examId: string): Promise<ExamPermissions> {
    const [canView, canEdit, canDelete, canValidate, canPublish] = await Promise.all([
      this.canViewExam(userId, examId),
      this.canEditExam(userId, examId),
      this.canDeleteExam(userId, examId),
      this.canValidateExam(userId, examId),
      this.canPublishExam(userId, examId)
    ]);

    return {
      canView,
      canEdit,
      canDelete,
      canValidate,
      canPublish
    };
  }
}
```

---

## 🔄 ExamWorkflowService

**Fichier:** `/lib/services/ExamWorkflowService.ts`

### Responsabilités

- Gestion workflow validation
- Transitions d'états
- Événements de workflow

### API Publique

```typescript
export class ExamWorkflowService {
  /**
   * Soumettre exam pour validation
   */
  async submitForValidation(examId: string, userId: string): Promise<IExam> {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new Error('Exam not found');
    }

    if (exam.status !== ExamStatus.DRAFT) {
      throw new Error('Only DRAFT exams can be submitted for validation');
    }

    if (exam.createdBy.toString() !== userId) {
      throw new Error('Only creator can submit for validation');
    }

    exam.status = ExamStatus.PENDING_VALIDATION;
    await exam.save();

    return exam;
  }

  /**
   * Valider exam (Inspector/Principal)
   */
  async validateExam(examId: string, validatedBy: string, feedback?: string): Promise<IExam> {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new Error('Exam not found');
    }

    if (exam.status !== ExamStatus.PENDING_VALIDATION) {
      throw new Error('Only PENDING_VALIDATION exams can be validated');
    }

    exam.status = ExamStatus.VALIDATED;
    exam.validatedBy = new Types.ObjectId(validatedBy);
    exam.validatedAt = new Date();
    await exam.save();

    // Publish event
    await publishEvent(EventType.EXAM_VALIDATED, {
      examId: exam._id,
      validatedBy,
      feedback
    });

    return exam;
  }

  /**
   * Publier exam
   */
  async publishExam(examId: string): Promise<IExam> {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new Error('Exam not found');
    }

    if (exam.status !== ExamStatus.VALIDATED) {
      throw new Error('Only VALIDATED exams can be published');
    }

    exam.status = ExamStatus.PUBLISHED;
    exam.isPublished = true;
    await exam.save();

    // Publish event
    await publishEvent(EventType.EXAM_PUBLISHED, {
      examId: exam._id,
      createdBy: exam.createdBy,
      title: exam.title
    });

    return exam;
  }

  /**
   * Archiver exam
   */
  async archiveExam(examId: string): Promise<IExam> {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new Error('Exam not found');
    }

    exam.status = ExamStatus.ARCHIVED;
    exam.isPublished = false;
    await exam.save();

    return exam;
  }
}
```

---

## 📝 Autres Services

### AttemptService

**Responsabilités:**
- Démarrer tentatives
- Reprendre tentatives
- Validation codes tardifs

### ProfileService

**Responsabilités:**
- CRUD profils
- Statistiques profils
- Mise à jour préférences

### EducationStructureService

**Responsabilités:**
- Navigation hiérarchie éducative
- Relations niveaux/matières/filières

### LateCodeService

**Responsabilités:**
- Génération codes
- Validation codes
- Tracking usage

---

## 📝 Prochaines Étapes

Pour comprendre le déploiement :

1. **[08_DEPLOYMENT.md](./08_DEPLOYMENT.md)** - Configuration et déploiement
2. **[03_DESIGN_PATTERNS.md](./03_DESIGN_PATTERNS.md)** - Patterns utilisés par les services
3. **[02_DATABASE_MODELS.md](./02_DATABASE_MODELS.md)** - Modèles manipulés

---

**Dernière mise à jour:** Décembre 2024
