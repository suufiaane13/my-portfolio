-- Seed initial — données actuelles du portfolio (src/data + i18n)

-- ─── Projets ──────────────────────────────────────────────────────────────────
insert into public.projects (slug, tags, image_url, github_url, demo_url, featured, year, sort_order) values
  ('myfood',           array['Kotlin','Jetpack Compose','Supabase','Android'],           '/projects/myfood.png',         'https://github.com/suufiaane13/MyFood',           null,                                      true,  2026, 1),
  ('pure-power-menu',  array['TypeScript','React','Tailwind CSS v4','Vite'],             '/projects/pure-power.png',     'https://github.com/suufiaane13/pure-power-menu',  'https://pure-power-menu.netlify.app/',    true,  2026, 2),
  ('world-explorer',   array['JavaScript','React','Tailwind CSS','API'],                 '/projects/world-explorer.png', 'https://github.com/suufiaane13/Wold-Explorer',    'https://world-explorer0.netlify.app/',    false, 2025, 3),
  ('sultan-kunafa',    array['TypeScript','React','Tailwind CSS','Vite'],               '/projects/sultan-kunafa.png',  'https://github.com/suufiaane13/sultan_kunafa',    'https://sweets-48.netlify.app/',          false, 2026, 4)
on conflict (slug) do nothing;

insert into public.project_translations (project_slug, locale, title, description, long_description) values
  ('myfood', 'fr', 'MyFood',
   'App Android de commande de plats : menu, panier, livraison et espace restaurateur.',
   'Application mobile Kotlin + Jetpack Compose avec backend Supabase (Auth, PostgreSQL, Storage). Parcours complet client et espace de gestion pour restaurateurs.'),
  ('myfood', 'en', 'MyFood',
   'Android food ordering app: menu, cart, delivery, and restaurant management space.',
   'Kotlin + Jetpack Compose mobile app with Supabase backend (Auth, PostgreSQL, Storage). Full customer journey and management space for restaurant owners.'),
  ('pure-power-menu', 'fr', 'Pure Power Menu',
   'Menu digital mobile-first pour snack fitness à Oujda — macros, QR code table, React + Tailwind v4.',
   'Carte digitale interactive pour Pure Power avec fiches produits Mass Gainer & Shred, macros nutritionnels, QR code par table et design mobile-first.'),
  ('pure-power-menu', 'en', 'Pure Power Menu',
   'Mobile-first digital menu for a fitness snack bar in Oujda — macros, table QR codes, React + Tailwind v4.',
   'Interactive digital menu for Pure Power with Mass Gainer & Shred product pages, nutritional macros, per-table QR codes, and mobile-first design.'),
  ('world-explorer', 'fr', 'World Explorer',
   'Explorez 195+ pays, leurs cultures, capitales et populations. Infos temps réel et anecdotes IA.',
   'Application web interactive pour découvrir le monde : données en temps réel, favoris, anecdotes générées par IA et design moderne. Gratuit et interactif.'),
  ('world-explorer', 'en', 'World Explorer',
   'Explore 195+ countries, their cultures, capitals, and populations. Real-time info and AI anecdotes.',
   'Interactive web app to discover the world: real-time data, favorites, AI-generated anecdotes, and modern design. Free and interactive.'),
  ('sultan-kunafa', 'fr', 'Sultan Kunafa',
   'Site vitrine premium pour marque de desserts orientaux — commande rapide via WhatsApp.',
   'Landing page haut de gamme mettant en valeur l''expérience visuelle autour de la kunafa. Frontend optimisé pour la conversion et la commande via WhatsApp.'),
  ('sultan-kunafa', 'en', 'Sultan Kunafa',
   'Premium showcase site for an oriental desserts brand — quick ordering via WhatsApp.',
   'High-end landing page highlighting the visual experience around kunafa. Frontend optimized for conversion and WhatsApp ordering.')
on conflict (project_slug, locale) do nothing;

-- ─── Compétences — catégories ─────────────────────────────────────────────────
insert into public.skill_categories (slug, sort_order) values
  ('frontend', 1),
  ('backend',  2),
  ('mobile',   3),
  ('data',     4),
  ('design',   5)
on conflict (slug) do nothing;

insert into public.skill_category_translations (category_slug, locale, title, description) values
  ('frontend', 'fr', 'Front-end',  'Interfaces modernes, performantes et accessibles.'),
  ('frontend', 'en', 'Front-end',  'Modern, performant, and accessible interfaces.'),
  ('backend',  'fr', 'Back-end',   'APIs REST, logique métier et architectures maintenables.'),
  ('backend',  'en', 'Back-end',   'REST APIs, business logic, and maintainable architectures.'),
  ('mobile',   'fr', 'Mobile & Desktop', 'Applications natives et cross-platform.'),
  ('mobile',   'en', 'Mobile & Desktop', 'Native and cross-platform applications.'),
  ('data',     'fr', 'Data & DevOps', 'Bases de données, déploiement et workflows de production.'),
  ('data',     'en', 'Data & DevOps', 'Databases, deployment, and production workflows.'),
  ('design',   'fr', 'Design',     'UI/UX, prototypage et design systems.'),
  ('design',   'en', 'Design',     'UI/UX, prototyping, and design systems.')
