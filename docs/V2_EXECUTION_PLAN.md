# QuizLock V2 - Plan d'Exécution Optimisé

Ce document réorganise le V2_ROADMAP.md en **flows logiques et exécutables** en tenant compte de toutes les dépendances.

## 📋 Definition of Done (DoD) - OBLIGATOIRE pour chaque flow

**Un flow est ✅ TERMINÉ seulement si TOUS ces critères sont remplis :**

### 1. ✅ Code Fonctionnel
- [ ] Pas d'erreurs TypeScript (`npm run type-check`)
- [ ] Pas d'erreurs ESLint (`npm run lint`)
- [ ] Code build sans erreur (`npm run build`)
- [ ] Suit les conventions du projet (naming, structure)

### 2. ✅ Tests Écrits et Passants
- [ ] **Unit tests** écrits (coverage ≥ 80% du code du flow)
- [ ] **Integration tests** écrits pour les API routes
- [ ] Tous les tests passent (`npm run test`)
- [ ] Pas de tests ignorés (skip/only)

### 3. ✅ Documentation Complète
- [ ] **JSDoc** sur toutes les fonctions/classes publiques
- [ ] **README.md** pour les nouveaux modules/patterns
- [ ] **Exemples d'usage** dans la documentation
- [ ] **Schémas/diagrammes** si architecture complexe
- [ ] **Types TypeScript** bien documentés

### 4. ✅ Code Review Standards
- [ ] Code lisible (noms explicites, logique claire)
- [ ] Pas de duplication (DRY principle)
- [ ] Gestion d'erreurs robuste (try/catch, validation)
- [ ] Sécurité : validation des inputs, sanitization
- [ ] Performance acceptable (pas de N+1 queries)

### 5. ✅ Intégration Validée
- [ ] Fonctionne avec les flows précédents
- [ ] Pas de régression (anciens tests passent toujours)
- [ ] Test manuel réussi (smoke test)
- [ ] Migration de données testée (si applicable)

### 6. ✅ Checklist du Flow Cochée
- [ ] Tous les fichiers créés/modifiés
- [ ] Roadmap mis à jour (cocher dans V2_ROADMAP.md)
- [ ] Commit avec message descriptif
- [ ] Documentation ajoutée au wiki/docs

---

## 📚 Templates de Documentation

### Template JSDoc (pour fonctions/classes)
```typescript
/**
 * Description courte de ce que fait la fonction
 *
 * @example
 * ```typescript
 * const result = await myFunction({ param: 'value' })
 * console.log(result) // Expected output
 * ```
 *
 * @param {ParamType} paramName - Description du paramètre
 * @returns {Promise<ReturnType>} Description du retour
 * @throws {ErrorType} Quand l'erreur se produit
 */
```

### Template README.md (pour modules)
```markdown
# Nom du Module

## Description
Explication claire de ce que fait le module et pourquoi il existe.

## Architecture
Diagramme ou explication de la structure.

## Usage
\`\`\`typescript
import { MyClass } from './module'

const instance = new MyClass()
const result = await instance.doSomething()
\`\`\`

## API Reference
Liste des fonctions/classes exportées avec leurs signatures.

## Tests
Comment lancer les tests : `npm run test -- path/to/tests`

## Dépendances
Quels autres modules sont requis.
```

---

## 🧪 Structure des Tests

### Unit Tests
```
__tests__/
  unit/
    models/           # Tests des modèles Mongoose
    services/         # Tests de la logique métier
    patterns/         # Tests des design patterns
    utils/            # Tests des utilitaires
```

### Integration Tests
```
__tests__/
  integration/
    api/              # Tests des routes API
    workflows/        # Tests des workflows complets
```

### Convention de nommage
- Fichier de test : `MyModule.test.ts` (même nom que le fichier source)
- Describe : nom de la classe/fonction
- It/Test : comportement attendu en français

```typescript
describe('ProfileFactory', () => {
  describe('createProfile', () => {
    it('devrait créer un LearnerProfile pour un étudiant', async () => {
      // Arrange
      const user = { role: 'STUDENT', ... }

      // Act
      const profile = await ProfileFactory.createProfile(user)

      // Assert
      expect(profile).toBeInstanceOf(LearnerProfile)
    })
  })
})
```

---

## 📊 Graphe de Dépendances

```
1.1 (✅ FAIT) → 1.2 → 1.3 → 1.4 → 1.5 → 1.7
                ↓      ↓      ↓
                ↓      ↓      3.1 → 2.1 → 2.2
                ↓      ↓      ↓
                ↓      ↓      3.2
                ↓      ↓
                ↓      3.3 → 3.4 (needs 4.1)
                ↓           ↓
                ↓           3.5 (needs 1.4 Observer)
                ↓           ↓
                ↓           3.6
                ↓
                4.1 → 4.2 → 4.3
                      ↓
                      5.1-5.4 (needs 3.1-3.5)
                      ↓
                      6.1-6.5 (needs 3.1-3.5)
                      ↓
                      13 (Testing)
                      ↓
                      1.6 (Migration once everything works)
```

---

