-- ============================================================================
-- MEDICAL COMPETITIVE EXAM LMS - PRODUCTION DDL
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'ADMIN');
CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE resource_type AS ENUM ('NOTE', 'BOOK', 'DPP', 'PYQ', 'VIDEO');
CREATE TYPE assessment_type AS ENUM ('DPP', 'PYQ', 'MOCK_TEST', 'TEST_SERIES');
CREATE TYPE question_type AS ENUM ('MCQ', 'MULTIPLE_SELECT', 'NUMERICAL', 'ASSERTION_REASON');
CREATE TYPE attempt_status AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'ABANDONED', 'TIMED_OUT');

-- 2. PROFILES (1:1 with Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. ACADEMIC STRUCTURE
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE, -- e.g. NEET_UG, IMAT, UCAT
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g. Class 11, Class 12, Repeater
    academic_year TEXT NOT NULL, -- e.g. 2026-2027
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. USER DOMAIN EXTENSIONS
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. CURRICULUM HIERARCHY
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- Physics, Chemistry, Biology
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. MANY-TO-MANY RELATIONSHIPS
CREATE TABLE student_exams (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, exam_id)
);

CREATE TABLE student_subjects (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, subject_id)
);

CREATE TABLE faculty_subjects (
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (faculty_id, subject_id)
);

-- 7. LEARNING RESOURCES & FILES
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    resource_type resource_type NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    status content_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE resource_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- e.g. resources/physics/mechanics/kinematics.pdf
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. QUESTION BANK & ASSESSMENTS
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL DEFAULT 'MCQ',
    marks NUMERIC(5,2) NOT NULL DEFAULT 4.00,
    negative_marks NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    explanation TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    option_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assessment_type assessment_type NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    negative_marks NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    allow_retake BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    status content_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE assessment_questions (
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (assessment_id, question_id)
);

-- 9. STUDENT ATTEMPTS & EVALUATION
CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    submitted_at TIMESTAMPTZ,
    status attempt_status NOT NULL DEFAULT 'IN_PROGRESS',
    score NUMERIC(6,2) DEFAULT 0.00,
    accuracy NUMERIC(5,2) DEFAULT 0.00
);

CREATE TABLE attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    marks_awarded NUMERIC(5,2) DEFAULT 0.00,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. GOVERNANCE & AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. INDEXES FOR HIGH-TRAFFIC READS
CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX idx_topics_chapter_id ON topics(chapter_id);
CREATE INDEX idx_resources_subject_status ON resources(subject_id, status);
CREATE INDEX idx_assessments_subject_status ON assessments(subject_id, status);
CREATE INDEX idx_attempts_student_assessment ON attempts(student_id, assessment_id);
CREATE INDEX idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);

-- Enable RLS across all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get authenticated user role
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. PROFILES
CREATE POLICY "Users read their own profile, Admins read all"
ON profiles FOR SELECT USING (id = auth.uid() OR auth.get_user_role() = 'ADMIN');

CREATE POLICY "Users insert their own profile"
ON profiles FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users update their own profile"
ON profiles FOR UPDATE USING (id = auth.uid());

-- 1.1 ROLE EXTENSIONS (Students & Faculty)
CREATE POLICY "Users and staff access student records"
ON students FOR ALL USING (profile_id = auth.uid() OR auth.get_user_role() IN ('FACULTY', 'ADMIN'))
WITH CHECK (profile_id = auth.uid() OR auth.get_user_role() = 'ADMIN');

CREATE POLICY "Users and staff access faculty records"
ON faculty FOR ALL USING (profile_id = auth.uid() OR auth.get_user_role() = 'ADMIN')
WITH CHECK (profile_id = auth.uid() OR auth.get_user_role() = 'ADMIN');

-- 2. CURRICULUM (Subjects, Chapters, Topics)
CREATE POLICY "Everyone authenticated can view academic hierarchy"
ON subjects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage subjects"
ON subjects FOR ALL USING (auth.get_user_role() = 'ADMIN');

CREATE POLICY "Everyone authenticated can view chapters"
ON chapters FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Faculty and Admins manage chapters"
ON chapters FOR ALL USING (auth.get_user_role() IN ('FACULTY', 'ADMIN'));

CREATE POLICY "Everyone authenticated can view topics"
ON topics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Faculty and Admins manage topics"
ON topics FOR ALL USING (auth.get_user_role() IN ('FACULTY', 'ADMIN'));

-- 3. RESOURCES
CREATE POLICY "Students view published resources"
ON resources FOR SELECT USING (
    status = 'PUBLISHED' OR 
    created_by = auth.uid() OR 
    auth.get_user_role() = 'ADMIN'
);

