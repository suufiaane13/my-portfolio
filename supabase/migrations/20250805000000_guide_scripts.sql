-- ═══════════════════════════════════════════════════════════════════════════════
-- Guide scripts — store TTS narration scripts in Supabase (replaces hardcoded)
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.guide_scripts (
  chunk_id  text not null,
  locale    text not null check (locale in ('fr', 'en')),
  speech_text text not null check (char_length(speech_text) between 10 and 2000),
  primary key (chunk_id, locale)
);

comment on table public.guide_scripts is 'TTS narration scripts for the portfolio guide (per chunk + locale)';

-- RLS: admin-only access
alter table public.guide_scripts enable row level security;

create policy "guide_scripts_admin_all" on public.guide_scripts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════════
-- Seed: insert the 24 current scripts from guideSpeechScripts.ts
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.guide_scripts (chunk_id, locale, speech_text) values

-- ── FR ──────────────────────────────────────────────────────────────────────
('about-main', 'fr',
'À propos de moi. Je suis Soufiane, développeur full-stack et UI-UX designer, titulaire d''une licence professionnelle en informatique à l''école SUPMTI à Oujda. Mon parcours mêle développement web avec React, TypeScript, Laravel et PHP, et développement mobile avec Kotlin et Jetpack Compose. Curieux et rigoureux, je cherche un poste ou des missions concrètes pour contribuer à des projets ambitieux au sein d''une équipe dynamique.'),

('about-availability', 'fr',
'Disponibilité. Je suis actuellement à la recherche d''un poste et disponible pour de nouvelles missions. Je peux intervenir en développement web avec React, TypeScript, Laravel et PHP, ainsi qu''en développement mobile avec Kotlin et Java.'),

('skills-overview', 'fr',
'Mes compétences. Ma stack principale regroupe React, TypeScript, Laravel, Kotlin, Supabase et Docker. Côté front-end, j''utilise HTML 5, CSS 3, JavaScript, TypeScript, React, Vite, Tailwind CSS et Bootstrap. Côté back-end, je maîtrise PHP, Python, Laravel, FastAPI, Node JS et les API REST. Pour le mobile et le desktop, je travaille avec Kotlin, Jetpack Compose, React Native, Rust et Tauri. En data et DevOps, j''utilise MySQL, MongoDB, Oracle, Supabase, Docker, Git et GitHub. Je conçois aussi des interfaces U I U X sur Figma.'),

('experience-list', 'fr',
'Mon parcours professionnel. Depuis 2024, je travaille comme développeur full-stack freelance à distance, avec plus de 33 projets publics sur GitHub : dashboards, applications mobiles en Kotlin et Compose, menus digitaux et sites vitrine. En 2026, j''ai été développeur frontend chez Pure Power, un snack fitness à Oujda, où j''ai livré un menu digital mobile-first avec QR code par table. En mars 2025, j''ai effectué un stage d''un mois au service informatique de la Faculté des Sciences de l''Université Mohammed Premier à Oujda.'),

('education-list', 'fr',
'Ma formation. Je suis titulaire d''une licence professionnelle en informatique à l''école SUPMTI à Oujda obtenue en 2025. Auparavant, j''ai obtenu un diplôme de technicien spécialisé en développement digital au Centre Mixte de Formation Professionnelle d''Oujda de 2023 à 2025. J''ai également un baccalauréat en sciences physiques, option français, obtenu au lycée Ennahda d''Ahfir en 2023.'),

('contact-main', 'fr',
'Pour me contacter. Vous pouvez m''envoyer un email à hji point sfn arobase gmail point com, ou me joindre sur WhatsApp au plus 212 6 41 45 45 72. Je suis basé à Oujda, au Maroc.'),

('cv-download', 'fr',
'Mon C V est disponible au téléchargement. Vous pouvez le récupérer directement en utilisant le bouton Télécharger mon C V dans l''en-tête, ou via le bouton situé juste ci-dessous.'),

('game-info', 'fr',
'Une pause ludique ? Ce portfolio propose deux mini-jeux : un jeu de mémoire avec classement top 5, et un jeu d''échecs contre un bot Stockfish avec plusieurs niveaux débutant, intermédiaire et expert, ouvertures, et analyse des coups après la partie. Choisissez dans le menu Jeux !'),

('project-myfood', 'fr',
'Le projet MyFood est une application mobile Android développée en Kotlin et Jetpack Compose, connectée à un back-end Supabase avec authentification, PostgreSQL et stockage. Elle offre un parcours client complet et un espace de gestion pour les restaurateurs.'),

