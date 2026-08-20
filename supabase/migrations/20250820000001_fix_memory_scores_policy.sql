-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix: remettre la policy SELECT sur memory_scores
-- security_invoker sur les vues a besoin que la table soit lisible
-- Le masquage ip_hash est assure par les vues (pas de ip_hash dans SELECT)
-- ═══════════════════════════════════════════════════════════════════════════════

-- La policy a ete supprimee par erreur dans la migration precedente
-- Les vues memory_scores_public et memory_leaderboard n'exposent pas ip_hash
create policy "memory_scores_public_read"
  on public.memory_scores
  for select
  to anon, authenticated
  using (true);
