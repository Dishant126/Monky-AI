"use client";

import dynamic from "next/dynamic";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bullet } from "@/components/ui/bullet";
import { useState, useEffect } from "react";
import { PROJECTS, type Project, type ProjectStep } from "@/lib/data/projects";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Code,
  Download,
  Github,
  ExternalLink,
  CheckCircle2,
  Circle,
  Lightbulb,
  Target,
  Clock,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MonacoEditor = dynamic(
  () =>
    import("@/components/codetutor/monaco-editor").then((mod) => ({
      default: mod.MonacoEditor,
    })),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16a9.065 9.065 0 0 1-6.23-.693L5 15.3m14.8 0 .38.096c1.046.263 1.82 1.222 1.82 2.386v.413c0 .818-.393 1.544-1 2.007v4.548a1.25 1.25 0 0 1-1.25 1.25h-13.5A1.25 1.25 0 0 1 5 23.75v-4.548a2.25 2.25 0 0 1-1-2.007v-.413c0-1.164.774-2.123 1.82-2.386l.38-.096"
      />
    </svg>
  );
}

export default function ProjectLabPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [code, setCode] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [aiReview, setAiReview] = useState<{
    score: number;
    feedback: string[];
    suggestions: string[];
  } | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const { toast } = useToast();

  const currentStep = selectedProject?.steps[currentStepIndex];

  useEffect(() => {
    if (currentStep) {
      setCode(currentStep.code);
    }
  }, [currentStep]);

  useEffect(() => {
    // Load progress from localStorage
    const saved = localStorage.getItem("project-lab-progress");
    if (saved) {
      const progress = JSON.parse(saved);
      setCompletedSteps(new Set(progress.completedSteps));
    }
  }, []);

  const saveProgress = (steps: Set<string>) => {
    localStorage.setItem(
      "project-lab-progress",
      JSON.stringify({
        completedSteps: Array.from(steps),
      })
    );
  };

  const markStepComplete = () => {
    if (currentStep) {
      const newCompleted = new Set(completedSteps);
      newCompleted.add(currentStep.id);
      setCompletedSteps(newCompleted);
      saveProgress(newCompleted);

      toast({
        title: "Step completed!",
        description: "Great job! Move to the next step.",
      });

      if (currentStepIndex < (selectedProject?.steps.length || 0) - 1) {
        setTimeout(() => setCurrentStepIndex(currentStepIndex + 1), 1000);
      }
    }
  };

  const requestAIReview = async () => {
    setIsReviewing(true);
    setAiReview(null);

    try {
      const response = await fetch("/api/review-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: currentStep?.language || "javascript",
          projectContext: selectedProject?.title,
          stepContext: currentStep?.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI review");
      }

      const data = await response.json();
      setAiReview(data.review);

      toast({
        title: "AI Review Complete",
        description: `Code quality score: ${data.review.score}/100`,
      });
    } catch (error) {
      console.error("[v0] Error getting AI review:", error);
      toast({
        title: "Review failed",
        description: "Failed to get AI code review",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDeployToVercel = () => {
    toast({
      title: "Deploying to Vercel",
      description: "Opening deployment window...",
    });
    // In real implementation, this would trigger actual deployment
    window.open("https://vercel.com/new", "_blank");
  };

  const handlePushToGitHub = () => {
    toast({
      title: "Preparing GitHub export",
      description: "Download your project files first",
    });
  };

  const handleDownloadProject = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ext =
      currentStep?.language === "html"
        ? "html"
        : currentStep?.language === "css"
        ? "css"
        : "js";
    a.download = `${currentStep?.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Project file saved to your device",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-400 border-green-500";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500";
      case "advanced":
        return "bg-red-500/10 text-red-400 border-red-500";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500";
    }
  };

  if (!selectedProject) {
    return (
      <DashboardPageLayout
        header={{
          title: "Project Lab",
          description:
            "Build real-world projects with guided instructions and AI assistance",
          icon: BeakerIcon,
        }}
      >
        <div className="space-y-8">
          <Card className="ring-2 ring-pop bg-gradient-to-br from-purple-950/20 to-blue-950/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-display mb-2">
                    Welcome to Project Lab
                  </h2>
                  <p className="text-foreground/70 leading-relaxed">
                    Learn by building real-world projects with step-by-step
                    guidance, live preview, AI code reviews, and one-click
                    deployment. Each project includes detailed instructions,
                    hints, and best practices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project) => {
              const completedCount = project.steps.filter((step) =>
                completedSteps.has(step.id)
              ).length;
              const progressPercent =
                (completedCount / project.steps.length) * 100;

              return (
                <Card
                  key={project.id}
                  className="ring-2 ring-pop hover:ring-purple-500 transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
                  onClick={() => {
                    setSelectedProject(project);
                    setCurrentStepIndex(0);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Badge
                        className={`${getDifficultyColor(
                          project.difficulty
                        )} border uppercase text-xs`}
                      >
                        {project.difficulty}
                      </Badge>
                      <span className="text-xs text-foreground/50 uppercase">
                        {project.category}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-display group-hover:text-purple-400 transition-colors">
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-foreground/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {project.duration}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        {project.steps.length} steps
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>

                    {completedCount > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground/60">Progress</span>
                          <span className="text-foreground/60">
                            {completedCount}/{project.steps.length}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Button className="w-full group-hover:bg-purple-600 transition-colors">
                      {completedCount > 0
                        ? "Continue Project"
                        : "Start Project"}
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      header={{
        title: selectedProject.title,
        description: selectedProject.description,
        icon: BeakerIcon,
        actions: (
          <Button variant="outline" onClick={() => setSelectedProject(null)}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Back to Projects
          </Button>
        ),
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Steps */}
        <div className="lg:col-span-1">
          <Card className="ring-2 ring-pop sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
                <Bullet />
                Project Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedProject.steps.map((step, index) => {
                const isCompleted = completedSteps.has(step.id);
                const isCurrent = index === currentStepIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIndex(index)}
                    className={`w-full text-left p-3 rounded border transition-all ${
                      isCurrent
                        ? "bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/50"
                        : isCompleted
                        ? "bg-green-500/10 border-green-500/50"
                        : "bg-background border-pop hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle
                            className={`w-5 h-5 ${
                              isCurrent
                                ? "text-purple-400"
                                : "text-foreground/40"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-foreground/60 mb-1">
                          Step {index + 1}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            isCurrent ? "text-purple-400" : ""
                          }`}
                        >
                          {step.title}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Editor and Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="ring-2 ring-pop">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
                  <Bullet />
                  {currentStep?.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentStepIndex(Math.max(0, currentStepIndex - 1))
                    }
                    disabled={currentStepIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-foreground/60">
                    {currentStepIndex + 1} / {selectedProject.steps.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentStepIndex(
                        Math.min(
                          selectedProject.steps.length - 1,
                          currentStepIndex + 1
                        )
                      )
                    }
                    disabled={
                      currentStepIndex === selectedProject.steps.length - 1
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-950/20 border border-blue-500 rounded">
                <h4 className="text-sm font-semibold mb-2 text-blue-400 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Instructions
                </h4>
                <p className="text-sm text-foreground/80 mb-3">
                  {currentStep?.description}
                </p>
                <ul className="space-y-2">
                  {currentStep?.instructions.map((instruction, index) => (
                    <li
                      key={index}
                      className="text-sm text-foreground/70 flex items-start gap-2"
                    >
                      <span className="text-blue-400 flex-shrink-0">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "code" | "preview")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Code Editor
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="mt-4">
                  <div className="h-[500px] rounded overflow-hidden border border-pop">
                    <MonacoEditor
                      value={code}
                      onChange={setCode}
                      language={
                        currentStep?.language === "html" ||
                        currentStep?.language === "css"
                          ? "javascript"
                          : currentStep?.language || "javascript"
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="h-[500px] rounded overflow-hidden border border-pop bg-white">
                    {currentStep?.language === "html" ? (
                      <iframe
                        srcDoc={code}
                        className="w-full h-full"
                        title="Preview"
                      />
                    ) : (
                      <div className="p-6 flex items-center justify-center h-full">
                        <div className="text-center text-gray-600">
                          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Preview available for HTML projects</p>
                          <p className="text-sm opacity-70 mt-2">
                            Run your code to see the output
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3">
                <Button
                  onClick={markStepComplete}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 w-4 h-4" />
                  Mark Complete
                </Button>
                <Button
                  onClick={requestAIReview}
                  disabled={isReviewing}
                  variant="outline"
                  className="flex-1"
                >
                  {isReviewing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Reviewing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-4 h-4" />
                      AI Review
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {currentStep?.hints && currentStep.hints.length > 0 && (
            <Card className="ring-2 ring-pop bg-yellow-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase text-yellow-400">
                  <Lightbulb className="w-5 h-5" />
                  Hints & Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentStep.hints.map((hint, index) => (
                    <li
                      key={index}
                      className="text-sm text-foreground/70 flex items-start gap-2"
                    >
                      <span className="text-yellow-400">💡</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar - AI Review & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="ring-2 ring-pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
                <Bullet />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleDownloadProject}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="mr-2 w-4 h-4" />
                Download Code
              </Button>
              <Button
                onClick={handlePushToGitHub}
                variant="outline"
                className="w-full justify-start"
              >
                <Github className="mr-2 w-4 h-4" />
                Push to GitHub
              </Button>
              <Button
                onClick={handleDeployToVercel}
                variant="outline"
                className="w-full justify-start"
              >
                <ExternalLink className="mr-2 w-4 h-4" />
                Deploy to Vercel
              </Button>
            </CardContent>
          </Card>

          {aiReview && (
            <Card className="ring-2 ring-purple-500 bg-purple-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase text-purple-400">
                  <Sparkles className="w-5 h-5" />
                  AI Code Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/60">
                    Code Quality Score
                  </span>
                  <span className="text-2xl font-bold text-purple-400">
                    {aiReview.score}/100
                  </span>
                </div>

                <div className="w-full h-3 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${aiReview.score}%` }}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 text-foreground/80">
                    Feedback
                  </h4>
                  <ul className="space-y-1.5">
                    {aiReview.feedback.map((item, index) => (
                      <li
                        key={index}
                        className="text-xs text-foreground/70 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 text-foreground/80">
                    Suggestions
                  </h4>
                  <ul className="space-y-1.5">
                    {aiReview.suggestions.map((item, index) => (
                      <li
                        key={index}
                        className="text-xs text-foreground/70 flex items-start gap-2"
                      >
                        <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="ring-2 ring-pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
                <Bullet />
                Project Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-foreground/60 mb-1">Difficulty</div>
                <Badge
                  className={`${getDifficultyColor(
                    selectedProject.difficulty
                  )} border uppercase`}
                >
                  {selectedProject.difficulty}
                </Badge>
              </div>

              <div>
                <div className="text-foreground/60 mb-2">Technologies</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-foreground/60 mb-2">
                  Learning Objectives
                </div>
                <ul className="space-y-1.5">
                  {selectedProject.learningObjectives.map((obj, index) => (
                    <li
                      key={index}
                      className="text-xs text-foreground/70 flex items-start gap-2"
                    >
                      <Target className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