## 🎯 Ordre d'Exécution Optimal (32 Flows)

### 🔴 BLOC 1: Foundation (Backend Core) - 7 Flows

#### **Flow 1: Data Seeding** ✅ TERMINÉ
**Dépendances:** 1.1 ✅ (Models existants)
**Durée estimée:** 2-3h
**Responsable:** Claude
**Status:** ✅ Terminé

---

##### 📝 Description
Créer les scripts de seeding pour peupler la base de données avec la structure éducative camerounaise (systèmes francophone et anglophone).

---

##### 📦 Fichiers à Créer

**Scripts de Seed:**
- [ ] `scripts/seed/index.ts` - Script principal
- [ ] `scripts/seed/education-levels.ts` - Seed des niveaux
- [ ] `scripts/seed/fields.ts` - Seed des filières/séries
- [ ] `scripts/seed/subjects.ts` - Seed des matières
- [ ] `scripts/seed/learning-units.ts` - Seed des unités d'apprentissage
- [ ] `scripts/seed/competencies.ts` - Seed des compétences
- [ ] `scripts/seed/utils/seed-helpers.ts` - Utilitaires (find or create, etc.)

**Données JSON:**
- [ ] `scripts/seed/data/francophone/levels.json` - 6ème → Tle
- [ ] `scripts/seed/data/francophone/fields.json` - Séries A, C, D, TI, etc.
- [ ] `scripts/seed/data/francophone/subjects.json` - Matières
- [ ] `scripts/seed/data/anglophone/levels.json` - Form 1 → Upper Sixth
- [ ] `scripts/seed/data/anglophone/fields.json` - Arts, Science, etc.
- [ ] `scripts/seed/data/anglophone/subjects.json` - Subjects
- [ ] `scripts/seed/data/competencies.json` - Compétences transversales

**Documentation:**
- [ ] `scripts/seed/README.md` - Documentation du système de seeding

---

##### 🧪 Tests à Écrire

**Unit Tests:**
- [ ] `__tests__/unit/seed/seed-helpers.test.ts`
  - [ ] Test `findOrCreate` function
  - [ ] Test validation des données JSON
  - [ ] Test gestion des doublons

**Integration Tests:**
- [ ] `__tests__/integration/seed/full-seed.test.ts`
  - [ ] Test: Seed complet s'exécute sans erreur
  - [ ] Test: Tous les niveaux sont créés (count = attendu)
  - [ ] Test: Toutes les séries sont créées
  - [ ] Test: Toutes les matières sont créées
  - [ ] Test: Relations sont correctes (Field.applicableLevels, etc.)
  - [ ] Test: Pas de doublons
  - [ ] Test: Idempotence (re-run du seed ne crée pas de doublons)

**Tests manuels:**
- [ ] Exécuter `npm run seed` en dev
- [ ] Vérifier dans MongoDB Compass les collections
- [ ] Vérifier les relations avec aggregation pipeline

---

##### 📚 Documentation à Écrire

**README.md du module:**
```markdown
# Data Seeding - Système Éducatif Camerounais

## Description
Scripts pour peupler la base de données avec la structure éducative du Cameroun (Francophone & Anglophone).

## Structure
- Collège : 6ème, 5ème, 4ème, 3ème
- Lycée : 2nde, 1ère (A/C/D/TI), Tle (A/C/D/TI)
- Anglophone : Form 1-5, Lower/Upper Sixth

## Usage
\`\`\`bash
npm run seed              # Seed complet
npm run seed:levels       # Seulement les niveaux
npm run seed:subjects     # Seulement les matières
npm run seed:clean        # Nettoyer avant seed
\`\`\`

## Données Créées
- ~50 EducationLevels
- ~20 Fields (séries/filières)
- ~30 Subjects (matières)
- ~15 Competencies

## Idempotence
Les scripts sont idempotents : re-run ne crée pas de doublons.
```

**JSDoc dans le code:**
- [ ] Documenter `seedEducationLevels()`
- [ ] Documenter `seedFields()`
- [ ] Documenter `seedSubjects()`
- [ ] Documenter `findOrCreate()`

---

##### ✅ Checklist de Validation

**Code:**
- [ ] TypeScript compile sans erreur
- [ ] ESLint passe sans warning
- [ ] Gestion d'erreurs (try/catch, logging)
- [ ] Logs informatifs pendant le seed

**Tests:**
- [ ] Tous les tests unitaires passent (npm run test:unit)
- [ ] Tous les tests d'intégration passent
- [ ] Coverage ≥ 80% sur les helpers

**Documentation:**
- [ ] README.md créé et complet
- [ ] JSDoc sur toutes les fonctions
- [ ] Exemples d'usage clairs
- [ ] Package.json scripts ajoutés :
  ```json
  "scripts": {
    "seed": "ts-node scripts/seed/index.ts",
    "seed:clean": "ts-node scripts/seed/index.ts --clean"
  }
  ```

**Validation Manuelle:**
- [ ] Seed s'exécute en < 30 secondes
- [ ] Données visibles dans MongoDB Compass
- [ ] Pas d'erreurs dans les logs
- [ ] Relations correctes (vérifier avec queries)

