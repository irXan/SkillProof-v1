-- ===========================================================================
-- SkillProof — Row Level Security
-- Owners can read/write their own profiles, projects and generations.
-- Rows with user_id = null (demo/anonymous) are readable by anyone but only
-- writable by the service role (which bypasses RLS).
-- ===========================================================================

alter table public.profiles    enable row level security;
alter table public.projects    enable row level security;
alter table public.generations enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = user_id or user_id is null);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- projects ------------------------------------------------------------------
-- Ownership is derived from the parent profile.
drop policy if exists "Projects are viewable by owner" on public.projects;
create policy "Projects are viewable by owner"
  on public.projects for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = projects.profile_id
        and (p.user_id = auth.uid() or p.user_id is null)
    )
  );

drop policy if exists "Users can insert projects for their profile" on public.projects;
create policy "Users can insert projects for their profile"
  on public.projects for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = projects.profile_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update projects for their profile" on public.projects;
create policy "Users can update projects for their profile"
  on public.projects for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = projects.profile_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete projects for their profile" on public.projects;
create policy "Users can delete projects for their profile"
  on public.projects for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = projects.profile_id and p.user_id = auth.uid()
    )
  );

-- generations ---------------------------------------------------------------
drop policy if exists "Generations are viewable by owner" on public.generations;
create policy "Generations are viewable by owner"
  on public.generations for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = generations.profile_id
        and (p.user_id = auth.uid() or p.user_id is null)
    )
  );

drop policy if exists "Users can insert generations for their profile" on public.generations;
create policy "Users can insert generations for their profile"
  on public.generations for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = generations.profile_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete generations for their profile" on public.generations;
create policy "Users can delete generations for their profile"
  on public.generations for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = generations.profile_id and p.user_id = auth.uid()
    )
  );
