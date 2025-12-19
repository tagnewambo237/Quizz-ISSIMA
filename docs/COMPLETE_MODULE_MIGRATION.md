# 📘 Migration Complète vers Modules Autonomes

## Objectif

Transformer l'architecture actuelle **hybride** en architecture **modulaire pure** où chaque module contient TOUS ses fichiers (models, components, hooks, contexts).

---

## 🎯 Avantages d'une Architecture Modulaire Pure

### 1. Encapsulation Complète
- ✅ Chaque module est **autonome**
- ✅ Pas de dépendances implicites
- ✅ Facile à extraire en microservice

### 2. Testabilité
- ✅ Tester un module = tout est dans un dossier
- ✅ Mock facile des dépendances
- ✅ Tests isolés

### 3. Scalabilité Équipe
- ✅ Une équipe = un module
- ✅ Pas de conflits sur les fichiers partagés
- ✅ Développement parallèle

### 4. Réutilisabilité
- ✅ Module = package npm potentiel
- ✅ Partage entre projets facile
- ✅ Versioning par module

---

## 📁 Structure Cible par Module

```
/modules/[module-name]/
├── models/              # Modèles Mongoose du module
│   ├── [Model].ts
│   └── index.ts         # Export tous les models
│
├── services/            # Logique métier
│   ├── [Service].ts
│   └── index.ts
│
├── components/          # Composants React UI
│   ├── [Component].tsx
│   └── index.ts
│
├── hooks/              # Hooks React personnalisés
│   ├── use[Hook].ts
│   └── index.ts
│
├── contexts/           # React Contexts (si besoin)
│   ├── [Context].tsx
│   └── index.ts
│
├── events/
│   ├── types.ts
│   ├── handlers/
│   └── index.ts
│
├── utils/              # Utilitaires spécifiques au module
│   └── [helper].ts
│
└── index.ts            # API PUBLIQUE du module (barrel export)
```

---

## 🔄 Étapes de Migration

### Étape 1 : Cartographier les Dépendances

Pour chaque module, identifier :

```bash
# Exemple : Module Gamification
Models utilisés :
- /models/UserXP.ts ✅ (spécifique gamification)
- /models/XPTransaction.ts ✅ (spécifique gamification)
- /models/User.ts ⚠️ (partagé - garder en /models/)

Components utilisés :
- /components/gamification/XPDisplay.tsx ✅ (déplacer)
- /components/gamification/BadgeCard.tsx ✅ (déplacer)
- /components/ui/Card.tsx ⚠️ (UI partagé - garder)

Hooks utilisés :
- /hooks/useUserXP.ts ✅ (déplacer)
- /hooks/useBadges.ts ✅ (déplacer)
```

### Étape 2 : Créer un Script de Migration

```typescript
// scripts/migrate-to-modules.ts
import fs from 'fs-extra';
import path from 'path';

const MODULE_MAPPING = {
  gamification: {
    models: ['UserXP', 'XPTransaction', 'Badge'],
    components: ['components/gamification/**/*'],
    hooks: ['hooks/useUserXP', 'hooks/useBadges', 'hooks/useLeaderboard'],
    contexts: []
  },
  messaging: {
    models: ['Notification', 'Message', 'Forum', 'ForumPost', 'Request'],
    components: ['components/messaging/**/*', 'components/notifications/**/*'],
    hooks: ['hooks/useNotifications', 'hooks/useMessages'],
    contexts: ['contexts/NotificationContext']
  },
  // ... autres modules
};

async function migrateModule(moduleName: string, config: any) {
  const modulePath = path.join('modules', moduleName);
  
  // 1. Créer structure
  await fs.ensureDir(path.join(modulePath, 'models'));
  await fs.ensureDir(path.join(modulePath, 'components'));
  await fs.ensureDir(path.join(modulePath, 'hooks'));
  await fs.ensureDir(path.join(modulePath, 'contexts'));
  
  // 2. Déplacer models
  for (const model of config.models) {
    const src = path.join('models', `${model}.ts`);
    const dest = path.join(modulePath, 'models', `${model}.ts`);
    await fs.move(src, dest);
    console.log(`✅ Moved ${src} → ${dest}`);
  }
  
  // 3. Déplacer components
  // ... (similaire)
  
  // 4. Déplacer hooks
  // ... (similaire)
  
  // 5. Créer barrel exports
  await createBarrelExports(modulePath);
}

async function createBarrelExports(modulePath: string) {
  // models/index.ts
  const models = await fs.readdir(path.join(modulePath, 'models'));
  const modelExports = models
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => `export * from './${f.replace('.ts', '')}';`)
    .join('\n');
  
  await fs.writeFile(
    path.join(modulePath, 'models', 'index.ts'),
    modelExports
  );
  
  // Répéter pour components, hooks, etc.
}

// Exécuter
for (const [moduleName, config] of Object.entries(MODULE_MAPPING)) {
  await migrateModule(moduleName, config);
}
```

