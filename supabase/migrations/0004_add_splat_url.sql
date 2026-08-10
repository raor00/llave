-- Llave — add Gaussian Splat URL support for existing deployments.
-- Fresh installs already create this column in 0001_init.sql; this keeps
-- deployed Supabase projects compatible without destructive changes.

alter table if exists public.properties
  add column if not exists splat_url text;
