import { motion } from 'framer-motion'
import { ExternalLink, Eye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { GithubIcon } from '@/components/shared/SocialIcons'
import { Section, SectionHeading } from '@/components/layout/Container'
import { SectionReveal, staggerContainer, staggerItem } from '@/components/shared/SectionReveal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { trackEvent } from '@/services/analytics'
import { cn } from '@/lib/utils'
import type { PortfolioProject } from '@/types/portfolio'

const PLACEHOLDER = '/placeholder-project.svg'

function projectActionsGridClass(externalCount: number) {
  return cn('grid gap-2', externalCount <= 1 ? 'grid-cols-1' : 'grid-cols-2')
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: PortfolioProject
  onOpen: (project: PortfolioProject) => void
}) {
  const { t } = useTranslation()
  const externalActionCount = (project.githubUrl ? 1 : 0) + (project.demoUrl ? 1 : 0)

  return (
    <Card className="group overflow-hidden border-border transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative h-44 overflow-hidden sm:h-48">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER
          }}
        />
        <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {project.featured && (
          <Badge className="absolute left-3 top-3 bg-background/90 backdrop-blur-sm">
            {t.common.featured}
          </Badge>
        )}
      </div>

      <div className="p-5 md:p-6">
        <button
          type="button"
          onClick={() => onOpen(project)}
          className="mb-2 flex w-full items-start justify-between gap-3 text-left transition-colors hover:text-primary"
        >
          <h3 className="font-display text-xl font-semibold">{project.title}</h3>
          <span className="shrink-0 text-xs text-muted-foreground">{project.year}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpen(project)}
          className="mb-4 line-clamp-2 w-full text-left text-sm leading-relaxed text-muted-foreground transition-colors hover:text-foreground"
        >
          {project.description}
        </button>

        <div className="mb-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="space-y-2">
          {externalActionCount > 0 && (
            <div className={projectActionsGridClass(externalActionCount)}>
              {project.githubUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-0 w-full"
                  onClick={() => window.open(project.githubUrl, '_blank', 'noopener,noreferrer')}
                >
                  <GithubIcon className="h-4 w-4 shrink-0" />
                  {t.common.github}
                </Button>
              )}
              {project.demoUrl && (
                <Button
                  size="sm"
                  className="min-w-0 w-full"
                  onClick={() => window.open(project.demoUrl, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  {t.common.demo}
                </Button>
              )}
            </div>
          )}
          <Button
            variant={externalActionCount > 0 ? 'outline' : 'primary'}
            size="sm"
            className="min-w-0 w-full"
            onClick={() => onOpen(project)}
          >
            <Eye className="h-4 w-4 shrink-0" />
            {t.common.details}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function Projects() {
  const { t, locale } = useTranslation()
  const { content } = usePortfolioContent()
  const allLabel = t.common.all
  const [activeFilter, setActiveFilter] = useState(allLabel)
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null)

  const displayProjects = content.projects

  const filters = useMemo(() => {
    const tags = new Set<string>()
    displayProjects.forEach((project) => project.tags.forEach((tag) => tags.add(tag)))
    return [allLabel, ...Array.from(tags)]
  }, [allLabel, displayProjects])

  const filteredProjects = useMemo(() => {
    if (activeFilter === allLabel) return displayProjects
    return displayProjects.filter((project) => project.tags.includes(activeFilter))
  }, [activeFilter, allLabel, displayProjects])

  const handleOpenProject = (project: PortfolioProject) => {
    trackEvent({
      eventType: 'project_click',
      sectionId: 'projects',
      projectId: project.slug,
      locale,
    })
    setSelectedProject(project)
  }

  return (
    <Section id="projects" key={locale}>
      <SectionHeading title={t.projects.title} description={t.projects.description} />

      <SectionReveal className="mb-8 flex flex-wrap justify-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              activeFilter === filter
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {filter}
          </button>
        ))}
      </SectionReveal>

      <motion.div
        key={activeFilter}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
      >
        {filteredProjects.map((project) => (
          <motion.div key={project.slug} variants={staggerItem}>
            <ProjectCard project={project} onOpen={handleOpenProject} />
          </motion.div>
        ))}
      </motion.div>

      {filteredProjects.length === 0 && (
        <p className="text-center text-muted-foreground">{t.projects.noResults}</p>
      )}

      <Dialog
        open={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.title ?? ''}
      >
        {selectedProject && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
                className="h-48 w-full object-cover sm:h-56"
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER
                }}
              />
            </div>

            <p className="leading-relaxed text-muted-foreground">
              {selectedProject.longDescription ?? selectedProject.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedProject.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>

            <div
              className={projectActionsGridClass(
                (selectedProject.githubUrl ? 1 : 0) + (selectedProject.demoUrl ? 1 : 0),
              )}
            >
              {selectedProject.githubUrl && (
                <Button
                  variant="outline"
                  className="min-w-0 w-full"
                  onClick={() =>
                    window.open(selectedProject.githubUrl, '_blank', 'noopener,noreferrer')
                  }
                >
                  <GithubIcon className="h-4 w-4 shrink-0" />
                  {t.common.github}
                </Button>
              )}
              {selectedProject.demoUrl && (
                <Button
                  className="min-w-0 w-full"
                  onClick={() =>
                    window.open(selectedProject.demoUrl, '_blank', 'noopener,noreferrer')
                  }
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  {t.common.demo}
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </Section>
  )
}
