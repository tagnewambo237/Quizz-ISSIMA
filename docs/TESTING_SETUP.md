# Installation des Dépendances de Test

## Commande à Exécuter

Veuillez exécuter la commande suivante dans votre terminal pour installer les dépendances de test :

```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @types/jest \
  mongodb-memory-server \
  msw \
  ts-jest
```

## Vérification de l'Installation

Après l'installation, vérifiez que les dépendances sont bien installées :

```bash
npm list --depth=0 | grep -E "(jest|testing-library)"
```

## Lancer les Tests

Une fois les dépendances installées, vous pourrez lancer les tests avec :

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage

# Lancer uniquement les tests unitaires
npm run test:unit
```

## Fichiers Créés

✅ `jest.config.js` - Configuration Jest
✅ `jest.setup.js` - Setup global pour les tests
✅ `__tests__/helpers/test-utils.tsx` - Utilitaires de test
✅ `__tests__/helpers/mock-data.ts` - Données mock
✅ `__tests__/unit/models/User.test.ts` - Exemple de test unitaire
✅ Scripts npm ajoutés dans `package.json`

## Prochaines Étapes

Après l'installation des dépendances :
1. Créer des tests pour les autres modèles (Exam, Attempt, etc.)
2. Créer des tests d'intégration pour les API routes
3. Créer des tests de composants
4. Configurer le CI/CD pour exécuter les tests automatiquement
