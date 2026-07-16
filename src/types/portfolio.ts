export interface PortfolioProject {
  slug: string
  tags: string[]
  imageUrl: string
  githubUrl?: string
  demoUrl?: string
  featured: boolean
  year: number
  sortOrder: number
  title: string
  description: string
  longDescription: string
}

export interface PortfolioSkill {
  name: string
  isCore: boolean
}

export interface SkillCategoryContent {
  slug: string
  sortOrder: number
  title: string
  description: string
  skills: PortfolioSkill[]
}

export interface ExperienceContent {
  slug: string
  sortOrder: number
  technologies: string[]
  isCurrent: boolean
  projectSlug?: string
  period: string
  role: string
  company: string
  description: string
}

export interface EducationContent {
  slug: string
  sortOrder: number
  isCompleted: boolean
  periodLabel: string
  title: string
  description: string
  institution: string
}

export interface InterestContent {
  slug: string
  iconKey: string
  sortOrder: number
  label: string
}

export interface ExpertiseContent {
  slug: string
  iconKey: string
  sortOrder: number
  title: string
  description: string
}

export interface ProfileContent {
  name: string
  avatarUrl: string
  logoUrl: string
  cvUrl: string
  githubUrl: string
  githubHandle: string
  publicRepos: number
  memberSince: number
  title: string
  tagline: string
  availability: string
  bio: [string, string]
  email: string
  whatsapp: string
  whatsappHref: string
  address: string
}

export interface SocialLinkContent {
  slug: string
  label: string
  href: string
  handle: string
  iconKey: string
  sortOrder: number
}

export interface SpokenLanguageContent {
  slug: string
  flagEmoji: string
  sortOrder: number
  name: string
  level: string
}

export interface PortfolioContent {
  projects: PortfolioProject[]
  skillCategories: SkillCategoryContent[]
  coreStack: string[]
  experiences: ExperienceContent[]
  education: EducationContent[]
  interests: InterestContent[]
  expertise: ExpertiseContent[]
  profile: ProfileContent
  socialLinks: SocialLinkContent[]
  spokenLanguages: SpokenLanguageContent[]
  source: 'supabase' | 'static'
}
