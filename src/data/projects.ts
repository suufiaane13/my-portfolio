export type ProjectId = 'myfood' | 'pure-power-menu' | 'world-explorer' | 'sultan-kunafa'

export interface Project {
  id: ProjectId
  tags: string[]
  image: string
  github?: string
  demo?: string
  featured: boolean
  year: number
}

export const projects: Project[] = [
  {
    id: 'myfood',
    tags: ['Kotlin', 'Jetpack Compose', 'Supabase', 'Android'],
    image: '/projects/myfood.png',
    github: 'https://github.com/suufiaane13/MyFood',
    featured: true,
    year: 2026,
  },
  {
    id: 'pure-power-menu',
    tags: ['TypeScript', 'React', 'Tailwind CSS', 'Vite'],
    image: '/projects/pure-power.png',
    github: 'https://github.com/suufiaane13/pure-power-menu',
    demo: 'https://pure-power-menu.netlify.app/',
    featured: true,
    year: 2026,
  },
  {
    id: 'world-explorer',
    tags: ['JavaScript', 'React', 'Tailwind CSS', 'API'],
    image: '/projects/world-explorer.png',
    github: 'https://github.com/suufiaane13/Wold-Explorer',
    demo: 'https://world-explorer0.netlify.app/',
    featured: false,
    year: 2025,
  },
  {
    id: 'sultan-kunafa',
    tags: ['TypeScript', 'React', 'Tailwind CSS', 'Vite'],
    image: '/projects/sultan-kunafa.png',
    github: 'https://github.com/suufiaane13/sultan_kunafa',
    demo: 'https://sweets-48.netlify.app/',
    featured: false,
    year: 2026,
  },
]
