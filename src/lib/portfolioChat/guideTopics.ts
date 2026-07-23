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

/** Related topics shown under an answer (menu navigation, no NLP). */
export const RELATED_TOPICS: Record<GuideTopicId, readonly GuideTopicId[]> = {
  about: ['skills', 'experience', 'contact'],
  freelance: ['contact', 'cv', 'projects'],
  skills: ['projects', 'experience', 'cv'],
  projects: ['skills', 'experience', 'contact'],
  experience: ['skills', 'projects', 'education'],
  education: ['experience', 'skills', 'cv'],
  contact: ['cv', 'freelance', 'projects'],
  cv: ['contact', 'projects', 'skills'],
  game: ['projects', 'about', 'contact'],
}

export function chunkIdForTopic(topicId: GuideTopicId): string | null {
  if (topicId === 'projects') return null
  return TOPIC_CHUNK_ID[topicId]
}

export function chunkIdForProject(slug: string): string {
  return `project-${slug}`
}

export function relatedTopicsFor(topicId: GuideTopicId): readonly GuideTopicId[] {
  return RELATED_TOPICS[topicId] ?? []
}