**Intégration:**
- [ ] V2_ROADMAP.md mis à jour (cocher 1.2)
- [ ] Commit avec message: `feat: add data seeding for Cameroon education system`
- [ ] Branch créée : `feature/data-seeding`

---

##### 🎯 Résultat Attendu

**Base de données contient:**
- ✅ ~12 niveaux Francophone (6ème → Tle)
- ✅ ~8 niveaux Anglophone (Form 1 → Upper Sixth)
- ✅ ~20 Fields/Séries (A, C, D, TI, Arts, Science, Commerce, etc.)
- ✅ ~30 Subjects (Maths, Physique, Français, Anglais, SVT, Histoire, etc.)
- ✅ ~50 LearningUnits de base (Chapitres principaux)
- ✅ ~15 Competencies (Digital, Entrepreneurial, Critical Thinking, etc.)

**Exemple de données:**
```typescript
// EducationLevel
{
  name: "Terminale C",
  code: "TLE_C",
  cycle: "LYCEE",
  subSystem: "FRANCOPHONE",
  order: 11
}

// Field
{
  name: "Série C",
  code: "SERIE_C",
  category: "SERIE",
  cycle: "LYCEE",
  applicableLevels: [ObjectId("TLE_C"), ObjectId("1ERE_C")]
}

// Subject
{
  name: "Mathématiques",
  code: "MATH",
  subjectType: "DISCIPLINE",
  applicableLevels: [...],
  applicableFields: [ObjectId("SERIE_C"), ObjectId("SERIE_D")]
}
```

---

##### 🚀 Prêt à Démarrer ?

**Une fois ce flow terminé ✅, on pourra cocher dans V2_ROADMAP.md:**
```markdown
- [x] **1.2 Data Seeding (Critical for Development)**
    - [x] Create seed script for Cameroon Education System
    - [x] Seed Levels (6ème -> Tle, Form 1 -> Upper Sixth)
    - [x] Seed Series/Fields (A, C, D, TI, Arts, Science)
    - [x] Seed Common Subjects (Maths, Physics, French, English)
    - [x] Verify data relationships
```

---

#### **Flow 2: Assessment Models V2**
**Dépendances:** Flow 1 (pour les références ObjectId)
**Durée estimée:** 3-4h
**Fichiers à modifier/créer:**
- `models/Exam.ts` (update avec nouveaux champs V2)
- `models/Question.ts` (update avec difficulty, explanation)
- `models/Option.ts` (update avec stats)
- `models/Attempt.ts` (update avec antiCheatEvents)
- `models/Response.ts` (update avec timeSpent)
- `models/LateCode.ts` (create new)

**Nouveaux champs clés:**
```typescript
// Exam.ts
targetLevels: ObjectId[]
subject: ObjectId
learningUnit: ObjectId
targetFields: ObjectId[]
targetedCompetencies: ObjectId[]
pedagogicalObjective: PedagogicalObjective
evaluationType: EvaluationType
difficultyLevel: DifficultyLevel
status: ExamStatus (DRAFT, PENDING_VALIDATION, VALIDATED, PUBLISHED)
config: { antiCheat, shuffleQuestions, etc. }
stats: { averageScore, passRate, etc. }
version: Number
```

---

#### **Flow 3: Repository Pattern Infrastructure**
**Dépendances:** Flow 2
**Durée estimée:** 4-5h
**Fichiers à créer:**
- `lib/repositories/interfaces/IRepository.ts`
- `lib/repositories/interfaces/IExamRepository.ts`
- `lib/repositories/interfaces/IEducationLevelRepository.ts`
- `lib/repositories/MongoExamRepository.ts`
- `lib/repositories/MongoEducationLevelRepository.ts`
- `lib/repositories/CachedExamRepository.ts` (decorator)
- `lib/repositories/index.ts`

**Pattern à implémenter:**
```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>
  findAll(filter?: any): Promise<T[]>
  create(data: T): Promise<T>
  update(id: string, data: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
}
```

---

#### **Flow 4: Strategy Pattern (Evaluation)**
**Dépendances:** Flow 2
**Durée estimée:** 3h
**Fichiers à créer:**
- `lib/evaluation/interfaces/IEvaluationStrategy.ts`
- `lib/evaluation/strategies/QCMStrategy.ts`
- `lib/evaluation/strategies/TrueFalseStrategy.ts`
- `lib/evaluation/strategies/AdaptiveStrategy.ts`
- `lib/evaluation/EvaluationContext.ts`
- `lib/evaluation/index.ts`

**Pattern:**
```typescript
interface IEvaluationStrategy {
  evaluate(attempt: IAttempt, responses: IResponse[], questions: IQuestion[]): number
  calculatePartialScore?(response: IResponse, question: IQuestion): number
}
```

---

