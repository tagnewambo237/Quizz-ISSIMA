# QuizLock - Guide de Sécurité

Ce document décrit toutes les mesures de sécurité implémentées dans QuizLock pour protéger contre les attaques et le piratage.

## 🛡️ Mesures de Sécurité Implémentées

### 1. Rate Limiting (Limitation de débit)

**Protection contre:** Attaques par force brute, spam, DDoS

**Implémentation:** `lib/security/rateLimiter.ts`

- **Login:** 5 tentatives / 15 minutes
- **Registration:** 3 inscriptions / heure par IP
- **API Routes:** 60 requêtes / minute
- **Exam Submission:** 1 soumission / 10 secondes

**Utilisation:**
```typescript
import { loginLimiter, getClientIdentifier, createRateLimitResponse } from "@/lib/security/rateLimiter"

const identifier = getClientIdentifier(req)
const result = loginLimiter(identifier)

if (!result.success) {
    return createRateLimitResponse(result.resetTime)
}
```

### 2. Headers de Sécurité HTTP

**Protection contre:** XSS, Clickjacking, MIME sniffing, Information leakage

**Implémentation:** `lib/security/headers.ts` + `middleware.ts`

**Headers appliqués:**
- `X-Frame-Options: DENY` - Empêche le clickjacking
- `X-Content-Type-Options: nosniff` - Empêche le MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Active le filtre XSS
- `Referrer-Policy: strict-origin-when-cross-origin` - Contrôle les informations de referrer
- `Permissions-Policy` - Restreint les features dangereuses (caméra, micro, etc.)
- `Content-Security-Policy` - Politique de sécurité du contenu stricte

### 3. Protection contre les Injections

**Protection contre:** NoSQL injection, XSS, SQL injection

**Implémentation:** `lib/security/sanitize.ts`

**Fonctionnalités:**
- `sanitizeString()` - Nettoie les chaînes de caractères
- `sanitizeEmail()` - Normalise et valide les emails
- `sanitizeObjectId()` - Valide les ObjectId MongoDB
- `sanitizeQueryParams()` - Bloque les opérateurs MongoDB dangereux ($where, $gt, etc.)

**Exemple:**
```typescript
import { sanitizeString, sanitizeObjectId } from "@/lib/security/sanitize"

const safeName = sanitizeString(userInput.name)
const safeId = sanitizeObjectId(userInput.id)
```

### 4. Validation Renforcée des Mots de Passe

**Protection contre:** Comptes faibles, brute force

**Règles:**
- Minimum 8 caractères
- Maximum 128 caractères
- Au moins une lettre ET un chiffre
- Hashage avec bcrypt (10 rounds)

### 5. Sécurité des Examens

**Protection contre:** Triche, manipulation des scores, réponses exposées

**Implémentation:** `lib/security/examSecurity.ts`

**Fonctionnalités:**

#### a) Sanitization des examens pour étudiants
```typescript
sanitizeExamForStudent(exam) // Retire les indicateurs de réponses correctes
```

#### b) Tokens de reprise sécurisés
```typescript
generateResumeToken(attemptId, userId) // Token HMAC-SHA256 signé
verifyResumeToken(token) // Vérifie la signature et l'expiration (24h)
```

#### c) Validation des soumissions
- Vérification que l'examen n'est pas déjà soumis
- Validation du temps d'expiration
- Contrôle du nombre de réponses
- Détection des IDs de questions invalides
- Détection des doublons

#### d) Calcul sécurisé du score
Le score est TOUJOURS calculé côté serveur, jamais côté client.

#### e) Détection de patterns de triche
- Complétion trop rapide
- Score parfait avec temps suspect
- Patterns temporels anormaux

### 6. Protection CSRF

**Protection contre:** Cross-Site Request Forgery

NextAuth.js fournit une protection CSRF automatique via:
- Tokens CSRF dans les sessions
- Vérification des origines
- SameSite cookies

### 7. Sécurisation des Sessions

**Implémentation:** `lib/auth.ts`

**Mesures:**
- Sessions JWT avec secret fort (NEXTAUTH_SECRET)
- HTTPOnly cookies (automatique avec NextAuth)
- Expiration des sessions
- Rotation des tokens

## 🚀 Configuration Requise

### Variables d'Environnement

