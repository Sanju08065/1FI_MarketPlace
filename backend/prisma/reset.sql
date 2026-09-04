-- Full schema reset. Drops all objects in the public schema so Prisma
-- migrations can be applied cleanly. Used by `npm run db:reset`.
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
