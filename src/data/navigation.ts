import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  Code,
  GraduationCap,
  Heart,
  Languages,
  Mail,
  Rocket,
  User,
} from 'lucide-react'
import type { Translations } from '@/i18n/types'

export type NavKey = keyof Translations['nav'] &
  (
    | 'about'
    | 'skills'
    | 'experience'
    | 'education'
    | 'projects'
    | 'interests'
    | 'languages'
    | 'contact'
  )

export interface NavItem {
  href: string
  key: NavKey
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { href: '#about', key: 'about', icon: User },
  { href: '#skills', key: 'skills', icon: Code },
  { href: '#experience', key: 'experience', icon: Rocket },
  { href: '#education', key: 'education', icon: GraduationCap },
  { href: '#projects', key: 'projects', icon: Briefcase },
  { href: '#interests', key: 'interests', icon: Heart },
  { href: '#languages', key: 'languages', icon: Languages },
  { href: '#contact', key: 'contact', icon: Mail },
]

export const sectionIds = ['hero', ...navItems.map((item) => item.href.slice(1))]
