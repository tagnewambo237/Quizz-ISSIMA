# Composite Pattern - Hiérarchie Éducative

## Vue d'ensemble

Le **Composite Pattern** est utilisé pour représenter la hiérarchie éducative complexe du système. Il permet de traiter uniformément les éléments individuels et les compositions d'éléments.

## Structure Hiérarchique

```
SubSystem (FRANCOPHONE, ANGLOPHONE, BILINGUAL)
  └─ EducationLevel (6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Tle, L1, L2, L3, M1, M2)
      └─ Field (Série A, Série C, Série D, etc.)
          ├─ Field (Sous-spécialité)
          └─ Subject (Mathématiques, Physique, etc.)
              ├─ Subject (Sous-matière: Algèbre, Géométrie)
              └─ LearningUnit (Chapitre 1, Chapitre 2)
                  └─ LearningUnit (Sous-chapitre 1.1, 1.2)
```

## Architecture

### Interface Commune

```typescript
interface EducationalComponent {
    _id: ObjectId
    name: string
    code: string
    
    // Navigation
    getChildren(): Promise<EducationalComponent[]>
    getParent(): Promise<EducationalComponent | null>
    getAncestors(): Promise<EducationalComponent[]>
    getDescendants(): Promise<EducationalComponent[]>
    getSiblings(): Promise<EducationalComponent[]>
    
    // Informations
    getPath(): Promise<string[]>
    getDepth(): Promise<number>
    isLeaf(): Promise<boolean>
    countChildren(): Promise<number>
    countDescendants(): Promise<number>
}
```

### Composants Concrets

#### 1. EducationLevelComponent
```typescript
// Représente un niveau d'éducation (6ème, Tle, L1, etc.)
- Parent: null (racine de la hiérarchie)
- Enfants: Fields applicables à ce niveau
```

#### 2. FieldComponent
```typescript
// Représente une filière/série (Série A, C, D, etc.)
- Parent: EducationLevel ou Field parent
- Enfants: Sous-fields + Subjects
```

#### 3. SubjectComponent
```typescript
// Représente une matière (Mathématiques, Physique, etc.)
- Parent: Field ou Subject parent
- Enfants: Sous-subjects + LearningUnits
```

#### 4. LearningUnitComponent
```typescript
// Représente un chapitre/module
- Parent: Subject ou LearningUnit parent
- Enfants: Sous-units
```

## Utilisation

### Exemple 1: Obtenir le Breadcrumb

```typescript
import { EducationalHierarchyService } from '@/lib/services/EducationalHierarchyService'

// Obtenir le chemin complet d'une unité d'apprentissage
const breadcrumb = await EducationalHierarchyService.getBreadcrumb(
    'LearningUnit',
    learningUnitId
)

console.log(breadcrumb)
// [
//   { name: '6ème', code: '6EME', type: 'EducationLevel' },
//   { name: 'Série A', code: 'SERIE_A', type: 'Field' },
//   { name: 'Mathématiques', code: 'MATH', type: 'Subject' },
//   { name: 'Algèbre', code: 'ALG', type: 'LearningUnit' }
// ]
```

### Exemple 2: Construire un Arbre

```typescript
// Obtenir l'arbre complet d'un niveau
const tree = await EducationalHierarchyService.getTree(
    'EducationLevel',
    level6emeId,
    3 // profondeur maximale
)

console.log(tree)
// {
//   _id: '...',
//   name: '6ème',
//   code: '6EME',
//   type: 'EducationLevel',
//   children: [
//     {
//       _id: '...',
//       name: 'Série A',
//       type: 'Field',
//       children: [
//         {
//           _id: '...',
//           name: 'Mathématiques',
//           type: 'Subject',
//           children: [...]
//         }
//       ]
//     }
//   ]
// }
```

### Exemple 3: Recherche dans la Hiérarchie

```typescript
// Rechercher "algèbre" dans toute la hiérarchie d'un niveau
const results = await EducationalHierarchyService.search(
    'EducationLevel',
    level6emeId,
    'algèbre'
)

console.log(results)
// [
//   LearningUnitComponent { name: 'Algèbre linéaire', ... },
//   SubjectComponent { name: 'Algèbre', ... }
// ]
```

### Exemple 4: Statistiques

```typescript
// Obtenir les statistiques d'une matière
const stats = await EducationalHierarchyService.getStats(
    'Subject',
    mathSubjectId
)

console.log(stats)
// {
//   depth: 3,
//   childrenCount: 12,
//   descendantsCount: 45,
//   siblingsCount: 8,
//   isLeaf: false,
//   path: ['6ème', 'Série A', 'Mathématiques']
// }
```

### Exemple 5: Compter par Type

```typescript
// Compter tous les éléments sous un niveau
const counts = await EducationalHierarchyService.countByType(
    'EducationLevel',
    level6emeId
)

console.log(counts)
// {
//   Field: 3,
//   Subject: 15,
//   LearningUnit: 120
// }
```

