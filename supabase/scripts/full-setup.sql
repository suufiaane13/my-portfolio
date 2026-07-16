-- =============================================================================
-- Portfolio Soufiane HAJJI — full Supabase setup
-- Paste into: Supabase Dashboard → SQL Editor → New query → Run
-- Prefer: supabase db push (tracks migration history). This file is for SQL Editor.
-- =============================================================================

-- All DDL/seed are already "si qlq chose existe skip it !" (via IF NOT EXISTS or ON CONFLICT DO NOTHING).
-- Ajout logique "skip if exists" là où c’est possible via du DO ou control de meta-données quand pas natif.


-- ---------------------------------------------------------------------------
-- 20250611000000_contact_messages.sql
-- ---------------------------------------------------------------------------

-- Portfolio contact messages (private — no public RLS policies)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null,
  message text not null check (char_length(message) between 10 and 2000),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  ip_hash text,
  user_agent text,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'spam')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create index if not exists contact_messages_ip_hash_created_at_idx
  on public.contact_messages (ip_hash, created_at desc);

create index if not exists contact_messages_status_created_at_idx
  on public.contact_messages (status, created_at desc);


-- ---------------------------------------------------------------------------
-- 20250612000000_memory_scores_and_events.sql
-- ---------------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════════════════
-- Phase 2 — Jeu mémoire (leaderboard) + Analytics léger
-- Écriture via Edge Functions uniquement (pas de policy INSERT publique)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Leaderboard jeu des paires ───────────────────────────────────────────────
create table if not exists public.memory_scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(trim(player_name)) between 2 and 20),
  grid_size smallint not null check (grid_size in (4, 6)),
  moves int not null check (moves > 0),
  seconds int not null check (seconds >= 0),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table public.memory_scores enable row level security;

-- Lecture publique du classement (affichage frontend)
do $body$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'memory_scores' and policyname = 'memory_scores_public_read'
  ) then
    execute '
      create policy "memory_scores_public_read"
        on public.memory_scores
        for select
        to anon, authenticated
        using (true)
    ';
  end if;
end
$body$;

create index if not exists memory_scores_leaderboard_idx
  on public.memory_scores (grid_size, moves asc, seconds asc, created_at desc);

create index if not exists memory_scores_created_at_idx
  on public.memory_scores (created_at desc);

-- Vue top 10 par taille de grille (meilleur = moins de coups, puis moins de temps)
create or replace view public.memory_leaderboard
with (security_invoker = true)
as
select
  id,
  player_name,
  grid_size,
  moves,
  seconds,
  locale,
  created_at,
  rank() over (
    partition by grid_size
    order by moves asc, seconds asc, created_at asc
  ) as rank
from public.memory_scores;

grant select on public.memory_leaderboard to anon, authenticated;

-- ─── Analytics portfolio (privé — dashboard Supabase uniquement) ──────────────
create table if not exists public.portfolio_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in (
      'page_view',
      'section_view',
      'project_click',
      'cv_download',
      'contact_submit',
      'game_win',
      'game_score_submit',
      'lang_switch',
      'theme_switch'
    )
  ),
  path text,
  section_id text,
  project_id text,
  locale text check (locale is null or locale in ('fr', 'en')),
  metadata jsonb not null default '{}'::jsonb,
  session_hash text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.portfolio_events enable row level security;

-- Pas de policy publique → seul service_role (Edge Functions) peut écrire/lire

create index if not exists portfolio_events_type_created_at_idx
  on public.portfolio_events (event_type, created_at desc);

create index if not exists portfolio_events_path_created_at_idx
  on public.portfolio_events (path, created_at desc)
  where path is not null;

create index if not exists portfolio_events_session_created_at_idx
  on public.portfolio_events (session_hash, created_at desc)
  where session_hash is not null;

-- ─── Enrichissement contact_messages (suivi admin) ────────────────────────────

do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema='public' and table_name='contact_messages' and column_name='read_at'
  ) then
    alter table public.contact_messages add column read_at timestamptz;
  end if;
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema='public' and table_name='contact_messages' and column_name='replied_at'
  ) then
    alter table public.contact_messages add column replied_at timestamptz;
  end if;
end
$$;


