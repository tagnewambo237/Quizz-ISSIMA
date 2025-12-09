# File Upload Security - Documentation

## Protection Activée

| Attaque | Mesure | Fichier |
|---------|--------|---------|
| Formula Injection | Strip `=`,`+`,`-`,`@`,`\t` | `fileUploadSecurity.ts` |
| XSS | HTML entity encoding | `sanitizeForDatabase()` |
| NoSQL Injection | Escape `$` et `.` | `sanitizeForDatabase()` |
| Oversized Files | Max 5MB, 500 lignes | `SECURITY_LIMITS` |
| Invalid MIME | Whitelist types | `validateFileBasic()` |

---

## Fichiers Modifiés

| Fichier | Changement |
|---------|------------|
| `lib/security/fileUploadSecurity.ts` | **NEW** - Module sécurité principal |
| `components/.../InviteImport.tsx` | Intégration validation client |
| `app/api/.../invitations/route.ts` | Validation serveur batch |

---

## Utilisation

### Côté Client (InviteImport)
```tsx
import { validateFileBasic, sanitizeName, sanitizeEmail } from "@/lib/security/fileUploadSecurity";

// Avant parsing
const validation = validateFileBasic(file);
if (!validation.valid) throw new Error(validation.error);

// Pour chaque cellule
const name = sanitizeName(rawName);
const email = sanitizeEmail(rawEmail);
```

### Côté Serveur (API Route)
```ts
// Limite batch
if (students.length > 500) return error;

// Sanitize chaque étudiant
const sanitized = students.map(s => ({
    name: String(s.name).trim().substring(0, 100),
    email: String(s.email).toLowerCase().substring(0, 254)
}));
```

---

## Tests Manuels

1. **Formula Injection**: Upload CSV avec `=CMD('calc')` → Doit être nettoyé
2. **Oversized**: Upload fichier >5MB → Doit être rejeté
3. **Too Many Rows**: Upload fichier >500 lignes → Doit être rejeté
4. **XSS**: Upload avec `<script>alert(1)</script>` → Doit être encodé
