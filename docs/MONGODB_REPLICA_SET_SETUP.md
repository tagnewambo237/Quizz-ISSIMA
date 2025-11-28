# Configuration MongoDB Replica Set

## Problème
Prisma nécessite que MongoDB soit configuré en replica set pour effectuer des transactions.

## Solution 1 : MongoDB Atlas (Recommandé)
1. Créer un compte sur https://mongodb.com/cloud/atlas
2. Créer un cluster gratuit (M0)
3. Obtenir la connection string
4. Mettre à jour DATABASE_URL dans .env

## Solution 2 : Configurer le serveur existant en Replica Set

### Sur le serveur MongoDB (185.98.139.202)

1. **Modifier le fichier de configuration MongoDB** (`/etc/mongod.conf`) :
```yaml
replication:
  replSetName: "rs0"
```

2. **Redémarrer MongoDB** :
```bash
sudo systemctl restart mongod
```

3. **Se connecter à MongoDB** :
```bash
mongosh --host 185.98.139.202 -u xkorinUser -p xkorinm4m2024 --authenticationDatabase admin
```

4. **Initialiser le replica set** :
```javascript
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "185.98.139.202:27017" }
  ]
})
```

5. **Vérifier le statut** :
```javascript
rs.status()
```

### Mettre à jour la connection string

Après configuration, mettez à jour votre `.env` :
```
DATABASE_URL="mongodb://xkorinUser:xkorinm4m2024@185.98.139.202/qcmapp?authSource=admin&replicaSet=rs0"
```

Notez l'ajout de `&replicaSet=rs0` à la fin.

## Solution 3 : Utiliser un autre provider

- **Railway** : https://railway.app (MongoDB avec replica set)
- **Render** : https://render.com (PostgreSQL recommandé)
- **Supabase** : https://supabase.com (PostgreSQL gratuit)

## Note importante
Si vous changez de base de données (ex: PostgreSQL), vous devrez :
1. Modifier `prisma/schema.prisma` : changer `provider = "mongodb"` en `provider = "postgresql"`
2. Adapter les types de données (@db.ObjectId → @default(autoincrement()))
3. Exécuter `npx prisma migrate dev`
