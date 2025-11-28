# Remaining Prisma to Mongoose Migrations

## Status: 9 Pages Remaining

All API routes have been successfully migrated. The following pages still need migration:

### Teacher Dashboard Pages (5)
1. `/app/(dashboard)/teacher/exams/page.tsx` - List of all exams
2. `/app/(dashboard)/teacher/exams/[id]/edit/page.tsx` - Edit exam
3. `/app/(dashboard)/teacher/exams/[id]/monitor/page.tsx` - Monitor attempts
4. `/app/(dashboard)/teacher/students/page.tsx` - List students

### Student Dashboard Pages (2)
5. `/app/(dashboard)/student/page.tsx` - Student dashboard
6. `/app/(dashboard)/student/history/page.tsx` - Exam history

### Student Exam Pages (3)
7. `/app/student/exam/[id]/lobby/page.tsx` - Exam lobby
8. `/app/student/exam/[id]/take/page.tsx` - Take exam
9. `/app/student/exam/[id]/result/page.tsx` - View results

## Common Migration Patterns

### Import Changes
```typescript
// OLD
import { prisma } from "@/lib/prisma"

// NEW
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import Option from "@/models/Option"
import Attempt from "@/models/Attempt"
import Response from "@/models/Response"
// ... import only what you need
```

### Connection
Always add at the start of the component:
```typescript
await connectDB()
```

### Finding Documents
```typescript
// OLD: prisma.exam.findUnique({ where: { id } })
// NEW: Exam.findById(id)

// OLD: prisma.exam.findMany({ where: { createdById: userId } })
// NEW: Exam.find({ createdById: userId })

// OLD: prisma.exam.findFirst({ where: { ... } })
// NEW: Exam.findOne({ ... })
```

### Populate (Relations)
```typescript
// OLD: include: { questions: { include: { options: true } } }
// NEW: .populate({ path: 'questions', populate: { path: 'options' } })

// Note: Mongoose doesn't auto-populate. You need to:
// 1. Use .populate() for simple cases
// 2. Or fetch related documents separately with find()
```

### ID Conversion
```typescript
// Mongoose uses _id (ObjectId), not id (string)
// Always convert to string when returning to client:
exam._id.toString()

// When comparing:
exam.createdById.toString() === session.user.id
```

### Counting
```typescript
// OLD: prisma.exam.count({ where: { ... } })
// NEW: Exam.countDocuments({ ... })
```

### Aggregations
```typescript
// For complex queries, use Mongoose aggregation:
const stats = await Exam.aggregate([
  { $match: { createdById: userId } },
  { $group: { _id: null, total: { $sum: 1 } } }
])
```

## Quick Migration Checklist for Each File

- [ ] Replace imports
- [ ] Add `await connectDB()` at start
- [ ] Replace `prisma.model.findUnique` → `Model.findById`
- [ ] Replace `prisma.model.findMany` → `Model.find`
- [ ] Replace `prisma.model.findFirst` → `Model.findOne`
- [ ] Replace `prisma.model.create` → `Model.create`
- [ ] Replace `prisma.model.update` → `Model.findByIdAndUpdate`
- [ ] Replace `prisma.model.delete` → `Model.findByIdAndDelete`
- [ ] Replace `prisma.model.count` → `Model.countDocuments`
- [ ] Handle `include` → use `.populate()` or separate queries
- [ ] Convert `id` → `_id.toString()`
- [ ] Convert ID comparisons to use `.toString()`
- [ ] Test the page

## Testing Strategy

1. Start dev server: `npm run dev`
2. Test each migrated page:
   - Teacher: Create exam, edit, monitor, view students
   - Student: View dashboard, take exam, view results
3. Check console for errors
4. Verify data is displayed correctly
5. Test all CRUD operations

## Deployment Checklist

- [ ] All pages migrated
- [ ] Local testing complete
- [ ] Update `DATABASE_URL` in Vercel env vars
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Test in production
