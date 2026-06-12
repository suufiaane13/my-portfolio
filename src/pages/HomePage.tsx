import { Toaster } from 'sonner'
import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Education } from '@/components/sections/Education'
import { Experience } from '@/components/sections/Experience'
import { Hero } from '@/components/sections/Hero'
import { Interests } from '@/components/sections/Interests'
import { Projects } from '@/components/sections/Projects'
import { Skills } from '@/components/sections/Skills'
import { Analytics } from '@/components/shared/Analytics'
import { PortfolioAnalytics } from '@/components/shared/PortfolioAnalytics'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { SeoHead } from '@/components/shared/SeoHead'
import { PortfolioContentProvider } from '@/hooks/PortfolioContentProvider'
import { useTheme } from '@/hooks/useTheme'
import { useTranslation } from '@/i18n/LanguageProvider'

function HomePageContent() {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <>
      <SeoHead />
      <Analytics />
      <PortfolioAnalytics />

      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t.common.skipToContent}
      </a>

      <Navigation isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="min-h-screen bg-background">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Education />
        <Projects />
        <Interests />
        <Contact />
        <Footer />
      </main>

      <ScrollToTop />
      <Toaster richColors closeButton position="top-right" />
    </>
  )
}

export function HomePage() {
  return (
    <PortfolioContentProvider>
      <HomePageContent />
    </PortfolioContentProvider>
  )
}
