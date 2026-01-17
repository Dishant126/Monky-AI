'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

interface Card {
  id: number
  value: number
  flipped: boolean
  matched: boolean
}

const emojis = ['🚀', '⚡', '🎯', '🔥', '💎', '🌟', '🎪', '🎨']

export default function MemoryCards() {
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const values = [...emojis, ...emojis].sort(() => Math.random() - 0.5)
    const newCards = values.map((value, idx) => ({
      id: idx,
      value: idx < 8 ? 0 : 1,
      flipped: false,
      matched: false,
    }))
    setCards(
      newCards.map((card, idx) => ({
        ...card,
        value: idx,
      }))
    )
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameWon(false)
  }

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameWon(true)
    }
  }, [matched, cards])

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped
      
      // Check if values match by comparing emoji positions
      if (
        (first < 8 && second >= 8 && first === second - 8) ||
        (first >= 8 && second < 8 && first - 8 === second)
      ) {
        setMatched([...matched, first, second])
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 600)
      }
      
      setMoves((m) => m + 1)
    }
  }, [flipped, matched])

  const handleCardClick = (id: number) => {
    if (
      flipped.includes(id) ||
      matched.includes(id) ||
      flipped.length === 2 ||
      gameWon
    ) {
      return
    }

    setFlipped([...flipped, id])
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className="bg-slate-700/30 rounded-lg p-4 border border-pink-500/30">
        <p className="text-pink-100 text-sm">
          Find all matching pairs! Flip cards to reveal emojis and match them.
        </p>
      </div>

      {/* Game Won */}
      {gameWon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center"
        >
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-green-100 font-bold text-xl">You Won!</p>
          <p className="text-green-200">Completed in {moves} moves</p>
        </motion.div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => handleCardClick(idx)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`aspect-square rounded-lg font-bold text-2xl transition-all ${
              matched.includes(idx)
                ? 'bg-green-500/30 cursor-default'
                : 'bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 cursor-pointer shadow-lg'
            }`}
          >
            {flipped.includes(idx) || matched.includes(idx) ? emojis[idx] : '?'}
          </motion.button>
        ))}
        {Array.from({ length: 8 }).map((_, idx) => (
          <motion.button
            key={idx + 8}
            onClick={() => handleCardClick(idx + 8)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`aspect-square rounded-lg font-bold text-2xl transition-all ${
              matched.includes(idx + 8)
                ? 'bg-green-500/30 cursor-default'
                : 'bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 cursor-pointer shadow-lg'
            }`}
          >
            {flipped.includes(idx + 8) || matched.includes(idx + 8) ? emojis[idx] : '?'}
          </motion.button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Moves</p>
          <p className="text-white text-3xl font-bold">{moves}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Matched Pairs</p>
          <p className="text-white text-3xl font-bold">{matched.length / 2}/8</p>
        </div>
      </div>

      {/* Controls */}
      <motion.button
        onClick={initializeGame}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-lg font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        New Game
      </motion.button>
    </div>
  )
}
