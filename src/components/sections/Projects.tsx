import { motion } from 'framer-motion'
import { ExternalLink, Eye } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { GithubIcon } from '@/components/shared/SocialIcons'
import { Section, SectionHeading } from '@/components/layout/Container'
import { SectionReveal, staggerContainer, staggerItem } from '@/components/shared/SectionReveal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { projects, type Project } from '@/data/projects'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

const PLACEHOLDER = '/placeholder-project.svg'

function projectActionsGridClass(actionCount: number) {
  return cn(
    'grid gap-2',
    actionCount === 1 ? 'grid-cols-1 sm:mx-auto sm:max-w-[11.5rem]' : 'grid-cols-2',
  )
}

interface DisplayProject extends Project {
  title: string
  description: string
  longDescription: string
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: DisplayProject
  onOpen: (project: DisplayProject) => void
}) {
  const { t } = useTranslation()
  const actionCount = (project.github ? 1 : 0) + 1

  return (
    <Card className="group overflow-hidden border-border transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative h-44 overflow-hidden sm:h-48">
        <img
          src={project.image}
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

        <div className={projectActionsGridClass(actionCount)}>
          {project.github && (
            <Button
              variant="outline"
              size="sm"
              className="min-w-0 w-full"
              onClick={() => window.open(project.github, '_blank', 'noopener,noreferrer')}
            >
              <GithubIcon className="h-4 w-4 shrink-0" />
              {t.common.github}
            </Button>
          )}
          {project.demo ? (
            <Button
              size="sm"
              className="min-w-0 w-full"
              onClick={() => window.open(project.demo, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {t.common.demo}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="min-w-0 w-full"
              onClick={() => onOpen(project)}
            >
              <Eye className="h-4 w-4 shrink-0" />
              {t.common.details}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export function Projects() {
  const { t, locale } = useTranslation()
  const [activeFilter, setActiveFilter] = useState(t.common.all)

  useEffect(() => {
    setActiveFilter(t.common.all)
  }, [locale, t.common.all])
  const [selectedProject, setSelectedProject] = useState<DisplayProject | null>(null)

  const displayProjects = useMemo<DisplayProject[]>(
    () =>
      projects.map((project) => {
        const copy = t.projects.items[project.id]
        return {
          ...project,
          title: copy.title,
          description: copy.description,
          longDescription: copy.longDescription,
        }
      }),
    [t],
  )

  const filters = useMemo(() => {
    const tags = new Set<string>()
    projects.forEach((project) => project.tags.forEach((tag) => tags.add(tag)))
    return [t.common.all, ...Array.from(tags)]
  }, [t.common.all])

  const filteredProjects = useMemo(() => {
    if (activeFilter === t.common.all) return displayProjects
    return displayProjects.filter((project) => project.tags.includes(activeFilter))
  }, [activeFilter, displayProjects, t.common.all])

  return (
    <Section id="projects">
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
          <motion.div key={project.id} variants={staggerItem}>
            <ProjectCard project={project} onOpen={setSelectedProject} />
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
                src={selectedProject.image}
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
                (selectedProject.github ? 1 : 0) + (selectedProject.demo ? 1 : 0),
              )}
            >
              {selectedProject.github && (
                <Button
                  variant="outline"
                  className="min-w-0 w-full"
                  onClick={() =>
                    window.open(selectedProject.github, '_blank', 'noopener,noreferrer')
                  }
                >
                  <GithubIcon className="h-4 w-4 shrink-0" />
                  {t.common.github}
                </Button>
              )}
              {selectedProject.demo && (
                <Button
                  className="min-w-0 w-full"
                  onClick={() =>
                    window.open(selectedProject.demo, '_blank', 'noopener,noreferrer')
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
