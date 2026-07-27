import { getSupabase } from '@/lib/supabase'

export const PORTFOLIO_STORAGE_BUCKET = 'portfolio'

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const CV_MAX_BYTES = 10 * 1024 * 1024
export const PROJECT_IMAGE_MAX_BYTES = 5 * 1024 * 1024

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const CV_MIME_TYPES = new Set(['application/pdf'])

export type PortfolioUploadKind = 'avatar' | 'cv' | 'project' | 'logo'

export type PortfolioUploadError =
  | 'not_configured'
  | 'invalid_type'
  | 'too_large'
  | 'upload_failed'
  | 'missing_slug'

function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'application/pdf':
      return 'pdf'
    default:
      return 'bin'
  }
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/\s+/g, '-')
}

function objectPath(kind: PortfolioUploadKind, ext: string, storageKey?: string): string | null {
  switch (kind) {
    case 'avatar':
      return `avatar/main.${ext}`
    case 'cv':
      return `cv/main.${ext}`
    case 'logo':
      return `logo/main.${ext}`
    case 'project': {
      const slug = normalizeSlug(storageKey ?? '')
      if (!slug) return null
      return `projects/${slug}.${ext}`
    }
    default:
      return null
  }
}

export function validatePortfolioUpload(
  kind: PortfolioUploadKind,
  file: File,
): PortfolioUploadError | null {
  const isImage = kind === 'cv' ? false : true
  const allowed = isImage ? IMAGE_MIME_TYPES : CV_MIME_TYPES
  const maxBytes =
    kind === 'cv'
      ? CV_MAX_BYTES
      : kind === 'project'
        ? PROJECT_IMAGE_MAX_BYTES
        : AVATAR_MAX_BYTES

  if (!allowed.has(file.type)) return 'invalid_type'
  if (file.size > maxBytes) return 'too_large'
  return null
}

export async function uploadPortfolioAsset(
  kind: PortfolioUploadKind,
  file: File,
  options?: { storageKey?: string },
): Promise<{ publicUrl: string; filename: string } | PortfolioUploadError> {
  const supabase = getSupabase()
  if (!supabase) return 'not_configured'

  const validationError = validatePortfolioUpload(kind, file)
  if (validationError) return validationError

  const ext = extensionForMime(file.type)
  const objectPathValue = objectPath(kind, ext, options?.storageKey)
  if (!objectPathValue) return 'missing_slug'

  const { error } = await supabase.storage
    .from(PORTFOLIO_STORAGE_BUCKET)
    .upload(objectPathValue, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: '3600',
    })

  if (error) {
    console.error('[admin] storage upload failed', error)
    return 'upload_failed'
  }

  const { data } = supabase.storage.from(PORTFOLIO_STORAGE_BUCKET).getPublicUrl(objectPathValue)
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`
  const filename =
    kind === 'cv'
      ? file.name.trim() || `CV.${ext}`
      : kind === 'project'
        ? `${normalizeSlug(options?.storageKey ?? 'project')}.${ext}`
        : `${kind}.${ext}`

  return { publicUrl, filename }
}
