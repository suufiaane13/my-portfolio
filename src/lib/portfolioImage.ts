const AVATAR_FALLBACK_CHAIN = ['/hajji.png', '/logo.png', '/favicon.svg'] as const

export function applyAvatarImageFallback(image: HTMLImageElement) {
  let index = Number(image.dataset.fallbackIndex ?? '0')
  const current = new URL(image.currentSrc || image.src, window.location.origin).pathname

  while (index < AVATAR_FALLBACK_CHAIN.length) {
    const next = AVATAR_FALLBACK_CHAIN[index]
    index += 1
    image.dataset.fallbackIndex = String(index)
    if (next !== current) {
      image.src = next
      return
    }
  }
}
