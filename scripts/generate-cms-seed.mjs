/**
 * Génère supabase/scripts/refresh-cms-from-snapshot.sql
 * Source : supabase/seed/portfolio-snapshot.json
 *
 * Usage : node scripts/generate-cms-seed.mjs
 * Puis coller le SQL dans Supabase → SQL Editor, ou :
 *   supabase db execute -f supabase/scripts/refresh-cms-from-snapshot.sql
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const snapshot = JSON.parse(
  readFileSync(join(root, 'supabase/seed/portfolio-snapshot.json'), 'utf8'),
)

function sqlString(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlArray(items) {
  if (!items?.length) return 'array[]::text[]'
  return `array[${items.map((item) => sqlString(item)).join(', ')}]`
}

const lines = [
  '-- Refresh CMS — généré depuis supabase/seed/portfolio-snapshot.json',
  `-- Owner: ${snapshot.owner} · ${snapshot.exportedAt}`,
  '-- Idempotent : upsert (ré-exécutable sans doublons)',
  '',
  'begin;',
  '',
]

const p = snapshot.profile
const pt = snapshot.profileTranslations

lines.push(
  'insert into public.site_profile (',
  '  id, name, avatar_url, logo_url, cv_url, cv_filename,',
  '  github_url, github_handle, public_repos, member_since,',
  '  email, whatsapp, whatsapp_href, address, published',
  ') values (',
  `  'main', ${sqlString(p.name)}, ${sqlString(p.avatarUrl)}, ${sqlString(p.logoUrl)},`,
  `  ${sqlString(p.cvUrl)}, ${sqlString(p.cvFilename)},`,
  `  ${sqlString(p.githubUrl)}, ${sqlString(p.githubHandle)}, ${p.publicRepos}, ${p.memberSince},`,
  `  ${sqlString(p.email)}, ${sqlString(p.whatsapp)}, ${sqlString(p.whatsappHref)},`,
  `  ${sqlString(p.address)}, true`,
  ') on conflict (id) do update set',
  '  name = excluded.name,',
  '  avatar_url = excluded.avatar_url,',
  '  logo_url = excluded.logo_url,',
  '  cv_url = excluded.cv_url,',
  '  cv_filename = excluded.cv_filename,',
  '  github_url = excluded.github_url,',
  '  github_handle = excluded.github_handle,',
  '  public_repos = excluded.public_repos,',
  '  member_since = excluded.member_since,',
  '  email = excluded.email,',
  '  whatsapp = excluded.whatsapp,',
  '  whatsapp_href = excluded.whatsapp_href,',
  '  address = excluded.address,',
  '  published = true,',
  '  updated_at = now();',
  '',
)

for (const locale of ['fr', 'en']) {
  const t = pt[locale]
  lines.push(
    'insert into public.site_profile_translations',
    '  (profile_id, locale, title, tagline, availability, bio_paragraph_1, bio_paragraph_2)',
    'values (',
    `  'main', ${sqlString(locale)}, ${sqlString(t.title)}, ${sqlString(t.tagline)},`,
    `  ${sqlString(t.availability)}, ${sqlString(t.bio[0])}, ${sqlString(t.bio[1])}`,
    ') on conflict (profile_id, locale) do update set',
    '  title = excluded.title,',
    '  tagline = excluded.tagline,',
    '  availability = excluded.availability,',
    '  bio_paragraph_1 = excluded.bio_paragraph_1,',
    '  bio_paragraph_2 = excluded.bio_paragraph_2;',
    '',
  )
}

for (const item of snapshot.expertise) {
  lines.push(
    'insert into public.expertise_items (slug, icon_key, sort_order, published)',
    `values (${sqlString(item.slug)}, ${sqlString(item.iconKey)}, ${item.sortOrder}, true)`,
    'on conflict (slug) do update set',
    '  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;',
  )
  for (const locale of ['fr', 'en']) {
    const t = item.translations[locale]
    lines.push(
      'insert into public.expertise_translations (expertise_slug, locale, title, description)',
      `values (${sqlString(item.slug)}, ${sqlString(locale)}, ${sqlString(t.title)}, ${sqlString(t.description)})`,
      'on conflict (expertise_slug, locale) do update set',
      '  title = excluded.title, description = excluded.description;',
    )
  }
  lines.push('')
}

for (const cat of snapshot.skillCategories) {
  lines.push(
    'insert into public.skill_categories (slug, sort_order, published)',
    `values (${sqlString(cat.slug)}, ${cat.sortOrder}, true)`,
    'on conflict (slug) do update set sort_order = excluded.sort_order, published = true;',
  )
  for (const locale of ['fr', 'en']) {
    const t = cat.translations[locale]
    lines.push(
      'insert into public.skill_category_translations (category_slug, locale, title, description)',
      `values (${sqlString(cat.slug)}, ${sqlString(locale)}, ${sqlString(t.title)}, ${sqlString(t.description)})`,
      'on conflict (category_slug, locale) do update set',
      '  title = excluded.title, description = excluded.description;',
    )
  }
  for (const skill of cat.skills) {
    lines.push(
      'insert into public.skills (category_slug, name, sort_order, is_core, published)',
      `values (${sqlString(cat.slug)}, ${sqlString(skill.name)}, ${skill.sortOrder}, ${skill.isCore}, true)`,
      'on conflict (category_slug, name) do update set',
      '  sort_order = excluded.sort_order, is_core = excluded.is_core, published = true;',
    )
  }
  lines.push('')
}

for (const project of snapshot.projects) {
  lines.push(
    'insert into public.projects (slug, tags, image_url, github_url, demo_url, featured, year, sort_order, published)',
    'values (',
    `  ${sqlString(project.slug)}, ${sqlArray(project.tags)}, ${sqlString(project.imageUrl)},`,
    `  ${sqlString(project.githubUrl)}, ${sqlString(project.demoUrl)}, ${project.featured},`,
    `  ${project.year}, ${project.sortOrder}, true`,
    ') on conflict (slug) do update set',
    '  tags = excluded.tags, image_url = excluded.image_url,',
    '  github_url = excluded.github_url, demo_url = excluded.demo_url,',
    '  featured = excluded.featured, year = excluded.year,',
    '  sort_order = excluded.sort_order, published = true;',
  )
  for (const locale of ['fr', 'en']) {
    const t = project.translations[locale]
    lines.push(
      'insert into public.project_translations (project_slug, locale, title, description, long_description)',
      'values (',
      `  ${sqlString(project.slug)}, ${sqlString(locale)}, ${sqlString(t.title)},`,
      `  ${sqlString(t.description)}, ${sqlString(t.longDescription)}`,
      ') on conflict (project_slug, locale) do update set',
      '  title = excluded.title, description = excluded.description,',
      '  long_description = excluded.long_description;',
    )
  }
  lines.push('')
}

for (const exp of snapshot.experiences) {
  lines.push(
    'insert into public.experiences (slug, sort_order, technologies, is_current, project_slug, published)',
    'values (',
    `  ${sqlString(exp.slug)}, ${exp.sortOrder}, ${sqlArray(exp.technologies)}, ${exp.isCurrent},`,
    `  ${sqlString(exp.projectSlug)}, true`,
    ') on conflict (slug) do update set',
    '  sort_order = excluded.sort_order, technologies = excluded.technologies,',
    '  is_current = excluded.is_current, project_slug = excluded.project_slug, published = true;',
  )
  for (const locale of ['fr', 'en']) {
    const t = exp.translations[locale]
    lines.push(
      'insert into public.experience_translations (experience_slug, locale, period, role, company, description)',
      'values (',
      `  ${sqlString(exp.slug)}, ${sqlString(locale)}, ${sqlString(t.period)},`,
      `  ${sqlString(t.role)}, ${sqlString(t.company)}, ${sqlString(t.description)}`,
      ') on conflict (experience_slug, locale) do update set',
      '  period = excluded.period, role = excluded.role,',
      '  company = excluded.company, description = excluded.description;',
    )
  }
  lines.push('')
}

for (const edu of snapshot.education) {
  lines.push(
    'insert into public.education_entries (slug, sort_order, is_completed, published)',
    `values (${sqlString(edu.slug)}, ${edu.sortOrder}, ${edu.isCompleted}, true)`,
    'on conflict (slug) do update set',
    '  sort_order = excluded.sort_order, is_completed = excluded.is_completed, published = true;',
  )
  for (const locale of ['fr', 'en']) {
    const t = edu.translations[locale]
    lines.push(
      'insert into public.education_translations (education_slug, locale, period_label, title, description, institution)',
      'values (',
      `  ${sqlString(edu.slug)}, ${sqlString(locale)}, ${sqlString(t.periodLabel)},`,
      `  ${sqlString(t.title)}, ${sqlString(t.description)}, ${sqlString(t.institution)}`,
      ') on conflict (education_slug, locale) do update set',
      '  period_label = excluded.period_label, title = excluded.title,',
      '  description = excluded.description, institution = excluded.institution;',
    )
  }
  lines.push('')
}

for (const item of snapshot.interests) {
  lines.push(
    'insert into public.interests (slug, icon_key, sort_order, published)',
    `values (${sqlString(item.slug)}, ${sqlString(item.iconKey)}, ${item.sortOrder}, true)`,
    'on conflict (slug) do update set',
    '  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;',
  )
  for (const locale of ['fr', 'en']) {
    const t = item.translations[locale]
    lines.push(
      'insert into public.interest_translations (interest_slug, locale, label)',
      `values (${sqlString(item.slug)}, ${sqlString(locale)}, ${sqlString(t.label)})`,
      'on conflict (interest_slug, locale) do update set label = excluded.label;',
    )
  }
  lines.push('')
}

for (const link of snapshot.socialLinks) {
  lines.push(
    'insert into public.social_links (slug, label, href, handle, icon_key, sort_order, published)',
    'values (',
    `  ${sqlString(link.slug)}, ${sqlString(link.label)}, ${sqlString(link.href)},`,
    `  ${sqlString(link.handle)}, ${sqlString(link.iconKey)}, ${link.sortOrder}, true`,
    ') on conflict (slug) do update set',
    '  label = excluded.label, href = excluded.href, handle = excluded.handle,',
    '  icon_key = excluded.icon_key, sort_order = excluded.sort_order, published = true;',
  )
}
lines.push('')

for (const lang of snapshot.spokenLanguages) {
  lines.push(
    'insert into public.spoken_languages (slug, flag_emoji, sort_order, published)',
    `values (${sqlString(lang.slug)}, ${sqlString(lang.flagEmoji)}, ${lang.sortOrder}, true)`,
    'on conflict (slug) do update set',
    '  flag_emoji = excluded.flag_emoji, sort_order = excluded.sort_order, published = true;',
  )
  for (const locale of ['fr', 'en']) {
    const t = lang.translations[locale]
    lines.push(
      'insert into public.spoken_language_translations (language_slug, locale, name, level)',
      `values (${sqlString(lang.slug)}, ${sqlString(locale)}, ${sqlString(t.name)}, ${sqlString(t.level)})`,
      'on conflict (language_slug, locale) do update set',
      '  name = excluded.name, level = excluded.level;',
    )
  }
  lines.push('')
}

lines.push('commit;', '')

const outPath = join(root, 'supabase/scripts/refresh-cms-from-snapshot.sql')
writeFileSync(outPath, lines.join('\n'), 'utf8')
console.log(`✓ SQL généré : ${outPath}`)
console.log(`  Profil, ${snapshot.projects.length} projets, ${snapshot.skillCategories.length} catégories skills, ${snapshot.experiences.length} expériences`)
