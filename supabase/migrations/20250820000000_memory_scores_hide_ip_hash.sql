-- ═══════════════════════════════════════════════════════════════════════════════
-- Masquer ip_hash du public — leaderboard reste lisible, hashes IP cachés
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Supprimer la policy trop permissive sur la table brute
drop policy if exists "memory_scores_public_read" on public.memory_scores;

-- 2. Vue publique SANS ip_hash (lecture seule pour anon/authenticated)
create or replace view public.memory_scores_public
with (security_invoker = true)
as
select
  id,
  player_name,
  grid_size,
  moves,
  seconds,
  locale,
  created_at
from public.memory_scores;

grant select on public.memory_scores_public to anon, authenticated;

-- 3. Reconstruire memory_leaderboard sur la vue publique (plus de ip_hash)
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
from public.memory_scores_public;

grant select on public.memory_leaderboard to anon, authenticated;
