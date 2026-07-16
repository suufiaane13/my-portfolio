-- Refresh CMS — généré depuis supabase/seed/portfolio-snapshot.json
-- Owner: Soufiane HAJJI · 2026-07-16
-- Idempotent : upsert (ré-exécutable sans doublons)

begin;

-- Retirer l’ancienne expérience académique CMFP (remplacée par le stage FSO)
delete from public.experience_translations where experience_slug = 'cmfp';
delete from public.experiences where slug = 'cmfp';

insert into public.site_profile (
  id, name, avatar_url, logo_url, cv_url, cv_filename,
  github_url, github_handle, public_repos, member_since,
  email, whatsapp, whatsapp_href, address, published
) values (
  'main', 'Soufiane HAJJI', '/hajji.png', '/logo.png',
  '/CV_Soufiane.pdf', 'CV_Soufiane_HAJJI.pdf',
  'https://github.com/suufiaane13', '@suufiaane13', 33, 2022,
  'hji.sfn@gmail.com', '+212 641 454 572', 'https://wa.me/212641454572',
  'Oujda, Maroc', true
) on conflict (id) do update set
  name = excluded.name,
  avatar_url = excluded.avatar_url,
  logo_url = excluded.logo_url,
  cv_url = excluded.cv_url,
  cv_filename = excluded.cv_filename,
  github_url = excluded.github_url,
  github_handle = excluded.github_handle,
  public_repos = excluded.public_repos,
  member_since = excluded.member_since,
  email = excluded.email,
  whatsapp = excluded.whatsapp,
  whatsapp_href = excluded.whatsapp_href,
  address = excluded.address,
  published = true,
  updated_at = now();

insert into public.site_profile_translations
  (profile_id, locale, title, tagline, availability, bio_paragraph_1, bio_paragraph_2)
values (
  'main', 'fr', 'Développeur Full-Stack & UI/UX Designer', 'Étudiant en Licence Professionnelle Informatique à SUP MTI — développement web (HTML, CSS, PHP, JavaScript, React, Laravel) et logiciel (Java, Kotlin).',
  'À la recherche d’un poste — disponible pour missions', 'Développeur Full-Stack et étudiant en Licence Professionnelle Informatique à SUP MTI, je suis à la recherche d’un poste me permettant de mettre en pratique mes compétences en développement web (HTML, CSS, PHP, JavaScript, React, Laravel) et logiciel (Java, Kotlin).', 'Curieux et rigoureux, je souhaite contribuer à des projets concrets au sein d’une équipe dynamique.'
) on conflict (profile_id, locale) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  availability = excluded.availability,
  bio_paragraph_1 = excluded.bio_paragraph_1,
  bio_paragraph_2 = excluded.bio_paragraph_2;

insert into public.site_profile_translations
  (profile_id, locale, title, tagline, availability, bio_paragraph_1, bio_paragraph_2)
values (
  'main', 'en', 'Full-Stack Developer & UI/UX Designer', 'Professional Bachelor’s student in Computer Science at SUP MTI — web (HTML, CSS, PHP, JavaScript, React, Laravel) and software (Java, Kotlin).',
  'Open to opportunities — available for work', 'Full-Stack developer and Professional Bachelor’s student in Computer Science at SUP MTI, I am looking for a role where I can apply my skills in web development (HTML, CSS, PHP, JavaScript, React, Laravel) and software (Java, Kotlin).', 'Curious and rigorous, I want to contribute to real projects within a dynamic team.'
) on conflict (profile_id, locale) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  availability = excluded.availability,
  bio_paragraph_1 = excluded.bio_paragraph_1,
  bio_paragraph_2 = excluded.bio_paragraph_2;

