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

-- ─── Contact messages ─────────────────────────────────────────────────────────
create policy "contact_messages_admin_select"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_admin());

create policy "contact_messages_admin_update"
  on public.contact_messages
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Analytics ────────────────────────────────────────────────────────────────
create policy "portfolio_events_admin_select"
  on public.portfolio_events
  for select
  to authenticated
  using (public.is_admin());

-- ─── Memory scores (modération) ───────────────────────────────────────────────
create policy "memory_scores_admin_delete"
  on public.memory_scores
  for delete
  to authenticated
  using (public.is_admin());

-- ─── Newsletter (préparation Phase 3) ─────────────────────────────────────────
create policy "newsletter_subscribers_admin_select"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (public.is_admin());

create policy "newsletter_subscribers_admin_delete"
  on public.newsletter_subscribers
  for delete
  to authenticated
  using (public.is_admin());
