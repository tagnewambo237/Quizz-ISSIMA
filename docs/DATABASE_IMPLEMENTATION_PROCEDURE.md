# Procédure d'Implémentation des Nouveaux Modèles dans la Base de Données

> **Date:** Janvier 2026  
> **Version:** 1.0  
> **Objectif:** Implémenter les 23 nouveaux modèles dans MongoDB

---

## 📋 Vue d'ensemble

Cette procédure décrit les étapes pour implémenter les nouveaux modèles de données dans votre base de données MongoDB. Les modèles sont organisés par catégories et doivent être créés dans un ordre spécifique pour respecter les dépendances.

### Nouveaux Modèles à Implémenter (23 modèles)

#### Géolocalisation (4 modèles)
1. Country
2. Region
3. Department
4. City

#### Réglementation (2 modèles)
5. RegulatoryApproval
6. AcademicTutelle

#### Partenariats (2 modèles)
7. Partner
8. InstitutionPartner

#### Spécialités (5 modèles)
9. Specialty
10. Skill
11. SpecialtySkill
12. CareerOutcome
13. SpecialtyOutcome

#### Curriculum (2 modèles)
14. CurriculumSemester
15. CurriculumUE

#### Offre & Formation (1 modèle)
16. SchoolProgram

#### Métriques (3 modèles)
17. PerformanceMetric
18. EmploymentMetric
19. InfrastructureMetric

#### Scoring (3 modèles)
20. SchoolScore
21. SpecialtyScore
22. SchoolProgramScore

---

## 🔧 Prérequis

### 1. Vérifications

- ✅ MongoDB est installé et fonctionnel
- ✅ La connexion MongoDB est configurée dans `.env`
- ✅ Les modèles Mongoose sont créés dans `/models/`
- ✅ Next.js peut se connecter à MongoDB
- ✅ Vous avez accès à la base de données (lecture/écriture)

### 2. Variables d'environnement

Vérifiez que votre fichier `.env` contient :

```env
MONGODB_URI=mongodb://localhost:27017/xkorin-school
# ou
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/xkorin-school
```

---

## 📝 Procédure d'Implémentation

### Étape 1 : Vérification des Modèles

Vérifiez que tous les fichiers de modèles existent dans `/models/` :

```bash
# Liste des fichiers à vérifier
models/Country.ts
models/Region.ts
models/Department.ts
models/City.ts
models/RegulatoryApproval.ts
models/AcademicTutelle.ts
models/Partner.ts
models/InstitutionPartner.ts
models/Specialty.ts
models/Skill.ts
models/SpecialtySkill.ts
models/CareerOutcome.ts
models/SpecialtyOutcome.ts
models/CurriculumSemester.ts
models/CurriculumUE.ts
models/SchoolProgram.ts
models/PerformanceMetric.ts
models/EmploymentMetric.ts
models/InfrastructureMetric.ts
models/SchoolScore.ts
models/SpecialtyScore.ts
models/SchoolProgramScore.ts
```

### Étape 2 : Création d'un Script de Migration

Créez un script de migration pour créer les collections et indexes :

**Fichier:** `scripts/migrate-new-models.ts`

