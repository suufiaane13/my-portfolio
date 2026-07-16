-- ═══════════════════════════════════════════════════════════════════════════════
-- Admin CMS — accès complet aux tables de contenu (y compris brouillons)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Projets
create policy "projects_admin_all" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "project_translations_admin_all" on public.project_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Compétences
create policy "skill_categories_admin_all" on public.skill_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "skill_category_translations_admin_all" on public.skill_category_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "skills_admin_all" on public.skills
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Expériences
create policy "experiences_admin_all" on public.experiences
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "experience_translations_admin_all" on public.experience_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Formations
create policy "education_entries_admin_all" on public.education_entries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "education_translations_admin_all" on public.education_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Profil & extras
create policy "site_profile_admin_all" on public.site_profile
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "site_profile_translations_admin_all" on public.site_profile_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "expertise_items_admin_all" on public.expertise_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "expertise_translations_admin_all" on public.expertise_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "interests_admin_all" on public.interests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "interest_translations_admin_all" on public.interest_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "social_links_admin_all" on public.social_links
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "spoken_languages_admin_all" on public.spoken_languages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "spoken_language_translations_admin_all" on public.spoken_language_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
