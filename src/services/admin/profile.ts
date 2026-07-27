import { getSupabase } from '@/lib/supabase'
import type { AdminProfile } from '@/types/adminContent'

export async function fetchAdminProfile(): Promise<AdminProfile | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const [
    { data: profile, error: pErr },
    { data: profileTrans },
    { data: expertise },
    { data: expertiseTrans },
    { data: interests },
    { data: interestTrans },
    { data: spokenLanguages },
    { data: spokenLanguageTrans },
    { data: social },
  ] = await Promise.all([
    supabase.from('site_profile').select('*').eq('id', 'main').maybeSingle(),
    supabase.from('site_profile_translations').select('*').eq('profile_id', 'main'),
    supabase.from('expertise_items').select('*').order('sort_order'),
    supabase.from('expertise_translations').select('*'),
    supabase.from('interests').select('*').order('sort_order'),
    supabase.from('interest_translations').select('*'),
    supabase.from('spoken_languages').select('*').order('sort_order'),
    supabase.from('spoken_language_translations').select('*'),
    supabase.from('social_links').select('*').order('sort_order'),
  ])

  if (pErr || !profile) return null

  const profTrans: Record<string, AdminProfile['translations']['fr']> = {}
  for (const row of profileTrans ?? []) {
    profTrans[row.locale as string] = {
      title: row.title as string,
      tagline: row.tagline as string,
      availability: row.availability as string,
      bio1: row.bio_paragraph_1 as string,
      bio2: row.bio_paragraph_2 as string,
    }
  }

  const expTransMap = new Map<string, Record<string, { title: string; description: string }>>()
  for (const row of expertiseTrans ?? []) {
    const slug = row.expertise_slug as string
    if (!expTransMap.has(slug)) expTransMap.set(slug, {})
    expTransMap.get(slug)![row.locale as string] = {
      title: row.title as string,
      description: row.description as string,
    }
  }

  const intTransMap = new Map<string, Record<string, { label: string }>>()
  for (const row of interestTrans ?? []) {
    const slug = row.interest_slug as string
    if (!intTransMap.has(slug)) intTransMap.set(slug, {})
    intTransMap.get(slug)![row.locale as string] = { label: row.label as string }
  }

  const langTransMap = new Map<string, Record<string, { name: string; level: string }>>()
  for (const row of spokenLanguageTrans ?? []) {
    const slug = row.language_slug as string
    if (!langTransMap.has(slug)) langTransMap.set(slug, {})
    langTransMap.get(slug)![row.locale as string] = {
      name: row.name as string,
      level: row.level as string,
    }
  }

  return {
    id: profile.id as string,
    name: profile.name as string,
    avatarUrl: profile.avatar_url as string,
    logoUrl: profile.logo_url as string,
    cvUrl: profile.cv_url as string,
    cvFilename: profile.cv_filename as string,
    githubUrl: profile.github_url as string,
    githubHandle: profile.github_handle as string,
    publicRepos: profile.public_repos as number,
    memberSince: profile.member_since as number,
    email: (profile.email as string | null) ?? null,
    whatsapp: (profile.whatsapp as string | null) ?? null,
    whatsappHref: (profile.whatsapp_href as string | null) ?? null,
    address: (profile.address as string | null) ?? null,
    published: Boolean(profile.published),
    translations: {
      fr: profTrans.fr ?? { title: '', tagline: '', availability: '', bio1: '', bio2: '' },
      en: profTrans.en ?? { title: '', tagline: '', availability: '', bio1: '', bio2: '' },
    },
    expertise: (expertise ?? []).map((row) => ({
      slug: row.slug as string,
      iconKey: row.icon_key as string,
      sortOrder: row.sort_order as number,
      published: Boolean(row.published),
      translations: {
        fr: expTransMap.get(row.slug as string)?.fr ?? { title: '', description: '' },
        en: expTransMap.get(row.slug as string)?.en ?? { title: '', description: '' },
      },
    })),
    interests: (interests ?? []).map((row) => ({
      slug: row.slug as string,
      iconKey: row.icon_key as string,
      sortOrder: row.sort_order as number,
      published: Boolean(row.published),
      translations: {
        fr: intTransMap.get(row.slug as string)?.fr ?? { label: '' },
        en: intTransMap.get(row.slug as string)?.en ?? { label: '' },
      },
    })),
    spokenLanguages: (spokenLanguages ?? []).map((row) => ({
      slug: row.slug as string,
      flagEmoji: row.flag_emoji as string,
      sortOrder: row.sort_order as number,
      published: Boolean(row.published),
      translations: {
        fr: langTransMap.get(row.slug as string)?.fr ?? { name: '', level: '' },
        en: langTransMap.get(row.slug as string)?.en ?? { name: '', level: '' },
      },
    })),
    socialLinks: (social ?? []).map((row) => ({
      slug: row.slug as string,
      label: row.label as string,
      href: row.href as string,
      handle: row.handle as string,
      iconKey: row.icon_key as string,
      sortOrder: row.sort_order as number,
      published: Boolean(row.published),
    })),
  }
}