### Étape 3 : Mettre à Jour les Imports

Utiliser un script de remplacement :

```bash
# Exemple : Remplacer tous les imports de UserXP
find . -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  's|from "@/models/UserXP"|from "@/modules/gamification/models"|g'

# Ou avec un script Node.js plus robuste
node scripts/update-imports.js
```

Script `update-imports.js` :
```javascript
const fs = require('fs-extra');
const glob = require('glob');

const IMPORT_MAPPINGS = {
  '@/models/UserXP': '@/modules/gamification/models',
  '@/models/XPTransaction': '@/modules/gamification/models',
  '@/hooks/useUserXP': '@/modules/gamification/hooks',
  '@/components/gamification/XPDisplay': '@/modules/gamification/components',
  // ... etc
};

async function updateImports() {
  const files = glob.sync('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**']
  });
  
  for (const file of files) {
    let content = await fs.readFile(file, 'utf-8');
    let modified = false;
    
    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
      if (content.includes(oldImport)) {
        content = content.replace(
          new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          newImport
        );
        modified = true;
      }
    }
    
    if (modified) {
      await fs.writeFile(file, content);
      console.log(`✅ Updated ${file}`);
    }
  }
}

updateImports();
```

### Étape 4 : Créer les Barrel Exports

Pour chaque module, créer un `index.ts` qui expose l'API publique :

```typescript
// modules/gamification/index.ts

// Models
export * from './models';

// Services
export { GamificationService } from './services/GamificationService';

// Components (sélectif - seulement ce qui est réutilisable)
export { XPDisplay } from './components/XPDisplay';
export { BadgeCard } from './components/BadgeCard';
export { LeaderboardTable } from './components/LeaderboardTable';

// Hooks
export { useUserXP } from './hooks/useUserXP';
export { useBadges } from './hooks/useBadges';
export { useLeaderboard } from './hooks/useLeaderboard';

// Types
export * from './events/types';
```

Utilisation :
```typescript
// Avant (imports multiples)
import { UserXP } from '@/models/UserXP';
import { GamificationService } from '@/lib/services/GamificationService';
import { useUserXP } from '@/hooks/useUserXP';

// Après (import unique du module)
import { UserXP, GamificationService, useUserXP } from '@/modules/gamification';
```

---

## 📊 Ordre de Migration Recommandé

### Phase 1 : Modules Indépendants (Semaine 1-2)

1. **Gamification** (peu de dépendances)
   - Models : UserXP, XPTransaction
   - Components : XPDisplay, BadgeCard, LevelProgress
   - Hooks : useUserXP, useBadges

2. **Messaging** (autonome)
   - Models : Notification, Message, Forum
   - Components : NotificationBell, MessageList
   - Hooks : useNotifications

### Phase 2 : Modules Intermédiaires (Semaine 3-4)

3. **Analytics**
   - Models : Analytics, Report
   - Components : StatCard, ChartDisplay
   - Hooks : useStats

4. **Invitations**
   - Models : Invitation
   - Components : InvitationCard
   - Hooks : useInvitations

### Phase 3 : Modules Core (Semaine 5-6)

5. **Assessments**
   - Models : Exam, Question, LateCode
   - Components : ExamCard, QuestionForm
   - Hooks : useExams

6. **Exam Execution**
   - Models : Attempt, Response
   - Components : AttemptViewer, ResponseForm
   - Hooks : useAttempt

7. **Academic Structure**
   - Models : School, Class, Subject, Syllabus
   - Components : ClassCard, SchoolSelector
   - Hooks : useClasses

8. **Auth**
   - Models : User, Profile
   - Components : LoginForm, RegisterForm
   - Hooks : useAuth

---

## 🔧 Gestion des Dépendances Partagées

### Cas 1 : Models Partagés (User, School)

**Option A** : Garder en `/models/` (recommandé au début)
```typescript
// modules/gamification/services/GamificationService.ts
import { User } from '@/models/User';  // OK - partagé
import { UserXP } from '../models/UserXP';  // Local au module
```