#### **Flow 5: Chain of Responsibility (Access Control)**
**Dépendances:** Flow 2 (models), Flow 3 (repository)
**Durée estimée:** 4h
**Fichiers à créer:**
- `lib/access-control/AccessHandler.ts` (abstract)
- `lib/access-control/handlers/GlobalAccessHandler.ts`
- `lib/access-control/handlers/LocalAccessHandler.ts`
- `lib/access-control/handlers/SubjectAccessHandler.ts`
- `lib/access-control/handlers/LevelAccessHandler.ts`
- `lib/access-control/handlers/FieldAccessHandler.ts`
- `lib/access-control/AccessChainBuilder.ts`
- `lib/access-control/index.ts`

**Pattern:**
```typescript
abstract class AccessHandler {
  protected next: AccessHandler | null = null

  setNext(handler: AccessHandler): AccessHandler {
    this.next = handler
    return handler
  }

  abstract handle(user: IUser, resource: IExam): Promise<boolean>
}
```

---

#### **Flow 6: Observer Pattern (Notifications)**
**Dépendances:** Flow 2
**Durée estimée:** 3h
**Fichiers à créer:**
- `lib/events/interfaces/IObserver.ts`
- `lib/events/EventPublisher.ts`
- `lib/events/observers/EmailNotificationObserver.ts`
- `lib/events/observers/StatsUpdateObserver.ts`
- `lib/events/observers/BadgeAwardObserver.ts`
- `lib/events/observers/XPUpdateObserver.ts`
- `lib/events/index.ts`

**Pattern:**
```typescript
interface IObserver {
  update(event: AppEvent): Promise<void>
}

interface AppEvent {
  type: EventType
  data: any
  timestamp: Date
}
```

---

#### **Flow 7: Database Optimization**
**Dépendances:** Flow 2 (models finalisés)
**Durée estimée:** 2h
**Fichiers à modifier:**
- Tous les models dans `models/` pour ajouter les indexes
- `lib/mongodb.ts` (configure index creation)

**Indexes à ajouter:**
```typescript
// Exam
Index: { title: 'text', description: 'text' }
Index: { subSystem: 1, targetLevels: 1, subject: 1 }
Index: { startTime: 1, endTime: 1 }
Index: { status: 1, isPublished: 1 }

// Attempt
Index: { examId: 1, userId: 1 }
Index: { expiresAt: 1 } (TTL)
Index: { resumeToken: 1 } (unique)

// etc.
```

---

### 🟠 BLOC 2: API Layer (Backend Services) - 8 Flows

#### **Flow 8: Educational Structure API** ✅ TERMINÉ
**Dépendances:** Flow 1 (data), Flow 3 (repository)
**Durée estimée:** 4-5h
**Status:** ✅ Terminé
**Fichiers à créer:**
- `app/api/education-levels/route.ts` (GET, POST)
- `app/api/education-levels/[id]/route.ts` (GET, PUT, DELETE)
- `app/api/fields/route.ts`
- `app/api/fields/[id]/route.ts`
- `app/api/subjects/route.ts`
- `app/api/subjects/[id]/route.ts`
- `app/api/learning-units/route.ts`
- `app/api/learning-units/[id]/route.ts`
- `app/api/competencies/route.ts`
- `app/api/competencies/[id]/route.ts`
- `lib/services/EducationStructureService.ts`

**Endpoints:**
```
GET    /api/education-levels?subSystem=FRANCOPHONE&cycle=LYCEE
POST   /api/education-levels (admin only)
GET    /api/fields?level=TLE_C
GET    /api/subjects?level=TLE_C&field=SERIE_C
```

---

#### **Flow 9: User Profile API** ✅ TERMINÉ
**Dépendances:** Flow 3 (repository), Flow 6 (observer for profile updates)
**Durée estimée:** 3h
**Status:** ✅ Terminé
**Fichiers à créer:**
- `app/api/profiles/learner/route.ts`
- `app/api/profiles/pedagogical/route.ts`
- `app/api/profiles/stats/route.ts`
- `lib/services/ProfileService.ts`

**Endpoints:**
```
GET    /api/profiles/learner (returns current user's LearnerProfile)
PUT    /api/profiles/learner (update profile)
GET    /api/profiles/pedagogical
PUT    /api/profiles/pedagogical
GET    /api/profiles/stats (aggregated analytics)
```

---

#### **Flow 10: Advanced Exam API V2**
**Dépendances:** Flow 4 (EvaluationStrategy), Flow 3 (repository)
**Durée estimée:** 5-6h
**Fichiers à créer:**
- `app/api/exams/v2/route.ts` (GET list, POST create)
- `app/api/exams/v2/[id]/route.ts` (GET, PUT, DELETE)
- `app/api/exams/v2/filter/route.ts` (advanced filtering)
- `app/api/exams/v2/search/route.ts` (full-text search)
- `lib/services/ExamServiceV2.ts`

**Endpoints:**
```
GET    /api/exams/v2?level=TLE_C&subject=MATH&status=PUBLISHED
POST   /api/exams/v2 (create with all new fields)
GET    /api/exams/v2/filter?targetLevels[]=...&competencies[]=...
GET    /api/exams/v2/search?q=logarithmes
PUT    /api/exams/v2/:id (update)
DELETE /api/exams/v2/:id (soft delete -> archive)
```

