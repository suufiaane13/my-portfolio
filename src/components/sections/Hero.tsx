import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { GithubIcon, WhatsAppIcon } from '@/components/shared/SocialIcons'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { HeroBackground } from '@/components/sections/HeroBackground'
import { WaveDivider } from '@/components/shared/WaveDivider'
import { whatsapp } from '@/data/contact'
import { profile } from '@/data/profile'
import { useTranslation } from '@/i18n/LanguageProvider'
import { scrollToSection } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Hero() {
  const { t } = useTranslation()

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden bg-background pt-16 md:pt-[4.5rem]"
    >
      <div className="absolute inset-0">
        <HeroBackground className="h-full w-full" />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[clamp(3.5rem,10vw,6rem)] bg-gradient-to-b from-transparent via-background/40 to-section-alt"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5]">
        <WaveDivider fill="section-alt" />
      </div>

      <Container className="relative z-10 py-16 text-center">
        <motion.h1
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          custom={0.16}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-4 max-w-3xl text-lg font-medium text-primary sm:text-xl md:text-2xl"
        >
          {t.profile.title}
        </motion.p>

        <motion.p
          custom={0.24}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {t.profile.tagline}
        </motion.p>

        <motion.div
          custom={0.32}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-10 flex flex-row flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" onClick={() => scrollToSection('#projects')}>
            {t.hero.viewProjects}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => scrollToSection('#contact')}>
            {t.hero.contactMe}
          </Button>
        </motion.div>

        <motion.div
          custom={0.4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-8 flex justify-center gap-3"
        >
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            aria-label={t.common.github}
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <a
            href={whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            aria-label={t.contact.labels.whatsapp}
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </motion.div>

        <motion.div
          custom={0.48}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-16 flex justify-center"
        >
          <button
            type="button"
            onClick={() => scrollToSection('#about')}
            className="inline-flex flex-col items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            aria-label={t.hero.aboutAria}
          >
            <span>{t.common.discover}</span>
            <ArrowDown className="h-5 w-5 animate-bounce" />
          </button>
        </motion.div>
      </Container>
    </section>
  )
}