-- ---------------------------------------------------------------------------
-- 20250612000001_newsletter_subscribers.sql
-- ---------------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════════════════
-- Phase 3 (optionnel) — Newsletter / veille contact
-- Désactivé par défaut côté frontend — prêt pour une future section footer
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  source text not null default 'portfolio' check (source in ('portfolio', 'contact', 'game')),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  ip_hash text,
  constraint newsletter_subscribers_email_unique unique (email)
);

alter table public.newsletter_subscribers enable row level security;

-- Aucune policy publique — inscription via Edge Function uniquement

create index if not exists newsletter_subscribers_active_idx
  on public.newsletter_subscribers (subscribed_at desc)
  where unsubscribed_at is null;


-- ---------------------------------------------------------------------------
-- 20250612000002_portfolio_content.sql
-- ---------------------------------------------------------------------------

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

do $$
declare
  policy_exists boolean;
begin
  select exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'projects' and policyname = 'projects_public_read'
  ) into policy_exists;
  if not policy_exists then
    execute $$create policy "projects_public_read"
      on public.projects for select to anon, authenticated
      using (published = true)$$;
  end if;

  select exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'project_translations' and policyname = 'project_translations_public_read'
  ) into policy_exists;
  if not policy_exists then
    execute $$create policy "project_translations_public_read"
      on public.project_translations for select to anon, authenticated
      using (
        exists (
          select 1 from public.projects p
          where p.slug = project_slug and p.published = true
        )
      )$$;
  end if;

  select exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'skill_categories' and policyname = 'skill_categories_public_read'
  ) into policy_exists;
  if not policy_exists then
    execute $$create policy "skill_categories_public_read"
      on public.skill_categories for select to anon, authenticated
      using (published = true)$$;
  end if;

  select exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'skill_category_translations' and policyname = 'skill_category_translations_public_read'
  ) into policy_exists;
  if not policy_exists then
    execute $$create policy "skill_category_translations_public_read"
      on public.skill_category_translations for select to anon, authenticated
      using (
        exists (
          select 1 from public.skill_categories c
          where c.slug = category_slug and c.published = true
        )
      )$$;
  end if;

  select exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'skills' and policyname = 'skills_public_read'
  ) into policy_exists;
  if not policy_exists then
    execute $$create policy "skills_public_read"
      on public.skills for select to anon, authenticated
      using (
        published = true
        and exists (
          select 1 from public.skill_categories c
          where c.slug = category_slug and c.published = true
        )
      )$$;
  end if;

  select exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'experiences' and policyname = 'experiences_public_read'
  ) into policy_exists;
  if not policy_exists then
    execute $$create policy "experiences_public_read"
      on public.experiences for select to anon, authenticated
      using (published = true)$$;
  end if;

  select exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'experience_translations' and policyname = 'experience_translations_public_read'
  ) into policy_exists;
  if not policy_exists then
    execute $$create policy "experience_translations_public_read"
      on public.experience_translations for select to anon, authenticated
      using (
        exists (
          select 1 from public.experiences e
          where e.slug = experience_slug and e.published = true
        )
      )$$;
  end if;

  select exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'education_entries' and policyname = 'education_entries_public_read'
  ) into policy_exists;
  if not policy_exists then
    execute $$create policy "education_entries_public_read"
      on public.education_entries for select to anon, authenticated
      using (published = true)$$;
  end if;

  select exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'education_translations' and policyname = 'education_translations_public_read'
  ) into policy_exists;
  if not policy_exists then
    execute $$create policy "education_translations_public_read"
      on public.education_translations for select to anon, authenticated
      using (
        exists (
          select 1 from public.education_entries ed
          where ed.slug = education_slug and ed.published = true
        )
      )$$;
  end if;
end
$$;


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


-- ---------------------------------------------------------------------------
-- 20250612000003_portfolio_content_seed.sql
-- ---------------------------------------------------------------------------

-- Seed initial — données actuelles du portfolio (src/data + i18n)

-- Tous les "insert into ... on conflict do nothing" déjà skip si existe.

