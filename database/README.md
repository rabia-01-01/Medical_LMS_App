# Database Migrations & Schemas

This directory holds the authoritative PostgreSQL database schemas, RLS policies, and seed scripts.

## Structure
- `migrations/`: Versioned SQL migration scripts.
- `seeds/`: Seed data for development and testing environments.
- `rls/`: Row Level Security policies.

> **Note**: For backward compatibility with legacy test suites (`test-phase1.mjs`, `test-phase4.mjs`), `src/db/db.sql` and `src/db/seed.sql` are also mirrored. In production deployments with Supabase CLI, standard migrations should reside in `supabase/migrations/` or `database/migrations/`.