```env
# CRITIQUE - Utilisez un secret fort et unique
NEXTAUTH_SECRET=<générer-avec-openssl-rand-base64-32>
NEXTAUTH_URL=https://votredomaine.com

# Database
DATABASE_URL=mongodb+srv://...

# En production, activer HTTPS
NODE_ENV=production
```

### Génération du Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Ou en Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## ✅ Checklist de Déploiement Sécurisé

### Avant la mise en production:

- [ ] Générer un `NEXTAUTH_SECRET` fort et unique
- [ ] Activer HTTPS (Let's Encrypt, Cloudflare, etc.)
- [ ] Décommenter `Strict-Transport-Security` dans `lib/security/headers.ts`
- [ ] Configurer les variables d'environnement en production
- [ ] Activer les logs de sécurité
- [ ] Configurer un firewall (Cloudflare, AWS WAF, etc.)
- [ ] Mettre en place des backups de base de données
- [ ] Activer l'authentification à deux facteurs pour les administrateurs
- [ ] Tester les endpoints API avec des outils de sécurité (OWASP ZAP, Burp Suite)

### Configuration Nginx (si applicable)

```nginx
# Limiter la taille des requêtes
client_max_body_size 10M;

# Timeout
client_body_timeout 12;
client_header_timeout 12;

# Cacher la version
server_tokens off;

# SSL/TLS
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers on;
```

## 🔍 Monitoring et Alertes

### Logs de Sécurité

Les événements de sécurité sont loggés avec les préfixes:
- `[SECURITY]` - Violations de sécurité détectées
- `[SUBMIT]` - Soumissions d'examens
- `[RATE_LIMIT]` - Rate limiting déclenché

### Événements à Surveiller

1. Tentatives de login échouées répétées
2. Soumissions d'examens suspectes (détection de triche)
3. Rate limiting déclenché fréquemment
4. Erreurs de validation d'ObjectId (tentatives d'injection)
5. Tokens de reprise invalides (tentatives de manipulation)

### Recommandations

- Mettre en place un système de monitoring (Sentry, LogRocket, etc.)
- Configurer des alertes pour les événements critiques
- Réviser les logs régulièrement
- Garder les dépendances à jour (`npm audit`, Dependabot)

## 🛠️ Maintenance de Sécurité

### Hebdomadaire
- Vérifier les logs de sécurité
- Examiner les soumissions suspectes signalées

### Mensuel
- Exécuter `npm audit` et corriger les vulnérabilités
- Mettre à jour les dépendances
- Réviser les permissions et rôles

### Trimestriel
- Audit de sécurité complet
- Test de pénétration
- Révision des politiques de sécurité

## 🔐 Bonnes Pratiques pour les Développeurs

### Ne JAMAIS:
1. Exposer les réponses correctes dans les API étudiants
2. Calculer les scores côté client
3. Faire confiance aux données du client
4. Logger des informations sensibles (mots de passe, tokens)
5. Utiliser `eval()` ou `new Function()`
6. Désactiver les mesures de sécurité en production

### TOUJOURS:
1. Valider et sanitizer toutes les entrées utilisateur
2. Utiliser des requêtes paramétrées
3. Appliquer le principe du moindre privilège
4. Chiffrer les données sensibles
5. Implémenter une journalisation appropriée
6. Tester la sécurité avant le déploiement

## 📚 Ressources Supplémentaires

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)

## 🚨 Signalement de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité, veuillez la signaler de manière responsable:

1. **NE PAS** ouvrir un issue public sur GitHub
2. Envoyer un email à [security@votredomaine.com]
3. Fournir une description détaillée de la vulnérabilité
4. Nous vous répondrons dans les 48 heures

## 📝 Changelog de Sécurité

### Version 1.0.0 (2025-01-29)
- ✅ Implémentation du rate limiting
- ✅ Headers de sécurité HTTP
- ✅ Protection contre les injections NoSQL
- ✅ Sanitization des entrées utilisateur
- ✅ Validation renforcée des mots de passe
- ✅ Sécurisation des examens et détection de triche
- ✅ Tokens de reprise HMAC sécurisés
- ✅ Calcul sécurisé des scores côté serveur

---

**Note:** La sécurité est un processus continu. Cette documentation doit être mise à jour régulièrement au fur et à mesure de l'évolution de l'application.
