# Xkorin School - Documentation de l'Architecture Actuelle

> **Version:** 2.0 (Branch: xkorin-school-v2)
> **Date de création:** Décembre 2024
> **Statut:** Documentation de l'architecture existante avant évolution

---

## 📋 Table des Matières

Cette documentation modulaire décrit l'architecture actuelle de la plateforme Xkorin School telle qu'implémentée dans le code. Elle sert de référence pour comprendre l'existant avant toute évolution.

### Documents Architecture

1. **[01_TECH_STACK.md](./01_TECH_STACK.md)** - Stack Technique
   - Framework et versions
   - Dépendances principales
   - Structure du projet
   - Scripts npm disponibles

2. **[02_DATABASE_MODELS.md](./02_DATABASE_MODELS.md)** - Modèles de Données
   - 15 modèles Mongoose documentés
   - Schémas complets avec indexes
   - Relations entre entités
   - Champs calculés et cache

3. **[03_DESIGN_PATTERNS.md](./03_DESIGN_PATTERNS.md)** - Design Patterns
   - Strategy Pattern (Évaluation)
   - Decorator Pattern (Enrichissement)
   - Chain of Responsibility (Permissions)
   - Observer Pattern (Événements)
   - Factory Pattern (Création de profils)
   - Singleton Pattern

4. **[04_API_ENDPOINTS.md](./04_API_ENDPOINTS.md)** - API Routes
   - Routes d'authentification
   - Gestion des examens (v1 et v2)
   - Structure éducative (niveaux, matières)
   - Tentatives et réponses
   - Codes d'accès tardif

5. **[05_FRONTEND_STRUCTURE.md](./05_FRONTEND_STRUCTURE.md)** - Architecture Frontend
   - Pages Next.js (App Router)
   - Composants React organisés
   - Hooks personnalisés
   - Guards et protections

6. **[06_AUTHENTICATION.md](./06_AUTHENTICATION.md)** - Authentification & Sécurité
   - NextAuth.js configuration
   - Stratégies d'authentification
   - Middleware de protection
   - Sécurité anti-triche
   - Headers de sécurité

7. **[07_SERVICES.md](./07_SERVICES.md)** - Couche Services
   - Services métier implémentés
   - Logique d'évaluation
   - Gestion des workflows
   - Services de hiérarchie éducative

8. **[08_DEPLOYMENT.md](./08_DEPLOYMENT.md)** - Configuration & Déploiement
   - Variables d'environnement
   - Configuration Next.js
   - Scripts de seeding
   - Structure de test

---

## 🎯 Objectif de cette Documentation

Cette documentation a été créée pour :

✅ **Comprendre l'existant** - État actuel de l'architecture avant évolution
✅ **Référence technique** - Guide complet pour les développeurs
✅ **Base d'évolution** - Comprendre ce qui existe avant de modifier
✅ **Onboarding** - Faciliter l'intégration de nouveaux développeurs
✅ **Maintenance** - Référence pour les corrections et améliorations

---

## 📊 État d'Avancement du Projet

D'après le V2_EXECUTION_PLAN.md et V2_ROADMAP.md, voici l'état actuel :

### ✅ Complété (Flows 1-21)

- **BLOC 1: Foundation (Backend Core)** ✅
  - Flow 1: Data Seeding ✅
  - Modèles de données V2 implémentés
  - Design patterns en place

- **BLOC 2: API Layer (Backend Services)** ✅
  - Flow 8-13: APIs éducatives, examens, tentatives ✅
  - Flow 14-15: Middleware et guards ✅

- **BLOC 3: Authentication & Onboarding** ✅
  - Flow 16-17: Registration et onboarding ✅

- **BLOC 4: Teacher Dashboard** ✅
  - Flow 18-21: Interface enseignant complète ✅

### 🚧 En Cours / À Compléter (Flows 22-32)

- **BLOC 5: Student Dashboard** - Partiellement complété
- **BLOC 6: Testing & Migration** - Tests à compléter
- **BLOC 7: Post-MVP** - Gamification, Learning Modes, Admin Dashboards

---

## 🔑 Concepts Clés

