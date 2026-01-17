'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import BinarySearchGame from '@/components/games/binary-search-game'

export default function BinarySearchGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/games">
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Games
            </motion.button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h2 className="text-3xl font-bold text-white">Binary Search Guess</h2>
              <p className="text-gray-400">Find the hidden number using binary search strategy</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/5 p-8">
          <BinarySearchGame />
        </div>
      </div>
    </div>
  )
}
