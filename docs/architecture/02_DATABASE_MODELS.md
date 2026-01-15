# 02 - Modèles de Données MongoDB

> **Document:** Schémas de Base de Données
> **Version:** 2.0
> **Dernière mise à jour:** Janvier 2026
> **Nombre de modèles:** 37

---

## 📚 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Modèles Utilisateurs](#modèles-utilisateurs)
3. [Modèles Éducatifs](#modèles-éducatifs)
4. [Modèles d'Évaluation](#modèles-dévaluation)
5. [Modèles de Géolocalisation](#modèles-de-géolocalisation)
6. [Modèles de Réglementation](#modèles-de-réglementation)
7. [Modèles de Partenariats](#modèles-de-partenariats)
8. [Modèles de Spécialités](#modèles-de-spécialités)
9. [Modèles de Curriculum](#modèles-de-curriculum)
10. [Modèles d'Offre & Formation](#modèles-doffre--formation)
11. [Modèles de Métriques](#modèles-de-métriques)
12. [Modèles de Scoring](#modèles-de-scoring)
13. [Relations entre Modèles](#relations-entre-modèles)
14. [Stratégie d'Indexation](#stratégie-dindexation)
15. [Champs Calculés et Cache](#champs-calculés-et-cache)

---

## 🎯 Vue d'ensemble

Xkorin School utilise **MongoDB** avec **Mongoose 8.10.4** comme ODM. La base de données est organisée en **37 collections** principales regroupées en 11 catégories :

### Catégories de Modèles

| Catégorie | Modèles | Rôle |
|-----------|---------|------|
| **Utilisateurs** | User, LearnerProfile, PedagogicalProfile | Authentification et profils |
| **Éducation** | EducationLevel, Field, Subject, LearningUnit, Competency | Structure hiérarchique |
| **Évaluation** | Exam, Question, Option, Attempt, Response, LateCode | Système d'examen |
| **Géolocalisation** | Country, Region, Department, City | Hiérarchie géographique |
| **Réglementation** | RegulatoryApproval, AcademicTutelle | Approbations et tutelles académiques |
| **Partenariats** | Partner, InstitutionPartner | Partenaires et relations institutionnelles |
| **Spécialités** | Specialty, Skill, SpecialtySkill, CareerOutcome, SpecialtyOutcome | Spécialités, compétences et débouchés |
| **Curriculum** | CurriculumSemester, CurriculumUE | Structure du curriculum par semestre |
| **Offre & Formation** | SchoolProgram | Programmes offerts par les écoles |
| **Métriques** | PerformanceMetric, EmploymentMetric, InfrastructureMetric | Performance, emploi et infrastructure |
| **Scoring** | SchoolScore, SpecialtyScore, SchoolProgramScore | Système de notation "TripAdvisor éducatif" |

### Conventions

**Timestamps:**
- Tous les modèles ont `createdAt` et `updatedAt` (automatique via Mongoose)

**Soft Delete:**
- Les modèles principaux utilisent `isActive: Boolean` plutôt que suppression

**Indexation:**
- Indexes composés pour requêtes fréquentes
- Indexes texte pour recherche full-text
- TTL indexes pour auto-cleanup

**Validation:**
- Validation Mongoose native
- Enums pour contraintes
- Required fields définis
- Custom validators quand nécessaire

---

## 👤 Modèles Utilisateurs

### 1. User

**Fichier:** `/models/User.ts`
**Collection:** `users`
**Rôle:** Entité utilisateur centrale pour l'authentification

#### Schéma Complet

```typescript
{
  // Identité
  _id: ObjectId,                         // Auto-généré
  name: String,                          // Required, min: 2, max: 100
  email: String,                         // Required, unique, lowercase, validated

  // Authentification
  password: String,                      // Optional (null si OAuth), hashed avec bcryptjs
  emailVerified: Boolean,                // Default: false
  googleId: String,                      // Unique si présent, sparse index
  githubId: String,                      // Unique si présent, sparse index

  // Rôle et Organisation
  role: UserRole,                        // Enum, required, indexed
  subSystem: SubSystem,                  // FRANCOPHONE | ANGLOPHONE | BILINGUAL, indexed
  institution: String,                   // Nom de l'établissement (optional)

  // Sécurité
  isActive: Boolean,                     // Default: true, indexed
  loginAttempts: Number,                 // Default: 0, max: 5
  lockedUntil: Date,                     // Null si non verrouillé
  lastLogin: Date,                       // Timestamp dernière connexion

  // Préférences
  preferences: {
    language: String,                    // 'fr' | 'en', default: 'fr'
    timezone: String,                    // Default: 'Africa/Douala'
    notifications: {
      email: Boolean,                    // Default: true
      push: Boolean                      // Default: false
    }
  },

  // Métadonnées
  metadata: {
    avatar: String,                      // URL avatar
    phone: String,                       // Format E.164
    address: String                      // Optional
  },

  // Timestamps automatiques
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

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

enum SubSystem {
  FRANCOPHONE = 'FRANCOPHONE',
  ANGLOPHONE = 'ANGLOPHONE',
  BILINGUAL = 'BILINGUAL'
}
```

#### Indexes

```typescript
// Compound indexes
{ email: 1 }                           // Unique
{ role: 1, isActive: 1 }               // Filtre par rôle actif
{ subSystem: 1, institution: 1 }       // Filtre par établissement
{ googleId: 1 }                        // Unique, sparse
{ githubId: 1 }                        // Unique, sparse
```

#### Méthodes d'Instance

```typescript
// Vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
}

// Incrémenter tentatives de connexion
userSchema.methods.incrementLoginAttempts = function() {
  if (this.lockedUntil && this.lockedUntil < new Date()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockedUntil: 1 }
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };
  const needsLock = this.loginAttempts + 1 >= 5;

  if (needsLock) {
    updates.$set = { lockedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2h lock
  }

  return this.updateOne(updates);
}
```

#### Pre-save Hook

```typescript
// Hash password avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
```

---

### 2. LearnerProfile

**Fichier:** `/models/LearnerProfile.ts`
**Collection:** `learnerprofiles`
**Rôle:** Profil détaillé pour les étudiants

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  user: ObjectId,                        // Ref: 'User', unique, required, indexed

  // Parcours Académique
  currentLevel: ObjectId,                // Ref: 'EducationLevel', required, indexed
  currentField: ObjectId,                // Ref: 'Field', optional, indexed
  enrollmentDate: Date,                  // Date d'inscription
  expectedGraduationDate: Date,          // Date diplôme attendue

  // Profil Cognitif
  cognitiveProfile: CognitiveProfile,    // VISUAL | AUDITORY | LOGIC_MATH | LITERARY
  learnerType: LearnerType,              // EXAM_PREP | REMEDIAL | ADVANCED | STRUGGLING

  // Abonnement
  subscriptionStatus: SubscriptionStatus, // FREEMIUM | PREMIUM | etc., indexed
  subscriptionExpiry: Date,              // Null si freemium

  // Préférences d'Apprentissage
  preferredLearningMode: LearningMode,   // AUTO_EVAL | COMPETITION | EXAM | CLASS_CHALLENGE

  // Statistiques (dénormalisées)
  stats: {
    totalExamsTaken: Number,             // Default: 0
    averageScore: Number,                // Default: 0, Range: 0-100
    totalStudyTime: Number,              // En minutes, default: 0
    strongSubjects: [ObjectId],          // Ref: 'Subject'
    weakSubjects: [ObjectId],            // Ref: 'Subject'
    lastActivityDate: Date               // Timestamp dernière activité
  },

  // Gamification
  gamification: {
    level: Number,                       // Default: 1
    xp: Number,                          // Default: 0
    badges: [{
      badgeId: String,                   // Badge code (ex: 'PERFECT_SCORE')
      earnedAt: Date                     // Timestamp acquisition
    }],
    streak: Number                       // Jours consécutifs, default: 0
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum CognitiveProfile {
  VISUAL = 'VISUAL',                     // Apprenant visuel
  AUDITORY = 'AUDITORY',                 // Apprenant auditif
  LOGIC_MATH = 'LOGIC_MATH',             // Logique/Math dominant
  LITERARY = 'LITERARY'                  // Littéraire
}

enum LearnerType {
  EXAM_PREP = 'EXAM_PREP',               // Préparation examens officiels
  REMEDIAL = 'REMEDIAL',                 // Remise à niveau
  ADVANCED = 'ADVANCED',                 // Approfondissement
  STRUGGLING = 'STRUGGLING'              // En difficulté
}

enum SubscriptionStatus {
  FREEMIUM = 'FREEMIUM',                 // Accès gratuit limité
  PREMIUM = 'PREMIUM',                   // Abonnement payant
  INSTITUTION_PREMIUM = 'INSTITUTION_PREMIUM', // Via établissement
  EDUCATOR_ACCESS = 'EDUCATOR_ACCESS',   // Accès enseignant
  DIRECTION_ACCESS = 'DIRECTION_ACCESS'  // Accès direction
}

enum LearningMode {
  AUTO_EVAL = 'AUTO_EVAL',               // Auto-évaluation (pas de classement)
  COMPETITION = 'COMPETITION',           // Mode compétition
  EXAM = 'EXAM',                         // Mode examen strict
  CLASS_CHALLENGE = 'CLASS_CHALLENGE'    // Défi de classe
}
```

#### Indexes

```typescript
{ user: 1 }                              // Unique
{ currentLevel: 1, currentField: 1 }    // Filtre par parcours
{ subscriptionStatus: 1 }                // Filtre par abonnement
{ 'stats.lastActivityDate': 1 }         // Tri par activité récente
```

#### Virtuals

```typescript
// Niveau gamification basé sur XP
learnerProfileSchema.virtual('gamificationLevel').get(function() {
  return Math.floor(this.gamification.xp / 100) + 1;
});

// Badge count
learnerProfileSchema.virtual('badgeCount').get(function() {
  return this.gamification.badges.length;
});
```

---

### 3. PedagogicalProfile

**Fichier:** `/models/PedagogicalProfile.ts`
**Collection:** `pedagogicalprofiles`
**Rôle:** Profil pour enseignants, inspecteurs, et administrateurs

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  user: ObjectId,                        // Ref: 'User', unique, required, indexed

  // Enseignement
  teachingSubjects: [ObjectId],          // Ref: 'Subject', indexed
  interventionLevels: [ObjectId],        // Ref: 'EducationLevel'
  interventionFields: [ObjectId],        // Ref: 'Field'

  // Rôle et Contributions
  contributionTypes: [ContributionType], // CREATOR | VALIDATOR | CORRECTOR | etc.

  // Périmètre d'Accès (Chain of Responsibility)
  accessScope: AccessScope,              // GLOBAL | LOCAL | SUBJECT | LEVEL | FIELD, indexed
  scopeDetails: {
    specificInstitution: String,         // Si LOCAL scope
    specificSubjects: [ObjectId],        // Si SUBJECT scope
    specificLevels: [ObjectId],          // Si LEVEL scope
    specificFields: [ObjectId]           // Si FIELD scope
  },

  // Reporting
  reportingAccess: ReportingAccess,      // CLASS | FIELD | ESTABLISHMENT | GLOBAL

  // Statistiques (dénormalisées)
  stats: {
    totalExamsCreated: Number,           // Default: 0
    totalExamsValidated: Number,         // Default: 0
    totalStudentsSupervised: Number,     // Default: 0
    averageStudentScore: Number,         // Default: 0, Range: 0-100
    lastActivityDate: Date               // Timestamp dernière activité
  },

  // Certifications et Qualifications
  qualifications: [{
    title: String,                       // Ex: "Inspecteur Pédagogique Mathématiques"
    issuedBy: String,                    // Organisme émetteur
    issuedDate: Date,                    // Date obtention
    expiryDate: Date,                    // Date expiration (optional)
    certificateUrl: String               // URL du certificat (optional)
  }],

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum ContributionType {
  CREATOR = 'CREATOR',                   // Créateur d'examens
  VALIDATOR = 'VALIDATOR',               // Validateur
  CORRECTOR = 'CORRECTOR',               // Correcteur
  MANAGER = 'MANAGER',                   // Gestionnaire
  SUPERVISOR = 'SUPERVISOR'              // Superviseur
}

enum AccessScope {
  GLOBAL = 'GLOBAL',                     // Accès complet (DG, Recteur)
  LOCAL = 'LOCAL',                       // Établissement spécifique
  SUBJECT = 'SUBJECT',                   // Matière(s) spécifique(s)
  LEVEL = 'LEVEL',                       // Niveau(x) spécifique(s)
  FIELD = 'FIELD'                        // Filière(s) spécifique(s)
}

enum ReportingAccess {
  CLASS = 'CLASS',                       // Vue classe uniquement
  FIELD = 'FIELD',                       // Vue filière
  ESTABLISHMENT = 'ESTABLISHMENT',       // Vue établissement
  GLOBAL = 'GLOBAL'                      // Vue globale
}
```

#### Indexes

```typescript
{ user: 1 }                              // Unique
{ teachingSubjects: 1 }                  // Filtre par matière
{ accessScope: 1 }                       // Filtre par scope
{ 'stats.lastActivityDate': 1 }         // Tri par activité
```

---

## 🏫 Modèles Éducatifs

### 4. EducationLevel

**Fichier:** `/models/EducationLevel.ts`
**Collection:** `educationlevels`
**Rôle:** Niveaux d'études (6ème, Tle C, Licence 1, etc.)

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  name: String,                          // Ex: "Terminale C", required, max: 100
  code: String,                          // Ex: "TLE_C", unique, required, uppercase
  cycle: Cycle,                          // COLLEGE | LYCEE | LICENCE | MASTER, indexed
  subSystem: SubSystem,                  // FRANCOPHONE | ANGLOPHONE | BILINGUAL, indexed
  order: Number,                         // Ordre d'affichage (1-12), indexed

  // Métadonnées
  isActive: Boolean,                     // Default: true, indexed
  metadata: {
    displayName: {
      fr: String,                        // Nom en français
      en: String                         // Nom en anglais
    },
    description: String                  // Description détaillée
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum Cycle {
  COLLEGE = 'COLLEGE',                   // 6ème → 3ème
  LYCEE = 'LYCEE',                       // 2nde → Tle
  LICENCE = 'LICENCE',                   // L1 → L3
  MASTER = 'MASTER'                      // M1 → M2
}
```

#### Indexes

```typescript
{ code: 1 }                              // Unique
{ subSystem: 1, cycle: 1, order: 1 }    // Tri par hiérarchie
{ isActive: 1 }                          // Filtre actifs
```

#### Exemples de Données

```typescript
// Francophone
{ name: "6ème", code: "6EME", cycle: "COLLEGE", subSystem: "FRANCOPHONE", order: 1 }
{ name: "Terminale C", code: "TLE_C", cycle: "LYCEE", subSystem: "FRANCOPHONE", order: 7 }
{ name: "Licence 1", code: "L1", cycle: "LICENCE", subSystem: "FRANCOPHONE", order: 8 }

// Anglophone
{ name: "Form 1", code: "FORM_1", cycle: "COLLEGE", subSystem: "ANGLOPHONE", order: 1 }
{ name: "Upper Sixth Science", code: "UPPER_SIXTH_SCI", cycle: "LYCEE", subSystem: "ANGLOPHONE", order: 7 }
```

---

### 5. Field

**Fichier:** `/models/Field.ts`
**Collection:** `fields`
**Rôle:** Filières/Séries/Spécialités (Série C, Arts, Sciences, etc.)

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  name: String,                          // Ex: "Série C", required
  code: String,                          // Ex: "SERIE_C", unique, required, uppercase
  category: FieldCategory,               // COMPETENCE_GROUP | SERIE | SPECIALITY, indexed
  cycle: Cycle,                          // COLLEGE | LYCEE | LICENCE | MASTER, indexed
  subSystem: SubSystem,                  // FRANCOPHONE | ANGLOPHONE | BILINGUAL, indexed

  // Relations (dénormalisées pour performance)
  applicableLevels: [ObjectId],          // Ref: 'EducationLevel', indexed
                                         // Ex: Série C applicable à 1ère C et Tle C

  // Hiérarchie (Composite Pattern)
  parentField: ObjectId,                 // Ref: 'Field' (pour sous-spécialisations)
  childFields: [ObjectId],               // Ref: 'Field'

  // Métadonnées
  isActive: Boolean,                     // Default: true, indexed
  metadata: {
    displayName: {
      fr: String,
      en: String
    },
    description: String,
    icon: String,                        // Icon code (ex: 'science')
    color: String                        // Hex color pour UI (ex: '#3B82F6')
  },

  // Cache de performance
  _cachedSubjectCount: Number,           // Nombre de matières dans cette filière, default: 0

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum FieldCategory {
  COMPETENCE_GROUP = 'COMPETENCE_GROUP', // Collège (groupes de compétences)
  SERIE = 'SERIE',                       // Lycée (séries A, C, D, etc.)
  SPECIALITY = 'SPECIALITY'              // Supérieur (spécialités)
}
```

#### Indexes

```typescript
{ code: 1 }                              // Unique
{ subSystem: 1, cycle: 1 }               // Filtre par système/cycle
{ applicableLevels: 1 }                  // Requêtes par niveau
{ category: 1, isActive: 1 }             // Filtre par catégorie
```

#### Exemples de Données

```typescript
// Francophone - Lycée
{
  name: "Série C",
  code: "SERIE_C",
  category: "SERIE",
  cycle: "LYCEE",
  subSystem: "FRANCOPHONE",
  applicableLevels: [ObjectId("1ERE_C"), ObjectId("TLE_C")],
  metadata: { displayName: { fr: "Série C", en: "C Series" }, color: "#3B82F6" }
}

// Anglophone - Lycée
{
  name: "Science",
  code: "SCIENCE",
  category: "SERIE",
  cycle: "LYCEE",
  subSystem: "ANGLOPHONE",
  applicableLevels: [ObjectId("LOWER_SIXTH_SCI"), ObjectId("UPPER_SIXTH_SCI")]
}
```

---

### 6. Subject

**Fichier:** `/models/Subject.ts`
**Collection:** `subjects`
**Rôle:** Matières/Disciplines/UE (Mathématiques, Physique, etc.)

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  name: String,                          // Ex: "Mathématiques", required
  code: String,                          // Ex: "MATH", unique, required, uppercase
  subSystem: SubSystem,                  // FRANCOPHONE | ANGLOPHONE | BILINGUAL, indexed

  // Relations
  applicableLevels: [ObjectId],          // Ref: 'EducationLevel', indexed
  applicableFields: [ObjectId],          // Ref: 'Field', indexed

  // Hiérarchie (Composite Pattern)
  parentSubject: ObjectId,               // Ref: 'Subject' (ex: "Sciences" → "Physique")

  // Classification
  isTransversal: Boolean,                // Matière transversale (toutes séries), default: false
  subjectType: SubjectType,              // DISCIPLINE (Collège/Lycée) | UE (Supérieur), indexed

  // Métadonnées
  isActive: Boolean,                     // Default: true, indexed
  metadata: {
    displayName: {
      fr: String,
      en: String
    },
    description: String,
    icon: String,                        // Icon code
    color: String,                       // Hex color
    coefficient: Number                  // Importance de la matière (1-5), default: 1
  },

  // Cache de performance
  _cachedExamCount: Number,              // Nombre d'examens, default: 0
  _cachedLearningUnitCount: Number,      // Nombre de chapitres, default: 0

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum SubjectType {
  DISCIPLINE = 'DISCIPLINE',             // Collège/Lycée (Mathématiques, Physique)
  UE = 'UE'                              // Enseignement Supérieur (Unité d'Enseignement)
}
```

#### Indexes

```typescript
{ code: 1 }                              // Unique
{ subSystem: 1, subjectType: 1 }         // Filtre par système/type
{ applicableLevels: 1 }                  // Requêtes par niveau
{ applicableFields: 1 }                  // Requêtes par filière
{ isTransversal: 1, isActive: 1 }        // Matières transversales actives
```

#### Exemples de Données

```typescript
// Matière spécifique à une série
{
  name: "Mathématiques",
  code: "MATH",
  subSystem: "FRANCOPHONE",
  applicableLevels: [ObjectId("TLE_C"), ObjectId("TLE_D")],
  applicableFields: [ObjectId("SERIE_C"), ObjectId("SERIE_D")],
  isTransversal: false,
  subjectType: "DISCIPLINE",
  metadata: { coefficient: 5, color: "#EF4444" }
}

// Matière transversale
{
  name: "Français",
  code: "FRENCH",
  subSystem: "FRANCOPHONE",
  applicableLevels: [...], // Tous les niveaux
  applicableFields: [...], // Toutes les séries
  isTransversal: true,
  subjectType: "DISCIPLINE"
}
```

---

### 7. LearningUnit

**Fichier:** `/models/LearningUnit.ts`
**Collection:** `learningunits`
**Rôle:** Unités d'apprentissage (Chapitres/Modules/Cours)

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  subject: ObjectId,                     // Ref: 'Subject', required, indexed
  type: UnitType,                        // CHAPTER | MODULE | COURSE, indexed
  title: String,                         // Ex: "Fonctions logarithmiques", required
  description: String,                   // Description détaillée
  order: Number,                         // Ordre dans la matière, indexed

  // Hiérarchie (Composite Pattern)
  parentUnit: ObjectId,                  // Ref: 'LearningUnit' (pour sous-chapitres)

  // Contenu Pédagogique
  content: {
    objectives: [String],                // Objectifs d'apprentissage
    prerequisites: [ObjectId],           // Ref: 'LearningUnit' (pré-requis)
    duration: Number,                    // Durée estimée en heures
    difficulty: DifficultyLevel          // BEGINNER | INTERMEDIATE | ADVANCED | EXPERT
  },

  // Métadonnées
  isActive: Boolean,                     // Default: true, indexed
  metadata: {
    tags: [String],                      // Tags pour recherche
    resources: [{
      type: String,                      // 'video' | 'pdf' | 'link' | 'exercise'
      url: String,                       // URL de la ressource
      title: String                      // Titre de la ressource
    }]
  },

  // Cache de performance
  _cachedExamCount: Number,              // Nombre d'examens sur ce chapitre, default: 0

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum UnitType {
  CHAPTER = 'CHAPTER',                   // Chapitre (Collège/Lycée)
  MODULE = 'MODULE',                     // Module (Supérieur)
  COURSE = 'COURSE'                      // Cours complet
}

enum DifficultyLevel {
  BEGINNER = 'BEGINNER',                 // Débutant
  INTERMEDIATE = 'INTERMEDIATE',         // Intermédiaire
  ADVANCED = 'ADVANCED',                 // Avancé
  EXPERT = 'EXPERT'                      // Expert
}
```

#### Indexes

```typescript
{ subject: 1, order: 1 }                 // Tri par ordre dans la matière
{ subject: 1, isActive: 1 }              // Chapitres actifs par matière
{ type: 1 }                              // Filtre par type
```

#### Exemples de Données

```typescript
{
  subject: ObjectId("MATH"),
  type: "CHAPTER",
  title: "Fonctions logarithmiques",
  description: "Étude des propriétés des fonctions logarithmes",
  order: 5,
  content: {
    objectives: [
      "Connaître la définition du logarithme népérien",
      "Résoudre des équations logarithmiques"
    ],
    prerequisites: [ObjectId("FONCTIONS_EXPONENTIELLES")],
    duration: 8,
    difficulty: "ADVANCED"
  },
  metadata: {
    tags: ["logarithme", "fonction", "analyse"],
    resources: [
      { type: "video", url: "https://...", title: "Cours vidéo" },
      { type: "pdf", url: "https://...", title: "Fiche résumé" }
    ]
  }
}
```

---

### 8. Competency

**Fichier:** `/models/Competency.ts`
**Collection:** `competencies`
**Rôle:** Compétences transversales (Numérique, Entrepreneuriale, etc.)

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  name: String,                          // Ex: "Compétence numérique", required
  code: String,                          // Ex: "DIGITAL", unique, required, uppercase
  type: CompetencyType,                  // DIGITAL | ENTREPRENEURIAL | etc., indexed
  description: String,                   // Description détaillée

  // Relations
  relatedSubjects: [ObjectId],           // Ref: 'Subject' (matières liées)

  // Évaluation
  assessmentCriteria: [{
    criterion: String,                   // Critère d'évaluation
    weight: Number                       // Pondération (0-1), total = 1
  }],

  // Métadonnées
  isActive: Boolean,                     // Default: true, indexed
  metadata: {
    displayName: {
      fr: String,
      en: String
    },
    icon: String,                        // Icon code
    category: String                     // Ex: "21st Century Skills", "Technical"
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum CompetencyType {
  DIGITAL = 'DIGITAL',                   // Compétence numérique
  ENTREPRENEURIAL = 'ENTREPRENEURIAL',   // Entrepreneuriat
  SOFT_SKILL = 'SOFT_SKILL',             // Soft skills
  PROBLEM_SOLVING = 'PROBLEM_SOLVING',   // Résolution de problèmes
  LOGIC_REASONING = 'LOGIC_REASONING'    // Raisonnement logique
}
```

#### Indexes

```typescript
{ code: 1 }                              // Unique
{ type: 1, isActive: 1 }                 // Filtre par type
{ relatedSubjects: 1 }                   // Requêtes par matière
```

#### Exemples de Données

```typescript
{
  name: "Compétence numérique",
  code: "DIGITAL",
  type: "DIGITAL",
  description: "Capacité à utiliser les outils numériques de manière efficace et responsable",
  relatedSubjects: [ObjectId("INFORMATIQUE"), ObjectId("MATH")],
  assessmentCriteria: [
    { criterion: "Utilisation des outils bureautiques", weight: 0.3 },
    { criterion: "Recherche d'information en ligne", weight: 0.3 },
    { criterion: "Communication numérique", weight: 0.4 }
  ],
  metadata: {
    displayName: { fr: "Compétence numérique", en: "Digital Competency" },
    icon: "computer",
    category: "21st Century Skills"
  }
}
```

---

## 📝 Modèles d'Évaluation

### 9. Exam

**Fichier:** `/models/Exam.ts`
**Collection:** `exams`
**Rôle:** Configuration complète d'un examen

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  title: String,                         // Required, min: 3, max: 200, indexed (text)
  description: String,                   // Indexed (text)

  // Timing
  startTime: Date,                       // Début de disponibilité, indexed
  endTime: Date,                         // Fin de disponibilité, indexed
  duration: Number,                      // Durée en minutes, required, min: 1
  closeMode: CloseMode,                  // STRICT | PERMISSIVE

  // Classification V2
  subSystem: SubSystem,                  // FRANCOPHONE | ANGLOPHONE | BILINGUAL, indexed
  targetLevels: [ObjectId],              // Ref: 'EducationLevel', required, indexed
  subject: ObjectId,                     // Ref: 'Subject', required, indexed
  learningUnit: ObjectId,                // Ref: 'LearningUnit', optional
  targetFields: [ObjectId],              // Ref: 'Field', optional
  targetedCompetencies: [ObjectId],      // Ref: 'Competency', optional

  // Pédagogie (Strategy Pattern)
  pedagogicalObjective: PedagogicalObjective, // EVALUATE | REVISE | TRAIN | etc.
  evaluationType: EvaluationType,        // QCM | TRUE_FALSE | ADAPTIVE | etc.
  learningMode: LearningMode,            // AUTO_EVAL | COMPETITION | EXAM | etc.
  difficultyLevel: DifficultyLevel,      // BEGINNER | INTERMEDIATE | ADVANCED | EXPERT

  // Créateur
  createdBy: ObjectId,                   // Ref: 'User', required, indexed

  // Workflow de Validation
  status: ExamStatus,                    // DRAFT | PENDING_VALIDATION | etc., indexed
  validatedBy: ObjectId,                 // Ref: 'User'
  validatedAt: Date,

  // Configuration Avancée
  config: {
    shuffleQuestions: Boolean,           // Default: false
    shuffleOptions: Boolean,             // Default: false
    showResultsImmediately: Boolean,     // Default: true
    allowReview: Boolean,                // Default: true
    passingScore: Number,                // Pourcentage minimum (0-100), default: 50
    maxAttempts: Number,                 // Default: 1, null = illimité
    timeBetweenAttempts: Number,         // En heures, default: 0

    antiCheat: {
      fullscreenRequired: Boolean,       // Default: false
      disableCopyPaste: Boolean,         // Default: false
      trackTabSwitches: Boolean,         // Default: false
      webcamRequired: Boolean,           // Default: false
      maxTabSwitches: Number,            // Default: 3
      blockRightClick: Boolean,          // Default: false
      preventScreenshot: Boolean         // Default: false
    }
  },

  // Statistiques (dénormalisées)
  stats: {
    totalAttempts: Number,               // Default: 0
    totalCompletions: Number,            // Default: 0
    averageScore: Number,                // Default: 0
    averageTime: Number,                 // En minutes, default: 0
    passRate: Number,                    // Pourcentage, default: 0
    lastAttemptDate: Date                // Timestamp dernière tentative
  },

  // Métadonnées
  isActive: Boolean,                     // Default: true, indexed
  isPublished: Boolean,                  // Default: false, indexed
  tags: [String],                        // Tags pour recherche

  // Versioning
  version: Number,                       // Default: 1
  previousVersions: [ObjectId],          // Ref: 'Exam' (versions antérieures)

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum CloseMode {
  STRICT = 'STRICT',                     // Fermeture stricte (pas de retard)
  PERMISSIVE = 'PERMISSIVE'              // Codes d'accès tardif autorisés
}

enum PedagogicalObjective {
  EVALUATE = 'EVALUATE',                 // Évaluation sommative
  REVISE = 'REVISE',                     // Révision
  TRAIN = 'TRAIN',                       // Entraînement
  PREP_EXAM = 'PREP_EXAM',               // Préparation examen officiel
  CONTINUOUS_VALIDATION = 'CONTINUOUS_VALIDATION' // Validation continue
}

enum EvaluationType {
  QCM = 'QCM',                           // Questions à choix multiples
  TRUE_FALSE = 'TRUE_FALSE',             // Vrai/Faux
  OPEN_QUESTION = 'OPEN_QUESTION',       // Question ouverte (correction manuelle)
  CASE_STUDY = 'CASE_STUDY',             // Étude de cas
  EXAM_SIMULATION = 'EXAM_SIMULATION',   // Simulation d'examen officiel
  ADAPTIVE = 'ADAPTIVE'                  // Adaptatif (difficulté dynamique)
}

enum ExamStatus {
  DRAFT = 'DRAFT',                       // Brouillon
  PENDING_VALIDATION = 'PENDING_VALIDATION', // En attente validation
  VALIDATED = 'VALIDATED',               // Validé (prêt à publier)
  PUBLISHED = 'PUBLISHED',               // Publié (disponible étudiants)
  ARCHIVED = 'ARCHIVED'                  // Archivé
}
```

#### Indexes

```typescript
// Text search
{ title: 'text', description: 'text' }   // Full-text search

// Filtres principaux
{ subSystem: 1, targetLevels: 1, subject: 1 } // Compound index
{ createdBy: 1, isActive: 1 }            // Examens par créateur
{ status: 1, isPublished: 1 }            // Workflow
{ startTime: 1, endTime: 1 }             // Disponibilité
{ 'stats.lastAttemptDate': 1 }          // Tri par activité
```

#### Virtuals

```typescript
// Vérifier si l'examen est disponible
examSchema.virtual('isAvailable').get(function() {
  const now = new Date();
  return this.isPublished &&
         this.isActive &&
         now >= this.startTime &&
         now <= this.endTime;
});

// Calculer taux de réussite
examSchema.virtual('successRate').get(function() {
  if (this.stats.totalCompletions === 0) return 0;
  return (this.stats.passRate / this.stats.totalCompletions) * 100;
});
```

---

### 10. Question

**Fichier:** `/models/Question.ts`
**Collection:** `questions`
**Rôle:** Questions individuelles d'un examen

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  examId: ObjectId,                      // Ref: 'Exam', required, indexed
  text: String,                          // Texte de la question, required, max: 1000
  imageUrl: String,                      // URL image (optional)
  audioUrl: String,                      // URL audio (optional)
  points: Number,                        // Points attribués, required, min: 1
  order: Number,                         // Ordre d'affichage, required, indexed

  // Métadonnées Pédagogiques
  difficulty: DifficultyLevel,           // BEGINNER | INTERMEDIATE | ADVANCED | EXPERT
  estimatedTime: Number,                 // Temps estimé en secondes
  explanation: String,                   // Explication de la réponse correcte
  hints: [String],                       // Indices (max 3)
  tags: [String],                        // Tags pour classification

  // Statistiques (dénormalisées)
  stats: {
    timesAsked: Number,                  // Nombre de fois posée, default: 0
    timesCorrect: Number,                // Nombre de bonnes réponses, default: 0
    timesIncorrect: Number,              // Nombre de mauvaises réponses, default: 0
    successRate: Number                  // Taux de réussite (%), default: 0
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes

```typescript
{ examId: 1, order: 1 }                  // Tri par ordre dans l'examen
{ tags: 1 }                              // Recherche par tags
{ difficulty: 1 }                        // Filtre par difficulté
```

#### Virtuals

```typescript
// Calculer taux de réussite
questionSchema.virtual('calculatedSuccessRate').get(function() {
  if (this.stats.timesAsked === 0) return 0;
  return (this.stats.timesCorrect / this.stats.timesAsked) * 100;
});
```

---

### 11. Option

**Fichier:** `/models/Option.ts`
**Collection:** `options`
**Rôle:** Options de réponse pour questions QCM

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  questionId: ObjectId,                  // Ref: 'Question', required, indexed
  text: String,                          // Texte de l'option, required, max: 500
  imageUrl: String,                      // URL image (optional)
  isCorrect: Boolean,                    // Est-ce la bonne réponse? required
  order: Number,                         // Ordre d'affichage, required, indexed

  // Métadonnées Pédagogiques
  explanation: String,                   // Pourquoi c'est correct/incorrect

  // Statistiques (dénormalisées)
  stats: {
    timesSelected: Number,               // Nombre de fois sélectionnée, default: 0
    selectionRate: Number                // Taux de sélection (%), default: 0
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes

```typescript
{ questionId: 1, order: 1 }              // Tri par ordre dans la question
{ questionId: 1, isCorrect: 1 }          // Trouver la bonne réponse rapidement
```

---

### 12. Attempt

**Fichier:** `/models/Attempt.ts`
**Collection:** `attempts`
**Rôle:** Tentative d'examen par un étudiant

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  examId: ObjectId,                      // Ref: 'Exam', required, indexed
  userId: ObjectId,                      // Ref: 'User', required, indexed
  startedAt: Date,                       // Timestamp début, required
  expiresAt: Date,                       // Timestamp expiration (startedAt + duration), indexed
  submittedAt: Date,                     // Timestamp soumission
  pausedAt: Date,                        // Timestamp mise en pause (optional)

  // Status
  status: AttemptStatus,                 // STARTED | COMPLETED | EXPIRED | ABANDONED, indexed

  // Résultats
  score: Number,                         // Score obtenu (0-maxScore)
  maxScore: Number,                      // Score maximum possible
  percentage: Number,                    // Pourcentage (0-100)
  passed: Boolean,                       // A-t-il réussi?

  // Sécurité
  resumeToken: String,                   // Token unique pour reprise, unique, indexed

  // Anti-triche
  antiCheatEvents: [{
    type: String,                        // 'tab_switch' | 'copy_attempt' | 'fullscreen_exit' | etc.
    timestamp: Date,                     // Quand l'événement s'est produit
    details: Mixed                       // Détails supplémentaires
  }],
  tabSwitchCount: Number,                // Compteur de changements d'onglet, default: 0
  suspiciousActivityDetected: Boolean,   // Flag activité suspecte, default: false

  // Time Tracking
  timeSpent: Number,                     // Temps passé en minutes
  timeRemaining: Number,                 // Temps restant en minutes

  // Métadonnées
  ipAddress: String,                     // IP de l'étudiant
  userAgent: String,                     // User agent (browser info)
  deviceInfo: {
    platform: String,                    // 'Windows' | 'macOS' | 'Android' | etc.
    browser: String,                     // 'Chrome' | 'Firefox' | etc.
    screenResolution: String             // '1920x1080'
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum AttemptStatus {
  STARTED = 'STARTED',                   // En cours
  COMPLETED = 'COMPLETED',               // Terminé et soumis
  EXPIRED = 'EXPIRED',                   // Expiré (temps écoulé)
  ABANDONED = 'ABANDONED'                // Abandonné par l'étudiant
}
```

#### Indexes

```typescript
{ examId: 1, userId: 1 }                 // Compound index principal
{ userId: 1, status: 1 }                 // Tentatives par étudiant
{ resumeToken: 1 }                       // Unique, pour reprise
{ expiresAt: 1 }                         // TTL index (auto-cleanup après 30 jours)
{ 'antiCheatEvents.type': 1 }            // Analyse anti-triche
```

#### Méthodes d'Instance

```typescript
// Vérifier si expiré
attemptSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
}

// Enregistrer événement anti-triche
attemptSchema.methods.recordAntiCheatEvent = function(type: string, details: any) {
  this.antiCheatEvents.push({ type, timestamp: new Date(), details });

  if (type === 'tab_switch') {
    this.tabSwitchCount++;

    // Vérifier seuil
    const exam = await Exam.findById(this.examId);
    if (exam && exam.config.antiCheat.maxTabSwitches) {
      if (this.tabSwitchCount > exam.config.antiCheat.maxTabSwitches) {
        this.suspiciousActivityDetected = true;
      }
    }
  }

  return this.save();
}
```

#### Pre-save Hook

```typescript
// Générer resumeToken si absent
attemptSchema.pre('save', function(next) {
  if (this.isNew && !this.resumeToken) {
    this.resumeToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});
```

---

### 13. Response

**Fichier:** `/models/Response.ts`
**Collection:** `responses`
**Rôle:** Réponse individuelle à une question

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  attemptId: ObjectId,                   // Ref: 'Attempt', required, indexed
  questionId: ObjectId,                  // Ref: 'Question', required, indexed
  selectedOptionId: ObjectId,            // Ref: 'Option', required
  isCorrect: Boolean,                    // La réponse est-elle correcte?
  partialScore: Number,                  // Score partiel (pour questions complexes), default: 0
  timeSpent: Number,                     // Temps passé sur cette question (secondes)
  answeredAt: Date,                      // Timestamp de la réponse
  isMarkedForReview: Boolean,            // L'étudiant l'a marquée pour révision, default: false

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes

```typescript
// Compound unique
{ attemptId: 1, questionId: 1 }          // Unique - une réponse par question par tentative

// Queries
{ questionId: 1, isCorrect: 1 }          // Statistiques par question
{ attemptId: 1 }                         // Toutes les réponses d'une tentative
```

---

### 14. LateCode

**Fichier:** `/models/LateCode.ts`
**Collection:** `latecodes`
**Rôle:** Codes d'accès tardif pour examens

#### Schéma Complet

```typescript
{
  _id: ObjectId,
  examId: ObjectId,                      // Ref: 'Exam', required, indexed
  code: String,                          // Code unique (ex: "LATE-A3F8X2Q1"), unique, indexed

  // Status et Utilisation
  status: LateCodeStatus,                // ACTIVE | USED | EXPIRED | REVOKED, indexed
  usagesRemaining: Number,               // Utilisations restantes, default: 1
  maxUsages: Number,                     // Maximum d'utilisations, default: 1
  usageHistory: [{
    userId: ObjectId,                    // Ref: 'User'
    attemptId: ObjectId,                 // Ref: 'Attempt'
    usedAt: Date                         // Timestamp utilisation
  }],

  // Timing
  expiresAt: Date,                       // Date d'expiration, indexed (TTL)
  generatedAt: Date,                     // Date de génération, default: Date.now
  revokedAt: Date,                       // Date de révocation (si révoqué)

  // Métadonnées
  generatedBy: ObjectId,                 // Ref: 'User' (enseignant), indexed
  revokedBy: ObjectId,                   // Ref: 'User' (qui a révoqué)
  assignedUserId: ObjectId,              // Ref: 'User' (étudiant assigné, optional)
  reason: String,                        // Raison de génération
  notes: String,                         // Notes additionnelles

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Enums

```typescript
enum LateCodeStatus {
  ACTIVE = 'ACTIVE',                     // Actif et utilisable
  USED = 'USED',                         // Utilisé (toutes les utilisations épuisées)
  EXPIRED = 'EXPIRED',                   // Expiré
  REVOKED = 'REVOKED'                    // Révoqué manuellement
}
```

#### Indexes

```typescript
{ code: 1 }                              // Unique
{ examId: 1, status: 1 }                 // Codes par examen
{ generatedBy: 1 }                       // Codes générés par enseignant
{ expiresAt: 1 }                         // TTL index (auto-delete après expiration)
{ assignedUserId: 1 }                    // Codes assignés à un étudiant
```

#### Méthodes d'Instance

```typescript
// Vérifier si le code est valide
lateCodeSchema.methods.isValid = function(): boolean {
  return this.status === 'ACTIVE' &&
         this.usagesRemaining > 0 &&
         new Date() < this.expiresAt;
}

// Utiliser le code
lateCodeSchema.methods.use = async function(userId: string, attemptId: string) {
  if (!this.isValid()) {
    throw new Error('Late code is not valid');
  }

  this.usageHistory.push({
    userId: new Types.ObjectId(userId),
    attemptId: new Types.ObjectId(attemptId),
    usedAt: new Date()
  });

  this.usagesRemaining--;

  if (this.usagesRemaining === 0) {
    this.status = 'USED';
  }

  return this.save();
}

// Révoquer le code
lateCodeSchema.methods.revoke = function(adminId: string) {
  this.status = 'REVOKED';
  this.revokedBy = new Types.ObjectId(adminId);
  this.revokedAt = new Date();
  return this.save();
}
```

#### Pre-save Hook

```typescript
// Générer code unique si absent
lateCodeSchema.pre('save', function(next) {
  if (this.isNew && !this.code) {
    this.code = `LATE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  next();
});
```

---

## 🌍 Modèles de Géolocalisation

Les modèles de géolocalisation permettent de structurer hiérarchiquement les informations géographiques (Pays → Région → Département → Ville). Cette hiérarchie est utilisée pour localiser les établissements scolaires, les utilisateurs et permettre des recherches géographiques avancées.

### Hiérarchie Géographique

```
Country (Pays)
  └─ Region (Région)
      └─ Department (Département)
          └─ City (Ville)
```

### 16. Country

**Fichier:** `/models/Country.ts`
**Collection:** `countries`
**Rôle:** Entité géographique de niveau pays

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (country_id)
  name: String,                          // Required, unique, indexed, trim
  isoCode: String,                       // Required, unique, uppercase, length: 2, indexed
  currency: String,                      // Required, trim (ex: "FCFA", "EUR", "USD")
  createdAt: Date,                      // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ isoCode: 1 }` - Unique index pour recherche rapide par code ISO
- `{ name: 1 }` - Unique index pour recherche par nom

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  name: "Cameroun",
  isoCode: "CM",
  currency: "FCFA",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 17. Region

**Fichier:** `/models/Region.ts`
**Collection:** `regions`
**Rôle:** Entité géographique de niveau région (appartient à un pays)

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (region_id)
  country: ObjectId,                     // Required, Ref: 'Country', indexed
  name: String,                          // Required, indexed, trim
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ country: 1, name: 1 }` - Unique composite index (une région est unique par pays)
- `{ country: 1 }` - Index pour recherche par pays

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  country: ObjectId("..."), // Référence au Cameroun
  name: "Centre",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 18. Department

**Fichier:** `/models/Department.ts`
**Collection:** `departments`
**Rôle:** Entité géographique de niveau département (appartient à une région)

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (department_id)
  region: ObjectId,                      // Required, Ref: 'Region', indexed
  name: String,                          // Required, indexed, trim
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ region: 1, name: 1 }` - Unique composite index (un département est unique par région)
- `{ region: 1 }` - Index pour recherche par région

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  region: ObjectId("..."), // Référence à la région Centre
  name: "Mfoundi",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 19. City

**Fichier:** `/models/City.ts`
**Collection:** `cities`
**Rôle:** Entité géographique de niveau ville (appartient à un département)

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (city_id)
  department: ObjectId,                  // Required, Ref: 'Department', indexed
  name: String,                          // Required, indexed, trim
  lat: Number,                           // Optional, min: -90, max: 90 (Latitude)
  lng: Number,                           // Optional, min: -180, max: 180 (Longitude)
  costOfLivingIndex: Number,             // Optional, min: 0 (Indice du coût de la vie)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ department: 1, name: 1 }` - Unique composite index (une ville est unique par département)
- `{ department: 1 }` - Index pour recherche par département
- `{ lat: 1, lng: 1 }` - Index géospatial pour recherches de proximité

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  department: ObjectId("..."), // Référence au département Mfoundi
  name: "Yaoundé",
  lat: 3.8480,
  lng: 11.5021,
  costOfLivingIndex: 45.2,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

#### Cas d'Usage

- **Recherche géographique** : Trouver toutes les écoles dans un rayon de X km
- **Filtrage par localisation** : Filtrer les établissements par pays/région/département/ville
- **Calcul de coût** : Utiliser `costOfLivingIndex` pour estimer le coût de la vie dans une ville
- **Affichage de carte** : Utiliser `lat` et `lng` pour afficher les établissements sur une carte

---

## 📋 Modèles de Réglementation

Les modèles de réglementation permettent de gérer les approbations légales et les tutelles académiques des établissements scolaires. Ces informations sont essentielles pour valider la légitimité et la reconnaissance officielle des institutions.

### 20. RegulatoryApproval

**Fichier:** `/models/RegulatoryApproval.ts`
**Collection:** `regulatoryapprovals`
**Rôle:** Gestion des approbations réglementaires des établissements

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (approval_id)
  school: ObjectId,                      // Required, Ref: 'School', indexed
  approvalNumber: String,               // Required, indexed, trim
  approvalStatus: ApprovalStatus,       // Required, enum: Issued | NotIssued | Expired, indexed
  approvalDate: Date,                    // Optional
  issuedBy: String,                      // Required, indexed, trim (MINESUP, MINEFOP, etc.)
  documentsUrl: String,                  // Optional, trim (URL vers documents scannés)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Enums

```typescript
enum ApprovalStatus {
  ISSUED = 'Issued',
  NOT_ISSUED = 'NotIssued',
  EXPIRED = 'Expired'
}
```

#### Indexes

- `{ school: 1, approvalNumber: 1 }` - Unique composite index (un numéro d'approbation unique par école)
- `{ school: 1 }` - Index pour recherche par école
- `{ approvalStatus: 1 }` - Index pour filtrage par statut
- `{ issuedBy: 1 }` - Index pour recherche par organisme émetteur

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  school: ObjectId("..."), // Référence à une école
  approvalNumber: "MINESUP-2024-001",
  approvalStatus: "Issued",
  approvalDate: ISODate("2024-01-15T00:00:00Z"),
  issuedBy: "MINESUP",
  documentsUrl: "https://storage.example.com/approvals/minesup-2024-001.pdf",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 21. AcademicTutelle

**Fichier:** `/models/AcademicTutelle.ts`
**Collection:** `academictutelles`
**Rôle:** Gestion des tutelles académiques des établissements

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (tutelle_id)
  school: ObjectId,                      // Required, Ref: 'School', indexed
  tutelleName: String,                   // Required, indexed, trim (Université de Douala, Yaoundé I, etc.)
  tutelleType: TutelleType,              // Required, enum, indexed
  rank: Number,                          // Required, min: 1, max: 10, default: 1
  documentsUrl: String,                  // Optional, trim (URL vers documents de tutelle)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Enums

```typescript
enum TutelleType {
  STATE_UNIVERSITY = 'StateUniversity',
  MINISTRY = 'Ministry',
  AGREEMENT = 'Agreement',
  SEAT_AGREEMENT = 'SeatAgreement',
  OTHER = 'Other'
}
```

#### Indexes

- `{ school: 1, tutelleName: 1 }` - Unique composite index (une tutelle unique par école)
- `{ school: 1 }` - Index pour recherche par école
- `{ tutelleType: 1 }` - Index pour filtrage par type de tutelle
- `{ rank: 1 }` - Index pour tri par rang

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  school: ObjectId("..."), // Référence à une école
  tutelleName: "Université de Yaoundé I",
  tutelleType: "StateUniversity",
  rank: 1,
  documentsUrl: "https://storage.example.com/tutelles/uy1-agreement.pdf",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

#### Cas d'Usage

- **Validation légale** : Vérifier que l'établissement a les approbations nécessaires
- **Recherche par organisme** : Trouver tous les établissements approuvés par MINESUP
- **Hiérarchie académique** : Identifier les établissements sous tutelle d'une université d'État
- **Classement** : Utiliser le `rank` pour prioriser les tutelles principales

---

## 🤝 Modèles de Partenariats

Les modèles de partenariats permettent de gérer les relations entre établissements scolaires et partenaires (entreprises, universités, organisations). Ces relations peuvent inclure des stages, des emplois, des doubles diplômes, des certifications, etc.

### 22. Partner

**Fichier:** `/models/Partner.ts`
**Collection:** `partners`
**Rôle:** Entité partenaire (entreprise, université, organisation)

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (partner_id)
  name: String,                          // Required, indexed, trim
  country: ObjectId,                     // Optional, Ref: 'Country', indexed
  partnerType: PartnerType,              // Required, enum: Local | International, indexed
  sector: String,                        // Required, indexed, trim (secteur d'activité)
  website: String,                       // Optional, trim
  createdAt: Date,                      // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Enums

```typescript
enum PartnerType {
  LOCAL = 'Local',
  INTERNATIONAL = 'International'
}
```

#### Indexes

- `{ name: 1 }` - Index pour recherche par nom
- `{ country: 1 }` - Index pour recherche par pays
- `{ partnerType: 1 }` - Index pour filtrage par type
- `{ sector: 1 }` - Index pour recherche par secteur

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  name: "Total Energies",
  country: ObjectId("..."), // Référence au Cameroun
  partnerType: "International",
  sector: "Énergie",
  website: "https://totalenergies.cm",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 23. InstitutionPartner

**Fichier:** `/models/InstitutionPartner.ts`
**Collection:** `institutionpartners`
**Rôle:** Relation entre un établissement et un partenaire

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (institution_partner_id)
  school: ObjectId,                      // Required, Ref: 'School', indexed
  partner: ObjectId,                     // Required, Ref: 'Partner', indexed
  relationshipType: RelationshipType,   // Required, enum, indexed
  startDate: Date,                       // Optional
  endDate: Date,                         // Optional
  proofUrl: String,                      // Optional, trim (URL vers documents de preuve)
  notes: String,                         // Optional, trim
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Enums

```typescript
enum RelationshipType {
  INTERNSHIP = 'Internship',
  EMPLOYMENT = 'Employment',
  DOUBLE_DEGREE = 'DoubleDegree',
  CERTIFICATION = 'Certification',
  EXCHANGE = 'Exchange',
  SPONSORSHIP = 'Sponsorship',
  OTHER = 'Other'
}
```

#### Indexes

- `{ school: 1, partner: 1, relationshipType: 1 }` - Unique composite index (une relation unique par combinaison)
- `{ school: 1 }` - Index pour recherche par école
- `{ partner: 1 }` - Index pour recherche par partenaire
- `{ relationshipType: 1 }` - Index pour filtrage par type de relation
- `{ startDate: 1, endDate: 1 }` - Index pour recherche par période

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  school: ObjectId("..."), // Référence à une école
  partner: ObjectId("..."), // Référence à Total Energies
  relationshipType: "Internship",
  startDate: ISODate("2024-01-01T00:00:00Z"),
  endDate: ISODate("2024-12-31T00:00:00Z"),
  proofUrl: "https://storage.example.com/partnerships/total-internship-2024.pdf",
  notes: "Convention de stage annuelle pour étudiants en génie pétrolier",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

#### Cas d'Usage

- **Stages** : Gérer les conventions de stage entre écoles et entreprises
- **Emploi** : Suivre les partenariats d'embauche
- **Doubles diplômes** : Gérer les accords de double diplôme avec d'autres universités
- **Certifications** : Suivre les partenariats pour certifications professionnelles
- **Échanges** : Gérer les programmes d'échange d'étudiants
- **Sponsoring** : Suivre les partenariats de financement

---

## 🎓 Modèles de Spécialités

Les modèles de spécialités permettent de gérer les programmes d'études, leurs compétences associées et les débouchés professionnels. Ces modèles sont essentiels pour structurer l'offre académique des établissements.

### 24. Specialty

**Fichier:** `/models/Specialty.ts`
**Collection:** `specialties`
**Rôle:** Programme de spécialité académique

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (specialty_id)
  domain: String,                        // Required, indexed, trim (Domaine d'études)
  field: String,                         // Required, indexed, trim (Filière)
  specialtyName: String,                 // Required, indexed, trim
  level: SpecialtyLevel,                 // Required, enum, indexed
  degreeAwarded: String,                 // Required, trim (Diplôme délivré)
  durationYears: Number,                 // Required, min: 1 (Durée en années)
  language: String,                      // Required, indexed, trim (Langue d'enseignement)
  mode: SpecialtyMode,                   // Required, enum, indexed
  prerequisites: String,                 // Optional, trim
  generalObjective: String,               // Optional, trim (Objectif général)
  specificObjectives: String[],          // Optional (Objectifs spécifiques)
  valueProposition: String,              // Optional, trim (Proposition de valeur)
  exitProfile: String,                   // Optional, trim (Profil de sortie)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Enums

```typescript
enum SpecialtyLevel {
  BTS = 'BTS',
  HND = 'HND',
  LICENCE = 'Licence',
  MASTER = 'Master',
  DOCTORAT = 'Doctorat',
  CERTIFICATE = 'Certificate'
}

enum SpecialtyMode {
  ONSITE = 'Onsite',
  HYBRID = 'Hybrid',
  ONLINE = 'Online'
}
```

#### Indexes

- `{ domain: 1, field: 1 }` - Index composite pour recherche par domaine/filière
- `{ level: 1 }` - Index pour filtrage par niveau
- `{ mode: 1 }` - Index pour filtrage par mode d'enseignement
- `{ language: 1 }` - Index pour filtrage par langue
- `{ specialtyName: 1 }` - Index pour recherche par nom

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  domain: "Informatique",
  field: "Génie Logiciel",
  specialtyName: "Développement Web Full Stack",
  level: "Licence",
  degreeAwarded: "Licence Professionnelle en Informatique",
  durationYears: 3,
  language: "Français",
  mode: "Hybrid",
  prerequisites: "Baccalauréat scientifique ou équivalent",
  generalObjective: "Former des développeurs web complets maîtrisant les technologies modernes",
  specificObjectives: [
    "Maîtriser les langages frontend (HTML, CSS, JavaScript)",
    "Développer des applications backend avec Node.js",
    "Gérer des bases de données (SQL et NoSQL)"
  ],
  valueProposition: "Formation pratique avec projets réels et stage en entreprise",
  exitProfile: "Développeur Full Stack capable de créer des applications web complètes",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 25. Skill

**Fichier:** `/models/Skill.ts`
**Collection:** `skills`
**Rôle:** Compétence générique ou spécifique

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (skill_id)
  name: String,                          // Required, unique, indexed, trim
  skillType: SkillType,                  // Required, enum, indexed
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Enums

```typescript
enum SkillType {
  GENERIC = 'Generic',
  SPECIFIC = 'Specific'
}
```

#### Indexes

- `{ name: 1 }` - Unique index pour recherche par nom
- `{ skillType: 1 }` - Index pour filtrage par type

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  name: "Gestion de projet",
  skillType: "Generic",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 26. SpecialtySkill

**Fichier:** `/models/SpecialtySkill.ts`
**Collection:** `specialtyskills`
**Rôle:** Relation entre une spécialité et une compétence

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (specialty_skill_id)
  specialty: ObjectId,                   // Required, Ref: 'Specialty', indexed
  skill: ObjectId,                       // Required, Ref: 'Skill', indexed
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ specialty: 1, skill: 1 }` - Unique composite index (une compétence unique par spécialité)
- `{ specialty: 1 }` - Index pour recherche par spécialité
- `{ skill: 1 }` - Index pour recherche par compétence

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  specialty: ObjectId("..."), // Référence à "Développement Web Full Stack"
  skill: ObjectId("..."), // Référence à "Gestion de projet"
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 27. CareerOutcome

**Fichier:** `/models/CareerOutcome.ts`
**Collection:** `careeroutcomes`
**Rôle:** Débouché professionnel

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (outcome_id)
  name: String,                          // Required, unique, indexed, trim
  sector: String,                        // Required, indexed, trim (Secteur d'activité)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ name: 1 }` - Unique index pour recherche par nom
- `{ sector: 1 }` - Index pour recherche par secteur

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  name: "Développeur Full Stack",
  sector: "Technologies de l'Information",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 28. SpecialtyOutcome

**Fichier:** `/models/SpecialtyOutcome.ts`
**Collection:** `specialtyoutcomes`
**Rôle:** Relation entre une spécialité et un débouché professionnel

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (specialty_outcome_id)
  specialty: ObjectId,                   // Required, Ref: 'Specialty', indexed
  outcome: ObjectId,                     // Required, Ref: 'CareerOutcome', indexed
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ specialty: 1, outcome: 1 }` - Unique composite index (un débouché unique par spécialité)
- `{ specialty: 1 }` - Index pour recherche par spécialité
- `{ outcome: 1 }` - Index pour recherche par débouché

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  specialty: ObjectId("..."), // Référence à "Développement Web Full Stack"
  outcome: ObjectId("..."), // Référence à "Développeur Full Stack"
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

## 📚 Modèles de Curriculum

Les modèles de curriculum permettent de structurer le programme d'études par semestres et unités d'enseignement (UE). Cette structure permet de gérer les heures de cours, travaux dirigés, travaux pratiques et les crédits ECTS.

### Hiérarchie du Curriculum

```
Specialty (Spécialité)
  └─ CurriculumSemester (Semestre 1, 2, 3, ...)
      └─ CurriculumUE (Unité d'Enseignement)
```

### 29. CurriculumSemester

**Fichier:** `/models/CurriculumSemester.ts`
**Collection:** `curriculumsemesters`
**Rôle:** Semestre du curriculum d'une spécialité

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (semester_id)
  specialty: ObjectId,                   // Required, Ref: 'Specialty', indexed
  semesterNumber: Number,                 // Required, min: 1, max: 10, indexed
  createdAt: Date,                        // Auto-généré
  updatedAt: Date                         // Auto-généré
}
```

#### Indexes

- `{ specialty: 1, semesterNumber: 1 }` - Unique composite index (un numéro de semestre unique par spécialité)
- `{ specialty: 1 }` - Index pour recherche par spécialité

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  specialty: ObjectId("..."), // Référence à "Développement Web Full Stack"
  semesterNumber: 1,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 30. CurriculumUE

**Fichier:** `/models/CurriculumUE.ts`
**Collection:** `curriculumues`
**Rôle:** Unité d'Enseignement (UE) dans un semestre

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (ue_id)
  semester: ObjectId,                    // Required, Ref: 'CurriculumSemester', indexed
  ueCode: String,                        // Required, indexed, trim (Code de l'UE)
  title: String,                         // Required, trim
  ueType: UEType,                        // Required, enum, indexed
  hoursTotal: Number,                    // Required, min: 0 (Heures totales)
  hoursCm: Number,                       // Required, min: 0 (Heures CM - Cours Magistraux)
  hoursTd: Number,                       // Required, min: 0 (Heures TD - Travaux Dirigés)
  hoursTp: Number,                       // Required, min: 0 (Heures TP - Travaux Pratiques)
  hoursTpe: Number,                      // Optional, min: 0 (Heures TPE - Travaux Personnels Encadrés)
  credits: Number,                       // Required, min: 0 (Crédits ECTS)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Enums

```typescript
enum UEType {
  FUNDAMENTAL = 'Fundamental',
  PROFESSIONAL = 'Professional',
  TRANSVERSAL = 'Transversal'
}
```

#### Indexes

- `{ semester: 1, ueCode: 1 }` - Unique composite index (un code UE unique par semestre)
- `{ semester: 1 }` - Index pour recherche par semestre
- `{ ueType: 1 }` - Index pour filtrage par type d'UE

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  semester: ObjectId("..."), // Référence au Semestre 1
  ueCode: "UE-INF-101",
  title: "Introduction à la Programmation",
  ueType: "Fundamental",
  hoursTotal: 60,
  hoursCm: 30,
  hoursTd: 20,
  hoursTp: 10,
  hoursTpe: 0,
  credits: 6,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

#### Cas d'Usage

- **Planification académique** : Structurer le programme par semestres
- **Calcul de crédits** : Suivre les crédits ECTS par UE
- **Répartition horaire** : Gérer CM, TD, TP, TPE
- **Filtrage par type** : Distinguer les UE fondamentales, professionnelles et transversales

---

## 🎯 Modèles d'Offre & Formation

Les modèles d'offre et formation permettent de gérer les programmes académiques offerts par les établissements scolaires, incluant les coûts, les conditions d'admission, les facilités de paiement et les stages.

### 31. SchoolProgram

**Fichier:** `/models/SchoolProgram.ts`
**Collection:** `schoolprograms`
**Rôle:** Programme académique offert par une école

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (school_program_id)
  school: ObjectId,                     // Required, Ref: 'School', indexed
  specialty: ObjectId,                  // Required, Ref: 'Specialty', indexed
  campusCity: ObjectId,                 // Optional, Ref: 'City', indexed (si multi-campus)
  admissionRequirements: String,        // Optional, trim
  annualCostTotal: Number,               // Required, min: 0 (Coût annuel total)
  costBreakdownJson: Object,            // Optional (Détail des coûts en JSON)
  otherFeesJson: Object,                 // Optional (Autres frais en JSON)
  scholarshipAvailable: Boolean,        // Required, default: false, indexed
  paymentFacilities: Boolean,            // Required, default: false
  mandatoryInternship: Boolean,          // Required, default: false, indexed
  internshipDurationMonths: Number,      // Optional, min: 0
  deliveryMode: DeliveryMode,            // Required, enum, indexed
  programStatus: ProgramStatus,          // Required, enum, default: Open, indexed
  createdAt: Date,                      // Auto-généré
  updatedAt: Date                       // Auto-généré
}
```

#### Enums

```typescript
enum DeliveryMode {
  ONSITE = 'Onsite',
  HYBRID = 'Hybrid',
  ONLINE = 'Online'
}

enum ProgramStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  LIMITED_SEATS = 'LimitedSeats'
}
```

#### Indexes

- `{ school: 1, specialty: 1 }` - Unique composite index (un programme unique par école/spécialité)
- `{ school: 1 }` - Index pour recherche par école
- `{ specialty: 1 }` - Index pour recherche par spécialité
- `{ campusCity: 1 }` - Index pour recherche par campus
- `{ programStatus: 1 }` - Index pour filtrage par statut
- `{ deliveryMode: 1 }` - Index pour filtrage par mode
- `{ scholarshipAvailable: 1 }` - Index pour filtrage par bourses
- `{ mandatoryInternship: 1 }` - Index pour filtrage par stage obligatoire

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  school: ObjectId("..."), // Référence à une école
  specialty: ObjectId("..."), // Référence à "Développement Web Full Stack"
  campusCity: ObjectId("..."), // Référence à Yaoundé (si multi-campus)
  admissionRequirements: "Baccalauréat scientifique ou équivalent, test d'entrée",
  annualCostTotal: 500000,
  costBreakdownJson: {
    tuition: 450000,
    registration: 50000,
    materials: 0
  },
  otherFeesJson: {
    library: 10000,
    sports: 5000,
    insurance: 15000
  },
  scholarshipAvailable: true,
  paymentFacilities: true,
  mandatoryInternship: true,
  internshipDurationMonths: 6,
  deliveryMode: "Hybrid",
  programStatus: "Open",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

#### Cas d'Usage

- **Catalogue de programmes** : Lister tous les programmes offerts par une école
- **Recherche multi-campus** : Gérer les programmes par campus
- **Gestion des coûts** : Détail des frais de scolarité et autres frais
- **Conditions d'admission** : Stocker les prérequis et conditions
- **Gestion des places** : Suivre l'ouverture/fermeture des inscriptions

---

## 📊 Modèles de Métriques

Les modèles de métriques permettent de suivre et comparer la performance des établissements scolaires en termes de réussite académique, d'insertion professionnelle et de qualité d'infrastructure.

### 32. PerformanceMetric

**Fichier:** `/models/PerformanceMetric.ts`
**Collection:** `performancemetrics`
**Rôle:** Métriques de performance académique (réussite, classement)

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (metric_id)
  school: ObjectId,                      // Required, Ref: 'School', indexed
  year: Number,                          // Required, indexed (Année de référence)
  examType: ExamType,                    // Optional, enum, indexed (BTS, HND, Other)
  successRate: Number,                    // Optional, min: 0, max: 100 (Taux de réussite)
  rankingPosition: Number,               // Optional, min: 1 (Position au classement)
  officialSourceUrl: String,             // Optional, trim (URL source officielle)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Enums

```typescript
enum ExamType {
  BTS = 'BTS',
  HND = 'HND',
  OTHER = 'Other'
}
```

#### Indexes

- `{ school: 1, year: 1, examType: 1 }` - Unique composite index (une métrique unique par combinaison)
- `{ school: 1 }` - Index pour recherche par école
- `{ year: 1 }` - Index pour recherche par année
- `{ examType: 1 }` - Index pour filtrage par type d'examen
- `{ successRate: 1 }` - Index pour tri par taux de réussite
- `{ rankingPosition: 1 }` - Index pour tri par classement

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  school: ObjectId("..."), // Référence à une école
  year: 2024,
  examType: "BTS",
  successRate: 85.5,
  rankingPosition: 3,
  officialSourceUrl: "https://minesup.cm/classements/bts-2024",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 33. EmploymentMetric

**Fichier:** `/models/EmploymentMetric.ts`
**Collection:** `employmentmetrics`
**Rôle:** Métriques d'insertion professionnelle

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (employment_id)
  school: ObjectId,                      // Required, Ref: 'School', indexed
  year: Number,                          // Required, indexed (Année de référence)
  employmentRate6m: Number,               // Optional, min: 0, max: 100 (Taux d'emploi à 6 mois)
  employmentRate12m: Number,             // Optional, min: 0, max: 100 (Taux d'emploi à 12 mois)
  topEmployersJson: Object,              // Optional (Top employeurs en JSON)
  alumniTracking: Boolean,               // Required, default: false, indexed (Suivi des anciens)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ school: 1, year: 1 }` - Unique composite index (une métrique unique par école/année)
- `{ school: 1 }` - Index pour recherche par école
- `{ year: 1 }` - Index pour recherche par année
- `{ employmentRate6m: 1 }` - Index pour tri par taux 6 mois
- `{ employmentRate12m: 1 }` - Index pour tri par taux 12 mois
- `{ alumniTracking: 1 }` - Index pour filtrage par suivi

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  school: ObjectId("..."), // Référence à une école
  year: 2024,
  employmentRate6m: 78.5,
  employmentRate12m: 92.3,
  topEmployersJson: {
    "Total Energies": 15,
    "MTN": 12,
    "Orange": 10,
    "Société Générale": 8
  },
  alumniTracking: true,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 34. InfrastructureMetric

**Fichier:** `/models/InfrastructureMetric.ts`
**Collection:** `infrastructuremetrics`
**Rôle:** Métriques de qualité d'infrastructure

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (infra_id)
  school: ObjectId,                      // Required, Ref: 'School', indexed, unique
  labsAvailable: Boolean,                // Required, default: false, indexed
  labQualityScore: Number,               // Optional, min: 1, max: 5
  itEquipmentScore: Number,              // Optional, min: 1, max: 5
  internetQuality: InternetQuality,      // Optional, enum, indexed
  libraryScore: Number,                 // Optional, min: 1, max: 5
  accessibilityDisability: Boolean,      // Required, default: false, indexed
  campusSecurityScore: Number,           // Optional, min: 1, max: 5
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Enums

```typescript
enum InternetQuality {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}
```

#### Indexes

- `{ school: 1 }` - Unique index (une seule métrique d'infrastructure par école)
- `{ labsAvailable: 1 }` - Index pour filtrage par laboratoires
- `{ internetQuality: 1 }` - Index pour filtrage par qualité internet
- `{ accessibilityDisability: 1 }` - Index pour filtrage par accessibilité

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  school: ObjectId("..."), // Référence à une école
  labsAvailable: true,
  labQualityScore: 4,
  itEquipmentScore: 5,
  internetQuality: "High",
  libraryScore: 4,
  accessibilityDisability: true,
  campusSecurityScore: 5,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

#### Cas d'Usage

- **Comparaison d'écoles** : Comparer les infrastructures entre établissements
- **Recherche par critères** : Filtrer par accessibilité, qualité internet, etc.
- **Score global** : Calculer un score d'infrastructure global
- **Planification** : Identifier les besoins d'amélioration

---

## ⭐ Modèles de Scoring

Les modèles de scoring permettent de calculer et stocker des scores agrégés pour les écoles, spécialités et programmes. Ce système de notation fonctionne comme un "TripAdvisor éducatif", permettant de comparer et classer les établissements selon différents critères.

### 35. SchoolScore

**Fichier:** `/models/SchoolScore.ts`
**Collection:** `schoolscores`
**Rôle:** Score global d'une école (TripAdvisor éducatif)

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (score_id)
  school: ObjectId,                      // Required, Ref: 'School', unique, indexed
  legalScore: Number,                    // Required, min: 0, max: 100 (Score légal/réglementaire)
  academicScore: Number,                 // Required, min: 0, max: 100 (Score académique)
  employmentScore: Number,               // Required, min: 0, max: 100 (Score d'emploi)
  infrastructureScore: Number,           // Required, min: 0, max: 100 (Score d'infrastructure)
  affordabilityScore: Number,            // Required, min: 0, max: 100 (Score d'accessibilité financière)
  globalScore: Number,                   // Required, min: 0, max: 100, indexed (Score global)
  lastComputedAt: Date,                  // Required, indexed (Date du dernier calcul)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ school: 1 }` - Unique index (un seul score par école)
- `{ globalScore: 1 }` - Index pour tri par score global
- `{ lastComputedAt: 1 }` - Index pour recherche par date de calcul

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  school: ObjectId("..."), // Référence à une école
  legalScore: 95,
  academicScore: 88,
  employmentScore: 82,
  infrastructureScore: 90,
  affordabilityScore: 75,
  globalScore: 86,
  lastComputedAt: ISODate("2024-01-15T10:30:00Z"),
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

#### Calcul du Score Global

Le score global peut être calculé comme une moyenne pondérée :
- Legal: 20%
- Academic: 25%
- Employment: 25%
- Infrastructure: 15%
- Affordability: 15%

---

### 36. SpecialtyScore

**Fichier:** `/models/SpecialtyScore.ts`
**Collection:** `specialtyscores`
**Rôle:** Score d'une spécialité

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (specialty_score_id)
  specialty: ObjectId,                   // Required, Ref: 'Specialty', unique, indexed
  employabilityScore: Number,            // Required, min: 0, max: 100 (Score d'employabilité)
  accessibilityScore: Number,            // Required, min: 0, max: 100 (Score d'accessibilité)
  difficultyScore: Number,              // Required, min: 0, max: 100 (Score de difficulté)
  lnobScore: Number,                     // Required, min: 0, max: 100 (Score LNOB - Leave No One Behind)
  globalScore: Number,                   // Required, min: 0, max: 100, indexed (Score global)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ specialty: 1 }` - Unique index (un seul score par spécialité)
- `{ globalScore: 1 }` - Index pour tri par score global

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  specialty: ObjectId("..."), // Référence à "Développement Web Full Stack"
  employabilityScore: 92,
  accessibilityScore: 78,
  difficultyScore: 65,
  lnobScore: 85,
  globalScore: 80,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 37. SchoolProgramScore

**Fichier:** `/models/SchoolProgramScore.ts`
**Collection:** `schoolprogramscores`
**Rôle:** Score d'un programme d'école

#### Schéma Complet

```typescript
{
  _id: ObjectId,                         // Auto-généré (ips_id)
  schoolProgram: ObjectId,               // Required, Ref: 'SchoolProgram', unique, indexed
  matchScoreAvg: Number,                 // Required, min: 0, max: 100 (Moyenne des matchs élèves)
  lnobAccessibilityScore: Number,        // Required, min: 0, max: 100 (Score LNOB d'accessibilité)
  valueForMoneyScore: Number,            // Required, min: 0, max: 100, indexed (Score rapport qualité/prix)
  createdAt: Date,                       // Auto-généré
  updatedAt: Date                        // Auto-généré
}
```

#### Indexes

- `{ schoolProgram: 1 }` - Unique index (un seul score par programme)
- `{ valueForMoneyScore: 1 }` - Index pour tri par rapport qualité/prix
- `{ matchScoreAvg: 1 }` - Index pour tri par match moyen

#### Exemple

```typescript
{
  _id: ObjectId("..."),
  schoolProgram: ObjectId("..."), // Référence à un programme
  matchScoreAvg: 87.5,
  lnobAccessibilityScore: 82,
  valueForMoneyScore: 90,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

#### Cas d'Usage

- **Classement des écoles** : Trier les écoles par score global
- **Recommandations** : Suggérer les meilleures écoles selon les critères
- **Comparaison** : Comparer les scores entre établissements
- **Tendances** : Suivre l'évolution des scores dans le temps

---

## 🔗 Relations entre Modèles

### Diagramme de Relations

```
User ──1:1── LearnerProfile / PedagogicalProfile
  │
  ├── 1:N ──> Exam (createdBy)
  ├── 1:N ──> Attempt (userId)
  └── 1:N ──> LateCode (generatedBy, assignedUserId)

EducationLevel
  │
  ├── N:M ──> Field (applicableLevels)
  └── N:M ──> Subject (applicableLevels)

Subject
  │
  ├── 1:N ──> LearningUnit
  ├── N:M ──> Field (applicableFields)
  └── N:M ──> Competency (relatedSubjects)

Exam
  │
  ├── N:M ──> EducationLevel (targetLevels)
  ├── N:1 ──> Subject
  ├── N:1 ──> LearningUnit
  ├── N:M ──> Field (targetFields)
  ├── N:M ──> Competency (targetedCompetencies)
  ├── 1:N ──> Question
  ├── 1:N ──> Attempt
  └── 1:N ──> LateCode

Question
  │
  ├── 1:N ──> Option
  └── 1:N ──> Response

Attempt
  │
  └── 1:N ──> Response

Country
  │
  └── 1:N ──> Region

Region
  │
  └── 1:N ──> Department

Department
  │
  └── 1:N ──> City

School
  │
  ├── 1:N ──> RegulatoryApproval
  ├── 1:N ──> AcademicTutelle
  └── N:M ──> Partner (via InstitutionPartner)

Partner
  │
  ├── N:1 ──> Country (optional)
  └── N:M ──> School (via InstitutionPartner)

Specialty
  │
  ├── N:M ──> Skill (via SpecialtySkill)
  ├── N:M ──> CareerOutcome (via SpecialtyOutcome)
  └── 1:N ──> CurriculumSemester

CurriculumSemester
  │
  └── 1:N ──> CurriculumUE

School
  │
  ├── 1:N ──> SchoolProgram
  ├── 1:N ──> PerformanceMetric
  ├── 1:N ──> EmploymentMetric
  ├── 1:1 ──> InfrastructureMetric
  └── 1:1 ──> SchoolScore

SchoolProgram
  │
  ├── N:1 ──> School
  ├── N:1 ──> Specialty
  ├── N:1 ──> City (optional, campus)
  └── 1:1 ──> SchoolProgramScore

Specialty
  │
  └── 1:1 ──> SpecialtyScore
```

### Cardinalités Détaillées

| Relation | Type | Description |
|----------|------|-------------|
| User → LearnerProfile | 1:1 | Un utilisateur = un profil apprenant |
| User → PedagogicalProfile | 1:1 | Un utilisateur = un profil pédagogique |
| User → Exam | 1:N | Un enseignant crée plusieurs examens |
| User → Attempt | 1:N | Un étudiant fait plusieurs tentatives |
| Exam → Question | 1:N | Un examen contient plusieurs questions |
| Question → Option | 1:N | Une question a plusieurs options |
| Attempt → Response | 1:N | Une tentative contient plusieurs réponses |
| Subject → LearningUnit | 1:N | Une matière a plusieurs chapitres |
| EducationLevel ↔ Field | N:M | Niveaux applicables à plusieurs filières |
| Subject ↔ Field | N:M | Matières applicables à plusieurs filières |
| Country → Region | 1:N | Un pays contient plusieurs régions |
| Region → Department | 1:N | Une région contient plusieurs départements |
| Department → City | 1:N | Un département contient plusieurs villes |
| School → RegulatoryApproval | 1:N | Une école peut avoir plusieurs approbations |
| School → AcademicTutelle | 1:N | Une école peut avoir plusieurs tutelles |
| School ↔ Partner | N:M | Relations via InstitutionPartner |
| Partner → Country | N:1 | Un partenaire peut être associé à un pays (optionnel) |
| Specialty ↔ Skill | N:M | Compétences via SpecialtySkill |
| Specialty ↔ CareerOutcome | N:M | Débouchés via SpecialtyOutcome |
| Specialty → CurriculumSemester | 1:N | Une spécialité contient plusieurs semestres |
| CurriculumSemester → CurriculumUE | 1:N | Un semestre contient plusieurs UE |
| School → SchoolProgram | 1:N | Une école offre plusieurs programmes |
| SchoolProgram → Specialty | N:1 | Un programme correspond à une spécialité |
| SchoolProgram → City | N:1 | Un programme peut être localisé dans une ville (optionnel) |
| School → PerformanceMetric | 1:N | Une école a plusieurs métriques de performance (par année) |
| School → EmploymentMetric | 1:N | Une école a plusieurs métriques d'emploi (par année) |
| School → InfrastructureMetric | 1:1 | Une école a une seule métrique d'infrastructure |
| School → SchoolScore | 1:1 | Une école a un seul score global |
| Specialty → SpecialtyScore | 1:1 | Une spécialité a un seul score |
| SchoolProgram → SchoolProgramScore | 1:1 | Un programme a un seul score |

---

## 📊 Stratégie d'Indexation

### Indexes Primaires (Unicité)

| Modèle | Index | Type | Raison |
|--------|-------|------|--------|
| User | `email` | Unique | Login unique |
| User | `googleId`, `githubId` | Unique Sparse | OAuth unique |
| EducationLevel | `code` | Unique | Identifiant unique |
| Field | `code` | Unique | Identifiant unique |
| Subject | `code` | Unique | Identifiant unique |
| Competency | `code` | Unique | Identifiant unique |
| LearnerProfile | `user` | Unique | Un profil par user |
| PedagogicalProfile | `user` | Unique | Un profil par user |
| Attempt | `resumeToken` | Unique | Token de reprise unique |
| LateCode | `code` | Unique | Code unique |
| Response | `(attemptId, questionId)` | Unique Compound | Une réponse par question/tentative |
| Country | `isoCode` | Unique | Code ISO unique |
| Country | `name` | Unique | Nom unique |
| Region | `(country, name)` | Unique Compound | Une région unique par pays |
| Department | `(region, name)` | Unique Compound | Un département unique par région |
| City | `(department, name)` | Unique Compound | Une ville unique par département |
| RegulatoryApproval | `(school, approvalNumber)` | Unique Compound | Un numéro d'approbation unique par école |
| AcademicTutelle | `(school, tutelleName)` | Unique Compound | Une tutelle unique par école |
| InstitutionPartner | `(school, partner, relationshipType)` | Unique Compound | Une relation unique par combinaison |
| Skill | `name` | Unique | Nom de compétence unique |
| CareerOutcome | `name` | Unique | Nom de débouché unique |
| SpecialtySkill | `(specialty, skill)` | Unique Compound | Une compétence unique par spécialité |
| SpecialtyOutcome | `(specialty, outcome)` | Unique Compound | Un débouché unique par spécialité |
| CurriculumSemester | `(specialty, semesterNumber)` | Unique Compound | Un numéro de semestre unique par spécialité |
| CurriculumUE | `(semester, ueCode)` | Unique Compound | Un code UE unique par semestre |
| SchoolProgram | `(school, specialty)` | Unique Compound | Un programme unique par école/spécialité |
| PerformanceMetric | `(school, year, examType)` | Unique Compound | Une métrique unique par combinaison |
| EmploymentMetric | `(school, year)` | Unique Compound | Une métrique d'emploi unique par école/année |
| InfrastructureMetric | `school` | Unique | Une seule métrique d'infrastructure par école |
| SchoolScore | `school` | Unique | Un seul score par école |
| SpecialtyScore | `specialty` | Unique | Un seul score par spécialité |
| SchoolProgramScore | `schoolProgram` | Unique | Un seul score par programme |

### Indexes Composés (Performance)

| Modèle | Index | Raison |
|--------|-------|--------|
| User | `(role, isActive)` | Filtrer users actifs par rôle |
| User | `(subSystem, institution)` | Filtrer par établissement |
| Exam | `(subSystem, targetLevels, subject)` | Recherche examens par critères |
| Exam | `(status, isPublished)` | Workflow d'examen |
| Exam | `(createdBy, isActive)` | Examens d'un enseignant |
| EducationLevel | `(subSystem, cycle, order)` | Hiérarchie éducative |
| Field | `(subSystem, cycle)` | Filières par système |
| Subject | `(subSystem, subjectType)` | Matières par type |
| Question | `(examId, order)` | Questions ordonnées |
| Option | `(questionId, order)` | Options ordonnées |
| Attempt | `(examId, userId)` | Tentatives par examen/user |
| Attempt | `(userId, status)` | Tentatives par user/status |

### Indexes Texte (Full-Text Search)

| Modèle | Champs | Usage |
|--------|--------|-------|
| Exam | `(title, description)` | Recherche full-text d'examens |

### TTL Indexes (Auto-Cleanup)

| Modèle | Champ | Durée | Raison |
|--------|-------|-------|--------|
| Attempt | `expiresAt` | 30 jours | Cleanup tentatives expirées |
| LateCode | `expiresAt` | Variable | Cleanup codes expirés |

---

## 🚀 Champs Calculés et Cache

### Champs Dénormalisés (Performance)

Ces champs sont mis à jour via hooks Mongoose ou services pour éviter des agrégations coûteuses :

#### Exam

```typescript
stats: {
  totalAttempts: Number,                 // Incrémenté à chaque tentative
  totalCompletions: Number,              // Incrémenté à chaque soumission
  averageScore: Number,                  // Recalculé à chaque soumission
  averageTime: Number,                   // Recalculé à chaque soumission
  passRate: Number,                      // Recalculé à chaque soumission
  lastAttemptDate: Date                  // Mis à jour à chaque tentative
}
```

**Mise à jour:** Via `ExamEvaluationService.updateExamStats()`

#### Question

```typescript
stats: {
  timesAsked: Number,                    // Incrémenté à chaque réponse
  timesCorrect: Number,                  // Incrémenté si correct
  timesIncorrect: Number,                // Incrémenté si incorrect
  successRate: Number                    // Recalculé : (timesCorrect / timesAsked) * 100
}
```

**Mise à jour:** Via hook post-save sur Response

#### Option

```typescript
stats: {
  timesSelected: Number,                 // Incrémenté à chaque sélection
  selectionRate: Number                  // Recalculé : (timesSelected / total) * 100
}
```

**Mise à jour:** Via hook post-save sur Response

#### Subject

```typescript
_cachedExamCount: Number                 // Nombre d'examens
_cachedLearningUnitCount: Number         // Nombre de chapitres
```

**Mise à jour:** Via hook post-save sur Exam et LearningUnit

#### Field

```typescript
_cachedSubjectCount: Number              // Nombre de matières
```

**Mise à jour:** Via hook post-save sur Subject

#### LearnerProfile

```typescript
stats: {
  totalExamsTaken: Number,               // Incrémenté à chaque tentative
  averageScore: Number,                  // Moyenne mobile
  totalStudyTime: Number,                // Cumul temps passé
  strongSubjects: [ObjectId],            // Top 3 matières (score > 80%)
  weakSubjects: [ObjectId],              // Bottom 3 matières (score < 50%)
  lastActivityDate: Date                 // Mis à jour à chaque activité
}
```

**Mise à jour:** Via Observer Pattern (`StatsUpdateObserver`)

#### PedagogicalProfile

```typescript
stats: {
  totalExamsCreated: Number,             // Incrémenté à chaque création
  totalExamsValidated: Number,           // Incrémenté à chaque validation
  totalStudentsSupervised: Number,       // Count distinct users
  averageStudentScore: Number,           // Moyenne scores tous étudiants
  lastActivityDate: Date                 // Mis à jour à chaque activité
}
```

**Mise à jour:** Via Observer Pattern (`StatsUpdateObserver`)

---

## 🔄 Stratégie de Mise à Jour des Stats

### Post-save Hooks (Synchrone)

```typescript
// Exemple: Question stats update
responseSchema.post('save', async function(doc) {
  const question = await Question.findById(doc.questionId);
  if (question) {
    question.stats.timesAsked++;
    if (doc.isCorrect) {
      question.stats.timesCorrect++;
    } else {
      question.stats.timesIncorrect++;
    }
    question.stats.successRate = (question.stats.timesCorrect / question.stats.timesAsked) * 100;
    await question.save();
  }
});
```

### Observer Pattern (Asynchrone)

```typescript
// Exemple: Profile stats update via Observer
EventPublisher.getInstance().publish({
  type: 'ATTEMPT_SUBMITTED',
  data: { attemptId, userId, examId, score }
});

// StatsUpdateObserver écoute et met à jour les profils
class StatsUpdateObserver implements IObserver {
  async update(event: AppEvent) {
    if (event.type === 'ATTEMPT_SUBMITTED') {
      const { userId, score } = event.data;
      const profile = await LearnerProfile.findOne({ user: userId });

      profile.stats.totalExamsTaken++;
      profile.stats.averageScore = (
        (profile.stats.averageScore * (profile.stats.totalExamsTaken - 1)) + score
      ) / profile.stats.totalExamsTaken;

      await profile.save();
    }
  }
}
```

### Services (Batch Updates)

```typescript
// Exemple: Exam stats update dans ExamEvaluationService
async updateExamStats(examId: string, result: EvaluationResult, timeSpent: number) {
  await Exam.updateOne(
    { _id: examId },
    {
      $inc: {
        'stats.totalCompletions': 1,
        'stats.totalAttempts': 1
      },
      $set: {
        'stats.averageScore': await this.calculateAverageScore(examId),
        'stats.averageTime': await this.calculateAverageTime(examId),
        'stats.passRate': await this.calculatePassRate(examId),
        'stats.lastAttemptDate': new Date()
      }
    }
  );
}
```

---

## 📝 Prochaines Étapes

Pour comprendre comment ces modèles sont utilisés :

1. **[03_DESIGN_PATTERNS.md](./03_DESIGN_PATTERNS.md)** - Patterns appliqués sur ces modèles
2. **[04_API_ENDPOINTS.md](./04_API_ENDPOINTS.md)** - API routes qui manipulent ces modèles
3. **[07_SERVICES.md](./07_SERVICES.md)** - Services métier qui orchestrent ces modèles

---

**Dernière mise à jour:** Décembre 2024
