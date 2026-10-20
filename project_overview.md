# Medical Competitive Exam Learning Management System (LMS)

## 1. Project Overview

This project is a Learning Management System (LMS) designed for students preparing for medical competitive examinations.

The platform will primarily serve two academic user groups:

- **Student** — consumes learning resources, practices questions, takes assessments, and tracks performance.
- **Faculty** — creates and manages academic content, questions, assessments, and student-performance views.
- **Admin** — manages users, academic structure, content governance, and platform administration.

The initial project direction is based on the following academic resources:

- Notes
- Books
- DPP (Daily Practice Problems)
- PYQs (Previous Year Questions)
- Mock Tests
- Test Series

The platform will use a React + TypeScript frontend and Supabase as the backend platform, database, authentication, storage, and authorization layer.

---

# 2. Project Goals

## Primary goals

1. Provide students with a structured academic learning platform.
2. Organize content by examination, subject, chapter, and topic.
3. Allow faculty to create and manage academic resources.
4. Support interactive DPPs, PYQs, mock tests, and test series.
5. Record student attempts and results.
6. Provide basic student-performance analytics.
7. Provide administrators with centralized platform and content management.
8. Implement authorization using Supabase Row Level Security (RLS).
9. Keep the architecture simple enough for development while maintaining a clean path for future expansion.

## Non-goals for the first version

The following should not be treated as mandatory V1 functionality:

- Live classes
- Real-time chat
- AI tutor
- AI-generated questions
- AI recommendations
- Payment/subscription system
- Native mobile application
- Microservices
- Advanced recommendation engines
- Complex gamification
- Large-scale real-time notification infrastructure

These can be added later if the product requirements justify them.

---

# 3. Technology Stack

The project will use the following stack.

## Core Framework and Language

| Technology | Version / Scope | Responsibility |
|---|---|---|
| React | 18.x | UI and component architecture |
| TypeScript | 5.7.x | Type-safe application development |
| Vite | 6.x | Development server and build tooling |

## Styling and Icons

| Technology | Responsibility |
|---|---|
| Tailwind CSS v4 | Utility-first styling |
| Lucide React | Application icons |
| Font Awesome 6 | Existing global icon support |
| Custom CSS variables | Application design tokens/theme |

The current design tokens include variables such as `--navy`, `--teal`, and other existing project theme variables.

## State Management and Data

| Technology | Responsibility |
|---|---|
| React Context API | Authentication/session and lightweight global state |
| Supabase JS | Communication with Supabase |
| Supabase Auth | Authentication and session management |
| PostgreSQL | Persistent application data |
| Supabase Storage | PDFs, images, documents, and other resource files |
| Supabase RLS | Database-level authorization |
| localStorage | Limited client-side persistence/prototype support |

### Important data rule

`localStorage` must not become the primary database.

Once Supabase is connected, PostgreSQL should be the source of truth for persistent application data.

`DataContext` can temporarily support local/mock data during development, but production data should come from Supabase.

## UI and Utility Libraries

| Technology | Responsibility |
|---|---|
| Framer Motion | Animations and transitions |
| Recharts | Analytics and charts |
| dnd-kit | Drag-and-drop interactions |
| canvas-confetti | Completion/achievement feedback |
| date-fns | Date/time formatting and calculations |
| uuid | UUID generation where client-side generation is actually required |
| React Router DOM | Application routing |

---

# 4. High-Level Architecture

The project will use a React + Supabase architecture.

```text
                         ┌─────────────────────┐
                         │      Student        │
                         │      Faculty        │
                         │       Admin         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │     React 18 + TypeScript │
                    │                           │
                    │       Vite 6              │
                    │       React Router        │
                    │       Tailwind CSS        │
                    │       Framer Motion       │
                    │       Recharts            │
                    └─────────────┬─────────────┘
                                  │
                         @supabase/supabase-js
                                  │
                                  ▼
              ┌─────────────────────────────────────┐
              │              Supabase                │
              │                                     │
              │  Authentication                     │
              │  PostgreSQL                         │
              │  Row Level Security                 │
              │  Storage                            │
              │  Realtime                           │
              └───────────────┬─────────────────────┘
                              │
                ┌─────────────┼──────────────┐
                ▼             ▼              ▼
           PostgreSQL      Storage        Auth
                │
                ▼
       LMS Domain Data
```

The application is intentionally designed without a separate Express/Spring Boot backend in the current architecture.

Supabase provides the backend platform while React acts as the client application.

---

# 5. Architecture Principles

The project should follow these principles:

## 5.1 PostgreSQL is the source of truth

Persistent data should live in PostgreSQL.

