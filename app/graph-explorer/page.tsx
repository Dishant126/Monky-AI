'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface GraphNode {
  id: number
  x: number
  y: number
  visited: boolean
  current: boolean
}

interface GraphEdge {
  from: number
  to: number
}

export default function GraphExplorer() {
  const [algorithm, setAlgorithm] = useState<'bfs' | 'dfs'>('bfs')
  const [nodes, setNodes] = useState<GraphNode[]>([
    { id: 1, x: 150, y: 100, visited: false, current: false },
    { id: 2, x: 300, y: 80, visited: false, current: false },
    { id: 3, x: 450, y: 100, visited: false, current: false },
    { id: 4, x: 220, y: 220, visited: false, current: false },
    { id: 5, x: 380, y: 220, visited: false, current: false },
    { id: 6, x: 300, y: 350, visited: false, current: false },
  ])

  const edges: GraphEdge[] = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 5 },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
  ]

  const [visited, setVisited] = useState<number[]>([])
  const [current, setCurrent] = useState<number | null>(null)
  const [steps, setSteps] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [completed, setCompleted] = useState(false)

  const runBFS = async () => {
    let queue = [1]
    let visitedSet = new Set<number>()
    let stepCount = 0

    while (queue.length > 0) {
      const node = queue.shift()!
      if (visitedSet.has(node)) continue

      setCurrent(node)
      await new Promise(resolve => setTimeout(resolve, 600))

      visitedSet.add(node)
      setVisited(Array.from(visitedSet))
      stepCount++
      setSteps(stepCount)

      const neighbors = edges
        .filter(e => e.from === node && !visitedSet.has(e.to))
        .map(e => e.to)

      queue.push(...neighbors)
    }

    setCurrent(null)
    setCompleted(true)
  }

  const runDFS = async () => {
    let stack = [1]
    let visitedSet = new Set<number>()
    let stepCount = 0

    while (stack.length > 0) {
      const node = stack.pop()!
      if (visitedSet.has(node)) continue

      setCurrent(node)
      await new Promise(resolve => setTimeout(resolve, 600))

      visitedSet.add(node)
      setVisited(Array.from(visitedSet))
      stepCount++
      setSteps(stepCount)

      const neighbors = edges
        .filter(e => e.from === node && !visitedSet.has(e.to))
        .map(e => e.to)
        .reverse()

      stack.push(...neighbors)
    }

    setCurrent(null)
    setCompleted(true)
  }

  const reset = () => {
    setVisited([])
    setCurrent(null)
    setSteps(0)
    setCompleted(false)
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
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
              <span className="text-lg">⊕</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tight">
              GRAPH EXPLORER
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Visualize BFS and DFS algorithms</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Graph Visualization */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Algorithm Selection */}
            <div className="flex gap-2">
              {(['bfs', 'dfs'] as const).map((algo) => (
                <motion.button
                  key={algo}
                  onClick={() => { setAlgorithm(algo); reset(); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 px-4 rounded text-sm uppercase font-mono font-bold transition-all ${
                    algorithm === algo
                      ? 'bg-cyan-600 text-white border border-cyan-400'
                      : 'bg-slate-700 text-gray-300 border border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {algo.toUpperCase()} - {algo === 'bfs' ? 'Breadth First' : 'Depth First'}
                </motion.button>
              ))}
            </div>

            {/* Graph Canvas */}
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
              <p className="text-cyan-400 font-bold text-sm uppercase tracking-wide font-mono mb-4">■ GRAPH VISUALIZATION</p>
              <svg width="100%" height="400" viewBox="0 0 600 400" className="bg-slate-900/50 rounded">
                {/* Draw Edges */}
                {edges.map((edge, idx) => {
                  const fromNode = nodes.find(n => n.id === edge.from)!
                  const toNode = nodes.find(n => n.id === edge.to)!
                  return (
                    <line
                      key={idx}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#6b7280"
                      strokeWidth="2"
                    />
                  )
                })}

                {/* Draw Nodes */}
                {nodes.map((node) => (
                  <g key={node.id}>
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r="30"
                      fill={
                        current === node.id
                          ? '#fbbf24'
                          : visited.includes(node.id)
                          ? '#10b981'
                          : '#3b82f6'
                      }
                      stroke="white"
                      strokeWidth="2"
                      animate={{
                        r: current === node.id ? 35 : 30,
                      }}
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dy="0.3em"
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.id}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                <span className="text-gray-300">Unvisited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-400 rounded-full border-2 border-white animate-pulse"></div>
                <span className="text-gray-300">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                <span className="text-gray-300">Visited</span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            
            {/* Statistics */}
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
              <p className="text-white font-bold text-sm uppercase tracking-wide font-mono mb-4">■ STATISTICS</p>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-mono">Nodes Visited</p>
                  <p className="text-3xl font-bold text-cyan-400">{visited.length} / 6</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-mono">Steps</p>
                  <p className="text-3xl font-bold text-purple-400">{steps}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                onClick={() => algorithm === 'bfs' ? runBFS() : runDFS()}
                disabled={completed}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-bold rounded text-sm uppercase tracking-wide transition-all"
              >
                RUN {algorithm.toUpperCase()}
              </motion.button>
              <motion.button
                onClick={reset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                RESET
              </motion.button>
            </div>

            {/* Hint */}
            <motion.button
              onClick={() => setShowHint(!showHint)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? 'HIDE HINT' : 'SHOW HINT'}
            </motion.button>

            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3"
              >
                <p className="text-amber-200 text-xs leading-relaxed font-mono">
                  <strong className="text-amber-300">BFS:</strong> Uses a queue (FIFO) - explores level by level<br/>
                  <strong className="text-amber-300">DFS:</strong> Uses a stack (LIFO) - explores as deep as possible first
                </p>
              </motion.div>
            )}

            {/* Completion */}
            {completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500 rounded-lg p-4"
              >
                <p className="text-green-300 font-bold text-sm mb-2 uppercase">✓ COMPLETE!</p>
                <p className="text-green-200 text-xs">
                  Visited all {visited.length} nodes in {steps} steps using {algorithm.toUpperCase()}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
