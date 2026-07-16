import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Newspaper,
  Sun,
  Trophy,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Sheet } from '@/components/ui/Sheet'
import { useAuth } from '@/hooks/AuthProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTheme } from '@/hooks/useTheme'
import { trackEvent } from '@/services/analytics'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, labelKey: 'dashboard' as const, end: true },
  { to: '/admin/content', icon: FileText, labelKey: 'content' as const },
  { to: '/admin/messages', icon: Mail, labelKey: 'messages' as const },
  { to: '/admin/analytics', icon: BarChart3, labelKey: 'analytics' as const },
  { to: '/admin/scores', icon: Trophy, labelKey: 'scores' as const },
  { to: '/admin/newsletter', icon: Newspaper, labelKey: 'newsletter' as const },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t, locale } = useTranslation()
  const { content } = usePortfolioContent()
  const { profile } = content
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleToggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    trackEvent({
      eventType: 'theme_switch',
      path: '/admin',
      locale,
      metadata: { theme: nextTheme },
    })
    toggleTheme()
  }

  const handleSignOut = async () => {
    await signOut()
    onNavigate?.()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <Link to="/" className="flex items-center gap-3" onClick={onNavigate}>
          <img src={profile.logoUrl} alt="" className="h-9 w-9 rounded-lg object-contain" />
          <div>
            <p className="font-display text-sm font-semibold text-foreground">{t.admin.title}</p>
            <p className="text-xs text-muted-foreground">{profile.name}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label={t.admin.navLabel}>
        {navItems.map(({ to, icon: Icon, labelKey, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t.admin.nav[labelKey]}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <button
          type="button"
          onClick={handleToggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={isDark ? t.theme.light : t.theme.dark}
        >
          {isDark ? (
            <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          {isDark ? t.admin.themeLight : t.admin.themeDark}
        </button>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t.admin.signOut}
        </button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const { t, locale } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleToggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    trackEvent({
      eventType: 'theme_switch',
      path: '/admin',
      locale,
      metadata: { theme: nextTheme },
    })
    toggleTheme()
  }

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <p className="font-display text-sm font-semibold">{t.admin.title}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={isDark ? t.theme.light : t.theme.dark}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground"
            aria-label={t.admin.openMenu}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Sheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title={t.admin.title}
        className="w-[min(100%,18rem)]"
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label={t.admin.closeMenu}
          >
            <X className="h-4 w-4" />
          </button>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </div>
      </Sheet>
    </>
  )
}
