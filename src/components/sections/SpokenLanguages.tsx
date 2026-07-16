import { motion } from 'framer-motion'
import { Languages } from 'lucide-react'
import { Container, SectionHeading } from '@/components/layout/Container'
import { staggerContainer, staggerItem } from '@/components/shared/SectionReveal'
import { Card } from '@/components/ui/Card'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import './SpokenLanguages.css'

const languageAccents: Record<
  string,
  { gradient: string; ring: string; badge: string; glow: string }
> = {
  ar: {
    gradient: 'language-card__glow--ar',
    ring: 'language-card__ring--ar',
    badge: 'language-card__badge--ar',
    glow: 'hover:shadow-emerald-500/15',
  },
  fr: {
    gradient: 'language-card__glow--fr',
    ring: 'language-card__ring--fr',
    badge: 'language-card__badge--fr',
    glow: 'hover:shadow-blue-500/15',
  },
  en: {
    gradient: 'language-card__glow--en',
    ring: 'language-card__ring--en',
    badge: 'language-card__badge--en',
    glow: 'hover:shadow-violet-500/15',
  },
}

const defaultAccent = {
  gradient: 'language-card__glow--default',
  ring: 'language-card__ring--default',
  badge: 'language-card__badge--default',
  glow: 'hover:shadow-primary/15',
}

export function SpokenLanguages() {
  const { t } = useTranslation()
  const { content } = usePortfolioContent()

  return (
    <section
      id="languages"
      className="languages-section relative overflow-hidden py-12 md:py-16"
    >
      <div className="languages-section__backdrop" aria-hidden="true" />

      <Container className="relative z-[1]">
        <SectionHeading
          title={t.languages.title}
          description={t.languages.description}
          className="languages-section__heading !mb-8 md:!mb-10"
        />

        <div className="languages-grid-wrap relative mx-auto max-w-4xl">
          <div className="languages-grid__connector" aria-hidden="true" />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="languages-grid"
          >
            {content.spokenLanguages.map((language) => {
            const accent = languageAccents[language.slug] ?? defaultAccent

            return (
              <motion.div key={language.slug} variants={staggerItem} className="min-w-0">
                <Card
                  className={cn(
                    'language-card group relative h-full overflow-hidden border-border/70 bg-card/80 p-0 backdrop-blur-sm',
                    accent.glow,
                  )}
                >
                  <div
                    className={cn('language-card__glow pointer-events-none absolute', accent.gradient)}
                    aria-hidden="true"
                  />

                  <div className="relative flex flex-col items-center px-2 py-4 text-center sm:px-4 sm:py-6 md:px-5 md:py-7">
                    <div className={cn('language-card__ring', accent.ring)}>
                      <span className="language-card__flag" aria-hidden="true">
                        {language.flagEmoji}
                      </span>
                    </div>

                    <p className="language-card__code mt-3 hidden font-display text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted-foreground/50 sm:block">
                      {language.slug}
                    </p>

                    <h3 className="mt-2 line-clamp-2 font-display text-sm font-bold leading-tight tracking-tight transition-colors group-hover:text-primary sm:text-base md:text-lg">
                      {language.name}
                    </h3>

                    <span className={cn('language-card__badge mt-2.5 max-w-full sm:mt-3', accent.badge)}>
                      {language.level}
                    </span>
                  </div>
                </Card>
              </motion.div>
            )
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="languages-section__footnote mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 px-3 text-center text-xs text-muted-foreground sm:mt-8 sm:text-sm"
        >
          <Languages className="h-3.5 w-3.5 shrink-0 text-primary/70 sm:h-4 sm:w-4" aria-hidden="true" />
          <span>{t.languages.footnote}</span>
        </motion.div>
      </Container>
    </section>
  )
}
