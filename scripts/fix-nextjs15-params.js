/**
 * Script pour corriger les route handlers pour Next.js 15
 *
 * Dans Next.js 15, les params dans les route handlers sont maintenant async (Promise)
 *
 * Avant: { params }: { params: { id: string } }
 * Après: { params }: { params: Promise<{ id: string }> }
 *
 * Et il faut faire: const { id } = await params;
 */

const fs = require('fs').promises;
const path = require('path');

async function findRouteFiles(dir) {
  const files = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
          await walk(fullPath);
        }
      } else if (entry.isFile() && entry.name === 'route.ts') {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

async function fixRouteFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    const originalContent = content;

    // Pattern 1: Trouver les signatures de fonctions avec params
    // Exemple: { params }: { params: { id: string } }
    const paramSignatureRegex = /\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{([^}]+)\}\s*\}/g;

    if (paramSignatureRegex.test(content)) {
      // Replacer la signature pour ajouter Promise<>
      content = content.replace(
        /\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{([^}]+)\}\s*\}/g,
        '{ params }: { params: Promise<{$1}> }'
      );

      modified = true;
    }

    // Pattern 2: Trouver les destructurations de params dans le corps de la fonction
    // et ajouter await si nécessaire
    // Chercher: const { id } = params; ou const { id, ... } = params;
    const destructuringRegex = /const\s+\{([^}]+)\}\s+=\s+params;/g;

    if (content.match(destructuringRegex)) {
      // Remplacer par await params
      content = content.replace(
        /const\s+\{([^}]+)\}\s+=\s+params;/g,
        'const {$1} = await params;'
      );

      modified = true;
    }

    // Pattern 3: Accès direct params.id -> (await params).id
    // Mais seulement si params n'a pas déjà été destructuré
    const directAccessRegex = /params\.(\w+)/g;
    if (content.match(directAccessRegex) && !content.includes('await params')) {
      // Vérifier si c'est dans le corps d'une fonction async
      content = content.replace(
        /params\.(\w+)/g,
        '(await params).$1'
      );
      modified = true;
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

async function main() {
  console.log('🚀 Starting Next.js 15 params migration...\n');

  const apiDir = path.join(process.cwd(), 'app/api');
  const files = await findRouteFiles(apiDir);

  console.log(`📁 Found ${files.length} route files to scan\n`);

  let updatedCount = 0;

  for (const file of files) {
    const wasUpdated = await fixRouteFile(file);
    if (wasUpdated) {
      updatedCount++;
    }
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`📊 Updated ${updatedCount} files`);

  if (updatedCount > 0) {
    console.log(`\n⚠️  Next steps:`);
    console.log(`1. Review the changes carefully`);
    console.log(`2. Run: npm run build`);
    console.log(`3. Test your API routes`);
  }
}

main().catch(console.error);