---

#### **Flow 11: Exam Workflow API**
**Dépendances:** Flow 10 (Exam API), Flow 5 (AccessHandler)
**Durée estimée:** 3-4h
**Fichiers à créer:**
- `app/api/exams/[id]/submit-validation/route.ts`
- `app/api/exams/[id]/validate/route.ts`
- `app/api/exams/[id]/publish/route.ts`
- `app/api/exams/[id]/archive/route.ts`
- `lib/services/ExamWorkflowService.ts`

**Workflow:**
```
DRAFT → submit-validation → PENDING_VALIDATION
PENDING_VALIDATION → validate (inspector) → VALIDATED
VALIDATED → publish → PUBLISHED
PUBLISHED → archive → ARCHIVED
```

---

#### **Flow 12: Attempt & Response API V2**
**Dépendances:** Flow 10 (Exam API), Flow 4 (EvaluationStrategy), Flow 6 (Observer)
**Durée estimée:** 5-6h
**Fichiers à créer:**
- `app/api/attempts/start/route.ts`
- `app/api/attempts/[id]/route.ts` (GET attempt details)
- `app/api/attempts/[id]/resume/route.ts`
- `app/api/attempts/[id]/submit/route.ts`
- `app/api/attempts/[id]/anti-cheat-event/route.ts`
- `lib/services/AttemptService.ts`

**Flow:**
```
1. POST /api/attempts/start { examId } → returns { attemptId, resumeToken }
2. POST /api/attempts/:id/anti-cheat-event { type: "tab_switch" }
3. POST /api/attempts/:id/submit { responses: [] } → evaluates with Strategy
4. Observer triggers: Email, Stats update, XP award, Badge check
```

---

#### **Flow 13: Late Code API**
**Dépendances:** Flow 10 (Exam API)
**Durée estimée:** 2h
**Fichiers à créer:**
- `app/api/late-codes/generate/route.ts`
- `app/api/late-codes/validate/route.ts`
- `lib/services/LateCodeService.ts`

**Endpoints:**
```
POST   /api/late-codes/generate { examId, usagesRemaining, expiresAt }
POST   /api/late-codes/validate { code, examId } → allows student to start
```

---

#### **Flow 14: Middleware - Access Control**
**Dépendances:** Flow 5 (AccessHandler)
**Durée estimée:** 3h
**Fichiers à créer:**
- `lib/middleware/withAccessControl.ts` (HOF)
- `lib/middleware/withAuth.ts` (already exists, maybe enhance)
- `lib/middleware/withRole.ts`

**Usage:**
```typescript
// In API route
export const POST = withAccessControl(
  async (req, { user, params }) => {
    // user has access, proceed
  },
  { requiredRole: 'TEACHER', resourceType: 'exam' }
)
```

---

#### **Flow 15: Frontend Permission Guards**
**Dépendances:** Flow 14 (middleware)
**Durée estimée:** 2-3h
**Fichiers à créer:**
- `hooks/useAccessControl.ts`
- `components/guards/PermissionGuard.tsx`
- `components/guards/RoleGuard.tsx`

**Usage:**
```typescript
const { canEdit, canDelete } = useAccessControl({ resourceType: 'exam', resource: exam })

<PermissionGuard permission="exam:create">
  <CreateExamButton />
</PermissionGuard>
```

---

### 🟡 BLOC 3: Authentication & Onboarding - 2 Flows

#### **Flow 16: Enhanced Registration** ✅
**Dépendances:** Flow 8 (Educational API pour dropdowns)
**Durée estimée:** 2h
**Status:** ✅ Terminé
**Fichiers à modifier:**
- `app/register/page.tsx` (ajouter champs optionnels)
- `app/api/register/route.ts` (handle new fields)

---

#### **Flow 17: Onboarding Experience** ✅ TERMINÉ
**Dépendances:** Flow 16, Flow 9 (Profile API)
**Durée estimée:** 4-5h
**Status:** ✅ Terminé
**Fichiers à créer:**
- `app/onboarding/page.tsx` (multi-step wizard)
- `app/onboarding/student/page.tsx`
- `app/onboarding/teacher/page.tsx`
- `components/onboarding/StepIndicator.tsx`
- `components/onboarding/SubSystemSelector.tsx`
- `components/onboarding/LevelSelector.tsx`
- `components/onboarding/FieldSelector.tsx`
- `components/onboarding/SubjectSelector.tsx`

**Student Flow:**
1. Select SubSystem (Francophone/Anglophone)
2. Select Cycle & Level (Collège 6ème, Lycée Tle C, etc.)
3. Select Field/Series (if applicable)
4. Set preferences (learning mode, cognitive profile)
5. Create LearnerProfile → redirect to dashboard

**Teacher Flow:**
1. Select Teaching Subjects (multi-select)
2. Select Intervention Levels (multi-select)
3. Select Intervention Fields (optional)
4. Create PedagogicalProfile → redirect to dashboard

---

### 🟢 BLOC 4: Teacher Dashboard - 4 Flows

