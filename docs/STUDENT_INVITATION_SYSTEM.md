# Système d'Ajout d'Élèves - Documentation Complète

## Table des Matières
1. [Architecture Globale](#1-architecture-globale)
2. [Méthode 1: Lien d'Invitation](#2-méthode-1-lien-dinvitation)
3. [Méthode 2: Ajout Manuel](#3-méthode-2-ajout-manuel)
4. [Méthode 3: Import CSV/XLSX](#4-méthode-3-import-csvxlsx)
5. [Modèles de Données](#5-modèles-de-données)
6. [API Endpoints](#6-api-endpoints)
7. [Templates Email](#7-templates-email)
8. [Sécurité](#8-sécurité)
9. [Guide Déploiement](#9-guide-déploiement)
10. [FAQ](#10-faq)

---

## 1. Architecture Globale

### Diagramme de Flux

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENSEIGNANT                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Modal d'Invitation (4 onglets)               │   │
│  │  ┌────────┬────────┬────────┬────────────────────────┐   │   │
│  │  │Par Lien│ Manuel │ Import │ Gérer Liens            │   │   │
│  │  └────────┴────────┴────────┴────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ API Routes     │→ │InvitationService│→ │ MongoDB          │ │
│  │ /api/classes/* │  │                 │  │ - Invitation     │ │
│  │ /api/invites/* │  │                 │  │ - User           │ │
│  └────────────────┘  └─────────────────┘  │ - ImportLog      │ │
│          │                    │           └──────────────────┘ │
│          ▼                    ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                    Email Service                           ││
│  │  - Bienvenue     - Activation     - Notification Teacher  ││
│  │  - Invitation    - Rapport Import - Vérification          ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                          ÉLÈVE                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Page Publique /join/[token]                              │   │
│  │  - Affiche infos classe                                   │   │
│  │  - Formulaire inscription                                 │   │
│  │  - Auto-inscription dans classe                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Fichiers Clés

| Catégorie | Fichier | Description |
|-----------|---------|-------------|
| **Modèles** | `models/Invitation.ts` | Schéma invitation avec tracking |
| | `models/ImportLog.ts` | Historique des imports |
| **Services** | `lib/services/InvitationService.ts` | Logique métier complète |
| **Emails** | `lib/mail.ts` | 6 templates email professionnels |
| **API** | `app/api/classes/[id]/invitations/*` | Endpoints protégés |
| | `app/api/invitations/[token]/*` | Endpoints publics |
| **UI** | `components/classes/invitations/*` | 4 composants UI |
| **Pages** | `app/join/[token]/page.tsx` | Page inscription publique |

---

## 2. Méthode 1: Lien d'Invitation

### Flow Détaillé

```
ENSEIGNANT                    SYSTÈME                         ÉLÈVE
    │                            │                               │
    │ 1. Ouvre modal             │                               │
    │────────────────────────────▶                               │
    │                            │                               │
    │ 2. Configure options       │                               │
    │   - Expiration: 24h/7j/30j/jamais                          │
    │   - Limite: X utilisations │                               │
    │────────────────────────────▶                               │
    │                            │                               │
    │             3. Génère token (64 chars hex)                 │
    │                            │                               │
    │◀──── 4. Retourne URL + QR ─┤                               │
    │                            │                               │
    │ 5. Partage lien (WhatsApp, Email...)                       │
    │────────────────────────────────────────────────────────────▶
    │                            │                               │
    │                            │    6. Clique lien             │
    │                            │◀──────────────────────────────┤
    │                            │                               │
    │                            │ 7. Vérifie validité           │
    │                            │   - Token existe?             │
    │                            │   - Pas expiré?               │
    │                            │   - Limite non atteinte?      │
    │                            │                               │
    │                            │──── 8. Affiche formulaire ───▶│
    │                            │                               │
    │                            │    9. Soumet inscription      │
    │                            │◀──────────────────────────────┤
    │                            │                               │
    │                            │ 10. Crée compte               │
    │                            │ 11. Inscrit dans classe       │
    │                            │ 12. Incrémente compteur       │
    │                            │                               │
    │◀── 13. Email notification ─┤                               │
    │                            │                               │
    │                            │── 14. Email bienvenue ───────▶│
    │                            │                               │
    │                            │── 15. Redirect login ────────▶│
```

### Options de Configuration

| Option | Type | Valeurs | Défaut |
|--------|------|---------|--------|
| `expiresIn` | string | `'24h'`, `'7d'`, `'30d'`, `'never'` | `'30d'` |
| `maxUses` | number\|null | 1-∞ ou null (illimité) | `null` |
| `description` | string | Note interne | - |

### Composants UI

**InviteByLink.tsx** - Génération de lien
- Affiche statistiques (utilisations, expiration)
- Options avancées (expiration, limite)
- QR Code générable et téléchargeable
- Copie en un clic

**InvitationLinksManager.tsx** - Dashboard gestion
- Liste tous les liens créés
- Statuts visuels (Actif/Expiré/Révoqué)
- Actions: Copier, QR, Révoquer
- Liste des élèves inscrits par lien

---

## 3. Méthode 2: Ajout Manuel

### Flow Détaillé

```
ENSEIGNANT                    SYSTÈME                         ÉLÈVE
    │                            │                               │
    │ 1. Remplit formulaire      │                               │
    │   - Nom: "Jean Dupont"     │                               │
    │   - Email: "jean@..."      │                               │
    │────────────────────────────▶                               │
    │                            │                               │
    │             2. Vérifie si email existe                     │
    │                            │                               │
    │         [SI UTILISATEUR EXISTE]                            │
    │             3. Inscrit directement                         │
    │◀──── "Inscrit avec succès" ┤                               │
    │                            │                               │
    │         [SI NOUVEL UTILISATEUR]                            │
    │             3. Crée compte (inactif)                       │
    │             4. Génère mot de passe temp                    │
    │             5. Crée invitation INDIVIDUAL                  │
    │                            │                               │
    │                            │── 6. Email activation ───────▶│
    │                            │   (avec mdp temporaire)       │
    │                            │                               │
    │◀──── "Invitation envoyée"  │                               │
    │                            │                               │
    │                            │   7. Élève clique lien        │
    │                            │◀──────────────────────────────┤
    │                            │                               │
    │                            │ 8. Active compte              │
    │                            │ 9. Inscrit dans classe        │
    │                            │                               │
    │                            │── 10. Email bienvenue ───────▶│
```

### Validation des Données

| Champ | Requis | Validation |
|-------|--------|------------|
| `name` | ✅ | Min 2 caractères |
| `email` | ✅ | Format email valide, unique |

---

## 4. Méthode 3: Import CSV/XLSX

### Flow Détaillé

```
ENSEIGNANT                    SYSTÈME                              
    │                            │                                 
    │ 1. Upload fichier          │                                 
    │   (.csv ou .xlsx)          │                                 
    │────────────────────────────▶                                 
    │                            │                                 
    │             2. Parse fichier                                 
    │             3. Détecte colonnes Nom/Email                    
    │             4. Valide chaque ligne                           
    │                            │                                 
    │◀──── 5. Aperçu données ────┤                                 
    │      (avec statuts)        │                                 
    │                            │                                 
    │ 6. Confirme import         │                                 
    │────────────────────────────▶                                 
    │                            │                                 
    │             7. Crée ImportLog                                
    │             8. Pour chaque ligne:                            
    │                - Inscrit si existe                           
    │                - Invite si nouveau                           
    │             9. Met à jour ImportLog                          
    │                            │                                 
    │◀──── 10. Résultat ─────────┤                                 
    │      (X inscrits, Y invités, Z erreurs)                     
    │                            │                                 
    │◀──── 11. Email rapport ────┤                                 
```

### Format de Fichier

**CSV (template_eleves.csv)**
```csv
Nom,Email
Jean Dupont,jean.dupont@example.com
Marie Martin,marie.martin@example.com
```

**Excel (.xlsx)**
- Feuille: Première feuille du classeur
- Colonnes: `Nom` et `Email` (détection automatique)

### Colonnes Reconnues

Le parser détecte automatiquement:
- **Nom**: `nom`, `name`, `prenom`, `prénom`, `full_name`
- **Email**: `email`, `mail`, `courriel`, `e-mail`

### Limites

| Limite | Valeur |
|--------|--------|
| Taille fichier max | 5 MB |
| Lignes par import | 500 recommandé |
| Formats acceptés | `.csv`, `.xlsx`, `.xls` |

---

## 5. Modèles de Données

### Invitation Schema

```typescript
interface IInvitation {
    // Identifiants
    token: string           // Token unique (64 chars hex)
    _id: ObjectId
    
    // Cibles
    classId?: ObjectId      // Classe cible
    schoolId?: ObjectId     // École (pour invitations école)
    
    // Configuration
    type: 'LINK' | 'INDIVIDUAL'
    role?: string           // Rôle assigné (default: STUDENT)
    email?: string          // Email (pour INDIVIDUAL seulement)
    
    // État
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
    expiresAt?: Date
    
    // Tracking (pour LINK)
    maxUses?: number        // null = illimité
    currentUses: number     // Compteur
    registeredStudents: ObjectId[]
    description?: string
    
    // Métadonnées
    createdBy: ObjectId
    createdAt: Date
    updatedAt: Date
}
```

### ImportLog Schema

```typescript
interface IImportLog {
    classId: ObjectId
    importedBy: ObjectId
    
    // Fichier
    fileName: string
    fileType: 'CSV' | 'XLSX'
    fileSize: number
    
    // Statistiques
    totalRows: number
    successCount: number
    errorCount: number
    enrolledCount: number
    invitedCount: number
    
    // État
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
    
    // Détails
    details: { email, name, status, error? }[]
    errors: { row, email, message }[]
    
    // Timing
    startedAt: Date
    completedAt?: Date
}
```

---

## 6. API Endpoints

### Endpoints Protégés (Auth Requise)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/classes/[id]/invitations` | Récupère/crée lien actif |
| `POST` | `/api/classes/[id]/invitations` | Crée invitation (LINK/INDIVIDUAL/BATCH) |
| `GET` | `/api/classes/[id]/invitations/links` | Liste tous les liens |
| `DELETE` | `/api/classes/[id]/invitations/links/[linkId]` | Révoque un lien |

### Endpoints Publics (Sans Auth)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/invitations/[token]` | Valide token, retourne infos classe |
| `POST` | `/api/invitations/[token]` | Inscription via lien |

### Exemples de Requêtes

**Créer lien avec options**
```http
POST /api/classes/507f1f77bcf86cd799439011/invitations
Content-Type: application/json
Authorization: Bearer <token>

{
    "type": "LINK",
    "options": {
        "expiresIn": "7d",
        "maxUses": 30,
        "description": "Lien pour Terminale S"
    }
}
```

**Inscription via lien**
```http
POST /api/invitations/a1b2c3d4e5f6...
Content-Type: application/json

{
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "password": "MonMotDePasse123"
}
```

---

## 7. Templates Email

### Emails Disponibles

| Template | Destinataire | Déclencheur |
|----------|--------------|-------------|
| `sendWelcomeEmail` | Élève | Inscription via lien |
| `sendInvitationEmail` | Élève | Partage de lien |
| `sendAccountActivationEmail` | Élève | Ajout manuel |
| `sendTeacherNotification` | Enseignant | Nouvelle inscription |
| `sendImportReportEmail` | Enseignant | Fin d'import batch |
| `sendVerificationEmail` | Élève | Vérification OTP |

### Design

- Style professionnel avec gradient violet
- Responsive (mobile-friendly)
- Boutons CTA prominents
- Informations structurées dans des encadrés

---

## 8. Sécurité

### Génération de Tokens

```typescript
// Token cryptographiquement sécurisé (256 bits)
const token = crypto.randomBytes(32).toString('hex')
// Résultat: 64 caractères hexadécimaux
```

### Validations

| Validation | Implémentation |
|------------|----------------|
| Token unique | Index unique MongoDB |
| Expiration | Vérifié à chaque accès |
| Limite utilisations | Compteur atomique |
| Email unique | Vérifié avant création |
| Mot de passe | Min 8 caractères |
| Format email | Regex validation |

### Protection des Routes

| Route | Protection |
|-------|------------|
| `/api/classes/*` | Session NextAuth requise |
| `/api/invitations/[token]` | Token validé |
| `/join/[token]` | Publique mais token vérifié |

### Bonnes Pratiques

- ✅ Tokens non-prédictibles (crypto.randomBytes)
- ✅ Expiration configurable
- ✅ Révocation possible
- ✅ Tracking des utilisations
- ✅ Validation serveur des données
- ✅ Mots de passe hashés (bcrypt)

---

## 9. Guide Déploiement

### Prérequis

```bash
Node.js >= 18
MongoDB >= 5.0
SMTP Server accessible
```

### Variables d'Environnement

Voir [docs/ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md)

### Installation

```bash
# Cloner le projet
git clone <repo>
cd quizlock

# Installer dépendances
npm install

# Installer QR Code
npm install qrcode @types/qrcode

# Configurer .env.local
cp .env.example .env.local
# Éditer avec vos valeurs

# Lancer en développement
npm run dev

# Build production
npm run build
npm start
```

---

## 10. FAQ

**Q: Que se passe-t-il si un élève est déjà inscrit ?**
> Il est automatiquement ajouté à la classe sans créer de doublon.

**Q: Les liens expirent-ils ?**
> Oui, selon la configuration (24h, 7j, 30j, ou jamais).

**Q: Peut-on révoquer un lien ?**
> Oui, via l'onglet "Gérer liens" du modal d'invitation.

**Q: L'enseignant est-il notifié des inscriptions ?**
> Oui, un email est envoyé à chaque nouvelle inscription via lien.

**Q: Combien d'élèves peut-on importer à la fois ?**
> Recommandé: 500 maximum par batch pour éviter les timeouts.

**Q: Les emails sont-ils bloquants ?**
> Non, l'import continue même si un email échoue. Les erreurs sont loguées.

**Q: Comment télécharger un template d'import ?**
> Dans l'onglet "Import", cliquez sur "Template Excel" ou "Template CSV".
