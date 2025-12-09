# Xkorin School Project Documentation

## 1. Project Overview

**Xkorin School** is a secure online examination platform built with modern web technologies. It allows teachers to create, manage, and monitor exams, while students can take exams in a secure environment.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB
- **ORM**: Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Language**: TypeScript

---

## 2. Environment Variables

The application requires the following environment variables in a `.env` file:

```env
# Database
MONGODB_URI=mongodb+srv://... # Connection string to MongoDB

# Authentication
NEXTAUTH_URL=http://localhost:3000 # Base URL of the app
NEXTAUTH_SECRET=... # Secret key for session encryption

# Optional
NODE_ENV=development # or production
```

---

## 3. Database Models

### User
Represents a platform user (Student or Teacher).
- `name` (String): Full name.
- `email` (String): Unique email address.
- `password` (String): Hashed password.
- `role` (Enum): `STUDENT` or `TEACHER`.
- `studentCode` (String, Optional): Unique code for students.

### Exam
Represents a quiz or exam created by a teacher.
- `title` (String): Exam title.
- `description` (String): Optional description.
- `startTime` (Date): When the exam becomes available.
- `endTime` (Date): When the exam closes.
- `duration` (Number): Time limit in minutes.
- `closeMode` (Enum): `STRICT` (hard close) or `PERMISSIVE` (allows late entry with code).
- `createdById` (ObjectId): Reference to the Teacher (User).

### Question
Represents a single question in an exam.
- `examId` (ObjectId): Reference to the Exam.
- `text` (String): Question text.
- `imageUrl` (String, Optional): URL for an image attachment.
- `points` (Number): Score value (default: 1).

### Option
Represents a choice for a question.
- `questionId` (ObjectId): Reference to the Question.
- `text` (String): Option text.
- `isCorrect` (Boolean): Whether this option is the correct answer.

### Attempt
Represents a student's attempt at taking an exam.
- `examId` (ObjectId): Reference to the Exam.
- `userId` (ObjectId): Reference to the Student (User).
- `startedAt` (Date): When the attempt began.
- `expiresAt` (Date): When the attempt must be submitted (based on duration).
- `submittedAt` (Date, Optional): When the attempt was actually submitted.
- `status` (Enum): `STARTED` or `COMPLETED`.
- `score` (Number, Optional): Final score.
- `resumeToken` (String): Unique token to resume the exam if interrupted.

### Response
Represents a student's answer to a specific question.
- `attemptId` (ObjectId): Reference to the Attempt.
- `questionId` (ObjectId): Reference to the Question.
- `selectedOptionId` (ObjectId): Reference to the selected Option.
- `isCorrect` (Boolean): Whether the selected option was correct (cached for performance).

### LateCode
Represents a special access code for permissive exams.
- `code` (String): The unique access code.
- `examId` (ObjectId): Reference to the Exam.
- `usagesRemaining` (Number): How many times this code can be used.
- `expiresAt` (Date, Optional): Expiration date for the code.
- `assignedUserId` (ObjectId, Optional): If assigned to a specific student.

---

## 4. API Reference

### Authentication
- `POST /api/register`: Register a new user.
- `GET/POST /api/auth/[...nextauth]`: NextAuth endpoints (Login, Logout, Session).

### Exams (Teacher)
- `POST /api/exams`: Create a new exam with questions and options.
- `PUT /api/exams/[id]`: Update an exam. Handles partial updates if attempts exist (locks questions).
- `DELETE /api/exams/[id]`: Delete an exam and all related data (cascade delete).

### Attempts (Student)
- `POST /api/attempts/start`: Start a new attempt. Checks date restrictions and late codes.
- `POST /api/attempts/answer`: Save a single answer.
- `POST /api/attempts/submit`: Submit an attempt and calculate the final score.

### Other
- `POST /api/late-codes`: Generate a new late access code (Teacher only).
- `POST /api/resume`: Validate a resume token and get the redirect URL.

---

## 5. Frontend Architecture

