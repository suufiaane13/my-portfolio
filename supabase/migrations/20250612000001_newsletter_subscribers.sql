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
