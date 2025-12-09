const fs = require('fs');
const path = require('path');

// List of files that need to be fixed
const filesToFix = [
    'app/api/attempts/[id]/anti-cheat-event/route.ts',
    'app/api/attempts/[id]/resume/route.ts',
    'app/api/attempts/[id]/route.ts',
    'app/api/attempts/[id]/submit/route.ts',
    'app/api/competencies/[id]/route.ts',
    'app/api/education-levels/[id]/route.ts',
    'app/api/exams/[id]/archive/route.ts',
    'app/api/exams/[id]/publish/route.ts',
    'app/api/exams/[id]/submit-validation/route.ts',
    'app/api/exams/[id]/validate/route.ts',
    'app/api/fields/[id]/route.ts',
    'app/api/learning-units/[id]/route.ts',
    'app/api/subjects/[id]/route.ts',
];

console.log('Fixing async params in API routes for Next.js 15...\n');

filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix 1: Update params type from { id: string } to Promise<{ id: string }>
    const oldPattern = /\{ params \}: \{ params: \{ id: string \} \}/g;
    const newPattern = '{ params }: { params: Promise<{ id: string }> }';

    if (content.match(oldPattern)) {
        content = content.replace(oldPattern, newPattern);
        modified = true;
    }

    // Fix 2: Add await params after function start
    // Look for patterns like:
    //   ) {
    //       try {
    //           ...
    //           params.id

    // Replace params.id with id (after adding const { id } = await params)
    const functionsToFix = content.match(/export async function (GET|POST|PUT|DELETE|PATCH)\([^)]+\) \{[^}]+\}/gs);

    if (functionsToFix) {
        functionsToFix.forEach(func => {
            if (func.includes('params.id') && !func.includes('await params')) {
                // Add const { id } = await params after the first try {
                const updatedFunc = func.replace(
                    /(try \{[\s\n]+)/,
                    '$1        const { id } = await params\n'
                );

                // Replace all params.id with just id
                const finalFunc = updatedFunc.replace(/params\.id/g, 'id');

                content = content.replace(func, finalFunc);
                modified = true;
            }
        });
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${file}`);
    } else {
        console.log(`ℹ️  No changes needed: ${file}`);
    }
});

console.log('\n✨ Done!');
