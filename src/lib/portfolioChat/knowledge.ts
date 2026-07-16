import type { Locale, Translations } from '@/i18n/types'
import type { PortfolioContent } from '@/types/portfolio'
import { tokenize } from '@/lib/portfolioChat/normalize'
import type { ChatChunk, ChatKnowledge } from '@/lib/portfolioChat/types'

function uniqueKeywords(...parts: (string | undefined)[]): string[] {
  const set = new Set<string>()
  for (const part of parts) {
    if (!part) continue
    tokenize(part).forEach((token) => set.add(token))
    part
      .toLowerCase()
      .split(/[\s,/|]+/)
      .filter((token) => token.length > 1)
      .forEach((token) => set.add(token.replace(/[^a-z0-9-]/g, '')))
  }
  return Array.from(set).filter(Boolean)
}

export function buildChatKnowledge(
  content: PortfolioContent,
  _locale: Locale,
  t: Translations,
): ChatKnowledge {
  const { profile } = content
  const chunks: ChatChunk[] = []

  chunks.push({
    id: 'about-main',
    intent: 'about',
    keywords: uniqueKeywords(
      profile.name,
      profile.title,
      profile.tagline,
      profile.availability,
      profile.bio.join(' '),
      'about bio profil developer fullstack designer',
    ),
    title: profile.name,
    body: `${profile.title}\n\n${profile.tagline}\n\n${profile.bio.join('\n\n')}\n\n${profile.availability}`,
    sectionId: 'about',
  })

  chunks.push({
    id: 'about-availability',
    intent: 'about',
    keywords: uniqueKeywords(profile.availability, 'freelance disponible available hire hireable'),
    title: profile.availability,
    body: profile.availability,
    sectionId: 'about',
  })

  chunks.push({
    id: 'skills-overview',
    intent: 'skills',
    keywords: uniqueKeywords(
      'skills competences stack technologies tech',
      content.coreStack.join(' '),
      ...content.skillCategories.map((c) => `${c.title} ${c.description}`),
    ),
    title: t.nav.skills,
    body: [
      `${t.chatbot.templates.coreStack}: ${content.coreStack.join(', ')}`,
      ...content.skillCategories.map(
        (cat) => `**${cat.title}** — ${cat.skills.map((s) => s.name).join(', ')}`,
      ),
    ].join('\n\n'),
    sectionId: 'skills',
  })

  for (const cat of content.skillCategories) {
    chunks.push({
      id: `skill-${cat.slug}`,
      intent: 'skills',
      keywords: uniqueKeywords(cat.title, cat.description, cat.skills.map((s) => s.name).join(' ')),
      title: cat.title,
      body: `${cat.description}\n\n${cat.skills.map((s) => (s.isCore ? `${s.name} ★` : s.name)).join(', ')}`,
      sectionId: 'skills',
    })
  }

  chunks.push({
    id: 'projects-list',
    intent: 'projects',
    keywords: uniqueKeywords('projects projets portfolio realisations'),
    title: t.nav.projects,
    body: content.projects
      .map((p) => `• **${p.title}** (${p.year}) — ${p.description}`)
      .join('\n'),
    sectionId: 'projects',
  })

  for (const project of content.projects) {
    chunks.push({
      id: `project-${project.slug}`,
      intent: 'projects',
      keywords: uniqueKeywords(
        project.slug,
        project.title,
        project.description,
        project.longDescription,
        project.tags.join(' '),
      ),
      title: project.title,
      body: `${project.longDescription || project.description}\n\n${project.tags.join(' · ')}`,
      sectionId: 'projects',
      links: [
        ...(project.demoUrl
          ? [{ label: t.common.demo, href: project.demoUrl, external: true }]
          : []),
        ...(project.githubUrl
          ? [{ label: t.common.github, href: project.githubUrl, external: true }]
          : []),
      ],
    })
  }

  chunks.push({
    id: 'experience-list',
    intent: 'experience',
    keywords: uniqueKeywords('experience xp travail work job carriere'),
    title: t.nav.experience,
    body: content.experiences
      .map((exp) => `• **${exp.role}** — ${exp.company} (${exp.period})\n${exp.description}`)
      .join('\n\n'),
    sectionId: 'experience',
  })

  for (const exp of content.experiences) {
    chunks.push({
      id: `experience-${exp.slug}`,
      intent: 'experience',
      keywords: uniqueKeywords(exp.role, exp.company, exp.description, exp.technologies.join(' ')),
      title: exp.role,
      body: `${exp.period} · ${exp.company}\n\n${exp.description}\n\n${exp.technologies.join(', ')}`,
      sectionId: 'experience',
    })
  }

  chunks.push({
    id: 'education-list',
    intent: 'education',
    keywords: uniqueKeywords('education formation diploma diplome ecole school'),
    title: t.nav.education,
    body: content.education
      .map((edu) => `• **${edu.title}** — ${edu.institution} (${edu.periodLabel})`)
      .join('\n'),
    sectionId: 'education',
  })

  chunks.push({
    id: 'contact-main',
    intent: 'contact',
    keywords: uniqueKeywords('contact email whatsapp message contacter hire recruter'),
    title: t.nav.contact,
    body: [
      profile.email ? `Email: ${profile.email}` : '',
      profile.whatsapp ? `WhatsApp: ${profile.whatsapp}` : '',
      profile.address ? `${t.chatbot.templates.location}: ${profile.address}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    sectionId: 'contact',
    links: [
      ...(profile.whatsappHref
        ? [{ label: 'WhatsApp', href: profile.whatsappHref, external: true }]
        : []),
      ...(profile.email
        ? [{ label: 'Email', href: `mailto:${profile.email}`, external: true }]
        : []),
    ],
  })

  chunks.push({
    id: 'social-links',
    intent: 'social',
    keywords: uniqueKeywords('social github instagram reseaux links'),
    title: 'Social',
    body: content.socialLinks.map((link) => `• **${link.label}** — ${link.handle}`).join('\n'),
    links: content.socialLinks.map((link) => ({
      label: link.label,
      href: link.href,
      external: true,
    })),
  })

  chunks.push({
    id: 'languages-list',
    intent: 'languages',
    keywords: uniqueKeywords('languages langues parle speak spoken arabic french english'),
    title: t.nav.languages,
    body: content.spokenLanguages
      .map((lang) => `${lang.flagEmoji} **${lang.name}** — ${lang.level}`)
      .join('\n'),
    sectionId: 'languages',
  })

  chunks.push({
    id: 'interests-list',
    intent: 'interests',
    keywords: uniqueKeywords('interests interets hobbies passions'),
    title: t.nav.interests,
    body: content.interests.map((item) => `• ${item.label}`).join('\n'),
    sectionId: 'interests',
  })

  chunks.push({
    id: 'cv-download',
    intent: 'cv',
    keywords: uniqueKeywords('cv resume curriculum vitae pdf download telecharger'),
    title: t.hero.downloadCv,
    body: t.chatbot.templates.cvAvailable,
    links: profile.cvUrl ? [{ label: t.hero.downloadCv, href: profile.cvUrl, external: true }] : [],
    sectionId: 'hero',
  })

  chunks.push({
    id: 'game-info',
    intent: 'game',
    keywords: uniqueKeywords('game jeu memory memoire leaderboard classement score pairs'),
    title: t.nav.game,
    body: t.chatbot.templates.gameIntro,
    links: [{ label: t.nav.game, href: '/game' }],
  })

  chunks.push({
    id: 'greeting',
    intent: 'greeting',
    keywords: uniqueKeywords('hello bonjour salut hi hey coucou'),
    title: 'Greeting',
    body: t.chatbot.templates.greeting.replace('{{name}}', profile.name),
  })

  chunks.push({
    id: 'thanks',
    intent: 'thanks',
    keywords: uniqueKeywords('thanks merci thank thx'),
    title: 'Thanks',
    body: t.chatbot.templates.thanks,
  })

  return { locale: _locale, chunks }
}
