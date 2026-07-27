import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  Bot,
  Briefcase,
  ChevronRight,
  Code2,
  FileDown,
  FolderKanban,
  Gamepad2,
  GraduationCap,
  Mail,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { AdminDashboardFab } from '@/components/shared/AdminDashboardFab'
import { GithubIcon } from '@/components/shared/SocialIcons'
import { GUIDE_TOPIC_IDS, type GuideTopicId } from '@/lib/portfolioChat/guideTopics'
import { chunkIdForGuideProject, chunkIdForGuideTopic } from '@/lib/portfolioChat/guideAudio'
import type { ChatReplyAction } from '@/lib/portfolioChat/types'
import { usePortfolioGuide } from '@/hooks/usePortfolioGuide'
import { useGuideSpeech } from '@/hooks/useGuideSpeech'
import { useTranslation } from '@/i18n/LanguageProvider'
import type { Locale } from '@/i18n/types'
import { trackEvent } from '@/services/analytics'
import { cn, scrollToSection } from '@/lib/utils'
import './PortfolioChatWidget.css'

const TOPIC_ICONS: Record<GuideTopicId, typeof User> = {
  about: User,
  freelance: Briefcase,
  skills: Code2,
  projects: FolderKanban,
  experience: Briefcase,
  education: GraduationCap,
  contact: Mail,
  cv: FileDown,
  game: Gamepad2,
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

function renderMessageText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part.split('\n').map((line, lineIndex, arr) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < arr.length - 1 ? <br /> : null}
      </span>
    ))
  })
}

function GuideMark({
  sizeClass,
  animated = false,
}: {
  sizeClass: string
  animated?: boolean
}) {
  return (
    <span
      className={cn(
        'portfolio-guide-mark relative flex shrink-0 items-center justify-center rounded-full',
        'border-2 border-primary/40 bg-primary/15 text-primary shadow-sm shadow-primary/20',
        sizeClass,
      )}
      aria-hidden="true"
    >
      <Bot
        className={cn('h-[55%] w-[55%]', animated && 'portfolio-guide-mark__icon')}
        strokeWidth={2.25}
      />
    </span>
  )
}

