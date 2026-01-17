"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CategoryGame {
  id: string
  title: string
  description: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  xp: number
  levels: number
  icon: string
  color: string
  href: string
}

interface GameCategorySectionProps {
  games: CategoryGame[]
}

export default function GameCategorySection({ games }: GameCategorySectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
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
              <div className="mb-4">
                <Badge variant="outline" className="text-xs">
                  {game.category}
                </Badge>
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
