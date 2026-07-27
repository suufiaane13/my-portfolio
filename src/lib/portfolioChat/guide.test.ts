import { describe, expect, it } from 'vitest'
import { en } from '@/i18n/locales/en'
import { fr } from '@/i18n/locales/fr'
import { getGuideReplyForProject, getGuideReplyForTopic } from '@/lib/portfolioChat/guide'
import {
  chunkIdForProject,
  chunkIdForTopic,
  GUIDE_TOPIC_IDS,
  relatedTopicsFor,
} from '@/lib/portfolioChat/guideTopics'
import { buildChatKnowledge } from '@/lib/portfolioChat/knowledge'
import { buildStaticPortfolio } from '@/lib/staticPortfolio'

describe('guideTopics', () => {
  it('exposes the full menu topic set', () => {
    expect(GUIDE_TOPIC_IDS).toEqual([
      'about',
      'freelance',
      'skills',
      'projects',
      'experience',
      'education',
      'contact',
      'cv',
      'game',
    ])
  })

  it('maps topics to chunk ids (projects has none)', () => {
    expect(chunkIdForTopic('about')).toBe('about-main')
    expect(chunkIdForTopic('contact')).toBe('contact-main')
    expect(chunkIdForTopic('projects')).toBeNull()
    expect(chunkIdForProject('demo-app')).toBe('project-demo-app')
  })

  it('returns related topics without self-reference', () => {
    const related = relatedTopicsFor('skills')
    expect(related).toContain('projects')
    expect(related).not.toContain('skills')
  })
})

describe('guide replies', () => {
  const content = buildStaticPortfolio('fr', fr)
  const knowledge = buildChatKnowledge(content, 'fr', fr)

  it('builds replies for standard topics', () => {
    const about = getGuideReplyForTopic('about', knowledge, content, fr)
    expect(about?.intent).toBe('about')
    expect(about?.text.length).toBeGreaterThan(20)

    const contact = getGuideReplyForTopic('contact', knowledge, content, fr)
    expect(contact?.sectionId).toBe('contact')
    expect(contact?.actions?.some((a) => a.type === 'section')).toBe(true)
  })

  it('returns null for the projects submenu topic', () => {
    expect(getGuideReplyForTopic('projects', knowledge, content, fr)).toBeNull()
  })

  it('builds a project reply when the slug exists', () => {
    const slug = content.projects[0]?.slug
    expect(slug).toBeTruthy()
    const reply = getGuideReplyForProject(slug!, knowledge, content, fr)
    expect(reply?.intent).toBe('projects')
    expect(reply?.text).toContain(content.projects[0].title)
  })

  it('returns null for an unknown project slug', () => {
    expect(getGuideReplyForProject('missing-slug', knowledge, content, fr)).toBeNull()
  })
})

describe('buildStaticPortfolio', () => {
  it('returns a complete FR portfolio shape', () => {
    const portfolio = buildStaticPortfolio('fr', fr)
    expect(portfolio.source).toBe('static')
    expect(portfolio.profile.name.length).toBeGreaterThan(0)
    expect(portfolio.projects.length).toBeGreaterThan(0)
    expect(portfolio.skillCategories.length).toBeGreaterThan(0)
    expect(portfolio.experiences.length).toBeGreaterThan(0)
  })

  it('localizes EN content independently', () => {
    const frPortfolio = buildStaticPortfolio('fr', fr)
    const enPortfolio = buildStaticPortfolio('en', en)
    expect(enPortfolio.profile.title).not.toBe(frPortfolio.profile.title)
    expect(enPortfolio.projects.length).toBe(frPortfolio.projects.length)
  })
})