insert into public.projects (slug, tags, image_url, github_url, demo_url, featured, year, sort_order) values
  ('myfood',           array['Kotlin','Jetpack Compose','Supabase','Android'],           '/projects/myfood.png',         'https://github.com/suufiaane13/MyFood',           null,                                      true,  2026, 1),
  ('pure-power-menu',  array['TypeScript','React','Tailwind CSS v4','Vite'],             '/projects/pure-power.png',     'https://github.com/suufiaane13/pure-power-menu',  'https://pure-power-menu.netlify.app/',    true,  2026, 2),
  ('world-explorer',   array['JavaScript','React','Tailwind CSS','API'],                 '/projects/world-explorer.png', 'https://github.com/suufiaane13/Wold-Explorer',    'https://world-explorer0.netlify.app/',    false, 2025, 3),
  ('sultan-kunafa',    array['TypeScript','React','Tailwind CSS','Vite'],               '/projects/sultan-kunafa.png',  'https://github.com/suufiaane13/sultan_kunafa',    'https://sweets-48.netlify.app/',          false, 2026, 4)
on conflict (slug) do nothing;

insert into public.project_translations (project_slug, locale, title, description, long_description) values
  ('myfood', 'fr', 'MyFood',
   'App Android de commande de plats : menu, panier, livraison et espace restaurateur.',
   'Application mobile Kotlin + Jetpack Compose avec backend Supabase (Auth, PostgreSQL, Storage). Parcours complet client et espace de gestion pour restaurateurs.'),
  ('myfood', 'en', 'MyFood',
   'Android food ordering app: menu, cart, delivery, and restaurant management space.',
   'Kotlin + Jetpack Compose mobile app with Supabase backend (Auth, PostgreSQL, Storage). Full customer journey and management space for restaurant owners.'),
  ('pure-power-menu', 'fr', 'Pure Power Menu',
   'Menu digital mobile-first pour snack fitness à Oujda — macros, QR code table, React + Tailwind v4.',
   'Carte digitale interactive pour Pure Power avec fiches produits Mass Gainer & Shred, macros nutritionnels, QR code par table et design mobile-first.'),
  ('pure-power-menu', 'en', 'Pure Power Menu',
   'Mobile-first digital menu for a fitness snack bar in Oujda — macros, table QR codes, React + Tailwind v4.',
   'Interactive digital menu for Pure Power with Mass Gainer & Shred product pages, nutritional macros, per-table QR codes, and mobile-first design.'),
  ('world-explorer', 'fr', 'World Explorer',
   'Explorez 195+ pays, leurs cultures, capitales et populations. Infos temps réel et anecdotes IA.',
   'Application web interactive pour découvrir le monde : données en temps réel, favoris, anecdotes générées par IA et design moderne. Gratuit et interactif.'),
  ('world-explorer', 'en', 'World Explorer',
   'Explore 195+ countries, their cultures, capitals, and populations. Real-time info and AI anecdotes.',
   'Interactive web app to discover the world: real-time data, favorites, AI-generated anecdotes, and modern design. Free and interactive.'),
  ('sultan-kunafa', 'fr', 'Sultan Kunafa',
   'Site vitrine premium pour marque de desserts orientaux — commande rapide via WhatsApp.',
   'Landing page haut de gamme mettant en valeur l''expérience visuelle autour de la kunafa. Frontend optimisé pour la conversion et la commande via WhatsApp.'),
  ('sultan-kunafa', 'en', 'Sultan Kunafa',
   'Premium showcase site for an oriental desserts brand — quick ordering via WhatsApp.',
   'High-end landing page highlighting the visual experience around kunafa. Frontend optimized for conversion and WhatsApp ordering.')
on conflict (project_slug, locale) do nothing;

insert into public.skill_categories (slug, sort_order) values
  ('frontend', 1),
  ('backend',  2),
  ('mobile',   3),
  ('data',     4),
  ('design',   5)
on conflict (slug) do nothing;

insert into public.skill_category_translations (category_slug, locale, title, description) values
  ('frontend', 'fr', 'Front-end',  'Interfaces modernes, performantes et accessibles.'),
  ('frontend', 'en', 'Front-end',  'Modern, performant, and accessible interfaces.'),
  ('backend',  'fr', 'Back-end',   'APIs REST, logique métier et architectures maintenables.'),
  ('backend',  'en', 'Back-end',   'REST APIs, business logic, and maintainable architectures.'),
  ('mobile',   'fr', 'Mobile & Desktop', 'Applications natives et cross-platform.'),
  ('mobile',   'en', 'Mobile & Desktop', 'Native and cross-platform applications.'),
  ('data',     'fr', 'Data & DevOps', 'Bases de données, déploiement et workflows de production.'),
  ('data',     'en', 'Data & DevOps', 'Databases, deployment, and production workflows.'),
  ('design',   'fr', 'Design',     'UI/UX, prototypage et design systems.'),
  ('design',   'en', 'Design',     'UI/UX, prototyping, and design systems.')
