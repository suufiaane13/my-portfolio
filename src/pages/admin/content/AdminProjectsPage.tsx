import { Image, Plus, Settings, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { ContentEditorToolbar, stickyBelowToolbarClass } from '@/components/admin/content/ContentEditorToolbar'
import {
  ContentMasterDetail,
  ContentMasterDetailBack,
} from '@/components/admin/content/ContentMasterDetail'
import { ProjectPreviewCard } from '@/components/admin/content/ContentPreviewCard'
import { ContentFieldGrid, ContentSection, ContentSectionGroup } from '@/components/admin/content/ContentSection'
import { FileUploadField } from '@/components/admin/content/FileUploadField'
import { FormInput, FormTextarea } from '@/components/admin/content/FormField'
import type { Locale } from '@/i18n/types'
import { useTranslation } from '@/i18n/LanguageProvider'
import {
  validateOptionalUrl,
  validateRequiredText,
  validateSlug,
} from '@/lib/cmsValidation'
import {
  createAdminProject,
  createEmptyProject,
  deleteAdminProject,
  fetchAdminProjects,
  updateAdminProject,
} from '@/services/admin/projects'
import type { AdminProject } from '@/types/adminContent'

const NEW_PROJECT_ID = '__new__'

export function AdminProjectsPage() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AdminProject | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [locale, setLocale] = useState<Locale>('fr')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await fetchAdminProjects()
    setProjects(data)
    if (selectedId && selectedId !== NEW_PROJECT_ID) {
      const found = data.find((p) => p.slug === selectedId)
      if (found) setDraft(structuredClone(found))
      else {
        setSelectedId(null)
        setDraft(null)
        setIsNew(false)
      }
    }
    setIsLoading(false)
  }, [selectedId])

  useEffect(() => {
    document.title = `${t.admin.content.sections.projects.title} — ${t.admin.title}`
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t])

  const listItems = useMemo(
    () =>
      projects.map((p) => ({
        id: p.slug,
        title: p.translations.fr.title || p.slug,
        subtitle: p.slug,
        published: p.published,
        meta: String(p.year),
      })),
    [projects],
  )

  const handleSelect = (id: string) => {
    const item = projects.find((p) => p.slug === id)
    if (!item) return
    setSelectedId(id)
    setDraft(structuredClone(item))
    setIsNew(false)
  }

  const handleCreate = () => {
    setSelectedId(NEW_PROJECT_ID)
    setDraft(createEmptyProject(projects.length + 1))
    setIsNew(true)
  }

  const handleSave = async () => {
    if (!draft) return

    const slugError = validateSlug(draft.slug)
    if (slugError) {
      toast.error(t.admin.content.validation[slugError])
      return
    }

    const titleError = validateRequiredText(draft.translations.fr.title)
    if (titleError) {
      toast.error(t.admin.content.validation[titleError])
      return
    }

    for (const url of [draft.demoUrl, draft.githubUrl, draft.imageUrl]) {
      const urlError = validateOptionalUrl(url ?? '')
      if (urlError) {
        toast.error(t.admin.content.validation[urlError])
        return
      }
    }

    setIsSaving(true)

    if (isNew) {
      const slug = await createAdminProject(draft)
      setIsSaving(false)
      if (!slug) {
        toast.error(t.admin.content.saveError)
        return
      }
      toast.success(t.admin.content.createSuccess)
      setIsNew(false)
      setSelectedId(slug)
      await load()
      return
    }

    const ok = await updateAdminProject(draft)
    setIsSaving(false)
    if (!ok) {
      toast.error(t.admin.content.saveError)
      return
    }
    toast.success(t.admin.content.saveSuccess)
    await load()
  }

  const handleConfirmDelete = async () => {
    if (!draft || isNew) return
    setIsDeleting(true)
    const ok = await deleteAdminProject(draft.slug)
    setIsDeleting(false)
    if (!ok) {
      toast.error(t.admin.content.deleteError)
      return
    }
    toast.success(t.admin.content.deleteSuccess)
    setPendingDelete(false)
    setSelectedId(null)
    setDraft(null)
    setIsNew(false)
    await load()
  }

  const copy = draft?.translations[locale]

  return (
    <div>
      <ContentEditorToolbar
        title={t.admin.content.sections.projects.title}
        backTo="/admin/content"
        backLabel={t.admin.content.backToHub}
        locale={locale}
        onLocaleChange={setLocale}
        published={draft?.published}
        onPublishedChange={
          draft ? (value) => setDraft({ ...draft, published: value }) : undefined
        }
        showPublished={Boolean(draft)}
        onSave={draft ? () => void handleSave() : undefined}
        isSaving={isSaving}
      />

      <ContentMasterDetail
        items={listItems}
        selectedId={selectedId}
        onSelect={handleSelect}
        onBack={() => {
          setSelectedId(null)
          setDraft(null)
          setIsNew(false)
        }}
        isLoading={isLoading}
        listHeader={
          <Button type="button" size="sm" variant="outline" onClick={handleCreate} className="mb-2 w-full">
            <Plus className="h-4 w-4" />
            {t.admin.content.create}
          </Button>
        }
      >
        {draft && copy && (
          <>
            <ContentMasterDetailBack
              label={t.admin.content.backToList}
              onBack={() => {
                setSelectedId(null)
                setDraft(null)
                setIsNew(false)
              }}
            />

            {!isNew && (
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingDelete(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {t.admin.content.delete}
                </Button>
              </div>
            )}

            <div className="lg:grid lg:grid-cols-3 lg:gap-6">
              <div className="lg:col-span-2">
              <ContentSectionGroup>
              <div className="space-y-5">
                {isNew && (
                  <ContentSection
                    sectionId="project-identity"
                    icon={Settings}
                    title={t.admin.content.groups.identity}
                    description={t.admin.content.groups.identityDesc}
                  >
                    <FormInput
                      label={t.admin.content.fields.slug}
                      value={draft.slug}
                      onChange={(v) => setDraft({ ...draft, slug: v })}
                    />
                  </ContentSection>
                )}

                <ContentSection
                  sectionId="project-content"
                  icon={Sparkles}
                  title={t.admin.content.groups.content}
                  description={t.admin.content.groups.contentDesc}
                >
                  <FormInput
                    label={t.admin.content.fields.title}
                    value={copy.title}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        translations: {
                          ...draft.translations,
                          [locale]: { ...copy, title: v },
                        },
                      })
                    }
                  />
                  <FormTextarea
                    label={t.admin.content.fields.description}
                    value={copy.description}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        translations: {
                          ...draft.translations,
                          [locale]: { ...copy, description: v },
                        },
                      })
                    }
                    rows={2}
                  />
                  <FormTextarea
                    label={t.admin.content.fields.longDescription}
                    value={copy.longDescription}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        translations: {
                          ...draft.translations,
                          [locale]: { ...copy, longDescription: v },
                        },
                      })
                    }
                    rows={5}
                  />
                </ContentSection>

                <ContentSection
                  sectionId="project-media"
                  icon={Image}
                  title={t.admin.content.groups.media}
                  description={t.admin.content.groups.mediaDesc}
                >
                  <FileUploadField
                    kind="project"
                    variant="project"
                    label={t.admin.content.fields.projectImage}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    value={draft.imageUrl}
                    storageKey={draft.slug}
                    onUrlChange={(url) => setDraft({ ...draft, imageUrl: url })}
                  />
                  <ContentFieldGrid>
                    <FormInput
                      label={t.admin.content.fields.githubUrl}
                      value={draft.githubUrl ?? ''}
                      onChange={(v) => setDraft({ ...draft, githubUrl: v || null })}
                    />
                    <FormInput
                      label={t.admin.content.fields.demoUrl}
                      value={draft.demoUrl ?? ''}
                      onChange={(v) => setDraft({ ...draft, demoUrl: v || null })}
                    />
                  </ContentFieldGrid>
                  <FormInput
                    label={t.admin.content.fields.tags}
                    value={draft.tags.join(', ')}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        tags: v.split(',').map((tag) => tag.trim()).filter(Boolean),
                      })
                    }
                  />
                </ContentSection>

                <ContentSection
                  sectionId="project-options"
                  icon={Settings}
                  title={t.admin.content.groups.options}
                  description={t.admin.content.groups.optionsDesc}
                >
                  <ContentFieldGrid>
                    <FormInput
                      label={t.admin.content.fields.year}
                      type="number"
                      value={draft.year}
                      onChange={(v) => setDraft({ ...draft, year: Number(v) || draft.year })}
                    />
                    <FormInput
                      label={t.admin.content.fields.sortOrder}
                      type="number"
                      value={draft.sortOrder}
                      onChange={(v) =>
                        setDraft({ ...draft, sortOrder: Number(v) || draft.sortOrder })
                      }
                    />
                  </ContentFieldGrid>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.featured}
                      onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                    />
                    {t.admin.content.fields.featured}
                  </label>
                </ContentSection>
              </div>
              </ContentSectionGroup>
              </div>

              <aside className="mt-5 lg:mt-0">
                <div className={stickyBelowToolbarClass}>
                  <ProjectPreviewCard
                    imageUrl={draft.imageUrl}
                    title={copy.title}
                    description={copy.description}
                    year={draft.year}
                    featured={draft.featured}
                  />
                </div>
              </aside>
            </div>
          </>
        )}
      </ContentMasterDetail>

      <ConfirmDeleteDialog
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={handleConfirmDelete}
        description={t.admin.content.confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
