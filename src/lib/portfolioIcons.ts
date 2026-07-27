import { Code, Crown, Database, Globe, Plane, Smartphone, Waves, type LucideIcon } from 'lucide-react'

const expertiseIconMap: Record<string, LucideIcon> = {
  code: Code,
  database: Database,
  smartphone: Smartphone,
  globe: Globe,
}

export const INTEREST_ICON_KEYS = ['waves', 'crown', 'plane'] as const
export type InterestIconKey = (typeof INTEREST_ICON_KEYS)[number]

const interestIconMap: Record<string, LucideIcon> = {
  waves: Waves,
  crown: Crown,
  plane: Plane,
}

export function getExpertiseIcon(iconKey: string): LucideIcon {
  return expertiseIconMap[iconKey] ?? Code
}

export function getInterestIcon(iconKey: string): LucideIcon {
  return interestIconMap[iconKey] ?? Waves
}
