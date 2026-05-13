-- Llave — initial schema
-- Run on Supabase (Postgres 15+). Assumes pgcrypto, uuid-ossp default extensions in Supabase.

create extension if not exists "pgcrypto";

-- =========================================================
-- ENUMS
-- =========================================================
do $$ begin
  create type user_role as enum ('inquilino','asesor','propietario','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_type as enum ('apartamento','casa','local','edificio','habitacion');
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_status as enum ('disponible','reservado','alquilado','pausado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('nuevo','contactado','agendado','descartado','firmado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_source as enum ('chat','directo','asesor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_role as enum ('user','assistant','tool','system');
exception when duplicate_object then null; end $$;

-- =========================================================
-- PROFILES
-- =========================================================
-- NOTE: profile.id matches auth.users(id) for real users, but is NOT a hard FK
-- so we can seed demo data without needing auth.users rows.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  role user_role not null default 'inquilino',
  full_name text,
  phone text,
  avatar_url text,
  bio text,
  city text,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  -- "trust score" — non-bank credit-ish reputation derived from on-platform behavior
  trust_score int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- =========================================================
-- PROPERTIES
-- =========================================================
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  type property_type not null,
  status property_status not null default 'disponible',

  -- location
  address text not null,
  city text not null,
  state text not null,
  country text not null default 'Venezuela',
  lat numeric(10,7),
  lng numeric(10,7),

  -- specs
  price_usd numeric(10,2) not null,
  -- explicit "Llave commitment": no months upfront, no admin fee
  no_months_upfront boolean not null default true,
  deposit_months numeric(3,1) not null default 1,

  rooms int not null default 0,
  bathrooms int not null default 0,
  area_m2 int,
  parking_spots int default 0,

  amenities text[] default '{}',
  rules text[] default '{}',

  cover_url text,
  gallery_urls text[] default '{}',
  spline_scene_url text,
  tour_3d_url text,

  search_tsv tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_status_idx on public.properties(status);
create index if not exists properties_city_idx on public.properties(city);
create index if not exists properties_type_idx on public.properties(type);
create index if not exists properties_price_idx on public.properties(price_usd);
create index if not exists properties_search_idx on public.properties using gin(search_tsv);

create or replace function public.properties_tsv_trigger() returns trigger as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('spanish', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(new.city,'')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(new.state,'')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(new.description,'')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(array_to_string(new.amenities,' '),'')), 'C') ||
    setweight(to_tsvector('spanish', coalesce(new.address,'')), 'D');
  new.updated_at := now();
  return new;
end
$$ language plpgsql;

drop trigger if exists properties_tsv_update on public.properties;
create trigger properties_tsv_update before insert or update on public.properties
for each row execute procedure public.properties_tsv_trigger();

-- =========================================================
-- LEADS
-- =========================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  inquilino_id uuid references public.profiles(id) on delete set null,
  inquilino_name text,
  inquilino_phone text,
  inquilino_email text,
  status lead_status not null default 'nuevo',
  source lead_source not null default 'directo',
  preferred_visit_at timestamptz,
  notes text,
  agent_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_property_idx on public.leads(property_id);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_inquilino_idx on public.leads(inquilino_id);

-- =========================================================
-- MESSAGES (chat history per lead)
-- =========================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  role message_role not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_lead_idx on public.messages(lead_id);
create index if not exists messages_user_idx on public.messages(user_id);

-- =========================================================
-- FAVORITES
-- =========================================================
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- =========================================================
-- AUTO-PROFILE on signup
-- =========================================================
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'inquilino')
  )
  on conflict (id) do nothing;
  return new;
end
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================================
-- RLS
-- =========================================================
alter table public.profiles  enable row level security;
alter table public.properties enable row level security;
alter table public.leads     enable row level security;
alter table public.messages  enable row level security;
alter table public.favorites enable row level security;

-- profiles: anyone can read public fields; only owner can update
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

-- properties: public read for non-paused/non-alquilado; full access to owner and asesores
drop policy if exists "properties_public_read" on public.properties;
create policy "properties_public_read" on public.properties
for select using (status in ('disponible','reservado') or owner_id = auth.uid());

drop policy if exists "properties_owner_write" on public.properties;
create policy "properties_owner_write" on public.properties
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "properties_asesor_write" on public.properties;
create policy "properties_asesor_write" on public.properties
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('asesor','admin'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('asesor','admin'))
);

-- leads: inquilino sees own; property owner/asesor sees leads on their properties
drop policy if exists "leads_inquilino_read" on public.leads;
create policy "leads_inquilino_read" on public.leads
for select using (
  inquilino_id = auth.uid()
  or exists (
    select 1 from public.properties pr
    where pr.id = leads.property_id and (pr.owner_id = auth.uid() or
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('asesor','admin')))
  )
);

drop policy if exists "leads_anyone_insert" on public.leads;
create policy "leads_anyone_insert" on public.leads
for insert with check (true);

drop policy if exists "leads_owner_update" on public.leads;
create policy "leads_owner_update" on public.leads
for update using (
  inquilino_id = auth.uid()
  or exists (
    select 1 from public.properties pr
    where pr.id = leads.property_id and (pr.owner_id = auth.uid() or
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('asesor','admin')))
  )
);

-- messages: same visibility as parent lead
drop policy if exists "messages_lead_visibility" on public.messages;
create policy "messages_lead_visibility" on public.messages
for select using (
  lead_id is null
  or exists (
    select 1 from public.leads l
    where l.id = messages.lead_id and (
      l.inquilino_id = auth.uid()
      or exists (
        select 1 from public.properties pr
        where pr.id = l.property_id and (pr.owner_id = auth.uid() or
          exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('asesor','admin')))
      )
    )
  )
);

drop policy if exists "messages_insert_any" on public.messages;
create policy "messages_insert_any" on public.messages
for insert with check (true);

-- favorites: own only
drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================
-- STORAGE BUCKETS (Supabase)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('properties', 'properties', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
