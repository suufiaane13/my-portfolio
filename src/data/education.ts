export type EducationKey = 'tsdd' | 'bac'

export interface EducationItem {
  key: EducationKey
}

export const education: EducationItem[] = [{ key: 'tsdd' }, { key: 'bac' }]