### Exemple 6: Vérifier la Hiérarchie

```typescript
// Vérifier si un élément est ancêtre d'un autre
const isAncestor = await EducationalHierarchyService.isAncestorOf(
    'Field',
    serieAId,
    'LearningUnit',
    algebraUnitId
)

console.log(isAncestor) // true
```

### Exemple 7: Validation

```typescript
// Valider la cohérence de la hiérarchie
const validation = await EducationalHierarchyService.validateHierarchy(
    'Subject',
    mathSubjectId
)

console.log(validation)
// {
//   valid: true,
//   errors: []
// }
```

## Cas d'Usage

### 1. Navigation dans l'Interface

```typescript
// Afficher le fil d'Ariane
const breadcrumb = await EducationalHierarchyService.getBreadcrumb(
    'LearningUnit',
    currentUnitId
)

// Render: 6ème > Série A > Mathématiques > Algèbre
```

### 2. Sélecteur Hiérarchique

```typescript
// Construire un sélecteur en cascade
const tree = await EducationalHierarchyService.getTree(
    'EducationLevel',
    selectedLevelId,
    2
)

// Afficher: Niveau → Filière → Matière
```

### 3. Filtrage d'Examens

```typescript
// Obtenir toutes les matières d'un niveau
const subjects = await EducationalHierarchyService.getByLevel(
    'EducationLevel',
    level6emeId,
    'Subject'
)

// Filtrer les examens par ces matières
const exams = await Exam.find({
    subject: { $in: subjects.map(s => s._id) }
})
```

### 4. Statistiques Globales

```typescript
// Compter les ressources par niveau
const stats = await EducationalHierarchyService.countByType(
    'EducationLevel',
    levelId
)

// Afficher: "Ce niveau contient 3 filières, 15 matières, 120 chapitres"
```

## Avantages du Pattern

1. **Uniformité**: Traitement uniforme de tous les niveaux
2. **Flexibilité**: Facile d'ajouter de nouveaux niveaux
3. **Navigation**: Navigation intuitive dans la hiérarchie
4. **Réutilisabilité**: Opérations communes à tous les composants
5. **Maintenabilité**: Code centralisé et testable

## Performance

### Optimisations

1. **Lazy Loading**: Les enfants ne sont chargés que si nécessaire
2. **Caching**: Possibilité de mettre en cache les résultats
3. **Indexes**: Indexes MongoDB sur les relations parent-enfant
4. **Batch Loading**: Chargement groupé des descendants

### Exemple avec Cache

```typescript
// Utiliser un cache pour éviter les requêtes répétées
const cache = new Map()

async function getCachedTree(type: string, id: ObjectId) {
    const key = `${type}:${id}`
    
    if (cache.has(key)) {
        return cache.get(key)
    }
    
    const tree = await EducationalHierarchyService.getTree(type, id)
    cache.set(key, tree)
    
    return tree
}
```

## Extension

### Ajouter un Nouveau Type

```typescript
// 1. Créer le composant
export class NewTypeComponent extends BaseEducationalComponent {
    async getChildren(): Promise<EducationalComponent[]> {
        // Logique spécifique
        return []
    }
    
    async getParent(): Promise<EducationalComponent | null> {
        // Logique spécifique
        return null
    }
}

// 2. Ajouter à la factory
case 'NewType':
    return new NewTypeComponent(data)
```

## Tests

```bash
# Tester le pattern
npm test __tests__/unit/lib/patterns/EducationalHierarchy.test.ts

# Tester le service
npm test __tests__/unit/lib/services/EducationalHierarchyService.test.ts
```

## Intégration API

```typescript
// Route API pour obtenir le breadcrumb
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    
    const breadcrumb = await EducationalHierarchyService.getBreadcrumb(
        type!,
        new mongoose.Types.ObjectId(id!)
    )
    
    return Response.json(breadcrumb)
}
```

## Diagramme UML

```
┌─────────────────────────────┐
│  EducationalComponent       │
│  (Interface)                │
├─────────────────────────────┤
│ + getChildren()             │
│ + getParent()               │
│ + getAncestors()            │
│ + getDescendants()          │
│ + getSiblings()             │
│ + getPath()                 │
│ + getDepth()                │
│ + isLeaf()                  │
└─────────────────────────────┘
           △
           │
┌──────────┴──────────────────────────────────────┐
│                                                  │
┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐
│ EducationLevel  │  │    Field     │  │    Subject      │
│   Component     │  │  Component   │  │   Component     │
└─────────────────┘  └──────────────┘  └─────────────────┘
                                                  │
                                        ┌─────────┴─────────┐
                                        │  LearningUnit     │
                                        │    Component      │
                                        └───────────────────┘
```

## Sécurité

- ✅ Validation des références circulaires
- ✅ Vérification de cohérence parent-enfant
- ✅ Protection contre les boucles infinies
- ✅ Validation des permissions d'accès
