export type GuideTopicId =
  | 'about'
  | 'freelance'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'education'
  | 'contact'
  | 'cv'
  | 'game'

export const GUIDE_TOPIC_IDS: readonly GuideTopicId[] = [
  'about',
  'freelance',
  'skills',
  'projects',
  'experience',
  'education',
  'contact',
  'cv',
  'game',
] as const

const TOPIC_CHUNK_ID: Record<Exclude<GuideTopicId, 'projects'>, string> = {
  about: 'about-main',
  freelance: 'about-availability',
  skills: 'skills-overview',
  experience: 'experience-list',
  education: 'education-list',
  contact: 'contact-main',
  cv: 'cv-download',
  game: 'game-info',
}

export function chunkIdForTopic(topicId: GuideTopicId): string | null {
  if (topicId === 'projects') return null
  return TOPIC_CHUNK_ID[topicId]
}

export function chunkIdForProject(slug: string): string {
  return `project-${slug}`
}
