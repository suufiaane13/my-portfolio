-- ═══════════════════════════════════════════════════════════════════════════════
-- Chess games — add hints_used, move_notation, and support 'soufiane' difficulty
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Add new columns
alter table public.chess_games
  add column if not exists hints_used int not null default 0 check (hints_used >= 0),
  add column if not exists move_notation text not null default '';

-- 2. Widen difficulty CHECK to include 'soufiane'
alter table public.chess_games drop constraint if exists chess_games_difficulty_check;
alter table public.chess_games add constraint chess_games_difficulty_check
  check (difficulty in ('beginner', 'intermediate', 'expert', 'soufiane'));

-- 3. Index for hints analytics
create index if not exists chess_games_hints_used_idx
  on public.chess_games (hints_used desc)
  where hints_used > 0;
