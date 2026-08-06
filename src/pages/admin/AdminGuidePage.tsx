import {
  BookAudio,
  Briefcase,
  Cake,
  ClipboardList,
  Code,
  FileText,
  Gamepad2,
  Globe,
  GraduationCap,
  Loader2,
  Mail,
  Smartphone,
  User,
  UtensilsCrossed,
  Volume2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ContentEditorToolbar, stickyBelowToolbarClass } from '@/components/admin/content/ContentEditorToolbar'
import { ContentSection, ContentSectionGroup } from '@/components/admin/content/ContentSection'
import { FormTextarea } from '@/components/admin/content/FormField'
import { GuideAudioManager } from '@/components/admin/guide/GuideAudioManager'
import { useTranslation } from '@/i18n/LanguageProvider'
import type { Locale } from '@/i18n/types'
import type { GuideAudioManifest } from '@/lib/portfolioChat/guideAudio'
import { cn } from '@/lib/utils'
import {
  GUIDE_CHUNK_IDS,
  GEMINI_VOICES,
  DEFAULT_VOICES,
  fetchGuideScripts,
  fetchGuideManifest,
  saveGuideScript,
  getGuideAudioUrl,
  isAudioPresent,
  regenerateGuideAudio,
  deleteGuideAudioFile,
  loadGuideVoicePrefs,
  saveGuideVoicePrefs,
  type GuideScript,
  type GuideVoicePrefs,
} from '@/services/admin/guide'
import type { LucideIcon } from 'lucide-react'

const CHUNK_ICONS: Record<string, LucideIcon> = {
  'about-main': User,
  'about-availability': Briefcase,
  'skills-overview': Code,
  'experience-list': ClipboardList,
  'education-list': GraduationCap,
  'contact-main': Mail,
  'cv-download': FileText,
  'game-info': Gamepad2,
  'project-myfood': Smartphone,
  'project-pure-power-menu': UtensilsCrossed,
  'project-world-explorer': Globe,
  'project-sultan-kunafa': Cake,
}

