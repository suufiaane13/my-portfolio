import { getSupabase } from '@/lib/supabase'
import { withTimeout } from '@/lib/withTimeout'
import type { Locale } from '@/i18n/types'
import type { PortfolioContent } from '@/types/portfolio'

const FETCH_TIMEOUT_MS = 12_000

type ProjectRow = {
  slug: string
  tags: string[]
  image_url: string
  github_url: string | null
  demo_url: string | null
  featured: boolean
  year: number
  sort_order: number
  title: string
  description: string
  long_description: string
}

type SkillRow = {
  category_slug: string
  category_sort_order: number
  locale: string
  category_title: string
  category_description: string
  skill_name: string
  skill_sort_order: number
  is_core: boolean
}

type ExperienceRow = {
  slug: string
  sort_order: number
  technologies: string[]
  is_current: boolean
  project_slug: string | null
  period: string
  role: string
  company: string
  description: string
}

type EducationRow = {
  slug: string
  sort_order: number
  is_completed: boolean
  period_label: string
  title: string
  description: string
  institution: string
}

type InterestRow = {
  slug: string
  icon_key: string
  sort_order: number
  label: string
}

type ExpertiseRow = {
  slug: string
  icon_key: string
  sort_order: number
  title: string
  description: string
}

type ProfileRow = {
  name: string
  avatar_url: string
  logo_url: string
  cv_url: string
  cv_filename: string
  github_url: string
  github_handle: string
  public_repos: number
  member_since: number
  email: string
  whatsapp: string
  whatsapp_href: string
  address: string
  title: string
  tagline: string
  availability: string
  bio_paragraph_1: string
  bio_paragraph_2: string
}

type SocialLinkRow = {
  slug: string
  label: string
  href: string
  handle: string
  icon_key: string
  sort_order: number
}

type SpokenLanguageRow = {
  slug: string
  flag_emoji: string
  sort_order: number
  spoken_language_translations: { locale: string; name: string; level: string }[]
}