Do not treat React state or localStorage as the authoritative source.

## 5.2 Authentication and authorization are different

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to do?

Supabase Auth handles authentication.

PostgreSQL RLS policies should enforce database authorization.

## 5.3 Frontend restrictions are not security

The frontend can hide buttons and pages based on roles, but this is not sufficient for security.

For example:

```text
if (user.role === "ADMIN") {
    showDeleteButton();
}
```

is only a UI decision.

The database must independently prevent unauthorized users from deleting data.

## 5.4 Feature-oriented frontend organization

Organize application code around business features rather than creating large generic folders.

## 5.5 Reuse the assessment engine

DPP, PYQ, mock tests, and test series should use a common assessment/question/attempt architecture instead of separate implementations.

## 5.6 Store files outside PostgreSQL

Large binary resources such as PDFs should be stored in Supabase Storage.

PostgreSQL should store their metadata and relationships.

---

# 6. User Roles

The system has three primary roles.

```text
STUDENT
FACULTY
ADMIN
```

## Student

Students can:

- Log in/register.
- Access assigned academic content.
- Browse subjects, chapters, and topics.
- Read/download permitted resources.
- Attempt DPPs.
- Attempt PYQs.
- Attempt mock tests.
- Attempt test series.
- View their own results.
- View their own performance analytics.
- Track learning progress where supported.

## Faculty

Faculty can:

- Log in.
- View assigned subjects.
- Manage permitted academic content.
- Create resources.
- Upload resource files.
- Create questions.
- Create assessments.
- Organize assessment questions.
- Publish or manage content according to permissions.
- View permitted student-performance information.

## Admin

Admins can:

- Manage users.
- Manage students.
- Manage faculty.
- Manage exams.
- Manage classes.
- Manage batches.
- Manage subjects.
- Govern resources.
- Manage assessments.
- Review audit logs.
- Manage platform-level configuration.

---

# 7. Domain Model

The application should be organized around the following domain:

```text
Exam
  ↓
Subject
  ↓
Chapter
  ↓
Topic
  ↓
Learning Resource
  ↓
Practice / Assessment
  ↓
Attempt
  ↓
Result / Performance
```

A sample academic hierarchy:

```text
Medical Competitive Exam
│
├── Physics
│   ├── Mechanics
│   │   ├── Kinematics
│   │   └── Laws of Motion
│   └── Thermodynamics
│
├── Chemistry
│
└── Biology
```

The exact examination names and curriculum should be configured through database records rather than hardcoded into the application.

---

# 8. Identity and Authentication Architecture

Supabase Auth should manage credentials and authentication sessions.

The application should not store plaintext passwords in application tables.

Conceptually:

```text
Supabase auth.users
        │
        │ 1 : 1
        ▼
     profiles
        │
        ├── Student profile
        ├── Faculty profile
        └── Admin profile
```

Authentication flow:

```text
User
  │
  ▼
Login / Register
  │
  ▼
Supabase Auth
  │
  ├── Failure → Display authentication error
  │
  └── Success
        │
        ▼
      Session
        │
        ▼
    AuthContext
        │
        ▼
    Load profile
        │
        ▼
   Determine role
        │
   ┌────┼─────┐
   ▼    ▼     ▼
Student Faculty Admin
```

---

# 9. Database Overview

The initial database should contain the following core tables:

```text
profiles
students
faculty
departments

exams
classes
batches

subjects
chapters
topics

student_exams
student_subjects
faculty_subjects

resources
resource_files

assessments
questions
question_options
assessment_questions

attempts
attempt_answers

audit_logs
```

Potential later tables:

```text
notifications
bookmarks
resource_progress
student_topic_progress
```

These should only be added when the associated feature is actually required.

---

# 10. Database Schema

The following is the conceptual V1 schema.

## 10.1 `profiles`

Stores application-level user profile information.

```text
profiles
--------
id              UUID PK
full_name       TEXT
phone           TEXT
role            ENUM
avatar_url      TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

Role values:

```text
STUDENT
FACULTY
ADMIN
```

`profiles.id` should correspond to the authenticated Supabase user ID.

---

## 10.2 `students`

Stores student-specific academic information.

```text
students
--------
id              UUID PK
profile_id      UUID FK → profiles.id
class_id        UUID FK → classes.id
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

Authentication information such as passwords should not be stored here.

---

## 10.3 `faculty`

Stores faculty-specific information.

```text
faculty
-------
id              UUID PK
profile_id      UUID FK → profiles.id
department_id   UUID FK → departments.id
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

Faculty-to-subject relationships should be handled separately through `faculty_subjects`.

---

## 10.4 `departments`

```text
departments
-----------
id              UUID PK
name            TEXT
description     TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

