'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const games = [
  {
    id: 'flexbox-game',
    title: 'Flexbox Master',
    description: 'Master CSS Flexbox by arranging elements with interactive controls',
    icon: '□',
    color: 'from-blue-600 to-blue-800',
    difficulty: 'Easy',
    href: '/flexbox-game',
  },
  {
    id: 'bubble-sort-game',
    title: 'Bubble Sort Visualizer',
    description: 'Visualize and control the bubble sort algorithm step by step',
    icon: '⬆',
    color: 'from-purple-600 to-purple-800',
    difficulty: 'Easy',
    href: '/bubble-sort-game',
  },
  {
    id: 'binary-search-game',
    title: 'Binary Search Hunt',
    description: 'Find the hidden number using binary search strategy',
    icon: '🔍',
    color: 'from-green-600 to-green-800',
    difficulty: 'Medium',
    href: '/binary-search-game',
  },
  {
    id: 'graph-explorer',
    title: 'Graph Explorer',
    description: 'Visualize BFS and DFS algorithms on an interactive graph',
    icon: '⊕',
    color: 'from-cyan-600 to-cyan-800',
    difficulty: 'Hard',
    href: '/graph-explorer',
  },
]

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tight">ALGORITHM GAMES</h1>
            </div>
            <p className="text-gray-400 text-lg">Master data structures and algorithms through interactive games</p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game, index) => (
              <Link key={game.id} href={game.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-xl cursor-pointer h-full"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Border Glow */}
                  <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 transition-colors duration-300" />

                  {/* Content */}
                  <div className="relative p-6 md:p-8 bg-slate-800/50 backdrop-blur-sm group-hover:bg-slate-800/30 transition-colors duration-300 rounded-xl border border-white/5 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-5xl md:text-6xl mb-4 font-mono">{game.icon}</div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 font-mono tracking-wide">{game.title}</h3>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed">{game.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r ${game.color} text-white uppercase tracking-wide`}>
                        {game.difficulty}
                      </span>
                      <motion.span
                        className="text-blue-400 font-mono text-lg font-bold"
                        initial={{ x: 0 }}
                        animate={{ x: 5 }}
                        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-12 bg-slate-800/50 border border-white/10 rounded-lg p-6 md:p-8"
          >
            <p className="text-white font-bold text-sm uppercase tracking-wide font-mono mb-4">■ HOW IT WORKS</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  <span className="text-blue-400 font-mono font-bold">LEARN:</span> Each game teaches a fundamental algorithm or web concept with interactive visualization.
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  <span className="text-green-400 font-mono font-bold">PRACTICE:</span> Solve challenges and complete levels to reinforce your understanding.
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  <span className="text-purple-400 font-mono font-bold">MASTER:</span> Track your progress and earn XP as you master each algorithm.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
