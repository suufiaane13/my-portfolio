import { motion } from 'framer-motion'
import { Section, SectionHeading } from '@/components/layout/Container'
import { staggerContainer, staggerItem } from '@/components/shared/SectionReveal'
import { Card } from '@/components/ui/Card'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { getInterestIcon } from '@/lib/portfolioIcons'

export function Interests() {
  const { t } = useTranslation()
  const { content } = usePortfolioContent()

  return (
    <Section id="interests" className="bg-section-alt">
      <SectionHeading title={t.interests.title} description={t.interests.description} />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
      >
        {content.interests.map((interest) => {
          const Icon = getInterestIcon(interest.iconKey)

          return (
            <motion.div key={interest.slug} variants={staggerItem}>
              <Card className="group flex flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 sm:p-8">
                <div className="mb-4 rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                  <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-primary">
                  {interest.label}
                </h3>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </Section>
  )
}