on conflict (category_slug, locale) do nothing;

insert into public.skills (category_slug, name, sort_order, is_core) values
  ('frontend', 'HTML5',         1, false),
  ('frontend', 'CSS3',          2, false),
  ('frontend', 'JavaScript',    3, false),
  ('frontend', 'TypeScript',    4, true),
  ('frontend', 'React',         5, true),
  ('frontend', 'Vite',          6, false),
  ('frontend', 'Tailwind CSS',  7, false),
  ('frontend', 'Bootstrap',     8, false),
  ('backend',  'PHP',           1, false),
  ('backend',  'Python',        2, false),
  ('backend',  'Laravel',       3, true),
  ('backend',  'FastAPI',       4, false),
  ('backend',  'Node.js',       5, false),
  ('backend',  'Express.js',    6, false),
  ('backend',  'API REST',      7, false),
  ('mobile',   'Kotlin',        1, true),
  ('mobile',   'Jetpack Compose', 2, false),
  ('mobile',   'React Native',  3, false),
  ('mobile',   'Rust',          4, false),
  ('mobile',   'Tauri',         5, false),
  ('data',     'MySQL',         1, false),
  ('data',     'MongoDB',       2, false),
  ('data',     'Oracle',        3, false),
  ('data',     'Supabase',      4, true),
  ('data',     'Docker',        5, true),
  ('data',     'Git/GitHub',    6, false),
  ('design',   'Figma',         1, false),
  ('design',   'Canva',         2, false),
  ('design',   'UI/UX',         3, false),
  ('design',   'Responsive',    4, false),
  ('design',   'PWA',           5, false)
on conflict (category_slug, name) do nothing;

insert into public.experiences (slug, sort_order, technologies, is_current, project_slug) values
  ('freelance',  1, array['React','TypeScript','Laravel','Supabase','Kotlin','Docker'], true,  null),
  ('pure-power', 2, array['React','TypeScript','Tailwind CSS v4','Vite'],              false, 'pure-power-menu'),
  ('cmfp',       3, array['PHP','Laravel','Blade','MySQL','Git'],                      false, null)
on conflict (slug) do nothing;

insert into public.experience_translations (experience_slug, locale, period, role, company, description) values
  ('freelance', 'fr', '2024 — Présent', 'Développeur Full-Stack Freelance', 'Maroc · Remote',
   '33+ repos publics sur GitHub. Dashboards, apps mobile (Kotlin/Compose), menus digitaux, gestion médicale (Oracle/FastAPI) et sites vitrine pour clients locaux.'),
  ('freelance', 'en', '2024 — Present', 'Freelance Full-Stack Developer', 'Morocco · Remote',
   '33+ public repos on GitHub. Dashboards, mobile apps (Kotlin/Compose), digital menus, medical management (Oracle/FastAPI), and showcase sites for local clients.'),
  ('pure-power', 'fr', '2026', 'Développeur Frontend', 'Pure Power — Snack fitness, Oujda',
   'Création du menu digital mobile-first : carte interactive, fiches macros, QR code par table et déploiement en production.'),
  ('pure-power', 'en', '2026', 'Frontend Developer', 'Pure Power — Fitness snack, Oujda',
   'Built a mobile-first digital menu: interactive menu, macro cards, per-table QR codes, and production deployment.'),
  ('cmfp', 'fr', '2023 — 2025', 'Technicien Spécialisé — Développement Digital', 'Centre Mixte de Formation Professionnelle, Oujda',
   'Projets académiques Laravel/Blade : bibliothèque, inventaire IT, e-learning, gestion commerciale. Bases solides PHP, MySQL et méthode Agile.'),
  ('cmfp', 'en', '2023 — 2025', 'Specialized Technician — Digital Development', 'Professional Training Center, Oujda',
   'Academic Laravel/Blade projects: library, IT inventory, e-learning, business management. Strong foundations in PHP, MySQL, and Agile methodology.')
