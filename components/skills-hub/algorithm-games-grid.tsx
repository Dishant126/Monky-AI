"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AlgorithmGame {
  id: string
  title: string
  description: string
  algorithms: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  xp: number
  levels: number
  icon: string
  color: string
  href: string
}

const ALGORITHM_GAMES: AlgorithmGame[] = [
  {
    id: "bubble-sort",
    title: "Bubble Sort Master",
    description: "Visualize and practice bubble sort algorithm. Arrange numbers by comparing adjacent elements.",
    algorithms: ["Bubble Sort", "Comparison"],
    difficulty: "Easy",
    xp: 100,
    levels: 5,
    icon: "🫧",
    color: "from-blue-400 to-blue-600",
    href: "/bubble-sort-game",
  },
  {
    id: "merge-sort",
    title: "Merge Sort Quest",
    description: "Master the divide-and-conquer merge sort algorithm through interactive visualization.",
    algorithms: ["Merge Sort", "Divide & Conquer"],
    difficulty: "Medium",
    xp: 200,
    levels: 7,
    icon: "🔀",
    color: "from-purple-400 to-purple-600",
    href: "/merge-sort-game",
  },
  {
    id: "quick-sort",
    title: "Quick Sort Sprint",
    description: "Learn quick sort by partitioning arrays around pivot elements in real-time challenges.",
    algorithms: ["Quick Sort", "Partitioning"],
    difficulty: "Medium",
    xp: 200,
    levels: 7,
    icon: "⚡",
    color: "from-yellow-400 to-yellow-600",
    href: "/quick-sort-game",
  },
  {
    id: "binary-search",
    title: "Binary Search Hunt",
    description: "Find elements efficiently using the binary search algorithm in this fast-paced game.",
    algorithms: ["Binary Search", "Searching"],
    difficulty: "Easy",
    xp: 150,
    levels: 6,
    icon: "🔍",
    color: "from-green-400 to-green-600",
    href: "/binary-search-game",
  },
  {
    id: "dijkstra",
    title: "Dijkstra's Pathfinder",
    description: "Find the shortest path in weighted graphs using Dijkstra's algorithm.",
    algorithms: ["Dijkstra's Algorithm", "Graph Theory"],
    difficulty: "Hard",
    xp: 300,
    levels: 8,
    icon: "🗺️",
    color: "from-red-400 to-red-600",
    href: "/dijkstra-game",
  },
  {
    id: "bfs-dfs",
    title: "Graph Explorer",
    description: "Master BFS and DFS traversal algorithms by exploring graph structures.",
    algorithms: ["BFS", "DFS", "Graph Traversal"],
    difficulty: "Medium",
    xp: 250,
    levels: 8,
    icon: "🌳",
    color: "from-teal-400 to-teal-600",
    href: "/graph-explorer-game",
  },
]

export default function AlgorithmGamesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ALGORITHM_GAMES.map((game) => (
        <Link key={game.id} href={game.href}>
          <div className="h-full bg-card border border-border rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all duration-200 cursor-pointer group">
            <div className={`bg-gradient-to-br ${game.color} p-6 text-white`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{game.icon}</span>
                <Badge
                  variant={game.difficulty === "Easy" ? "default" : game.difficulty === "Medium" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {game.difficulty}
                </Badge>
              </div>
              <h3 className="text-xl font-display font-bold mb-1">{game.title}</h3>
              <p className="text-sm opacity-90">{game.description}</p>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {game.algorithms.map((algo) => (
                  <Badge key={algo} variant="outline" className="text-xs">
                    {algo}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-foreground/60 text-xs uppercase">Levels</p>
                    <p className="font-bold">{game.levels}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60 text-xs uppercase">Max XP</p>
                    <p className="font-bold">{game.xp}</p>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">
                Play Now
              </Button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