insert into public.expertise_items (slug, icon_key, sort_order, published)
values ('frontend', 'code', 1, true)
on conflict (slug) do update set
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;
insert into public.expertise_translations (expertise_slug, locale, title, description)
values ('frontend', 'fr', 'Frontend', 'HTML, CSS, JavaScript, React, TypeScript')
on conflict (expertise_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.expertise_translations (expertise_slug, locale, title, description)
values ('frontend', 'en', 'Frontend', 'HTML, CSS, JavaScript, React, TypeScript')
on conflict (expertise_slug, locale) do update set
  title = excluded.title, description = excluded.description;

insert into public.expertise_items (slug, icon_key, sort_order, published)
values ('backend', 'database', 2, true)
on conflict (slug) do update set
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;
insert into public.expertise_translations (expertise_slug, locale, title, description)
values ('backend', 'fr', 'Backend', 'PHP, Laravel, Python, FastAPI, Supabase')
on conflict (expertise_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.expertise_translations (expertise_slug, locale, title, description)
values ('backend', 'en', 'Backend', 'PHP, Laravel, Python, FastAPI, Supabase')
on conflict (expertise_slug, locale) do update set
  title = excluded.title, description = excluded.description;

insert into public.expertise_items (slug, icon_key, sort_order, published)
values ('mobile', 'smartphone', 3, true)
on conflict (slug) do update set
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;
insert into public.expertise_translations (expertise_slug, locale, title, description)
values ('mobile', 'fr', 'Mobile', 'Kotlin, Jetpack Compose, Java')
on conflict (expertise_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.expertise_translations (expertise_slug, locale, title, description)
values ('mobile', 'en', 'Mobile', 'Kotlin, Jetpack Compose, Java')
on conflict (expertise_slug, locale) do update set
  title = excluded.title, description = excluded.description;

insert into public.expertise_items (slug, icon_key, sort_order, published)
values ('systems', 'globe', 4, true)
on conflict (slug) do update set
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;
insert into public.expertise_translations (expertise_slug, locale, title, description)
values ('systems', 'fr', 'Systèmes', 'Docker, Git, MySQL, Oracle DB')
on conflict (expertise_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.expertise_translations (expertise_slug, locale, title, description)
values ('systems', 'en', 'Systems', 'Docker, Git, MySQL, Oracle DB')
on conflict (expertise_slug, locale) do update set
  title = excluded.title, description = excluded.description;

insert into public.skill_categories (slug, sort_order, published)
values ('frontend', 1, true)
on conflict (slug) do update set sort_order = excluded.sort_order, published = true;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('frontend', 'fr', 'Front-end', 'Interfaces modernes, performantes et accessibles.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('frontend', 'en', 'Front-end', 'Modern, performant, and accessible interfaces.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('frontend', 'HTML5', 1, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('frontend', 'CSS3', 2, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('frontend', 'JavaScript', 3, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('frontend', 'TypeScript', 4, true, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('frontend', 'React', 5, true, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('frontend', 'Vite', 6, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('frontend', 'Tailwind CSS', 7, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('frontend', 'Bootstrap', 8, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;

insert into public.skill_categories (slug, sort_order, published)
values ('backend', 2, true)
on conflict (slug) do update set sort_order = excluded.sort_order, published = true;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('backend', 'fr', 'Back-end', 'APIs REST, logique métier et architectures maintenables.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('backend', 'en', 'Back-end', 'REST APIs, business logic, and maintainable architectures.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('backend', 'PHP', 1, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('backend', 'Python', 2, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('backend', 'Laravel', 3, true, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('backend', 'FastAPI', 4, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('backend', 'Node.js', 5, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('backend', 'Express.js', 6, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('backend', 'API REST', 7, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;

insert into public.skill_categories (slug, sort_order, published)
values ('mobile', 3, true)
on conflict (slug) do update set sort_order = excluded.sort_order, published = true;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('mobile', 'fr', 'Mobile & Desktop', 'Applications natives et cross-platform.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('mobile', 'en', 'Mobile & Desktop', 'Native and cross-platform applications.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('mobile', 'Kotlin', 1, true, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('mobile', 'Jetpack Compose', 2, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('mobile', 'React Native', 3, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('mobile', 'Rust', 4, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('mobile', 'Tauri', 5, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;

insert into public.skill_categories (slug, sort_order, published)
values ('data', 4, true)
on conflict (slug) do update set sort_order = excluded.sort_order, published = true;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('data', 'fr', 'Data & DevOps', 'Bases de données, déploiement et workflows de production.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('data', 'en', 'Data & DevOps', 'Databases, deployment, and production workflows.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('data', 'MySQL', 1, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('data', 'MongoDB', 2, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('data', 'Oracle', 3, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('data', 'Supabase', 4, true, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('data', 'Docker', 5, true, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('data', 'Git/GitHub', 6, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;

insert into public.skill_categories (slug, sort_order, published)
values ('design', 5, true)
on conflict (slug) do update set sort_order = excluded.sort_order, published = true;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('design', 'fr', 'Design', 'UI/UX, prototypage et design systems.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skill_category_translations (category_slug, locale, title, description)
values ('design', 'en', 'Design', 'UI/UX, prototyping, and design systems.')
on conflict (category_slug, locale) do update set
  title = excluded.title, description = excluded.description;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('design', 'Figma', 1, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('design', 'Canva', 2, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('design', 'UI/UX', 3, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('design', 'Responsive', 4, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;
insert into public.skills (category_slug, name, sort_order, is_core, published)
values ('design', 'PWA', 5, false, true)
on conflict (category_slug, name) do update set
  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;

insert into public.projects (slug, tags, image_url, github_url, demo_url, featured, year, sort_order, published)
values (
  'myfood', array['Kotlin', 'Jetpack Compose', 'Supabase', 'Android'], '/projects/myfood.png',
  'https://github.com/suufiaane13/MyFood', null, true,
  2026, 1, true
) on conflict (slug) do update set
  tags = excluded.tags, image_url = excluded.image_url,
  github_url = excluded.github_url, demo_url = excluded.demo_url,
  featured = excluded.featured, year = excluded.year,
  sort_order = excluded.sort_order, published = true;
insert into public.project_translations (project_slug, locale, title, description, long_description)
values (
  'myfood', 'fr', 'MyFood',
  'App Android de commande de plats : menu, panier, livraison et espace restaurateur.', 'Application mobile Kotlin + Jetpack Compose avec backend Supabase (Auth, PostgreSQL, Storage). Parcours complet client et espace de gestion pour restaurateurs.'
) on conflict (project_slug, locale) do update set
  title = excluded.title, description = excluded.description,
  long_description = excluded.long_description;
insert into public.project_translations (project_slug, locale, title, description, long_description)
values (
  'myfood', 'en', 'MyFood',
  'Android food ordering app: menu, cart, delivery, and restaurant management space.', 'Kotlin + Jetpack Compose mobile app with Supabase backend (Auth, PostgreSQL, Storage). Full customer journey and management space for restaurant owners.'
) on conflict (project_slug, locale) do update set
  title = excluded.title, description = excluded.description,
  long_description = excluded.long_description;

insert into public.projects (slug, tags, image_url, github_url, demo_url, featured, year, sort_order, published)
values (
  'pure-power-menu', array['TypeScript', 'React', 'Tailwind CSS v4', 'Vite'], '/projects/pure-power.png',
  'https://github.com/suufiaane13/pure-power-menu', 'https://pure-power-menu.netlify.app/', true,
  2026, 2, true
) on conflict (slug) do update set
  tags = excluded.tags, image_url = excluded.image_url,
  github_url = excluded.github_url, demo_url = excluded.demo_url,
  featured = excluded.featured, year = excluded.year,
  sort_order = excluded.sort_order, published = true;
insert into public.project_translations (project_slug, locale, title, description, long_description)
values (
  'pure-power-menu', 'fr', 'Pure Power Menu',
  'Menu digital mobile-first pour snack fitness à Oujda — macros, QR code table, React + Tailwind v4.', 'Carte digitale interactive pour Pure Power avec fiches produits Mass Gainer & Shred, macros nutritionnels, QR code par table et design mobile-first.'
) on conflict (project_slug, locale) do update set
  title = excluded.title, description = excluded.description,
  long_description = excluded.long_description;
insert into public.project_translations (project_slug, locale, title, description, long_description)
values (
  'pure-power-menu', 'en', 'Pure Power Menu',
  'Mobile-first digital menu for a fitness snack bar in Oujda — macros, table QR codes, React + Tailwind v4.', 'Interactive digital menu for Pure Power with Mass Gainer & Shred product pages, nutritional macros, per-table QR codes, and mobile-first design.'
) on conflict (project_slug, locale) do update set
  title = excluded.title, description = excluded.description,
  long_description = excluded.long_description;

insert into public.projects (slug, tags, image_url, github_url, demo_url, featured, year, sort_order, published)
values (
  'world-explorer', array['JavaScript', 'React', 'Tailwind CSS', 'API'], '/projects/world-explorer.png',
  'https://github.com/suufiaane13/Wold-Explorer', 'https://world-explorer0.netlify.app/', false,
  2025, 3, true
) on conflict (slug) do update set
  tags = excluded.tags, image_url = excluded.image_url,
  github_url = excluded.github_url, demo_url = excluded.demo_url,
  featured = excluded.featured, year = excluded.year,
  sort_order = excluded.sort_order, published = true;
insert into public.project_translations (project_slug, locale, title, description, long_description)
values (
  'world-explorer', 'fr', 'World Explorer',
  'Explorez 195+ pays, leurs cultures, capitales et populations. Infos temps réel et anecdotes IA.', 'Application web interactive pour découvrir le monde : données en temps réel, favoris, anecdotes générées par IA et design moderne. Gratuit et interactif.'
) on conflict (project_slug, locale) do update set
  title = excluded.title, description = excluded.description,
  long_description = excluded.long_description;
insert into public.project_translations (project_slug, locale, title, description, long_description)
values (
  'world-explorer', 'en', 'World Explorer',
  'Explore 195+ countries, their cultures, capitals, and populations. Real-time info and AI anecdotes.', 'Interactive web app to discover the world: real-time data, favorites, AI-generated anecdotes, and modern design. Free and interactive.'
) on conflict (project_slug, locale) do update set
  title = excluded.title, description = excluded.description,
  long_description = excluded.long_description;

insert into public.projects (slug, tags, image_url, github_url, demo_url, featured, year, sort_order, published)
values (
  'sultan-kunafa', array['TypeScript', 'React', 'Tailwind CSS', 'Vite'], '/projects/sultan-kunafa.png',
  'https://github.com/suufiaane13/sultan_kunafa', 'https://sweets-48.netlify.app/', false,
  2026, 4, true
) on conflict (slug) do update set
  tags = excluded.tags, image_url = excluded.image_url,
  github_url = excluded.github_url, demo_url = excluded.demo_url,
  featured = excluded.featured, year = excluded.year,
  sort_order = excluded.sort_order, published = true;
insert into public.project_translations (project_slug, locale, title, description, long_description)
values (
  'sultan-kunafa', 'fr', 'Sultan Kunafa',
  'Site vitrine premium pour marque de desserts orientaux — commande rapide via WhatsApp.', 'Landing page haut de gamme mettant en valeur l''expérience visuelle autour de la kunafa. Frontend optimisé pour la conversion et la commande via WhatsApp.'
) on conflict (project_slug, locale) do update set
  title = excluded.title, description = excluded.description,
  long_description = excluded.long_description;
insert into public.project_translations (project_slug, locale, title, description, long_description)
values (
  'sultan-kunafa', 'en', 'Sultan Kunafa',
  'Premium showcase site for an oriental desserts brand — quick ordering via WhatsApp.', 'High-end landing page highlighting the visual experience around kunafa. Frontend optimized for conversion and WhatsApp ordering.'
) on conflict (project_slug, locale) do update set
  title = excluded.title, description = excluded.description,
  long_description = excluded.long_description;

insert into public.experiences (slug, sort_order, technologies, is_current, project_slug, published)
values (
  'freelance', 1, array['React', 'TypeScript', 'Laravel', 'Supabase', 'Kotlin', 'Docker'], true,
  null, true
) on conflict (slug) do update set
  sort_order = excluded.sort_order, technologies = excluded.technologies,
  is_current = excluded.is_current, project_slug = excluded.project_slug, published = true;
insert into public.experience_translations (experience_slug, locale, period, role, company, description)
values (
  'freelance', 'fr', '2024 — Présent',
  'Développeur Full-Stack Freelance', 'Maroc · Remote', '33+ repos publics sur GitHub. Dashboards, apps mobile (Kotlin/Compose), menus digitaux, gestion médicale (Oracle/FastAPI) et sites vitrine pour clients locaux.'
) on conflict (experience_slug, locale) do update set
  period = excluded.period, role = excluded.role,
  company = excluded.company, description = excluded.description;
insert into public.experience_translations (experience_slug, locale, period, role, company, description)
values (
  'freelance', 'en', '2024 — Present',
  'Freelance Full-Stack Developer', 'Morocco · Remote', '33+ public repos on GitHub. Dashboards, mobile apps (Kotlin/Compose), digital menus, medical management (Oracle/FastAPI), and showcase sites for local clients.'
) on conflict (experience_slug, locale) do update set
  period = excluded.period, role = excluded.role,
  company = excluded.company, description = excluded.description;

insert into public.experiences (slug, sort_order, technologies, is_current, project_slug, published)
values (
  'pure-power', 2, array['React', 'TypeScript', 'Tailwind CSS v4', 'Vite'], false,
  'pure-power-menu', true
) on conflict (slug) do update set
  sort_order = excluded.sort_order, technologies = excluded.technologies,
  is_current = excluded.is_current, project_slug = excluded.project_slug, published = true;
insert into public.experience_translations (experience_slug, locale, period, role, company, description)
values (
  'pure-power', 'fr', '2026',
  'Développeur Frontend', 'Pure Power — Snack fitness, Oujda', 'Création du menu digital mobile-first : carte interactive, fiches macros, QR code par table et déploiement en production.'
) on conflict (experience_slug, locale) do update set
  period = excluded.period, role = excluded.role,
  company = excluded.company, description = excluded.description;
insert into public.experience_translations (experience_slug, locale, period, role, company, description)
values (
  'pure-power', 'en', '2026',
  'Frontend Developer', 'Pure Power — Fitness snack, Oujda', 'Built a mobile-first digital menu: interactive menu, macro cards, per-table QR codes, and production deployment.'
) on conflict (experience_slug, locale) do update set
  period = excluded.period, role = excluded.role,
  company = excluded.company, description = excluded.description;

insert into public.experiences (slug, sort_order, technologies, is_current, project_slug, published)
values (
  'fso-stage', 3, array['Support IT', 'Réseaux', 'Maintenance'], false,
  null, true
) on conflict (slug) do update set
  sort_order = excluded.sort_order, technologies = excluded.technologies,
  is_current = excluded.is_current, project_slug = excluded.project_slug, published = true;
insert into public.experience_translations (experience_slug, locale, period, role, company, description)
values (
  'fso-stage', 'fr', 'Mars 2025 (1 mois)',
  'Stagiaire informatique', 'Service Informatique, Faculté des Sciences d’Oujda — Université Mohammed Premier', 'Stage pratique au service informatique : support, maintenance et accompagnement des besoins numériques de la faculté.'
) on conflict (experience_slug, locale) do update set
  period = excluded.period, role = excluded.role,
  company = excluded.company, description = excluded.description;
insert into public.experience_translations (experience_slug, locale, period, role, company, description)
values (
  'fso-stage', 'en', 'March 2025 (1 month)',
  'IT Intern', 'IT Department, Faculty of Sciences of Oujda — Mohammed First University', 'Hands-on internship in the faculty IT department: support, maintenance, and helping with digital needs on campus.'
) on conflict (experience_slug, locale) do update set
  period = excluded.period, role = excluded.role,
  company = excluded.company, description = excluded.description;

insert into public.education_entries (slug, sort_order, is_completed, published)
values ('licence', 1, false, true)
on conflict (slug) do update set
  sort_order = excluded.sort_order, is_completed = excluded.is_completed, published = true;
insert into public.education_translations (education_slug, locale, period_label, title, description, institution)
values (
  'licence', 'fr', '2025–2026',
  'Licence Professionnelle en Informatique', 'Formation en cours', 'École SUP MTI, Oujda — en cours'
) on conflict (education_slug, locale) do update set
  period_label = excluded.period_label, title = excluded.title,
  description = excluded.description, institution = excluded.institution;
insert into public.education_translations (education_slug, locale, period_label, title, description, institution)
values (
  'licence', 'en', '2025–2026',
  'Professional Bachelor’s in Computer Science', 'Currently enrolled', 'SUP MTI School, Oujda — in progress'
) on conflict (education_slug, locale) do update set
  period_label = excluded.period_label, title = excluded.title,
  description = excluded.description, institution = excluded.institution;

insert into public.education_entries (slug, sort_order, is_completed, published)
values ('tsdd', 2, true, true)
on conflict (slug) do update set
  sort_order = excluded.sort_order, is_completed = excluded.is_completed, published = true;
insert into public.education_translations (education_slug, locale, period_label, title, description, institution)
values (
  'tsdd', 'fr', '2023–2025',
  'Technicien Spécialisé en Développement Digital', 'Formation en développement web et mobile', 'Centre Mixte de Formation Professionnelle, Oujda'
) on conflict (education_slug, locale) do update set
  period_label = excluded.period_label, title = excluded.title,
  description = excluded.description, institution = excluded.institution;
insert into public.education_translations (education_slug, locale, period_label, title, description, institution)
values (
  'tsdd', 'en', '2023–2025',
  'Specialized Technician in Digital Development', 'Training in web and mobile development', 'Professional Training Center, Oujda'
) on conflict (education_slug, locale) do update set
  period_label = excluded.period_label, title = excluded.title,
  description = excluded.description, institution = excluded.institution;

insert into public.education_entries (slug, sort_order, is_completed, published)
values ('bac', 3, true, true)
on conflict (slug) do update set
  sort_order = excluded.sort_order, is_completed = excluded.is_completed, published = true;
insert into public.education_translations (education_slug, locale, period_label, title, description, institution)
values (
  'bac', 'fr', '2022–2023',
  'Baccalauréat Sciences Physiques — Option Français', 'Diplôme du baccalauréat avec spécialisation en sciences physiques', 'Lycée Ennahda, Ahfir'
) on conflict (education_slug, locale) do update set
  period_label = excluded.period_label, title = excluded.title,
  description = excluded.description, institution = excluded.institution;
insert into public.education_translations (education_slug, locale, period_label, title, description, institution)
values (
  'bac', 'en', '2022–2023',
  'High School Diploma in Physical Sciences — French Option', 'Baccalaureate with specialization in physical sciences', 'Ennahda High School, Ahfir'
) on conflict (education_slug, locale) do update set
  period_label = excluded.period_label, title = excluded.title,
  description = excluded.description, institution = excluded.institution;

insert into public.interests (slug, icon_key, sort_order, published)
values ('swimming', 'waves', 1, true)
on conflict (slug) do update set
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;
insert into public.interest_translations (interest_slug, locale, label)
values ('swimming', 'fr', 'Natation')
on conflict (interest_slug, locale) do update set label = excluded.label;
insert into public.interest_translations (interest_slug, locale, label)
values ('swimming', 'en', 'Swimming')
on conflict (interest_slug, locale) do update set label = excluded.label;

insert into public.interests (slug, icon_key, sort_order, published)
values ('chess', 'crown', 2, true)
on conflict (slug) do update set
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;
insert into public.interest_translations (interest_slug, locale, label)
values ('chess', 'fr', 'Jeu d''échecs')
on conflict (interest_slug, locale) do update set label = excluded.label;
insert into public.interest_translations (interest_slug, locale, label)
values ('chess', 'en', 'Chess')
on conflict (interest_slug, locale) do update set label = excluded.label;

insert into public.interests (slug, icon_key, sort_order, published)
values ('travel', 'plane', 3, true)
on conflict (slug) do update set
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;
insert into public.interest_translations (interest_slug, locale, label)
values ('travel', 'fr', 'Voyages')
on conflict (interest_slug, locale) do update set label = excluded.label;
insert into public.interest_translations (interest_slug, locale, label)
values ('travel', 'en', 'Travel')
on conflict (interest_slug, locale) do update set label = excluded.label;

insert into public.social_links (slug, label, href, handle, icon_key, sort_order, published)
values (
  'instagram', 'Instagram', 'https://instagram.com/suuf.iaane',
  '@suuf.iaane', 'instagram', 1, true
) on conflict (slug) do update set
  label = excluded.label, href = excluded.href, handle = excluded.handle,
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;
insert into public.social_links (slug, label, href, handle, icon_key, sort_order, published)
values (
  'github', 'GitHub', 'https://github.com/suufiaane13',
  '@suufiaane13', 'github', 2, true
) on conflict (slug) do update set
  label = excluded.label, href = excluded.href, handle = excluded.handle,
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;
insert into public.social_links (slug, label, href, handle, icon_key, sort_order, published)
values (
  'whatsapp', 'WhatsApp', 'https://wa.me/212641454572',
  '+212 641 454 572', 'whatsapp', 3, true
) on conflict (slug) do update set
  label = excluded.label, href = excluded.href, handle = excluded.handle,
  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;

insert into public.spoken_languages (slug, flag_emoji, sort_order, published)
values ('ar', '🇲🇦', 1, true)
on conflict (slug) do update set
  flag_emoji = excluded.flag_emoji, sort_order = excluded.sort_order, published = true;
insert into public.spoken_language_translations (language_slug, locale, name, level)
values ('ar', 'fr', 'Arabe', 'Langue maternelle')
on conflict (language_slug, locale) do update set
  name = excluded.name, level = excluded.level;
insert into public.spoken_language_translations (language_slug, locale, name, level)
values ('ar', 'en', 'Arabic', 'Native language')
on conflict (language_slug, locale) do update set
  name = excluded.name, level = excluded.level;

insert into public.spoken_languages (slug, flag_emoji, sort_order, published)
values ('fr', '🇫🇷', 2, true)
on conflict (slug) do update set
  flag_emoji = excluded.flag_emoji, sort_order = excluded.sort_order, published = true;
insert into public.spoken_language_translations (language_slug, locale, name, level)
values ('fr', 'fr', 'Français', 'Courant')
on conflict (language_slug, locale) do update set
  name = excluded.name, level = excluded.level;
insert into public.spoken_language_translations (language_slug, locale, name, level)
values ('fr', 'en', 'French', 'Fluent')
on conflict (language_slug, locale) do update set
  name = excluded.name, level = excluded.level;

insert into public.spoken_languages (slug, flag_emoji, sort_order, published)
values ('en', '🇬🇧', 3, true)
on conflict (slug) do update set
  flag_emoji = excluded.flag_emoji, sort_order = excluded.sort_order, published = true;
insert into public.spoken_language_translations (language_slug, locale, name, level)
values ('en', 'fr', 'Anglais', 'Courant')
on conflict (language_slug, locale) do update set
  name = excluded.name, level = excluded.level;
insert into public.spoken_language_translations (language_slug, locale, name, level)
values ('en', 'en', 'English', 'Fluent')
on conflict (language_slug, locale) do update set
  name = excluded.name, level = excluded.level;

commit;
