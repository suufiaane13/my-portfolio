import { useCallback, useEffect, useMemo, useState } from 'react'
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

  const pairCount = getPairCount(gridSize)
  const matchedCount = useMemo(() => cards.filter((card) => card.isMatched).length / 2, [cards])

  const resetGame = useCallback((size: GridSize) => {
    setCards(createDeck(size))
    setMoves(0)
    setSeconds(0)
    setIsLocked(false)
    setHasStarted(false)
    setIsWon(false)
  }, [])

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

  const handleCardClick = useCallback(
    (index: number) => {
      if (isLocked || isWon) return

      setCards((current) => {
        const target = current[index]
        if (!target || target.isMatched || target.isFlipped) return current

        const openIndices = current
          .map((card, cardIndex) => (card.isFlipped && !card.isMatched ? cardIndex : -1))
          .filter((cardIndex) => cardIndex >= 0)

        if (openIndices.length >= 2) return current

        const next = current.map((card, cardIndex) =>
          cardIndex === index ? { ...card, isFlipped: true } : card,
        )

        onFlip?.()
        if (!hasStarted) setHasStarted(true)

        const newOpenIndices = next
          .map((card, cardIndex) => (card.isFlipped && !card.isMatched ? cardIndex : -1))
          .filter((cardIndex) => cardIndex >= 0)

        if (newOpenIndices.length < 2) return next

        const [firstIndex, secondIndex] = newOpenIndices
        setMoves((value) => value + 1)
        setIsLocked(true)

        if (next[firstIndex].cardId === next[secondIndex].cardId) {
          onMatch?.()
          const matched = next.map((card, cardIndex) =>
            cardIndex === firstIndex || cardIndex === secondIndex
              ? { ...card, isMatched: true, isFlipped: true }
              : card,
          )

          if (matched.every((card) => card.isMatched)) {
            setIsWon(true)
            onWin?.()
          }

          setIsLocked(false)
          return matched
        }

        onMismatch?.()
        window.setTimeout(() => {
          setCards((latest) =>
            latest.map((card, cardIndex) =>
              cardIndex === firstIndex || cardIndex === secondIndex
                ? { ...card, isFlipped: false }
                : card,
            ),
          )
          setIsLocked(false)
        }, 1000)

        return next
      })
    },
    [hasStarted, isLocked, isWon, onFlip, onMatch, onMismatch, onWin],
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
    handleCardClick,
    restart,
  }
}
