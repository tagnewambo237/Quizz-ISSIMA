# Quick Start - OAuth avec Google

Guide rapide pour activer Google OAuth sur votre application QuizLock.

## ⚡ Setup en 5 minutes

### 1. Google Cloud Console

1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet: **QuizLock**
3. Activez **Google+ API** (APIs & Services > Library)
4. Créez OAuth 2.0 credentials:
   - **APIs & Services** > **Credentials**
   - **Create Credentials** > **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: **QuizLock Development**

5. **Authorized redirect URIs** - Ajoutez:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

6. Cliquez **Create** et copiez:
   - Client ID
   - Client Secret

### 2. Configuration .env

Ajoutez dans votre `.env`:

```env
# Existant (ne changez pas)
DATABASE_URL="votre-mongodb-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret"

# Nouveau - OAuth Google
GOOGLE_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret"
```

### 3. Redémarrez le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

### 4. Testez!

1. Allez sur http://localhost:3000/login
2. Vous devriez voir le bouton **"Continuer avec Google"**
3. Cliquez et connectez-vous avec votre compte Google
4. Vous serez redirigé vers `/dashboard`

## ✅ C'est tout!

Google OAuth est maintenant actif.

## 🔧 Configuration Avancée

### Production

Quand vous déployez en production:

1. Retournez dans Google Cloud Console
2. Ajoutez l'URL de production:
   ```
   https://votre-domaine.com/api/auth/callback/google
   ```

3. Mettez à jour `.env` en production:
   ```env
   NEXTAUTH_URL="https://votre-domaine.com"
   ```

### Ajouter GitHub OAuth

Même principe, voir `docs/OAUTH_SETUP.md` pour les détails.

Quick setup:

```env
# Dans .env
GITHUB_CLIENT_ID="votre-github-client-id"
GITHUB_CLIENT_SECRET="votre-github-client-secret"
```

Le bouton GitHub apparaîtra automatiquement!

## 🐛 Problèmes courants

### Bouton Google ne s'affiche pas
- Vérifiez que les variables sont dans `.env`
- Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)
- Vérifiez les logs console

### "Redirect URI mismatch"
- L'URL dans Google Console doit être EXACTEMENT:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- Pas de trailing slash
- Port 3000 (ou le port que vous utilisez)

### "Invalid client"
- Vérifiez que vous avez copié le bon Client ID et Secret
- Assurez-vous qu'il n'y a pas d'espaces avant/après

## 📚 Documentation Complète

- [OAUTH_SETUP.md](./OAUTH_SETUP.md) - Guide détaillé
- [Ajouter un nouveau provider](./OAUTH_SETUP.md#-ajouter-un-nouveau-provider)
- [Architecture Strategy Pattern](./OAUTH_SETUP.md#-architecture---strategy-pattern)

## 🎉 Félicitations!

Vous avez maintenant un système d'authentification moderne avec OAuth!

**Ce qui a été ajouté:**
- ✅ Login avec Google
- ✅ Login avec GitHub (si configuré)
- ✅ Architecture extensible (Strategy Pattern)
- ✅ Création automatique des utilisateurs
- ✅ Photos de profil
- ✅ Interface moderne

**Pour ajouter d'autres providers:**
Consultez `docs/OAUTH_SETUP.md` section "Ajouter un Nouveau Provider"