export function AdminGuidePage() {
  const { t, locale: currentLocale } = useTranslation()
  const [scripts, setScripts] = useState<GuideScript[]>([])
  const [manifest, setManifest] = useState<GuideAudioManifest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [locale, setLocale] = useState<Locale>(currentLocale)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [voicePrefs, setVoicePrefs] = useState<GuideVoicePrefs>(DEFAULT_VOICES)
  const [isSavingVoices, setIsSavingVoices] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const [allScripts, manifestData] = await Promise.all([fetchGuideScripts(), fetchGuideManifest()])
    setScripts(allScripts)
    setManifest(manifestData)
    setVoicePrefs(loadGuideVoicePrefs())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    document.title = `${t.admin.guide.title} — ${t.admin.title}`
    void load()
  }, [t, load])

  const getScript = (chunkId: string): string => {
    if (drafts[chunkId] !== undefined) return drafts[chunkId]
    const match = scripts.find((s) => s.chunkId === chunkId && s.locale === locale)
    return match?.speechText ?? ''
  }

  const setDraft = (chunkId: string, text: string) => {
    setDrafts((prev) => ({ ...prev, [chunkId]: text }))
  }

  const hasChanges = Object.keys(drafts).length > 0

  const handleSave = async () => {
    setIsSaving(true)
    let allOk = true
    for (const [chunkId, text] of Object.entries(drafts)) {
      const ok = await saveGuideScript(chunkId, locale, text)
      if (!ok) allOk = false
    }
    setIsSaving(false)

    if (!allOk) {
      toast.error(t.admin.guide.scriptSaveError)
      return
    }
    toast.success(t.admin.guide.scriptSaved)
    setDrafts({})
    await load()
  }

  const handleSaveSingle = async (chunkId: string) => {
    const text = getScript(chunkId)
    setIsSaving(true)
    const ok = await saveGuideScript(chunkId, locale, text)
    setIsSaving(false)

    if (!ok) {
      toast.error(t.admin.guide.scriptSaveError)
      return
    }
    toast.success(t.admin.guide.scriptSaved)
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[chunkId]
      return next
    })
    await load()
  }

  const handleRegenerate = async (chunkId: string) => {
    const text = getScript(chunkId)
    if (!text) return false
    const voice = voicePrefs[locale]
    const result = await regenerateGuideAudio(chunkId, locale, text, voice)
    if (!result) {
      toast.error(t.admin.guide.audioRegenerateError)
      return false
    }
    toast.success(t.admin.guide.audioRegenerateSuccess)
    void load()
    return true
  }

  const handleDeleteAudio = async (chunkId: string) => {
    const ok = await deleteGuideAudioFile(chunkId, locale)
    if (!ok) {
      toast.error(t.admin.guide.audioDeleteError)
      return false
    }
    toast.success(t.admin.guide.audioDeleteSuccess)
    void load()
    return true
  }

  const handleVoiceChange = (lang: 'fr' | 'en', voice: string) => {
    setVoicePrefs((prev) => ({ ...prev, [lang]: voice }))
  }

  const handleSaveVoices = async () => {
    setIsSavingVoices(true)
    const ok = await saveGuideVoicePrefs(voicePrefs)
    setIsSavingVoices(false)
    if (!ok) {
      toast.error(t.admin.guide.scriptSaveError)
      return
    }
    toast.success(t.admin.guide.scriptSaved)
  }

  const totalAudioFiles = useMemo(
    () => Object.values(manifest?.files ?? {}).flat().length,
    [manifest],
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      </div>
    )
  }

  return (
    <div>
      <ContentEditorToolbar
        title={t.admin.guide.title}
        backTo="/admin/content"
        backLabel={t.admin.content.backToHub}
        locale={locale}
        onLocaleChange={setLocale}
        showPublished={false}
        onSave={hasChanges ? () => void handleSave() : undefined}
        isSaving={isSaving}
      />

      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2">
          <ContentSectionGroup>
            <div className="space-y-5">
            {GUIDE_CHUNK_IDS.map((chunkId) => {
              const script = scripts.find((s) => s.chunkId === chunkId && s.locale === locale)
              const draft = drafts[chunkId]
              const isDirty = draft !== undefined
              const Icon = CHUNK_ICONS[chunkId] ?? BookAudio

              return (
                <ContentSection
                  key={chunkId}
                  sectionId={`guide-${chunkId}`}
                  icon={Icon}
                  title={t.admin.guide.chunkIds[chunkId]}
                  description={chunkId}
                >
                  <div className="space-y-4">
                    <FormTextarea
                      label={`${t.admin.guide.scriptEditor} (${locale.toUpperCase()}) — ${(draft ?? script?.speechText ?? '').length}/2000`}
                      value={draft ?? script?.speechText ?? ''}
                      onChange={(v) => setDraft(chunkId, v)}
                      rows={5}
                    />

                    <div className="flex items-center gap-2">
                      {isDirty && (
                        <button
                          type="button"
                          onClick={() => void handleSaveSingle(chunkId)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                          {t.admin.guide.saveScript}
                        </button>
                      )}
                      {isDirty && (
                        <span className="text-xs text-amber-500">Modifié</span>
                      )}
                    </div>

                    <div className="border-t border-border/60 pt-4">
                      <GuideAudioManager
                        chunkId={chunkId}
                        locale={locale}
                        isPresent={isAudioPresent(manifest, chunkId, locale)}
                        audioUrl={getGuideAudioUrl(chunkId, locale)}
                        onRegenerate={() => handleRegenerate(chunkId)}
                        onDelete={() => handleDeleteAudio(chunkId)}
                      />
                    </div>
                  </div>
                </ContentSection>
              )
            })}
            </div>
          </ContentSectionGroup>
        </div>

        <aside className="hidden lg:block">
          <div className={cn(stickyBelowToolbarClass, 'space-y-4')}>
            {/* Voice selection */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Volume2 className="h-4 w-4 text-primary" />
                {t.admin.guide.voices}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {t.admin.guide.voiceFr}
                  </label>
                  <select
                    value={voicePrefs.fr}
                    onChange={(e) => handleVoiceChange('fr', e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {GEMINI_VOICES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {t.admin.guide.voiceEn}
                  </label>
                  <select
                    value={voicePrefs.en}
                    onChange={(e) => handleVoiceChange('en', e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {GEMINI_VOICES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSaveVoices()}
                  disabled={isSavingVoices}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSavingVoices && <Loader2 className="h-3 w-3 animate-spin" />}
                  {t.admin.guide.saveScript}
                </button>
              </div>
            </div>

            {/* Manifest info */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Volume2 className="h-4 w-4 text-primary" />
                {t.admin.guide.manifestInfo}
              </div>

              {manifest ? (
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t.admin.guide.generatedAt}</span>
                    <span className="font-medium text-foreground">
                      {new Date(manifest.generatedAt).toLocaleDateString(
                        locale === 'fr' ? 'fr-FR' : 'en-US',
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.admin.guide.fileCount.replace('{{count}}', String(totalAudioFiles))}</span>
                    <span className="font-medium text-foreground">
                      {Object.keys(manifest.files).map((l) => l.toUpperCase()).join(' + ')}
                    </span>
                  </div>
                  {manifest.provider && (
                    <div className="flex justify-between">
                      <span>{t.admin.guide.provider}</span>
                      <span className="font-medium text-foreground">{manifest.provider}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t.admin.guide.noScript}
                </p>
              )}
            </div>

            {/* Help card */}
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              <p>{t.admin.guide.subtitle}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
