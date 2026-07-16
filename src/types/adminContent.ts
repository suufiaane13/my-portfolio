export type LocalePair<T> = { fr: T; en: T }

export interface AdminProject {
  slug: string
  tags: string[]
  imageUrl: string
  githubUrl: string | null
  demoUrl: string | null
  featured: boolean
  year: number
  sortOrder: number
  published: boolean
  translations: LocalePair<{
    title: string
    description: string
    longDescription: string
  }>
}

export interface AdminSkillCategory {
  slug: string
  sortOrder: number
  published: boolean
  translations: LocalePair<{ title: string; description: string }>
  skills: AdminSkill[]
}

export interface AdminSkill {
  id: string
  name: string
  sortOrder: number
  isCore: boolean
  published: boolean
}

export interface AdminExperience {
  slug: string
  sortOrder: number
  technologies: string[]
  isCurrent: boolean
  projectSlug: string | null
  published: boolean
  translations: LocalePair<{
    period: string
    role: string
    company: string
    description: string
  }>
}

export interface AdminEducation {
  slug: string
  sortOrder: number
  isCompleted: boolean
  published: boolean
  translations: LocalePair<{
    periodLabel: string
    title: string
    description: string
    institution: string
  }>
}

export interface AdminProfile {
  id: string
  name: string
  avatarUrl: string
  logoUrl: string
  cvUrl: string
  cvFilename: string
  githubUrl: string
  githubHandle: string
  publicRepos: number
  memberSince: number
  email: string | null
  whatsapp: string | null
  whatsappHref: string | null
  address: string | null
  published: boolean
  translations: LocalePair<{
    title: string
    tagline: string
    availability: string
    bio1: string
    bio2: string
  }>
  expertise: AdminExpertise[]
  interests: AdminInterest[]
  spokenLanguages: AdminSpokenLanguage[]
  socialLinks: AdminSocialLink[]
}

export interface AdminExpertise {
  slug: string
  iconKey: string
  sortOrder: number
  published: boolean
  translations: LocalePair<{ title: string; description: string }>
}

export interface AdminInterest {
  slug: string
  iconKey: string
  sortOrder: number
  published: boolean
  translations: LocalePair<{ label: string }>
}

export interface AdminSpokenLanguage {
  slug: string
  flagEmoji: string
  sortOrder: number
  published: boolean
  translations: LocalePair<{ name: string; level: string }>
}

export interface AdminSocialLink {
  slug: string
  label: string
  href: string
  handle: string
  iconKey: string
  sortOrder: number
  published: boolean
}
