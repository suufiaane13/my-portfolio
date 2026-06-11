export type ExperienceKey = 'freelance' | 'purePower' | 'cmfp'

export interface ExperienceItem {
  key: ExperienceKey
  technologies: string[]
  current?: boolean
  projectId?: 'pure-power-menu'
}

export const experience: ExperienceItem[] = [
  {
    key: 'freelance',
    technologies: ['React', 'TypeScript', 'Laravel', 'Supabase', 'Kotlin', 'Docker'],
    current: true,
  },
  {
    key: 'purePower',
    technologies: ['React', 'TypeScript', 'Tailwind CSS v4', 'Vite'],
    projectId: 'pure-power-menu',
  },
  {
    key: 'cmfp',
    technologies: ['PHP', 'Laravel', 'Blade', 'MySQL', 'Git'],
  },
]
