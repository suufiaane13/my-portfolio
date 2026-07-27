-- ═══════════════════════════════════════════════════════════════════════════════
-- Chess games — historique + classement des victoires
-- Écriture via Edge Function submit-chess-game uniquement
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.chess_games (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(trim(player_name)) between 2 and 20),
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'expert')),
  player_color text not null check (player_color in ('w', 'b')),
  result text not null check (result in ('win', 'loss', 'draw')),
  ply_count int not null check (ply_count >= 0),
  opening_name text,
  uci_moves text not null default '',
  seconds int not null check (seconds >= 0),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table public.chess_games enable row level security;

create policy "chess_games_public_read"
  on public.chess_games
  for select
  to anon, authenticated
  using (true);

create policy "chess_games_admin_delete"
  on public.chess_games
  for delete
  to authenticated
  using (public.is_admin());

create index if not exists chess_games_leaderboard_idx
  on public.chess_games (difficulty, result, ply_count asc, seconds asc, created_at desc);

create index if not exists chess_games_created_at_idx
  on public.chess_games (created_at desc);

create index if not exists chess_games_ip_created_at_idx
  on public.chess_games (ip_hash, created_at desc)
  where ip_hash is not null;

-- Victoires uniquement, classement par difficulté (moins de demi-coups, puis temps)
create or replace view public.chess_leaderboard
with (security_invoker = true)
as
select
  id,
  player_name,
  difficulty,
  player_color,
  result,
  ply_count,
  opening_name,
  seconds,
  locale,
  created_at,
  rank() over (
    partition by difficulty
    order by ply_count asc, seconds asc, created_at asc
  ) as rank
from public.chess_games
where result = 'win';

grant select on public.chess_leaderboard to anon, authenticated;
