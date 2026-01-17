'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react'

export default function BubbleSortVisualizer() {
  const [array, setArray] = useState<number[]>([])
  const [sorting, setSorting] = useState(false)
  const [comparing, setComparing] = useState<number[]>([])
  const [sorted, setSorted] = useState<number[]>([])
  const [speed, setSpeed] = useState(50)
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    generateArray(8)
  }, [])

  const generateArray = (size: number) => {
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1)
    setArray(newArray)
    setComparing([])
    setSorted([])
    setStep(0)
    setCompleted(false)
  }

  const bubbleSort = async () => {
    setSorting(true)
    let arr = [...array]
    let steps = 0

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        setComparing([j, j + 1])
        await new Promise((resolve) => setTimeout(resolve, 101 - speed))

        if (arr[j] > arr[j + 1]) {
          ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
          setArray([...arr])
        }
        steps++
        setStep(steps)
      }
      setSorted([...sorted, arr.length - i - 1])
    }

    setComparing([])
    setSorted(Array.from({ length: arr.length }, (_, i) => i))
    setSorting(false)
    setCompleted(true)
  }

  const maxValue = Math.max(...array, 1)

  return (
    <div className="space-y-8">
      {/* Speed Control */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">Speed:</span>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={sorting}
          className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-white font-semibold w-12 text-right">{speed}%</span>
      </div>

      {/* Visualization */}
      <div className="flex items-end justify-center gap-1 h-64 bg-slate-700/20 rounded-lg p-8">
        {array.map((num, idx) => (
          <motion.div
            key={idx}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${(num / maxValue) * 100}%`, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex-1 rounded-t-lg transition-all duration-100 ${
              sorted.includes(idx)
                ? 'bg-gradient-to-t from-green-500 to-green-400'
                : comparing.includes(idx)
                  ? 'bg-gradient-to-t from-red-500 to-red-400 shadow-lg shadow-red-500/50'
                  : 'bg-gradient-to-t from-purple-500 to-purple-400'
            }`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-700/50 rounded-lg p-3 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Array Size</p>
          <p className="text-white font-bold">{array.length}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Steps</p>
          <p className="text-white font-bold">{step}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Sorted</p>
          <p className="text-white font-bold">{sorted.length}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Status</p>
          <p className={`font-bold text-sm ${completed ? 'text-green-400' : sorting ? 'text-yellow-400' : 'text-gray-400'}`}>
            {completed ? 'Done' : sorting ? 'Sorting' : 'Ready'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          onClick={bubbleSort}
          disabled={sorting || completed}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
            sorting || completed
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
          }`}
        >
          <Play className="w-4 h-4" />
          Sort
        </motion.button>
        <motion.button
          onClick={() => generateArray(array.length)}
          disabled={sorting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-lg font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </motion.button>
        <motion.button
          onClick={() => generateArray(array.length - 1)}
          disabled={sorting || array.length <= 2}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-lg font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={() => generateArray(array.length + 1)}
          disabled={sorting || array.length >= 15}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-lg font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}
