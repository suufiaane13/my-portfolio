import { Briefcase, Calendar, ExternalLink } from 'lucide-react'
import { Section, SectionHeading } from '@/components/layout/Container'
import { SectionReveal } from '@/components/shared/SectionReveal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { experience } from '@/data/experience'
import { projects } from '@/data/projects'
import { useTranslation } from '@/i18n/LanguageProvider'

function getLinkedProject(projectId: string) {
  return projects.find((project) => project.id === projectId)
}

export function Experience() {
  const { t } = useTranslation()

  return (
    <Section id="experience">
      <SectionHeading title={t.experience.title} description={t.experience.description} />

      <div className="relative mx-auto max-w-4xl">
        <div
          className="absolute bottom-0 left-4 top-0 w-0.5 bg-primary/25 md:left-8"
          aria-hidden="true"
        />

        <div className="space-y-6 md:space-y-8">
          {experience.map((item, index) => {
            const content = t.experience.items[item.key]
            const linkedProject = item.projectId ? getLinkedProject(item.projectId) : undefined
            const linkedTitle = linkedProject
              ? t.projects.items[linkedProject.id].title
              : undefined

            return (
              <SectionReveal key={item.key} delay={index * 0.08}>
                <div className="relative">
                  <div
                    className="absolute left-[0.8125rem] top-6 h-3.5 w-3.5 rounded-full border-4 border-background bg-primary md:left-[1.8125rem] md:h-4 md:w-4"
                    aria-hidden="true"
                  />

                  <Card
                    className={`ml-8 border-border transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 md:ml-16 ${
                      item.current ? 'border-primary/30 shadow-md shadow-primary/5' : ''
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
                                {content.role}
                              </h3>
                              {item.current && (
                                <Badge className="bg-primary/15 text-primary">
                                  {t.common.current}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-medium text-primary">{content.company}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:shrink-0">
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          <span>{content.period}</span>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                        {content.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.technologies.map((tech) => (
                          <Badge key={tech}>{tech}</Badge>
                        ))}
                      </div>

                      {linkedProject && linkedTitle && (
                        <a
                          href={linkedProject.demo ?? `#projects`}
                          target={linkedProject.demo ? '_blank' : undefined}
                          rel={linkedProject.demo ? 'noopener noreferrer' : undefined}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
                        >
                          {t.common.seeProject} {linkedTitle}
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
