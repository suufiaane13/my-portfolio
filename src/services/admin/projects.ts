import { getSupabase } from '@/lib/supabase'
import type { AdminProject } from '@/types/adminContent'

function mapProject(
  row: Record<string, unknown>,
  translations: Record<string, AdminProject['translations']['fr']>,
): AdminProject {
  return {
    slug: row.slug as string,
    tags: (row.tags as string[]) ?? [],
    imageUrl: row.image_url as string,
    githubUrl: (row.github_url as string | null) ?? null,
    demoUrl: (row.demo_url as string | null) ?? null,
    featured: Boolean(row.featured),
    year: row.year as number,
    sortOrder: row.sort_order as number,
    published: Boolean(row.published),
    translations: {
      fr: translations.fr ?? { title: '', description: '', longDescription: '' },
      en: translations.en ?? { title: '', description: '', longDescription: '' },
    },
  }
}

export async function fetchAdminProjects(): Promise<AdminProject[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const [{ data: projects, error: pErr }, { data: trans, error: tErr }] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('project_translations').select('*'),
  ])

  if (pErr || tErr || !projects) {
    console.error('[admin] fetch projects failed', pErr ?? tErr)
    return []
  }

  const transMap = new Map<string, Record<string, AdminProject['translations']['fr']>>()
  for (const row of trans ?? []) {
    const slug = row.project_slug as string
    const locale = row.locale as string
    if (!transMap.has(slug)) transMap.set(slug, {})
    transMap.get(slug)![locale] = {
      title: row.title as string,
      description: row.description as string,
      longDescription: row.long_description as string,
    }
  }

  return projects.map((row) => mapProject(row, transMap.get(row.slug as string) ?? {}))
}

export async function updateAdminProject(project: AdminProject): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error: pErr } = await supabase
    .from('projects')
    .update({
      tags: project.tags,
      image_url: project.imageUrl,
      github_url: project.githubUrl,
      demo_url: project.demoUrl,
      featured: project.featured,
      year: project.year,
      sort_order: project.sortOrder,
      published: project.published,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', project.slug)

  if (pErr) {
    console.error('[admin] update project failed', pErr)
    return false
  }

  for (const locale of ['fr', 'en'] as const) {
    const t = project.translations[locale]
    const { error } = await supabase.from('project_translations').upsert({
      project_slug: project.slug,
      locale,
      title: t.title,
      description: t.description,
      long_description: t.longDescription,
    })
    if (error) {
      console.error('[admin] upsert project translation failed', error)
      return false
    }
  }

  return true
}

export function createEmptyProject(sortOrder: number): AdminProject {
  return {
    slug: '',
    tags: [],
    imageUrl: '/placeholder-project.svg',
    githubUrl: null,
    demoUrl: null,
    featured: false,
    year: new Date().getFullYear(),
    sortOrder,
    published: false,
    translations: {
      fr: { title: 'Nouveau projet', description: 'Description courte', longDescription: 'Description détaillée du projet.' },
      en: { title: 'New project', description: 'Short description', longDescription: 'Detailed project description.' },
    },
  }
}

export async function createAdminProject(project: AdminProject): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase || !project.slug.trim()) return null

  const slug = project.slug.trim().toLowerCase().replace(/\s+/g, '-')

  const { error: pErr } = await supabase.from('projects').insert({
    slug,
    tags: project.tags,
    image_url: project.imageUrl,
    github_url: project.githubUrl,
    demo_url: project.demoUrl,
    featured: project.featured,
    year: project.year,
    sort_order: project.sortOrder,
    published: project.published,
  })

  if (pErr) {
    console.error('[admin] create project failed', pErr)
    return null
  }

  for (const locale of ['fr', 'en'] as const) {
    const t = project.translations[locale]
    const { error } = await supabase.from('project_translations').insert({
      project_slug: slug,
      locale,
      title: t.title,
      description: t.description,
      long_description: t.longDescription,
    })
    if (error) {
      console.error('[admin] create project translation failed', error)
      await supabase.from('projects').delete().eq('slug', slug)
      return null
    }
  }

  return slug
}

export async function deleteAdminProject(slug: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('projects').delete().eq('slug', slug)
  if (error) {
    console.error('[admin] delete project failed', error)
    return false
  }
  return true
}

export async function toggleProjectPublished(slug: string, published: boolean): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from('projects')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('slug', slug)
  return !error
}
