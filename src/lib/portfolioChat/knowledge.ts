import type { Locale, Translations } from '@/i18n/types'
import type { PortfolioContent } from '@/types/portfolio'
import type { ChatChunk, ChatKnowledge } from '@/lib/portfolioChat/types'

export function buildChatKnowledge(
  content: PortfolioContent,
  locale: Locale,
  t: Translations,
): ChatKnowledge {
  const { profile } = content
  const chunks: ChatChunk[] = []

  chunks.push({
    id: 'about-main',
    intent: 'about',
    title: profile.name,
    body: `${profile.title}\n\n${profile.tagline}\n\n${profile.bio.join('\n\n')}\n\n${profile.availability}`,
    sectionId: 'about',
  })

  chunks.push({
    id: 'about-availability',
    intent: 'about',
    title: profile.availability,
    body: profile.availability,
    sectionId: 'about',
  })

  chunks.push({
    id: 'skills-overview',
    intent: 'skills',
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
      title: cat.title,
      body: `${cat.description}\n\n${cat.skills.map((s) => (s.isCore ? `${s.name} ★` : s.name)).join(', ')}`,
      sectionId: 'skills',
    })
  }

  chunks.push({
    id: 'projects-list',
    intent: 'projects',
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
      title: exp.role,
      body: `${exp.period} · ${exp.company}\n\n${exp.description}\n\n${exp.technologies.join(', ')}`,
      sectionId: 'experience',
    })
  }

  chunks.push({
    id: 'education-list',
    intent: 'education',
    title: t.nav.education,
    body: content.education
      .map((edu) => `• **${edu.title}** — ${edu.institution} (${edu.periodLabel})`)
      .join('\n'),
    sectionId: 'education',
  })

  chunks.push({
    id: 'contact-main',
    intent: 'contact',
    title: t.nav.contact,
    body: [
      profile.email ? `${t.chatbot.templates.emailLabel}: ${profile.email}` : '',
      profile.whatsapp ? `${t.chatbot.templates.whatsappLabel}: ${profile.whatsapp}` : '',
      profile.address ? `${t.chatbot.templates.location}: ${profile.address}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    sectionId: 'contact',
    links: [
      ...(profile.whatsappHref
        ? [{ label: t.chatbot.templates.whatsappLabel, href: profile.whatsappHref, external: true }]
        : []),
      ...(profile.email
        ? [{ label: t.chatbot.templates.emailLabel, href: `mailto:${profile.email}`, external: true }]
        : []),
    ],
  })

  chunks.push({
    id: 'social-links',
    intent: 'social',
    title: t.chatbot.templates.socialTitle,
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
    title: t.nav.languages,
    body: content.spokenLanguages
      .map((lang) => `${lang.flagEmoji} **${lang.name}** — ${lang.level}`)
      .join('\n'),
    sectionId: 'languages',
  })

  chunks.push({
    id: 'interests-list',
    intent: 'interests',
    title: t.nav.interests,
    body: content.interests.map((item) => `• ${item.label}`).join('\n'),
    sectionId: 'interests',
  })

  chunks.push({
    id: 'cv-download',
    intent: 'cv',
    title: t.hero.downloadCv,
    body: t.chatbot.templates.cvAvailable,
    links: profile.cvUrl
      ? [
          {
            label: t.hero.downloadCv,
            href: profile.cvUrl,
            download: profile.cvFilename || 'CV_Soufiane_HAJJI.pdf',
          },
        ]
      : [],
    sectionId: 'hero',
  })

  chunks.push({
    id: 'game-info',
    intent: 'game',
    title: t.nav.game,
    body: t.chatbot.templates.gameIntro,
    links: [{ label: t.nav.game, href: '/game' }],
  })

  return { locale, chunks }
}
