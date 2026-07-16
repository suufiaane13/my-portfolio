import { Layers, Plus, Settings, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { ContentEditorToolbar } from '@/components/admin/content/ContentEditorToolbar'
import {
  ContentMasterDetail,
  ContentMasterDetailBack,
} from '@/components/admin/content/ContentMasterDetail'
import { ContentFieldGrid, ContentSection, ContentSectionGroup } from '@/components/admin/content/ContentSection'
import { FormInput, FormTextarea } from '@/components/admin/content/FormField'
import { PublishedToggle } from '@/components/admin/content/PublishedToggle'
import { Badge } from '@/components/ui/Badge'
import type { Locale } from '@/i18n/types'
import { useTranslation } from '@/i18n/LanguageProvider'
import {
  createAdminSkill,
  createAdminSkillCategory,
  createEmptySkill,
  createEmptySkillCategory,
  deleteAdminSkill,
  deleteAdminSkillCategory,
  fetchAdminSkillCategories,
  updateAdminSkill,
  updateAdminSkillCategory,
} from '@/services/admin/skills'
import type { AdminSkillCategory } from '@/types/adminContent'

const NEW_ITEM_ID = '__new__'

export function AdminSkillsPage() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<AdminSkillCategory[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AdminSkillCategory | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [newSkillIds, setNewSkillIds] = useState<Set<string>>(new Set())
  const [removedSkillIds, setRemovedSkillIds] = useState<string[]>([])
  const [locale, setLocale] = useState<Locale>('fr')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await fetchAdminSkillCategories()
    setCategories(data)
    if (selectedId && selectedId !== NEW_ITEM_ID) {
      const found = data.find((c) => c.slug === selectedId)
      if (found) {
        setDraft(structuredClone(found))
        setNewSkillIds(new Set())
        setRemovedSkillIds([])
      } else {
        setSelectedId(null)
        setDraft(null)
        setIsNew(false)
      }
    }
    setIsLoading(false)
  }, [selectedId])

  useEffect(() => {
    document.title = `${t.admin.content.sections.skills.title} — ${t.admin.title}`
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t])

  const listItems = useMemo(
    () =>
      categories.map((c) => ({
        id: c.slug,
        title: c.translations.fr.title || c.slug,
        subtitle: `${c.skills.length} ${t.admin.content.fields.skills}`,
        published: c.published,
      })),
    [categories, t],
  )

  const handleSelect = (id: string) => {
    const item = categories.find((c) => c.slug === id)
    if (!item) return
    setSelectedId(id)
    setDraft(structuredClone(item))
    setIsNew(false)
    setNewSkillIds(new Set())
    setRemovedSkillIds([])
  }

  const handleCreate = () => {
    setSelectedId(NEW_ITEM_ID)
    setDraft(createEmptySkillCategory(categories.length + 1))
    setIsNew(true)
    setNewSkillIds(new Set())
    setRemovedSkillIds([])
  }

  const handleAddSkill = () => {
    if (!draft) return
    const skill = createEmptySkill(draft.skills.length + 1)
    setDraft({ ...draft, skills: [...draft.skills, skill] })
    setNewSkillIds((prev) => new Set(prev).add(skill.id))
  }

  const handleRemoveSkill = (skillId: string) => {
    if (!draft) return
    if (!newSkillIds.has(skillId)) {
      setRemovedSkillIds((prev) => [...prev, skillId])
    } else {
      setNewSkillIds((prev) => {
        const next = new Set(prev)
        next.delete(skillId)
        return next
      })
    }
    setDraft({ ...draft, skills: draft.skills.filter((s) => s.id !== skillId) })
  }

  const handleSave = async () => {
    if (!draft) return
    setIsSaving(true)

    if (isNew) {
      const slug = await createAdminSkillCategory(draft)
      if (!slug) {
        setIsSaving(false)
        toast.error(t.admin.content.saveError)
        return
      }
      for (const skill of draft.skills) {
        await createAdminSkill(slug, skill)
      }
      setIsSaving(false)
      toast.success(t.admin.content.createSuccess)
      setIsNew(false)
      setSelectedId(slug)
      await load()
      return
    }

    const ok = await updateAdminSkillCategory(draft)
    if (ok) {
      for (const skillId of removedSkillIds) {
        await deleteAdminSkill(skillId)
      }
      for (const skill of draft.skills) {
        if (newSkillIds.has(skill.id)) {
          await createAdminSkill(draft.slug, skill)
        } else {
          await updateAdminSkill(draft.slug, skill)
        }
      }
    }
    setIsSaving(false)
    if (!ok) {
      toast.error(t.admin.content.saveError)
      return
    }
    toast.success(t.admin.content.saveSuccess)
    setNewSkillIds(new Set())
    setRemovedSkillIds([])
    await load()
  }

  const handleDelete = async () => {
    if (!draft || isNew) return
    if (!window.confirm(t.admin.content.confirmDeleteItem)) return

    const ok = await deleteAdminSkillCategory(draft.slug)
    if (!ok) {
      toast.error(t.admin.content.deleteError)
      return
    }
    toast.success(t.admin.content.deleteSuccess)
    setSelectedId(null)
    setDraft(null)
    setIsNew(false)
    await load()
  }

  return (
    <div>
      <ContentEditorToolbar
        title={t.admin.content.sections.skills.title}
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
            {t.admin.content.createCategory}
          </Button>
        }
      >
        {draft && (
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
                  onClick={() => void handleDelete()}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {t.admin.content.delete}
                </Button>
              </div>
            )}

            <ContentSectionGroup>
            <div className="space-y-5">
              {isNew && (
                <ContentSection
                  sectionId="skills-identity"
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
                sectionId="skills-content"
                icon={Sparkles}
                title={t.admin.content.groups.content}
                description={t.admin.content.groups.contentDesc}
              >
                <FormInput
                  label={t.admin.content.fields.title}
                  value={draft.translations[locale].title}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      translations: {
                        ...draft.translations,
                        [locale]: { ...draft.translations[locale], title: v },
                      },
                    })
                  }
                />
                <FormTextarea
                  label={t.admin.content.fields.description}
                  value={draft.translations[locale].description}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      translations: {
                        ...draft.translations,
                        [locale]: { ...draft.translations[locale], description: v },
                      },
                    })
                  }
                  rows={2}
                />
              </ContentSection>

              <ContentSection
                sectionId="skills-list"
                icon={Layers}
                title={t.admin.content.fields.skills}
                description={t.admin.content.groups.optionsDesc}
              >
                <Button type="button" size="sm" variant="outline" onClick={handleAddSkill} className="mb-3">
                  <Plus className="h-4 w-4" />
                  {t.admin.content.createSkill}
                </Button>
                <div className="flex flex-wrap gap-2">
                  {draft.skills.map((skill, index) => (
                    <div
                      key={skill.id}
                      className="w-full rounded-xl border border-border p-3 sm:w-auto sm:min-w-[14rem] sm:flex-1"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <input
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                          value={skill.name}
                          onChange={(e) => {
                            const skills = [...draft.skills]
                            skills[index] = { ...skill, name: e.target.value }
                            setDraft({ ...draft, skills })
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="shrink-0 rounded-lg p-2 text-destructive hover:bg-destructive/10"
                          aria-label={t.admin.content.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-1 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={skill.isCore}
                            onChange={(e) => {
                              const skills = [...draft.skills]
                              skills[index] = { ...skill, isCore: e.target.checked }
                              setDraft({ ...draft, skills })
                            }}
                          />
                          {t.admin.content.fields.isCore}
                        </label>
                        <PublishedToggle
                          published={skill.published}
                          onChange={(value) => {
                            const skills = [...draft.skills]
                            skills[index] = { ...skill, published: value }
                            setDraft({ ...draft, skills })
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ContentSection>

              <ContentSection
                sectionId="skills-options"
                icon={Settings}
                title={t.admin.content.groups.options}
              >
                <ContentFieldGrid>
                  <FormInput
                    label={t.admin.content.fields.sortOrder}
                    type="number"
                    value={draft.sortOrder}
                    onChange={(v) =>
                      setDraft({ ...draft, sortOrder: Number(v) || draft.sortOrder })
                    }
                  />
                  <div className="flex items-end">
                    <Badge className="mb-2">
                      {draft.skills.filter((s) => s.isCore).length} core
                    </Badge>
                  </div>
                </ContentFieldGrid>
              </ContentSection>
            </div>
            </ContentSectionGroup>
          </>
        )}
      </ContentMasterDetail>
    </div>
  )
}