export async function updateAdminProfile(
  profile: AdminProfile,
  options?: {
    deletedInterestSlugs?: string[]
    deletedLanguageSlugs?: string[]
    deletedSocialSlugs?: string[]
  },
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error: pErr } = await supabase
    .from('site_profile')
    .update({
      name: profile.name,
      avatar_url: profile.avatarUrl,
      logo_url: profile.logoUrl,
      cv_url: profile.cvUrl,
      cv_filename: profile.cvFilename,
      github_url: profile.githubUrl,
      github_handle: profile.githubHandle,
      public_repos: profile.publicRepos,
      member_since: profile.memberSince,
      email: profile.email,
      whatsapp: profile.whatsapp,
      whatsapp_href: profile.whatsappHref,
      address: profile.address,
      published: profile.published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (pErr) return false

  for (const locale of ['fr', 'en'] as const) {
    const t = profile.translations[locale]
    const { error } = await supabase.from('site_profile_translations').upsert({
      profile_id: profile.id,
      locale,
      title: t.title,
      tagline: t.tagline,
      availability: t.availability,
      bio_paragraph_1: t.bio1,
      bio_paragraph_2: t.bio2,
    })
    if (error) return false
  }

  for (const slug of options?.deletedInterestSlugs ?? []) {
    await supabase.from('interests').delete().eq('slug', slug)
  }

  for (const slug of options?.deletedLanguageSlugs ?? []) {
    await supabase.from('spoken_languages').delete().eq('slug', slug)
  }

  for (const slug of options?.deletedSocialSlugs ?? []) {
    await supabase.from('social_links').delete().eq('slug', slug)
  }

  for (const item of profile.expertise) {
    await supabase
      .from('expertise_items')
      .update({ sort_order: item.sortOrder, published: item.published, icon_key: item.iconKey })
      .eq('slug', item.slug)
    for (const locale of ['fr', 'en'] as const) {
      await supabase.from('expertise_translations').upsert({
        expertise_slug: item.slug,
        locale,
        title: item.translations[locale].title,
        description: item.translations[locale].description,
      })
    }
  }

  for (const item of profile.interests) {
    const slug = item.slug.trim().toLowerCase().replace(/\s+/g, '-')
    if (!slug) return false
    const { error } = await supabase.from('interests').upsert({
      slug,
      icon_key: item.iconKey,
      sort_order: item.sortOrder,
      published: item.published,
    })
    if (error) return false
    for (const locale of ['fr', 'en'] as const) {
      const { error: tErr } = await supabase.from('interest_translations').upsert({
        interest_slug: slug,
        locale,
        label: item.translations[locale].label,
      })
      if (tErr) return false
    }
  }

  for (const item of profile.spokenLanguages) {
    const slug = item.slug.trim().toLowerCase().replace(/\s+/g, '-')
    if (!slug) return false
    const { error } = await supabase.from('spoken_languages').upsert({
      slug,
      flag_emoji: item.flagEmoji,
      sort_order: item.sortOrder,
      published: item.published,
    })
    if (error) return false
    for (const locale of ['fr', 'en'] as const) {
      const { error: tErr } = await supabase.from('spoken_language_translations').upsert({
        language_slug: slug,
        locale,
        name: item.translations[locale].name,
        level: item.translations[locale].level,
      })
      if (tErr) return false
    }
  }

  for (const link of profile.socialLinks) {
    const slug = link.slug.trim().toLowerCase().replace(/\s+/g, '-')
    if (!slug) return false
    const { error } = await supabase.from('social_links').upsert({
      slug,
      label: link.label,
      href: link.href,
      handle: link.handle,
      icon_key: link.iconKey,
      sort_order: link.sortOrder,
      published: link.published,
    })
    if (error) return false
  }

  return true
}

export function createEmptySocialLink(sortOrder: number): AdminProfile['socialLinks'][number] {
  return {
    slug: '',
    label: 'Nouveau réseau',
    href: 'https://',
    handle: '',
    iconKey: 'github',
    sortOrder,
    published: true,
  }
}

export function createEmptyInterest(sortOrder: number): AdminProfile['interests'][number] {
  return {
    slug: '',
    iconKey: 'waves',
    sortOrder,
    published: true,
    translations: {
      fr: { label: 'Nouvel intérêt' },
      en: { label: 'New interest' },
    },
  }
}

export function createEmptySpokenLanguage(sortOrder: number): AdminProfile['spokenLanguages'][number] {
  return {
    slug: '',
    flagEmoji: '🌐',
    sortOrder,
    published: true,
    translations: {
      fr: { name: 'Nouvelle langue', level: 'Intermédiaire' },
      en: { name: 'New language', level: 'Intermediate' },
    },
  }
}
