export type SkillCategoryKey = 'frontend' | 'backend' | 'mobile' | 'data' | 'design'

export interface SkillCategory {
  key: SkillCategoryKey
  skills: string[]
}

export const skillCategories: SkillCategory[] = [
  {
    key: 'frontend',
    skills: [
      'HTML5',
      'CSS3',
      'JavaScript',
      'TypeScript',
      'React',
      'Vite',
      'Tailwind CSS',
      'Bootstrap',
    ],
  },
  {
    key: 'backend',
    skills: ['PHP', 'Python', 'Laravel', 'FastAPI', 'Node.js', 'Express.js', 'API REST'],
  },
  {
    key: 'mobile',
    skills: ['Kotlin', 'Jetpack Compose', 'React Native', 'Rust', 'Tauri'],
  },
  {
    key: 'data',
    skills: ['MySQL', 'MongoDB', 'Oracle', 'Supabase', 'Docker', 'Git/GitHub'],
  },
  {
    key: 'design',
    skills: ['Figma', 'Canva', 'UI/UX', 'Responsive', 'PWA'],
  },
]

export const coreStack = [
  'React',
  'TypeScript',
  'Laravel',
  'Kotlin',
  'Supabase',
  'Docker',
] as const
