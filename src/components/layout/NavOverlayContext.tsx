import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type NavOverlay = 'lang' | 'game-hint' | 'games'

interface NavOverlayContextValue {
  active: NavOverlay | null
  openOverlay: (overlay: NavOverlay) => void
  closeOverlay: () => void
  isLangOpen: boolean
  isGameHintOpen: boolean
  isGamesOpen: boolean
}

const NavOverlayContext = createContext<NavOverlayContextValue | null>(null)

export function NavOverlayProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<NavOverlay | null>(null)

  const openOverlay = useCallback((overlay: NavOverlay) => {
    setActive(overlay)
  }, [])

  const closeOverlay = useCallback(() => {
    setActive(null)
  }, [])

  const value = useMemo<NavOverlayContextValue>(
    () => ({
      active,
      openOverlay,
      closeOverlay,
      isLangOpen: active === 'lang',
      isGameHintOpen: active === 'game-hint',
      isGamesOpen: active === 'games',
    }),
    [active, closeOverlay, openOverlay],
  )

  return <NavOverlayContext.Provider value={value}>{children}</NavOverlayContext.Provider>
}

export function useNavOverlay() {
  const context = useContext(NavOverlayContext)
  if (!context) {
    throw new Error('useNavOverlay must be used within NavOverlayProvider')
  }
  return context
}
