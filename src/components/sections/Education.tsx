import { Calendar, GraduationCap } from 'lucide-react'
import { Section, SectionHeading } from '@/components/layout/Container'
import { SectionReveal } from '@/components/shared/SectionReveal'
import { Card } from '@/components/ui/Card'
import { education } from '@/data/education'
import { useTranslation } from '@/i18n/LanguageProvider'

export function Education() {
  const { t } = useTranslation()

  return (
    <Section id="education" className="bg-section-alt">
      <SectionHeading title={t.education.title} description={t.education.description} />

      <div className="relative mx-auto max-w-3xl">
        <div
          className="absolute bottom-0 left-4 top-0 w-0.5 bg-primary/25 md:left-8"
          aria-hidden="true"
        />

        <div className="space-y-6 md:space-y-8">
          {education.map((item, index) => {
            const content = t.education.items[item.key]

            return (
              <SectionReveal key={item.key} delay={index * 0.08}>
                <div className="relative">
                  <div
                    className="absolute left-[0.8125rem] top-6 h-3.5 w-3.5 rounded-full border-4 border-background bg-primary md:left-[1.8125rem] md:h-4 md:w-4"
                    aria-hidden="true"
                  />

                  <Card className="ml-8 border-border transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 md:ml-16">
                    <div className="p-5 md:p-6">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg font-semibold leading-tight md:text-xl">
                            {content.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{content.year}</span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                        {content.description}
                      </p>
                      <p className="mt-2 text-sm font-medium text-primary">{content.institution}</p>
                    </div>
                  </Card>
                </div>
              </SectionReveal>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