The exact purpose of `Department` still needs to be finalized according to the organization's academic structure.

If departments do not represent a meaningful product concept, this table should not be forced into the model.

---

## 10.5 `exams`

```text
exams
-----
id              UUID PK
name            TEXT
code            TEXT UNIQUE
description     TEXT
is_active       BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

Exam information should be data-driven rather than hardcoded.

---

## 10.6 `classes`

```text
classes
-------
id              UUID PK
name            TEXT
academic_year   TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

---

## 10.7 `batches`

Use this table if the platform distinguishes a coaching/learning batch from a school class.

```text
batches
-------
id              UUID PK
name            TEXT
class_id        UUID FK → classes.id
exam_id         UUID FK → exams.id
start_date      DATE
end_date        DATE
status          TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

---

# 11. Subject Model

## `subjects`

```text
subjects
--------
id              UUID PK
name            TEXT
code            TEXT UNIQUE
description     TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

Subjects should not be stored as a hardcoded array such as:

```text
subject_id = [BIO, CHEM, PHY]
```

They should be database records.

Example:

```text
1 → Physics
2 → Chemistry
3 → Biology
```

---

# 12. Many-to-Many Relationships

## `student_subjects`

```text
student_subjects
----------------
student_id      UUID FK → students.id
subject_id      UUID FK → subjects.id

PRIMARY KEY(student_id, subject_id)
```

This allows a student to have multiple subjects.

## `student_exams`

```text
student_exams
-------------
student_id      UUID FK → students.id
exam_id         UUID FK → exams.id

PRIMARY KEY(student_id, exam_id)
```

This supports students preparing for multiple exams if the product requirements allow it.

## `faculty_subjects`

```text
faculty_subjects
----------------
faculty_id      UUID FK → faculty.id
subject_id      UUID FK → subjects.id

PRIMARY KEY(faculty_id, subject_id)
```

This supports a faculty member teaching multiple subjects and a subject having multiple faculty members.

---

# 13. Curriculum Structure

## `chapters`

```text
chapters
--------
id              UUID PK
subject_id      UUID FK → subjects.id
name            TEXT
description     TEXT
display_order   INTEGER
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

## `topics`

```text
topics
------
id              UUID PK
chapter_id      UUID FK → chapters.id
name            TEXT
description     TEXT
display_order   INTEGER
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

Hierarchy:

```text
Subject
   │
   ▼
Chapter
   │
   ▼
Topic
```

---

# 14. Resource Model

The platform initially supports:

```text
NOTE
BOOK
DPP
PYQ
VIDEO
```

A resource can be represented as:

```text
resources
---------
id              UUID PK
title           TEXT
description     TEXT
resource_type   ENUM
subject_id      UUID FK → subjects.id
chapter_id      UUID FK → chapters.id
topic_id        UUID FK → topics.id
created_by      UUID FK → profiles.id
status          ENUM
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

Possible resource statuses:

```text
DRAFT
PUBLISHED
ARCHIVED
```

The exact resource types can be expanded later.

---

# 15. Resource Files

Actual files should be stored in Supabase Storage.

Metadata should be stored in PostgreSQL.

## `resource_files`

```text
resource_files
--------------
id              UUID PK
resource_id     UUID FK → resources.id
storage_path    TEXT
file_name       TEXT
mime_type       TEXT
file_size       BIGINT
created_at      TIMESTAMPTZ
```

Example:

```text
resources
   │
   ▼
resource_files
   │
   ▼
Supabase Storage

resources/
└── physics/
    └── mechanics/
        └── kinematics.pdf
```

The database stores metadata and relationships.

Supabase Storage stores the actual binary file.

---

# 16. Assessment Architecture

DPP, PYQ, mock tests, and test series should use a shared assessment engine.

## `assessments`

```text
assessments
-----------
id                  UUID PK
title               TEXT
description         TEXT
assessment_type     ENUM
subject_id          UUID FK → subjects.id
chapter_id          UUID FK → chapters.id
duration_minutes    INTEGER
total_marks         NUMERIC
negative_marks      NUMERIC
created_by          UUID FK → profiles.id
status              ENUM
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

Possible assessment types:

```text
DPP
PYQ
MOCK_TEST
TEST_SERIES
```

Possible statuses:

```text
DRAFT
PUBLISHED
ARCHIVED
```

---

# 17. Question Model

## `questions`

