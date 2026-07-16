import { getSupabase } from '@/lib/supabase'
import type { AdminExperience } from '@/types/adminContent'

export async function fetchAdminExperiences(): Promise<AdminExperience[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const [{ data: rows, error: rErr }, { data: trans, error: tErr }] = await Promise.all([
    supabase.from('experiences').select('*').order('sort_order'),
    supabase.from('experience_translations').select('*'),
  ])

  if (rErr || tErr || !rows) return []

  const transMap = new Map<string, Record<string, AdminExperience['translations']['fr']>>()
  for (const row of trans ?? []) {
    const slug = row.experience_slug as string
    const locale = row.locale as string
    if (!transMap.has(slug)) transMap.set(slug, {})
    transMap.get(slug)![locale] = {
      period: row.period as string,
      role: row.role as string,
      company: row.company as string,
      description: row.description as string,
    }
  }

  return rows.map((row) => ({
    slug: row.slug as string,
    sortOrder: row.sort_order as number,
    technologies: (row.technologies as string[]) ?? [],
    isCurrent: Boolean(row.is_current),
    projectSlug: (row.project_slug as string | null) ?? null,
    published: Boolean(row.published),
    translations: {
      fr: transMap.get(row.slug as string)?.fr ?? {
        period: '',
        role: '',
        company: '',
        description: '',
      },
      en: transMap.get(row.slug as string)?.en ?? {
        period: '',
        role: '',
        company: '',
        description: '',
      },
    },
  }))
}

export async function updateAdminExperience(item: AdminExperience): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error: eErr } = await supabase
    .from('experiences')
    .update({
      sort_order: item.sortOrder,
      technologies: item.technologies,
      is_current: item.isCurrent,
      project_slug: item.projectSlug,
      published: item.published,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', item.slug)

  if (eErr) return false

  for (const locale of ['fr', 'en'] as const) {
    const t = item.translations[locale]
    const { error } = await supabase.from('experience_translations').upsert({
      experience_slug: item.slug,
      locale,
      period: t.period,
      role: t.role,
      company: t.company,
      description: t.description,
    })
    if (error) return false
  }

  return true
}

export async function toggleExperiencePublished(slug: string, published: boolean): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from('experiences')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('slug', slug)
  return !error
}

export function createEmptyExperience(sortOrder: number): AdminExperience {
  return {
    slug: '',
    sortOrder,
    technologies: [],
    isCurrent: false,
    projectSlug: null,
    published: false,
    translations: {
      fr: {
        period: '2024 — Présent',
        role: 'Nouveau poste',
        company: 'Entreprise',
        description: 'Description du poste et des missions.',
      },
      en: {
        period: '2024 — Present',
        role: 'New role',
        company: 'Company',
        description: 'Role description and responsibilities.',
      },
    },
  }
}

export async function createAdminExperience(item: AdminExperience): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase || !item.slug.trim()) return null

  const slug = item.slug.trim().toLowerCase().replace(/\s+/g, '-')

  const { error: eErr } = await supabase.from('experiences').insert({
    slug,
    sort_order: item.sortOrder,
    technologies: item.technologies,
    is_current: item.isCurrent,
    project_slug: item.projectSlug,
    published: item.published,
  })

  if (eErr) {
    console.error('[admin] create experience failed', eErr)
    return null
  }

  for (const locale of ['fr', 'en'] as const) {
    const t = item.translations[locale]
    const { error } = await supabase.from('experience_translations').insert({
      experience_slug: slug,
      locale,
      period: t.period,
      role: t.role,
      company: t.company,
      description: t.description,
    })
    if (error) {
      console.error('[admin] create experience translation failed', error)
      await supabase.from('experiences').delete().eq('slug', slug)
      return null
    }
  }

  return slug
}

export async function deleteAdminExperience(slug: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('experiences').delete().eq('slug', slug)
  if (error) {
    console.error('[admin] delete experience failed', error)
    return false
  }
  return true
}
