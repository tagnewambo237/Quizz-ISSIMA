#!/usr/bin/env python3
import re
import os

# Liste des fichiers à corriger
files_to_fix = [
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
]

print('🔧 Fixing async params in API routes for Next.js 15...\n')

for file_path in files_to_fix:
    if not os.path.exists(file_path):
        print(f'⚠️  File not found: {file_path}')
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix 1: Update params type
    content = re.sub(
        r'\{ params \}: \{ params: \{ id: string \} \}',
        '{ params }: { params: Promise<{ id: string }> }',
        content
    )
    
    # Fix 2: Add await params and replace params.id with id
    # Pattern: trouve chaque fonction export async et ajoute const { id } = await params
    def fix_function(match):
        func = match.group(0)
        
        # Si la fonction utilise params.id et n'a pas déjà await params
        if 'params.id' in func and 'await params' not in func:
            # Ajouter const { id } = await params après le premier try {
            func = re.sub(
                r'(try \{\s+)',
                r'\1const { id } = await params\n        ',
                func,
                count=1
            )
            # Remplacer tous les params.id par id
            func = func.replace('params.id', 'id')
        
        return func
    
    # Trouve toutes les fonctions export async
    content = re.sub(
        r'export async function (GET|POST|PUT|DELETE|PATCH)\([^)]+\) \{[\s\S]*?^\}',
        fix_function,
        content,
        flags=re.MULTILINE
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✅ Fixed: {file_path}')
    else:
        print(f'ℹ️  No changes needed: {file_path}')

print('\n✨ Done!')
