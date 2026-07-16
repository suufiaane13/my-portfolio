import { ChevronRight, Gamepad2, LayoutDashboard, LogIn, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sheet } from '@/components/ui/Sheet'
import { Container } from '@/components/layout/Container'
import { NavOverlayProvider } from '@/components/layout/NavOverlayContext'
import {
  navActionClass,
  navActionGroupClass,
  navActionIconClass,
  navActionPillClass,
  navActionShellClass,
} from '@/components/layout/navActionStyles'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { GameButtonHint } from '@/components/shared/GameButtonHint'
import { applyAvatarImageFallback } from '@/lib/portfolioImage'
import { GithubIcon } from '@/components/shared/SocialIcons'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { navItems } from '@/data/navigation'
import { useAuth } from '@/hooks/AuthProvider'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useScrollSpy, useScrolled } from '@/hooks/useScrollSpy'
import { useTranslation } from '@/i18n/LanguageProvider'
import { markGameVisited } from '@/hooks/useGameButtonHint'
import { cn, scrollToSection } from '@/lib/utils'

interface NavigationProps {
  isDark: boolean
  onToggleTheme: () => void
}

export function Navigation({ isDark, onToggleTheme }: NavigationProps) {
  const { t } = useTranslation()
  const { content } = usePortfolioContent()
  const { profile } = content
  const { session } = useAuth()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isGamePage = location.pathname === '/game'
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password'
  const isAdminArea = location.pathname.startsWith('/admin')
  const authHref = session ? '/admin' : '/login'
  const authLabel = session ? t.nav.admin : t.nav.login
  const AuthIcon = session ? LayoutDashboard : LogIn
  const [menuOpen, setMenuOpen] = useState(false)
  const isScrolled = useScrolled()
  const activeSection = useScrollSpy(
    isHome ? ['hero', ...navItems.map((item) => item.href.slice(1))] : [],
  )

  const handleNavClick = (href: string) => {
    scrollToSection(href)
    setMenuOpen(false)
  }

  const navLinkClass = (href: string) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      activeSection === href.slice(1)
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
    )

  return (
    <NavOverlayProvider>
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          isScrolled || !isHome
            ? 'border-b border-border bg-background/90 backdrop-blur-md'
            : 'bg-transparent',
        )}
      >
        <Container className="flex h-16 items-center justify-between md:h-[4.5rem]">
          <Link
            to="/"
            onClick={(event) => {
              if (!isHome) return
              event.preventDefault()
              handleNavClick('#hero')
            }}
            className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${t.nav.home} — ${profile.name}`}
          >
            <BrandLogo size="sm" />
          </Link>

          {isHome && (
            <nav className="hidden items-center gap-1 lg:flex" aria-label={t.nav.mainNav}>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault()
                    handleNavClick(item.href)
                  }}
                  className={navLinkClass(item.href)}
                >
                  {t.nav[item.key]}
                </a>
              ))}
            </nav>
          )}

          <div className={navActionGroupClass}>
            <div className={navActionShellClass}>
              <GameButtonHint enabled={isHome && !isGamePage}>
                <Link
                  to="/game"
                  onClick={markGameVisited}
                  className={cn(
                    navActionClass({ active: isGamePage }),
                    navActionPillClass,
                    'hidden sm:inline-flex',
                  )}
                >
                  <Gamepad2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {t.nav.game}
                </Link>

                <Link
                  to="/game"
                  onClick={markGameVisited}
                  aria-label={t.nav.game}
                  className={cn(
                    navActionClass({ active: isGamePage }),
                    navActionIconClass,
                    'sm:hidden',
                  )}
                >
                  <Gamepad2 className="h-4 w-4" aria-hidden="true" />
                </Link>
              </GameButtonHint>
            </div>

            <div className={navActionShellClass}>
              <LanguageToggle />
            </div>

            <div className={navActionShellClass}>
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            </div>

            {!isAuthPage && (
              <div className={navActionShellClass}>
                <Link
                  to={authHref}
                  className={cn(
                    navActionClass({ active: isAdminArea || location.pathname === '/login' }),
                    navActionPillClass,
                    'hidden sm:inline-flex',
                  )}
                  aria-label={authLabel}
                >
                  <AuthIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {authLabel}
                </Link>
                <Link
                  to={authHref}
                  className={cn(
                    navActionClass({ active: isAdminArea || location.pathname === '/login' }),
                    navActionIconClass,
                    'sm:hidden',
                  )}
                  aria-label={authLabel}
                >
                  <AuthIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}

            {isHome && (
              <div className={navActionShellClass}>
                <button
                  type="button"
                  className={cn(navActionClass(), navActionIconClass, 'lg:hidden')}
                  onClick={() => setMenuOpen(true)}
                  aria-label={t.nav.menu}
                  aria-expanded={menuOpen}
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </Container>
      </header>

      <Sheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={<BrandLogo size="xs" />}
        ariaLabel={t.nav.menu}
      >
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/12 via-card to-background p-4 shadow-lg shadow-primary/5">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/25 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-10 left-4 h-20 w-20 rounded-full bg-primary/10 blur-xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-primary/30 bg-muted/50 shadow-md">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-full w-full object-cover object-[center_12%]"
                width={80}
                height={80}
                decoding="async"
                onError={(event) => {
                  applyAvatarImageFallback(event.currentTarget)
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base font-bold leading-tight tracking-tight">
                {profile.name}
              </p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{profile.title}</p>
            </div>
          </div>

          <div className="relative mt-4 border-t border-primary/15 pt-3 text-center">
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              {profile.githubHandle}
            </a>
          </div>
        </div>

        <nav className="space-y-1" aria-label={t.nav.mobileNav}>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault()
                  handleNavClick(item.href)
                }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                  activeSection === item.href.slice(1)
                    ? 'border-l-4 border-primary bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {t.nav[item.key]}
              </a>
            )
          })}

          <div className="mt-3 space-y-2 border-t border-border/80 pt-3 pb-6">
            <Link
              to="/game"
              onClick={() => {
                markGameVisited()
                setMenuOpen(false)
              }}
              className={cn(
                'group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isGamePage
                  ? 'border-primary/40 bg-primary/15 shadow-sm shadow-primary/10'
                  : 'border-primary/25 bg-primary/8 hover:border-primary/40 hover:bg-primary/12',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                  isGamePage
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/15 text-primary group-hover:bg-primary/20',
                )}
              >
                <Gamepad2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-left font-display text-sm font-semibold text-primary">
                {t.nav.game}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-primary/60 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <Link
              to={authHref}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'border-border bg-card/60 hover:border-primary/30 hover:bg-primary/5',
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <AuthIcon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-left font-display text-sm font-semibold text-foreground">
                {authLabel}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </nav>
      </Sheet>
    </>
    </NavOverlayProvider>
  )
}
