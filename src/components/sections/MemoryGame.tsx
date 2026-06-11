import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Grid2x2, Grid3x3, Play, RotateCcw, Trophy, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Section, SectionHeading } from '@/components/layout/Container'
import { SectionReveal } from '@/components/shared/SectionReveal'
import { Button } from '@/components/ui/Button'
import { CardIcon } from '@/components/sections/memory/CardIcons'
import { type CardId, type GridSize } from '@/data/memoryGame'
import { profile } from '@/data/profile'
import { useGameSounds } from '@/hooks/useGameSounds'
import { useMemoryGame } from '@/hooks/useMemoryGame'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import './MemoryGame.css'

function MemoryCard({
  cardId,
  label,
  isFlipped,
  isMatched,
  disabled,
  onClick,
  hiddenLabel,
}: {
  cardId: CardId
  label: string
  isFlipped: boolean
  isMatched: boolean
  disabled: boolean
  onClick: () => void
  hiddenLabel: string
}) {
  return (
    <button
      type="button"
      className={cn(
        'memory-card',
        (isFlipped || isMatched) && 'memory-card--flipped',
        isMatched && 'memory-card--matched',
      )}
      onClick={onClick}
      disabled={disabled || isMatched || isFlipped}
      aria-label={isFlipped || isMatched ? label : hiddenLabel}
      aria-pressed={isFlipped || isMatched}
    >
      <div className="memory-card__inner">
        <div className="memory-card__face memory-card__face--front" aria-hidden={isFlipped || isMatched}>
          <img
            src={profile.logo}
            alt=""
            className="memory-card__brand"
            width={56}
            height={56}
            decoding="async"
          />
        </div>
        <div className="memory-card__face memory-card__face--back" aria-hidden={!isFlipped && !isMatched}>
          <CardIcon id={cardId} />
        </div>
      </div>
    </button>
  )
}

export function MemoryGame() {
  const { t } = useTranslation()
  const [gridSize, setGridSize] = useState<GridSize>(4)
  const [hasGameStarted, setHasGameStarted] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const winMessageRef = useRef<HTMLDivElement>(null)
  const { play } = useGameSounds(soundOn)

  const {
    cards,
    moves,
    formattedTime,
    isLocked,
    isWon,
    matchedCount,
    pairCount,
    handleCardClick,
    restart,
  } = useMemoryGame({
    gridSize,
    onFlip: () => play('flip'),
    onMatch: () => play('match'),
    onMismatch: () => play('mismatch'),
    onWin: () => play('win'),
  })

  useEffect(() => {
    if (!isWon) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => {
      winMessageRef.current?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      })
    }, 200)

    return () => window.clearTimeout(timer)
  }, [isWon])

  const stats = useMemo(
    () => [
      { icon: Clock, label: t.memoryGame.time, value: formattedTime },
      { icon: RotateCcw, label: t.memoryGame.moves, value: String(moves) },
      {
        icon: Trophy,
        label: t.memoryGame.pairs,
        value: `${matchedCount}/${pairCount}`,
      },
    ],
    [formattedTime, matchedCount, moves, pairCount, t.memoryGame],
  )

  return (
    <Section id="memory-game" className="bg-background">
      <SectionHeading title={t.memoryGame.title} description={t.memoryGame.description} />

      <SectionReveal>
        <div className="memory-game mx-auto max-w-4xl p-5 sm:p-7 md:p-8">
          <div className="mb-5 flex flex-col gap-4 sm:mb-6">
            <div className="memory-game__toolbar" role="toolbar" aria-label={t.memoryGame.boardLabel}>
              <div className="memory-game__segment" role="group" aria-label={t.memoryGame.gridSizeLabel}>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    'memory-game__btn memory-game__segment-btn',
                    gridSize === 4 && 'memory-game__btn--active',
                  )}
                  onClick={() => setGridSize(4)}
                  aria-pressed={gridSize === 4}
                >
                  <Grid2x2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  4×4
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    'memory-game__btn memory-game__segment-btn',
                    gridSize === 6 && 'memory-game__btn--active',
                  )}
                  onClick={() => setGridSize(6)}
                  aria-pressed={gridSize === 6}
                >
                  <Grid3x3 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  6×6
                </Button>
              </div>

              <div className="memory-game__toolbar-spacer" aria-hidden="true" />

              <Button
                size="sm"
                variant="outline"
                className={cn(
                  'memory-game__btn memory-game__toolbar-action',
                  !soundOn && 'memory-game__toolbar-action--muted',
                )}
                onClick={() => setSoundOn((value) => !value)}
                aria-label={soundOn ? t.memoryGame.soundOff : t.memoryGame.soundOn}
                aria-pressed={soundOn}
              >
                {soundOn ? (
                  <Volume2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span className="memory-game__toolbar-action-label sm:sr-only">{t.memoryGame.sound}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="memory-game__btn memory-game__toolbar-action"
                onClick={restart}
              >
                <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="memory-game__toolbar-action-label">{t.memoryGame.restart}</span>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-center shadow-sm"
                  >
                    <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{stat.label}</span>
                    </div>
                    <p className="font-display text-lg font-bold tabular-nums text-foreground">
                      {stat.value}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="memory-game__board">
            <div
              className={cn(
                'memory-game__grid',
                gridSize === 4 ? 'memory-game__grid--4' : 'memory-game__grid--6',
                !hasGameStarted && 'memory-game__grid--idle',
              )}
              role="grid"
              aria-label={t.memoryGame.boardLabel}
            >
              {cards.map((card, index) => (
                <MemoryCard
                  key={card.uid}
                  cardId={card.cardId}
                  label={t.memoryGame.cards[card.cardId]}
                  isFlipped={card.isFlipped}
                  isMatched={card.isMatched}
                  disabled={!hasGameStarted || isLocked || isWon}
                  onClick={() => handleCardClick(index)}
                  hiddenLabel={t.memoryGame.hiddenCard}
                />
              ))}
            </div>

            <AnimatePresence>
              {!hasGameStarted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="memory-game__start"
                >
                  <img
                    src={profile.logo}
                    alt=""
                    className="memory-game__start-logo"
                    width={72}
                    height={72}
                    decoding="async"
                  />
                  <p className="memory-game__start-hint">{t.memoryGame.startHint}</p>
                  <Button
                    size="lg"
                    className="memory-game__start-btn"
                    onClick={() => setHasGameStarted(true)}
                  >
                    <Play className="h-5 w-5" aria-hidden="true" />
                    {t.memoryGame.start}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isWon && (
              <motion.div
                ref={winMessageRef}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="memory-win mt-6 rounded-2xl border p-6 text-center"
                tabIndex={-1}
              >
                <div className="memory-win__icon mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                  <Trophy className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">{t.memoryGame.winTitle}</h3>
                <p className="mt-2 text-base text-muted-foreground">{t.memoryGame.winMessage}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t.memoryGame.winStats
                    .replace('{{moves}}', String(moves))
                    .replace('{{time}}', formattedTime)}
                </p>
                <Button className="mt-5" onClick={restart}>
                  <RotateCcw className="h-4 w-4" />
                  {t.memoryGame.playAgain}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>
    </Section>
  )
}
