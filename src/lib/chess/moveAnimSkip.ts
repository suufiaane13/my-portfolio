/**
 * Module flag so drag-drop can suppress the slide before React state updates.
 * Kept outside components to avoid circular imports and StrictMode remount races.
 */
let skipNextMoveAnim = false

export function markSkipMoveAnimation() {
  skipNextMoveAnim = true
}

/** Read without clearing — cleared only after the board records the move as shown. */
export function shouldSkipMoveAnimation(): boolean {
  return skipNextMoveAnim
}

export function clearSkipMoveAnimation() {
  skipNextMoveAnim = false
}
