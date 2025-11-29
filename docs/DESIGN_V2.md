# QuizLock V2 - Architecture Optimisée avec Design Patterns

## 1. Présentation de l'Application

### 1.1 Qu'est-ce que QuizLock ?

**QuizLock** est une **plateforme éducative complète d'évaluation en ligne** conçue pour le système éducatif camerounais et africain. Elle permet aux enseignants de créer, gérer et superviser des examens sécurisés, tandis que les étudiants peuvent passer des évaluations dans un environnement contrôlé et adapté à leur niveau.

### 1.2 Problématique Résolue

L'application répond aux défis suivants :
- ✅ **Diversité des systèmes éducatifs** : Support des sous-systèmes francophone, anglophone et bilingue
- ✅ **Parcours académiques variés** : Du collège (6ème) au Master (M2)
- ✅ **Spécialisations multiples** : Filières, séries, spécialités selon le niveau
- ✅ **Évaluation sécurisée** : Anti-triche, contrôle d'accès, monitoring en temps réel
- ✅ **Gestion pédagogique avancée** : Rôles multiples (enseignants, inspecteurs, directeurs)
- ✅ **Personnalisation** : Adaptation selon le profil cognitif et le type d'apprenant

### 1.3 Fonctionnalités Principales

#### Pour les Apprenants (Étudiants)
1. **Accès aux Examens Personnalisés**
   - Filtrage par sous-système (Francophone/Anglophone/Bilingue)
   - Filtrage par niveau d'études (Collège → Lycée → Licence → Master)
   - Filtrage par filière/série/spécialité
   - Filtrage par matière/discipline/UE
   - Filtrage par compétence ciblée (Numérique, Entrepreneuriale, etc.)

