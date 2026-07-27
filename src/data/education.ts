export type EducationKey = 'licence' | 'tsdd' | 'bac'

export interface EducationItem {
  key: EducationKey
}

export const education: EducationItem[] = [
  { key: 'licence' },
  { key: 'tsdd' },
  { key: 'bac' },
]
