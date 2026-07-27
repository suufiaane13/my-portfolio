import { getSupabase } from '@/lib/supabase'
import type { AdminSkillCategory } from '@/types/adminContent'

export async function fetchAdminSkillCategories(): Promise<AdminSkillCategory[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const [
    { data: categories, error: cErr },
    { data: catTrans, error: ctErr },
    { data: skills, error: sErr },
  ] = await Promise.all([
    supabase.from('skill_categories').select('*').order('sort_order'),
    supabase.from('skill_category_translations').select('*'),
    supabase.from('skills').select('*').order('sort_order'),
  ])

  if (cErr || ctErr || sErr || !categories) return []

  const transMap = new Map<string, Record<string, { title: string; description: string }>>()
  for (const row of catTrans ?? []) {
    const slug = row.category_slug as string
    const locale = row.locale as string
    if (!transMap.has(slug)) transMap.set(slug, {})
    transMap.get(slug)![locale] = {
      title: row.title as string,
      description: row.description as string,
    }
  }

  const skillsByCategory = new Map<string, AdminSkillCategory['skills']>()
  for (const row of skills ?? []) {
    const slug = row.category_slug as string
    if (!skillsByCategory.has(slug)) skillsByCategory.set(slug, [])
    skillsByCategory.get(slug)!.push({
      id: row.id as string,
      name: row.name as string,
      sortOrder: row.sort_order as number,
      isCore: Boolean(row.is_core),
      published: Boolean(row.published),
    })
  }

  return categories.map((row) => ({
    slug: row.slug as string,
    sortOrder: row.sort_order as number,
    published: Boolean(row.published),
    translations: {
      fr: transMap.get(row.slug as string)?.fr ?? { title: '', description: '' },
      en: transMap.get(row.slug as string)?.en ?? { title: '', description: '' },
    },
    skills: skillsByCategory.get(row.slug as string) ?? [],
  }))
}

export async function updateAdminSkillCategory(category: AdminSkillCategory): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error: cErr } = await supabase
    .from('skill_categories')
    .update({
      sort_order: category.sortOrder,
      published: category.published,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', category.slug)

  if (cErr) return false

  for (const locale of ['fr', 'en'] as const) {
    const t = category.translations[locale]
    const { error } = await supabase.from('skill_category_translations').upsert({
      category_slug: category.slug,
      locale,
      title: t.title,
      description: t.description,
    })
    if (error) return false
  }

  return true
}

export async function updateAdminSkill(
  categorySlug: string,
  skill: AdminSkillCategory['skills'][number],
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase
    .from('skills')
    .update({
      name: skill.name,
      sort_order: skill.sortOrder,
      is_core: skill.isCore,
      published: skill.published,
    })
    .eq('id', skill.id)
    .eq('category_slug', categorySlug)

  return !error
}

export async function toggleSkillCategoryPublished(slug: string, published: boolean): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from('skill_categories')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('slug', slug)
  return !error
}

export function createEmptySkillCategory(sortOrder: number): AdminSkillCategory {
  return {
    slug: '',
    sortOrder,
    published: false,
    translations: {
      fr: { title: 'Nouvelle catégorie', description: 'Description de la catégorie.' },
      en: { title: 'New category', description: 'Category description.' },
    },
    skills: [],
  }
}

export async function createAdminSkillCategory(category: AdminSkillCategory): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase || !category.slug.trim()) return null

  const slug = category.slug.trim().toLowerCase().replace(/\s+/g, '-')

  const { error: cErr } = await supabase.from('skill_categories').insert({
    slug,
    sort_order: category.sortOrder,
    published: category.published,
  })

  if (cErr) {
    console.error('[admin] create skill category failed', cErr)
    return null
  }

  for (const locale of ['fr', 'en'] as const) {
    const t = category.translations[locale]
    const { error } = await supabase.from('skill_category_translations').insert({
      category_slug: slug,
      locale,
      title: t.title,
      description: t.description,
    })
    if (error) {
      console.error('[admin] create skill category translation failed', error)
      await supabase.from('skill_categories').delete().eq('slug', slug)
      return null
    }
  }

  return slug
}

export async function deleteAdminSkillCategory(slug: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('skill_categories').delete().eq('slug', slug)
  if (error) {
    console.error('[admin] delete skill category failed', error)
    return false
  }
  return true
}

export function createEmptySkill(sortOrder: number): AdminSkillCategory['skills'][number] {
  return {
    id: crypto.randomUUID(),
    name: 'Nouvelle compétence',
    sortOrder,
    isCore: false,
    published: true,
  }
}

export async function createAdminSkill(
  categorySlug: string,
  skill: AdminSkillCategory['skills'][number],
): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase || !skill.name.trim()) return null

  const { error } = await supabase.from('skills').insert({
    id: skill.id,
    category_slug: categorySlug,
    name: skill.name.trim(),
    sort_order: skill.sortOrder,
    is_core: skill.isCore,
    published: skill.published,
  })

  if (error) {
    console.error('[admin] create skill failed', error)
    return null
  }

  return skill.id
}

export async function deleteAdminSkill(skillId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('skills').delete().eq('id', skillId)
  if (error) {
    console.error('[admin] delete skill failed', error)
    return false
  }
  return true
}
