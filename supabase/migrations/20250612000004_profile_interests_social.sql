-- Profil, expertise, intérêts, réseaux sociaux, langues parlées

create table if not exists public.site_profile (
  id text primary key default 'main',
  name text not null,
  avatar_url text not null,
  logo_url text not null,
  cv_url text not null,
  cv_filename text not null,
  github_url text not null,
  github_handle text not null,
  public_repos int not null default 0,
  member_since smallint not null,
  email text,
  whatsapp text,
  whatsapp_href text,
  address text,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_profile_translations (
  profile_id text not null references public.site_profile (id) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  title text not null,
  tagline text not null,
  availability text not null,
  bio_paragraph_1 text not null,
  bio_paragraph_2 text not null,
  primary key (profile_id, locale)
);

create table if not exists public.expertise_items (
  slug text primary key,
  icon_key text not null check (icon_key in ('code', 'database', 'smartphone', 'globe')),
  sort_order smallint not null default 0,
  published boolean not null default true
);

create table if not exists public.expertise_translations (
  expertise_slug text not null references public.expertise_items (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  title text not null,
  description text not null,
  primary key (expertise_slug, locale)
);

create table if not exists public.interests (
  slug text primary key,
  icon_key text not null check (icon_key in ('waves', 'crown', 'plane')),
  sort_order smallint not null default 0,
  published boolean not null default true
);

create table if not exists public.interest_translations (
  interest_slug text not null references public.interests (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  label text not null,
  primary key (interest_slug, locale)
);

create table if not exists public.social_links (
  slug text primary key,
  label text not null,
  href text not null,
  handle text not null,
  icon_key text not null check (icon_key in ('instagram', 'github', 'whatsapp')),
  sort_order smallint not null default 0,
  published boolean not null default true
);

create table if not exists public.spoken_languages (
  slug text primary key,
  flag_emoji text not null,
  sort_order smallint not null default 0,
  published boolean not null default true
);

create table if not exists public.spoken_language_translations (
  language_slug text not null references public.spoken_languages (slug) on delete cascade,
  locale text not null check (locale in ('fr', 'en')),
  name text not null,
  level text not null,
  primary key (language_slug, locale)
);

alter table public.site_profile enable row level security;
alter table public.site_profile_translations enable row level security;
alter table public.expertise_items enable row level security;
alter table public.expertise_translations enable row level security;
alter table public.interests enable row level security;
alter table public.interest_translations enable row level security;
alter table public.social_links enable row level security;
alter table public.spoken_languages enable row level security;
alter table public.spoken_language_translations enable row level security;

create policy "site_profile_public_read"
  on public.site_profile for select to anon, authenticated using (published = true);

create policy "site_profile_translations_public_read"
  on public.site_profile_translations for select to anon, authenticated
  using (exists (select 1 from public.site_profile p where p.id = profile_id and p.published = true));

create policy "expertise_items_public_read"
  on public.expertise_items for select to anon, authenticated using (published = true);

create policy "expertise_translations_public_read"
  on public.expertise_translations for select to anon, authenticated
  using (exists (select 1 from public.expertise_items e where e.slug = expertise_slug and e.published = true));

create policy "interests_public_read"
  on public.interests for select to anon, authenticated using (published = true);

create policy "interest_translations_public_read"
  on public.interest_translations for select to anon, authenticated
  using (exists (select 1 from public.interests i where i.slug = interest_slug and i.published = true));

create policy "social_links_public_read"
  on public.social_links for select to anon, authenticated using (published = true);

create policy "spoken_languages_public_read"
  on public.spoken_languages for select to anon, authenticated using (published = true);

create policy "spoken_language_translations_public_read"
  on public.spoken_language_translations for select to anon, authenticated
  using (exists (select 1 from public.spoken_languages l where l.slug = language_slug and l.published = true));

create or replace view public.v_profile_i18n
with (security_invoker = true)
as
select
  p.id,
  p.name,
  p.avatar_url,
  p.logo_url,
  p.cv_url,
  p.cv_filename,
  p.github_url,
  p.github_handle,
  p.public_repos,
  p.member_since,
  p.email,
  p.whatsapp,
  p.whatsapp_href,
  p.address,
  t.locale,
  t.title,
  t.tagline,
  t.availability,
  t.bio_paragraph_1,
  t.bio_paragraph_2
from public.site_profile p
join public.site_profile_translations t on t.profile_id = p.id
where p.published = true;

create or replace view public.v_expertise_i18n
with (security_invoker = true)
as
select e.slug, e.icon_key, e.sort_order, t.locale, t.title, t.description
from public.expertise_items e
join public.expertise_translations t on t.expertise_slug = e.slug
where e.published = true;

create or replace view public.v_interests_i18n
with (security_invoker = true)
as
select i.slug, i.icon_key, i.sort_order, t.locale, t.label
from public.interests i
join public.interest_translations t on t.interest_slug = i.slug
where i.published = true;

grant select on public.v_profile_i18n to anon, authenticated;
grant select on public.v_expertise_i18n to anon, authenticated;
grant select on public.v_interests_i18n to anon, authenticated;
