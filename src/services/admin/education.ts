import { getSupabase } from '@/lib/supabase'
import type { AdminEducation } from '@/types/adminContent'

export async function fetchAdminEducation(): Promise<AdminEducation[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const [{ data: rows, error: rErr }, { data: trans, error: tErr }] = await Promise.all([
    supabase.from('education_entries').select('*').order('sort_order'),
    supabase.from('education_translations').select('*'),
  ])

  if (rErr || tErr || !rows) return []

  const transMap = new Map<string, Record<string, AdminEducation['translations']['fr']>>()
  for (const row of trans ?? []) {
    const slug = row.education_slug as string
    const locale = row.locale as string
    if (!transMap.has(slug)) transMap.set(slug, {})
    transMap.get(slug)![locale] = {
      periodLabel: row.period_label as string,
      title: row.title as string,
      description: row.description as string,
      institution: row.institution as string,
    }
  }

  return rows.map((row) => ({
    slug: row.slug as string,
    sortOrder: row.sort_order as number,
    isCompleted: Boolean(row.is_completed),
    published: Boolean(row.published),
    translations: {
      fr: transMap.get(row.slug as string)?.fr ?? {
        periodLabel: '',
        title: '',
        description: '',
        institution: '',
      },
      en: transMap.get(row.slug as string)?.en ?? {
        periodLabel: '',
        title: '',
        description: '',
        institution: '',
      },
    },
  }))
}

export async function updateAdminEducation(item: AdminEducation): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error: eErr } = await supabase
    .from('education_entries')
    .update({
      sort_order: item.sortOrder,
      is_completed: item.isCompleted,
      published: item.published,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', item.slug)

  if (eErr) return false

  for (const locale of ['fr', 'en'] as const) {
    const t = item.translations[locale]
    const { error } = await supabase.from('education_translations').upsert({
      education_slug: item.slug,
      locale,
      period_label: t.periodLabel,
      title: t.title,
      description: t.description,
      institution: t.institution,
    })
    if (error) return false
  }

  return true
}

export async function toggleEducationPublished(slug: string, published: boolean): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from('education_entries')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('slug', slug)
  return !error
}

export function createEmptyEducation(sortOrder: number): AdminEducation {
  return {
    slug: '',
    sortOrder,
    isCompleted: true,
    published: false,
    translations: {
      fr: {
        periodLabel: '2024 — 2026',
        title: 'Nouvelle formation',
        description: 'Description du cursus.',
        institution: 'Établissement',
      },
      en: {
        periodLabel: '2024 — 2026',
        title: 'New degree',
        description: 'Program description.',
        institution: 'Institution',
      },
    },
  }
}

export async function createAdminEducation(item: AdminEducation): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase || !item.slug.trim()) return null

  const slug = item.slug.trim().toLowerCase().replace(/\s+/g, '-')

  const { error: eErr } = await supabase.from('education_entries').insert({
    slug,
    sort_order: item.sortOrder,
    is_completed: item.isCompleted,
    published: item.published,
  })

  if (eErr) {
    console.error('[admin] create education failed', eErr)
    return null
  }

  for (const locale of ['fr', 'en'] as const) {
    const t = item.translations[locale]
    const { error } = await supabase.from('education_translations').insert({
      education_slug: slug,
      locale,
      period_label: t.periodLabel,
      title: t.title,
      description: t.description,
      institution: t.institution,
    })
    if (error) {
      console.error('[admin] create education translation failed', error)
      await supabase.from('education_entries').delete().eq('slug', slug)
      return null
    }
  }

  return slug
}

export async function deleteAdminEducation(slug: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('education_entries').delete().eq('slug', slug)
  if (error) {
    console.error('[admin] delete education failed', error)
    return false
  }
  return true
}
