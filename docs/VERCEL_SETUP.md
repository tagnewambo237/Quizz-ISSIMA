# Configuration Vercel pour Xkorin School

## Variables d'environnement requises

Pour que l'application fonctionne correctement sur Vercel, vous devez configurer les variables d'environnement suivantes dans le dashboard Vercel :

### 1. DATABASE_URL
Votre URL de connexion MongoDB.

Exemple :
```
mongodb://user:password@host:port/database?authSource=admin&directConnection=true
```

### 2. NEXTAUTH_URL
L'URL complète de votre application déployée sur Vercel.

Exemple :
```
https://votre-app.vercel.app
```

⚠️ **Important** : Cette URL doit correspondre exactement à l'URL de votre déploiement Vercel.

### 3. NEXTAUTH_SECRET
Une chaîne secrète pour signer les tokens JWT.

Pour générer un secret sécurisé, exécutez :
```bash
openssl rand -base64 32
```

Exemple de résultat :
```
Kix2f3...votre-secret-généré...8xPp4=
```

## Configuration dans Vercel

1. Allez sur votre projet Vercel
2. Cliquez sur **Settings** → **Environment Variables**
3. Ajoutez les 3 variables ci-dessus
4. Redéployez votre application

## Vérification

Après avoir configuré les variables et redéployé :

1. Testez la connexion en allant sur `/login`
2. Connectez-vous avec vos identifiants
3. Vous devriez être redirigé vers `/dashboard` puis vers votre dashboard spécifique (teacher/student)

## Problèmes courants

### La redirection ne fonctionne pas après login
- Vérifiez que `NEXTAUTH_URL` correspond exactement à votre URL Vercel
- Vérifiez que `NEXTAUTH_SECRET` est bien défini
- Consultez les logs Vercel pour voir les erreurs

### Erreur de connexion à la base de données
- Vérifiez que votre IP Vercel est autorisée dans MongoDB Atlas (ou utilisez "Allow from anywhere")
- Vérifiez le format de votre `DATABASE_URL`
