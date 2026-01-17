'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

interface SortState {
  comparing: number[]
  sorted: number[]
}

export default function QuickSortGame() {
  const [array, setArray] = useState<number[]>([])
  const [sortState, setSortState] = useState<SortState>({ comparing: [], sorted: [] })
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [targetMoves] = useState(0)

  useEffect(() => {
    resetGame()
  }, [])

  const resetGame = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 100) + 1)
    setArray(newArray)
    setSortState({ comparing: [], sorted: [] })
    setMoves(0)
    setGameOver(false)
  }

  const quickSort = async () => {
    let arr = [...array]
    let sorted: number[] = []
    let moves = 0

    const partition = async (low: number, high: number): Promise<number> => {
      const pivot = arr[high]
      let i = low - 1

      for (let j = low; j < high; j++) {
        setSortState({ comparing: [j, high], sorted })
        await new Promise((resolve) => setTimeout(resolve, 400))

        if (arr[j] < pivot) {
          i++
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          setArray([...arr])
          moves++
        }
      }
      ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
      setArray([...arr])
      moves++
      sorted.push(i + 1)
      return i + 1
    }

    const sort = async (low: number, high: number) => {
      if (low < high) {
        const pi = await partition(low, high)
        await sort(low, pi - 1)
        await sort(pi + 1, high)
      } else if (low === high) {
        sorted.push(low)
      }
    }

    await sort(0, arr.length - 1)
    setMoves(moves)
    setSortState({ comparing: [], sorted: Array.from({ length: arr.length }, (_, i) => i) })
    setGameOver(true)
  }

  const maxValue = Math.max(...array, 1)

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-500/30">
        <p className="text-blue-100 text-sm">
          Click "Sort" to watch the Quick Sort algorithm in action. The algorithm partitions the array and recursively sorts each partition.
        </p>
      </div>

      {/* Array Visualization */}
      <div className="flex items-end justify-center gap-2 h-64 bg-slate-700/20 rounded-lg p-8">
        {array.map((num, idx) => (
          <motion.div
            key={idx}
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${(num / maxValue) * 100}%`, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex-1 rounded-t-lg transition-all duration-200 ${
              sortState.sorted.includes(idx)
                ? 'bg-gradient-to-t from-green-500 to-green-400'
                : sortState.comparing.includes(idx)
                  ? 'bg-gradient-to-t from-orange-500 to-orange-400'
                  : 'bg-gradient-to-t from-blue-500 to-blue-400'
            }`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Array Size</p>
          <p className="text-white text-2xl font-bold">{array.length}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Moves</p>
          <p className="text-white text-2xl font-bold">{moves}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Status</p>
          <p className={`text-xl font-bold ${gameOver ? 'text-green-400' : 'text-yellow-400'}`}>
            {gameOver ? 'Complete!' : 'Ready'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <motion.button
          onClick={quickSort}
          disabled={gameOver}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            gameOver
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
          }`}
        >
          {gameOver ? 'Sorted!' : 'Start Sort'}
        </motion.button>
        <motion.button
          onClick={resetGame}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-lg font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </motion.button>
      </div>
    </div>
  )
}
