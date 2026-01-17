'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface Level {
  id: number
  title: string
  instructions: string
  targetJustify: string
  targetAlign: string
  itemsToArrange: number
  hintText: string
}

const LEVELS: Level[] = [
  {
    id: 1,
    title: 'CENTER THE BOX',
    instructions: 'Center the red box both horizontally and vertically using flexbox properties.',
    targetJustify: 'center',
    targetAlign: 'center',
    itemsToArrange: 1,
    hintText: 'Use justify-content: center and align-items: center on the container.',
  },
  {
    id: 2,
    title: 'SPACE BETWEEN',
    instructions: 'Distribute three boxes evenly with space between them.',
    targetJustify: 'space-between',
    targetAlign: 'center',
    itemsToArrange: 3,
    hintText: 'Use justify-content: space-between to distribute items evenly.',
  },
  {
    id: 3,
    title: 'SPACE AROUND',
    instructions: 'Arrange four boxes with equal spacing around them.',
    targetJustify: 'space-around',
    targetAlign: 'center',
    itemsToArrange: 4,
    hintText: 'Use justify-content: space-around for equal space around items.',
  },
]

const JUSTIFY_OPTIONS = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around']
const ALIGN_OPTIONS = ['flex-start', 'center', 'flex-end', 'stretch']