on conflict (experience_slug, locale) do nothing;

insert into public.education_entries (slug, sort_order, is_completed) values
  ('tsdd', 1, false),
  ('bac',  2, true)
on conflict (slug) do nothing;

insert into public.education_translations (education_slug, locale, period_label, title, description, institution) values
  ('tsdd', 'fr', '2023–2025', 'Technicien Spécialisé en Développement Digital',
   'Formation en développement web et mobile', 'Centre Mixte de Formation Professionnelle, Oujda'),
  ('tsdd', 'en', '2023–2025', 'Specialized Technician in Digital Development',
   'Training in web and mobile development', 'Professional Training Center, Oujda'),
  ('bac', 'fr', '2022–2023', 'Baccalauréat Sciences Physiques — Option Français',
   'Diplôme du baccalauréat avec spécialisation en sciences physiques', 'Lycée Ennahda, Ahfir'),
  ('bac', 'en', '2022–2023', 'High School Diploma in Physical Sciences — French Option',
   'Baccalaureate with specialization in physical sciences', 'Ennahda High School, Ahfir')
on conflict (education_slug, locale) do nothing;


-- ---------------------------------------------------------------------------
-- 20250612000004_profile_interests_social.sql
-- ---------------------------------------------------------------------------

-- Profil, expertise, intérêts, réseaux sociaux, langues parlées