### Public Pages
- `app/page.tsx`: Landing page.
- `app/login/page.tsx`: Login page.
- `app/register/page.tsx`: Registration page.
- `app/resume/page.tsx`: Page to enter a resume token.

### Dashboard Layout (`app/(dashboard)`)
Shared layout for authenticated users, including the Sidebar and MobileHeader.

#### Teacher Views (`app/(dashboard)/teacher`)
- **Dashboard** (`/teacher`): Overview of exams and stats.
- **Create Exam** (`/teacher/exams/create`): Form to create a new exam.
- **Edit Exam** (`/teacher/exams/[id]/edit`): Form to edit an existing exam.
- **Monitor Exam** (`/teacher/exams/[id]/monitor`): Real-time view of student progress and late codes.
- **Students** (`/teacher/students`): List of students who have taken exams.

#### Student Views (`app/(dashboard)/student`)
- **Dashboard** (`/student`): List of available and upcoming exams.
- **History** (`/student/history`): List of past exam attempts and scores.
- **Attempt Details** (`/student/history/[attemptId]`): Detailed view of a specific attempt.

### Exam Taking Flow (`app/student/exam/[id]`)
Isolated layout (no sidebar) for focus.
- **Lobby** (`/lobby`): Exam details and "Start" button.
- **Take** (`/take`): The actual exam interface. Includes anti-cheat measures (fullscreen, focus tracking).
- **Result** (`/result`): Summary after submission.

---

## 6. Middleware & Security

### `middleware.ts`
Handles route protection and redirection based on authentication status and user roles.
- **Public Routes**: `/login`, `/register`, `/` (landing).
- **Protected Routes**: `/dashboard`, `/teacher/*`, `/student/*`, `/exam/*`.
- **Role Enforcement**:
    - Users with `TEACHER` role attempting to access `/student/*` are redirected (logic present but commented out/flexible).
    - Users with `STUDENT` role attempting to access `/teacher/*` are redirected to `/student`.

### `lib/auth.ts`
Configures NextAuth.js with:
- **CredentialsProvider**: Handles email/password login.
- **Callbacks**:
    - `jwt`: Adds `id` and `role` to the JWT token.
    - `session`: Makes `id` and `role` available in the client-side session.

---

## 7. Component Library

### Dashboard Components (`components/dashboard`)
- `Sidebar.tsx`: Main navigation for authenticated users.
- `MobileHeader.tsx`: Header for mobile view with hamburger menu.
- `ExamForm.tsx`: Complex form for creating/editing exams (Teacher).
- `MonitorView.tsx`: Real-time dashboard for monitoring an active exam (Teacher).
- `ExamCardActions.tsx`: Action buttons for exam cards (Teacher).

### Student Components (`components/student`)
- `ExamCard.tsx`: Displays exam info and status (Upcoming, Active, Completed).
- `ExamLobby.tsx`: Pre-exam screen with instructions and "Start" button.
- `ExamTaker.tsx`: The main exam interface. Handles:
    - Timer countdown.
    - Question navigation.
    - Answer selection.
    - Fullscreen enforcement.
    - Tab switch detection.
- `ExamReview.tsx`: Read-only view of a completed exam attempt.
- `LateCodeModal.tsx`: Modal to enter a late access code.

### Utilities (`lib`)
- `mongodb.ts`: Singleton connection to MongoDB.
- `sounds.ts` & `SOUNDS.md`: Sound effects management (success, error, completion).
- `shuffle.ts`: Utility to shuffle questions/options (if enabled).

---

## 8. Key Features & Logic

- **Secure Exam Environment**: The exam interface (`ExamTaker.tsx`) includes measures to prevent cheating, such as disabling copy-paste and tracking tab switching.
- **Resume Capability**: If a student gets disconnected, they can use a unique `resumeToken` to continue their exam within the allowed time window.
- **Late Access Codes**: For "Permissive" exams, teachers can generate codes to allow students to enter after the official start time.
- **Automatic Grading**: Scores are calculated immediately upon submission based on the selected options.