function groupSkills(rows: SkillRow[]) {
  const map = new Map<string, PortfolioContent['skillCategories'][number]>()

  for (const row of rows) {
    const existing = map.get(row.category_slug)
    if (!existing) {
      map.set(row.category_slug, {
        slug: row.category_slug,
        sortOrder: row.category_sort_order,
        title: row.category_title,
        description: row.category_description,
        skills: [{ name: row.skill_name, isCore: row.is_core }],
      })
      continue
    }

    existing.skills.push({ name: row.skill_name, isCore: row.is_core })
  }

  return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function fetchPortfolioContent(locale: Locale): Promise<PortfolioContent | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const fetchAll = Promise.all([
    supabase.from('v_projects_i18n').select('*').eq('locale', locale).order('sort_order'),
    supabase.from('v_skills_i18n').select('*').eq('locale', locale),
    supabase.from('v_experiences_i18n').select('*').eq('locale', locale).order('sort_order'),
    supabase.from('v_education_i18n').select('*').eq('locale', locale).order('sort_order'),
    supabase.from('v_interests_i18n').select('*').eq('locale', locale).order('sort_order'),
    supabase.from('v_expertise_i18n').select('*').eq('locale', locale).order('sort_order'),
    supabase.from('v_profile_i18n').select('*').eq('locale', locale).maybeSingle(),
    supabase.from('social_links').select('*').eq('published', true).order('sort_order'),
    supabase
      .from('spoken_languages')
      .select('slug, flag_emoji, sort_order, spoken_language_translations(locale, name, level)')
      .eq('published', true)
      .order('sort_order'),
  ])

  let results: Awaited<typeof fetchAll>
  try {
    results = await withTimeout(fetchAll, FETCH_TIMEOUT_MS)
  } catch (error) {
    console.warn('[portfolio] Supabase fetch timed out or failed:', error)
    return null
  }

  const [
    projectsRes,
    skillsRes,
    experiencesRes,
    educationRes,
    interestsRes,
    expertiseRes,
    profileRes,
    socialRes,
    spokenRes,
  ] = results

  const firstError =
    projectsRes.error ??
    skillsRes.error ??
    experiencesRes.error ??
    educationRes.error ??
    interestsRes.error ??
    expertiseRes.error ??
    profileRes.error ??
    socialRes.error ??
    spokenRes.error

  if (firstError) {
    console.warn('[portfolio] Supabase fetch failed:', firstError.message)
    return null
  }

  if (!profileRes.data) return null

  // Incomplete CMS seed → keep static fallback (avoid empty projects/skills in prod)
  const projectCount = (projectsRes.data as ProjectRow[] | null)?.length ?? 0
  const skillCount = (skillsRes.data as SkillRow[] | null)?.length ?? 0
  if (projectCount === 0 || skillCount === 0) {
    console.warn('[portfolio] Supabase CMS incomplete (projects/skills empty) — using static content')
    return null
  }

  const projects = (projectsRes.data as ProjectRow[]).map((row) => ({
    slug: row.slug,
    tags: row.tags,
    imageUrl: row.image_url,
    githubUrl: row.github_url ?? undefined,
    demoUrl: row.demo_url ?? undefined,
    featured: row.featured,
    year: row.year,
    sortOrder: row.sort_order,
    title: row.title,
    description: row.description,
    longDescription: row.long_description,
  }))

  const skillCategories = groupSkills(skillsRes.data as SkillRow[])
  const coreStack = skillCategories
    .flatMap((category) => category.skills)
    .filter((skill) => skill.isCore)
    .map((skill) => skill.name)

  const profileRow = profileRes.data as ProfileRow

  return {
    source: 'supabase',
    profile: {
      name: profileRow.name,
      avatarUrl: profileRow.avatar_url,
      logoUrl: profileRow.logo_url,
      cvUrl: profileRow.cv_url,
      cvFilename: profileRow.cv_filename || 'CV_Soufiane_HAJJI.pdf',
      githubUrl: profileRow.github_url,
      githubHandle: profileRow.github_handle,
      publicRepos: profileRow.public_repos,
      memberSince: profileRow.member_since,
      title: profileRow.title,
      tagline: profileRow.tagline,
      availability: profileRow.availability,
      bio: [profileRow.bio_paragraph_1, profileRow.bio_paragraph_2],
      email: profileRow.email,
      whatsapp: profileRow.whatsapp,
      whatsappHref: profileRow.whatsapp_href,
      address: profileRow.address,
    },
    socialLinks: (socialRes.data as SocialLinkRow[]).map((row) => ({
      slug: row.slug,
      label: row.label,
      href: row.href,
      handle: row.handle,
      iconKey: row.icon_key,
      sortOrder: row.sort_order,
    })),
    spokenLanguages: (spokenRes.data as SpokenLanguageRow[])
      .map((row) => {
        const translation = row.spoken_language_translations.find((t) => t.locale === locale)
        if (!translation) return null
        return {
          slug: row.slug,
          flagEmoji: row.flag_emoji,
          sortOrder: row.sort_order,
          name: translation.name,
          level: translation.level,
        }
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    projects,
    skillCategories,
    coreStack,
    experiences: (experiencesRes.data as ExperienceRow[]).map((row) => ({
      slug: row.slug,
      sortOrder: row.sort_order,
      technologies: row.technologies,
      isCurrent: row.is_current,
      projectSlug: row.project_slug ?? undefined,
      period: row.period,
      role: row.role,
      company: row.company,
      description: row.description,
    })),
    education: (educationRes.data as EducationRow[]).map((row) => ({
      slug: row.slug,
      sortOrder: row.sort_order,
      isCompleted: row.is_completed,
      periodLabel: row.period_label,
      title: row.title,
      description: row.description,
      institution: row.institution,
    })),
    interests: (interestsRes.data as InterestRow[]).map((row) => ({
      slug: row.slug,
      iconKey: row.icon_key,
      sortOrder: row.sort_order,
      label: row.label,
    })),
    expertise: (expertiseRes.data as ExpertiseRow[]).map((row) => ({
      slug: row.slug,
      iconKey: row.icon_key,
      sortOrder: row.sort_order,
      title: row.title,
      description: row.description,
    })),
  }
}
