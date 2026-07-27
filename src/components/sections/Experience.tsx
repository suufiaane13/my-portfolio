import { Briefcase, Calendar, ExternalLink } from 'lucide-react'
import { Section, SectionHeading } from '@/components/layout/Container'
import { SectionReveal } from '@/components/shared/SectionReveal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'

export function Experience() {
  const { t } = useTranslation()
  const { content } = usePortfolioContent()

  return (
    <Section id="experience">
      <SectionHeading title={t.experience.title} description={t.experience.description} />

      <div className="relative mx-auto max-w-4xl">
        <div
          className="absolute bottom-0 left-4 top-0 w-0.5 bg-primary/25 md:left-8"
          aria-hidden="true"
        />

        <div className="space-y-6 md:space-y-8">
          {content.experiences.map((item, index) => {
            const linkedProject = item.projectSlug
              ? content.projects.find((project) => project.slug === item.projectSlug)
              : undefined

            return (
              <SectionReveal key={item.slug} delay={index * 0.08}>
                <div className="relative">
                  <div
                    className="absolute left-[0.8125rem] top-6 h-3.5 w-3.5 rounded-full border-4 border-background bg-primary md:left-[1.8125rem] md:h-4 md:w-4"
                    aria-hidden="true"
                  />

                  <Card
                    className={`ml-8 border-border transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 md:ml-16 ${
                      item.isCurrent ? 'border-primary/30 shadow-md shadow-primary/5' : ''
                    }`}
                  >
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Briefcase className="h-5 w-5 text-primary" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-lg font-semibold md:text-xl">
                                {item.role}
                              </h3>
                              {item.isCurrent && (
                                <Badge className="bg-primary/15 text-primary">
                                  {t.common.current}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-medium text-primary">{item.company}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:shrink-0">
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          <span>{item.period}</span>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                        {item.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.technologies.map((tech) => (
                          <Badge key={tech}>{tech}</Badge>
                        ))}
                      </div>

                      {linkedProject && (
                        <a
                          href={linkedProject.demoUrl ?? `#projects`}
                          target={linkedProject.demoUrl ? '_blank' : undefined}
                          rel={linkedProject.demoUrl ? 'noopener noreferrer' : undefined}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
                        >
                          {t.common.seeProject} {linkedProject.title}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
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
