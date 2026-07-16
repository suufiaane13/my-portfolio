export type UiTransitionKind = 'theme' | 'locale'

export interface UiTransitionOrigin {
  x: number
  y: number
}

export function runViewTransition(
  update: () => void,
  origin?: UiTransitionOrigin,
  kind: UiTransitionKind = 'theme',
): void {
  const root = document.documentElement

  if (origin) {
    root.style.setProperty('--ui-switch-x', `${origin.x}px`)
    root.style.setProperty('--ui-switch-y', `${origin.y}px`)
  }

  root.dataset.uiTransition = kind

  const cleanup = () => {
    delete root.dataset.uiTransition
    root.style.removeProperty('--ui-switch-x')
    root.style.removeProperty('--ui-switch-y')
  }

  if (typeof document.startViewTransition !== 'function') {
    update()
    cleanup()
    return
  }

  const transition = document.startViewTransition(update)
  void transition.finished.finally(cleanup)
}

export function getPointerOrigin(event: { clientX: number; clientY: number }): UiTransitionOrigin {
  return { x: event.clientX, y: event.clientY }
}
