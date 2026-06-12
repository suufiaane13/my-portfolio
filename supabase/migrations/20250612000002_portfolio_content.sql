-- ═══════════════════════════════════════════════════════════════════════════════
-- Contenu portfolio — Compétences, Expériences, Formations, Réalisations
-- i18n FR/EN · Lecture publique · Édition via dashboard Supabase (service_role)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Projets (réalisations) — créé en premier (FK expérience) ─────────────────
create table if not exists public.projects (
  slug text primary key,
  tags text[] not null default '{}',
  image_url text not null,
  github_url text,
  demo_url text,
  featured boolean not null default false,
  year smallint not null check (year between 2015 and 2100),
  sort_order smallint not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_translations (
  project_slug text not null references public.projects (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 1 and 500),
  long_description text not null check (char_length(long_description) between 1 and 3000),
  primary key (project_slug, locale)
);

-- ─── Compétences ──────────────────────────────────────────────────────────────
create table if not exists public.skill_categories (
  slug text primary key,
  sort_order smallint not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_category_translations (
  category_slug text not null references public.skill_categories (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  title text not null check (char_length(title) between 1 and 80),
  description text not null check (char_length(description) between 1 and 300),
  primary key (category_slug, locale)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null references public.skill_categories (slug) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  sort_order smallint not null default 0,
  is_core boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category_slug, name)
);

-- ─── Expériences ──────────────────────────────────────────────────────────────
create table if not exists public.experiences (
  slug text primary key,
  sort_order smallint not null default 0,
  technologies text[] not null default '{}',
  is_current boolean not null default false,
  project_slug text references public.projects (slug) on delete set null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience_translations (
  experience_slug text not null references public.experiences (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  period text not null check (char_length(period) between 1 and 40),
  role text not null check (char_length(role) between 1 and 120),
  company text not null check (char_length(company) between 1 and 160),
  description text not null check (char_length(description) between 1 and 2000),
  primary key (experience_slug, locale)
);

-- ─── Formations ───────────────────────────────────────────────────────────────
create table if not exists public.education_entries (
  slug text primary key,
  sort_order smallint not null default 0,
  is_completed boolean not null default true,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education_translations (
  education_slug text not null references public.education_entries (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  period_label text not null check (char_length(period_label) between 1 and 40),
  title text not null check (char_length(title) between 1 and 160),
  description text not null check (char_length(description) between 1 and 500),
  institution text not null check (char_length(institution) between 1 and 160),
  primary key (education_slug, locale)
);

-- ─── Index ────────────────────────────────────────────────────────────────────
create index if not exists projects_featured_sort_idx
  on public.projects (featured desc, sort_order asc, year desc);

create index if not exists skills_category_sort_idx
  on public.skills (category_slug, sort_order asc);

create index if not exists skills_core_idx
  on public.skills (is_core)
  where is_core = true;

create index if not exists experiences_sort_idx
  on public.experiences (sort_order asc);

-- ─── RLS — lecture publique du contenu publié ───────────────────────────────
alter table public.projects enable row level security;
alter table public.project_translations enable row level security;
alter table public.skill_categories enable row level security;
alter table public.skill_category_translations enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.experience_translations enable row level security;
alter table public.education_entries enable row level security;
alter table public.education_translations enable row level security;

create policy "projects_public_read"
  on public.projects for select to anon, authenticated
  using (published = true);

create policy "project_translations_public_read"
  on public.project_translations for select to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.slug = project_slug and p.published = true
    )
  );

create policy "skill_categories_public_read"
  on public.skill_categories for select to anon, authenticated
  using (published = true);

create policy "skill_category_translations_public_read"
  on public.skill_category_translations for select to anon, authenticated
  using (
    exists (
      select 1 from public.skill_categories c
      where c.slug = category_slug and c.published = true
    )
  );

create policy "skills_public_read"
  on public.skills for select to anon, authenticated
  using (
    published = true
    and exists (
      select 1 from public.skill_categories c
      where c.slug = category_slug and c.published = true
    )
  );

create policy "experiences_public_read"
  on public.experiences for select to anon, authenticated
  using (published = true);

create policy "experience_translations_public_read"
  on public.experience_translations for select to anon, authenticated
  using (
    exists (
      select 1 from public.experiences e
      where e.slug = experience_slug and e.published = true
    )
  );

create policy "education_entries_public_read"
  on public.education_entries for select to anon, authenticated
  using (published = true);

create policy "education_translations_public_read"
  on public.education_translations for select to anon, authenticated
  using (
    exists (
      select 1 from public.education_entries ed
      where ed.slug = education_slug and ed.published = true
    )
  );

-- ─── Vues pratiques (frontend / dashboard) ────────────────────────────────────
create or replace view public.v_projects_i18n
with (security_invoker = true)
as
select
  p.slug,
  p.tags,
  p.image_url,
  p.github_url,
  p.demo_url,
  p.featured,
  p.year,
  p.sort_order,
  t.locale,
  t.title,
  t.description,
  t.long_description
from public.projects p
join public.project_translations t on t.project_slug = p.slug
where p.published = true;

create or replace view public.v_skills_i18n
with (security_invoker = true)
as
select
  c.slug as category_slug,
  c.sort_order as category_sort_order,
  ct.locale,
  ct.title as category_title,
  ct.description as category_description,
  s.id as skill_id,
  s.name as skill_name,
  s.sort_order as skill_sort_order,
  s.is_core
from public.skill_categories c
join public.skill_category_translations ct on ct.category_slug = c.slug
join public.skills s on s.category_slug = c.slug
where c.published = true and s.published = true;

create or replace view public.v_experiences_i18n
with (security_invoker = true)
as
select
  e.slug,
  e.sort_order,
  e.technologies,
  e.is_current,
  e.project_slug,
  t.locale,
  t.period,
  t.role,
  t.company,
  t.description
from public.experiences e
join public.experience_translations t on t.experience_slug = e.slug
where e.published = true;

create or replace view public.v_education_i18n
with (security_invoker = true)
as
select
  ed.slug,
  ed.sort_order,
  ed.is_completed,
  t.locale,
  t.period_label,
  t.title,
  t.description,
  t.institution
from public.education_entries ed
join public.education_translations t on t.education_slug = ed.slug
where ed.published = true;

grant select on public.v_projects_i18n to anon, authenticated;
grant select on public.v_skills_i18n to anon, authenticated;
grant select on public.v_experiences_i18n to anon, authenticated;
grant select on public.v_education_i18n to anon, authenticated;