```typescript
import mongoose from 'mongoose'
import connectDB from '../lib/mongodb'

// Importer tous les nouveaux modèles
import Country from '../models/Country'
import Region from '../models/Region'
import Department from '../models/Department'
import City from '../models/City'
import RegulatoryApproval from '../models/RegulatoryApproval'
import AcademicTutelle from '../models/AcademicTutelle'
import Partner from '../models/Partner'
import InstitutionPartner from '../models/InstitutionPartner'
import Specialty from '../models/Specialty'
import Skill from '../models/Skill'
import SpecialtySkill from '../models/SpecialtySkill'
import CareerOutcome from '../models/CareerOutcome'
import SpecialtyOutcome from '../models/SpecialtyOutcome'
import CurriculumSemester from '../models/CurriculumSemester'
import CurriculumUE from '../models/CurriculumUE'
import SchoolProgram from '../models/SchoolProgram'
import PerformanceMetric from '../models/PerformanceMetric'
import EmploymentMetric from '../models/EmploymentMetric'
import InfrastructureMetric from '../models/InfrastructureMetric'
import SchoolScore from '../models/SchoolScore'
import SpecialtyScore from '../models/SpecialtyScore'
import SchoolProgramScore from '../models/SchoolProgramScore'

async function migrate() {
  try {
    console.log('🔄 Connexion à MongoDB...')
    await connectDB()
    console.log('✅ Connecté à MongoDB')

    // Les collections et indexes sont créés automatiquement lors du premier accès
    // On force la création en faisant une requête simple sur chaque modèle
    
    console.log('\n📦 Création des collections et indexes...\n')

    const models = [
      { name: 'Country', model: Country },
      { name: 'Region', model: Region },
      { name: 'Department', model: Department },
      { name: 'City', model: City },
      { name: 'RegulatoryApproval', model: RegulatoryApproval },
      { name: 'AcademicTutelle', model: AcademicTutelle },
      { name: 'Partner', model: Partner },
      { name: 'InstitutionPartner', model: InstitutionPartner },
      { name: 'Specialty', model: Specialty },
      { name: 'Skill', model: Skill },
      { name: 'SpecialtySkill', model: SpecialtySkill },
      { name: 'CareerOutcome', model: CareerOutcome },
      { name: 'SpecialtyOutcome', model: SpecialtyOutcome },
      { name: 'CurriculumSemester', model: CurriculumSemester },
      { name: 'CurriculumUE', model: CurriculumUE },
      { name: 'SchoolProgram', model: SchoolProgram },
      { name: 'PerformanceMetric', model: PerformanceMetric },
      { name: 'EmploymentMetric', model: EmploymentMetric },
      { name: 'InfrastructureMetric', model: InfrastructureMetric },
      { name: 'SchoolScore', model: SchoolScore },
      { name: 'SpecialtyScore', model: SpecialtyScore },
      { name: 'SchoolProgramScore', model: SchoolProgramScore },
    ]

    for (const { name, model } of models) {
      try {
        // Force la création de la collection et des indexes
        await model.createIndexes()
        console.log(`✅ ${name} - Collection et indexes créés`)
      } catch (error: any) {
        console.error(`❌ ${name} - Erreur:`, error.message)
      }
    }

    console.log('\n✅ Migration terminée avec succès!')
    console.log('\n📊 Vérification des collections...')
    
    const db = mongoose.connection.db
    const collections = await db?.listCollections().toArray()
    const newCollections = models.map(m => m.name.toLowerCase() + 's')
    
    console.log(`\nCollections créées: ${newCollections.length}`)
    newCollections.forEach(col => {
      const exists = collections?.some(c => c.name === col)
      console.log(`  ${exists ? '✅' : '❌'} ${col}`)
    })

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Connexion fermée')
    process.exit(0)
  }
}

migrate()
```

### Étape 3 : Exécution de la Migration

#### Option A : Via npm script

Ajoutez dans `package.json` :

```json
{
  "scripts": {
    "migrate:new-models": "tsx --env-file=.env scripts/migrate-new-models.ts"
  }
}
```

Puis exécutez :

```bash
npm run migrate:new-models
```

#### Option B : Via tsx directement

```bash
npx tsx --env-file=.env scripts/migrate-new-models.ts
```

### Étape 4 : Vérification dans MongoDB

#### Via MongoDB Compass ou CLI

```javascript
// Connectez-vous à MongoDB et vérifiez les collections
use xkorin-school

// Liste des collections
show collections

// Vérifiez les indexes d'une collection
db.countries.getIndexes()
db.regions.getIndexes()
// etc.
```

#### Via Script de Vérification

Créez `scripts/verify-models.ts` :

```typescript
import mongoose from 'mongoose'
import connectDB from '../lib/mongodb'

async function verify() {
  await connectDB()
  const db = mongoose.connection.db
  
  const expectedCollections = [
    'countries', 'regions', 'departments', 'cities',
    'regulatoryapprovals', 'academictutelles',
    'partners', 'institutionpartners',
    'specialties', 'skills', 'specialtyskills', 'careeroutcomes', 'specialtyoutcomes',
    'curriculumsemesters', 'curriculumues',
    'schoolprograms',
    'performancemetrics', 'employmentmetrics', 'infrastructuremetrics',
    'schoolscores', 'specialtyscores', 'schoolprogramscores'
  ]
  
  const actualCollections = (await db?.listCollections().toArray())?.map(c => c.name) || []
  
  console.log('\n📊 Vérification des collections:\n')
  
  expectedCollections.forEach(col => {
    const exists = actualCollections.includes(col)
    console.log(`${exists ? '✅' : '❌'} ${col}`)
  })
  
  const missing = expectedCollections.filter(col => !actualCollections.includes(col))
  
  if (missing.length === 0) {
    console.log('\n✅ Toutes les collections sont créées!')
  } else {
    console.log(`\n⚠️  Collections manquantes: ${missing.join(', ')}`)
  }
  
  await mongoose.connection.close()
}

verify()
```

---

## 🌱 Seeding Initial (Optionnel)

### Création d'un Script de Seeding

