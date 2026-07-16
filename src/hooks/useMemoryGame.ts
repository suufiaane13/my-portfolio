import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getCardsForGrid,
  getPairCount,
  type CardId,
  type GridSize,
} from '@/data/memoryGame'

export interface GameCard {
  uid: string
  cardId: CardId
  isFlipped: boolean
  isMatched: boolean
}

/** Time to show both cards on a mismatch before flipping them back. */
export const MISMATCH_REVIEW_MS = 650

function shuffle<T>(items: T[]): T[] {
  const array = [...items]
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[array[index], array[randomIndex]] = [array[randomIndex], array[index]]
  }
  return array
}

function createDeck(size: GridSize): GameCard[] {
  const themes = getCardsForGrid(size)
  const pairs = themes.flatMap((theme) => [
    { uid: `${theme.id}-a`, cardId: theme.id },
    { uid: `${theme.id}-b`, cardId: theme.id },
  ])

  return shuffle(pairs).map((card) => ({
    ...card,
    isFlipped: false,
    isMatched: false,
  }))
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

type CardClickResult =
  | { kind: 'noop' }
  | { kind: 'flip'; cards: GameCard[] }
  | { kind: 'match'; cards: GameCard[]; isWon: boolean }
  | { kind: 'mismatch'; cards: GameCard[]; firstIndex: number; secondIndex: number }

function resolveCardClick(cards: GameCard[], index: number): CardClickResult {
  const target = cards[index]
  if (!target || target.isMatched || target.isFlipped) {
    return { kind: 'noop' }
  }

  const openIndices = cards
    .map((card, cardIndex) => (card.isFlipped && !card.isMatched ? cardIndex : -1))
    .filter((cardIndex) => cardIndex >= 0)

  if (openIndices.length >= 2) {
    return { kind: 'noop' }
  }

  const next = cards.map((card, cardIndex) =>
    cardIndex === index ? { ...card, isFlipped: true } : card,
  )

  const newOpenIndices = next
    .map((card, cardIndex) => (card.isFlipped && !card.isMatched ? cardIndex : -1))
    .filter((cardIndex) => cardIndex >= 0)

  if (newOpenIndices.length < 2) {
    return { kind: 'flip', cards: next }
  }

  const [firstIndex, secondIndex] = newOpenIndices

  if (next[firstIndex].cardId === next[secondIndex].cardId) {
    const matched = next.map((card, cardIndex) =>
      cardIndex === firstIndex || cardIndex === secondIndex
        ? { ...card, isMatched: true, isFlipped: true }
        : card,
    )

    return {
      kind: 'match',
      cards: matched,
      isWon: matched.every((card) => card.isMatched),
    }
  }

  return { kind: 'mismatch', cards: next, firstIndex, secondIndex }
}

interface UseMemoryGameOptions {
  gridSize: GridSize
  onFlip?: () => void
  onMatch?: () => void
  onMismatch?: () => void
  onWin?: () => void
}

export function useMemoryGame({
  gridSize,
  onFlip,
  onMatch,
  onMismatch,
  onWin,
}: UseMemoryGameOptions) {
  const [cards, setCards] = useState<GameCard[]>(() => createDeck(gridSize))
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const [mismatchIndices, setMismatchIndices] = useState<[number, number] | null>(null)
  const mismatchTimeoutRef = useRef<number | null>(null)

  const pairCount = getPairCount(gridSize)
  const matchedCount = useMemo(() => cards.filter((card) => card.isMatched).length / 2, [cards])

  const clearMismatchTimeout = useCallback(() => {
    if (mismatchTimeoutRef.current !== null) {
      window.clearTimeout(mismatchTimeoutRef.current)
      mismatchTimeoutRef.current = null
    }
  }, [])

  const resetGame = useCallback(
    (size: GridSize) => {
      clearMismatchTimeout()
      setCards(createDeck(size))
      setMoves(0)
      setSeconds(0)
      setIsLocked(false)
      setHasStarted(false)
      setIsWon(false)
      setMismatchIndices(null)
    },
    [clearMismatchTimeout],
  )

  const restart = useCallback(() => {
    resetGame(gridSize)
  }, [gridSize, resetGame])

  useEffect(() => {
    resetGame(gridSize)
  }, [gridSize, resetGame])

  useEffect(() => {
    if (!hasStarted || isWon) return

    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [hasStarted, isWon])

  useEffect(() => () => clearMismatchTimeout(), [clearMismatchTimeout])

  const handleCardClick = useCallback(
    (index: number) => {
      if (isLocked || isWon) return

      const result = resolveCardClick(cards, index)
      if (result.kind === 'noop') return

      onFlip?.()
      if (!hasStarted) setHasStarted(true)
      setCards(result.cards)

      if (result.kind === 'flip') return

      setMoves((value) => value + 1)

      if (result.kind === 'match') {
        onMatch?.()
        if (result.isWon) {
          setIsWon(true)
          onWin?.()
        }
        return
      }

      onMismatch?.()
      setIsLocked(true)
      setMismatchIndices([result.firstIndex, result.secondIndex])

      clearMismatchTimeout()
      mismatchTimeoutRef.current = window.setTimeout(() => {
        mismatchTimeoutRef.current = null
        setCards((latest) =>
          latest.map((card, cardIndex) =>
            cardIndex === result.firstIndex || cardIndex === result.secondIndex
              ? { ...card, isFlipped: false }
              : card,
          ),
        )
        setMismatchIndices(null)
        setIsLocked(false)
      }, MISMATCH_REVIEW_MS)
    },
    [
      cards,
      clearMismatchTimeout,
      hasStarted,
      isLocked,
      isWon,
      onFlip,
      onMatch,
      onMismatch,
      onWin,
    ],
  )

  return {
    cards,
    moves,
    seconds,
    formattedTime: formatTime(seconds),
    isLocked,
    isWon,
    matchedCount,
    pairCount,
    mismatchIndices,
    handleCardClick,
    restart,
  }
}
