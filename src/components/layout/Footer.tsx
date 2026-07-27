import { Container } from '@/components/layout/Container'
import { BrandLockup } from '@/components/shared/BrandLogo'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { getSocialLinkIcon } from '@/lib/socialLinkIcons'

export function Footer() {
  const { t } = useTranslation()
  const { content } = usePortfolioContent()
  const { profile, socialLinks } = content
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background py-10">
      <Container>
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <BrandLockup
            logoSize="md"
            titleClassName="text-lg font-bold"
            className="flex-col items-center text-center sm:flex-row sm:items-center sm:text-left lg:flex-row lg:items-center lg:text-left"
          />

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {socialLinks.map((social) => {
              const Icon = getSocialLinkIcon(social.iconKey)
              return (
                <a
                  key={social.slug}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  aria-label={social.label}
                >
                  <span className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="hidden text-sm font-medium sm:inline">{social.handle}</span>
                </a>
              )
            })}
          </div>

          <div className="text-center lg:text-right">
            <p className="text-sm text-muted-foreground">
              © {year} {profile.name}. {t.footer.rights}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
