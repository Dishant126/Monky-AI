'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

const MAZE_WIDTH = 12
const MAZE_HEIGHT = 8
const CELL_SIZE = 40

// Generate a simple maze
const generateMaze = () => {
  const maze = Array(MAZE_HEIGHT)
    .fill(null)
    .map(() => Array(MAZE_WIDTH).fill(0))

  // Add walls
  maze[1][1] = 1
  maze[1][2] = 1
  maze[1][4] = 1
  maze[2][4] = 1
  maze[3][1] = 1
  maze[3][4] = 1
  maze[3][5] = 1
  maze[4][1] = 1
  maze[4][5] = 1
  maze[5][3] = 1
  maze[5][4] = 1
  maze[5][5] = 1
  maze[6][1] = 1

  return maze
}

export default function MazeRunner() {
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [goalPos] = useState({ x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 })
  const [maze, setMaze] = useState<number[][]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  useEffect(() => {
    setMaze(generateMaze())
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (won) return

      let newX = playerPos.x
      let newY = playerPos.y

      switch (e.key) {
        case 'ArrowUp':
          newY = Math.max(0, playerPos.y - 1)
          e.preventDefault()
          break
        case 'ArrowDown':
          newY = Math.min(MAZE_HEIGHT - 1, playerPos.y + 1)
          e.preventDefault()
          break
        case 'ArrowLeft':
          newX = Math.max(0, playerPos.x - 1)
          e.preventDefault()
          break
        case 'ArrowRight':
          newX = Math.min(MAZE_WIDTH - 1, playerPos.x + 1)
          e.preventDefault()
          break
        default:
          return
      }

      // Check for wall collision
      if (maze[newY] && maze[newY][newX] !== 1) {
        setPlayerPos({ x: newX, y: newY })
        setMoves((m) => m + 1)

        // Check if reached goal
        if (newX === goalPos.x && newY === goalPos.y) {
          setWon(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [playerPos, goalPos, won, maze])

  const resetGame = () => {
    setPlayerPos({ x: 1, y: 1 })
    setMoves(0)
    setWon(false)
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className="bg-slate-700/30 rounded-lg p-4 border border-orange-500/30">
        <p className="text-orange-100 text-sm">Use arrow keys to navigate through the maze and reach the goal!</p>
      </div>

      {/* Maze */}
      <div className="flex justify-center">
        <div className="relative bg-slate-700/30 rounded-lg p-4 border border-white/10">
          {maze.map((row, y) =>
            row.map((cell, x) => (
              <motion.div
                key={`${x}-${y}`}
                className={`absolute rounded-sm ${
                  cell === 1 ? 'bg-slate-600' : 'bg-transparent'
                }`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  left: x * CELL_SIZE + 16,
                  top: y * CELL_SIZE + 16,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            ))
          )}

          {/* Goal */}
          <motion.div
            className="absolute w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50"
            style={{
              left: goalPos.x * CELL_SIZE + 16 + CELL_SIZE / 2 - 16,
              top: goalPos.y * CELL_SIZE + 16 + CELL_SIZE / 2 - 16,
            }}
          >
            <span className="text-lg">🏁</span>
          </motion.div>

          {/* Player */}
          <motion.div
            layout
            className="absolute w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50"
            style={{
              left: playerPos.x * CELL_SIZE + 16 + CELL_SIZE / 2 - 16,
              top: playerPos.y * CELL_SIZE + 16 + CELL_SIZE / 2 - 16,
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <span className="text-lg">🎮</span>
          </motion.div>

          {/* Win Message */}
          {won && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm"
            >
              <div className="text-center">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-white font-bold text-xl">You Won!</p>
                <p className="text-gray-300">{moves} moves</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Position</p>
          <p className="text-white text-lg font-bold">
            ({playerPos.x}, {playerPos.y})
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Moves</p>
          <p className="text-white text-2xl font-bold">{moves}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Status</p>
          <p className={`font-bold ${won ? 'text-green-400' : 'text-yellow-400'}`}>{won ? 'Complete!' : 'Playing'}</p>
        </div>
      </div>

      {/* Controls */}
      <motion.button
        onClick={resetGame}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-lg font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Game
      </motion.button>
    </div>
  )
}