**Option B** : Créer un module "shared"
```
/modules/
├── shared/
│   ├── models/
│   │   ├── User.ts
│   │   └── School.ts
│   └── index.ts
```

### Cas 2 : UI Components Partagés

Garder `/components/ui/` pour les composants design system :
```
/components/
├── ui/              # Shadcn/ui - partagé entre tous
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
```

Ne PAS déplacer dans les modules - c'est du design system.

### Cas 3 : Hooks Utilitaires

Garder `/hooks/` pour les hooks vraiment génériques :
```
/hooks/
├── useDebounce.ts   # Utilitaire - garder
├── useMediaQuery.ts # Utilitaire - garder
└── useAuth.ts       # ⚠️ Déplacer vers modules/auth/
```

---

## ✅ Checklist de Migration par Module

Pour chaque module :

- [ ] **Créer structure complète**
  ```bash
  mkdir -p modules/[name]/{models,services,components,hooks,contexts,events,utils}
  ```

- [ ] **Déplacer Models**
  - [ ] Identifier models spécifiques
  - [ ] Déplacer fichiers
  - [ ] Créer `models/index.ts`

- [ ] **Déplacer Components**
  - [ ] Identifier composants spécifiques
  - [ ] Déplacer fichiers
  - [ ] Créer `components/index.ts`

- [ ] **Déplacer Hooks**
  - [ ] Identifier hooks spécifiques
  - [ ] Déplacer fichiers
  - [ ] Créer `hooks/index.ts`

- [ ] **Déplacer Contexts** (si applicable)
  - [ ] Identifier contexts spécifiques
  - [ ] Déplacer fichiers
  - [ ] Créer `contexts/index.ts`

- [ ] **Créer Barrel Export**
  - [ ] Créer `modules/[name]/index.ts`
  - [ ] Exporter API publique uniquement

- [ ] **Mettre à Jour Imports**
  - [ ] Exécuter script de remplacement
  - [ ] Vérifier manuellement les imports critiques
  - [ ] Tester compilation TypeScript

- [ ] **Tester**
  - [ ] Build réussit : `npm run build`
  - [ ] Tests passent : `npm test`
  - [ ] Application fonctionne : `npm run dev`

---

## 🎯 Résultat Final

### Avant (Hybride)
```
/
├── models/          # 30+ models mélangés
├── components/      # 100+ composants mélangés
├── hooks/           # 20+ hooks mélangés
├── lib/services/    # 15+ services mélangés
└── modules/
    └── gamification/
        ├── services/
        └── events/
```

### Après (Modulaire Pur)
```
/
├── models/          # Seulement models VRAIMENT partagés (User, School)
├── components/ui/   # Seulement design system (Button, Card)
├── hooks/           # Seulement hooks utilitaires (useDebounce)
└── modules/
    ├── gamification/
    │   ├── models/      # UserXP, XPTransaction, Badge
    │   ├── services/    # GamificationService
    │   ├── components/  # XPDisplay, BadgeCard, etc.
    │   ├── hooks/       # useUserXP, useBadges
    │   ├── events/
    │   └── index.ts     # API publique
    │
    ├── messaging/
    │   ├── models/      # Notification, Message, Forum
    │   ├── components/  # NotificationBell, MessageList
    │   ├── hooks/       # useNotifications
    │   └── index.ts
    │
    └── ... (6 autres modules)
```

---

## 📚 Ressources

- **Architecture Patterns** : Domain-Driven Design (DDD)
- **Package Structure** : Feature-based folders
- **Barrel Exports** : TypeScript handbook

---

## 🚀 Prochaine Action

**Recommandation** : Commencer par **Gamification** (le plus simple, peu de dépendances).

```bash
# 1. Créer structure
mkdir -p modules/gamification/{models,components,hooks}

# 2. Déplacer models
mv models/UserXP.ts modules/gamification/models/
mv models/XPTransaction.ts modules/gamification/models/

# 3. Déplacer components
mv components/gamification/* modules/gamification/components/

# 4. Déplacer hooks
mv hooks/useUserXP.ts modules/gamification/hooks/
mv hooks/useBadges.ts modules/gamification/hooks/

# 5. Créer barrel exports
# ... (voir étape 4)

# 6. Mettre à jour imports
node scripts/update-imports.js

# 7. Tester
npm run build
```

Bon courage pour la migration complète ! 🎯
