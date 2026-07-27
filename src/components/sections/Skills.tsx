import { AnimatePresence, motion } from 'framer-motion'
import { Code, Database, Palette, Server, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Section, SectionHeading } from '@/components/layout/Container'
import { SectionReveal } from '@/components/shared/SectionReveal'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import './Skills.css'

const categoryMeta = [
  { icon: Code, accent: 'from-violet-500/15 to-transparent' },
  { icon: Server, accent: 'from-indigo-500/15 to-transparent' },
  { icon: Smartphone, accent: 'from-primary/15 to-transparent' },
  { icon: Database, accent: 'from-blue-500/15 to-transparent' },
  { icon: Palette, accent: 'from-purple-500/15 to-transparent' },
]

const panelMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
}

export function Skills() {
  const { t } = useTranslation()
  const { content } = usePortfolioContent()
  const [activeIndex, setActiveIndex] = useState(0)
  const categories = content.skillCategories
  const activeCategory = categories[activeIndex]
  const meta = categoryMeta[activeIndex] ?? categoryMeta[0]
  const Icon = meta.icon

  return (
    <Section id="skills">
      <SectionHeading title={t.skills.title} description={t.skills.description} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,15.5rem)_1fr] lg:gap-8">
        <nav
          className="skills-nav flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
          aria-label={t.nav.skillCategories}
        >
          {categories.map((category, index) => {
            const NavIcon = categoryMeta[index]?.icon ?? Code
            const isActive = index === activeIndex

            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'group flex min-w-[11.5rem] shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 lg:min-w-0 lg:w-full',
                  isActive
                    ? 'border-primary/30 bg-primary/10 shadow-sm shadow-primary/5'
                    : 'border-border/70 bg-card/40 hover:border-primary/20 hover:bg-card/80',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground group-hover:text-primary',
                  )}
                >
                  <NavIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-semibold leading-tight">
                    {category.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {category.skills.length} {t.common.technos}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="relative min-h-[18rem]">
          <AnimatePresence mode="wait">
            <motion.article
              key={activeCategory?.slug}
              initial={panelMotion.initial}
              animate={panelMotion.animate}
              exit={panelMotion.exit}
              transition={panelMotion.transition}
              className={cn(
                'skills-panel-grid relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 md:p-8',
                'bg-gradient-to-br',
                meta.accent,
              )}
            >
              <div className="relative z-[1]">
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-primary/80">
                      {String(activeIndex + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
                      {activeCategory?.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                      {activeCategory?.description}
                    </p>
                  </div>
                </div>

                <ul className="flex flex-wrap gap-2.5">
                  {activeCategory?.skills.map((skill) => (
                    <li key={skill.name}>
                      <span className="inline-flex items-center rounded-lg border border-border bg-background/80 px-3.5 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5 hover:text-primary">
                        {skill.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>

      <SectionReveal delay={0.1} className="mt-10">
        <div className="rounded-2xl border border-border/80 bg-muted/30 px-5 py-4 md:px-6 md:py-5">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t.skills.coreStack}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {content.coreStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                {tech}
              </span>
            ))}
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {content.profile.publicRepos} {t.skills.githubProjects}
            </span>
          </div>
        </div>
      </SectionReveal>
    </Section>
  )
}
