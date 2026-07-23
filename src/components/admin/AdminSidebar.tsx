import {
  BarChart3,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Trophy,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
  { to: '/admin/scores', icon: Trophy, labelKey: 'scores' as const },
  { to: '/admin/newsletter', icon: Newspaper, labelKey: 'newsletter' as const },
]

function adminNavLinkClass(isActive: boolean) {
  return cn(
    'rounded-lg px-2.5 py-2 text-xs font-medium transition-colors xl:px-3 xl:text-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
  )
}

export function AdminSidebar() {
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const { signOut } = useAuth()
  const navigate = useNavigate()
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
          <Container className="flex h-16 items-center justify-between gap-3 md:h-[4.5rem]">
            <Link
              to="/admin"
              className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t.admin.title}
            >
              <BrandLogo size="sm" />
              <span className="hidden font-display text-sm font-semibold tracking-tight text-foreground sm:inline">
                {t.admin.title}
              </span>
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
          <div className="mb-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/12 via-card to-background p-4">
            <p className="font-display text-base font-bold tracking-tight">{t.admin.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.admin.navLabel}</p>
          </div>

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
