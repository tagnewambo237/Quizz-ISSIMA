# Chain of Responsibility Pattern - Access Control

## Vue d'ensemble

Le **Chain of Responsibility Pattern** est implémenté pour gérer les permissions d'accès des profils pédagogiques de manière modulaire et extensible.

## Architecture

### Composants Principaux

#### 1. `AccessHandler` (Abstract Base Class)
```typescript
abstract class AccessHandler {
    protected nextHandler?: AccessHandler
    
    setNext(handler: AccessHandler): AccessHandler
    async handle(request: AccessRequest): Promise<boolean>
    protected abstract canHandle(request: AccessRequest): Promise<boolean>
    protected abstract checkAccess(request: AccessRequest): Promise<boolean>
}
```

#### 2. Handlers Concrets

- **`GlobalAccessHandler`**: Accès total (DG_M4M, RECTOR)
- **`LocalAccessHandler`**: Accès limité à une institution
- **`SubjectAccessHandler`**: Accès limité à des matières spécifiques
- **`LevelAccessHandler`**: Accès limité à des niveaux d'éducation
- **`FieldAccessHandler`**: Accès limité à des filières

#### 3. `AccessHandlerChain` (Factory)
Crée et configure la chaîne de handlers.

## Flux de Traitement

```
Request → GlobalHandler → LocalHandler → SubjectHandler → LevelHandler → FieldHandler → Denied
            ↓ (match)        ↓ (match)       ↓ (match)       ↓ (match)       ↓ (match)
          Granted          Granted         Granted         Granted         Granted
```

## Utilisation

### Exemple 1: Vérifier l'accès à un examen

```typescript
import { AccessHandlerChain } from '@/lib/patterns/AccessHandler'

const profile = await PedagogicalProfile.findOne({ user: userId })

const request = {
    profile,
    resourceType: 'exam',
    resourceId: examId
}

const hasAccess = await AccessHandlerChain.checkAccess(request)
```

### Exemple 2: Utiliser le Service

```typescript
import { ExamAccessService } from '@/lib/services/ExamAccessService'

// Vérifier l'accès à un examen
const canAccess = await ExamAccessService.canAccessExam(userId, examId)

// Vérifier si peut créer un examen pour une matière
const canCreate = await ExamAccessService.canCreateExamForSubject(userId, subjectId)

// Récupérer tous les examens accessibles
const exams = await ExamAccessService.getAccessibleExams(userId)
```

## Scopes d'Accès

### GLOBAL
- **Qui**: DG_M4M, RECTOR
- **Accès**: Tous les examens, toutes les institutions
- **Cas d'usage**: Administration système, supervision nationale

### LOCAL
- **Qui**: PRINCIPAL, PREFET
- **Accès**: Ressources de leur institution uniquement
- **Cas d'usage**: Gestion d'établissement

### SUBJECT
- **Qui**: TEACHER
- **Accès**: Examens des matières qu'ils enseignent
- **Cas d'usage**: Enseignants spécialisés

### LEVEL
- **Qui**: Coordinateurs de niveau
- **Accès**: Examens d'un niveau spécifique (ex: 6ème)
- **Cas d'usage**: Coordination pédagogique par niveau

### FIELD
- **Qui**: INSPECTOR
- **Accès**: Examens d'une filière (ex: Série A)
- **Cas d'usage**: Inspection pédagogique

## Avantages du Pattern

1. **Modularité**: Chaque handler est indépendant
2. **Extensibilité**: Facile d'ajouter de nouveaux types d'accès
3. **Maintenabilité**: Logique de permission isolée
4. **Testabilité**: Chaque handler peut être testé unitairement
5. **Flexibilité**: L'ordre de la chaîne peut être modifié

## Tests

Les tests couvrent:
- ✅ Accès GLOBAL (tous les cas)
- ✅ Accès LOCAL (même institution vs différente)
- ✅ Accès SUBJECT (matière autorisée vs non autorisée)
- ✅ Accès LEVEL (niveau autorisé)
- ✅ Accès FIELD (filière autorisée)

Exécuter les tests:
```bash
npm test __tests__/unit/lib/patterns/AccessHandler.test.ts
```

## Extension Future

Pour ajouter un nouveau type d'accès:

1. Créer un nouveau handler héritant de `AccessHandler`
2. Implémenter `canHandle()` et `checkAccess()`
3. L'ajouter à la chaîne dans `AccessHandlerChain.getChain()`

```typescript
class CustomAccessHandler extends AccessHandler {
    protected async canHandle(request: AccessRequest): Promise<boolean> {
        return request.profile.accessScope === AccessScope.CUSTOM
    }

    protected async checkAccess(request: AccessRequest): Promise<boolean> {
        // Logique personnalisée
        return true
    }
}
```

## Intégration avec NextAuth

```typescript
// Dans un API route
import { getServerSession } from 'next-auth'
import { ExamAccessService } from '@/lib/services/ExamAccessService'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    
    if (!session) {
        return new Response('Unauthorized', { status: 401 })
    }

    const canAccess = await ExamAccessService.canAccessExam(
        session.user.id,
        examId
    )

    if (!canAccess) {
        return new Response('Forbidden', { status: 403 })
    }

    // Continuer...
}
```

## Performance

- **Cache**: Les profils sont mis en cache pour éviter les requêtes répétées
- **Lazy Loading**: La chaîne est créée une seule fois (Singleton)
- **Early Exit**: Dès qu'un handler accorde l'accès, la chaîne s'arrête

## Sécurité

- ✅ Principe du moindre privilège
- ✅ Validation stricte des permissions
- ✅ Pas d'accès par défaut (deny by default)
- ✅ Audit trail possible (logs dans chaque handler)