function GuideActionButton({
  action,
  locale,
  onBeforeNavigate,
}: {
  action: ChatReplyAction
  locale: Locale
  onBeforeNavigate?: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    if (action.type === 'section' && action.sectionId) {
      const sectionId = action.sectionId
      onBeforeNavigate?.()

      const scroll = () => scrollToSection(`#${sectionId}`)

      const delay = location.pathname !== '/' ? 180 : 80
      if (location.pathname !== '/') {
        navigate('/')
      }
      window.setTimeout(scroll, delay)
      return
    }
    if (action.type === 'link' && action.href) {
      if (action.download) {
        const anchor = document.createElement('a')
        anchor.href = action.href
        anchor.download = action.download
        anchor.rel = 'noopener'
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        void trackEvent({ eventType: 'cv_download', path: '/', locale })
        return
      }
      onBeforeNavigate?.()
      if (action.href.startsWith('#')) {
        scrollToSection(action.href)
        return
      }
      if (action.href.startsWith('/')) {
        navigate(action.href)
        return
      }
      window.open(action.href, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="portfolio-chat-chip rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
    >
      {action.label}
    </button>
  )
}

export function PortfolioChatWidget() {
  const { t, locale } = useTranslation()
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const descId = useId()
  const liveId = useId()
  const fabRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)

  const {
    isOpen,
    toggle,
    close,
    view,
    reply,
    answerTitle,
    answerChunkId,
    relatedTopics,
    selectTopic,
    selectProject,
    backToMenu,
    backFromAnswer,
    topicLabels,
    projects,
    profile,
    intro,
    contentUnavailable,
  } = usePortfolioGuide()

  const handleSpeechFallback = useCallback(() => {
    toast.message(t.chatbot.audioFallback)
  }, [t.chatbot.audioFallback])

  const {
    supported: speechSupported,
    isSpeaking,
    manifestLoaded,
    preloadAnswer,
    toggleSpeech,
  } = useGuideSpeech({
    isOpen,
    view,
    locale,
    onFallback: handleSpeechFallback,
  })

  const handleSelectTopic = useCallback(
    (topicId: GuideTopicId) => {
      if (topicId === 'projects') {
        selectTopic(topicId)
        return
      }
      const result = selectTopic(topicId)
      if (!result) toast.error(contentUnavailable)
    },
    [contentUnavailable, selectTopic],
  )

  const handleSelectProject = useCallback(
    (slug: string, title: string) => {
      const result = selectProject(slug, title)
      if (!result) toast.error(contentUnavailable)
    },
    [contentUnavailable, selectProject],
  )

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) {
        fabRef.current?.focus()
      }
      wasOpenRef.current = false
      return
    }

    wasOpenRef.current = true
    document.body.style.overflow = 'hidden'

    const focusClose = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 40)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusClose)
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [close, isOpen])

  if (typeof document === 'undefined') return null

  const speechStatus = isSpeaking
    ? t.chatbot.speaking
    : speechSupported && !manifestLoaded
      ? t.chatbot.audioPreparing
      : ''

  return createPortal(
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className={cn(
              'portfolio-chat-fab-anchor fixed z-40 flex flex-col-reverse items-center gap-3',
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          >
            <motion.button
              ref={fabRef}
              type="button"
              className={cn(
                'flex items-center justify-center bg-transparent p-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
              onClick={toggle}
              aria-label={t.chatbot.open}
              whileHover={reduceMotion ? undefined : { scale: 1.06 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              <span
                className={cn(
                  'portfolio-chat-fab flex items-center justify-center rounded-full',
                  'border border-primary/30 bg-card p-1.5',
                  !reduceMotion && 'portfolio-chat-fab--live',
                )}
              >
                <GuideMark sizeClass="h-12 w-12" animated={!reduceMotion} />
              </span>
            </motion.button>
            <AdminDashboardFab />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="portfolio-chat-overlay fixed inset-0 z-[100] flex items-end justify-center sm:items-end sm:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm sm:bg-black/30"
              aria-label={t.chatbot.close}
              onClick={close}
              tabIndex={-1}
            />

            <motion.div
              ref={panelRef}
              className={cn(
                'portfolio-chat-panel relative z-10 flex w-full flex-col overflow-hidden',
                'border border-border bg-background sm:h-[520px] sm:max-h-[85vh] sm:w-[380px] sm:rounded-2xl',
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 320 }}
            >
              <header className="flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
                {view !== 'menu' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={view === 'answer' ? backFromAnswer : backToMenu}
                    aria-label={t.chatbot.backToMenu}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <GuideMark sizeClass="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <p id={titleId} className="truncate font-display text-sm font-semibold text-foreground">
                    {t.chatbot.title}
                  </p>
                  <p id={descId} className="truncate text-xs text-muted-foreground">
                    {t.chatbot.subtitle}
                  </p>
                </div>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  size="icon"
                  onClick={close}
                  aria-label={t.chatbot.close}
                >
                  <X className="h-5 w-5" />
                </Button>
              </header>

              <div
                id={liveId}
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
              >
                {view === 'answer' && reply ? `${answerTitle}. ${speechStatus}` : speechStatus}
              </div>

              <div className="portfolio-chat-messages flex-1 overflow-y-auto px-4 py-4">
                {view === 'menu' && (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">{intro}</p>
                    <div className="grid grid-cols-2 gap-2" role="list">
                      {GUIDE_TOPIC_IDS.map((topicId, index) => {
                        const Icon = TOPIC_ICONS[topicId]
                        const label = topicLabels[topicId]
                        const isLastOdd =
                          GUIDE_TOPIC_IDS.length % 2 === 1 && index === GUIDE_TOPIC_IDS.length - 1
                        return (
                          <button
                            key={topicId}
                            type="button"
                            role="listitem"
                            aria-label={label}
                            onPointerEnter={() => {
                              const chunkId = chunkIdForGuideTopic(topicId)
                              if (chunkId) preloadAnswer(chunkId)
                            }}
                            onClick={() => handleSelectTopic(topicId)}
                            className={cn(
                              'portfolio-guide-topic flex flex-col items-center gap-2 rounded-xl border border-border',
                              'bg-card/60 p-3 text-center transition-colors hover:border-primary/40 hover:bg-card',
                              isLastOdd && 'col-span-2 mx-auto w-[calc(50%-0.25rem)]',
                            )}
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="text-xs font-semibold leading-snug text-foreground">
                              {label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {view === 'projects' && (
                  <div className="space-y-3">
                    <p className="text-center text-sm font-medium text-foreground">{t.chatbot.chooseProject}</p>
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'portfolio-chat-chip flex items-center justify-center gap-2 rounded-xl border border-border',
                          'bg-card/60 px-3 py-2.5 text-sm font-medium text-muted-foreground',
                          'transition-colors hover:border-primary/40 hover:bg-card hover:text-foreground',
                        )}
                      >
                        <GithubIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>
                          {t.common.github}
                          {profile.githubHandle ? ` · ${profile.githubHandle}` : ''}
                        </span>
                      </a>
                    )}
                    <ul className="space-y-2">
                      {projects.map((project) => (
                        <li key={project.slug}>
                          <button
                            type="button"
                            aria-label={project.title}
                            onPointerEnter={() => preloadAnswer(chunkIdForGuideProject(project.slug))}
                            onClick={() => handleSelectProject(project.slug, project.title)}
                            className={cn(
                              'flex w-full items-center justify-between gap-3 rounded-xl border border-border',
                              'bg-card/60 px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-card',
                            )}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {project.title}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {project.year} · {project.tags.slice(0, 2).join(', ')}
                              </span>
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {view === 'answer' && reply && (
                  <div className="space-y-3" aria-live="polite">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-semibold text-foreground">{answerTitle}</h3>
                      {speechSupported && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-primary"
                          disabled={!manifestLoaded && !isSpeaking}
                          onClick={() => {
                            if (reply && answerChunkId) {
                              toggleSpeech(answerChunkId, answerTitle, reply.text)
                            }
                          }}
                          aria-label={isSpeaking ? t.chatbot.stopSpeech : t.chatbot.listenAgain}
                          aria-pressed={isSpeaking}
                          title={
                            !manifestLoaded && !isSpeaking
                              ? t.chatbot.audioPreparing
                              : isSpeaking
                                ? t.chatbot.speaking
                                : t.chatbot.listenAgain
                          }
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Volume2 className="h-4 w-4" aria-hidden="true" />
                          )}
                        </Button>
                      )}
                    </div>
                    {!manifestLoaded && speechSupported && (
                      <p className="text-xs text-muted-foreground">{t.chatbot.audioPreparing}</p>
                    )}
                    <div className="portfolio-chat-bubble--assistant rounded-2xl rounded-tl-md px-3.5 py-3 text-sm leading-relaxed">
                      {renderMessageText(reply.text)}
                      {reply.actions && reply.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {reply.actions.map((action) => (
                            <GuideActionButton
                              key={`${action.label}-${action.href ?? action.sectionId}`}
                              action={action}
                              locale={locale}
                              onBeforeNavigate={close}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {relatedTopics.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {t.chatbot.relatedTopics}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {relatedTopics.map((topicId) => (
                            <button
                              key={topicId}
                              type="button"
                              onClick={() => handleSelectTopic(topicId)}
                              className="portfolio-chat-chip rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                            >
                              {topicLabels[topicId]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