#### **Flow 18: Teacher Dashboard UI** ✅
**Dépendances:** Flow 9 (Profile API)
**Durée estimée:** 3-4h
**Fichiers à créer/modifier:**
- `app/(dashboard)/teacher/page.tsx` (overview)
- `components/dashboard/teacher/StatsOverview.tsx`
- `components/dashboard/teacher/RecentActivity.tsx`
- `components/dashboard/teacher/QuickActions.tsx`

**Dashboard shows:**
- Total exams created
- Average student score
- Recent exams (draft, pending, published)
- Quick actions (Create Exam, View Results, Generate Late Code)

---

#### **Flow 19: Advanced Exam Creator** ✅
**Dépendances:** Flow 10 (Exam API), Flow 8 (Educational API)
**Durée estimée:** 6-8h (le plus complexe !)
**Status:** ✅ Terminé
**Fichiers à créer:**
- `app/(dashboard)/teacher/exams/create/page.tsx`
- `components/exam-creator/Step1Classification.tsx`
- `components/exam-creator/Step2TargetAudience.tsx`
- `components/exam-creator/Step3Configuration.tsx`
- `components/exam-creator/Step4QuestionEditor.tsx`
- `components/exam-creator/Step5Preview.tsx`

**Steps:**
1. Classification: SubSystem → Level → Subject → LearningUnit
2. Target Audience: Select Fields (multiple), Select Competencies
3. Configuration: Dates, Duration, Close Mode, Pedagogical Objective, Anti-cheat settings
4. Questions: Add questions with options, points, difficulty, images
5. Preview & Submit for validation

---

#### **Flow 20: Exam Management Interface** ✅
**Dépendances:** Flow 11 (Workflow API), Flow 13 (Late Code API)
**Durée estimée:** 4h
**Status:** ✅ Terminé
**Fichiers à créer:**
- `app/(dashboard)/teacher/exams/page.tsx` (list all exams)
- `app/(dashboard)/teacher/exams/[id]/page.tsx` (exam details)
- `app/(dashboard)/teacher/exams/[id]/edit/page.tsx`
- `components/exam-management/ExamCard.tsx`
- `components/exam-management/ExamStatusBadge.tsx`
- `components/exam-management/LateCodeGenerator.tsx`
- `components/exam-management/ActiveAttemptsMonitor.tsx`

**Features:**
- List exams by status (tabs: Draft, Pending, Validated, Published, Archived)
- Actions: Edit, Clone, Archive, Generate Late Code
- Real-time monitoring: Active attempts count
- Workflow actions: Submit for validation, Publish

---

#### **Flow 21: Results & Analytics Dashboard** ✅
**Dépendances:** Flow 12 (Attempt API)
**Durée estimée:** 4-5h
**Status:** ✅ Terminé
**Fichiers à créer:**
- `app/(dashboard)/teacher/exams/[id]/results/page.tsx`
- `components/analytics/ExamStats.tsx`
- `components/analytics/QuestionAnalysis.tsx`
- `components/analytics/StudentPerformanceTable.tsx`
- `components/analytics/ChartScoreDistribution.tsx`
- `lib/utils/exportResults.ts` (CSV/PDF export)

**Analytics shown:**
- Success rate, average score, average time
- Question-by-question analysis (% correct)
- Student performance table (sortable)
- Score distribution chart
- Export buttons (CSV, PDF)

---

### 🔵 BLOC 5: Student Dashboard - 5 Flows

#### **Flow 22: Student Dashboard UI**
**Dépendances:** Flow 9 (Profile API), Flow 10 (Exam API)
**Durée estimée:** 3-4h
**Fichiers à créer:**
- `app/(dashboard)/student/page.tsx` (overview)
- `components/dashboard/student/MyJourney.tsx`
- `components/dashboard/student/AvailableExams.tsx`
- `components/dashboard/student/Recommendations.tsx`
- `components/dashboard/student/LearningModeSelector.tsx`

**Dashboard shows:**
- My Journey (progress, XP, level, streak)
- Available Exams (filtered by profile)
- Smart recommendations (based on weak subjects)
- Learning mode selector

---

#### **Flow 23: Advanced Filtering & Search**
**Dépendances:** Flow 10 (Exam API with filter endpoint)
**Durée estimée:** 3h
**Fichiers à créer:**
- `components/student/ExamFilters.tsx`
- `components/student/ExamSearchBar.tsx`
- `components/student/FilterChips.tsx`

**Filters:**
- SubSystem, Level, Field, Subject, Learning Unit
- Competency type
- Difficulty level
- Full-text search

---

#### **Flow 24: Exam Taking Interface V2**
**Dépendances:** Flow 12 (Attempt API)
**Durée estimée:** 6-7h (complexe avec anti-cheat)
**Fichiers à créer:**
- `app/(dashboard)/student/exams/[id]/take/page.tsx`
- `components/exam-taking/FullscreenWrapper.tsx`
- `components/exam-taking/TimerCountdown.tsx`
- `components/exam-taking/ProgressIndicator.tsx`
- `components/exam-taking/QuestionDisplay.tsx`
- `components/exam-taking/AnswerOptions.tsx`
- `components/exam-taking/NavigationPanel.tsx`
- `hooks/useAntiCheat.ts`
- `hooks/useAutoSave.ts`