on conflict (category_slug, locale) do nothing;

-- ─── Compétences — technologies ───────────────────────────────────────────────
insert into public.skills (category_slug, name, sort_order, is_core) values
  ('frontend', 'HTML5',         1, false),
  ('frontend', 'CSS3',          2, false),
  ('frontend', 'JavaScript',    3, false),
  ('frontend', 'TypeScript',    4, true),
  ('frontend', 'React',         5, true),
  ('frontend', 'Vite',          6, false),
  ('frontend', 'Tailwind CSS',  7, false),
  ('frontend', 'Bootstrap',     8, false),
  ('backend',  'PHP',           1, false),
  ('backend',  'Python',        2, false),
  ('backend',  'Laravel',       3, true),
  ('backend',  'FastAPI',       4, false),
  ('backend',  'Node.js',       5, false),
  ('backend',  'Express.js',    6, false),
  ('backend',  'API REST',      7, false),
  ('mobile',   'Kotlin',        1, true),
  ('mobile',   'Jetpack Compose', 2, false),
  ('mobile',   'React Native',  3, false),
  ('mobile',   'Rust',          4, false),
  ('mobile',   'Tauri',         5, false),
  ('data',     'MySQL',         1, false),
  ('data',     'MongoDB',       2, false),
  ('data',     'Oracle',        3, false),
  ('data',     'Supabase',      4, true),
  ('data',     'Docker',        5, true),
  ('data',     'Git/GitHub',    6, false),
  ('design',   'Figma',         1, false),
  ('design',   'Canva',         2, false),
  ('design',   'UI/UX',         3, false),
  ('design',   'Responsive',    4, false),
  ('design',   'PWA',           5, false)
on conflict (category_slug, name) do nothing;

-- ─── Expériences ──────────────────────────────────────────────────────────────
insert into public.experiences (slug, sort_order, technologies, is_current, project_slug) values
  ('freelance',  1, array['React','TypeScript','Laravel','Supabase','Kotlin','Docker'], true,  null),
  ('pure-power', 2, array['React','TypeScript','Tailwind CSS v4','Vite'],              false, 'pure-power-menu'),
  ('cmfp',       3, array['PHP','Laravel','Blade','MySQL','Git'],                      false, null)
on conflict (slug) do nothing;

insert into public.experience_translations (experience_slug, locale, period, role, company, description) values
  ('freelance', 'fr', '2024 — Présent', 'Développeur Full-Stack Freelance', 'Maroc · Remote',
   '33+ repos publics sur GitHub. Dashboards, apps mobile (Kotlin/Compose), menus digitaux, gestion médicale (Oracle/FastAPI) et sites vitrine pour clients locaux.'),
  ('freelance', 'en', '2024 — Present', 'Freelance Full-Stack Developer', 'Morocco · Remote',
   '33+ public repos on GitHub. Dashboards, mobile apps (Kotlin/Compose), digital menus, medical management (Oracle/FastAPI), and showcase sites for local clients.'),
  ('pure-power', 'fr', '2026', 'Développeur Frontend', 'Pure Power — Snack fitness, Oujda',
   'Création du menu digital mobile-first : carte interactive, fiches macros, QR code par table et déploiement en production.'),
  ('pure-power', 'en', '2026', 'Frontend Developer', 'Pure Power — Fitness snack, Oujda',
   'Built a mobile-first digital menu: interactive menu, macro cards, per-table QR codes, and production deployment.'),
  ('cmfp', 'fr', '2023 — 2025', 'Technicien Spécialisé — Développement Digital', 'Centre Mixte de Formation Professionnelle, Oujda',
   'Projets académiques Laravel/Blade : bibliothèque, inventaire IT, e-learning, gestion commerciale. Bases solides PHP, MySQL et méthode Agile.'),
  ('cmfp', 'en', '2023 — 2025', 'Specialized Technician — Digital Development', 'Professional Training Center, Oujda',
   'Academic Laravel/Blade projects: library, IT inventory, e-learning, business management. Strong foundations in PHP, MySQL, and Agile methodology.')
on conflict (experience_slug, locale) do nothing;

-- ─── Formations ───────────────────────────────────────────────────────────────
insert into public.education_entries (slug, sort_order, is_completed) values
  ('tsdd', 1, false),
  ('bac',  2, true)
on conflict (slug) do nothing;

insert into public.education_translations (education_slug, locale, period_label, title, description, institution) values
  ('tsdd', 'fr', '2023–2025', 'Technicien Spécialisé en Développement Digital',
   'Formation en développement web et mobile', 'Centre Mixte de Formation Professionnelle, Oujda'),
  ('tsdd', 'en', '2023–2025', 'Specialized Technician in Digital Development',
   'Training in web and mobile development', 'Professional Training Center, Oujda'),
  ('bac', 'fr', '2022–2023', 'Baccalauréat Sciences Physiques — Option Français',
   'Diplôme du baccalauréat avec spécialisation en sciences physiques', 'Lycée Ennahda, Ahfir'),
  ('bac', 'en', '2022–2023', 'High School Diploma in Physical Sciences — French Option',
   'Baccalaureate with specialization in physical sciences', 'Ennahda High School, Ahfir')
on conflict (education_slug, locale) do nothing;
