export type ExperienceKey = 'freelance' | 'purePower' | 'fsoStage'

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
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    projectId: 'pure-power-menu',
  },
  {
    key: 'fsoStage',
    technologies: ['Support IT', 'Réseaux', 'Maintenance'],
  },
]