### Architecture Générale

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Student    │  │   Teacher    │  │    Admin     │  │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│              MIDDLEWARE & AUTHENTICATION                 │
│    NextAuth.js • Role Guards • Security Headers         │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  API ROUTES (Next.js)                    │
│  /api/exams • /api/attempts • /api/profiles • etc.      │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                   SERVICES LAYER                         │
│  ExamServiceV2 • AttemptService • ProfileService        │
│  + Design Patterns (Strategy, Chain, Observer, etc.)    │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER (Mongoose)                   │
│  15 Models • Indexes • Validation • Relations           │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                 DATABASE (MongoDB)                       │
│         Collections • Indexes • Aggregations            │
└─────────────────────────────────────────────────────────┘
```

### Hiérarchie Éducative (Composite Pattern)

```
SubSystem (FRANCOPHONE / ANGLOPHONE / BILINGUAL)
  └─ EducationLevel (6ème, Tle C, Licence 1, etc.)
      └─ Field (Série C, Série D, Arts, Sciences, etc.)
          └─ Subject (Mathématiques, Physique, etc.)
              └─ LearningUnit (Chapitre, Module)
                  └─ Competency (Digital, Entrepreneurial, etc.)
```

### Workflow d'un Examen

```
DRAFT → submit-validation → PENDING_VALIDATION
                                    ↓
                    validate (Inspector) → VALIDATED
                                    ↓
                          publish → PUBLISHED
                                    ↓
                          archive → ARCHIVED
```

### Workflow d'une Tentative

```
1. Student selects exam
2. POST /api/attempts/start → returns attemptId + resumeToken
3. Student answers questions
4. POST /api/attempts/answer (auto-save every 30s)
5. POST /api/attempts/submit
6. EvaluationStrategy → calculates score
7. Decorators → add bonuses/penalties/badges
8. Observer Pattern → triggers notifications, XP update, stats
9. Results displayed to student
```

---

## 🛠️ Comment Utiliser cette Documentation

### Pour Comprendre l'Architecture
1. Commencez par **[01_TECH_STACK.md](./01_TECH_STACK.md)** pour le contexte technique
2. Lisez **[02_DATABASE_MODELS.md](./02_DATABASE_MODELS.md)** pour comprendre les données
3. Explorez **[03_DESIGN_PATTERNS.md](./03_DESIGN_PATTERNS.md)** pour les patterns utilisés

### Pour Développer de Nouvelles Features
1. Consultez **[04_API_ENDPOINTS.md](./04_API_ENDPOINTS.md)** pour les APIs disponibles
2. Référez-vous à **[07_SERVICES.md](./07_SERVICES.md)** pour la logique métier
3. Utilisez **[05_FRONTEND_STRUCTURE.md](./05_FRONTEND_STRUCTURE.md)** pour l'UI

### Pour Débugger ou Maintenir
1. Vérifiez **[06_AUTHENTICATION.md](./06_AUTHENTICATION.md)** pour les problèmes d'auth
2. Consultez **[08_DEPLOYMENT.md](./08_DEPLOYMENT.md)** pour la configuration
3. Référez-vous aux modèles dans **[02_DATABASE_MODELS.md](./02_DATABASE_MODELS.md)**

---

## 📚 Documents de Référence

- **[V2_EXECUTION_PLAN.md](../V2_EXECUTION_PLAN.md)** - Plan d'exécution détaillé (32 flows)
- **[V2_ROADMAP.md](../V2_ROADMAP.md)** - Roadmap générale du projet
- **[DESIGN_V2.md](../DESIGN_V2.md)** - Design architectural complet avec patterns

---

## 🤝 Contribution

Cette documentation reflète l'état actuel du code. Si vous modifiez l'architecture :

1. ✅ Mettez à jour le document correspondant
2. ✅ Ajoutez la date de modification
3. ✅ Documentez les nouvelles décisions architecturales
4. ✅ Ajoutez des exemples de code si pertinent

---

## 📝 Notes Importantes

⚠️ **Cette documentation décrit l'EXISTANT, pas la cible finale**
- Le V2_ROADMAP.md décrit ce qui doit être fait
- Cette documentation décrit ce qui EST fait actuellement
- Utilisez les deux ensemble pour comprendre l'écart et planifier les évolutions

⚠️ **Certains flows sont partiellement implémentés**
- Vérifiez toujours le code source pour l'implémentation exacte
- Les tests peuvent révéler des fonctionnalités non documentées

⚠️ **Branch actuelle : `xkorin-school-v2`**
- Cette documentation est basée sur cette branche
- Les autres branches peuvent avoir des différences significatives

---

**Dernière mise à jour:** Janvier 2026 (ajout du module Student **Orientation** + route `/api/student/orientation/schools` + redirection post-auth STUDENT)
**Contributeurs:** Documentation générée à partir de l'analyse du code existant