create table if not exists public.site_profile (
  id text primary key default 'main',
  name text not null,
  avatar_url text not null,
  logo_url text not null,
  cv_url text not null,
  cv_filename text not null,
  github_url text not null,
  github_handle text not null,
  public_repos int not null default 0,
  member_since smallint not null,
  email text,
  whatsapp text,
  whatsapp_href text,
  address text,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_profile_translations (
  profile_id text not null references public.site_profile (id) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  title text not null,
  tagline text not null,
  availability text not null,
  bio_paragraph_1 text not null,
  bio_paragraph_2 text not null,
  primary key (profile_id, locale)
);

create table if not exists public.expertise_items (
  slug text primary key,
  icon_key text not null check (icon_key in ('code', 'database', 'smartphone', 'globe')),
  sort_order smallint not null default 0,
  published boolean not null default true
);

create table if not exists public.expertise_translations (
  expertise_slug text not null references public.expertise_items (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  title text not null,
  description text not null,
  primary key (expertise_slug, locale)
);

create table if not exists public.interests (
  slug text primary key,
  icon_key text not null check (icon_key in ('waves', 'crown', 'plane')),
  sort_order smallint not null default 0,
  published boolean not null default true
);

create table if not exists public.interest_translations (
  interest_slug text not null references public.interests (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  label text not null,
  primary key (interest_slug, locale)
);

create table if not exists public.social_links (
  slug text primary key,
  label text not null,
  href text not null,
  handle text not null,
  icon_key text not null check (icon_key in ('instagram', 'github', 'whatsapp')),
  sort_order smallint not null default 0,
  published boolean not null default true
);

create table if not exists public.spoken_languages (
  slug text primary key,
  flag_emoji text not null,
  sort_order smallint not null default 0,
  published boolean not null default true
);

create table if not exists public.spoken_language_translations (
  language_slug text not null references public.spoken_languages (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  name text not null,
  level text not null,
  primary key (language_slug, locale)
);

alter table public.site_profile enable row level security;
alter table public.site_profile_translations enable row level security;
alter table public.expertise_items enable row level security;
alter table public.expertise_translations enable row level security;
alter table public.interests enable row level security;
alter table public.interest_translations enable row level security;
alter table public.social_links enable row level security;
alter table public.spoken_languages enable row level security;
alter table public.spoken_language_translations enable row level security;

do $$
declare
  pol_exists boolean;
begin
  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'site_profile' and policyname = 'site_profile_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "site_profile_public_read"
        on public.site_profile for select to anon, authenticated using (published = true)
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'site_profile_translations' and policyname = 'site_profile_translations_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "site_profile_translations_public_read"
        on public.site_profile_translations for select to anon, authenticated
        using (exists (select 1 from public.site_profile p where p.id = profile_id and p.published = true))
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'expertise_items' and policyname = 'expertise_items_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "expertise_items_public_read"
        on public.expertise_items for select to anon, authenticated using (published = true)
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'expertise_translations' and policyname = 'expertise_translations_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "expertise_translations_public_read"
        on public.expertise_translations for select to anon, authenticated
        using (exists (select 1 from public.expertise_items e where e.slug = expertise_slug and e.published = true))
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'interests' and policyname = 'interests_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "interests_public_read"
        on public.interests for select to anon, authenticated using (published = true)
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'interest_translations' and policyname = 'interest_translations_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "interest_translations_public_read"
        on public.interest_translations for select to anon, authenticated
        using (exists (select 1 from public.interests i where i.slug = interest_slug and i.published = true))
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'social_links' and policyname = 'social_links_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "social_links_public_read"
        on public.social_links for select to anon, authenticated using (published = true)
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'spoken_languages' and policyname = 'spoken_languages_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "spoken_languages_public_read"
        on public.spoken_languages for select to anon, authenticated using (published = true)
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'spoken_language_translations' and policyname = 'spoken_language_translations_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "spoken_language_translations_public_read"
        on public.spoken_language_translations for select to anon, authenticated
        using (exists (select 1 from public.spoken_languages l where l.slug = language_slug and l.published = true))
    $$;
  end if;
end
$$;

create or replace view public.v_profile_i18n
with (security_invoker = true)
as
select
  p.id,
  p.name,
  p.avatar_url,
  p.logo_url,
  p.cv_url,
  p.cv_filename,
  p.github_url,
  p.github_handle,
  p.public_repos,
  p.member_since,
  p.email,
  p.whatsapp,
  p.whatsapp_href,
  p.address,
  t.locale,
  t.title,
  t.tagline,
  t.availability,
  t.bio_paragraph_1,
  t.bio_paragraph_2
from public.site_profile p
join public.site_profile_translations t on t.profile_id = p.id
where p.published = true;

create or replace view public.v_expertise_i18n
with (security_invoker = true)
as
select e.slug, e.icon_key, e.sort_order, t.locale, t.title, t.description
from public.expertise_items e
join public.expertise_translations t on t.expertise_slug = e.slug
where e.published = true;

create or replace view public.v_interests_i18n
with (security_invoker = true)
as
select i.slug, i.icon_key, i.sort_order, t.locale, t.label
from public.interests i
join public.interest_translations t on t.interest_slug = i.slug
where i.published = true;

grant select on public.v_profile_i18n to anon, authenticated;
grant select on public.v_expertise_i18n to anon, authenticated;
grant select on public.v_interests_i18n to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 20250612000005_profile_interests_seed.sql
-- ---------------------------------------------------------------------------

-- Seed profil, expertise, intérêts, social, langues (source: supabase/seed/portfolio-snapshot.json)

insert into public.site_profile (
  id, name, avatar_url, logo_url, cv_url, cv_filename,
  github_url, github_handle, public_repos, member_since,
  email, whatsapp, whatsapp_href, address
) values (
  'main', 'Soufiane HAJJI', '/hajji.png', '/logo.png', '/CV_Soufiane.pdf', 'CV_Soufiane_HAJJI.pdf',
  'https://github.com/suufiaane13', '@suufiaane13', 33, 2022,
  'hjisfn@gmail.com', '+212 602 353 136', 'https://wa.me/212602353136',
  'Hay Saada Rue Khaibar N°07, Ahfir'
) on conflict (id) do update set
  name = excluded.name,
  avatar_url = excluded.avatar_url,
  logo_url = excluded.logo_url,
  cv_url = excluded.cv_url,
  github_url = excluded.github_url,
  public_repos = excluded.public_repos,
  email = excluded.email,
  whatsapp = excluded.whatsapp,
  updated_at = now();

insert into public.site_profile_translations (profile_id, locale, title, tagline, availability, bio_paragraph_1, bio_paragraph_2) values
  ('main', 'fr', 'Développeur Full-Stack & UI/UX Designer',
   'React, Laravel, Rust & Tauri — je construis des apps web, mobiles et outils pour startups et clients freelance.',
   'Disponible pour freelance — hireable',
   'Développeur full-stack basé au Maroc, spécialisé en React, TypeScript, Laravel et applications mobile-first. Plus de 30 projets open source sur GitHub, du site vitrine à la gestion métier.',
   'Mon approche combine design soigné, code maintenable et livraison rapide — dashboards, e-commerce, apps Android et outils métier offline.'),
  ('main', 'en', 'Full-Stack Developer & UI/UX Designer',
   'React, Laravel, Rust & Tauri — I build web apps, mobile apps, and tools for startups and freelance clients.',
   'Available for freelance — hireable',
   'Full-stack developer based in Morocco, specializing in React, TypeScript, Laravel, and mobile-first applications. 30+ open-source projects on GitHub, from landing pages to business management tools.',
   'My approach combines polished design, maintainable code, and fast delivery — dashboards, e-commerce, Android apps, and offline business tools.')
on conflict (profile_id, locale) do nothing;

insert into public.expertise_items (slug, icon_key, sort_order) values
  ('frontend', 'code', 1),
  ('backend', 'database', 2),
  ('mobile', 'smartphone', 3),
  ('systems', 'globe', 4)
on conflict (slug) do nothing;

insert into public.expertise_translations (expertise_slug, locale, title, description) values
  ('frontend', 'fr', 'Frontend', 'React, Vite, Tailwind CSS v4, TypeScript'),
  ('frontend', 'en', 'Frontend', 'React, Vite, Tailwind CSS v4, TypeScript'),
  ('backend', 'fr', 'Backend', 'Laravel, PHP, Python, FastAPI, Supabase'),
  ('backend', 'en', 'Backend', 'Laravel, PHP, Python, FastAPI, Supabase'),
  ('mobile', 'fr', 'Mobile', 'Kotlin, Jetpack Compose, React Native'),
  ('mobile', 'en', 'Mobile', 'Kotlin, Jetpack Compose, React Native'),
  ('systems', 'fr', 'Systèmes', 'Rust, Tauri, Docker, Oracle DB'),
  ('systems', 'en', 'Systems', 'Rust, Tauri, Docker, Oracle DB')
on conflict (expertise_slug, locale) do nothing;

insert into public.interests (slug, icon_key, sort_order) values
  ('swimming', 'waves', 1),
  ('chess', 'crown', 2),
  ('travel', 'plane', 3)
on conflict (slug) do nothing;

insert into public.interest_translations (interest_slug, locale, label) values
  ('swimming', 'fr', 'Natation'),
  ('swimming', 'en', 'Swimming'),
  ('chess', 'fr', 'Jeu d''échecs'),
  ('chess', 'en', 'Chess'),
  ('travel', 'fr', 'Voyages'),
  ('travel', 'en', 'Travel')
on conflict (interest_slug, locale) do nothing;

insert into public.social_links (slug, label, href, handle, icon_key, sort_order) values
  ('instagram', 'Instagram', 'https://instagram.com/suuf.iaane', '@suuf.iaane', 'instagram', 1),
  ('github', 'GitHub', 'https://github.com/suufiaane13', '@suufiaane13', 'github', 2),
  ('whatsapp', 'WhatsApp', 'https://wa.me/212602353136', '+212 602 353 136', 'whatsapp', 3)
on conflict (slug) do nothing;

insert into public.spoken_languages (slug, flag_emoji, sort_order) values
  ('ar', '🇲🇦', 1),
  ('fr', '🇫🇷', 2),
  ('en', '🇬🇧', 3)
on conflict (slug) do nothing;

insert into public.spoken_language_translations (language_slug, locale, name, level) values
  ('ar', 'fr', 'Arabe', 'Langue maternelle'),
  ('ar', 'en', 'Arabic', 'Native language'),
  ('fr', 'fr', 'Français', 'Courant'),
  ('fr', 'en', 'French', 'Fluent'),
  ('en', 'fr', 'Anglais', 'Courant'),
  ('en', 'en', 'English', 'Fluent')
on conflict (language_slug, locale) do nothing;


-- ---------------------------------------------------------------------------
-- 20250613000000_admin_auth_policies.sql
-- ---------------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════════════════
-- Phase Admin — Policies RLS pour utilisateur authentifié avec rôle admin
-- Configurer app_metadata: { "role": "admin" } sur le user Supabase Auth
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

do $$
declare
  pol_exists boolean;
begin
  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'contact_messages' and policyname = 'contact_messages_admin_select') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "contact_messages_admin_select"
        on public.contact_messages
        for select
        to authenticated
        using (public.is_admin())
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'contact_messages' and policyname = 'contact_messages_admin_update') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "contact_messages_admin_update"
        on public.contact_messages
        for update
        to authenticated
        using (public.is_admin())
        with check (public.is_admin())
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'portfolio_events' and policyname = 'portfolio_events_admin_select') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "portfolio_events_admin_select"
        on public.portfolio_events
        for select
        to authenticated
        using (public.is_admin())
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'memory_scores' and policyname = 'memory_scores_admin_delete') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "memory_scores_admin_delete"
        on public.memory_scores
        for delete
        to authenticated
        using (public.is_admin())
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'newsletter_subscribers' and policyname = 'newsletter_subscribers_admin_select') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "newsletter_subscribers_admin_select"
        on public.newsletter_subscribers
        for select
        to authenticated
        using (public.is_admin())
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'newsletter_subscribers' and policyname = 'newsletter_subscribers_admin_delete') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "newsletter_subscribers_admin_delete"
        on public.newsletter_subscribers
        for delete
        to authenticated
        using (public.is_admin())
    $$;
  end if;

