-- ===========================================================================
-- SkillProof — editable live portfolios
-- Adds the portfolio-first data model on top of the original
-- profiles/projects/generations tables (0001/0002).
--
--   portfolios          one publishable portfolio site per row
--   portfolio_projects  ordered case-study projects
--   portfolio_sections  toggleable / reorderable page sections
--   generation_jobs     audit log of AI generation runs
--
-- Run this after 0001 and 0002.
-- ===========================================================================

create extension if not exists pgcrypto;

-- Shared updated_at trigger -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- portfolios
--   user_id is nullable so that guest portfolios can be created and published
--   without an account. Guests edit via a secret edit_token (stored only in
--   their browser) and all guest writes go through the service role.
-- ---------------------------------------------------------------------------
create table if not exists public.portfolios (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users (id) on delete set null,
  edit_token        text not null default encode(gen_random_bytes(24), 'hex'),
  slug              text unique not null,
  full_name         text not null default 'Your Name',
  headline          text,
  bio               text,
  profile_image_url text,
  location          text,
  email             text,
  github_url        text,
  linkedin_url      text,
  website_url       text,
  resume_url        text,
  skills            jsonb not null default '[]'::jsonb,
  services          jsonb not null default '[]'::jsonb,
  contact_cta       text,
  theme             text not null default 'aurora',
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists portfolios_user_id_idx on public.portfolios (user_id);
create index if not exists portfolios_slug_idx on public.portfolios (slug);

drop trigger if exists portfolios_set_updated_at on public.portfolios;
create trigger portfolios_set_updated_at
  before update on public.portfolios
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- portfolio_projects
-- ---------------------------------------------------------------------------
create table if not exists public.portfolio_projects (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios (id) on delete cascade,
  title         text not null,
  client_type   text,
  problem       text,
  approach      text,
  outcome       text,
  tools         jsonb not null default '[]'::jsonb,
  project_url   text,
  github_url    text,
  image_url     text,
  display_order integer not null default 0,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists portfolio_projects_portfolio_id_idx
  on public.portfolio_projects (portfolio_id);

drop trigger if exists portfolio_projects_set_updated_at on public.portfolio_projects;
create trigger portfolio_projects_set_updated_at
  before update on public.portfolio_projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- portfolio_sections
-- ---------------------------------------------------------------------------
create table if not exists public.portfolio_sections (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios (id) on delete cascade,
  section_key   text not null,
  title         text,
  content       jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists portfolio_sections_portfolio_id_idx
  on public.portfolio_sections (portfolio_id);

drop trigger if exists portfolio_sections_set_updated_at on public.portfolio_sections;
create trigger portfolio_sections_set_updated_at
  before update on public.portfolio_sections
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- generation_jobs
-- ---------------------------------------------------------------------------
create table if not exists public.generation_jobs (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid references public.portfolios (id) on delete set null,
  input_data    jsonb,
  output_data   jsonb,
  status        text not null default 'pending',
  error_message text,
  created_at    timestamptz not null default now()
);

create index if not exists generation_jobs_portfolio_id_idx
  on public.generation_jobs (portfolio_id);

-- ===========================================================================
-- Row Level Security
--   * Published portfolios (and their children) are world-readable.
--   * Owners can read/write their own rows.
--   * Guest rows (user_id = null) are written only by the service role, which
--     bypasses RLS — no guest policy is exposed to the anon key.
-- ===========================================================================
alter table public.portfolios         enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_sections enable row level security;
alter table public.generation_jobs    enable row level security;

-- portfolios -----------------------------------------------------------------
drop policy if exists "Published or owned portfolios are viewable" on public.portfolios;
create policy "Published or owned portfolios are viewable"
  on public.portfolios for select
  using (is_published = true or auth.uid() = user_id);

drop policy if exists "Users can insert their own portfolio" on public.portfolios;
create policy "Users can insert their own portfolio"
  on public.portfolios for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own portfolio" on public.portfolios;
create policy "Users can update their own portfolio"
  on public.portfolios for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own portfolio" on public.portfolios;
create policy "Users can delete their own portfolio"
  on public.portfolios for delete
  using (auth.uid() = user_id);

-- portfolio_projects ---------------------------------------------------------
drop policy if exists "Projects of published or owned portfolios are viewable"
  on public.portfolio_projects;
create policy "Projects of published or owned portfolios are viewable"
  on public.portfolio_projects for select
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_projects.portfolio_id
        and (p.is_published = true or p.user_id = auth.uid())
    )
  );

drop policy if exists "Users can write projects for their portfolio"
  on public.portfolio_projects;
create policy "Users can write projects for their portfolio"
  on public.portfolio_projects for all
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_projects.portfolio_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_projects.portfolio_id and p.user_id = auth.uid()
    )
  );

-- portfolio_sections ---------------------------------------------------------
drop policy if exists "Sections of published or owned portfolios are viewable"
  on public.portfolio_sections;
create policy "Sections of published or owned portfolios are viewable"
  on public.portfolio_sections for select
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_sections.portfolio_id
        and (p.is_published = true or p.user_id = auth.uid())
    )
  );

drop policy if exists "Users can write sections for their portfolio"
  on public.portfolio_sections;
create policy "Users can write sections for their portfolio"
  on public.portfolio_sections for all
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_sections.portfolio_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_sections.portfolio_id and p.user_id = auth.uid()
    )
  );

-- generation_jobs ------------------------------------------------------------
-- Readable/writable only by the owning portfolio's user (guest writes go
-- through the service role).
drop policy if exists "Users can view their own generation jobs" on public.generation_jobs;
create policy "Users can view their own generation jobs"
  on public.generation_jobs for select
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = generation_jobs.portfolio_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert their own generation jobs" on public.generation_jobs;
create policy "Users can insert their own generation jobs"
  on public.generation_jobs for insert
  with check (
    portfolio_id is null
    or exists (
      select 1 from public.portfolios p
      where p.id = generation_jobs.portfolio_id and p.user_id = auth.uid()
    )
  );
