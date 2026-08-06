import { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useTranslation } from '@/i18n/LanguageProvider'

interface GuideScriptEditorProps {
  chunkId: string
  locale: 'fr' | 'en'
  initialText: string
  onSave: (text: string) => Promise<boolean>
}

export function GuideScriptEditor({
  locale,
  initialText,
  onSave,
}: GuideScriptEditorProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(initialText)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)

  const handleChange = (value: string) => {
    setDraft(value)
    setHasChanged(value !== initialText)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const ok = await onSave(draft)
    setIsSaving(false)
    if (ok) setHasChanged(false)
    return ok
  }

  const charCount = draft.length
  const isOverLimit = charCount > 2000

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {t.admin.guide.scriptEditor} — {locale.toUpperCase()}
        </label>
        <span className="text-xs text-muted-foreground">
          {charCount}/2000
        </span>
      </div>

      <Textarea
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        rows={6}
        className="font-mono text-sm"
        disabled={isSaving}
      />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanged || isSaving || isOverLimit}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Save className="mr-2 h-3 w-3" />
          )}
          {t.admin.guide.saveScript}
        </Button>

        {hasChanged && (
          <span className="text-xs text-amber-500">Modifié</span>
        )}
      </div>
    </div>
  )
}