CREATE POLICY "Faculty create resources"
ON resources FOR INSERT WITH CHECK (
    auth.get_user_role() IN ('FACULTY', 'ADMIN') AND 
    created_by = auth.uid()
);

CREATE POLICY "Faculty edit own resources, Admin edit any"
ON resources FOR UPDATE USING (
    created_by = auth.uid() OR 
    auth.get_user_role() = 'ADMIN'
);

CREATE POLICY "Users delete own resources, Admin delete any"
ON resources FOR DELETE USING (
    created_by = auth.uid() OR 
    auth.get_user_role() = 'ADMIN'
);

-- 3.1 RESOURCE FILES
CREATE POLICY "Students and Faculty view resource files for viewable resources"
ON resource_files FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM resources r
        WHERE r.id = resource_files.resource_id
        AND (r.status = 'PUBLISHED' OR r.created_by = auth.uid() OR auth.get_user_role() = 'ADMIN')
    )
);

CREATE POLICY "Faculty and Admins insert resource files"
ON resource_files FOR INSERT WITH CHECK (
    auth.get_user_role() IN ('FACULTY', 'ADMIN')
);

CREATE POLICY "Faculty and Admins delete resource files"
ON resource_files FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM resources r
        WHERE r.id = resource_files.resource_id
        AND (r.created_by = auth.uid() OR auth.get_user_role() = 'ADMIN')
    )
);

-- 4. ASSESSMENTS & QUESTIONS
CREATE POLICY "Students view published assessments"
ON assessments FOR SELECT USING (
    status = 'PUBLISHED' OR 
    created_by = auth.uid() OR 
    auth.get_user_role() = 'ADMIN'
);

CREATE POLICY "Faculty manage assessments"
ON assessments FOR ALL USING (
    created_by = auth.uid() OR 
    auth.get_user_role() = 'ADMIN'
);

CREATE POLICY "Faculty manage questions"
ON questions FOR ALL USING (
    created_by = auth.uid() OR 
    auth.get_user_role() = 'ADMIN'
);

CREATE POLICY "Students read options during attempt"
ON question_options FOR SELECT USING (auth.role() = 'authenticated');

-- 5. ATTEMPTS (Strict Student Isolation)
CREATE POLICY "Students manage their own attempts"
ON attempts FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()) OR
    auth.get_user_role() IN ('FACULTY', 'ADMIN')
);

CREATE POLICY "Students record their own answers"
ON attempt_answers FOR ALL USING (
    attempt_id IN (
        SELECT a.id FROM attempts a
        JOIN students s ON a.student_id = s.id
        WHERE s.profile_id = auth.uid()
    ) OR
    auth.get_user_role() IN ('FACULTY', 'ADMIN')
);

-- 6. AUDIT LOGS
CREATE POLICY "Admins read audit logs"
ON audit_logs FOR SELECT USING (auth.get_user_role() = 'ADMIN');

CREATE POLICY "System logs auditable events"
ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Storage bucket creation
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage: Allow authenticated students & faculty to download resources
CREATE POLICY "Students and Faculty can read resources"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'resources' AND
    auth.role() = 'authenticated'
);

-- RLS for Storage: Only Faculty and Admin can upload files
CREATE POLICY "Faculty and Admins can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'resources' AND
    auth.get_user_role() IN ('FACULTY', 'ADMIN')
);

-- RLS for Storage: Faculty and Admins can delete resources
CREATE POLICY "Faculty and Admins can delete resources"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'resources' AND
    auth.get_user_role() IN ('FACULTY', 'ADMIN')
);

-- ============================================================================
-- 12. AUTOMATIC PROFILE CREATION TRIGGER
-- Ensures a public.profiles and role record is created whenever auth.users signs up
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role user_role := 'STUDENT';
  raw_role text;
BEGIN
  raw_role := new.raw_user_meta_data->>'role';
  IF raw_role ILIKE 'FACULTY' THEN
    assigned_role := 'FACULTY';
  ELSIF raw_role ILIKE 'ADMIN' THEN
    assigned_role := 'ADMIN';
  ELSE
    assigned_role := 'STUDENT';
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    assigned_role,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

  -- Create role-specific extension record
  IF assigned_role = 'STUDENT' THEN
    INSERT INTO public.students (profile_id)
    VALUES (new.id)
    ON CONFLICT (profile_id) DO NOTHING;
  ELSIF assigned_role = 'FACULTY' THEN
    INSERT INTO public.faculty (profile_id, designation)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'department', 'General'))
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

