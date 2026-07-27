import { Plus, Settings, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { ContentEditorToolbar, stickyBelowToolbarClass } from '@/components/admin/content/ContentEditorToolbar'
import {
  ContentMasterDetail,
  ContentMasterDetailBack,
} from '@/components/admin/content/ContentMasterDetail'
import { ContentFieldGrid, ContentSection, ContentSectionGroup } from '@/components/admin/content/ContentSection'
import { FormInput, FormTextarea } from '@/components/admin/content/FormField'
import { Card } from '@/components/ui/Card'
import type { Locale } from '@/i18n/types'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import {
  createAdminExperience,
  createEmptyExperience,
  deleteAdminExperience,
  fetchAdminExperiences,
  updateAdminExperience,
} from '@/services/admin/experiences'
import type { AdminExperience } from '@/types/adminContent'

const NEW_ITEM_ID = '__new__'

export function AdminExperiencePage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<AdminExperience[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AdminExperience | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [locale, setLocale] = useState<Locale>('fr')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await fetchAdminExperiences()
    setItems(data)
    if (selectedId && selectedId !== NEW_ITEM_ID) {
      const found = data.find((e) => e.slug === selectedId)
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
    document.title = `${t.admin.content.sections.experience.title} — ${t.admin.title}`
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t])

  const listItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.slug,
        title: item.translations.fr.role || item.slug,
        subtitle: item.translations.fr.company,
        published: item.published,
        meta: item.translations.fr.period,
      })),
    [items],
  )

  const handleSelect = (id: string) => {
    const item = items.find((e) => e.slug === id)
    if (!item) return
    setSelectedId(id)
    setDraft(structuredClone(item))
    setIsNew(false)
  }

  const handleCreate = () => {
    setSelectedId(NEW_ITEM_ID)
    setDraft(createEmptyExperience(items.length + 1))
    setIsNew(true)
  }

  const handleSave = async () => {
    if (!draft) return
    setIsSaving(true)

    if (isNew) {
      const slug = await createAdminExperience(draft)
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

    const ok = await updateAdminExperience(draft)
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
    const ok = await deleteAdminExperience(draft.slug)
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
        title={t.admin.content.sections.experience.title}
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
            {t.admin.content.createExperience}
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
                    sectionId="experience-identity"
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
                  sectionId="experience-content"
                  icon={Sparkles}
                  title={t.admin.content.groups.content}
                  description={t.admin.content.groups.contentDesc}
                >
                  <ContentFieldGrid>
                    <FormInput
                      label={t.admin.content.fields.period}
                      value={copy.period}
                      onChange={(v) =>
                        setDraft({
                          ...draft,
                          translations: {
                            ...draft.translations,
                            [locale]: { ...copy, period: v },
                          },
                        })
                      }
                    />
                    <FormInput
                      label={t.admin.content.fields.role}
                      value={copy.role}
                      onChange={(v) =>
                        setDraft({
                          ...draft,
                          translations: {
                            ...draft.translations,
                            [locale]: { ...copy, role: v },
                          },
                        })
                      }
                    />
                  </ContentFieldGrid>
                  <FormInput
                    label={t.admin.content.fields.company}
                    value={copy.company}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        translations: {
                          ...draft.translations,
                          [locale]: { ...copy, company: v },
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
                    rows={5}
                  />
                </ContentSection>

                <ContentSection
                  sectionId="experience-options"
                  icon={Settings}
                  title={t.admin.content.groups.options}
                  description={t.admin.content.groups.optionsDesc}
                >
                  <FormInput
                    label={t.admin.content.fields.technologies}
                    value={draft.technologies.join(', ')}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        technologies: v.split(',').map((x) => x.trim()).filter(Boolean),
                      })
                    }
                  />
                  <FormInput
                    label={t.admin.content.fields.projectSlug}
                    value={draft.projectSlug ?? ''}
                    onChange={(v) => setDraft({ ...draft, projectSlug: v || null })}
                  />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.isCurrent}
                  onChange={(e) => setDraft({ ...draft, isCurrent: e.target.checked })}
                />
                {t.admin.content.fields.isCurrent}
              </label>
              <FormInput
                label={t.admin.content.fields.sortOrder}
                type="number"
                value={draft.sortOrder}
                onChange={(v) => setDraft({ ...draft, sortOrder: Number(v) || draft.sortOrder })}
              />
                </ContentSection>
              </div>
              </ContentSectionGroup>
              </div>

              <aside className="mt-5 lg:mt-0">
                <Card className={cn(stickyBelowToolbarClass, 'p-5')}>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t.admin.content.preview}
                  </p>
                  <p className="mt-3 font-display text-lg font-semibold">{copy.role}</p>
                  <p className="text-sm text-primary">{copy.company}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{copy.period}</p>
                  <p className="mt-4 line-clamp-4 text-sm text-muted-foreground">{copy.description}</p>
                </Card>
              </aside>
            </div>
          </>
        )}
      </ContentMasterDetail>

      <ConfirmDeleteDialog
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={handleConfirmDelete}
        description={t.admin.content.confirmDeleteItem}
        isLoading={isDeleting}
      />
    </div>
  )
}