**Features:**
- Fullscreen mode (detect exit)
- Timer with visual countdown
- Progress bar (X/20 questions)
- Auto-save every 30s
- Question navigation (mark for review)
- Anti-cheat tracking (tab switches, copy attempts)
- Resume capability with token

---

#### **Flow 25: Results & Review Interface**
**Dépendances:** Flow 12 (Attempt API)
**Durée estimée:** 4h
**Fichiers à créer:**
- `app/(dashboard)/student/exams/[attemptId]/results/page.tsx`
- `components/results/ScoreCard.tsx`
- `components/results/QuestionReview.tsx`
- `components/results/PerformanceComparison.tsx`
- `components/results/WeakAreasIdentification.tsx`

**Shows:**
- Overall score (with animation)
- Question-by-question breakdown (correct/incorrect)
- Explanation for each question (if available)
- Performance vs class average
- Weak areas identification (subjects to review)

---

#### **Flow 26: History & Analytics**
**Dépendances:** Flow 12 (Attempt API)
**Durée estimée:** 3-4h
**Fichiers à créer:**
- `app/(dashboard)/student/history/page.tsx`
- `components/student-analytics/AttemptHistory.tsx`
- `components/student-analytics/ScoreTrendChart.tsx`
- `components/student-analytics/SubjectPerformanceChart.tsx`
- `components/student-analytics/CompetencyRadarChart.tsx`

**Analytics:**
- Exam attempt history (timeline)
- Score trends over time (line chart)
- Subject-wise performance (bar chart)
- Competency radar chart (spider chart)

---

### 🟣 BLOC 6: Testing & Migration - 3 Flows

#### **Flow 27: Unit Tests for Patterns**
**Dépendances:** Flow 3-6 (all patterns implemented)
**Durée estimée:** 4-5h
**Fichiers à créer:**
- `__tests__/unit/patterns/ProfileFactory.test.ts`
- `__tests__/unit/patterns/EvaluationStrategy.test.ts`
- `__tests__/unit/patterns/AccessHandler.test.ts`
- `__tests__/unit/patterns/Repository.test.ts`
- `__tests__/unit/patterns/Observer.test.ts`

---

#### **Flow 28: Integration Tests for API Routes**
**Dépendances:** Flow 8-15 (all APIs)
**Durée estimée:** 6-8h
**Fichiers à créer:**
- `__tests__/integration/api/education-levels.test.ts`
- `__tests__/integration/api/exams-v2.test.ts`
- `__tests__/integration/api/exam-workflow.test.ts`
- `__tests__/integration/api/attempts.test.ts`
- `__tests__/integration/api/access-control.test.ts`

---

#### **Flow 29: Data Migration V1 → V2**
**Dépendances:** TOUS les flows précédents (quand tout marche)
**Durée estimée:** 4-5h
**Fichiers à créer:**
- `scripts/migration/migrate-users.ts`
- `scripts/migration/migrate-exams.ts`
- `scripts/migration/migrate-attempts.ts`
- `scripts/migration/verify-migration.ts`

**Steps:**
1. Backup current DB
2. Create default EducationLevel/Field/Subject for existing exams
3. Map existing exams to new structure
4. Update User models
5. Create default profiles for existing users
6. Verify data integrity
7. Test with V2 API

---

### ⚡ BLOC 7: Post-MVP (Optional) - 3 Flows

#### **Flow 30: Gamification System**
**Dépendances:** Flow 6 (Observer), Flow 12 (Attempt API)
**Durée estimée:** 5-6h
**Fichiers à créer:**
- `lib/gamification/XPCalculator.ts`
- `lib/gamification/BadgeManager.ts`
- `lib/gamification/StreakTracker.ts`
- `lib/gamification/LeaderboardService.ts`
- `app/api/gamification/leaderboard/route.ts`
- `components/gamification/XPBar.tsx`
- `components/gamification/BadgeDisplay.tsx`
- `components/gamification/Leaderboard.tsx`

---

#### **Flow 31: Learning Modes**
**Dépendances:** Flow 24 (Exam Taking), Flow 30 (Gamification)
**Durée estimée:** 4-5h
**Fichiers à créer:**
- `lib/learning-modes/AutoEvalMode.ts`
- `lib/learning-modes/CompetitionMode.ts`
- `lib/learning-modes/ExamMode.ts`
- `lib/learning-modes/ClassChallengeMode.ts`

---

#### **Flow 32: Admin Dashboards**
**Dépendances:** Flow 11 (Workflow), Flow 5 (Access Control)
**Durée estimée:** 6-8h
**Fichiers à créer:**
- `app/(dashboard)/inspector/page.tsx`
- `app/(dashboard)/principal/page.tsx`
- `app/(dashboard)/dg/page.tsx`
- `app/api/reports/class/route.ts`
- `app/api/reports/institution/route.ts`
- `app/api/reports/global/route.ts`

---

## 📅 Planning Recommandé