export default function FlexboxMasterPage() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [selectedJustify, setSelectedJustify] = useState('flex-start')
  const [selectedAlign, setSelectedAlign] = useState('flex-start')
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [completedLevels, setCompletedLevels] = useState(0)

  const currentLevel = LEVELS[currentLevelIndex]

  useEffect(() => {
    if (selectedJustify === currentLevel.targetJustify && selectedAlign === currentLevel.targetAlign) {
      setIsCorrect(true)
    } else {
      setIsCorrect(false)
    }
  }, [selectedJustify, selectedAlign, currentLevel])

  const nextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1)
      setSelectedJustify('flex-start')
      setSelectedAlign('flex-start')
      setIsCorrect(false)
      setShowHint(false)
      setCompletedLevels(completedLevels + 1)
    }
  }

  const resetLevel = () => {
    setSelectedJustify('flex-start')
    setSelectedAlign('flex-start')
    setIsCorrect(false)
    setShowHint(false)
  }

  const resetGame = () => {
    setCurrentLevelIndex(0)
    setSelectedJustify('flex-start')
    setSelectedAlign('flex-start')
    setIsCorrect(false)
    setShowHint(false)
    setCompletedLevels(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/games">
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors text-xs md:text-sm font-mono uppercase tracking-wide"
            >
              <ArrowLeft className="w-4 h-4" />
              ← BACK TO SKILLS
            </motion.button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400 flex items-center justify-center">
              <span className="text-lg">□</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tight">
              FLEXBOX MASTER
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Complete the challenge to earn XP</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Visual Playground */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Instructions */}
            <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide font-mono">
                ■ LEVEL {currentLevelIndex + 1}: {currentLevel.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentLevel.instructions}
              </p>
            </div>

            {/* Visual Playground */}
            <div className="border-2 border-green-500/50 rounded-lg p-8 bg-gradient-to-br from-green-900/20 to-green-800/10 min-h-96">
              <motion.div
                key={currentLevelIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex"
                style={{
                  justifyContent: selectedJustify as any,
                  alignItems: selectedAlign as any,
                  gap: '1rem',
                  minHeight: '300px',
                }}
              >
                {Array.from({ length: currentLevel.itemsToArrange }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-16 h-16 md:w-20 md:h-20 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg hover:scale-110 transition-transform cursor-grab"
                  >
                    {i + 1}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Target Layout Reference */}
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-mono mb-3">TARGET LAYOUT:</p>
              <div className="border border-green-500/30 rounded p-4 bg-slate-900/50 min-h-24 flex items-center justify-center">
                <div className="text-center text-gray-300 text-sm">
                  <span className="text-green-400 font-mono">■ TARGET</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls Panel */}
          <div className="space-y-6">
            
            {/* Progress */}
            <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-400 font-bold text-sm uppercase tracking-wide font-mono mb-2">■ PROGRESS</p>
              <p className="text-2xl font-bold text-white mb-3">{currentLevelIndex + 1} / {LEVELS.length}</p>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${((currentLevelIndex + 1) / LEVELS.length) * 100}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>

            {/* Justify Content Controls */}
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
              <p className="text-white font-bold text-sm uppercase tracking-wide font-mono mb-3">■ JUSTIFY-CONTENT</p>
              <div className="space-y-2">
                {JUSTIFY_OPTIONS.map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => setSelectedJustify(option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-2 px-3 rounded text-xs uppercase tracking-wider font-mono font-bold transition-all ${
                      selectedJustify === option
                        ? 'bg-blue-600 text-white border border-blue-400'
                        : 'bg-slate-700 text-gray-300 border border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Align Items Controls */}
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
              <p className="text-white font-bold text-sm uppercase tracking-wide font-mono mb-3">■ ALIGN-ITEMS</p>
              <div className="space-y-2">
                {ALIGN_OPTIONS.map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => setSelectedAlign(option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-2 px-3 rounded text-xs uppercase tracking-wider font-mono font-bold transition-all ${
                      selectedAlign === option
                        ? 'bg-blue-600 text-white border border-blue-400'
                        : 'bg-slate-700 text-gray-300 border border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                onClick={resetLevel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                RESET
              </motion.button>
              <motion.button
                onClick={() => setShowHint(!showHint)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'HIDE HINT' : 'SHOW HINT'}
              </motion.button>
            </div>

            {/* Hint */}
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3"
              >
                <p className="text-amber-200 text-xs leading-relaxed">{currentLevel.hintText}</p>
              </motion.div>
            )}

            {/* Success State */}
            {isCorrect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500 rounded-lg p-4"
              >
                <p className="text-green-300 font-bold text-sm mb-2 uppercase tracking-wide">✓ CORRECT!</p>
                <p className="text-green-200 text-xs mb-3">Your layout matches the target perfectly.</p>
                {currentLevelIndex < LEVELS.length - 1 ? (
                  <motion.button
                    onClick={nextLevel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-sm uppercase tracking-wide transition-all"
                  >
                    NEXT LEVEL →
                  </motion.button>
                ) : (
                  <div className="text-center">
                    <p className="text-green-300 font-bold text-sm">🎉 ALL LEVELS COMPLETE!</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Popup Modal */}
      {isCorrect && currentLevelIndex === LEVELS.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-gradient-to-br from-green-900/40 via-slate-800 to-green-900/40 border-2 border-green-400/60 rounded-xl p-8 max-w-md w-full shadow-2xl"
          >
            {/* Celebration Animation */}
            <div className="mb-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                className="text-6xl text-center mb-4"
              >
                🎉
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.8 }}
                className="text-center"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-green-300 mb-2 font-mono tracking-tight">
                  MASTERY UNLOCKED!
                </h2>
                <p className="text-gray-300 font-mono text-sm">You've completed all flexbox challenges</p>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-700/50 border border-green-500/30 rounded-lg p-3 text-center">
                <p className="text-green-400 font-bold text-2xl">{LEVELS.length}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wide font-mono">Levels</p>
              </div>
              <div className="bg-slate-700/50 border border-blue-500/30 rounded-lg p-3 text-center">
                <p className="text-blue-400 font-bold text-2xl">100</p>
                <p className="text-gray-400 text-xs uppercase tracking-wide font-mono">XP Earned</p>
              </div>
              <div className="bg-slate-700/50 border border-purple-500/30 rounded-lg p-3 text-center">
                <p className="text-purple-400 font-bold text-2xl">⭐</p>
                <p className="text-gray-400 text-xs uppercase tracking-wide font-mono">Master</p>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/40 rounded-lg text-center">
              <p className="text-green-300 font-bold font-mono text-sm uppercase tracking-widest mb-1">
                ✓ Achievement Unlocked
              </p>
              <p className="text-gray-200 text-sm font-mono">Flexbox Master Badge</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Link href="/games" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-all"
                >
                  Back to Skills
                </motion.button>
              </Link>
              <motion.button
                onClick={resetGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-all"
              >
                Play Again
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* End of popup */}
    </div>
  )
}
