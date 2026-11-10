-- ============================================================================
-- Migration 001: User Registration Approval & Granular Resource Access Control
-- Students, Faculty, and Consultant Agents start as PENDING until Admin allows.
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'user_role' AND e.enumlabel = 'CONSULTANT'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'CONSULTANT';
    END IF;
END
$$;

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
    ADD COLUMN IF NOT EXISTS access_permissions JSONB NOT NULL DEFAULT
        '{"resources": false, "branch": false, "courses": false, "quizzes": false, "announcements": false, "notifications": false}'::jsonb;

DROP POLICY IF EXISTS "Admins update user access and approval" ON profiles;
CREATE POLICY "Admins update user access and approval"
ON profiles FOR UPDATE
USING (public.get_user_role() = 'ADMIN')
WITH CHECK (public.get_user_role() = 'ADMIN');

