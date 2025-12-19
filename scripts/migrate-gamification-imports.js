/**
 * Script de migration des imports pour le module Gamification
 *
 * Remplace tous les imports depuis les anciens chemins vers le nouveau module
 *
 * Usage:
 *   node scripts/migrate-gamification-imports.js
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Mapping des anciens imports vers les nouveaux
const IMPORT_MAPPINGS = {
  // Models
  "from '@/models/UserXP'": "from '@/modules/gamification'",
  "from '@/models/XPTransaction'": "from '@/modules/gamification'",
  "from '@/models/Badge'": "from '@/modules/gamification'",
  'from "@/models/UserXP"': 'from "@/modules/gamification"',
  'from "@/models/XPTransaction"': 'from "@/modules/gamification"',
  'from "@/models/Badge"': 'from "@/modules/gamification"',

  // Services
  "from '@/lib/services/GamificationService'": "from '@/modules/gamification'",
  "from '@/lib/services/LeaderboardService'": "from '@/modules/gamification'",
  'from "@/lib/services/GamificationService"': 'from "@/modules/gamification"',
  'from "@/lib/services/LeaderboardService"': 'from "@/modules/gamification"',

  // Hooks (si existants)
  "from '@/hooks/useUserXP'": "from '@/modules/gamification'",
  "from '@/hooks/useBadges'": "from '@/modules/gamification'",
  "from '@/hooks/useLeaderboard'": "from '@/modules/gamification'",
  'from "@/hooks/useUserXP"': 'from "@/modules/gamification"',
  'from "@/hooks/useBadges"': 'from "@/modules/gamification"',
  'from "@/hooks/useLeaderboard"': 'from "@/modules/gamification"',

  // Components (si existants)
  "from '@/components/gamification": "from '@/modules/gamification'",
  'from "@/components/gamification': 'from "@/modules/gamification"'
};

async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    const originalContent = content;

    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
      if (content.includes(oldImport)) {
        // Utiliser une regex pour remplacer globalement
        const regex = new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, newImport);
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function findFiles(dir, extensions, excludeDirs = []) {
  const files = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (!excludeDirs.some(exclude => fullPath.includes(exclude))) {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(dir);
  return files;
}

async function migrateImports() {
  console.log('🚀 Starting Gamification imports migration...\n');

  // Trouver tous les fichiers TypeScript/React
  const files = await findFiles(process.cwd(), ['.ts', '.tsx'], [
    'node_modules',
    '.next',
    'modules/gamification'
  ]);

  console.log(`📁 Found ${files.length} files to scan\n`);

  let updatedCount = 0;

  for (const file of files) {
    const wasUpdated = await updateFile(file);
    if (wasUpdated) {
      updatedCount++;
    }
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`📊 Updated ${updatedCount} files`);

  if (updatedCount > 0) {
    console.log(`\n⚠️  Next steps:`);
    console.log(`1. Run: npm run build`);
    console.log(`2. Check for TypeScript errors`);
    console.log(`3. Test your application`);
    console.log(`4. If all works, you can delete old files:`);
    console.log(`   - models/UserXP.ts`);
    console.log(`   - models/XPTransaction.ts`);
    console.log(`   - models/Badge.ts`);
    console.log(`   - lib/services/GamificationService.ts`);
    console.log(`   - lib/services/LeaderboardService.ts`);
  }
}

// Exécuter
migrateImports().catch(console.error);
