# Multi-Teacher Collaboration System

## Overview

The Multi-Teacher Collaboration System allows multiple teachers to collaborate on the same class, each with their own subject specialty and configurable permissions. This enables schools to accurately model real-world scenarios where different teachers handle different subjects for the same class.

## Architecture

### Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                           Class                                  │
├─────────────────────────────────────────────────────────────────┤
│ mainTeacher: ObjectId (Owner - legacy compatibility)            │
│ teachers: [                                                      │
│   {                                                              │
│     teacher: ObjectId → User                                     │
│     subject: ObjectId → Subject                                  │
│     role: ClassTeacherRole                                       │
│     permissions: ClassTeacherPermission[]                        │
│     addedBy: ObjectId → User                                     │
│     addedAt: Date                                                │
│     isActive: boolean                                            │
│   }                                                              │
│ ]                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Roles

| Role | Description | Default Permissions |
|------|-------------|---------------------|
| `OWNER` | The main teacher who created the class | All permissions |
| `COLLABORATOR` | Can manage exams and grade students | Most permissions except `INVITE_TEACHERS` |
| `ASSISTANT` | Limited access, mainly viewing and grading | `VIEW_STUDENTS`, `GRADE_STUDENTS`, `VIEW_ANALYTICS` |

### Permissions

#### Exam Management
- `CREATE_EXAM` - Create exams for the class
- `EDIT_EXAM` - Edit existing exams
- `DELETE_EXAM` - Delete exams
- `PUBLISH_EXAM` - Publish exams to students

#### Student Management
- `GRADE_STUDENTS` - Grade student submissions
- `VIEW_STUDENTS` - View student list and info
- `MANAGE_STUDENTS` - Add/remove students

#### Communication
- `CREATE_FORUM` - Create class forums
- `SEND_MESSAGES` - Send messages to class

#### Administration
- `INVITE_TEACHERS` - Invite other teachers to the class
- `VIEW_ANALYTICS` - View class analytics and reports
- `EDIT_CLASS_INFO` - Edit class name, description, etc.

## API Endpoints

### GET /api/classes/[id]/teachers

Get all teachers for a class.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "teacher": { "_id": "...", "name": "John Doe", "email": "..." },
      "subject": { "_id": "...", "name": "Mathematics", "code": "MATH" },
      "role": "COLLABORATOR",
      "permissions": ["CREATE_EXAM", "GRADE_STUDENTS", ...],
      "addedBy": { "_id": "...", "name": "Jane Smith" },
      "addedAt": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  ]
}
```

### POST /api/classes/[id]/teachers

Add a teacher to a class for a specific subject.

**Request Body:**
```json
{
  "teacherId": "user_id_here",
  "subjectId": "subject_id_here",
  "role": "COLLABORATOR",
  "permissions": ["CREATE_EXAM", "GRADE_STUDENTS", "VIEW_STUDENTS"]
}
```

### PUT /api/classes/[id]/teachers

Update teacher permissions.

**Request Body:**
```json
{
  "teacherId": "user_id_here",
  "subjectId": "subject_id_here",
  "permissions": ["CREATE_EXAM", "GRADE_STUDENTS"],
  "role": "ASSISTANT"
}
```

### DELETE /api/classes/[id]/teachers

Remove a teacher from a class.

**Query Parameters:**
- `teacherId` - The user ID of the teacher
- `subjectId` - The subject ID

## Service Methods

### ClassTeacherService

```typescript
import { ClassTeacherService } from '@/lib/services/ClassTeacherService'

// Add a teacher
await ClassTeacherService.addTeacher(
  classId,
  teacherId,
  subjectId,
  ClassTeacherRole.COLLABORATOR,
  [ClassTeacherPermission.CREATE_EXAM, ClassTeacherPermission.GRADE_STUDENTS],
  addedByUserId
)

// Check permission
const canGrade = await ClassTeacherService.hasPermission(
  classId,
  userId,
  ClassTeacherPermission.GRADE_STUDENTS
)

// Check if user is teacher in class
const isTeacher = await ClassTeacherService.isTeacherInClass(classId, userId)

// Get all classes for a teacher
const classes = await ClassTeacherService.getTeacherClasses(userId)

// Get subjects a teacher can manage in a class
const subjects = await ClassTeacherService.getTeacherSubjectsInClass(classId, teacherId)
```

## UI Components

### TeacherInvitationModal

A versatile modal component that supports both:
- **School invitations**: Invite teachers to an establishment via link, email, or Excel import
- **Class invitations**: 3-step wizard for inviting teachers with subject and permissions

#### Usage for School Invitation

```tsx
import { TeacherInvitationModal } from '@/components/school/TeacherInvitationModal'

// Invite teachers to a school
<TeacherInvitationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  schoolId={schoolId}
/>
```

#### Usage for Class Invitation (with Subject & Permissions)

```tsx
import { TeacherInvitationModal } from '@/components/school/TeacherInvitationModal'

// Invite a teacher to a class with subject and permissions
<TeacherInvitationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  classId={classId}
  className="Terminale C 2"
  onTeacherAdded={() => refreshTeacherList()}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called when modal is closed |
| `schoolId` | `string?` | For school invitations |
| `classId` | `string?` | For class invitations (enables 3-step wizard) |
| `className` | `string?` | Display name of the class |
| `onTeacherAdded` | `() => void?` | Callback when teacher is added |

**Note**: Either `schoolId` or `classId` must be provided.


## Usage Examples

### Adding a Math Teacher to a Class

```typescript
// 1. Via API
const response = await fetch(`/api/classes/${classId}/teachers`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    teacherId: 'math_teacher_user_id',
    subjectId: 'mathematics_subject_id',
    role: 'COLLABORATOR',
    permissions: [
      'CREATE_EXAM',
      'EDIT_EXAM',
      'PUBLISH_EXAM',
      'GRADE_STUDENTS',
      'VIEW_STUDENTS',
      'VIEW_ANALYTICS'
    ]
  })
})

// 2. Via Service
await ClassTeacherService.addTeacher(
  classId,
  'math_teacher_user_id',
  'mathematics_subject_id',
  ClassTeacherRole.COLLABORATOR
)
```

### Checking Permissions Before Action

```typescript
// In an API route or server action
const canCreateExam = await ClassTeacherService.hasPermission(
  classId,
  session.user.id,
  ClassTeacherPermission.CREATE_EXAM,
  subjectId // Optional: check for specific subject
)

if (!canCreateExam) {
  return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
}
```

## Migration Notes

- The `mainTeacher` field is kept for backward compatibility
- Existing classes will continue to work with just `mainTeacher`
- The `teachers` array is optional and defaults to empty
- The owner role in `teachers` should match `mainTeacher` for consistency

## Future Enhancements

- [ ] Email notifications when invited to a class
- [ ] Invitation acceptance flow (pending invitations)
- [ ] Bulk teacher import via Excel
- [ ] Permission templates for common scenarios
- [ ] Activity log for permission changes
