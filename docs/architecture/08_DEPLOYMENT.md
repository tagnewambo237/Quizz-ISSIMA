# 08 - Configuration & Déploiement

> **Document:** Deployment & Configuration
> **Version:** 2.0
> **Dernière mise à jour:** Décembre 2024

---

## 📚 Table des Matières

1. [Variables d'Environnement](#variables-denvironnement)
2. [Configuration Next.js](#configuration-nextjs)
3. [Scripts NPM](#scripts-npm)
4. [Database Seeding](#database-seeding)
5. [Testing Setup](#testing-setup)
6. [Déploiement Production](#déploiement-production)
7. [Monitoring & Logs](#monitoring--logs)

---

## 🔐 Variables d'Environnement

### Fichier `.env.example`

```bash
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/Xkorin School?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32 to generate"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Node Environment
NODE_ENV="development"
```

### Configuration par Environnement

#### Development (`.env.local`)

```bash
DATABASE_URL="mongodb://localhost:27017/Xkorin School-dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
NODE_ENV="development"
```

#### Production (`.env.production`)

```bash
DATABASE_URL="mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/Xkorin School-prod"
NEXTAUTH_URL="https://Xkorin School.com"
NEXTAUTH_SECRET="<strong-production-secret>"
NODE_ENV="production"

# Optional: Monitoring
SENTRY_DSN="https://..."
VERCEL_ANALYTICS_ID="..."
```

### Génération de Secrets

```bash
# Générer NEXTAUTH_SECRET
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ⚙️ Configuration Next.js

### `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Strict mode pour développement
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google OAuth avatars
      'avatars.githubusercontent.com', // GitHub OAuth avatars
      'storage.googleapis.com'       // Cloud storage
    ],
    formats: ['image/avif', 'image/webp']
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false
      }
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ne pas bundler ces modules côté client
      config.externals.push({
        'mongodb': 'commonjs mongodb',
        'mongoose': 'commonjs mongoose'
      });
    }
    return config;
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

export default nextConfig;
```

---

## 📜 Scripts NPM

### `package.json` Scripts

```json
{
  "scripts": {
    // Development
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",

    // Build
    "build": "next build",
    "start": "next start",

    // Database
    "seed": "ts-node scripts/seed/index.ts",
    "seed:clean": "ts-node scripts/seed/index.ts --clean",
    "seed:levels": "ts-node scripts/seed/education-levels.ts",
    "seed:subjects": "ts-node scripts/seed/subjects.ts",

    // Testing
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:components": "jest --testPathPattern=__tests__/components",

    // Linting
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",

    // Format
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",

    // Utilities
    "clean": "rm -rf .next out node_modules",
    "postinstall": "patch-package"
  }
}
```

### Usage

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Tests
npm test
npm run test:coverage

# Seeding
npm run seed
npm run seed:clean

# Linting
npm run lint
npm run type-check
```

---

## 🌱 Database Seeding

### Structure des Scripts

```
/scripts/seed/
├── index.ts                    # Script principal
├── education-levels.ts         # Seed niveaux
├── fields.ts                   # Seed filières
├── subjects.ts                 # Seed matières
├── learning-units.ts           # Seed chapitres
├── competencies.ts             # Seed compétences
├── data/
│   ├── francophone/
│   │   ├── levels.json
│   │   ├── fields.json
│   │   └── subjects.json
│   ├── anglophone/
│   │   ├── levels.json
│   │   ├── fields.json
│   │   └── subjects.json
│   └── competencies.json
└── utils/
    └── seed-helpers.ts
```

### Script Principal (`scripts/seed/index.ts`)

```typescript
import mongoose from 'mongoose';
import { seedEducationLevels } from './education-levels';
import { seedFields } from './fields';
import { seedSubjects } from './subjects';
import { seedLearningUnits } from './learning-units';
import { seedCompetencies } from './competencies';

async function seed() {
  try {
    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL!);
    console.log('✓ Connected to MongoDB');

    // Check for --clean flag
    const shouldClean = process.argv.includes('--clean');

    if (shouldClean) {
      console.log('🗑️  Cleaning existing data...');
      await cleanDatabase();
    }

    // Seed in order (due to dependencies)
    console.log('🌱 Starting seeding process...\n');

    await seedEducationLevels();
    console.log('✓ Education levels seeded\n');

    await seedFields();
    console.log('✓ Fields seeded\n');

    await seedSubjects();
    console.log('✓ Subjects seeded\n');

    await seedLearningUnits();
    console.log('✓ Learning units seeded\n');

    await seedCompetencies();
    console.log('✓ Competencies seeded\n');

    console.log('✅ Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

async function cleanDatabase() {
  await EducationLevel.deleteMany({});
  await Field.deleteMany({});
  await Subject.deleteMany({});
  await LearningUnit.deleteMany({});
  await Competency.deleteMany({});
  console.log('✓ Database cleaned\n');
}

// Run seeding
seed();
```

### Helpers (`scripts/seed/utils/seed-helpers.ts`)

```typescript
/**
 * Find or create document (idempotent seeding)
 */
export async function findOrCreate<T>(
  Model: any,
  query: any,
  data: any
): Promise<T> {
  let doc = await Model.findOne(query);

  if (!doc) {
    doc = await Model.create(data);
    console.log(`  Created: ${data.name || data.title}`);
  } else {
    console.log(`  Exists: ${data.name || data.title}`);
  }

  return doc;
}

/**
 * Bulk create with error handling
 */
export async function bulkCreate<T>(
  Model: any,
  dataArray: any[]
): Promise<T[]> {
  const created = [];

  for (const data of dataArray) {
    try {
      const doc = await findOrCreate(Model, { code: data.code }, data);
      created.push(doc);
    } catch (error) {
      console.error(`  Error creating ${data.name}:`, error.message);
    }
  }

  return created;
}
```

---

## 🧪 Testing Setup

### Jest Configuration (`jest.config.js`)

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
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
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)'
  ]
};

module.exports = createJestConfig(customJestConfig);
```

### Jest Setup (`jest.setup.js`)

```javascript
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'STUDENT'
      }
    },
    status: 'authenticated'
  })
}));
```

---

## 🚀 Déploiement Production

### Vercel (Recommandé pour Next.js)

#### Prérequis

1. Compte Vercel
2. Repository Git (GitHub, GitLab, Bitbucket)
3. MongoDB Atlas cluster

#### Configuration Vercel

**`vercel.json`:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_URL": "@nextauth_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

#### Déploiement

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
```