('project-pure-power-menu', 'fr',
'Pure Power Menu est une carte digitale interactive créée pour le snack fitness Pure Power à Oujda. Elle propose un affichage des valeurs nutritionnelles, un accès par Q R code par table et un design pensé d''abord pour le mobile, développé avec React, TypeScript et Tailwind CSS.'),

('project-world-explorer', 'fr',
'World Explorer est une application web interactive pour découvrir le monde grâce à des données en temps réel, un système de favoris et des anecdotes générées par intelligence artificielle. Le projet a été conçu avec JavaScript, React et Tailwind CSS.'),

('project-sultan-kunafa', 'fr',
'Sultan Kunafa est une landing page haut de gamme conçue pour mettre en valeur la kunafa. Son interface est optimisée pour la conversion et la prise de commande directe via WhatsApp, réalisée avec React, TypeScript, Vite et Tailwind CSS.'),

-- ── EN ──────────────────────────────────────────────────────────────────────
('about-main', 'en',
'About me. I am a full stack developer and professional bachelor''s graduate in computer science at SUP MTI. I am excited to apply my skills across web development using HTML, CSS, PHP, JavaScript, React, and Laravel, alongside software projects in Java and Kotlin. Curious and rigorous, I want to contribute to real-world projects within a dynamic team. I am open to new opportunities and ready for work.'),

('about-availability', 'en',
'Availability. I am actively looking for a new role and ready to start work immediately. My primary focus includes web development with HTML, CSS, PHP, JavaScript, React, and Laravel, as well as software development in Java and Kotlin.'),

('skills-overview', 'en',
'Skills overview. My core stack includes React, TypeScript, Laravel, Kotlin, Superbase, and Docker. On the frontend, I work with HTML 5, CSS 3, JavaScript, TypeScript, React, Vite, Tailwind CSS, and Bootstrap. For backend development, I use PHP, Python, Laravel, FastAPI, Node JS, Express JS, and REST APIs. Mobile and desktop tech includes Kotlin, Jetpack Compose, React Native, Rust, and Tauri. For data and DevOps, I rely on MySQL, MongoDB, Oracle, Superbase, Docker, Git, and GitHub, accompanied by UI UX design in Figma and responsive PWAs.'),

('experience-list', 'en',
'Professional experience. As a remote freelance full stack developer in Morocco since 2024, I have created over 33 public repositories on GitHub, building dashboards, mobile apps in Kotlin and Compose, digital menus, and showcase sites. In 2026, I served as frontend developer at Pure Power fitness snack bar in Oujda, delivering a mobile-first digital menu with per-table QR codes. In March 2025, I completed a one-month IT internship at the Faculty of Sciences IT department at Mohammed First University in Oujda.'),

('education-list', 'en',
'Education background. I earned a Professional Bachelor in Computer Science at SUP MTI in Oujda in 2025. Prior to this, I completed a Specialized Technician diploma in digital development at the Professional Training Center in Oujda from 2023 to 2025. I earned my high school diploma in physical sciences, French option, at Ennahda High School in Ahfir in 2023.'),

('contact-main', 'en',
'Contact information. You can reach me by email at hji dot sfn at gmail dot com, or on WhatsApp at plus 212 641 454 572. I am located in Oujda, Morocco.'),

('cv-download', 'en',
'Curriculum Vitae. My resume is available for instant download. Feel free to click the Download my CV button in the hero banner, or click the button down below.'),

('game-info', 'en',
'Portfolio mini-games. You can play Memory with a top 5 leaderboard, or Chess against a Stockfish bot with openings and multiple difficulty levels including beginner, intermediate, and expert, plus move analysis after the game. Choose from the Games menu!'),

('project-myfood', 'en',
'MyFood project. A mobile application crafted with Kotlin and Jetpack Compose, powered by a Superbase backend for authentication, PostgreSQL, and storage. It supports a full customer journey alongside a management dashboard for restaurant owners using Kotlin, Jetpack Compose, Superbase, and Android.'),

('project-pure-power-menu', 'en',
'Pure Power Menu. An interactive digital menu created for Pure Power, showcasing Mass Gainer and Shred product pages, nutritional macro information, and per-table QR code access in a mobile-first layout built with TypeScript, React, Tailwind CSS, and Vite.'),

('project-world-explorer', 'en',
'World Explorer. An interactive web application for exploring global insights featuring real-time data, custom favorites, AI-generated anecdotes, and a modern UI. Built with JavaScript, React, Tailwind CSS, and external APIs.'),

('project-sultan-kunafa', 'en',
'Sultan Kunafa. A high-end landing page designed to offer a visual experience around kunafa. Optimized for frontend conversions and direct WhatsApp ordering using TypeScript, React, Tailwind CSS, and Vite.')

on conflict (chunk_id, locale) do nothing;
