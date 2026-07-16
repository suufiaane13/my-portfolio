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
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { GithubIcon } from '@/components/shared/SocialIcons'
import { GUIDE_TOPIC_IDS, type GuideTopicId } from '@/lib/portfolioChat/guideTopics'
import { chunkIdForGuideTopic } from '@/lib/portfolioChat/guideAudio'
import type { ChatReplyAction } from '@/lib/portfolioChat/types'
import { usePortfolioGuide } from '@/hooks/usePortfolioGuide'
import { useGuideSpeech } from '@/hooks/useGuideSpeech'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
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

function GuideActionButton({ action }: { action: ChatReplyAction }) {
  const handleClick = () => {
    if (action.type === 'section' && action.sectionId) {
      const el = document.getElementById(action.sectionId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (action.type === 'link' && action.href) {
      if (action.href.startsWith('/') || action.href.startsWith('#')) {
        window.location.href = action.href
      } else {
        window.open(action.href, '_blank', 'noopener,noreferrer')
      }
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
  const {
    isOpen,
    toggle,
    close,
    view,
    reply,
    answerTitle,
    answerChunkId,
    selectTopic,
    selectProject,
    backToMenu,
    backFromAnswer,
    topicLabels,
    projects,
    profile,
    intro,
  } = usePortfolioGuide()

  const { supported: speechSupported, isSpeaking, speakAnswer, preloadAnswer, toggleSpeech } = useGuideSpeech({
    isOpen,
    view,
    locale,
  })

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [close, isOpen])

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9, y: 12 }}
            className={cn(
              'fixed bottom-6 left-6 z-40 flex items-center justify-center bg-transparent p-0',
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
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center sm:items-end sm:justify-start sm:p-6 sm:pb-6 sm:pl-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={t.chatbot.title}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm sm:bg-black/30"
              aria-label={t.chatbot.close}
              onClick={close}
            />

            <motion.div
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
                  <p className="truncate font-display text-sm font-semibold text-foreground">
                    {t.chatbot.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{t.chatbot.subtitle}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={close} aria-label={t.chatbot.close}>
                  <X className="h-5 w-5" />
                </Button>
              </header>

              <div className="portfolio-chat-messages flex-1 overflow-y-auto px-4 py-4">
                {view === 'menu' && (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">{intro}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {GUIDE_TOPIC_IDS.map((topicId, index) => {
                        const Icon = TOPIC_ICONS[topicId]
                        const isLastOdd =
                          GUIDE_TOPIC_IDS.length % 2 === 1 && index === GUIDE_TOPIC_IDS.length - 1
                        return (
                          <button
                            key={topicId}
                            type="button"
                            onPointerEnter={() => {
                              const chunkId = chunkIdForGuideTopic(topicId)
                              if (chunkId) preloadAnswer(chunkId)
                            }}
                            onClick={() => {
                              const answer = selectTopic(topicId)
                              if (answer) speakAnswer(answer.chunkId, answer.title, answer.text)
                            }}
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
                              {topicLabels[topicId]}
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
                            onPointerEnter={() => preloadAnswer(`project-${project.slug}`)}
                            onClick={() => {
                              const answer = selectProject(project.slug, project.title)
                              if (answer) speakAnswer(answer.chunkId, answer.title, answer.text)
                            }}
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
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {view === 'answer' && reply && (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-semibold text-foreground">{answerTitle}</h3>
                      {speechSupported && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-primary"
                          onClick={() => {
                            if (reply && answerChunkId) {
                              toggleSpeech(answerChunkId, answerTitle, reply.text)
                            }
                          }}
                          aria-label={isSpeaking ? t.chatbot.stopSpeech : t.chatbot.listenAgain}
                          aria-pressed={isSpeaking}
                          title={isSpeaking ? t.chatbot.speaking : t.chatbot.listenAgain}
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Volume2 className="h-4 w-4" aria-hidden="true" />
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="portfolio-chat-bubble--assistant rounded-2xl rounded-tl-md px-3.5 py-3 text-sm leading-relaxed">
                      {renderMessageText(reply.text)}
                      {reply.actions && reply.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {reply.actions.map((action) => (
                            <GuideActionButton
                              key={`${action.label}-${action.href ?? action.sectionId}`}
                              action={action}
                            />
                          ))}
                        </div>
                      )}
                    </div>
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
