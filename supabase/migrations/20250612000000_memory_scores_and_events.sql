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
create policy "memory_scores_public_read"
  on public.memory_scores
  for select
  to anon, authenticated
  using (true);

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
alter table public.contact_messages
  add column if not exists read_at timestamptz,
  add column if not exists replied_at timestamptz;
