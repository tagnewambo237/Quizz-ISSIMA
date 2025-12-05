# 01 - Stack Technique Xkorin School

> **Document:** Architecture Technique
> **Version:** 2.0
> **Dernière mise à jour:** Décembre 2024

---

## 📚 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Framework Principal](#framework-principal)
3. [Dépendances Core](#dépendances-core)
4. [Dépendances de Développement](#dépendances-de-développement)
5. [Structure du Projet](#structure-du-projet)
6. [Scripts NPM Disponibles](#scripts-npm-disponibles)
7. [Configuration TypeScript](#configuration-typescript)

---

## 🎯 Vue d'ensemble

Xkorin School est une application web moderne construite avec Next.js 16 et TypeScript, utilisant MongoDB comme base de données et NextAuth.js pour l'authentification.

### Stack Technique

| Catégorie | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| **Framework** | Next.js | 16.0.5 | Framework React full-stack |
| **Runtime** | React | 19.2.0 | Bibliothèque UI |
| **Langage** | TypeScript | 5.7.3 | Typage statique |
| **Base de Données** | MongoDB | - | Base NoSQL |
| **ORM** | Mongoose | 8.10.4 | ODM pour MongoDB |
| **Authentification** | NextAuth.js | 4.24.13 | Auth avec JWT et OAuth |
| **UI Framework** | Tailwind CSS | 4.1.7 | Utility-first CSS |
| **Animations** | Framer Motion | 12.23.24 | Animations React |
| **Forms** | React Hook Form | 7.66.1 | Gestion de formulaires |
| **Validation** | Zod | 3.25.1 | Validation de schémas |
| **Testing** | Jest | 29.7.0 | Framework de tests |

---

## 🚀 Framework Principal

### Next.js 16.0.5

**Pourquoi Next.js ?**
- ✅ **App Router** - Nouvelle architecture de routing basée sur le système de fichiers
- ✅ **Server Components** - Composants React côté serveur par défaut
- ✅ **API Routes** - Backend intégré dans le même projet
- ✅ **Server Actions** - Actions serveur simplifiées
- ✅ **Image Optimization** - Optimisation automatique des images
- ✅ **Streaming SSR** - Rendu progressif côté serveur

**Configuration:**
- Fichier: `next.config.ts`
- Mode: Production optimisé
- Images: Domaines externes autorisés (pour avatars OAuth)
- TypeScript: Strict mode activé

### React 19.2.0

**Nouvelles fonctionnalités utilisées:**
- Hooks modernes (useState, useEffect, useCallback, useMemo)
- Context API pour la gestion d'état (SessionProvider)
- Suspense pour le chargement asynchrone
- Error Boundaries pour la gestion d'erreurs

**React DOM:**
- Version: 19.2.0
- Rendu: Streaming Server-Side Rendering (SSR)

---

## 📦 Dépendances Core

### Base de Données & ORM

#### Mongoose 8.10.4
**Rôle:** Object Data Modeling (ODM) pour MongoDB

**Plugins utilisés:**
- `mongoose-sanitize` - Prévention des injections NoSQL

**Fonctionnalités exploitées:**
- Schémas avec validation TypeScript
- Middleware (pre/post hooks)
- Méthodes d'instance et statiques
- Indexes composés
- Agrégations complexes
- Transactions (pour User + Profile creation)
- Population de références
- Virtual fields

**Configuration:**
```typescript
// lib/mongodb.ts
- Connection pooling
- Auto-reconnect
- Strict mode
- Timestamps automatiques
```

---

### Authentification & Sécurité

#### NextAuth.js 4.24.13
**Rôle:** Authentification complète avec JWT et OAuth

**Providers implémentés:**
1. **Credentials** - Email/Password (bcryptjs)
2. **Google OAuth** - Social login
3. **GitHub OAuth** - Social login

**Features utilisées:**
- JWT Strategy (stateless)
- Custom callbacks (signIn, jwt, session, redirect)
- Custom pages (/login, /register)
- Role-based routing
- Session enrichment avec user data

**Configuration:**
- Secret: `NEXTAUTH_SECRET`
- Session max age: 30 jours
- JWT rotation automatique

#### Bcryptjs 2.4.3
**Rôle:** Hashing sécurisé des mots de passe

**Utilisation:**
```typescript
// Lors de l'enregistrement
const hashedPassword = await bcrypt.hash(password, 10);

// Lors de la connexion
const isValid = await bcrypt.compare(password, user.password);
```

**Configuration:**
- Salt rounds: 10 (équilibre sécurité/performance)

---

### UI & Styling

#### Tailwind CSS 4.1.7
**Rôle:** Framework CSS utility-first

**Plugins:**
- `@tailwindcss/typography` - Styles pour contenu markdown/rich text
- `tailwindcss-animate` - Animations préconfigurées

**Configuration (tailwind.config.ts):**
- Theme personnalisé (couleurs, spacing)
- Dark mode: class-based
- Content: scan de tous les fichiers TSX

**Classes couramment utilisées:**
```css
/* Layout */
flex, grid, container

/* Spacing */
p-4, m-2, gap-6

/* Colors */
bg-primary, text-secondary

/* Typography */
text-lg, font-bold

/* Responsive */
md:flex, lg:grid-cols-3
```

#### Framer Motion 12.23.24
**Rôle:** Animations et transitions

**Patterns d'utilisation:**
- Page transitions (variants)
- Composants animés (<motion.div>)
- Stagger animations (liste d'examens)
- Gestures (hover, tap, drag)

**Exemples:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

---

### Forms & Validation

#### React Hook Form 7.66.1
**Rôle:** Gestion de formulaires performante

**Avantages:**
- Validation temps réel
- Minimal re-renders
- Intégration avec Zod pour validation
- Support TypeScript natif

**Utilisation typique:**
```tsx
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(examSchema)
});
```

#### Zod 3.25.1
**Rôle:** Validation de schémas TypeScript-first

**Utilisation:**
- Validation côté client (formulaires)
- Validation côté serveur (API routes)
- Génération de types TypeScript automatique

**Exemples de schémas:**
```typescript
const ExamSchema = z.object({
  title: z.string().min(3).max(200),
  duration: z.number().min(1).max(300),
  targetLevels: z.array(z.string()).min(1),
  // ...
});
```

---

### Sécurité

#### helmet 8.0.0
**Rôle:** Sécurisation des headers HTTP

**Headers configurés:**
- `X-Frame-Options: DENY` (anti-clickjacking)
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` (CSP strict)
- `Referrer-Policy: strict-origin-when-cross-origin`

#### express-rate-limit 7.5.0
**Rôle:** Protection contre le brute force

**Configuration:**
- Limite: 100 requêtes / 15 minutes par IP
- Message personnalisé en cas de dépassement
- Skip pour admins (via token)

#### validator 13.12.0
**Rôle:** Validation de données

**Validations utilisées:**
- Email validation
- URL validation
- String sanitization
- Escape HTML

---

### Notifications & UI Components

#### sonner 1.7.4
**Rôle:** Toast notifications élégantes

**Types de toasts:**
```typescript
toast.success("Examen créé avec succès");
toast.error("Erreur lors de la soumission");
toast.info("Sauvegarde automatique...");
toast.warning("3 tentatives restantes");
```

**Features:**
- Auto-dismiss configurable
- Stacking automatique
- Animations fluides
- Position personnalisable

---

## 🛠️ Dépendances de Développement

### Testing

#### Jest 29.7.0
**Rôle:** Framework de tests unitaires et d'intégration

**Configuration (jest.config.js):**
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts'
  ]
}
```

#### @testing-library/react 16.3.0
**Rôle:** Tests de composants React

**Philosophie:** Test les composants comme un utilisateur

**Helpers:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

test('should submit form', async () => {
  render(<ExamForm />);

  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Test Exam' }
  });

  fireEvent.click(screen.getByText('Submit'));

  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

#### @testing-library/jest-dom 6.6.4
**Rôle:** Matchers Jest personnalisés pour DOM

**Matchers ajoutés:**
- `toBeInTheDocument()`
- `toHaveClass()`
- `toHaveAttribute()`
- `toBeDisabled()`

#### mongodb-memory-server 10.3.0
**Rôle:** MongoDB en mémoire pour tests

**Avantages:**
- Tests rapides (pas de DB externe)
- Isolation complète
- Reset automatique entre tests

**Setup:**
```typescript
beforeAll(async () => {
  await mongoServer.start();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

#### msw 2.12.3
**Rôle:** Mock Service Worker - Mock des API calls

**Usage:**
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/exams', (req, res, ctx) => {
    return res(ctx.json({ exams: [] }));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
```

---

### TypeScript & Linting

#### TypeScript 5.7.3
**Rôle:** Langage typé statiquement

**Configuration (tsconfig.json):**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Fonctionnalités utilisées:**
- Interfaces et Types
- Generics
- Enums
- Type Guards
- Utility Types (Partial, Pick, Omit, etc.)

#### ESLint 9.18.0
**Rôle:** Linting et formatage

**Plugins:**
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `@typescript-eslint/eslint-plugin`

**Rules personnalisées:**
- Hooks rules (dependencies exhaustives)
- Import order
- Unused vars warnings

---

### Build & Dev Tools

#### @next/eslint-plugin-next 15.2.0
**Rôle:** Linting spécifique Next.js

**Rules:**
- `next/no-html-link-for-pages` - Utiliser <Link> de Next.js
- `next/no-img-element` - Utiliser <Image> de Next.js
- etc.

#### PostCSS 9.0.2
**Rôle:** Transformations CSS

**Plugins:**
- `autoprefixer` - Vendor prefixes automatiques
- Tailwind CSS processing

---

## 📁 Structure du Projet

```
Xkorin School/
│
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Routes groupées (avec layout)
│   │   ├── student/              # Dashboard étudiant
│   │   │   ├── page.tsx
│   │   │   ├── history/
│   │   │   └── history/[attemptId]/
│   │   │
│   │   └── teacher/              # Dashboard enseignant
│   │       ├── page.tsx
│   │       ├── exams/
│   │       │   ├── page.tsx
│   │       │   ├── create/
│   │       │   ├── [id]/
│   │       │   ├── [id]/edit/
│   │       │   ├── [id]/monitor/
│   │       │   └── [id]/results/
│   │       └── students/
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth
│   │   ├── exams/                # Gestion examens
│   │   ├── attempts/             # Tentatives
│   │   ├── profiles/             # Profils utilisateurs
│   │   ├── education-levels/     # Structure éducative
│   │   ├── subjects/
│   │   ├── fields/
│   │   ├── competencies/
│   │   ├── learning-units/
│   │   ├── late-codes/           # Codes d'accès tardif
│   │   └── onboarding/
│   │
│   ├── student/                  # Pages étudiant non-dashboard
│   │   └── exam/[id]/
│   │       ├── lobby/
│   │       ├── take/
│   │       └── result/
│   │
│   ├── login/                    # Auth pages
│   ├── register/
│   ├── onboarding/
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
│
├── components/                   # React Components
│   ├── auth/                     # Authentication components
│   │   ├── SessionProvider.tsx
│   │   └── OAuthButtons.tsx
│   │
│   ├── dashboard/                # Dashboard components
│   │   ├── teacher/
│   │   │   ├── StatsOverview.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── QuickActions.tsx
│   │   └── student/
│   │       ├── MyJourney.tsx
│   │       └── AvailableExams.tsx
│   │
│   ├── exam/                     # Exam components
│   │   ├── ExamCard.tsx
│   │   ├── ExamForm.tsx
│   │   ├── ExamLobby.tsx
│   │   ├── ExamTaker.tsx
│   │   ├── ExamReview.tsx
│   │   ├── QuestionDisplay.tsx
│   │   └── LateCodeModal.tsx
│   │
│   ├── exam-creator/             # Exam creation wizard
│   │   ├── Step1Classification.tsx
│   │   ├── Step2TargetAudience.tsx
│   │   ├── Step3Configuration.tsx
│   │   ├── Step4QuestionEditor.tsx
│   │   └── Step5Preview.tsx
│   │
│   ├── analytics/                # Analytics components
│   │   ├── ExamStats.tsx
│   │   ├── StudentPerformanceTable.tsx
│   │   └── ChartScoreDistribution.tsx
│   │
│   ├── onboarding/               # Onboarding components
│   │   ├── LevelSelector.tsx
│   │   ├── FieldSelector.tsx
│   │   ├── SubjectSelector.tsx
│   │   ├── SubSystemSelector.tsx
│   │   └── StepIndicator.tsx
│   │
│   ├── guards/                   # Permission guards
│   │   ├── RoleGuard.tsx
│   │   └── PermissionGuard.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── MobileHeader.tsx
│   │   └── Footer.tsx
│   │
│   └── ui/                       # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       └── Badge.tsx
│
├── lib/                          # Core Business Logic
│   ├── auth/                     # Authentication strategies
│   │   ├── auth.ts               # NextAuth config
│   │   └── strategies/
│   │       ├── AuthStrategyManager.ts
│   │       ├── CredentialsStrategy.ts
│   │       ├── GoogleStrategy.ts
│   │       └── GitHubStrategy.ts
│   │
│   ├── patterns/                 # Design Patterns
│   │   ├── EvaluationStrategy.ts
│   │   ├── ExamDecorator.ts
│   │   └── AccessHandler.ts
│   │
│   ├── services/                 # Business Services
│   │   ├── ExamServiceV2.ts
│   │   ├── ExamEvaluationService.ts
│   │   ├── ExamAccessService.ts
│   │   ├── ExamWorkflowService.ts
│   │   ├── AttemptService.ts
│   │   ├── LateCodeService.ts
│   │   ├── ProfileService.ts
│   │   ├── EducationStructureService.ts
│   │   └── EducationalHierarchyService.ts
│   │
│   ├── events/                   # Observer Pattern
│   │   ├── EventPublisher.ts
│   │   └── observers/
│   │       ├── EmailNotificationObserver.ts
│   │       ├── XPUpdateObserver.ts
│   │       ├── StatsUpdateObserver.ts
│   │       └── BadgeAwardObserver.ts
│   │
│   ├── factories/                # Factory Pattern
│   │   └── ProfileFactory.ts
│   │
│   ├── security/                 # Security utilities
│   │   ├── headers.ts
│   │   ├── sanitize.ts
│   │   ├── rateLimiter.ts
│   │   └── examSecurity.ts
│   │
│   ├── middleware/               # Custom middleware
│   │   ├── withAuth.ts
│   │   ├── withRole.ts
│   │   └── withAccessControl.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── db.ts
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── helpers.ts
│   │
│   └── mongodb.ts                # MongoDB connection
│
├── models/                       # Mongoose Models (15 models)
│   ├── User.ts
│   ├── LearnerProfile.ts
│   ├── PedagogicalProfile.ts
│   ├── Exam.ts
│   ├── Question.ts
│   ├── Option.ts
│   ├── Attempt.ts
│   ├── Response.ts
│   ├── LateCode.ts
│   ├── EducationLevel.ts
│   ├── Field.ts
│   ├── Subject.ts
│   ├── LearningUnit.ts
│   ├── Competency.ts
│   └── index.ts
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts
│   ├── useAccessControl.ts
│   ├── useExam.ts
│   ├── useAttempt.ts
│   ├── useAntiCheat.ts
│   └── useAutoSave.ts
│
├── types/                        # TypeScript Types
│   ├── next-auth.d.ts            # NextAuth type augmentation
│   ├── models.ts
│   ├── api.ts
│   └── enums.ts
│
├── __tests__/                    # Tests
│   ├── unit/                     # Unit tests
│   │   ├── models/
│   │   ├── services/
│   │   ├── patterns/
│   │   └── utils/
│   ├── integration/              # Integration tests
│   │   ├── api/
│   │   └── workflows/
│   ├── components/               # Component tests
│   └── fixtures/                 # Test data
│
├── scripts/                      # Scripts utilitaires
│   └── seed/                     # Database seeding
│       ├── index.ts
│       ├── education-levels.ts
│       ├── fields.ts
│       ├── subjects.ts
│       ├── learning-units.ts
│       └── competencies.ts
│
├── public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── docs/                         # Documentation
│   ├── architecture/             # Cette documentation
│   ├── V2_EXECUTION_PLAN.md
│   ├── V2_ROADMAP.md
│   └── DESIGN_V2.md
│
├── middleware.ts                 # Next.js Middleware (Auth + Security)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── jest.config.js                # Jest configuration
├── jest.setup.js                 # Jest setup
├── eslint.config.mjs             # ESLint configuration
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment (gitignored)
├── package.json                  # Dependencies
└── README.md                     # Project README
```

---

## 🔧 Scripts NPM Disponibles

### Développement

```bash
# Démarrer le serveur de développement
npm run dev
# → Lance Next.js en mode dev sur http://localhost:3000
# → Hot reload activé
# → Source maps pour debugging

# Build de production
npm run build
# → Compile TypeScript
# → Optimise les assets
# → Génère les bundles
# → Prépare pour déploiement

# Démarrer en production
npm start
# → Lance le serveur optimisé
# → Nécessite un build préalable
```

### Testing

```bash
# Lancer tous les tests
npm test
# → Jest + React Testing Library
# → Mode single-run

# Tests en mode watch
npm run test:watch
# → Re-run automatique lors de changements

# Tests avec couverture
npm run test:coverage
# → Génère rapport de couverture HTML
# → Threshold: 80% (configurable)

# Tests unitaires uniquement
npm run test:unit
# → Filtre: __tests__/unit/**

# Tests d'intégration uniquement
npm run test:integration
# → Filtre: __tests__/integration/**

# Tests de composants uniquement
npm run test:components
# → Filtre: __tests__/components/**
```

### Linting & Formatage

```bash
# Linter le code
npm run lint
# → ESLint sur tous les fichiers
# → Affiche warnings et errors

# Fix automatique des erreurs
npm run lint:fix
# → Corrige les problèmes auto-fixables
# → Format le code

# Vérification TypeScript
npm run type-check
# → Compile TypeScript sans générer de fichiers
# → Vérifie tous les types
```

### Database

```bash
# Seed la base de données
npm run seed
# → Exécute scripts/seed/index.ts
# → Peuple avec données Cameroun éducation
# → Idempotent (peut re-run sans doublons)

# Seed avec nettoyage
npm run seed:clean
# → Supprime données existantes
# → Puis seed fresh data

# Seed niveaux uniquement
npm run seed:levels
# → Seed EducationLevels seulement

# Seed matières uniquement
npm run seed:subjects
# → Seed Subjects seulement
```

---

## ⚙️ Configuration TypeScript

### Compiler Options (tsconfig.json)

```json
{
  "compilerOptions": {
    // Target & Module
    "target": "ES2022",                    // JavaScript moderne
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",         // Next.js optimisé

    // JSX
    "jsx": "preserve",                     // Next.js gère la transformation

    // Type Checking
    "strict": true,                        // Strict mode activé
    "noUnusedLocals": true,                // Error si variable non utilisée
    "noUnusedParameters": true,            // Error si param non utilisé
    "noFallthroughCasesInSwitch": true,    // Error si switch fallthrough
    "forceConsistentCasingInFileNames": true,

    // Module Resolution
    "resolveJsonModule": true,             // Import JSON files
    "isolatedModules": true,               // Babel compatibility
    "skipLibCheck": true,                  // Skip .d.ts files checking

    // Paths
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],                      // Alias @ pour imports
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/models/*": ["models/*"],
      "@/types/*": ["types/*"]
    },

    // Output
    "incremental": true,                   // Build incrémental plus rapide
    "noEmit": true,                        // Next.js gère l'output

    // Plugins
    "plugins": [
      {
        "name": "next"                     // Next.js TypeScript plugin
      }
    ]
  },

  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],

  "exclude": [
    "node_modules",
    ".next",
    "out",
    "coverage"
  ]
}
```

### Type Augmentation (types/next-auth.d.ts)

```typescript
import { DefaultSession, DefaultUser } from 'next-auth';
import { UserRole } from '@/models/User';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      subSystem?: string;
      institution?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: UserRole;
    subSystem?: string;
    institution?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    subSystem?: string;
    institution?: string;
  }
}
```

---

## 📊 Statistiques du Projet

**Code Source:**
- TypeScript: ~15,000 lignes
- React Components: ~80 composants
- API Routes: ~35 endpoints
- Mongoose Models: 15 modèles
- Services: 8 services métier
- Tests: ~150 tests (cible)

**Bundle Size (estimé après build):**
- First Load JS: ~250 KB
- Client-side JS: ~180 KB
- CSS: ~30 KB

**Performance (Next.js metrics):**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Cumulative Layout Shift: < 0.1

---

## 🔗 Dépendances Importantes (package.json)

### Dependencies (Production)

```json
{
  "dependencies": {
    // Framework
    "next": "^16.0.5",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",

    // Database
    "mongoose": "^8.10.4",
    "mongoose-sanitize": "^1.1.0",

    // Authentication
    "next-auth": "^4.24.13",
    "bcryptjs": "^2.4.3",

    // Forms & Validation
    "react-hook-form": "^7.66.1",
    "zod": "^3.25.1",
    "validator": "^13.12.0",

    // UI
    "tailwindcss": "^4.1.7",
    "framer-motion": "^12.23.24",
    "sonner": "^1.7.4",

    // Security
    "helmet": "^8.0.0",
    "express-rate-limit": "^7.5.0",

    // Utilities
    "date-fns": "^4.1.0",
    "clsx": "^2.1.1"
  }
}
```

### DevDependencies (Development)

```json
{
  "devDependencies": {
    // TypeScript
    "typescript": "^5.7.3",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/bcryptjs": "^2.4.6",
    "@types/validator": "^13.12.2",

    // Testing
    "jest": "^29.7.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.6.4",
    "@testing-library/user-event": "^14.6.1",
    "mongodb-memory-server": "^10.3.0",
    "msw": "^2.12.3",

    // Linting
    "eslint": "^9.18.0",
    "@next/eslint-plugin-next": "^15.2.0",
    "@typescript-eslint/eslint-plugin": "^8.20.0",
    "@typescript-eslint/parser": "^8.20.0",

    // Build Tools
    "postcss": "^9.0.2",
    "autoprefixer": "^10.4.20",
    "@tailwindcss/typography": "^0.5.16",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

---

## 🚀 Prochaines Étapes

Pour comprendre comment ces technologies sont utilisées dans le projet :

1. **[02_DATABASE_MODELS.md](./02_DATABASE_MODELS.md)** - Schémas Mongoose détaillés
2. **[03_DESIGN_PATTERNS.md](./03_DESIGN_PATTERNS.md)** - Comment les patterns sont implémentés
3. **[04_API_ENDPOINTS.md](./04_API_ENDPOINTS.md)** - Structure des API Routes

---

**Dernière mise à jour:** Décembre 2024