end
$$;


-- ---------------------------------------------------------------------------
-- 20250613100000_admin_cms_policies.sql
-- ---------------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════════════════
-- Admin CMS — accès complet aux tables de contenu (y compris brouillons)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Pour chaque table/policy admin_all : “si qlq chose existe skip”

do $$
declare
  rec record;
  _tables text[] := array[
    'projects', 'project_translations',
    'skill_categories', 'skill_category_translations', 'skills',
    'experiences', 'experience_translations',
    'education_entries', 'education_translations',
    'site_profile', 'site_profile_translations',
    'expertise_items', 'expertise_translations',
    'interests', 'interest_translations',
    'social_links', 'spoken_languages', 'spoken_language_translations'
  ];
  _name text;
begin
  foreach _name in array _tables
  loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = _name and policyname = _name || '_admin_all') then
      execute format('create policy "%s_admin_all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', _name, _name);
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 20250614000000_portfolio_storage.sql
-- ---------------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════════════════
-- Supabase Storage — avatar & CV du portfolio (lecture publique, écriture admin)
-- ═══════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
declare
  pol_exists boolean;
begin
  select exists(select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'portfolio_storage_public_read') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "portfolio_storage_public_read"
        on storage.objects
        for select
        to public
        using (bucket_id = 'portfolio')
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'portfolio_storage_admin_insert') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "portfolio_storage_admin_insert"
        on storage.objects
        for insert
        to authenticated
        with check (bucket_id = 'portfolio' and public.is_admin())
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'portfolio_storage_admin_update') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "portfolio_storage_admin_update"
        on storage.objects
        for update
        to authenticated
        using (bucket_id = 'portfolio' and public.is_admin())
        with check (bucket_id = 'portfolio' and public.is_admin())
    $$;
  end if;

  select exists(select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'portfolio_storage_admin_delete') into pol_exists;
  if not pol_exists then
    execute $$
      create policy "portfolio_storage_admin_delete"
        on storage.objects
        for delete
        to authenticated
        using (bucket_id = 'portfolio' and public.is_admin())
    $$;
  end if;
end
$$;


-- ---------------------------------------------------------------------------
-- 20250615000000_contact_messages_admin_delete.sql
-- ---------------------------------------------------------------------------

-- Admin — suppression des messages de contact

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'contact_messages' and policyname = 'contact_messages_admin_delete'
  ) then
    execute $$
      create policy "contact_messages_admin_delete"
        on public.contact_messages
        for delete
        to authenticated
        using (public.is_admin())
    $$;
  end if;
end
$$;


-- ---------------------------------------------------------------------------
-- Patch: allow guide_topic analytics events
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'portfolio_events'
  ) then
    alter table public.portfolio_events drop constraint if exists portfolio_events_event_type_check;
    alter table public.portfolio_events add constraint portfolio_events_event_type_check
      check (
        event_type in (
          'page_view',
          'section_view',
          'project_click',
          'cv_download',
          'contact_submit',
          'game_win',
          'game_score_submit',
          'lang_switch',
          'theme_switch',
          'guide_topic'
        )
      );
  end if;
end
$$;

-- Next (optional): run set-admin-role.sql after creating your Auth user