---

### Docker (Alternative)

#### `Dockerfile`

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

#### Commandes Docker

```bash
# Build
docker build -t Xkorin School .

# Run
docker run -p 3000:3000 Xkorin School

# Docker Compose
docker-compose up -d
```

---

## 📊 Monitoring & Logs

### Logging Configuration

#### Winston Logger (`lib/logger.ts`)

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

#### Usage

```typescript
import { logger } from '@/lib/logger';

logger.info('User signed in', { userId: user.id });
logger.error('Failed to create exam', { error: error.message });
```

---

### Error Tracking (Sentry)

#### Installation

```bash
npm install @sentry/nextjs
```

#### Configuration (`sentry.client.config.ts`)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});
```

---

### Performance Monitoring

#### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🔧 Maintenance Tasks

### Database Backups

```bash
# MongoDB dump
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://..." backup-20250105/
```

### Health Checks

**API Route:** `/api/health`

```typescript
export async function GET() {
  try {
    await mongoose.connection.db.admin().ping();
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message
      },
      { status: 500 }
    );
  }
}
```

---

## ✅ Checklist Déploiement

### Avant Production

- [ ] Variables d'environnement configurées
- [ ] NEXTAUTH_SECRET généré (production)
- [ ] MongoDB Atlas cluster créé
- [ ] OAuth credentials configurés
- [ ] Tests passent (npm test)
- [ ] Build réussit (npm run build)
- [ ] Database seedée
- [ ] Security headers configurés
- [ ] Error tracking setup (Sentry)
- [ ] Backups configurés
- [ ] Monitoring setup

### Après Déploiement

- [ ] Health check endpoint fonctionne
- [ ] Authentication fonctionne (Credentials + OAuth)
- [ ] Exams can be created
- [ ] Students can take exams
- [ ] Results are calculated correctly
- [ ] Emails are sent
- [ ] Performance acceptable

---

## 📝 Prochaines Étapes

Pour comprendre l'architecture complète :

1. **[INDEX.md](./INDEX.md)** - Retour à la table des matières
2. **[01_TECH_STACK.md](./01_TECH_STACK.md)** - Stack technique
3. **[06_AUTHENTICATION.md](./06_AUTHENTICATION.md)** - Configuration auth

---

**Dernière mise à jour:** Décembre 2024