### Sprint 1 (Semaine 1) - Foundation
- ✅ Flow 1: Data Seeding
- ✅ Flow 2: Assessment Models V2
- ✅ Flow 3: Repository Pattern
- ✅ Flow 7: Database Optimization

### Sprint 2 (Semaine 2) - Core Patterns
- ✅ Flow 4: Strategy Pattern
- ✅ Flow 5: Chain of Responsibility
- ✅ Flow 6: Observer Pattern
- ✅ Flow 27: Unit Tests

### Sprint 3 (Semaine 3) - API Layer Part 1
- ✅ Flow 8: Educational Structure API
- ✅ Flow 9: User Profile API
- ✅ Flow 16: Enhanced Registration
- ✅ Flow 17: Onboarding

### Sprint 4 (Semaine 4) - API Layer Part 2
- ✅ Flow 10: Advanced Exam API V2
- ✅ Flow 11: Exam Workflow API
- ✅ Flow 12: Attempt & Response API
- ✅ Flow 13: Late Code API

### Sprint 5 (Semaine 5) - Access Control
- ✅ Flow 14: Middleware Access Control
- ✅ Flow 15: Frontend Permission Guards
- ✅ Flow 28: Integration Tests (API)

### Sprint 6 (Semaine 6) - Teacher Dashboard
- ✅ Flow 18: Teacher Dashboard UI
- ✅ Flow 19: Advanced Exam Creator (2-3 jours)
- ✅ Flow 20: Exam Management Interface

### Sprint 7 (Semaine 7) - Teacher Dashboard (suite)
- ✅ Flow 21: Results & Analytics Dashboard

### Sprint 8 (Semaine 8) - Student Dashboard Part 1
- ✅ Flow 22: Student Dashboard UI
- ✅ Flow 23: Advanced Filtering
- ✅ Flow 24: Exam Taking Interface (complexe, 3-4 jours)

### Sprint 9 (Semaine 9) - Student Dashboard Part 2
- ✅ Flow 25: Results & Review
- ✅ Flow 26: History & Analytics

### Sprint 10 (Semaine 10) - Migration & Polish
- ✅ Flow 29: Data Migration V1 → V2
- ✅ Testing complet (E2E)
- ✅ Bug fixes

### Post-MVP (Optionnel)
- Flow 30: Gamification System
- Flow 31: Learning Modes
- Flow 32: Admin Dashboards

---

## 🎯 Prochaine Étape

---

## 📝 Template pour les Flows Suivants

**Chaque flow (Flow 2-32) suit cette même structure détaillée que Flow 1 :**

### Structure Standard d'un Flow

```markdown
#### **Flow X: [Nom du Flow]**
**Dépendances:** [Liste des flows requis]
**Durée estimée:** [Heures]
**Responsable:** [À assigner]
**Status:** ⏳ À faire | 🚧 En cours | ✅ Terminé

---

##### 📝 Description
[Explication de ce que fait le flow]

##### 📦 Fichiers à Créer
- [ ] Liste exhaustive des fichiers

##### 🧪 Tests à Écrire
**Unit Tests:**
- [ ] Liste des fichiers de tests

**Integration Tests:**
- [ ] Liste des tests d'intégration

##### 📚 Documentation à Écrire
- [ ] README.md
- [ ] JSDoc sur les fonctions
- [ ] Exemples d'usage

##### ✅ Checklist de Validation
**Code:**
- [ ] TypeScript compile
- [ ] ESLint passe
- [ ] Gestion d'erreurs

**Tests:**
- [ ] Tests passent
- [ ] Coverage ≥ 80%

**Documentation:**
- [ ] README complet
- [ ] JSDoc complet

**Intégration:**
- [ ] V2_ROADMAP.md mis à jour
- [ ] Commit créé
- [ ] Branch créée

##### 🎯 Résultat Attendu
[Description du résultat final]

##### 🚀 Prêt à Démarrer ?
[Checklist finale à cocher dans V2_ROADMAP.md]
```

---

## 🎬 Démarrage du Projet

### Processus de Travail Recommandé

**Pour chaque flow :**

1. **📖 Lire la description complète** du flow dans ce document
2. **🎯 Créer la branche** : `feature/flow-X-nom-du-flow`
3. **📝 Créer les fichiers** selon la checklist
4. **🧪 Écrire les tests** en même temps que le code (TDD recommandé)
5. **📚 Documenter** chaque fonction avec JSDoc
6. **✅ Valider** avec la checklist du flow
7. **🔄 Commit** : `feat: implement flow X - [nom]`
8. **✔️ Cocher** dans V2_ROADMAP.md
9. **➡️ Passer** au flow suivant

---

## 🚀 Prochaine Étape

**START HERE: Flow 1 - Data Seeding**

Voir la checklist détaillée ci-dessus. Une fois Flow 1 terminé (tous les checkboxes cochés ✅), on pourra passer à Flow 2.

**Questions avant de démarrer ?**
- Le format de flow est-il clair ?
- Veux-tu que je détaille aussi Flow 2-3 de la même manière ?
- On commence Flow 1 ensemble ?