```text
questions
---------
id              UUID PK
question_text   TEXT
question_type   ENUM
marks           NUMERIC
negative_marks  NUMERIC
explanation     TEXT
created_by      UUID FK → profiles.id
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

Question types should be defined according to the actual examination requirements.

For a first version, MCQ can be the primary type.

---

# 18. Question Options

## `question_options`

```text
question_options
----------------
id              UUID PK
question_id     UUID FK → questions.id
option_text     TEXT
is_correct      BOOLEAN
option_order    INTEGER
```

Example:

```text
Question
   │
   ├── Option A
   ├── Option B
   ├── Option C
   └── Option D
```

This is preferable to hardcoding columns such as:

```text
option_a
option_b
option_c
option_d
```

because the option structure can then be extended more easily.

---

# 19. Assessment Questions

## `assessment_questions`

```text
assessment_questions
--------------------
assessment_id   UUID FK → assessments.id
question_id     UUID FK → questions.id
question_order INTEGER

PRIMARY KEY(assessment_id, question_id)
```

This allows questions to be reused in multiple assessments.

Example:

```text
Assessment A
   ├── Question 1
   ├── Question 2
   └── Question 3

Assessment B
   ├── Question 2
   ├── Question 4
   └── Question 5
```

---

# 20. Attempt Architecture

When a student starts an assessment, an attempt is created.

## `attempts`

```text
attempts
--------
id              UUID PK
assessment_id   UUID FK → assessments.id
student_id      UUID FK → students.id
started_at      TIMESTAMPTZ
submitted_at    TIMESTAMPTZ
status          ENUM
score           NUMERIC
```

Possible statuses:

```text
IN_PROGRESS
SUBMITTED
ABANDONED
```

---

# 21. Attempt Answers

## `attempt_answers`

```text
attempt_answers
---------------
id                  UUID PK
attempt_id          UUID FK → attempts.id
question_id         UUID FK → questions.id
selected_option_id  UUID FK → question_options.id
is_correct          BOOLEAN
marks_awarded       NUMERIC
answered_at         TIMESTAMPTZ
```

Workflow:

```text
Student
   │
   ▼
Open Assessment
   │
   ▼
Start Attempt
   │
   ▼
Create attempt
   │
   ▼
Answer Questions
   │
   ▼
Store attempt answers
   │
   ▼
Submit
   │
   ▼
Evaluate
   │
   ▼
Calculate Score
   │
   ▼
Store Result
```

---

# 22. Audit Logs

The existing project direction includes audit logs.

The conceptual structure can be:

```text
audit_logs
----------
id              UUID PK
actor_id        UUID FK → profiles.id
action          TEXT
entity_type     TEXT
entity_id       UUID
metadata        JSONB
created_at      TIMESTAMPTZ
```

Examples of auditable actions:

```text
USER_CREATED
USER_UPDATED
RESOURCE_CREATED
RESOURCE_UPDATED
RESOURCE_PUBLISHED
RESOURCE_ARCHIVED
ASSESSMENT_CREATED
ASSESSMENT_PUBLISHED
```

The exact list should be finalized based on administrative requirements.

---

# 23. Complete Relationship Model

```text
                         ┌──────────────┐
                         │    EXAMS     │
                         └──────┬───────┘
                                │
                                │
                         ┌──────▼───────┐
                         │   SUBJECTS   │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │   CHAPTERS   │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │    TOPICS    │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │  RESOURCES   │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │   FILES      │
                         └──────────────┘


STUDENT ──────< STUDENT_EXAMS >────── EXAM

STUDENT ──────< STUDENT_SUBJECTS >─── SUBJECT

FACULTY ──────< FACULTY_SUBJECTS >─── SUBJECT


                         ┌───────────────┐
                         │  ASSESSMENTS  │
                         └───────┬───────┘
                                 │
                         ┌───────▼─────────────┐
                         │ ASSESSMENT_QUESTIONS│
                         └───────┬─────────────┘
                                 │
                         ┌───────▼───────┐
                         │   QUESTIONS   │
                         └───────┬───────┘
                                 │
                         ┌───────▼───────────┐
                         │ QUESTION_OPTIONS  │
                         └────────────────────┘


STUDENT
   │
   ▼
ATTEMPTS
   │
   ▼
ATTEMPT_ANSWERS
   │
   ▼
