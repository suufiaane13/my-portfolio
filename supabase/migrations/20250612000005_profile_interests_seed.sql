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
