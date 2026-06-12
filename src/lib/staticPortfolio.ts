import { education as staticEducation } from '@/data/education'
import { experience as staticExperience } from '@/data/experience'
import { interests as staticInterests } from '@/data/interests'
import { profile as staticProfile } from '@/data/profile'
import { projects as staticProjects } from '@/data/projects'
import { skillCategories as staticSkillCategories } from '@/data/skills'
import type { Locale, Translations } from '@/i18n/types'
import type { PortfolioContent } from '@/types/portfolio'

const interestIconKeys: Record<string, string> = {
  swimming: 'waves',
  chess: 'crown',
  travel: 'plane',
}

const expertiseIconKeys = ['code', 'database', 'smartphone', 'globe']

export function buildStaticPortfolio(_locale: Locale, t: Translations): PortfolioContent {
  const experienceKeyMap: Record<string, keyof typeof t.experience.items> = {
    freelance: 'freelance',
    'pure-power': 'purePower',
    cmfp: 'cmfp',
  }

  return {
    source: 'static',
    profile: {
      name: staticProfile.name,
      avatarUrl: staticProfile.avatar,
      logoUrl: staticProfile.logo,
      cvUrl: staticProfile.cvUrl,
      githubUrl: staticProfile.github,
      githubHandle: staticProfile.githubHandle,
      publicRepos: staticProfile.stats.publicRepos,
      memberSince: staticProfile.stats.memberSince,
      title: t.profile.title,
      tagline: t.profile.tagline,
      availability: staticProfile.availability,
      bio: t.profile.bio,
    },
    projects: staticProjects.map((project, index) => {
      const copy = t.projects.items[project.id]
      return {
        slug: project.id,
        tags: [...project.tags],
        imageUrl: project.image,
        githubUrl: project.github,
        demoUrl: project.demo,
        featured: project.featured,
        year: project.year,
        sortOrder: index + 1,
        title: copy.title,
        description: copy.description,
        longDescription: copy.longDescription,
      }
    }),
    skillCategories: staticSkillCategories.map((category, index) => {
      const copy = t.skills.categories[category.key]
      return {
        slug: category.key,
        sortOrder: index + 1,
        title: copy.title,
        description: copy.description,
        skills: category.skills.map((name) => ({
          name,
          isCore: ['React', 'TypeScript', 'Laravel', 'Kotlin', 'Supabase', 'Docker'].includes(name),
        })),
      }
    }),
    coreStack: ['React', 'TypeScript', 'Laravel', 'Kotlin', 'Supabase', 'Docker'],
    experiences: staticExperience.map((item, index) => {
      const i18nKey = experienceKeyMap[item.key] ?? item.key
      const copy = t.experience.items[i18nKey as keyof typeof t.experience.items]
      return {
        slug: item.key === 'purePower' ? 'pure-power' : item.key,
        sortOrder: index + 1,
        technologies: [...item.technologies],
        isCurrent: Boolean(item.current),
        projectSlug: item.projectId,
        period: copy.period,
        role: copy.role,
        company: copy.company,
        description: copy.description,
      }
    }),
    education: staticEducation.map((item, index) => {
      const copy = t.education.items[item.key]
      return {
        slug: item.key,
        sortOrder: index + 1,
        isCompleted: item.key === 'bac',
        periodLabel: copy.year,
        title: copy.title,
        description: copy.description,
        institution: copy.institution,
      }
    }),
    interests: staticInterests.map((item, index) => ({
      slug: item.key,
      iconKey: interestIconKeys[item.key] ?? 'waves',
      sortOrder: index + 1,
      label: t.interests[item.key],
    })),
    expertise: t.profile.expertise.map((item, index) => ({
      slug: `expertise-${index}`,
      iconKey: expertiseIconKeys[index] ?? 'code',
      sortOrder: index + 1,
      title: item.title,
      description: item.description,
    })),
  }
}