QUESTIONS
```

---

# 24. Frontend Architecture

Recommended frontend structure:

```text
src/
│
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   └── common/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── services.ts
│   │
│   ├── student/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services.ts
│   │
│   ├── faculty/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services.ts
│   │
│   ├── admin/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services.ts
│   │
│   ├── subjects/
│   ├── chapters/
│   ├── resources/
│   ├── assessments/
│   ├── questions/
│   ├── attempts/
│   └── analytics/
│
├── context/
│   ├── AuthContext.tsx
│   └── DataContext.tsx
│
├── hooks/
│
├── lib/
│   ├── supabase.ts
│   └── utils.ts
│
├── types/
│   ├── database.ts
│   ├── auth.ts
│   └── common.ts
│
├── layouts/
│   ├── StudentLayout.tsx
│   ├── FacultyLayout.tsx
│   └── AdminLayout.tsx
│
├── index.css
└── main.tsx
```

---

# 25. React State Architecture

The existing `AuthContext.tsx` should remain responsible for authentication/session state.

`DataContext.tsx` should not become a giant global store containing all application data.

Avoid putting all of these into one context:

```text
students
faculty
subjects
resources
questions
tests
attempts
analytics
audit logs
```

Instead use feature-level hooks/services.

Example:

```text
AuthContext
    │
    └── session / authenticated user / role

Feature hooks
    │
    ├── useSubjects()
    ├── useResources()
    ├── useAssessments()
    ├── useAttempts()
    └── useStudentProgress()
```

The hooks/services communicate with Supabase.

---

# 26. Supabase Client

A centralized client should exist:

```text
src/lib/supabase.ts
```

Conceptually:

```text
React Application
        │
        ▼
supabase.ts
        │
        ▼
@supabase/supabase-js
        │
        ▼
Supabase
```

The Supabase URL and public client key should be provided through environment variables.

Sensitive server-side credentials must not be exposed in the frontend.

---

# 27. Routing Architecture

Recommended application routes:

```text
/
├── login
├── register
│
├── student
│   ├── dashboard
│   ├── subjects
│   ├── resources
│   ├── assessments
│   ├── assessments/:id
│   ├── attempts/:id
│   └── progress
│
├── faculty
│   ├── dashboard
│   ├── subjects
│   ├── resources
│   ├── assessments
│   ├── questions
│   └── students
│
└── admin
    ├── dashboard
    ├── users
    ├── students
    ├── faculty
    ├── subjects
    ├── resources
    └── audit-logs
```

Frontend route protection should be implemented for user experience.

Database RLS remains the actual authorization boundary.

---

# 28. Student Workflow

```text
LOGIN
  │
  ▼
STUDENT DASHBOARD
  │
  ├───────────────┬───────────────┐
  ▼               ▼               ▼
Subjects        Tests          Progress
  │               │
  ▼               ▼
Chapter        Assessment
  │               │
  ▼               ▼
Topic           Attempt
  │               │
  ▼               ▼
Resource        Result
```

Detailed flow:

```text
Student Login
     ↓
Load Student Profile
     ↓
Load permitted Exam/Class/Subject information
     ↓
Open Subject
     ↓
Open Chapter
     ↓
Open Topic
     ↓
Browse Resources
     ↓
Read / Download Resource
     ↓
Practice DPP / PYQ
     ↓
Take Mock Test / Test Series
     ↓
Submit Attempt
     ↓
Evaluation
     ↓
Result
     ↓
Performance Analytics
```

The UI should present this as a learning journey rather than exposing database concepts directly.

---

# 29. Faculty Workflow

```text
Faculty Login
      │
      ▼
Faculty Dashboard
      │
      ├── Subjects
      │     └── Chapters
      │          └── Topics
      │
      ├── Resources
      │     ├── Notes
      │     ├── Books
      │     ├── DPP
      │     └── PYQ
      │
      ├── Assessments
      │     ├── Create Test
      │     ├── Add Questions
      │     └── Publish
      │
      └── Student Performance
```

Example resource workflow:

```text
Faculty
   ↓
Select Assigned Subject
   ↓
Select Chapter
   ↓
Select Topic
   ↓
Create Resource
   ↓
Enter Metadata
   ↓
Upload File if required
   ↓
Save Draft
   ↓
Publish
   ↓
Student Can Access if RLS and publication rules allow
```

---

# 30. Admin Workflow

```text
Admin Login
     │
     ▼
Admin Dashboard
     │
     ├── Users
     │    ├── Students
     │    └── Faculty
     │
     ├── Academic
     │    ├── Exams
     │    ├── Classes
     │    ├── Batches
     │    └── Subjects
     │
     ├── Content
     │    ├── Resources
     │    └── Assessments
     │
     └── Audit Logs
```

The admin is the governance layer rather than a middleman through which every student/faculty request must pass.

---

# 31. Assessment Workflow

## Faculty creates an assessment

```text
Faculty
   ↓
Create Assessment
   ↓
Choose Assessment Type
   ↓
Choose Subject / Chapter
   ↓
Configure Duration and Marks
   ↓
Add Questions
   ↓
