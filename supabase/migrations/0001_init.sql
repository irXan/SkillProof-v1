-- ===========================================================================
-- SkillProof — initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- (pgcrypto is enabled by default on Supabase and provides gen_random_uuid.)
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: one portfolio owner per row. user_id is nullable so that rows can
-- be created for demo/anonymous flows without an authenticated user.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id) on delete set null,
  full_name     text not null default 'Your Name',
  skill         text not null,
  bio           text,
  github_url    text,
  portfolio_url text,
  created_at    timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles (user_id);

-- ---------------------------------------------------------------------------
-- projects: 1..3 projects per profile.
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  tools       text not null,
  description text not null,
  problem     text not null,
  result      text not null,
  link        text,
  created_at  timestamptz not null default now()
);

create index if not exists projects_profile_id_idx on public.projects (profile_id);

-- ---------------------------------------------------------------------------
-- generations: AI outputs. `type` is one of:
--   case_study | bio | profile_summary | proposal | interview_questions
-- ---------------------------------------------------------------------------
create table if not exists public.generations (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  type        text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists generations_profile_id_idx on public.generations (profile_id);
create index if not exists generations_type_idx on public.generations (type);
