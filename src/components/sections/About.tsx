import { motion } from 'framer-motion'
import { useState } from 'react'
import { Section, SectionHeading } from '@/components/layout/Container'
import { SectionReveal, staggerContainer, staggerItem } from '@/components/shared/SectionReveal'
import { Card } from '@/components/ui/Card'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { getExpertiseIcon } from '@/lib/portfolioIcons'
import { applyAvatarImageFallback } from '@/lib/portfolioImage'
import { cn } from '@/lib/utils'

const expertiseColors = [
  'text-blue-500',
  'text-green-500',
  'text-purple-500',
  'text-orange-500',
]

export function About() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { t } = useTranslation()
  const { content } = usePortfolioContent()
  const { profile, expertise } = content

  return (
    <Section id="about" className="bg-section-alt">
      <SectionHeading title={t.about.title} description={t.about.description} />

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <SectionReveal className="flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[17rem] sm:max-w-xs md:max-w-sm">
            <div
              className={cn(
                'relative aspect-[3/4] overflow-hidden rounded-3xl border-2 border-primary/25 bg-muted/40 shadow-2xl transition-all duration-500 hover:border-primary/40 md:aspect-[4/5]',
                imageLoaded && 'hover:scale-[1.02] hover:shadow-primary/10',
              )}
            >
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
              )}
              <img
                src={profile.avatarUrl}
                alt={`${profile.name} — ${profile.title}`}
                className={cn(
                  'h-full w-full object-cover object-[center_12%] transition-opacity duration-700',
                  imageLoaded ? 'opacity-100' : 'opacity-0',
                )}
                width={384}
                height={480}
                loading="eager"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={(event) => {
                  applyAvatarImageFallback(event.currentTarget)
                  setImageLoaded(true)
                }}
              />
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1} className="space-y-6">
          <div>
            <h3 className="text-center font-display text-3xl font-bold md:text-4xl lg:text-left">
              {profile.name}
            </h3>
            {profile.bio.map((paragraph) => (
              <p
                key={paragraph.slice(0, 24)}
                className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {expertise.map((item, index) => {
              const Icon = getExpertiseIcon(item.iconKey)
              const color = expertiseColors[index] ?? 'text-primary'

              return (
                <motion.div key={item.slug} variants={staggerItem}>
                  <Card className="h-full border-border/60 bg-card/80 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className={cn('h-5 w-5', color)} aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{item.title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </SectionReveal>
      </div>
    </Section>
  )
}