Set Question Order
   ↓
Save Draft
   ↓
Publish
```

## Student attempts assessment

```text
Student
   ↓
Open Assessment
   ↓
Start Attempt
   ↓
Attempt Questions
   ↓
Save Answers
   ↓
Submit
   ↓
Evaluate
   ↓
Calculate Score
   ↓
Store Result
   ↓
Display Result
```

---

# 32. Resource Workflow

```text
Faculty
   │
   ▼
Create Resource
   │
   ├── Title
   ├── Description
   ├── Resource Type
   ├── Subject
   ├── Chapter
   ├── Topic
   └── File
          │
          ▼
     Supabase Storage
          │
          ▼
     Resource Metadata
          │
          ▼
       DRAFT
          │
          ▼
      PUBLISHED
          │
          ▼
      Student Access
```

---

# 33. Authorization Architecture

The authorization model should operate at multiple levels.

## Frontend

Used for:

- Route protection
- Showing/hiding UI
- Role-specific dashboards
- Preventing accidental access

## Database

Used for:

- Actual data authorization
- Row-level access
- Resource ownership
- Student-specific access
- Faculty permissions
- Admin permissions

Conceptually:

```text
React
  │
  ▼
Supabase API
  │
  ▼
PostgreSQL
  │
  ▼
RLS Policy
  │
  ├── ALLOW
  └── DENY
```

---

# 34. RLS Policy Direction

The exact SQL policies should be finalized once the database schema and access rules are frozen.

The intended behavior is approximately:

### Student

Can:

- Read published resources they are permitted to access.
- Read permitted subjects/chapters/topics.
- Create their own assessment attempts.
- Read their own attempts.
- Read their own answers/results.

Should not:

- Modify faculty content.
- Modify other students' attempts.
- Modify questions.
- Modify assessment configuration.
- Access administrative records.

### Faculty

Can:

- Read assigned academic areas.
- Create resources where authorized.
- Update resources they own/manage.
- Create questions where authorized.
- Create assessments where authorized.
- View permitted performance data.

Should not:

- Modify users unless explicitly authorized.
- Modify unrelated faculty content.
- Access administrative information without permission.

### Admin

Can:

- Manage platform data according to administrative policies.
- Manage users.
- Manage academic structure.
- Manage content.
- Review audit information.

---

# 35. Analytics

Recharts can be used for student/faculty dashboards.

Potential student metrics include:

```text
Total Tests Attempted
Average Score
Average Accuracy
Subject-wise Accuracy
Recent Test Scores
Question-wise Performance
Attempt History
```

Potential visualization:

```text
Student Performance
│
├── Score Trend
├── Subject Performance
├── Accuracy
└── Test History
```

Analytics should be calculated from actual stored assessment/attempt data rather than mock values once the backend is connected.

---

# 36. Existing Libraries and Their Roles

## Framer Motion

Use for:

- Page transitions
- Dashboard interactions
- Modal animations
- Cards
- Loading states
- Small UI transitions

Avoid animating every element without a UX reason.

## Recharts

Use for:

- Score trends
- Accuracy
- Subject performance
- Test history
- Faculty analytics

## dnd-kit

Potential uses:

- Question ordering
- Assessment builder
- Resource ordering
- Curriculum ordering

## canvas-confetti

Potential uses:

- Assessment completion
- Achievement/milestone feedback

This should remain a small UI enhancement rather than a core feature.

## date-fns

Use for:

- Dates
- Assessment schedules
- Attempt duration
- Formatting timestamps

## uuid

Use only where client-generated UUIDs are actually necessary.

Database-generated UUIDs should generally remain the default source for database primary keys.

---

# 37. File Storage Architecture

Recommended storage separation:

```text
Supabase Storage
│
└── resources/
    ├── physics/
    ├── chemistry/
    └── biology/
```

The application should not depend on manually constructed public URLs when private access is required.

Resource access should follow the project's Supabase Storage and authorization model.

The exact bucket privacy strategy should be decided together with the RLS/storage policies.

---

# 38. Recommended API/Data Access Pattern

Because Supabase is the backend platform, the frontend will communicate through the Supabase client.

Conceptually:

```text
React Component
      │
      ▼
Feature Hook
      │
      ▼
Feature Service
      │
      ▼
Supabase Client
      │
      ▼
Supabase
      │
      ├── Auth
      ├── PostgreSQL
      └── Storage
```

Example:

```text
StudentDashboard
       ↓
useStudentSubjects()
       ↓
studentService
       ↓
Supabase query
       ↓
student_subjects + subjects
       ↓