2. **Passage d'Examens Sécurisés**
   - Interface anti-triche (plein écran, détection de changement d'onglet)
   - Timer avec compte à rebours
   - Sauvegarde automatique des réponses
   - Possibilité de reprendre un examen interrompu (via token de reprise)
   - Résultats immédiats ou différés selon configuration

3. **Suivi de Progression**
   - Historique des examens passés
   - Statistiques de performance (moyenne, taux de réussite)
   - Identification des matières fortes/faibles
   - Système de gamification (XP, badges, streaks)

4. **Modes d'Apprentissage**
   - Auto-évaluation (révision personnelle)
   - Mode compétition (classement entre étudiants)
   - Mode examen (simulation d'examen officiel)
   - Challenge de classe (compétition par groupe)

#### Pour les Enseignants
1. **Création d'Examens**
   - Éditeur de questions (QCM, Vrai/Faux, Questions ouvertes, Cas pratiques)
   - Ajout d'images aux questions
   - Configuration de la pondération (points par question)
   - Définition de la durée et des dates d'accès
   - Choix du mode de fermeture (Strict ou Permissif avec codes d'accès tardif)

2. **Classification Pédagogique**
   - Association à un ou plusieurs niveaux d'études
   - Association à une matière/discipline
   - Association à une unité d'apprentissage (chapitre/module)
   - Ciblage de compétences spécifiques
   - Définition de l'objectif pédagogique (Évaluer, Réviser, Entraîner, etc.)

3. **Gestion et Monitoring**
   - Vue en temps réel des tentatives en cours
   - Statistiques détaillées (taux de réussite, score moyen, temps moyen)
   - Génération de codes d'accès tardif pour étudiants retardataires
   - Export de résultats pour analyse

4. **Workflow de Validation**
   - Brouillon → En attente de validation → Validé → Publié
   - Possibilité de versionner les examens
   - Archivage des examens obsolètes

#### Pour les Administrateurs Pédagogiques
1. **Supervision Multi-Niveaux**
   - Inspecteurs académiques : Supervision par matière et niveau
   - Préfets des études : Supervision par établissement
   - Principaux/Directeurs : Vue globale de leur établissement
   - DG ISIMMA/Recteurs : Vue globale du système

2. **Contrôle d'Accès Granulaire**
   - Accès global (DG, Recteur)
   - Accès local (établissement spécifique)
   - Accès par matière (enseignants spécialisés)
   - Accès par niveau (enseignants de collège, lycée, etc.)
   - Accès par filière (enseignants de séries spécifiques)

3. **Reporting Avancé**
   - Vue classe (pour enseignants)
   - Vue filière (pour coordinateurs)
   - Vue établissement (pour directeurs)
   - Vue globale (pour direction générale)

### 1.4 Architecture Technique

L'application est construite avec une architecture moderne et scalable :
- **Frontend** : Next.js 14 (App Router), React, Tailwind CSS
- **Backend** : Next.js API Routes, NextAuth.js
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : NextAuth.js avec JWT
- **Sécurité** : Middleware de contrôle d'accès, validation Zod

### 1.5 Cas d'Usage Concrets

**Exemple 1 : Étudiant en Terminale C**
- Se connecte à la plateforme
- Voit uniquement les examens pour : Sous-système Francophone → Lycée → Terminale C → Série C
- Peut filtrer par matière (Mathématiques, Physique-Chimie, SVT, etc.)
- Passe un examen de Mathématiques sur le chapitre "Fonctions logarithmiques"
- Reçoit son score immédiatement et des recommandations de révision

**Exemple 2 : Enseignant de Physique-Chimie**
- Crée un examen pour les classes de Première C et Première D
- Configure l'examen : 1h30, 20 questions, mode strict
- Publie l'examen pour la date du 15 janvier 2025
- Monitore en temps réel les tentatives pendant l'examen
- Génère un code d'accès tardif pour un étudiant en retard justifié
- Analyse les statistiques : taux de réussite 78%, score moyen 14/20

**Exemple 3 : Inspecteur Académique**
- Supervise tous les examens de Mathématiques du département
- Valide les examens créés par les enseignants avant publication
- Consulte les statistiques globales par établissement
- Identifie les établissements en difficulté pour intervention

---

## 2. Vue d'Ensemble de l'Architecture

Cette modélisation utilise plusieurs **design patterns** pour garantir :
- **Scalabilité** : Support de millions d'utilisateurs et examens
- **Maintenabilité** : Code modulaire et extensible
- **Performance** : Requêtes optimisées et cache
- **Sécurité** : Contrôle d'accès robuste

### Design Patterns Utilisés
1. **Strategy Pattern** : Gestion des différents types d'évaluation
2. **Factory Pattern** : Création de profils utilisateurs
3. **Repository Pattern** : Abstraction de l'accès aux données
4. **Decorator Pattern** : Enrichissement des examens avec métadonnées
5. **Observer Pattern** : Notifications et événements
6. **Chain of Responsibility** : Validation des accès multi-niveaux
7. **Composite Pattern** : Hiérarchie éducative (System → Level → Field → Subject)

---

## 2. Modèles de Données Optimisés

### 2.1 Structure Éducative (Composite Pattern)

#### `SubSystem` (Enum)
```typescript
enum SubSystem {
  FRANCOPHONE = 'FRANCOPHONE',
  ANGLOPHONE = 'ANGLOPHONE',
  BILINGUAL = 'BILINGUAL'
}
```

#### `Cycle` (Enum)
```typescript
enum Cycle {
  COLLEGE = 'COLLEGE',      // 6ème → 3ème
  LYCEE = 'LYCEE',          // 2nde → Tle
  LICENCE = 'LICENCE',      // L1 → L3
  MASTER = 'MASTER'         // M1 → M2
}
```

---

#### `EducationLevel` (Niveau d'Études)
```typescript
{
  _id: ObjectId,
  name: String,              // "6ème", "Terminale C", "Master 1"
  code: String,              // "6EME", "TLE_C", "M1" (unique, indexed)
  cycle: Cycle,              // COLLEGE, LYCEE, LICENCE, MASTER
  subSystem: SubSystem,      // FRANCOPHONE, ANGLOPHONE, BILINGUAL
  order: Number,             // Pour le tri (1-12, indexed)
  
  // Métadonnées
  isActive: Boolean,         // Permet de désactiver un niveau
  metadata: {
    displayName: {
      fr: String,
      en: String
    },
    description: String
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { code: 1 } (unique)
Index: { subSystem: 1, cycle: 1, order: 1 }
```

**Pattern Composite** : `EducationLevel` est un composant de base de la hiérarchie éducative.

---

#### `Field` (Filière/Série/Groupe de Compétences)
```typescript
{
  _id: ObjectId,
  name: String,              
  code: String,              // unique, indexed
  category: FieldCategory,   
  cycle: Cycle,              
  subSystem: SubSystem,
  
  // Relations (dénormalisées pour performance)
  applicableLevels: [ObjectId],  // Ref: EducationLevel
  
  // Hiérarchie (Composite Pattern)
  parentField: ObjectId,     // Ref: Field (pour sous-spécialisations)
  childFields: [ObjectId],   // Ref: Field
  
  // Métadonnées
  isActive: Boolean,
  metadata: {
    displayName: {
      fr: String,
      en: String
    },
    description: String,
    icon: String,
    color: String            // Pour UI
  },
  
  // Cache de performance
  _cachedSubjectCount: Number,  // Nombre de matières
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { code: 1 } (unique)
Index: { subSystem: 1, cycle: 1 }
Index: { applicableLevels: 1 }
```

**Enum `FieldCategory`** :
```typescript
enum FieldCategory {
  COMPETENCE_GROUP = 'COMPETENCE_GROUP',  // Collège
  SERIE = 'SERIE',                        // Lycée
  SPECIALITY = 'SPECIALITY'               // Supérieur
}
```

---

#### `Subject` (Matière/Discipline/UE)
```typescript
{
  _id: ObjectId,
  name: String,              
  code: String,              // unique, indexed
  subSystem: SubSystem,
  
  // Relations
  applicableLevels: [ObjectId],      // Ref: EducationLevel
  applicableFields: [ObjectId],      // Ref: Field
  
  // Hiérarchie (Composite Pattern)
  parentSubject: ObjectId,   // Pour matières composées (ex: "Sciences" → "Physique")
  
  // Classification
  isTransversal: Boolean,    
  subjectType: SubjectType,  
  
  // Métadonnées
  isActive: Boolean,
  metadata: {
    displayName: {
      fr: String,
      en: String
    },
    description: String,
    icon: String,
    color: String,
    coefficient: Number      // Importance de la matière
  },
  
  // Cache de performance
  _cachedExamCount: Number,
  _cachedLearningUnitCount: Number,
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { code: 1 } (unique)
Index: { subSystem: 1, subjectType: 1 }
Index: { applicableLevels: 1 }
Index: { applicableFields: 1 }
Index: { isTransversal: 1, isActive: 1 }
```

**Enum `SubjectType`** :
```typescript
enum SubjectType {
  DISCIPLINE = 'DISCIPLINE',  // Collège/Lycée
  UE = 'UE'                   // Enseignement Supérieur
}
```

---

#### `LearningUnit` (Unité d'Apprentissage)
```typescript
{
  _id: ObjectId,
  subject: ObjectId,         // Ref: Subject (indexed)
  type: UnitType,            
  title: String,             
  description: String,
  order: Number,             // Ordre dans la matière
  
  // Hiérarchie (Composite Pattern)
  parentUnit: ObjectId,      // Pour sous-chapitres
  
  // Contenu pédagogique
  content: {
    objectives: [String],    // Objectifs d'apprentissage
    prerequisites: [ObjectId], // Ref: LearningUnit
    duration: Number,        // Durée estimée en heures
    difficulty: DifficultyLevel
  },
  
  // Métadonnées
  isActive: Boolean,
  metadata: {
    tags: [String],
    resources: [{
      type: String,          // "video", "pdf", "link"
      url: String,
      title: String
    }]
  },
  
  // Cache
  _cachedExamCount: Number,
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { subject: 1, order: 1 }
Index: { subject: 1, isActive: 1 }
```

**Enums** :
```typescript
enum UnitType {
  CHAPTER = 'CHAPTER',
  MODULE = 'MODULE',
  COURSE = 'COURSE'
}

enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}
```

---

#### `Competency` (Compétence)
```typescript
{
  _id: ObjectId,
  name: String,              
  code: String,              // unique, indexed
  type: CompetencyType,
  description: String,
  
  // Relations
  relatedSubjects: [ObjectId], // Ref: Subject
  
  // Évaluation
  assessmentCriteria: [{
    criterion: String,
    weight: Number           // Pondération (0-1)
  }],
  
  // Métadonnées
  isActive: Boolean,
  metadata: {
    displayName: {
      fr: String,
      en: String
    },
    icon: String,
    category: String         // "21st Century Skills", "Technical", etc.
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { code: 1 } (unique)
Index: { type: 1, isActive: 1 }
```

**Enum `CompetencyType`** :
```typescript
enum CompetencyType {
  DIGITAL = 'DIGITAL',
  ENTREPRENEURIAL = 'ENTREPRENEURIAL',
  SOFT_SKILL = 'SOFT_SKILL',
  PROBLEM_SOLVING = 'PROBLEM_SOLVING',
  LOGIC_REASONING = 'LOGIC_REASONING'
}
```

---

### 2.2 Modèles Utilisateurs (Factory Pattern)

#### `User` (Utilisateur de Base)
```typescript
{
  _id: ObjectId,
  name: String,
  email: String,             // unique, indexed
  password: String,          // hashed
  role: UserRole,            // indexed
  subSystem: SubSystem,      // indexed
  institution: String,       
  
  // Sécurité
  emailVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockedUntil: Date,
  
  // Préférences
  preferences: {
    language: String,        // "fr", "en"
    timezone: String,
    notifications: {
      email: Boolean,
      push: Boolean
    }
  },
  
  // Métadonnées
  metadata: {
    avatar: String,
    phone: String,
    address: String
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { email: 1 } (unique)
Index: { role: 1, isActive: 1 }
Index: { subSystem: 1, institution: 1 }
```

**Enum `UserRole`** :
```typescript
enum UserRole {
  // Apprenants
  STUDENT = 'STUDENT',
  
  // Pédagogiques
  TEACHER = 'TEACHER',
  INSPECTOR = 'INSPECTOR',
  SURVEILLANT = 'SURVEILLANT',
  PREFET = 'PREFET',
  PRINCIPAL = 'PRINCIPAL',
  DG_ISIMMA = 'DG_ISIMMA',
  RECTOR = 'RECTOR',
  
  // Technique
  DG_M4M = 'DG_M4M',
  TECH_SUPPORT = 'TECH_SUPPORT'
}
```

---

#### `LearnerProfile` (Factory Pattern)
```typescript
{
  _id: ObjectId,
  user: ObjectId,            // Ref: User (unique, indexed)
  
  // Parcours académique
  currentLevel: ObjectId,    // Ref: EducationLevel (indexed)
  currentField: ObjectId,    // Ref: Field (indexed)
  enrollmentDate: Date,
  expectedGraduationDate: Date,
  
  // Profil cognitif et pédagogique
  cognitiveProfile: CognitiveProfile,
  learnerType: LearnerType,
  
  // Abonnement
  subscriptionStatus: SubscriptionStatus,
  subscriptionExpiry: Date,
  
  // Préférences d'apprentissage
  preferredLearningMode: LearningMode,
  
  // Statistiques (dénormalisées pour performance)
  stats: {
    totalExamsTaken: Number,
    averageScore: Number,
    totalStudyTime: Number,  // en minutes
    strongSubjects: [ObjectId], // Ref: Subject
    weakSubjects: [ObjectId],
    lastActivityDate: Date
  },
  
  // Gamification
  gamification: {
    level: Number,
    xp: Number,
    badges: [{
      badgeId: String,
      earnedAt: Date
    }],
    streak: Number           // Jours consécutifs d'activité
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { user: 1 } (unique)
Index: { currentLevel: 1, currentField: 1 }
Index: { subscriptionStatus: 1 }
```

**Enums** :
```typescript
enum CognitiveProfile {
  VISUAL = 'VISUAL',
  AUDITORY = 'AUDITORY',
  LOGIC_MATH = 'LOGIC_MATH',
  LITERARY = 'LITERARY'
}

enum LearnerType {
  EXAM_PREP = 'EXAM_PREP',
  REMEDIAL = 'REMEDIAL',
  ADVANCED = 'ADVANCED',
  STRUGGLING = 'STRUGGLING'
}

enum SubscriptionStatus {
  FREEMIUM = 'FREEMIUM',
  PREMIUM = 'PREMIUM',
  INSTITUTION_PREMIUM = 'INSTITUTION_PREMIUM',
  EDUCATOR_ACCESS = 'EDUCATOR_ACCESS',
  DIRECTION_ACCESS = 'DIRECTION_ACCESS'
}

enum LearningMode {
  AUTO_EVAL = 'AUTO_EVAL',
  COMPETITION = 'COMPETITION',
  EXAM = 'EXAM',
  CLASS_CHALLENGE = 'CLASS_CHALLENGE'
}
```

---

#### `PedagogicalProfile` (Factory Pattern)
```typescript
{
  _id: ObjectId,
  user: ObjectId,            // Ref: User (unique, indexed)
  
  // Enseignement
  teachingSubjects: [ObjectId],      // Ref: Subject (indexed)
  interventionLevels: [ObjectId],    // Ref: EducationLevel
  interventionFields: [ObjectId],    // Ref: Field
  
  // Rôle et contributions
  contributionTypes: [ContributionType],
  
  // Périmètre d'accès (Chain of Responsibility Pattern)
  accessScope: AccessScope,
  scopeDetails: {
    specificInstitution: String,
    specificSubjects: [ObjectId],
    specificLevels: [ObjectId],
    specificFields: [ObjectId]
  },
  
  // Reporting
  reportingAccess: ReportingAccess,
  
  // Statistiques
  stats: {
    totalExamsCreated: Number,
    totalExamsValidated: Number,
    totalStudentsSupervised: Number,
    averageStudentScore: Number,
    lastActivityDate: Date
  },
  
  // Certifications et qualifications
  qualifications: [{
    title: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { user: 1 } (unique)
Index: { teachingSubjects: 1 }
Index: { accessScope: 1 }
```

**Enums** :
```typescript
enum ContributionType {
  CREATOR = 'CREATOR',
  VALIDATOR = 'VALIDATOR',
  CORRECTOR = 'CORRECTOR',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR'
}

enum AccessScope {
  GLOBAL = 'GLOBAL',
  LOCAL = 'LOCAL',
  SUBJECT = 'SUBJECT',
  LEVEL = 'LEVEL',
  FIELD = 'FIELD'
}

enum ReportingAccess {
  CLASS = 'CLASS',
  FIELD = 'FIELD',
  ESTABLISHMENT = 'ESTABLISHMENT',
  GLOBAL = 'GLOBAL'
}
```

---

### 2.3 Modèles d'Évaluation (Strategy + Decorator Patterns)

#### `Exam` (Version V2 Optimisée)
```typescript
{
  _id: ObjectId,
  title: String,             // indexed (text search)
  description: String,
  
  // Timing
  startTime: Date,           // indexed
  endTime: Date,             // indexed
  duration: Number,          
  closeMode: CloseMode,      
  
  // Classification V2
  subSystem: SubSystem,      // indexed
  targetLevels: [ObjectId],  // Ref: EducationLevel (indexed)
  subject: ObjectId,         // Ref: Subject (indexed)
  learningUnit: ObjectId,    // Ref: LearningUnit
  targetFields: [ObjectId],  // Ref: Field
  targetedCompetencies: [ObjectId], // Ref: Competency
  
  // Pédagogie (Strategy Pattern)
  pedagogicalObjective: PedagogicalObjective,
  evaluationType: EvaluationType,
  learningMode: LearningMode,
  difficultyLevel: DifficultyLevel,
  
  // Créateur
  createdBy: ObjectId,       // Ref: User (indexed)
  
  // Workflow de validation
  status: ExamStatus,
  validatedBy: ObjectId,     // Ref: User
  validatedAt: Date,
  
  // Configuration avancée
  config: {
    shuffleQuestions: Boolean,
    shuffleOptions: Boolean,
    showResultsImmediately: Boolean,
    allowReview: Boolean,
    passingScore: Number,    // Pourcentage minimum
    maxAttempts: Number,
    timeBetweenAttempts: Number, // en heures
    antiCheat: {
      fullscreenRequired: Boolean,
      disableCopyPaste: Boolean,
      trackTabSwitches: Boolean,
      webcamRequired: Boolean
    }
  },
  
  // Statistiques (dénormalisées)
  stats: {
    totalAttempts: Number,
    totalCompletions: Number,
    averageScore: Number,
    averageTime: Number,     // en minutes
    passRate: Number,        // Pourcentage
    lastAttemptDate: Date
  },
  
  // Métadonnées
  isActive: Boolean,
  isPublished: Boolean,
  tags: [String],
  
  // Versioning
  version: Number,
  previousVersions: [ObjectId], // Ref: Exam
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { title: 'text', description: 'text' }
Index: { subSystem: 1, targetLevels: 1, subject: 1 }
Index: { createdBy: 1, isActive: 1 }
Index: { startTime: 1, endTime: 1 }
Index: { status: 1, isPublished: 1 }
```

**Enums** :
```typescript
enum CloseMode {
  STRICT = 'STRICT',
  PERMISSIVE = 'PERMISSIVE'
}

enum PedagogicalObjective {
  EVALUATE = 'EVALUATE',
  REVISE = 'REVISE',
  TRAIN = 'TRAIN',
  PREP_EXAM = 'PREP_EXAM',
  CONTINUOUS_VALIDATION = 'CONTINUOUS_VALIDATION'
}

enum EvaluationType {
  QCM = 'QCM',
  TRUE_FALSE = 'TRUE_FALSE',
  OPEN_QUESTION = 'OPEN_QUESTION',
  CASE_STUDY = 'CASE_STUDY',
  EXAM_SIMULATION = 'EXAM_SIMULATION',
  ADAPTIVE = 'ADAPTIVE'
}

enum ExamStatus {
  DRAFT = 'DRAFT',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  VALIDATED = 'VALIDATED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}
```

---

#### `Question`, `Option`, `Attempt`, `Response`, `LateCode`
Ces modèles sont **optimisés** avec des indexes et des champs de cache.

```typescript
// Question
{
  _id: ObjectId,
  examId: ObjectId,          // indexed
  text: String,
  imageUrl: String,
  points: Number,
  order: Number,             // Pour affichage ordonné
  
  // Métadonnées
  difficulty: DifficultyLevel,
  estimatedTime: Number,     // en secondes
  explanation: String,       // Explication de la réponse
  
  // Statistiques
  stats: {
    totalAnswers: Number,
    correctAnswers: Number,
    successRate: Number
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Index: { examId: 1, order: 1 }

// Option
{
  _id: ObjectId,
  questionId: ObjectId,      // indexed
  text: String,
  isCorrect: Boolean,
  order: Number,
  
  // Statistiques
  stats: {
    timesSelected: Number
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Index: { questionId: 1, order: 1 }

// Attempt (Observer Pattern pour notifications)
{
  _id: ObjectId,
  examId: ObjectId,          // indexed
  userId: ObjectId,          // indexed
  startedAt: Date,
  expiresAt: Date,           // indexed (pour cleanup)
  submittedAt: Date,
  status: AttemptStatus,     // indexed
  score: Number,
  resumeToken: String,       // unique, indexed
  
  // Anti-triche
  antiCheatEvents: [{
    type: String,            // "tab_switch", "copy_attempt", etc.
    timestamp: Date,
    details: Mixed
  }],
  
  // Métadonnées
  deviceInfo: {
    userAgent: String,
    ip: String,
    location: String
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { examId: 1, userId: 1 }
Index: { userId: 1, status: 1 }
Index: { resumeToken: 1 } (unique)
Index: { expiresAt: 1 } (TTL index pour auto-cleanup)

// Response
{
  _id: ObjectId,
  attemptId: ObjectId,       // indexed
  questionId: ObjectId,      // indexed
  selectedOptionId: ObjectId,
  isCorrect: Boolean,
  timeSpent: Number,         // en secondes
  
  createdAt: Date,
  updatedAt: Date
}

// Index: { attemptId: 1, questionId: 1 } (unique compound)

// LateCode
{
  _id: ObjectId,
  code: String,              // unique, indexed
  examId: ObjectId,          // indexed
  usagesRemaining: Number,
  expiresAt: Date,           // indexed (TTL)
  assignedUserId: ObjectId,  // Ref: User
  
  // Tracking
  usedBy: [{
    userId: ObjectId,
    usedAt: Date
  }],
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { code: 1 } (unique)
Index: { examId: 1 }
Index: { expiresAt: 1 } (TTL index)
```

---

## 3. Design Patterns Appliqués

### 3.1 Composite Pattern (Hiérarchie Éducative)
```
SubSystem
  └─ EducationLevel (Cycle)
      └─ Field (Filière/Série)
          ├─ Field (Sous-spécialité)
          └─ Subject (Matière)
              ├─ Subject (Sous-matière)
              └─ LearningUnit (Chapitre)
                  └─ LearningUnit (Sous-chapitre)
```

**Avantage** : Navigation facile dans la hiérarchie, ajout de niveaux sans refonte.

---

### 3.2 Factory Pattern (Création de Profils)
```typescript
class ProfileFactory {
  static createProfile(user: User) {
    if (user.role === 'STUDENT') {
      return new LearnerProfile(user);
    } else {
      return new PedagogicalProfile(user);
    }
  }
}
```

**Avantage** : Centralisation de la logique de création, extensibilité.

---

### 3.3 Strategy Pattern (Types d'Évaluation)
```typescript
interface EvaluationStrategy {
  evaluate(attempt: Attempt): number;
}

class QCMStrategy implements EvaluationStrategy {
  evaluate(attempt: Attempt): number {
    // Logique spécifique QCM
  }
}

class AdaptiveStrategy implements EvaluationStrategy {
  evaluate(attempt: Attempt): number {
    // Logique adaptative (difficulté dynamique)
  }
}
```

**Avantage** : Ajout facile de nouveaux types d'évaluation.

---

### 3.4 Chain of Responsibility (Contrôle d'Accès)
```typescript
abstract class AccessHandler {
  protected next: AccessHandler | null = null;
  
  setNext(handler: AccessHandler): AccessHandler {
    this.next = handler;
    return handler;
  }
  
  abstract handle(user: User, exam: Exam): boolean;
}

class GlobalAccessHandler extends AccessHandler {
  handle(user: User, exam: Exam): boolean {
    if (user.pedagogicalProfile.accessScope === 'GLOBAL') {
      return true;
    }
    return this.next ? this.next.handle(user, exam) : false;
  }
}

class SubjectAccessHandler extends AccessHandler {
  handle(user: User, exam: Exam): boolean {
    if (user.pedagogicalProfile.teachingSubjects.includes(exam.subject)) {
      return true;
    }
    return this.next ? this.next.handle(user, exam) : false;
  }
}

// Usage
const chain = new GlobalAccessHandler();
chain.setNext(new SubjectAccessHandler())
     .setNext(new LevelAccessHandler())
     .setNext(new FieldAccessHandler());

const canAccess = chain.handle(user, exam);
```

**Avantage** : Validation multi-niveaux flexible et extensible.

---

### 3.5 Repository Pattern (Abstraction des Données)
```typescript
interface ExamRepository {
  findById(id: string): Promise<Exam>;
  findByLevelAndSubject(level: string, subject: string): Promise<Exam[]>;
  create(exam: Exam): Promise<Exam>;
  update(id: string, exam: Partial<Exam>): Promise<Exam>;
  delete(id: string): Promise<void>;
}

class MongoExamRepository implements ExamRepository {
  // Implémentation MongoDB
}

class CachedExamRepository implements ExamRepository {
  constructor(private repo: ExamRepository, private cache: Cache) {}
  
  async findById(id: string): Promise<Exam> {
    const cached = await this.cache.get(`exam:${id}`);
    if (cached) return cached;
    
    const exam = await this.repo.findById(id);
    await this.cache.set(`exam:${id}`, exam, 3600);
    return exam;
  }
  
  // ... autres méthodes
}
```

**Avantage** : Changement de base de données facile, ajout de cache transparent.

---

### 3.6 Observer Pattern (Notifications)
```typescript
interface Observer {
  update(event: Event): void;
}

class ExamEventPublisher {
  private observers: Observer[] = [];
  
  subscribe(observer: Observer) {
    this.observers.push(observer);
  }
  
  notify(event: Event) {
    this.observers.forEach(obs => obs.update(event));
  }
}

class EmailNotificationObserver implements Observer {
  update(event: Event) {
    if (event.type === 'EXAM_COMPLETED') {
      // Envoyer email
    }
  }
}

class StatsUpdateObserver implements Observer {
  update(event: Event) {
    if (event.type === 'EXAM_COMPLETED') {
      // Mettre à jour statistiques
    }
  }
}
```

**Avantage** : Découplage des événements et des actions, extensibilité.

---

### 3.7 Decorator Pattern (Enrichissement d'Examens)
```typescript
interface ExamComponent {
  getDetails(): ExamDetails;
}

class BaseExam implements ExamComponent {
  constructor(private exam: Exam) {}
  
  getDetails(): ExamDetails {
    return { ...this.exam };
  }
}

class WithStatisticsDecorator implements ExamComponent {
  constructor(private exam: ExamComponent) {}
  
  getDetails(): ExamDetails {
    const details = this.exam.getDetails();
    details.statistics = this.calculateStats();
    return details;
  }
}

class WithRecommendationsDecorator implements ExamComponent {
  constructor(private exam: ExamComponent) {}
  
  getDetails(): ExamDetails {
    const details = this.exam.getDetails();
    details.recommendations = this.getRecommendations();
    return details;
  }
}

// Usage
let exam = new BaseExam(rawExam);
exam = new WithStatisticsDecorator(exam);
exam = new WithRecommendationsDecorator(exam);
const enrichedDetails = exam.getDetails();
```

**Avantage** : Ajout dynamique de fonctionnalités sans modifier le modèle de base.

---

## 4. Optimisations de Performance

### 4.1 Indexation Stratégique
- **Compound Indexes** : `{ subSystem: 1, targetLevels: 1, subject: 1 }`
- **Text Indexes** : Recherche full-text sur titres et descriptions
- **TTL Indexes** : Auto-suppression des tentatives expirées

### 4.2 Dénormalisation Calculée
- Champs `_cached*` pour éviter les agrégations coûteuses
- Statistiques pré-calculées dans `stats` objects

### 4.3 Stratégie de Cache
```typescript
// Cache multi-niveaux
L1: In-Memory Cache (Redis) - 5 min
L2: CDN Cache - 1 heure
L3: Database - Source de vérité
```

### 4.4 Pagination et Lazy Loading
```typescript
// Pagination cursor-based (plus performant que offset)
{
  cursor: lastId,
  limit: 20
}
```

---

## 5. Diagramme PlantUML Complet

```plantuml
@startuml QuizLock_V2_Optimized

!theme plain
skinparam linetype ortho
skinparam nodesep 60
skinparam ranksep 60

' ===== PATTERNS =====
note top of ExamRepository : Repository Pattern
note top of EvaluationStrategy : Strategy Pattern
note top of AccessHandler : Chain of Responsibility
note top of EducationLevel : Composite Pattern
note top of ProfileFactory : Factory Pattern

' ===== EDUCATIONAL STRUCTURE (Composite) =====
package "Structure Éducative (Composite)" {
  
  enum SubSystem {
    FRANCOPHONE
    ANGLOPHONE
    BILINGUAL
  }
  
  enum Cycle {
    COLLEGE
    LYCEE
    LICENCE
    MASTER
  }
  
  class EducationLevel {
    + name: String
    + code: String
    + cycle: Cycle
    + subSystem: SubSystem
    + order: Number
    + isActive: Boolean
    + metadata: Object
  }
  
  enum FieldCategory {
    COMPETENCE_GROUP
    SERIE
    SPECIALITY
  }
  
  class Field {
    + name: String
    + code: String
    + category: FieldCategory
    + cycle: Cycle
    + subSystem: SubSystem
    + applicableLevels: ObjectId[]
    + parentField: ObjectId
    + childFields: ObjectId[]
    + _cachedSubjectCount: Number
  }
  
  enum SubjectType {
    DISCIPLINE
    UE
  }
  
  class Subject {
    + name: String
    + code: String
    + subSystem: SubSystem
    + applicableLevels: ObjectId[]
    + applicableFields: ObjectId[]
    + parentSubject: ObjectId
    + isTransversal: Boolean
    + subjectType: SubjectType
    + _cachedExamCount: Number
  }
  
  enum UnitType {
    CHAPTER
    MODULE
    COURSE
  }
  
  enum DifficultyLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
    EXPERT
  }
  
  class LearningUnit {
    + subject: ObjectId
    + type: UnitType
    + title: String
    + order: Number
    + parentUnit: ObjectId
    + content: Object
    + _cachedExamCount: Number
  }
  
  enum CompetencyType {
    DIGITAL
    ENTREPRENEURIAL
    SOFT_SKILL
    PROBLEM_SOLVING
    LOGIC_REASONING
  }
  
  class Competency {
    + name: String
    + code: String
    + type: CompetencyType
    + relatedSubjects: ObjectId[]
    + assessmentCriteria: Object[]
  }
}

' ===== USERS (Factory) =====
package "Utilisateurs (Factory)" {
  
  enum UserRole {
    STUDENT
    TEACHER
    INSPECTOR
    SURVEILLANT
    PREFET
    PRINCIPAL
    DG_ISIMMA
    RECTOR
    DG_M4M
    TECH_SUPPORT
  }
  
  class User {
    + name: String
    + email: String
    + password: String
    + role: UserRole
    + subSystem: SubSystem
    + institution: String
    + isActive: Boolean
    + preferences: Object
  }
  
  class ProfileFactory {
    + {static} createProfile(user: User): Profile
  }
  
  enum CognitiveProfile {
    VISUAL
    AUDITORY
    LOGIC_MATH
    LITERARY
  }
  
  enum LearnerType {
    EXAM_PREP
    REMEDIAL
    ADVANCED
    STRUGGLING
  }
  
  enum SubscriptionStatus {
    FREEMIUM
    PREMIUM
    INSTITUTION_PREMIUM
    EDUCATOR_ACCESS
    DIRECTION_ACCESS
  }
  
  enum LearningMode {
    AUTO_EVAL
    COMPETITION
    EXAM
    CLASS_CHALLENGE
  }
  
  class LearnerProfile {
    + user: ObjectId
    + currentLevel: ObjectId
    + currentField: ObjectId
    + cognitiveProfile: CognitiveProfile
    + learnerType: LearnerType
    + subscriptionStatus: SubscriptionStatus
    + preferredLearningMode: LearningMode
    + stats: Object
    + gamification: Object
  }
  
  enum ContributionType {
    CREATOR
    VALIDATOR
    CORRECTOR
    MANAGER
    SUPERVISOR
  }
  
  enum AccessScope {
    GLOBAL
    LOCAL
    SUBJECT
    LEVEL
    FIELD
  }
  
  enum ReportingAccess {
    CLASS
    FIELD
    ESTABLISHMENT
    GLOBAL
  }
  
  class PedagogicalProfile {
    + user: ObjectId
    + teachingSubjects: ObjectId[]
    + interventionLevels: ObjectId[]
    + interventionFields: ObjectId[]
    + contributionTypes: ContributionType[]
    + accessScope: AccessScope
    + reportingAccess: ReportingAccess
    + stats: Object
  }
}

' ===== ASSESSMENT (Strategy + Decorator) =====
package "Évaluation (Strategy + Decorator)" {
  
  enum CloseMode {
    STRICT
    PERMISSIVE
  }
  
  enum PedagogicalObjective {
    EVALUATE
    REVISE
    TRAIN
    PREP_EXAM
    CONTINUOUS_VALIDATION
  }
  
  enum EvaluationType {
    QCM
    TRUE_FALSE
    OPEN_QUESTION
    CASE_STUDY
    EXAM_SIMULATION
    ADAPTIVE
  }
  
  enum ExamStatus {
    DRAFT
    PENDING_VALIDATION
    VALIDATED
    PUBLISHED
    ARCHIVED
  }
  
  class Exam {
    + title: String
    + startTime: Date
    + endTime: Date
    + duration: Number
    + closeMode: CloseMode
    + subSystem: SubSystem
    + targetLevels: ObjectId[]
    + subject: ObjectId
    + learningUnit: ObjectId
    + targetFields: ObjectId[]
    + targetedCompetencies: ObjectId[]
    + pedagogicalObjective: PedagogicalObjective
    + evaluationType: EvaluationType
    + difficultyLevel: DifficultyLevel
    + status: ExamStatus
    + config: Object
    + stats: Object
    + version: Number
  }
  
  interface EvaluationStrategy {
    + evaluate(attempt: Attempt): Number
  }
  
  class QCMStrategy {
    + evaluate(attempt: Attempt): Number
  }
  
  class AdaptiveStrategy {
    + evaluate(attempt: Attempt): Number
  }
  
  class Question {
    + examId: ObjectId
    + text: String
    + points: Number
    + order: Number
    + difficulty: DifficultyLevel
    + stats: Object
  }
  
  class Option {
    + questionId: ObjectId
    + text: String
    + isCorrect: Boolean
    + order: Number
    + stats: Object
  }
  
  enum AttemptStatus {
    STARTED
    COMPLETED
  }
  
  class Attempt {
    + examId: ObjectId
    + userId: ObjectId
    + startedAt: Date
    + expiresAt: Date
    + submittedAt: Date
    + status: AttemptStatus
    + score: Number
    + resumeToken: String
    + antiCheatEvents: Object[]
  }
  
  class Response {
    + attemptId: ObjectId
    + questionId: ObjectId
    + selectedOptionId: ObjectId
    + isCorrect: Boolean
    + timeSpent: Number
  }
  
  class LateCode {
    + code: String
    + examId: ObjectId
    + usagesRemaining: Number
    + expiresAt: Date
    + usedBy: Object[]
  }
}

' ===== PATTERNS IMPLEMENTATIONS =====
package "Design Patterns" {
  
  abstract class AccessHandler {
    # next: AccessHandler
    + setNext(handler: AccessHandler): AccessHandler
    + {abstract} handle(user: User, exam: Exam): Boolean
  }
  
  class GlobalAccessHandler {
    + handle(user: User, exam: Exam): Boolean
  }
  
  class SubjectAccessHandler {
    + handle(user: User, exam: Exam): Boolean
  }
  
  interface ExamRepository {
    + findById(id: String): Promise<Exam>
    + create(exam: Exam): Promise<Exam>
  }
  
  class MongoExamRepository {
    + findById(id: String): Promise<Exam>
    + create(exam: Exam): Promise<Exam>
  }
  
  class CachedExamRepository {
    - repo: ExamRepository
    - cache: Cache
    + findById(id: String): Promise<Exam>
  }
  
  interface Observer {
    + update(event: Event): void
  }
  
  class EmailNotificationObserver {
    + update(event: Event): void
  }
  
  class StatsUpdateObserver {
    + update(event: Event): void
  }
}

' ===== RELATIONSHIPS =====

' Educational Structure (Composite)
EducationLevel "*" --> "1" SubSystem
EducationLevel "*" --> "1" Cycle

Field "*" --> "1" SubSystem
Field "*" --> "1" Cycle
Field "*" --> "*" EducationLevel : applicableLevels
Field "0..1" --> "1" Field : parentField
Field "*" --> "*" Field : childFields

Subject "*" --> "1" SubSystem
Subject "*" --> "*" EducationLevel : applicableLevels
Subject "*" --> "*" Field : applicableFields
Subject "0..1" --> "1" Subject : parentSubject

LearningUnit "*" --> "1" Subject
LearningUnit "0..1" --> "1" LearningUnit : parentUnit

Competency "*" --> "*" Subject : relatedSubjects

' Users (Factory)
User "1" --> "1" SubSystem
ProfileFactory ..> LearnerProfile : creates
ProfileFactory ..> PedagogicalProfile : creates

LearnerProfile "1" --> "1" User
LearnerProfile "*" --> "1" EducationLevel : currentLevel
LearnerProfile "*" --> "0..1" Field : currentField

PedagogicalProfile "1" --> "1" User
PedagogicalProfile "*" --> "*" Subject : teachingSubjects
PedagogicalProfile "*" --> "*" EducationLevel : interventionLevels
PedagogicalProfile "*" --> "*" Field : interventionFields

' Assessment (Strategy)
Exam "*" --> "1" SubSystem
Exam "*" --> "*" EducationLevel : targetLevels
Exam "*" --> "1" Subject
Exam "*" --> "0..1" LearningUnit
Exam "*" --> "*" Field : targetFields
Exam "*" --> "*" Competency : targetedCompetencies
Exam "*" --> "1" User : createdBy

EvaluationStrategy <|.. QCMStrategy
EvaluationStrategy <|.. AdaptiveStrategy
Exam ..> EvaluationStrategy : uses

Question "*" --> "1" Exam
Option "*" --> "1" Question

Attempt "*" --> "1" Exam
Attempt "*" --> "1" User

Response "*" --> "1" Attempt
Response "*" --> "1" Question
Response "*" --> "1" Option : selectedOption

LateCode "*" --> "1" Exam

' Patterns
AccessHandler <|-- GlobalAccessHandler
AccessHandler <|-- SubjectAccessHandler

ExamRepository <|.. MongoExamRepository
ExamRepository <|.. CachedExamRepository
CachedExamRepository o--> ExamRepository

Observer <|.. EmailNotificationObserver
Observer <|.. StatsUpdateObserver

@enduml
```

---

## 6. Exemples de Code avec Patterns

### 6.1 Utilisation du Repository Pattern
```typescript
// Service Layer
class ExamService {
  constructor(private examRepo: ExamRepository) {}
  
  async getExamForStudent(examId: string, studentId: string): Promise<Exam> {
    const exam = await this.examRepo.findById(examId);
    const student = await this.userRepo.findById(studentId);
    
    // Chain of Responsibility pour vérifier l'accès
    const accessChain = this.buildAccessChain();
    if (!accessChain.handle(student, exam)) {
      throw new UnauthorizedError();
    }
    
    return exam;
  }
}

// Injection de dépendances
const mongoRepo = new MongoExamRepository();
const cachedRepo = new CachedExamRepository(mongoRepo, redisCache);
const examService = new ExamService(cachedRepo);
```

### 6.2 Utilisation du Strategy Pattern
```typescript
class ExamEvaluator {
  private strategies: Map<EvaluationType, EvaluationStrategy>;
  
  constructor() {
    this.strategies = new Map([
      [EvaluationType.QCM, new QCMStrategy()],
      [EvaluationType.ADAPTIVE, new AdaptiveStrategy()],
      [EvaluationType.CASE_STUDY, new CaseStudyStrategy()]
    ]);
  }
  
  evaluate(exam: Exam, attempt: Attempt): number {
    const strategy = this.strategies.get(exam.evaluationType);
    if (!strategy) throw new Error('Unknown evaluation type');
    
    return strategy.evaluate(attempt);
  }
}
```

### 6.3 Utilisation de l'Observer Pattern
```typescript
const publisher = new ExamEventPublisher();

publisher.subscribe(new EmailNotificationObserver());
publisher.subscribe(new StatsUpdateObserver());
publisher.subscribe(new BadgeAwardObserver());

// Quand un examen est complété
await attemptRepo.complete(attemptId);
publisher.notify({
  type: 'EXAM_COMPLETED',
  data: { attemptId, userId, examId, score }
});
```

---

## 7. Avantages de cette Architecture

✅ **Scalabilité** : Indexes optimisés, cache multi-niveaux, dénormalisation stratégique  
✅ **Maintenabilité** : Patterns reconnus, séparation des responsabilités  
✅ **Extensibilité** : Ajout facile de nouveaux types, niveaux, patterns  
✅ **Performance** : Requêtes optimisées, agrégations pré-calculées  
✅ **Sécurité** : Chain of Responsibility pour contrôle d'accès granulaire  
✅ **Testabilité** : Interfaces et abstractions facilitent les tests unitaires  
✅ **Flexibilité** : Strategy Pattern permet d'ajouter de nouveaux modes d'évaluation sans toucher au code existant
