# 05 - Architecture Frontend

> **Document:** Structure Frontend
> **Version:** 2.0
> **Dernière mise à jour:** Décembre 2024

---

## 📚 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure des Pages](#structure-des-pages)
3. [Composants Organisés](#composants-organisés)
4. [Hooks Personnalisés](#hooks-personnalisés)
5. [State Management](#state-management)
6. [Guards et Protection](#guards-et-protection)

---

## 🎯 Vue d'ensemble

Xkorin School utilise **Next.js 16 App Router** avec **React 19** et **TypeScript**. L'architecture frontend suit une approche component-based modulaire.

### Technologies Frontend

- **Framework:** Next.js 16.0.5 (App Router)
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS 4.1.7
- **Forms:** React Hook Form 7.66.1
- **Animations:** Framer Motion 12.23.24
- **State:** React Context API
- **Routing:** File-based (Next.js)

---

## 📱 Structure des Pages

### App Directory Structure

```
/app/
├── (dashboard)/                    # Route group avec layout
│   ├── layout.tsx                  # Dashboard layout (Sidebar + Header)
│   │
│   ├── student/                    # Student dashboard
│   │   ├── page.tsx                # /student
│   │   ├── history/
│   │   │   ├── page.tsx            # /student/history
│   │   │   └── [attemptId]/
│   │   │       └── page.tsx        # /student/history/:attemptId
│   │   └── settings/
│   │       └── page.tsx            # /student/settings
│   │
│   └── teacher/                    # Teacher dashboard
│       ├── page.tsx                # /teacher
│       ├── exams/
│       │   ├── page.tsx            # /teacher/exams
│       │   ├── create/
│       │   │   └── page.tsx        # /teacher/exams/create
│       │   └── [id]/
│       │       ├── page.tsx        # /teacher/exams/:id
│       │       ├── edit/
│       │       │   └── page.tsx    # /teacher/exams/:id/edit
│       │       ├── monitor/
│       │       │   └── page.tsx    # /teacher/exams/:id/monitor
│       │       └── results/
│       │           └── page.tsx    # /teacher/exams/:id/results
│       │
│       └── students/
│           └── page.tsx            # /teacher/students
│
├── student/                        # Pages étudiant hors dashboard
│   └── exam/[id]/
│       ├── lobby/
│       │   └── page.tsx            # /student/exam/:id/lobby
│       ├── take/
│       │   └── page.tsx            # /student/exam/:id/take
│       └── result/
│           └── page.tsx            # /student/exam/:id/result
│
├── login/
│   └── page.tsx                    # /login
├── register/
│   └── page.tsx                    # /register
├── onboarding/
│   └── page.tsx                    # /onboarding
│
├── layout.tsx                      # Root layout
├── page.tsx                        # Homepage (/)
└── globals.css                     # Global styles
```

---

## 🧩 Composants Organisés

### Component Structure

```
/components/
├── auth/                           # Authentication components
│   ├── SessionProvider.tsx         # NextAuth session wrapper
│   ├── OAuthButtons.tsx            # Google/GitHub login buttons
│   └── LoginForm.tsx               # Email/password form
│
├── dashboard/                      # Dashboard components
│   ├── teacher/
│   │   ├── StatsOverview.tsx       # Teacher stats cards
│   │   ├── RecentActivity.tsx      # Activity feed
│   │   ├── QuickActions.tsx        # Quick action buttons
│   │   └── ExamList.tsx            # Exam list with filters
│   │
│   └── student/
│       ├── MyJourney.tsx           # Progress tracker
│       ├── AvailableExams.tsx      # Exam cards
│       ├── Recommendations.tsx     # Smart recommendations
│       └── LearningModeSelector.tsx # Mode switcher
│
├── exam/                           # Exam-related components
│   ├── ExamCard.tsx                # Exam card display
│   ├── ExamForm.tsx                # Create/edit exam form
│   ├── ExamLobby.tsx               # Pre-exam screen
│   ├── ExamTaker.tsx               # Exam interface
│   ├── ExamReview.tsx              # Results review
│   ├── QuestionDisplay.tsx         # Question component
│   ├── AnswerOptions.tsx           # Option buttons
│   ├── NavigationPanel.tsx         # Question navigator
│   ├── TimerCountdown.tsx          # Timer component
│   ├── ProgressIndicator.tsx       # Progress bar
│   ├── LateCodeModal.tsx           # Late code input
│   └── ExamCardActions.tsx         # Action buttons
│
├── exam-creator/                   # Exam creation wizard
│   ├── Step1Classification.tsx     # Subject/level selection
│   ├── Step2TargetAudience.tsx     # Who can take
│   ├── Step3Configuration.tsx      # Duration/anti-cheat
│   ├── Step4QuestionEditor.tsx     # Add questions
│   └── Step5Preview.tsx            # Review before publish
│
├── analytics/                      # Analytics components
│   ├── ExamStats.tsx               # Exam statistics
│   ├── StudentPerformanceTable.tsx # Performance table
│   ├── ChartScoreDistribution.tsx  # Score chart
│   └── QuestionAnalysis.tsx        # Question-by-question stats
│
├── onboarding/                     # Onboarding components
│   ├── LevelSelector.tsx           # Education level picker
│   ├── FieldSelector.tsx           # Field/series picker
│   ├── SubjectSelector.tsx         # Subject multiselect
│   ├── SubSystemSelector.tsx       # Francophone/Anglophone
│   └── StepIndicator.tsx           # Progress indicator
│
├── guards/                         # Permission guards
│   ├── RoleGuard.tsx               # Role-based rendering
│   └── PermissionGuard.tsx         # Permission-based rendering
│
├── layout/                         # Layout components
│   ├── Sidebar.tsx                 # Dashboard sidebar
│   ├── MobileHeader.tsx            # Mobile header
│   ├── Footer.tsx                  # Footer
│   └── NavLink.tsx                 # Active nav link
│
└── ui/                             # Reusable UI components
    ├── Button.tsx                  # Button variants
    ├── Input.tsx                   # Form input
    ├── Modal.tsx                   # Modal dialog
    ├── Card.tsx                    # Card container
    ├── Badge.tsx                   # Badge/chip
    ├── Spinner.tsx                 # Loading spinner
    ├── Toast.tsx                   # Toast notification
    └── Dropdown.tsx                # Dropdown menu
```

### Component Examples

#### ExamCard.tsx

```typescript
interface ExamCardProps {
  exam: IExam;
  variant?: 'default' | 'compact';
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ExamCard({ exam, variant = 'default', showActions, onEdit, onDelete }: ExamCardProps) {
  const { canEdit } = useAccessControl({ resourceType: 'exam', resource: exam });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-xl font-bold">{exam.title}</h3>
      <p className="text-gray-600">{exam.description}</p>

      <div className="flex gap-2 mt-4">
        <Badge>{exam.difficultyLevel}</Badge>
        <Badge variant="outline">{exam.evaluationType}</Badge>
      </div>

      {showActions && canEdit && (
        <div className="flex gap-2 mt-4">
          <Button onClick={() => onEdit?.(exam._id)}>Edit</Button>
          <Button variant="danger" onClick={() => onDelete?.(exam._id)}>Delete</Button>
        </div>
      )}
    </motion.div>
  );
}
```

---

#### ExamTaker.tsx

```typescript
export function ExamTaker({ attemptId }: { attemptId: string }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Map<string, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(0);

  const { data: attempt, isLoading } = useAttempt(attemptId);
  const { recordAnswer } = useAutoSave(attemptId);
  const { trackTabSwitch, trackCopyAttempt } = useAntiCheat(attemptId);

  useEffect(() => {
    // Anti-cheat: Track tab switches
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackTabSwitch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleAnswer = (questionId: string, optionId: string) => {
    setResponses(prev => new Map(prev).set(questionId, optionId));
    recordAnswer({ questionId, selectedOptionId: optionId });
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="exam-taker fullscreen">
      <TimerCountdown initialTime={timeRemaining} onExpire={handleSubmit} />
      <ProgressIndicator current={currentQuestion + 1} total={attempt.questions.length} />

      <QuestionDisplay
        question={attempt.questions[currentQuestion]}
        selectedOption={responses.get(attempt.questions[currentQuestion]._id)}
        onAnswer={handleAnswer}
      />

      <NavigationPanel
        questions={attempt.questions}
        currentIndex={currentQuestion}
        responses={responses}
        onNavigate={setCurrentQuestion}
      />
    </div>
  );
}
```

---

## 🎣 Hooks Personnalisés

### `/hooks/`

#### useAuth.ts

```typescript
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    role: session?.user?.role
  };
}
```

---

#### useAccessControl.ts

```typescript
interface UseAccessControlOptions {
  resourceType: 'exam' | 'attempt' | 'profile';
  resource?: any;
}

export function useAccessControl({ resourceType, resource }: UseAccessControlOptions) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState({ canView: false, canEdit: false, canDelete: false });

  useEffect(() => {
    if (!user || !resource) return;

    // Call Chain of Responsibility API
    fetch('/api/access/check', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, resourceType, resourceId: resource._id })
    })
      .then(res => res.json())
      .then(data => setPermissions(data.permissions));
  }, [user, resource]);

  return permissions;
}
```

---

#### useExam.ts

```typescript
export function useExam(examId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    examId ? `/api/exams/v2/${examId}` : null,
    fetcher
  );

  return {
    exam: data?.data,
    isLoading,
    error,
    refresh: mutate
  };
}
```

---

#### useAttempt.ts

```typescript
export function useAttempt(attemptId: string) {
  const [attempt, setAttempt] = useState<IAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/attempts/${attemptId}`)
      .then(res => res.json())
      .then(data => {
        setAttempt(data.data);
        setIsLoading(false);
      });
  }, [attemptId]);

  const submitAttempt = async (timeSpent: number) => {
    const res = await fetch(`/api/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSpent })
    });

    return res.json();
  };

  return {
    attempt,
    isLoading,
    submitAttempt
  };
}
```

---

#### useAntiCheat.ts

```typescript
export function useAntiCheat(attemptId: string) {
  const trackEvent = async (type: string, details?: any) => {
    await fetch(`/api/attempts/${attemptId}/anti-cheat-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, details })
    });
  };

  const trackTabSwitch = () => trackEvent('tab_switch');
  const trackCopyAttempt = () => trackEvent('copy_attempt');
  const trackFullscreenExit = () => trackEvent('fullscreen_exit');

  return {
    trackTabSwitch,
    trackCopyAttempt,
    trackFullscreenExit
  };
}
```

---

#### useAutoSave.ts

```typescript
export function useAutoSave(attemptId: string, interval: number = 30000) {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    if (queue.length === 0) return;

    const timer = setTimeout(async () => {
      // Batch save all queued responses
      await fetch(`/api/attempts/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, responses: queue })
      });

      setQueue([]);
    }, interval);

    return () => clearTimeout(timer);
  }, [queue, interval]);

  const recordAnswer = (response: any) => {
    setQueue(prev => [...prev, response]);
  };

  return { recordAnswer };
}
```

---

## 🔒 Guards et Protection

### RoleGuard.tsx

```typescript
interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return fallback;
  }

  return <>{children}</>;
}

// Usage
<RoleGuard allowedRoles={[UserRole.TEACHER, UserRole.INSPECTOR]}>
  <CreateExamButton />
</RoleGuard>
```

---

### PermissionGuard.tsx

```typescript
interface PermissionGuardProps {
  permission: string;  // 'exam:create', 'exam:edit', etc.
  resourceType?: string;
  resource?: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, resourceType, resource, children, fallback }: PermissionGuardProps) {
  const { canEdit, canDelete } = useAccessControl({ resourceType, resource });

  const hasPermission = permission === 'exam:edit' ? canEdit : canDelete;

  if (!hasPermission) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Usage
<PermissionGuard permission="exam:edit" resourceType="exam" resource={exam}>
  <Button>Edit Exam</Button>
</PermissionGuard>
```

---

## 🎨 State Management

### React Context API

**SessionProvider** (NextAuth):

```typescript
// app/layout.tsx
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

### Local State Management

**useState pour composants locaux:**

```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedExam, setSelectedExam] = useState<IExam | null>(null);
```

**useReducer pour state complexe:**

```typescript
const [state, dispatch] = useReducer(examCreatorReducer, initialState);

dispatch({ type: 'ADD_QUESTION', payload: question });
```

---

## 🎬 Animations

### Framer Motion Examples

**Page transitions:**

```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

**List animations:**

```typescript
<motion.ul>
  {exams.map((exam, index) => (
    <motion.li
      key={exam._id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <ExamCard exam={exam} />
    </motion.li>
  ))}
</motion.ul>
```

---

## 📝 Prochaines Étapes

Pour comprendre l'authentification et les services :

1. **[06_AUTHENTICATION.md](./06_AUTHENTICATION.md)** - NextAuth configuration
2. **[07_SERVICES.md](./07_SERVICES.md)** - Business services
3. **[04_API_ENDPOINTS.md](./04_API_ENDPOINTS.md)** - API appelées par le frontend

---

**Dernière mise à jour:** Décembre 2024