UI
```

This keeps direct database queries from being scattered across every component.

---

# 39. Recommended Frontend Feature Modules

```text
features/
├── auth/
├── student/
├── faculty/
├── admin/
├── subjects/
├── chapters/
├── topics/
├── resources/
├── assessments/
├── questions/
├── attempts/
└── analytics/
```

Each feature can contain:

```text
components/
pages/
hooks/
services.ts
types.ts
```

This makes the codebase easier to maintain as the LMS grows.

---

# 40. Initial V1 Feature Scope

The first usable version should focus on:

```text
1. Authentication
2. Role-based access
3. Student profile
4. Faculty profile
5. Admin profile
6. Exam management
7. Class management
8. Subject management
9. Chapter/topic hierarchy
10. Resource management
11. File uploads
12. DPP
13. PYQ
14. Mock tests
15. Question management
16. Assessment attempts
17. Result calculation
18. Basic student analytics
19. Audit logs
```

A feature should only be added to V1 if it supports one of these core workflows.

---

# 41. Suggested Development Phases

## Phase 1 — Project Foundation

```text
React
TypeScript
Vite
Tailwind
React Router
Supabase client
Environment configuration
Folder architecture
```

Deliverable:

```text
Running frontend + Supabase connection
```

## Phase 2 — Authentication

Implement:

```text
Registration
Login
Logout
Session persistence
Profile loading
Role handling
Protected routes
```

Deliverable:

```text
Student / Faculty / Admin can authenticate
```

## Phase 3 — Database

Create:

```text
profiles
students
faculty
departments
exams
classes
batches
subjects
chapters
topics
```

Then create relationship tables:

```text
student_exams
student_subjects
faculty_subjects
```

Deliverable:

```text
Academic structure is stored in PostgreSQL
```

## Phase 4 — RLS

Implement and test:

```text
Student policies
Faculty policies
Admin policies
Storage policies
```

Deliverable:

```text
Unauthorized database operations are rejected
```

## Phase 5 — Resource Management

Implement:

```text
Resource CRUD
Resource metadata
File upload
File metadata
Draft/published status
Student resource access
```

Deliverable:

```text
Faculty can publish resources and students can access permitted resources
```

## Phase 6 — Assessment Engine

Implement:

```text
Questions
Options
Assessments
Assessment-question relationships
Attempt creation
Answer submission
Evaluation
Results
```

Deliverable:

```text
Student can complete an interactive test
```

## Phase 7 — Analytics

Implement:

```text
Score history
Accuracy
Subject performance
Attempt history
```

Deliverable:

```text
Student performance dashboard
```

## Phase 8 — Admin

Implement:

```text
User management
Academic management
Content governance
Audit logs
```

Deliverable:

```text
Operational admin dashboard
```

## Phase 9 — UX and Polish

Use:

```text
Framer Motion
Recharts
dnd-kit
canvas-confetti
date-fns
```

where they provide actual product value.

---

# 42. Important Product Decisions Before Database Implementation

The following points must be finalized before the schema is converted into production SQL.

## Decision 1 — Department

What exactly does `Department` mean?

Possible interpretations:

```text
Academic department
Faculty department
Institutional department
Subject grouping
```

If it does not represent a real business concept, remove it instead of retaining it unnecessarily.

## Decision 2 — Multiple Exams

Can a student prepare for:

```text
one exam only
```

or:

```text
multiple exams
```

The schema supports multiple exams through `student_exams`.

## Decision 3 — Faculty Subjects

Can a faculty member teach:

```text
one subject
```

or:

```text
multiple subjects
```

The recommended design uses `faculty_subjects`, which supports many-to-many relationships.

## Decision 4 — Class vs Batch

Are these different?

For example:

```text
Class = 11th / 12th
Batch = NEET 2027 Morning Batch
```

If yes, keep both.

If not, don't create unnecessary complexity.

## Decision 5 — DPP/PYQ/Mock Test Type

Are these:

```text
PDF/document resources
```

or:

```text
interactive online assessments
```

If they are interactive, they should use the assessment/question/attempt architecture.

---

# 43. Recommended Final V1 Domain Model

```text
IDENTITY
├── User / Supabase Auth
├── Profile
├── Student
├── Faculty
└── Admin

ACADEMIC
├── Department
├── Exam
├── Class
├── Batch
├── Subject
├── Chapter
└── Topic

RELATIONSHIPS
├── StudentExam
├── StudentSubject
└── FacultySubject

CONTENT
├── Resource
└── ResourceFile

ASSESSMENT
├── Assessment
├── Question
├── QuestionOption
└── AssessmentQuestion

STUDENT ACTIVITY
├── Attempt
└── AttemptAnswer

