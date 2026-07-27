const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type CmsValidationError =
  | 'slugRequired'
  | 'slugInvalid'
  | 'titleRequired'
  | 'urlInvalid'

export function normalizeSlugInput(slug: string): string {
  return slug.trim().toLowerCase().replace(/\s+/g, '-')
}

export function validateSlug(slug: string): CmsValidationError | null {
  const normalized = normalizeSlugInput(slug)
  if (!normalized) return 'slugRequired'
  if (!SLUG_PATTERN.test(normalized)) return 'slugInvalid'
  return null
}

export function validateRequiredText(value: string): CmsValidationError | null {
  if (!value.trim()) return 'titleRequired'
  return null
}

export function validateOptionalUrl(url: string): CmsValidationError | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  // Assets publics du site ou chemins relatifs depuis la racine
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return null
  }

  try {
    const parsed = new URL(trimmed)
    if (!['http:', 'https:'].includes(parsed.protocol)) return 'urlInvalid'
    return null
  } catch {
    return 'urlInvalid'
  }
}
