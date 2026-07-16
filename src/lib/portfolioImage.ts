const AVATAR_FALLBACK_CHAIN = ['/hajji-bg.png', '/logo.png', '/favicon.svg'] as const

export function applyAvatarImageFallback(image: HTMLImageElement) {
  const index = Number(image.dataset.fallbackIndex ?? '0')
  const next = AVATAR_FALLBACK_CHAIN[index]
  if (!next) return

  image.dataset.fallbackIndex = String(index + 1)
  image.src = next
}
