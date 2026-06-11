import type { LucideIcon } from 'lucide-react'
import { Crown, Plane, Waves } from 'lucide-react'

export type InterestKey = 'swimming' | 'chess' | 'travel'

export interface Interest {
  key: InterestKey
  icon: LucideIcon
}

export const interests: Interest[] = [
  { key: 'swimming', icon: Waves },
  { key: 'chess', icon: Crown },
  { key: 'travel', icon: Plane },
]
