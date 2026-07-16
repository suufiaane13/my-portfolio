import { Briefcase, FolderKanban, GraduationCap, Layers, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminContentHeader } from '@/components/admin/content/AdminContentHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useTranslation } from '@/i18n/LanguageProvider'
import { fetchAdminEducation } from '@/services/admin/education'
import { fetchAdminExperiences } from '@/services/admin/experiences'
import { fetchAdminProfile } from '@/services/admin/profile'
import { fetchAdminProjects } from '@/services/admin/projects'
import { fetchAdminSkillCategories } from '@/services/admin/skills'

const sections = [
  { to: '/admin/content/profile', icon: User, key: 'profile' as const, countKey: 'profile' as const },
  { to: '/admin/content/projects', icon: FolderKanban, key: 'projects' as const, countKey: 'projects' as const },
  { to: '/admin/content/skills', icon: Layers, key: 'skills' as const, countKey: 'skills' as const },
  { to: '/admin/content/experience', icon: Briefcase, key: 'experience' as const, countKey: 'experience' as const },
  { to: '/admin/content/education', icon: GraduationCap, key: 'education' as const, countKey: 'education' as const },
]

interface SectionStats {
  count: number
  drafts: number
}

export function AdminContentHubPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Record<string, SectionStats>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = `${t.admin.content.hubTitle} — ${t.admin.title}`
  }, [t])

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      const [profile, projects, skills, experience, education] = await Promise.all([
        fetchAdminProfile(),
        fetchAdminProjects(),
        fetchAdminSkillCategories(),
        fetchAdminExperiences(),
        fetchAdminEducation(),
      ])

      if (cancelled) return

      setStats({
        profile: {
          count: profile ? 1 : 0,
          drafts: profile && !profile.published ? 1 : 0,
        },
        projects: {
          count: projects.length,
          drafts: projects.filter((p) => !p.published).length,
        },
        skills: {
          count: skills.length,
          drafts: skills.filter((s) => !s.published).length,
        },
        experience: {
          count: experience.length,
          drafts: experience.filter((e) => !e.published).length,
        },
        education: {
          count: education.length,
          drafts: education.filter((e) => !e.published).length,
        },
      })
      setIsLoading(false)
    }

    void loadStats()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <AdminContentHeader
        title={t.admin.content.hubTitle}
        description={t.admin.content.hubDescription}
        backTo="/admin"
        backLabel={t.admin.content.backToDashboard}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ to, icon: Icon, key, countKey }) => {
          const sectionStats = stats[countKey]
          return (
            <Link key={to} to={to} className="group block">
              <Card className="h-full p-5 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  {!isLoading && sectionStats && (
                    <div className="flex flex-col items-end gap-1">
                      <Badge>
                        {t.admin.content.itemCount.replace('{{count}}', String(sectionStats.count))}
                      </Badge>
                      {sectionStats.drafts > 0 ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {t.admin.content.draftsCount.replace('{{count}}', String(sectionStats.drafts))}
                        </span>
                      ) : sectionStats.count > 0 ? (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          {t.admin.content.allPublished}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
                <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                  {t.admin.content.sections[key].title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.admin.content.sections[key].description}
                </p>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
