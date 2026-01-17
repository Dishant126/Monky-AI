"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Bullet } from "@/components/ui/bullet"
import DashboardStat from "@/components/dashboard/stat"
import BoomIcon from "@/components/icons/boom"
import AtomIcon from "@/components/icons/atom"
import GearIcon from "@/components/icons/gear"
import ProcessorIcon from "@/components/icons/proccesor"

export default function SkillsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardStat
        label="GAMES AVAILABLE"
        value="12"
        description="INTERACTIVE CHALLENGES"
        icon={BoomIcon}
        tag="🎮 PLAY"
        intent="positive"
        direction="up"
      />
      <DashboardStat
        label="TOTAL XP EARNED"
        value="2,450"
        description="THIS MONTH"
        icon={GearIcon}
        tag="⚡ ACTIVE"
        intent="positive"
        direction="up"
      />
      <DashboardStat
        label="CURRENT STREAK"
        value="7"
        description="DAYS CONSECUTIVE"
        icon={AtomIcon}
        tag="🔥 HOT"
        intent="positive"
        direction="up"
      />
      <DashboardStat
        label="ALGORITHMS MASTERED"
        value="5"
        description="BADGES EARNED"
        icon={ProcessorIcon}
        intent="positive"
        direction="up"
      />
    </div>
  )
}
