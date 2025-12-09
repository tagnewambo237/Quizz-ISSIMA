#!/bin/bash

# Script to fix Next.js 15 async params in API routes
# This updates all route handlers to await params

echo "Fixing async params in API routes..."

# Find all route.ts files with [id] in the path
find app/api -name "route.ts" -path "*\[id\]*" | while read file; do
    echo "Processing: $file"
    
    # Replace synchronous params with async params
    # Pattern 1: { params }: { params: { id: string } }
    # Replace with: { params }: { params: Promise<{ id: string }> }
    sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"
    
    # Pattern 2: Add await params at the beginning of the function
    # This is more complex and needs manual review
done

echo "Done! Please review the changes and add 'const { id } = await params' where needed."
