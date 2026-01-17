"use client"

import { useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ROADMAPS, type Roadmap, type RoadmapStage } from "@/lib/data/roadmaps"
import Image from "next/image"
import { ArrowRight, BookOpen, Clock, Target, Wrench, Sparkles, MapIcon, ListIcon, CheckCircle2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

type ViewMode = "selection" | "visual" | "list"

function StageListCard({ 
  stage, 
  index, 
  color,
  isExpanded,
  onToggle 
}: { 
  stage: RoadmapStage
  index: number
  color: string
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
      <div className={`h-1.5 bg-gradient-to-r ${color}`} />
      
      <button
        onClick={onToggle}
        className="w-full text-left p-6 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-6">
          {/* Stage number badge */}
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">{index + 1}</span>
          </div>
          
          {/* Stage info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2 text-xs">
                  {stage.id.toUpperCase()}
                </Badge>
                <h3 className="text-xl font-bold leading-tight text-balance">{stage.title}</h3>
              </div>
              <Badge variant="outline" className="flex-shrink-0 gap-1.5 px-3 py-1.5">
                <Clock className="w-3.5 h-3.5" />
                {stage.duration}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stage.description}
            </p>
          </div>

          {/* Expand icon */}
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t bg-accent/30 p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          {/* Stage image */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={stage.image || "/placeholder.svg"}
              alt={stage.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4" />
              Skills to Master
            </h4>
            <div className="flex flex-wrap gap-2">
              {stage.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs px-3 py-1.5">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Wrench className="w-4 h-4" />
              Essential Tools
            </h4>
            <div className="flex flex-wrap gap-2">
              {stage.tools.map((tool) => (
                <Badge key={tool} className="text-xs bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1.5">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <BookOpen className="w-4 h-4" />
              Recommended Resources
            </h4>
            <div className="flex flex-wrap gap-2">
              {stage.resources.map((resource) => (
                <Badge key={resource} variant="secondary" className="text-xs px-3 py-1.5">
                  {resource}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Action Plan</h4>
            <p className="text-sm text-primary leading-relaxed">{stage.action}</p>
          </div>
        </div>
      )}
    </Card>
  )
}

function VisualMapNode({ 
  stage, 
  index, 
  color,
  isLast 
}: { 
  stage: RoadmapStage
  index: number
  color: string
  isLast: boolean
}) {
  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${index * 150}ms` }}>
      {/* Circular node */}
      <div className="relative">
        {/* Outer ring with gradient */}
        <div className={`w-72 h-72 rounded-full bg-gradient-to-br ${color} p-1 shadow-xl hover:scale-105 transition-transform duration-300`}>
          {/* Inner white circle */}
          <div className="w-full h-full rounded-full bg-background border-4 border-border flex flex-col items-center justify-center p-8 text-center space-y-3">
            {/* Stage number */}
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">{index + 1}</span>
            </div>
            
            {/* Stage title */}
            <h3 className="text-lg font-bold leading-tight text-balance px-2">
              {stage.title}
            </h3>
            
            {/* Duration */}
            <Badge variant="outline" className="gap-1.5 px-3 py-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{stage.duration}</span>
            </Badge>

            {/* Progress indicator */}
            <div className="w-full pt-2">
              <div className="text-xs text-muted-foreground">0% Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connecting line to next node */}
      {!isLast && (
        <div className="h-24 w-1 bg-gradient-to-b from-border via-border/50 to-transparent my-4" 
             style={{ 
               backgroundImage: 'repeating-linear-gradient(0deg, currentColor, currentColor 8px, transparent 8px, transparent 16px)',
               opacity: 0.5
             }} 
        />
      )}
    </div>
  )
}

export default function RoadmapGeneratorPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("selection")
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())

  const roadmapOptions = Object.values(ROADMAPS)

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages)
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId)
    } else {
      newExpanded.add(stageId)
    }
    setExpandedStages(newExpanded)
  }

  const handleSelectRoadmap = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap)
    setViewMode("visual")
    setExpandedStages(new Set())
  }

  const handleBackToSelection = () => {
    setSelectedRoadmap(null)
    setViewMode("selection")
    setExpandedStages(new Set())
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Roadmap Generator",
        description: "Your personalized learning path",
        icon: MapIcon,
      }}
    >
      {/* Selection View */}
      {viewMode === "selection" && (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full animate-in zoom-in duration-300">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning Paths</span>
            </div>
            <h2 className="text-5xl font-display uppercase text-balance leading-tight">
              Choose Your Career Path
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Select a field to generate a comprehensive step-by-step learning roadmap tailored to industry standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roadmapOptions.map((roadmap, index) => (
              <Card
                key={roadmap.id}
                className="overflow-hidden border-2 hover:border-primary hover:shadow-2xl transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4 flex flex-col"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-2 bg-gradient-to-r ${roadmap.color} group-hover:h-3 transition-all duration-300`} />
                
                <div className="flex flex-col flex-1">
                  <CardHeader className="p-6 pb-4 flex-1">
                    {/* Icon and title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-5xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {roadmap.icon}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors text-balance">
                          {roadmap.title}
                        </CardTitle>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed min-h-[5rem] mb-4">
                      {roadmap.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                      <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-medium">{roadmap.totalDuration}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`px-2.5 py-1 text-xs font-medium ${
                          roadmap.difficulty === "Beginner Friendly"
                            ? "border-green-500 text-green-500"
                            : roadmap.difficulty === "Intermediate"
                              ? "border-yellow-500 text-yellow-500"
                              : "border-red-500 text-red-500"
                        }`}
                      >
                        {roadmap.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>

                  <div className="p-6 pt-0 mt-auto">
                    <Button 
                      onClick={() => handleSelectRoadmap(roadmap)}
                      className="w-full h-11 text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm"
                    >
                      VIEW ROADMAP
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Visual/List View */}
      {selectedRoadmap && (viewMode === "visual" || viewMode === "list") && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-8 border-b">
            <div className="flex items-start gap-6">
              <div className="text-6xl shrink-0 animate-in zoom-in duration-500">
                {selectedRoadmap.icon}
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-display uppercase leading-tight">
                  {selectedRoadmap.title}
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {selectedRoadmap.description}
                </p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                    <Clock className="w-4 h-4" />
                    {selectedRoadmap.totalDuration}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`px-3 py-1.5 ${
                      selectedRoadmap.difficulty === "Beginner Friendly"
                        ? "border-green-500 text-green-500"
                        : selectedRoadmap.difficulty === "Intermediate"
                          ? "border-yellow-500 text-yellow-500"
                          : "border-red-500 text-red-500"
                    }`}
                  >
                    {selectedRoadmap.difficulty}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1.5">
                    {selectedRoadmap.stages.length} Stages
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border bg-background overflow-hidden">
                <Button
                  variant={viewMode === "visual" ? "default" : "ghost"}
                  onClick={() => setViewMode("visual")}
                  className="rounded-none border-r"
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Visual Map
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className="rounded-none"
                >
                  <ListIcon className="w-4 h-4 mr-2" />
                  List View
                </Button>
              </div>
              <Button variant="outline" onClick={handleBackToSelection}>
                Back to Fields
              </Button>
            </div>
          </div>

          {viewMode === "visual" && (
            <div className="flex flex-col items-center py-12 space-y-0">
              {selectedRoadmap.stages.map((stage, index) => (
                <VisualMapNode
                  key={stage.id}
                  stage={stage}
                  index={index}
                  color={selectedRoadmap.color}
                  isLast={index === selectedRoadmap.stages.length - 1}
                />
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {selectedRoadmap.stages.map((stage, index) => (
                <StageListCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  color={selectedRoadmap.color}
                  isExpanded={expandedStages.has(stage.id)}
                  onToggle={() => toggleStage(stage.id)}
                />
              ))}
            </div>
          )}

          {/* Summary Card */}
          <Card className="border-2 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5" />
                Roadmap Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-accent rounded-lg border-2 hover:border-primary transition-colors">
                  <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold tracking-wide">
                    Total Duration
                  </p>
                  <p className="text-3xl font-bold">{selectedRoadmap.totalDuration}</p>
                </div>
                <div className="p-6 bg-accent rounded-lg border-2 hover:border-primary transition-colors">
                  <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold tracking-wide">
                    Learning Stages
                  </p>
                  <p className="text-3xl font-bold">{selectedRoadmap.stages.length}</p>
                </div>
                <div className="p-6 bg-accent rounded-lg border-2 hover:border-primary transition-colors">
                  <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold tracking-wide">
                    Difficulty Level
                  </p>
                  <p className="text-3xl font-bold">{selectedRoadmap.difficulty}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardPageLayout>
  )
}
