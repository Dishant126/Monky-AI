'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react'
import Link from 'next/link'

export default function BubbleSortGamePage() {
  const [array, setArray] = useState<number[]>([])
  const [comparing, setComparing] = useState<number[]>([])
  const [sorted, setSorted] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [stats, setStats] = useState({ steps: 0, swaps: 0, comparisons: 0 })
  const [completed, setCompleted] = useState(false)

  const difficultyConfig = {
    easy: { count: 5, max: 50 },
    medium: { count: 7, max: 50 },
    hard: { count: 10, max: 50 },
  }

  useEffect(() => {
    initializeGame()
  }, [difficulty])

  const initializeGame = () => {
    const config = difficultyConfig[difficulty]
    const newArray = Array.from({ length: config.count }, () => 
      Math.floor(Math.random() * config.max) + 1
    )
    setArray(newArray)
    setComparing([])
    setSorted([])
    setStats({ steps: 0, swaps: 0, comparisons: 0 })
    setCompleted(false)
  }

  const performBubbleSort = async () => {
    setIsAnimating(true)
    let arr = [...array]
    let swaps = 0
    let comparisons = 0
    let steps = 0
    const sorted = []

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        setComparing([j, j + 1])
        comparisons++
        steps++
        setStats({ steps, swaps, comparisons })
        
        await new Promise(resolve => setTimeout(resolve, 400))

        if (arr[j] > arr[j + 1]) {
          ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
          swaps++
          setArray([...arr])
          setStats({ steps, swaps, comparisons })
        }
      }
      sorted.push(arr.length - i - 1)
      setSorted([...sorted])
    }

    setComparing([])
    setSorted(Array.from({ length: arr.length }, (_, i) => i))
    setCompleted(true)
    setIsAnimating(false)
  }

  const nextStep = async () => {
    setIsAnimating(true)
    let arr = [...array]
    let { steps, swaps, comparisons } = stats

    // Find current position in bubble sort
    let found = false
    for (let i = 0; i < arr.length && !found; i++) {
      for (let j = 0; j < arr.length - i - 1 && !found; j++) {
        if (steps === stats.steps) {
          setComparing([j, j + 1])
          comparisons++
          steps++
          setStats({ steps, swaps, comparisons })
          
          await new Promise(resolve => setTimeout(resolve, 300))

          if (arr[j] > arr[j + 1]) {
            ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
            swaps++
            setArray([...arr])
          }
          found = true
        }
      }
    }

    if (steps >= arr.length * (arr.length - 1) / 2) {
      setCompleted(true)
    }

    setComparing([])
    setIsAnimating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/games">
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              BACK TO SKILLS
            </motion.button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="text-blue-400">■</span> BUBBLE SORT VISUALIZER
          </h1>
          <p className="text-gray-400 text-sm md:text-base">Complete the challenge to earn XP</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Instructions */}
            <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4 md:p-6">
              <h3 className="text-white font-bold mb-2 text-sm md:text-base">
                <span className="text-blue-400">■</span> BUBBLE SORT VISUALIZATION
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">
                Watch as the algorithm sorts the array by repeatedly stepping through the list, comparing adjacent elements, and swapping them if they're in the wrong order.
              </p>
            </div>

            {/* Array Visualization */}
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6 md:p-8 min-h-64 flex flex-col justify-center">
              <div className="flex items-end justify-center gap-2 md:gap-3 h-48">
                {array.map((value, idx) => (
                  <motion.div
                    key={idx}
                    layoutId={`bar-${idx}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(value / 50) * 100}%`, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`flex-1 rounded-t-sm transition-colors ${
                      sorted.includes(idx)
                        ? 'bg-green-500'
                        : comparing.includes(idx)
                        ? 'bg-yellow-400'
                        : 'bg-blue-500'
                    }`}
                  >
                    <div className="h-full flex items-end justify-center pb-2 text-white text-xs font-bold">
                      {value}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-center gap-3 mt-6 text-xs md:text-sm font-mono">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded"></span> Unsorted
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-400 rounded"></span> Comparing
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded"></span> Sorted
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={nextStep}
                disabled={isAnimating || completed}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                NEXT STEP
              </motion.button>
              <motion.button
                onClick={performBubbleSort}
                disabled={isAnimating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-all"
              >
                AUTO SORT
              </motion.button>
              <motion.button
                onClick={initializeGame}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                RESET
              </motion.button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            
            {/* Difficulty */}
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 md:p-6">
              <h3 className="text-white font-bold mb-3 text-sm md:text-base">
                <span className="text-blue-400">■</span> DIFFICULTY
              </h3>
              <div className="space-y-2">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <motion.button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-2 px-3 rounded text-sm font-bold transition-all uppercase ${
                      difficulty === diff
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {diff === 'easy' && '● EASY (5 ITEMS)'}
                    {diff === 'medium' && '● MEDIUM (7 ITEMS)'}
                    {diff === 'hard' && '● HARD (10 ITEMS)'}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 md:p-6">
              <h3 className="text-white font-bold mb-3 text-sm md:text-base">
                <span className="text-blue-400">■</span> STATISTICS
              </h3>
              <div className="space-y-3 font-mono text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">STEPS</span>
                  <span className="text-white font-bold">{stats.steps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SWAPS</span>
                  <span className="text-yellow-400 font-bold">{stats.swaps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">COMPARISONS</span>
                  <span className="text-purple-400 font-bold">{stats.comparisons}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            {completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500 rounded-lg p-4"
              >
                <p className="text-green-300 font-bold text-sm md:text-base">✓ SORTED!</p>
                <p className="text-green-200 text-xs mt-1">Array is completely sorted</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-8 bg-slate-800/50 border border-white/10 rounded-lg p-4 md:p-6">
          <h3 className="text-white font-bold mb-3 text-sm md:text-base">
            <span className="text-blue-400">■</span> HOW BUBBLE SORT WORKS
          </h3>
          <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
            Bubble Sort repeatedly steps through the array, compares adjacent elements, and swaps them if they're in the wrong order. 
            The process continues until no more swaps are needed. Time Complexity: O(n²). Despite its inefficiency on large datasets, 
            it's excellent for learning and visualizing sorting concepts.
          </p>
        </div>
      </div>
    </div>
  )
}