Créez `scripts/seed-new-models.ts` pour peupler la base avec des données initiales :

```typescript
import connectDB from '../lib/mongodb'
import Country from '../models/Country'
import Region from '../models/Region'
import Department from '../models/Department'
import City from '../models/City'
// ... autres imports

async function seed() {
  await connectDB()
  
  try {
    // 1. Créer les pays
    const cameroun = await Country.create({
      name: 'Cameroun',
      isoCode: 'CM',
      currency: 'FCFA'
    })
    
    // 2. Créer les régions
    const centre = await Region.create({
      country: cameroun._id,
      name: 'Centre'
    })
    
    // 3. Créer les départements
    const mfoundi = await Department.create({
      region: centre._id,
      name: 'Mfoundi'
    })
    
    // 4. Créer les villes
    const yaounde = await City.create({
      department: mfoundi._id,
      name: 'Yaoundé',
      lat: 3.8480,
      lng: 11.5021,
      costOfLivingIndex: 45.2
    })
    
    console.log('✅ Données de base créées')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await mongoose.connection.close()
  }
}

seed()
```

---

## 🔄 Ordre de Création Recommandé

Pour éviter les erreurs de références, créez les données dans cet ordre :

### Phase 1 : Géolocalisation (Fondation)
1. **Country** (aucune dépendance)
2. **Region** (dépend de Country)
3. **Department** (dépend de Region)
4. **City** (dépend de Department)

### Phase 2 : Partenaires
5. **Partner** (dépend optionnellement de Country)
6. **InstitutionPartner** (dépend de Partner et School)

### Phase 3 : Spécialités
7. **Specialty** (aucune dépendance)
8. **Skill** (aucune dépendance)
9. **CareerOutcome** (aucune dépendance)
10. **SpecialtySkill** (dépend de Specialty et Skill)
11. **SpecialtyOutcome** (dépend de Specialty et CareerOutcome)

### Phase 4 : Curriculum
12. **CurriculumSemester** (dépend de Specialty)
13. **CurriculumUE** (dépend de CurriculumSemester)

### Phase 5 : Offre & Formation
14. **SchoolProgram** (dépend de School, Specialty, et optionnellement City)

### Phase 6 : Réglementation
15. **RegulatoryApproval** (dépend de School)
16. **AcademicTutelle** (dépend de School)

### Phase 7 : Métriques
17. **PerformanceMetric** (dépend de School)
18. **EmploymentMetric** (dépend de School)
19. **InfrastructureMetric** (dépend de School)

### Phase 8 : Scoring
20. **SchoolScore** (dépend de School)
21. **SpecialtyScore** (dépend de Specialty)
22. **SchoolProgramScore** (dépend de SchoolProgram)

---

## ✅ Checklist de Vérification

Après l'implémentation, vérifiez :

- [ ] Toutes les collections sont créées dans MongoDB
- [ ] Tous les indexes sont créés (vérifier avec `getIndexes()`)
- [ ] Les contraintes d'unicité fonctionnent
- [ ] Les références (FK) fonctionnent correctement
- [ ] Les validations Mongoose sont actives
- [ ] Les timestamps sont automatiques
- [ ] Les enums sont correctement définis
- [ ] Les valeurs par défaut sont appliquées

---

## 🐛 Résolution de Problèmes

### Erreur : "Collection already exists"
- **Solution:** C'est normal, les collections existent déjà. La migration peut être réexécutée.

### Erreur : "Index already exists"
- **Solution:** Les indexes existent déjà. C'est normal si vous réexécutez la migration.

### Erreur : "Cannot read property 'createIndexes'"
- **Solution:** Vérifiez que le modèle est bien importé et que Mongoose est connecté.

### Erreur : "Validation failed"
- **Solution:** Vérifiez que les données respectent les contraintes du schéma (required, min, max, enum).

### Erreur : "ReferenceError: mongoose is not defined"
- **Solution:** Assurez-vous d'importer mongoose dans votre script.

---

## 📚 Ressources

- **Documentation Mongoose:** https://mongoosejs.com/docs/guide.html
- **Documentation MongoDB:** https://docs.mongodb.com/
- **Modèles documentés:** `docs/architecture/02_DATABASE_MODELS.md`

---

## 🎯 Prochaines Étapes

Après l'implémentation :

1. ✅ Créer des scripts de seeding pour les données initiales
2. ✅ Créer des APIs pour gérer ces nouveaux modèles
3. ✅ Intégrer les scores dans le module Orientation
4. ✅ Créer des dashboards de visualisation des métriques
5. ✅ Implémenter les algorithmes de calcul de scores

---

**Dernière mise à jour:** Janvier 2026
