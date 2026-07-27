import type { LucideIcon } from 'lucide-react'
import { ChessKnight, Plane, Waves } from 'lucide-react'

export type InterestKey = 'swimming' | 'chess' | 'travel'

export interface Interest {
  key: InterestKey
  icon: LucideIcon
}

export const interests: Interest[] = [
  { key: 'swimming', icon: Waves },
  { key: 'chess', icon: ChessKnight },
  { key: 'travel', icon: Plane },
]
