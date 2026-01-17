'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

export default function BinarySearchGame() {
  const [target, setTarget] = useState(0)
  const [guesses, setGuesses] = useState(0)
  const [low, setLow] = useState(0)
  const [high, setHigh] = useState(100)
  const [message, setMessage] = useState('')
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    const newTarget = Math.floor(Math.random() * 100) + 1
    setTarget(newTarget)
    setGuesses(0)
    setLow(0)
    setHigh(100)
    setMessage('')
    setGameWon(false)
  }

  const makeGuess = (guess: number) => {
    if (gameWon) return

    setGuesses((g) => g + 1)

    if (guess === target) {
      setMessage(`🎉 Correct! You found ${target} in ${guesses + 1} guesses!`)
      setGameWon(true)
    } else if (guess < target) {
      setLow(guess + 1)
      setMessage(`${guess} is too low. Search higher.`)
    } else {
      setHigh(guess - 1)
      setMessage(`${guess} is too high. Search lower.`)
    }
  }

  const currentGuess = Math.floor((low + high) / 2)

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className="bg-slate-700/30 rounded-lg p-4 border border-green-500/30">
        <p className="text-green-100 text-sm">
          I'm thinking of a number between 1-100. Use binary search strategy to find it! Narrow the range with each guess.
        </p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-lg text-center font-semibold text-lg ${
            gameWon
              ? 'bg-green-500/20 border border-green-500 text-green-100'
              : 'bg-blue-500/20 border border-blue-500 text-blue-100'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Search Range */}
      <div className="bg-slate-700/30 rounded-lg p-6 border border-white/10">
        <p className="text-gray-400 mb-4">Search Range:</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold">{low}</span>
          <div className="flex-1 mx-4 h-2 bg-slate-600 rounded-full relative">
            <div
              className="absolute h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              style={{
                left: `${(low / 100) * 100}%`,
                right: `${100 - (high / 100) * 100}%`,
              }}
            />
          </div>
          <span className="text-white font-bold">{high}</span>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Suggested Guess (Binary Search):</p>
          <p className="text-4xl font-bold text-green-400">{currentGuess}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Guesses Made</p>
          <p className="text-white text-3xl font-bold">{guesses}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Range Size</p>
          <p className="text-white text-3xl font-bold">{high - low + 1}</p>
        </div>
      </div>

      {/* Guess Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          onClick={() => makeGuess(currentGuess)}
          disabled={gameWon}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`py-3 rounded-lg font-semibold transition-all ${
            gameWon
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
          }`}
        >
          Guess {currentGuess}
        </motion.button>
        <motion.button
          onClick={startNewGame}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-3 rounded-lg font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </motion.button>
      </div>

      {/* Optimal Moves Info */}
      <div className="bg-slate-700/30 rounded-lg p-3 border border-white/10">
        <p className="text-gray-400 text-xs">Optimal guesses for 1-100 range: 7 or fewer</p>
      </div>
    </div>
  )
}
