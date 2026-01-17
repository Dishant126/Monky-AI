"use client"

import { useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import BoomIcon from "@/components/icons/boom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import KeyboardIcon from "@/components/icons/keyboard"
import AtomIcon from "@/components/icons/atom"
import EmailIcon from "@/components/icons/email"
import ProcessorIcon from "@/components/icons/proccesor"
import { Badge } from "@/components/ui/badge"

interface Game {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  category: "game" | "skill"
  difficulty: string
  xpReward: string
  color: string
  stats?: {
    label: string
    value: string | number
  }[]
}

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

const GAMES: Game[] = [
  {
    id: "typing-trainer",
    title: "Typing Trainer",
    description: "Master code typing speed with multi-language support",
    icon: KeyboardIcon,
    href: "/typing-trainer",
    category: "game",
    difficulty: "All Levels",
    xpReward: "Up to 500 XP",
    color: "from-blue-500 to-cyan-500",
    stats: [
      { label: "Languages", value: 6 },
      { label: "Difficulties", value: 3 },
      { label: "Max WPM", value: "∞" },
    ],
  },
  {
    id: "sandbox",
    title: "Sandbox - DSA Challenges",
    description: "Solve Data Structures & Algorithms problems by topic",
    icon: EmailIcon,
    href: "/sandbox",
    category: "game",
    difficulty: "Easy to Hard",
    xpReward: "Up to 225 XP",
    color: "from-purple-500 to-pink-500",
    stats: [
      { label: "Total Problems", value: 117 },
      { label: "Topics", value: 8 },
      { label: "Streak Tracking", value: "🔥" },
    ],
  },
]

const SKILLS: Game[] = [
  {
    id: "learning-hub",
    title: "Learning Hub",
    description: "Track lessons, earn badges, and progress through levels",
    icon: AtomIcon,
    href: "/learning-hub",
    category: "skill",
    difficulty: "Progressive",
    xpReward: "2,450+ XP",
    color: "from-green-500 to-emerald-500",
    stats: [
      { label: "Lessons", value: "12+" },
      { label: "Achievements", value: 4 },
      { label: "Current Level", value: "Expert" },
    ],
  },
  {
    id: "code-flow",
    title: "Code Flow Visualizer",
    description: "Visualize code execution and understand program flow",
    icon: ProcessorIcon,
    href: "/code-flow",
    category: "skill",
    difficulty: "Intermediate",
    xpReward: "Build Understanding",
    color: "from-orange-500 to-red-500",
    stats: [
      { label: "Topics", value: "Control Flow" },
      { label: "Languages", value: "Multiple" },
      { label: "Visual Learning", value: "✓" },
    ],
  },
]

const SORTING_GAMES: AlgorithmGame[] = [
  {
    id: "bubble-sort",
    title: "Bubble Sort Master",
    description: "Visualize and practice bubble sort algorithm. Arrange numbers by comparing adjacent elements.",
    algorithms: ["Bubble Sort", "Sorting"],
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
]

const SEARCHING_GAMES: AlgorithmGame[] = [
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
    id: "linear-search",
    title: "Linear Search Race",
    description: "Practice linear search and understand when it's more efficient than binary search.",
    algorithms: ["Linear Search", "Searching"],
    difficulty: "Easy",
    xp: 100,
    levels: 4,
    icon: "🔎",
    color: "from-green-500 to-teal-500",
    href: "/linear-search-game",
  },
]

const GRAPH_GAMES: AlgorithmGame[] = [
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
  {
    id: "kruskal-prim",
    title: "Minimum Spanning Tree",
    description: "Build minimum spanning trees using Kruskal's and Prim's algorithms.",
    algorithms: ["Kruskal", "Prim's", "MST"],
    difficulty: "Hard",
    xp: 250,
    levels: 6,
    icon: "🕸️",
    color: "from-indigo-400 to-indigo-600",
    href: "/mst-game",
  },
]

const WEB_GAMES: AlgorithmGame[] = [
  {
    id: "fruitbox-flex",
    title: "Fruitbox Flex",
    description: "Master CSS Flexbox by sorting fruits into baskets using flex properties",
    algorithms: ["CSS", "Flexbox"],
    difficulty: "Easy",
    xp: 150,
    levels: 8,
    icon: "🍎",
    color: "from-orange-500 to-red-500",
    href: "/fruitbox-flex",
  },
  {
    id: "grid-quest",
    title: "Grid Quest",
    description: "Learn CSS Grid by arranging items in complex layouts",
    algorithms: ["CSS", "Grid"],
    difficulty: "Medium",
    xp: 200,
    levels: 10,
    icon: "📐",
    color: "from-blue-500 to-purple-500",
    href: "/grid-quest",
  },
  {
    id: "responsive-rush",
    title: "Responsive Rush",
    description: "Build responsive designs and adapt to different screen sizes",
    algorithms: ["Design", "Responsive"],
    difficulty: "Medium",
    xp: 180,
    levels: 6,
    icon: "📱",
    color: "from-green-500 to-teal-500",
    href: "/responsive-rush",
  },
]

function AlgorithmGameCard({ game }: { game: AlgorithmGame }) {
  const difficultyColor =
    game.difficulty === "Easy"
      ? "bg-green-500/20 text-green-600"
      : game.difficulty === "Medium"
        ? "bg-yellow-500/20 text-yellow-600"
        : "bg-red-500/20 text-red-600"

  return (
    <Link href={game.href}>
      <div className="h-full bg-card border border-border rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all duration-200 cursor-pointer group">
        <div className={`bg-gradient-to-br ${game.color} p-6 text-white`}>
          <div className="flex items-start justify-between mb-3">
            <span className="text-4xl">{game.icon}</span>
            <Badge className={`text-xs ${difficultyColor}`}>{game.difficulty}</Badge>
          </div>
          <h3 className="text-lg font-display font-bold mb-1">{game.title}</h3>
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

          <Button className="w-full bg-primary hover:bg-primary/90">Play Now</Button>
        </div>
      </div>
    </Link>
  )
}

export default function SkillsHubPage() {
  const gameGames = GAMES.filter((g) => g.category === "game")
  const skillGames = SKILLS.filter((g) => g.category === "skill")

  return (
    <DashboardPageLayout
      header={{
        title: "Skills & Games Hub",
        description: "Practice, compete, and master your coding skills",
        icon: BoomIcon,
      }}
    >
      {/* Games Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-display uppercase tracking-tight mb-2">🎮 Games & Challenges</h2>
          <p className="text-sm text-foreground/60">
            Compete, solve problems, and earn XP through interactive challenges
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameGames.map((game) => {
            const GameIcon = game.icon
            return (
              <Card key={game.id} className="ring-2 ring-pop overflow-hidden hover:ring-primary transition-all">
                <div className={`h-1 bg-gradient-to-r ${game.color}`}></div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded bg-gradient-to-br ${game.color} text-white`}>
                        <GameIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{game.title}</CardTitle>
                        <p className="text-xs text-foreground/60 mt-1">{game.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-accent space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {game.stats?.map((stat, idx) => (
                      <div key={idx} className="p-2 bg-background rounded border border-pop/50">
                        <p className="text-xs text-foreground/60 uppercase">{stat.label}</p>
                        <p className="text-sm font-bold mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                        {game.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 bg-success/20 text-success rounded">{game.xpReward}</span>
                    </div>
                  </div>
                  <Link href={game.href} className="block">
                    <Button className="w-full" variant="default">
                      Play Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Sorting Algorithms Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-display uppercase tracking-tight mb-2">📊 Sorting Algorithms</h2>
          <p className="text-sm text-foreground/60">
            Master fundamental sorting algorithms - Bubble Sort, Merge Sort, Quick Sort, and more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SORTING_GAMES.map((game) => (
            <AlgorithmGameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Searching Algorithms Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-display uppercase tracking-tight mb-2">🔍 Searching Algorithms</h2>
          <p className="text-sm text-foreground/60">
            Learn efficient search techniques - Binary Search, Linear Search, and more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SEARCHING_GAMES.map((game) => (
            <AlgorithmGameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Graph Algorithms Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-display uppercase tracking-tight mb-2">🌐 Graph Algorithms</h2>
          <p className="text-sm text-foreground/60">
            Explore graph theory and pathfinding - Dijkstra, BFS/DFS, Minimum Spanning Trees
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GRAPH_GAMES.map((game) => (
            <AlgorithmGameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Web Concepts Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-display uppercase tracking-tight mb-2">🎨 Web Concepts Playground</h2>
          <p className="text-sm text-foreground/60">
            Master CSS and responsive design through hands-on interactive challenges
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WEB_GAMES.map((game) => (
            <AlgorithmGameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-display uppercase tracking-tight mb-2">📚 Skill Development</h2>
          <p className="text-sm text-foreground/60">
            Build foundational skills and track your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillGames.map((skill) => {
            const SkillIcon = skill.icon
            return (
              <Card key={skill.id} className="ring-2 ring-pop overflow-hidden hover:ring-primary transition-all">
                <div className={`h-1 bg-gradient-to-r ${skill.color}`}></div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded bg-gradient-to-br ${skill.color} text-white`}>
                        <SkillIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{skill.title}</CardTitle>
                        <p className="text-xs text-foreground/60 mt-1">{skill.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-accent space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {skill.stats?.map((stat, idx) => (
                      <div key={idx} className="p-2 bg-background rounded border border-pop/50">
                        <p className="text-xs text-foreground/60 uppercase">{stat.label}</p>
                        <p className="text-sm font-bold mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                        {skill.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 bg-success/20 text-success rounded">{skill.xpReward}</span>
                    </div>
                  </div>
                  <Link href={skill.href} className="block">
                    <Button className="w-full" variant="default">
                      Start Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-12 pt-6 border-t border-pop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="ring-2 ring-pop">
            <CardContent className="bg-accent pt-6">
              <p className="text-xs text-foreground/60 uppercase mb-2">Total Games</p>
              <p className="text-3xl font-bold">{gameGames.length + SORTING_GAMES.length + SEARCHING_GAMES.length + GRAPH_GAMES.length + WEB_GAMES.length}</p>
              <p className="text-xs text-foreground/50 mt-2">Interactive Challenges</p>
            </CardContent>
          </Card>
          <Card className="ring-2 ring-pop">
            <CardContent className="bg-accent pt-6">
              <p className="text-xs text-foreground/60 uppercase mb-2">Skill Tracks</p>
              <p className="text-3xl font-bold">{skillGames.length}</p>
              <p className="text-xs text-foreground/50 mt-2">Learning Paths</p>
            </CardContent>
          </Card>
          <Card className="ring-2 ring-pop">
            <CardContent className="bg-accent pt-6">
              <p className="text-xs text-foreground/60 uppercase mb-2">XP Available</p>
              <p className="text-3xl font-bold">5,000+</p>
              <p className="text-xs text-foreground/50 mt-2">Earn & Unlock</p>
            </CardContent>
          </Card>
          <Card className="ring-2 ring-pop">
            <CardContent className="bg-accent pt-6">
              <p className="text-xs text-foreground/60 uppercase mb-2">Categories</p>
              <p className="text-3xl font-bold">5</p>
              <p className="text-xs text-foreground/50 mt-2">Algorithm Topics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
