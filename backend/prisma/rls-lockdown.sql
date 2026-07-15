-- Supabase RLS lockdown for Prisma-backed tables (post-MVP / security hardening)
--
-- Why: without RLS, the Supabase anon key can read/write public.* via PostgREST.
-- NestJS uses DATABASE_URL as the table owner (postgres / pooler role), which
-- bypasses RLS unless FORCE ROW LEVEL SECURITY is set — so the API keeps working
-- with no policies needed for the backend role.
--
-- Apply manually when ready (Supabase SQL editor or `psql $DATABASE_URL -f ...`):
--   psql "$DATABASE_URL" -f prisma/rls-lockdown.sql
--
-- Do NOT enable FORCE ROW LEVEL SECURITY unless you also add policies for the
-- Prisma role — that would break NestJS until policies exist.

BEGIN;

ALTER TABLE public."AdminUser"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Artwork"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Option"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Photo"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Order"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrderItem"  ENABLE ROW LEVEL SECURITY;

-- Optional: hide migration history from PostgREST clients.
-- Prisma migrate still works as table owner.
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verify (expect rowsecurity = true):
-- SELECT relname, relrowsecurity, relforcerrowsecurity
-- FROM pg_class
-- WHERE relname IN (
--   'AdminUser', 'Artwork', 'Option', 'Photo', 'Order', 'OrderItem', '_prisma_migrations'
-- );
