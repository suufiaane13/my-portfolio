import {
  BarChart3,
  Check,
  ChevronDown,
  ChessKnight,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Trophy,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Sheet } from '@/components/ui/Sheet'
import { Container } from '@/components/layout/Container'
import { NavOverlayProvider, useNavOverlay } from '@/components/layout/NavOverlayContext'
import {
  navActionClass,
  navActionGroupClass,
  navActionIconClass,
  navActionPillClass,
  navActionShellClass,
} from '@/components/layout/navActionStyles'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useAuth } from '@/hooks/AuthProvider'
import { useTheme } from '@/hooks/useTheme'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, labelKey: 'dashboard' as const, end: true },
  { to: '/admin/content', icon: FileText, labelKey: 'content' as const },
  { to: '/admin/messages', icon: Mail, labelKey: 'messages' as const },
  { to: '/admin/analytics', icon: BarChart3, labelKey: 'analytics' as const },
  { to: '/admin/newsletter', icon: Newspaper, labelKey: 'newsletter' as const },
]

const gameNavOptions = [
  { to: '/admin/scores', labelKey: 'scores' as const, icon: Trophy },
  { to: '/admin/chess', labelKey: 'chess' as const, icon: ChessKnight },
] as const

function adminNavLinkClass(isActive: boolean) {
  return cn(
    'rounded-lg px-2.5 py-2 text-xs font-medium transition-colors xl:px-3 xl:text-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
  )
}

function AdminGamesToggle({ align = 'right' }: { align?: 'left' | 'right' }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { isGamesOpen, openOverlay, closeOverlay } = useNavOverlay()
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const reduceMotion = useReducedMotion()

  const activeOption =
    gameNavOptions.find(
      (option) =>
        location.pathname === option.to || location.pathname.startsWith(`${option.to}/`),
    ) ?? null

  const close = useCallback(() => closeOverlay(), [closeOverlay])

  const selectGame = useCallback(
    (to: string) => {
      if (to !== location.pathname) navigate(to)
      close()
    },
    [close, location.pathname, navigate],
  )

  useEffect(() => {
    if (!isGamesOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close, isGamesOpen])

  const label = activeOption ? t.admin.nav[activeOption.labelKey] : t.admin.nav.games

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (isGamesOpen ? close() : openOverlay('games'))}
        className={cn(
          navActionClass({ active: isGamesOpen || Boolean(activeOption) }),
          'h-9 shrink-0 gap-0.5 overflow-hidden px-2 text-[0.6875rem] font-bold tracking-wider',
        )}
        aria-label={t.admin.nav.games}
        aria-haspopup="listbox"
        aria-expanded={isGamesOpen}
        aria-controls={listboxId}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={label}
            initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block max-w-[6.5rem] truncate"
          >
            {label}
          </motion.span>
        </AnimatePresence>
        <ChevronDown
          className={cn(
            'h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200',
            isGamesOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isGamesOpen && (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-label={t.admin.nav.games}
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute top-[calc(100%+0.375rem)] z-[60] min-w-[10.5rem] overflow-hidden rounded-xl border border-border bg-card p-1 text-card-foreground shadow-lg',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {gameNavOptions.map(({ to, labelKey, icon: Icon }) => {
              const isSelected = activeOption?.to === to

              return (
                <button
                  key={to}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectGame(to)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{t.admin.nav[labelKey]}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AdminSidebar() {
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <NavOverlayProvider>
      <>
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md transition-all duration-300">
          <Container className="flex h-16 items-center justify-between gap-2 md:h-[4.5rem] md:gap-3">
            <Link
              to="/admin"
              className="flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t.admin.title}
            >
              <BrandLogo size="sm" />
            </Link>

            <nav
              className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
              aria-label={t.admin.navLabel}
            >
              {adminNavItems.map(({ to, labelKey, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => adminNavLinkClass(isActive)}
                >
                  {t.admin.nav[labelKey]}
                </NavLink>
              ))}
              <div className="ml-1">
                <AdminGamesToggle align="left" />
              </div>
            </nav>

            <div className={navActionGroupClass}>
              <div className={navActionShellClass}>
                <LanguageToggle />
              </div>

              <div className={navActionShellClass}>
                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              </div>

              <div className={cn(navActionShellClass, 'hidden sm:block')}>
                <Link
                  to="/"
                  className={cn(navActionClass(), navActionPillClass)}
                  aria-label={t.auth.backToSite}
                >
                  <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="hidden xl:inline">{t.auth.backToSite}</span>
                </Link>
              </div>

              <div className={cn(navActionShellClass, 'hidden sm:block')}>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className={cn(navActionClass(), navActionPillClass)}
                  aria-label={t.admin.signOut}
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="hidden xl:inline">{t.admin.signOut}</span>
                </button>
              </div>

              <div className={cn(navActionShellClass, 'sm:hidden')}>
                <Link
                  to="/"
                  className={cn(navActionClass(), navActionIconClass)}
                  aria-label={t.auth.backToSite}
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className={navActionShellClass}>
                <button
                  type="button"
                  className={cn(navActionClass(), navActionIconClass, 'lg:hidden')}
                  onClick={() => setMenuOpen(true)}
                  aria-label={t.admin.openMenu}
                  aria-expanded={menuOpen}
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </Container>
        </header>

        <Sheet
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          title={<BrandLogo size="xs" />}
          ariaLabel={t.admin.navLabel}
        >
          <nav className="space-y-1" aria-label={t.admin.navLabel}>
            {adminNavItems.map(({ to, icon: Icon, labelKey, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-l-4 border-primary bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {t.admin.nav[labelKey]}
              </NavLink>
            ))}

            <div className="pt-2">
              <p className="mb-2 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t.admin.nav.games}
              </p>
              <div
                role="listbox"
                aria-label={t.admin.nav.games}
                className="overflow-hidden rounded-xl border border-border bg-card p-1"
              >
                {gameNavOptions.map(({ to, labelKey, icon: Icon }) => {
                  const isSelected =
                    location.pathname === to || location.pathname.startsWith(`${to}/`)

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{t.admin.nav[labelKey]}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          </nav>

          <div className="mt-4 space-y-2 border-t border-border/80 pt-4 pb-6">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              {t.auth.backToSite}
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              {t.admin.signOut}
            </button>
          </div>
        </Sheet>
      </>
    </NavOverlayProvider>
  )
}
