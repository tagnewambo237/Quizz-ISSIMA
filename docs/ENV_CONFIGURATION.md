# Configuration Variables Environnement - Système d'Invitation

## Variables Requises

```env
# ======================
# BASE APPLICATION
# ======================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ======================
# DATABASE
# ======================
MONGODB_URI=mongodb://localhost:27017/quizlock

# ======================
# AUTHENTICATION
# ======================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# ======================
# EMAIL CONFIGURATION (SMTP)
# ======================
MAIL_HOST=mail.xkorin.com
MAIL_PORT=587
MAIL_USER=contact@xkorin.com
MAIL_PASSWORD=your-mail-password
MAIL_SOURCE=contact@xkorin.com
MAIL_FROM_NAME=Xkorin School
```

## Description des Variables

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application | `https://app.xkorin.com` |
| `MONGODB_URI` | Chaîne de connexion MongoDB | `mongodb+srv://...` |
| `MAIL_HOST` | Serveur SMTP | `mail.xkorin.com` |
| `MAIL_PORT` | Port SMTP (587 pour TLS) | `587` |
| `MAIL_USER` | Utilisateur SMTP | `contact@xkorin.com` |
| `MAIL_PASSWORD` | Mot de passe SMTP | `********` |
| `MAIL_SOURCE` | Adresse email expéditeur | `contact@xkorin.com` |
| `MAIL_FROM_NAME` | Nom affiché expéditeur | `Xkorin School` |

## Configuration Production

```env
# Production
NEXT_PUBLIC_APP_URL=https://app.xkorin.com
NODE_ENV=production

# Email avec TLS
MAIL_HOST=mail.xkorin.com
MAIL_PORT=587
MAIL_SECURE=false  # TLS (si port 465, mettre true pour SSL)
```

## Test de Configuration Email

Pour tester la configuration email, vous pouvez utiliser:

```bash
# Installer nodemailer-cli
npm install -g nodemailer-cli

# Tester l'envoi
nodemailer \
  --host mail.xkorin.com \
  --port 587 \
  --username contact@xkorin.com \
  --password "votre-mot-de-passe" \
  --from contact@xkorin.com \
  --to test@example.com \
  --subject "Test Email" \
  --text "Ceci est un test"
```

## Sécurité

⚠️ **Ne jamais commiter les credentials dans le code source !**

1. Utilisez `.env.local` pour le développement (déjà dans `.gitignore`)
2. Utilisez les variables d'environnement de votre hébergeur en production
3. Utilisez des mots de passe d'application si disponibles