GOVERNANCE
└── AuditLog
```

---

# 44. Final System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│                                                             │
│       Student              Faculty              Admin       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  REACT APPLICATION                          │
│                                                             │
│ React 18 + TypeScript + Vite                                │
│ Tailwind CSS + Lucide + Font Awesome                        │
│ React Router + Context                                      │
│ Framer Motion + Recharts + dnd-kit                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE CLIENT                            │
│                  @supabase/supabase-js                      │
└────────────────────────────┬────────────────────────────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
┌──────────────────┐ ┌────────────────┐ ┌──────────────────┐
│  Supabase Auth   │ │  PostgreSQL    │ │ Supabase Storage │
│                  │ │                │ │                  │
│ Login            │ │ Identity       │ │ PDFs             │
│ Register         │ │ Academic       │ │ Documents        │
│ Sessions         │ │ Content        │ │ Images            │
│                  │ │ Assessment     │ │ Other files       │
└──────────────────┘ │ Attempts       │ └──────────────────┘
                     │ Audit Logs     │
                     └───────┬────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ PostgreSQL RLS │
                    │                │
                    │ Authorization  │
                    └────────────────┘
```

---

# 45. Final Recommendation

For this project, the architecture should remain:

```text
React + TypeScript + Vite
          +
Supabase
          +
PostgreSQL
          +
Supabase Auth
          +
Supabase Storage
          +
RLS
```

There is no current need to introduce another backend framework.

The most important engineering priorities are:

1. Freeze the domain model before implementation.
2. Make PostgreSQL the source of truth.
3. Use Supabase Auth for authentication.
4. Use RLS for actual authorization.
5. Keep `AuthContext` focused on session/authentication state.
6. Avoid turning `DataContext` into a global database.
7. Use feature-based frontend organization.
8. Model many-to-many relationships explicitly.
9. Reuse one assessment engine for DPP, PYQ, mock tests, and test series.
10. Store files in Supabase Storage rather than PostgreSQL.
11. Keep the V1 scope controlled.
12. Add complexity only when a real product requirement requires it.

---

# 46. Open Questions

Before writing the final production SQL schema and RLS policies, the team should explicitly decide:

- What does `Department` represent?
- Can one student prepare for multiple exams?
- Can one faculty teach multiple subjects?
- Are Class and Batch separate concepts?
- Are DPP/PYQ/Mock Tests interactive or document-based?
- Are resources available to all students or only selected exams/classes/batches?
- Can faculty publish content directly, or does Admin approval have to happen first?
- Can multiple faculty members manage the same subject?
- Can students enroll themselves, or are they assigned by Admin?
- Will the platform support multiple institutions/coaching centers?
- Are assessments timed?
- Can a student retake an assessment?
- Are negative marks configurable per assessment or per question?
- Should students see answers/explanations immediately after submission or only after publication?
- Should test results be visible immediately?
- Which resources require authentication?
- Should uploaded resources be private or public?
- What exactly should faculty be allowed to see about student performance?
- Which administrative actions must be recorded in audit logs?

These decisions should be finalized before the production database schema and RLS policies are implemented.

---

# 47. Team Implementation Order

The recommended implementation order is:

```text
Requirements
     ↓
Domain Model
     ↓
ER Diagram
     ↓
PostgreSQL Schema
     ↓
RLS Policies
     ↓
Supabase Storage Design
     ↓
Authentication
     ↓
Frontend Routing
     ↓
Student Module
     ↓
Faculty Module
     ↓
Resource Module
     ↓
Assessment Engine
     ↓
Attempts & Evaluation
     ↓
Analytics
     ↓
Admin Module
     ↓
Testing
     ↓
Deployment
```

Do not start by building all three dashboards independently.

The database/domain model and authorization rules should be established first because the student, faculty, and admin interfaces all depend on them.

---

# 48. Architecture Status

Current status:

```text
Architecture              → Proposed
Technology Stack           → Defined
User Roles                → Defined
Core Domain               → Proposed
Database Entities         → Proposed
Assessment Model          → Proposed
Frontend Structure        → Proposed
Authentication Model      → Proposed
Authorization Model       → Proposed
Storage Model             → Proposed
Student Workflow          → Proposed
Faculty Workflow          → Proposed
Admin Workflow            → Proposed
V1 Scope                  → Proposed

Production SQL Schema     → Pending final domain decisions
RLS SQL Policies          → Pending final access rules
ER Diagram                → Pending final domain decisions
```

The next engineering artifact should therefore be the **final ER diagram + normalized PostgreSQL schema + constraints/indexes + Supabase RLS policies**, after the open product decisions have been answered.
