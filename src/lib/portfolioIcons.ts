import { Code, Crown, Database, Globe, Plane, Smartphone, Waves, type LucideIcon } from 'lucide-react'

const expertiseIconMap: Record<string, LucideIcon> = {
  code: Code,
  database: Database,
  smartphone: Smartphone,
  globe: Globe,
}

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
