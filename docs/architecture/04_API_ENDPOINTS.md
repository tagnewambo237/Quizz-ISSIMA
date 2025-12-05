# 04 - API Endpoints

> **Document:** Routes API
> **Version:** 2.0
> **Dernière mise à jour:** Décembre 2024
> **Total endpoints:** ~35

---

## 📚 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Authentication Routes](#authentication-routes)
3. [Educational Structure Routes](#educational-structure-routes)
4. [Exam Management Routes](#exam-management-routes)
5. [Attempt & Response Routes](#attempt--response-routes)
6. [User Profile Routes](#user-profile-routes)
7. [Late Code Routes](#late-code-routes)
8. [Conventions API](#conventions-api)

---

## 🎯 Vue d'ensemble

Les API routes de Xkorin School suivent l'architecture Next.js App Router. Toutes les routes sont dans le dossier `/app/api/`.

### Structure Générale

```
/app/api/
├── auth/                    # NextAuth.js endpoints
├── education-levels/        # Niveaux d'études
├── fields/                  # Filières/Séries
├── subjects/                # Matières
├── learning-units/          # Chapitres/Modules
├── competencies/            # Compétences
├── exams/                   # Gestion examens (v1 & v2)
├── attempts/                # Tentatives
├── late-codes/              # Codes d'accès tardif
├── profiles/                # Profils utilisateurs
├── onboarding/              # Workflow onboarding
└── register/                # Inscription
```

### Conventions de Réponse

**Success (200-201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error (400-500):**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🔐 Authentication Routes

### NextAuth Endpoints

#### `POST/GET /api/auth/[...nextauth]`

**Description:** Gère toute l'authentification via NextAuth.js

**Providers:**
- `credentials` - Email/Password
- `google` - Google OAuth
- `github` - GitHub OAuth

**Endpoints automatiques:**
- `/api/auth/signin` - Connexion
- `/api/auth/signout` - Déconnexion
- `/api/auth/session` - Session actuelle
- `/api/auth/providers` - Providers disponibles
- `/api/auth/callback/[provider]` - OAuth callbacks

**Configuration:**
```typescript
// /app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

---

#### `GET /api/auth/providers-info`

**Description:** Informations détaillées sur les providers OAuth

**Response:**
```json
{
  "success": true,
  "data": {
    "google": {
      "id": "google",
      "name": "Google",
      "type": "oauth",
      "enabled": true
    },
    "github": {
      "id": "github",
      "name": "GitHub",
      "type": "oauth",
      "enabled": true
    }
  }
}
```

---

### Registration

#### `POST /api/register`

**Description:** Créer un nouveau compte utilisateur

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "subSystem": "FRANCOPHONE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "6580...",
    "email": "john@example.com",
    "message": "User created successfully. Please complete onboarding."
  }
}
```

**Validation:**
- Email unique
- Password min 8 caractères
- Name min 2 caractères

**Pattern utilisé:** Factory Pattern pour création User + Profile

---

## 🏫 Educational Structure Routes

### Education Levels

#### `GET /api/education-levels`

**Description:** Liste tous les niveaux d'études

**Query params:**
- `subSystem` - Filtrer par sous-système (FRANCOPHONE, ANGLOPHONE, BILINGUAL)
- `cycle` - Filtrer par cycle (COLLEGE, LYCEE, LICENCE, MASTER)
- `isActive` - Filtrer actifs seulement (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6580...",
      "name": "Terminale C",
      "code": "TLE_C",
      "cycle": "LYCEE",
      "subSystem": "FRANCOPHONE",
      "order": 7,
      "metadata": {
        "displayName": {
          "fr": "Terminale C",
          "en": "Terminal C"
        }
      }
    }
  ],
  "count": 15
}
```

---

#### `POST /api/education-levels`

**Description:** Créer un nouveau niveau (Admin only)

**Auth:** Required, Role: ADMIN/DG

**Body:**
```json
{
  "name": "Première D",
  "code": "1ERE_D",
  "cycle": "LYCEE",
  "subSystem": "FRANCOPHONE",
  "order": 6
}
```

---

#### `GET /api/education-levels/[id]`

**Description:** Détails d'un niveau spécifique

**Response:** Objet EducationLevel complet

---

#### `PUT /api/education-levels/[id]`

**Description:** Modifier un niveau (Admin only)

**Auth:** Required, Role: ADMIN/DG

---

#### `DELETE /api/education-levels/[id]`

**Description:** Soft delete (isActive = false)

**Auth:** Required, Role: ADMIN/DG

---

### Subjects

#### `GET /api/subjects`

**Query params:**
- `subSystem` - Filtrer par sous-système
- `applicableLevels[]` - Filtrer par niveaux (array)
- `applicableFields[]` - Filtrer par filières (array)
- `isTransversal` - Matières transversales uniquement
- `subjectType` - DISCIPLINE ou UE

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6580...",
      "name": "Mathématiques",
      "code": "MATH",
      "subjectType": "DISCIPLINE",
      "applicableLevels": ["6580...", "6581..."],
      "applicableFields": ["6582..."],
      "_cachedExamCount": 45
    }
  ]
}
```

---

#### `POST /api/subjects`

**Description:** Créer une nouvelle matière (Admin/Inspector only)

**Body:**
```json
{
  "name": "Philosophie",
  "code": "PHILO",
  "subSystem": "FRANCOPHONE",
  "applicableLevels": ["6580...", "6581..."],
  "applicableFields": ["6582...", "6583..."],
  "subjectType": "DISCIPLINE",
  "metadata": {
    "coefficient": 3
  }
}
```

---

### Fields (Filières/Séries)

#### `GET /api/fields`

**Query params:**
- `subSystem`
- `cycle`
- `category` - COMPETENCE_GROUP, SERIE, SPECIALITY
- `applicableLevels[]`

---

#### `POST /api/fields`

**Description:** Créer une filière (Admin only)

---

### Learning Units (Chapitres)

#### `GET /api/learning-units`

**Query params:**
- `subject` - Filtrer par matière (required)
- `type` - CHAPTER, MODULE, COURSE
- `difficulty` - BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6580...",
      "subject": "6581...",
      "title": "Fonctions logarithmiques",
      "order": 5,
      "type": "CHAPTER",
      "content": {
        "difficulty": "ADVANCED",
        "duration": 8,
        "objectives": ["..."]
      },
      "_cachedExamCount": 12
    }
  ]
}
```

---

### Competencies

#### `GET /api/competencies`

**Query params:**
- `type` - DIGITAL, ENTREPRENEURIAL, SOFT_SKILL, etc.
- `relatedSubjects[]` - Filtrer par matières

---

## 📝 Exam Management Routes

### Exam CRUD (V2)

#### `GET /api/exams/v2`

**Description:** Liste des examens avec filtres avancés

**Query params:**
- `status` - DRAFT, PENDING_VALIDATION, VALIDATED, PUBLISHED, ARCHIVED
- `targetLevels[]` - Array de niveaux
- `subject` - ID matière
- `learningUnit` - ID chapitre
- `targetFields[]` - Array de filières
- `targetedCompetencies[]` - Array de compétences
- `evaluationType` - QCM, TRUE_FALSE, ADAPTIVE, etc.
- `difficultyLevel` - BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- `createdBy` - ID enseignant
- `isPublished` - Boolean
- `isActive` - Boolean
- `page` - Numéro de page (default: 1)
- `limit` - Items par page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6580...",
      "title": "Examen Mathématiques - Logarithmes",
      "subSystem": "FRANCOPHONE",
      "targetLevels": ["6581..."],
      "subject": "6582...",
      "learningUnit": "6583...",
      "evaluationType": "QCM",
      "difficultyLevel": "ADVANCED",
      "duration": 60,
      "status": "PUBLISHED",
      "stats": {
        "totalAttempts": 45,
        "averageScore": 14.5,
        "passRate": 82.2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**Pattern utilisé:** Repository Pattern via ExamServiceV2

---

#### `POST /api/exams/v2`

**Description:** Créer un nouvel examen

**Auth:** Required, Role: TEACHER, INSPECTOR

**Body:**
```json
{
  "title": "Examen Final - Trigonométrie",
  "description": "Évaluation complète du chapitre",
  "subSystem": "FRANCOPHONE",
  "targetLevels": ["6580..."],
  "subject": "6581...",
  "learningUnit": "6582...",
  "targetFields": ["6583..."],
  "targetedCompetencies": ["6584...", "6585..."],
  "pedagogicalObjective": "EVALUATE",
  "evaluationType": "QCM",
  "learningMode": "EXAM",
  "difficultyLevel": "INTERMEDIATE",
  "startTime": "2025-01-15T08:00:00Z",
  "endTime": "2025-01-15T10:00:00Z",
  "duration": 90,
  "closeMode": "STRICT",
  "config": {
    "shuffleQuestions": true,
    "shuffleOptions": true,
    "showResultsImmediately": true,
    "passingScore": 50,
    "maxAttempts": 1,
    "antiCheat": {
      "fullscreenRequired": true,
      "trackTabSwitches": true,
      "maxTabSwitches": 3
    }
  },
  "questions": [
    {
      "text": "Quelle est la valeur de cos(π/2) ?",
      "points": 2,
      "difficulty": "BEGINNER",
      "options": [
        { "text": "0", "isCorrect": true },
        { "text": "1", "isCorrect": false },
        { "text": "-1", "isCorrect": false }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "examId": "6580...",
    "status": "DRAFT",
    "message": "Exam created successfully"
  }
}
```

**Pattern utilisé:** Observer Pattern (EventPublisher) pour notifier création

---

#### `GET /api/exams/v2/[id]`

**Description:** Détails complets d'un examen

**Query params:**
- `includeQuestions` - Inclure les questions (default: false)
- `includeStats` - Inclure statistiques détaillées (default: true)

**Auth:** Required

**Access Control:** Chain of Responsibility Pattern

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6580...",
    "title": "...",
    "questions": [...],  // Si includeQuestions=true
    "stats": {...}
  }
}
```

---

#### `PUT /api/exams/v2/[id]`

**Description:** Modifier un examen (seulement si DRAFT ou VALIDATED)

**Auth:** Required, Must be creator or have GLOBAL/SUBJECT access

---

#### `DELETE /api/exams/v2/[id]`

**Description:** Soft delete (isActive = false)

**Auth:** Required, Must be creator or ADMIN

---

#### `GET /api/exams/v2/search`

**Description:** Recherche full-text

**Query params:**
- `q` - Texte de recherche (required)
- `subSystem` - Filtrer par sous-système
- `page` - Pagination
- `limit` - Items par page

**Response:** Liste d'examens correspondants avec score de pertinence

---

#### `GET /api/exams/v2/filter`

**Description:** Filtrage avancé (alias de GET /api/exams/v2 avec plus d'options)

---

### Exam Workflow

#### `POST /api/exams/[id]/submit-validation`

**Description:** Soumettre examen pour validation (DRAFT → PENDING_VALIDATION)

**Auth:** Required, Must be creator

**Body:** Optional - notes pour validateur

**Response:**
```json
{
  "success": true,
  "message": "Exam submitted for validation",
  "newStatus": "PENDING_VALIDATION"
}
```

---

#### `POST /api/exams/[id]/validate`

**Description:** Valider un examen (PENDING_VALIDATION → VALIDATED)

**Auth:** Required, Role: INSPECTOR, PRINCIPAL, DG

**Body:**
```json
{
  "approved": true,
  "feedback": "Exam well structured, approved"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exam validated successfully",
  "newStatus": "VALIDATED",
  "validatedBy": "6580...",
  "validatedAt": "2025-01-10T10:00:00Z"
}
```

**Pattern utilisé:** Observer Pattern pour notifier validation

---

#### `POST /api/exams/[id]/publish`

**Description:** Publier un examen (VALIDATED → PUBLISHED)

**Auth:** Required, Must be creator or ADMIN

**Response:**
```json
{
  "success": true,
  "message": "Exam published successfully",
  "newStatus": "PUBLISHED",
  "isPublished": true
}
```

**Side effects:**
- Observer Pattern: Email aux étudiants concernés
- Stats mise à jour

---

#### `POST /api/exams/[id]/archive`

**Description:** Archiver un examen (any status → ARCHIVED)

**Auth:** Required, Must be creator or ADMIN

---

#### `POST /api/exams/[id]/duplicate`

**Description:** Cloner un examen existant

**Auth:** Required

**Response:** Nouvel examen créé avec status DRAFT

---

## 🎯 Attempt & Response Routes

### Start Attempt

#### `POST /api/attempts/start`

**Description:** Démarrer une nouvelle tentative

**Auth:** Required, Role: STUDENT

**Body:**
```json
{
  "examId": "6580...",
  "lateCode": "LATE-A3F8X2Q1"  // Optional
}
```

**Validation:**
- Exam is published and active
- Student matches targetLevels/targetFields
- Within exam time window or has valid lateCode
- maxAttempts not exceeded
- Time between attempts respected

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "6580...",
    "resumeToken": "a1b2c3d4...",
    "exam": {
      "title": "...",
      "duration": 60,
      "questions": [...]  // Sans les bonnes réponses
    },
    "expiresAt": "2025-01-15T10:00:00Z"
  }
}
```

**Pattern utilisé:** Observer Pattern (ATTEMPT_STARTED event)

---

### Answer Question

#### `POST /api/attempts/answer`

**Description:** Enregistrer une réponse

**Auth:** Required

**Body:**
```json
{
  "attemptId": "6580...",
  "questionId": "6581...",
  "selectedOptionId": "6582...",
  "timeSpent": 45,  // seconds
  "isMarkedForReview": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer recorded",
  "responseId": "6583..."
}
```

**Pattern utilisé:** Auto-save toutes les 30s depuis le frontend

---

### Submit Attempt

#### `POST /api/attempts/[id]/submit`

**Description:** Soumettre la tentative complète

**Auth:** Required, Must be attempt owner

**Body:**
```json
{
  "timeSpent": 58  // minutes
}
```

**Process:**
1. Strategy Pattern → Évaluation selon `evaluationType`
2. Decorator Pattern → Application de bonus/pénalités
3. Observer Pattern → Notifications, XP, Stats, Badges
4. Sauvegarde résultats

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 17.5,
    "maxScore": 20,
    "percentage": 87.5,
    "passed": true,
    "feedback": "Excellent travail ! ⚡ Bonus vitesse: +2.5%",
    "details": {
      "correctAnswers": 18,
      "totalQuestions": 20,
      "timeBonus": {
        "applied": true,
        "bonusPoints": 0.5
      },
      "badges": {
        "earned": [
          { "badgeId": "EXCELLENCE", "emoji": "⭐" }
        ]
      }
    }
  }
}
```

---

### Resume Attempt

#### `POST /api/attempts/[id]/resume`

**Description:** Reprendre une tentative interrompue

**Auth:** Required

**Body:**
```json
{
  "resumeToken": "a1b2c3d4..."
}
```

**Validation:**
- resumeToken valide
- Attempt not expired
- Status = STARTED

**Response:** Exam + responses déjà enregistrées

---

### Anti-Cheat Event

#### `POST /api/attempts/[id]/anti-cheat-event`

**Description:** Logger un événement suspect

**Auth:** Required

**Body:**
```json
{
  "type": "tab_switch",
  "details": {
    "timestamp": "2025-01-15T09:15:30Z",
    "windowTitle": "Google Search"
  }
}
```

**Response:**
```json
{
  "success": true,
  "warning": "Tab switch detected (2/3)",
  "suspiciousActivityDetected": false
}
```

---

### Get Attempt Details

#### `GET /api/attempts/[id]`

**Description:** Détails d'une tentative

**Auth:** Required, Must be owner or teacher

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6580...",
    "examId": "6581...",
    "userId": "6582...",
    "status": "COMPLETED",
    "score": 17.5,
    "percentage": 87.5,
    "passed": true,
    "startedAt": "...",
    "submittedAt": "...",
    "timeSpent": 58,
    "responses": [...],
    "antiCheatEvents": [...]
  }
}
```

---

## 👤 User Profile Routes

### Learner Profile

#### `GET /api/profiles/learner`

**Description:** Profil étudiant de l'utilisateur connecté

**Auth:** Required, Role: STUDENT

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6580...",
    "user": "6581...",
    "currentLevel": {...},
    "currentField": {...},
    "stats": {
      "totalExamsTaken": 45,
      "averageScore": 78.5,
      "totalStudyTime": 1250,
      "strongSubjects": [...],
      "weakSubjects": [...]
    },
    "gamification": {
      "level": 12,
      "xp": 1150,
      "badges": [...],
      "streak": 7
    }
  }
}
```

---

#### `PUT /api/profiles/learner`

**Description:** Mettre à jour profil étudiant

**Auth:** Required, Role: STUDENT

**Body:**
```json
{
  "currentLevel": "6580...",
  "currentField": "6581...",
  "cognitiveProfile": "VISUAL",
  "preferredLearningMode": "COMPETITION"
}
```

---

### Pedagogical Profile

#### `GET /api/profiles/pedagogical`

**Description:** Profil pédagogique

**Auth:** Required, Role: TEACHER, INSPECTOR, etc.

---

#### `PUT /api/profiles/pedagogical`

**Description:** Mettre à jour profil pédagogique

---

### Profile Stats

#### `GET /api/profiles/stats`

**Description:** Statistiques agrégées du profil

**Auth:** Required

**Query params:**
- `timeframe` - week, month, year, all

**Response:**
```json
{
  "success": true,
  "data": {
    "examsCompleted": 15,
    "averageScore": 82.5,
    "improvementRate": 5.2,
    "studyTimeThisWeek": 180,
    "currentStreak": 7,
    "subjectPerformance": {
      "MATH": 85.5,
      "PHYSICS": 78.0,
      "FRENCH": 88.2
    }
  }
}
```

---

### Activities

#### `GET /api/profiles/activities`

**Description:** Fil d'activité de l'utilisateur

**Query params:**
- `page`
- `limit`
- `type` - attempt, badge, xp, etc.

---

## 🎫 Late Code Routes

### Generate Late Code

#### `POST /api/late-codes/generate`

**Description:** Générer un code d'accès tardif

**Auth:** Required, Role: TEACHER (must be exam creator)

**Body:**
```json
{
  "examId": "6580...",
  "usagesRemaining": 1,
  "maxUsages": 1,
  "expiresAt": "2025-01-16T10:00:00Z",
  "assignedUserId": "6581...",  // Optional
  "reason": "Retard justifié - problème de transport"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "LATE-A3F8X2Q1",
    "examId": "6580...",
    "expiresAt": "2025-01-16T10:00:00Z",
    "usagesRemaining": 1
  }
}
```

---

### Validate Late Code

#### `POST /api/late-codes/validate`

**Description:** Vérifier si un code est valide

**Auth:** Required, Role: STUDENT

**Body:**
```json
{
  "code": "LATE-A3F8X2Q1",
  "examId": "6580..."
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Late code is valid"
}
```

**Errors:**
- Code not found
- Code expired
- No usages remaining
- Code revoked
- Exam mismatch

---

### List Late Codes

#### `GET /api/late-codes`

**Description:** Liste des codes générés

**Auth:** Required, Role: TEACHER

**Query params:**
- `examId` - Filtrer par examen
- `status` - ACTIVE, USED, EXPIRED, REVOKED

---

## 🎓 Onboarding Route

#### `POST /api/onboarding`

**Description:** Compléter le processus d'onboarding

**Auth:** Required

**Body:**
```json
{
  "role": "STUDENT",
  "profileData": {
    "currentLevel": "6580...",
    "currentField": "6581...",
    "cognitiveProfile": "VISUAL",
    "preferredLearningMode": "AUTO_EVAL"
  }
}
```

**Process:**
1. Update User.role
2. Create appropriate Profile (Factory Pattern)
3. Publish USER_ONBOARDED event (Observer Pattern)

**Response:**
```json
{
  "success": true,
  "message": "Onboarding completed",
  "redirectTo": "/student"
}
```

---

## 📋 Conventions API

### Authentication

Toutes les routes protégées utilisent NextAuth.js session :

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Route logic
}
```

### Error Handling

```typescript
try {
  // Route logic
} catch (error) {
  console.error('Route error:', error);

  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  );
}
```

### Validation

Utilisation de Zod pour validation :

```typescript
import { z } from 'zod';

const CreateExamSchema = z.object({
  title: z.string().min(3).max(200),
  duration: z.number().min(1).max(300),
  targetLevels: z.array(z.string()).min(1)
});

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const data = CreateExamSchema.parse(body);
    // Proceed with validated data
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
}
```

### Pagination

```typescript
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const page = parseInt(searchParams.get('page') || DEFAULT_PAGE);
const limit = Math.min(
  parseInt(searchParams.get('limit') || DEFAULT_LIMIT),
  MAX_LIMIT
);

const skip = (page - 1) * limit;

const exams = await Exam.find(query).skip(skip).limit(limit);
const total = await Exam.countDocuments(query);

return NextResponse.json({
  success: true,
  data: exams,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
});
```

---

## 📝 Prochaines Étapes

Pour comprendre la couche frontend :

1. **[05_FRONTEND_STRUCTURE.md](./05_FRONTEND_STRUCTURE.md)** - Pages et composants React
2. **[06_AUTHENTICATION.md](./06_AUTHENTICATION.md)** - NextAuth configuration détaillée
3. **[07_SERVICES.md](./07_SERVICES.md)** - Services métier qui utilisent ces APIs

---

**Dernière mise à jour:** Décembre 2025
