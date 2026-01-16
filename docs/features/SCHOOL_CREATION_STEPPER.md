# Création d'établissement avec steppers

Ce module introduit un formulaire multi-étapes destiné aux enseignants qui souhaitent créer une nouvelle institution dans la plateforme, conformément au modèle Xkorienta.  
Le flux est accessible depuis `Sidebar → Rejoindre / Créer une école`, route `app/(dashboard)/teacher/schools/join`.

## Objectifs
- Capturer une fiche complète et légale de l’établissement.
- Améliorer la traçabilité via un parcours guidé et structuré.
- Préparer l’intégration future des validations et contrôles côté API.

## Étapes couvertes
1. Identité & localisation  
2. Offre de formation  
3. Légalité & conformité  
4. Performance académique  
5. Insertion & partenariats  
6. Infrastructures & environnement  
7. Conditions financières  
8. Expérience étudiante  
9. Score Xkorienta

## Mocks inclus
Un bouton **Pré-remplir (mock)** est disponible pour illustrer un dossier complet et faciliter les tests UI.

## Notes techniques
- Composant principal: `components/school/SchoolCreationWizard.tsx`
- Responsive: grilles adaptatives et progression mobile/desktop
- Soumission: actuellement en mode mock (console + alert), prête pour un branchement API
