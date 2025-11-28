# Migration de Prisma vers Mongoose

## ✅ Étapes complétées

1. **Installation de Mongoose** ✓
   - Désinstallé Prisma et @prisma/client
   - Installé Mongoose

2. **Création des modèles Mongoose** ✓
   - `/models/User.ts`
   - `/models/Exam.ts`
   - `/models/Question.ts`
   - `/models/Option.ts`
   - `/models/Attempt.ts`
   - `/models/Response.ts`
   - `/models/LateCode.ts`

3. **Configuration de la connexion** ✓
   - `/lib/mongodb.ts` - Connexion MongoDB avec cache pour Serverless

4. **Migration des routes de base** ✓
   - `/app/api/register/route.ts` - Inscription utilisateur
   - `/lib/auth.ts` - NextAuth configuration

## 🔄 Fichiers à migrer

### Routes API prioritaires

1. **`/app/api/exams/route.ts`** - Création et liste des examens
2. **`/app/api/exams/[id]/route.ts`** - Détails, modification, suppression d'examen
3. **`/app/api/attempts/start/route.ts`** - Démarrer une tentative
4. **`/app/api/attempts/answer/route.ts`** - Répondre à une question
5. **`/app/api/attempts/submit/route.ts`** - Soumettre un examen
6. **`/app/api/attempts/[id]/route.ts`** - Détails d'une tentative
7. **`/app/api/resume/route.ts`** - Reprendre un examen
8. **`/app/api/late-codes/route.ts`** - Codes de retard
9. **`/app/api/exams/[id]/duplicate/route.ts`** - Dupliquer un examen

### Pages Dashboard

1. **`/app/(dashboard)/teacher/page.tsx`** - Dashboard enseignant
2. **`/app/(dashboard)/teacher/exams/page.tsx`** - Liste des examens
3. **`/app/(dashboard)/teacher/students/page.tsx`** - Liste des étudiants
4. **`/app/(dashboard)/teacher/exams/[id]/edit/page.tsx`** - Édition d'examen
5. **`/app/(dashboard)/teacher/exams/[id]/monitor/page.tsx`** - Monitoring
6. **`/app/(dashboard)/student/page.tsx`** - Dashboard étudiant
7. **`/app/(dashboard)/student/history/page.tsx`** - Historique étudiant

### Pages Examen

1. **`/app/student/exam/[id]/lobby/page.tsx`** - Salle d'attente
2. **`/app/student/exam/[id]/take/page.tsx`** - Passer l'examen
3. **`/app/student/exam/[id]/result/page.tsx`** - Résultats

## 📝 Guide de migration

### Imports à changer

**Avant (Prisma):**
```typescript
import { prisma } from "@/lib/prisma"
```

**Après (Mongoose):**
```typescript
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Exam from "@/models/Exam"
// ... autres modèles selon les besoins
```

### Connexion à la base

**Toujours appeler `connectDB()` au début de chaque route API:**
```typescript
export async function GET() {
    await connectDB()
    // ... reste du code
}
```

### Opérations courantes

#### Créer un document
**Avant:**
```typescript
const user = await prisma.user.create({
    data: { name, email, password }
})
```

**Après:**
```typescript
const user = await User.create({ name, email, password })
```

#### Trouver un document
**Avant:**
```typescript
const user = await prisma.user.findUnique({
    where: { email }
})
```

**Après:**
```typescript
const user = await User.findOne({ email })
```

#### Trouver plusieurs documents
**Avant:**
```typescript
const exams = await prisma.exam.findMany({
    where: { createdById: userId },
    include: { questions: true }
})
```

**Après:**
```typescript
const exams = await Exam.find({ createdById: userId })
    .populate('questions')
```

#### Mettre à jour
**Avant:**
```typescript
await prisma.user.update({
    where: { id: userId },
    data: { name: newName }
})
```

**Après:**
```typescript
await User.findByIdAndUpdate(userId, { name: newName })
```

#### Supprimer
**Avant:**
```typescript
await prisma.exam.delete({
    where: { id: examId }
})
```

**Après:**
```typescript
await Exam.findByIdAndDelete(examId)
```

#### Compter
**Avant:**
```typescript
const count = await prisma.user.count({
    where: { role: 'STUDENT' }
})
```

**Après:**
```typescript
const count = await User.countDocuments({ role: 'STUDENT' })
```

### Gestion des IDs

- Prisma utilise `id` (string)
- Mongoose utilise `_id` (ObjectId)
- Pour convertir en string: `user._id.toString()`
- Pour créer un ObjectId: `new mongoose.Types.ObjectId(idString)`

### Relations (populate)

**Avant (Prisma include):**
```typescript
const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
        questions: {
            include: {
                options: true
            }
        }
    }
})
```

**Après (Mongoose populate):**
```typescript
const exam = await Exam.findById(examId)
    .populate({
        path: 'questions',
        populate: { path: 'options' }
    })
```

**Note:** Avec Mongoose, vous devrez peut-être faire des requêtes séparées car les relations ne sont pas automatiques comme avec Prisma.

## 🗑️ Fichiers à supprimer

- `/prisma/schema.prisma`
- `/lib/prisma.ts`
- `/prisma.config.ts`
- Dossier `/prisma/` (après migration complète)

## ⚙️ Configuration

### DATABASE_URL dans .env

Utilisez la connexion directe sans `replicaSet`:
```
DATABASE_URL="mongodb://xkorinUser:PASSWORD@185.98.139.202/qcmapp?authSource=admin&directConnection=true"
```

## 🧪 Test

Pour tester la migration:
```bash
npm run dev
```

Puis testez l'inscription d'un utilisateur via `/register`

## 📌 Notes importantes

1. **Pas de transactions automatiques** - Mongoose sur MongoDB standalone ne supporte pas les transactions
2. **Validation** - Définir les validations dans les schémas Mongoose
3. **Indexes** - Ajouter `.index()` dans les schémas pour les champs uniques
4. **Performance** - Utiliser `.lean()` pour les lectures simples (retourne des objets JS au lieu de documents Mongoose)
