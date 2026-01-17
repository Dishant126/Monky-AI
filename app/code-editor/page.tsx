"use client"

import DashboardPageLayout from "@/components/dashboard/layout"
import BracketsIcon from "@/components/icons/brackets"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Bullet } from "@/components/ui/bullet"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { LanguageSelector } from "@/components/codetutor/language-selector"
import { OutputPanelTabs } from "@/components/codetutor/output-panel-tabs"
import { DebuggerView } from "@/components/codetutor/debugger-view"
import dynamic from "next/dynamic"

const MonacoEditor = dynamic(() => import("@/components/codetutor/monaco-editor").then(mod => ({ default: mod.MonacoEditor })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-background border border-pop rounded">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-pop border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-foreground/60">Loading Monaco Editor...</p>
      </div>
    </div>
  )
})
import type { SupportedLanguage } from "@/lib/types/codetutor"
import { LANGUAGE_MAP, LANGUAGE_EXTENSIONS } from "@/lib/constants/language-map"
import { runCode, type SubmissionResult } from "@/lib/utils/judge0"
import { Download, Copy, Trash2, Check, Play, Bug, Sparkles, X, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const DEFAULT_CODE: Record<SupportedLanguage, string> = {
  javascript: `function findMax(arr) {
  let max = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max)
      max = arr[i];
  }
  return max;
}

console.log(findMax([1, 5, 3]));`,
  python: `def find_max(arr):
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val

print(find_max([1, 5, 3]))`,
  cpp: `#include <iostream>
using namespace std;

int findMax(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max)
            max = arr[i];
    }
    return max;
}

int main() {
    int arr[] = {1, 5, 3};
    cout << findMax(arr, 3) << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int findMax(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max)
            max = arr[i];
    }
    return max;
}

int main() {
    int arr[] = {1, 5, 3};
    printf("%d\\n", findMax(arr, 3));
    return 0;
}`,
  java: `public class Main {
    public static int findMax(int[] arr) {
        int max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max)
                max = arr[i];
        }
        return max;
    }
    
    public static void main(String[] args) {
        int[] arr = {1, 5, 3};
        System.out.println(findMax(arr));
    }
}`,
  typescript: `function findMax(arr: number[]): number {
  let max = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max)
      max = arr[i];
  }
  return max;
}

console.log(findMax([1, 5, 3]));`,
}

export default function CodeEditorPage() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState<SupportedLanguage>("javascript")
  const [stdin, setStdin] = useState("")
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorLine, setErrorLine] = useState<number | undefined>(undefined)
  const { toast } = useToast()

  const [geminiHintsEnabled, setGeminiHintsEnabled] = useState(false)
  const [geminiSuggestions, setGeminiSuggestions] = useState<{
    insights: string[]
    recommendation_level: "info" | "warning" | "critical"
    suggested_action: string
  } | null>(null)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)

  const [suggestedFix, setSuggestedFix] = useState<{
    fixed_code: string
    explanation: string
    changes: string[]
  } | null>(null)
  const [isGeneratingFix, setIsGeneratingFix] = useState(false)

  const [aiAnalysis, setAiAnalysis] = useState<{
    codeQuality: number
    issues: Array<{ type: "warning" | "error" | "info"; message: string }>
    complexity: string
    timeComplexity: string
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number } | null>(null)
  const { user } = useAuth()
  const [currentSnippetId, setCurrentSnippetId] = useState<string | null>(null)
  const [lastSavedCode, setLastSavedCode] = useState<string>("")
  const [roomId, setRoomId] = useState<string | undefined>(undefined)
  const [isCollaborateDialogOpen, setIsCollaborateDialogOpen] = useState(false)
  const [roomInput, setRoomInput] = useState("")

  useEffect(() => {
    const loadCode = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const snippetId = urlParams.get('snippet')
      const roomParam = urlParams.get('room')

      if (roomParam) {
        setRoomId(roomParam)
      }

      if (snippetId && user) {
        try {
          const response = await fetch(`/api/snippets/${snippetId}`)
          if (response.ok) {
            const snippet = await response.json()
            setCode(snippet.code)
            setLanguage(snippet.language)
            setCurrentSnippetId(snippetId)
            setLastSavedCode(snippet.code)
            return
          }
        } catch (error) {
          console.error('Failed to load snippet:', error)
        }
      }

      // Fallback to localStorage or default
      const savedCode = localStorage.getItem(`code-editor-${language}`)
      if (savedCode) {
        setCode(savedCode)
        setLastSavedCode(savedCode)
      } else {
        setCode(DEFAULT_CODE[language] || "")
        setLastSavedCode(DEFAULT_CODE[language] || "")
      }
      setCurrentSnippetId(null)
    }

    loadCode()
  }, [language, user])

  useEffect(() => {
    const timer = setInterval(() => {
      if (code && user && code.trim() && code !== lastSavedCode) {
        console.log('Auto-saving code:', { codeLength: code.length, lastSavedCodeLength: lastSavedCode.length, currentSnippetId })
        // Auto-save to DB
        const autoSave = async () => {
          try {
            if (currentSnippetId) {
              // Update existing snippet
              console.log('Updating existing snippet:', currentSnippetId)
              const response = await fetch(`/api/snippets/${currentSnippetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
              })
              if (response.ok) {
                setLastSavedCode(code)
                console.log('Snippet updated successfully')
              } else {
                console.error('Failed to update snippet:', response.status)
              }
            } else {
              // Create new snippet
              console.log('Creating new snippet')
              const response = await fetch('/api/snippets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: `${language} Snippet - ${new Date().toLocaleDateString()}`,
                  code,
                  language,
                }),
              })
              if (response.ok) {
                const newSnippet = await response.json()
                console.log('New snippet created:', newSnippet)
                setCurrentSnippetId(newSnippet.id)
                setLastSavedCode(code)
                toast({
                  title: "Auto-saved",
                  description: "Code snippet saved to workspace",
                })
              } else {
                console.error('Failed to create snippet:', response.status, await response.text())
              }
            }
          } catch (error) {
            console.error('Auto-save failed:', error)
          }
        }
        autoSave()
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [code, language, user, currentSnippetId, lastSavedCode, toast])

  useEffect(() => {
    if (!geminiHintsEnabled || !code.trim()) {
      return
    }

    // Debounce: Only analyze after user stops typing for 2 seconds
    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true)
      setSuggestionError(null)

      try {
        const response = await fetch("/api/code-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language,
            cursorLine: cursorPosition?.line,
            cursorColumn: cursorPosition?.column,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to get suggestions")
        }

        const data = await response.json()
        setGeminiSuggestions(data.suggestion)
      } catch (error) {
        console.error("[v0] Error fetching suggestions:", error)
        setSuggestionError("Failed to get AI suggestions")
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timer)
  }, [code, language, geminiHintsEnabled, cursorPosition])

  const handleRunCode = async () => {
    const languageId = LANGUAGE_MAP[language]
    if (!languageId) {
      toast({
        title: "Language not supported",
        description: `${language} is not supported by Judge0`,
        variant: "destructive",
      })
      return
    }

    if (!code.trim()) {
      toast({
        title: "Empty code",
        description: "Please write some code before running",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)
    setIsDebugMode(false)
    setResult(null)
    setErrorLine(undefined)

    try {
      const executionResult = await runCode(code, languageId, stdin || undefined)
      setResult(executionResult)

      if (executionResult.status.id !== 3) {
        const errorOutput = executionResult.stderr || executionResult.compile_output || ""
        const lineMatch = errorOutput.match(/line (\d+)/i) || errorOutput.match(/:(\d+):/i)
        if (lineMatch) {
          setErrorLine(Number.parseInt(lineMatch[1]))
        }
      }

      if (executionResult.status.id === 3) {
        toast({
          title: "Execution successful",
          description: `Completed in ${executionResult.time}s`,
        })
      } else {
        toast({
          title: "Execution failed",
          description: executionResult.status.description,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute code",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleDebug = async () => {
    if (!code.trim()) {
      toast({
        title: "No code",
        description: "Write some code first",
        variant: "destructive",
      })
      return
    }

    setIsDebugMode(true)
    setIsAnalyzing(true)
    setAiAnalysis(null)

    try {
      // First run the code
      await handleRunCode()

      // Then analyze with AI
      const response = await fetch("/api/analyze-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          errorMessage: result?.stderr || result?.compile_output || "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze code")
      }

      const data = await response.json()

      const analysis = data.analysis
      setAiAnalysis({
        codeQuality: analysis.confidence || 85,
        issues: [
          ...(analysis.alternatives || []).slice(0, 3).map((alt: any) => ({
            type: analysis.severity === "critical" ? "error" : analysis.severity === "warning" ? "warning" : "info",
            message: alt.title || alt.explanation,
          })),
        ],
        complexity: analysis.complexity || "O(n) - Linear",
        timeComplexity: analysis.complexity || "O(n) - Linear",
      })

      toast({
        title: "Analysis complete",
        description: `Found ${analysis.alternatives?.length || 0} improvement suggestions`,
      })
    } catch (error) {
      console.error("[v0] Error analyzing code:", error)
      toast({
        title: "Analysis failed",
        description: "Failed to analyze code with AI",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    })
  }

  const handleClearCode = () => {
    setCode("")
    setResult(null)
    setErrorLine(undefined)
    localStorage.removeItem(`code-editor-${language}`)
    toast({
      title: "Cleared",
      description: "Code editor cleared",
    })
  }

  const handleDownloadCode = () => {
    const extension = LANGUAGE_EXTENSIONS[language] || "txt"
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded",
      description: `Code saved as code.${extension}`,
    })
  }

  const handleGenerateFix = async () => {
    if (!code.trim()) {
      toast({
        title: "No code",
        description: "Write some code first",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingFix(true)
    setSuggestedFix(null)

    try {
      const response = await fetch("/api/code-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          errorMessage: result?.stderr || result?.compile_output,
          lineNumber: errorLine,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 503) {
          toast({
            title: "AI Temporarily Unavailable",
            description: "Gemini is overloaded. Please try again in a few moments.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to generate fix",
            variant: "destructive",
          })
        }
        return
      }

      const data = await response.json()
      setSuggestedFix(data.fix)

      toast({
        title: "Fix generated",
        description: "Review and apply the suggested fix",
      })
    } catch (error) {
      console.error("[v0] Error generating fix:", error)
      toast({
        title: "Error",
        description: "Failed to generate fix. Check your connection.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingFix(false)
    }
  }

  const handleApplyFix = () => {
    if (suggestedFix) {
      setCode(suggestedFix.fixed_code)
      setSuggestedFix(null)
      setErrorLine(undefined)
      setResult(null)

      toast({
        title: "Fix applied",
        description: "Code has been updated with the suggested fix",
      })
    }
  }

  const handleFormatCode = () => {
    // Simple code formatting - add proper indentation
    const lines = code.split("\n")
    let indentLevel = 0
    const formatted = lines
      .map((line) => {
        const trimmed = line.trim()
        if (trimmed.includes("}") || trimmed.includes("]")) indentLevel = Math.max(0, indentLevel - 1)
        const indented = "  ".repeat(indentLevel) + trimmed
        if (trimmed.includes("{") || trimmed.includes("[")) indentLevel++
        return indented
      })
      .join("\n")

    setCode(formatted)
    toast({
      title: "Code formatted",
      description: "Code has been auto-formatted",
    })
  }

  const handleUploadFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".js,.ts,.py,.java,.cpp,.c"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          setCode(content)

          // Auto-detect language from file extension
          const ext = file.name.split(".").pop()?.toLowerCase()
          const langMap: Record<string, SupportedLanguage> = {
            js: "javascript",
            ts: "typescript",
            py: "python",
            java: "java",
            cpp: "cpp",
            c: "c",
          }
          if (ext && langMap[ext]) {
            setLanguage(langMap[ext])
          }

          toast({
            title: "File uploaded",
            description: `Loaded ${file.name}`,
          })
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleSaveSnippet = async () => {
    if (!code.trim()) {
      toast({
        title: "No code",
        description: "Write some code first",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${language} Snippet - ${new Date().toLocaleDateString()}`,
          description: `Code snippet created on ${new Date().toLocaleString()}`,
          code,
          language,
          tags: [language],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save snippet")
      }

      toast({
        title: "Snippet saved",
        description: "Code snippet has been saved to your workspace",
      })
    } catch (error) {
      console.error("[v0] Error saving snippet:", error)
      toast({
        title: "Save failed",
        description: "Failed to save snippet",
        variant: "destructive",
      })
    }
  }

  const getLevelColor = (level: "info" | "warning" | "critical") => {
    switch (level) {
      case "critical":
        return "text-red-400 bg-red-950/20 border-red-500"
      case "warning":
        return "text-yellow-400 bg-yellow-950/20 border-yellow-500"
      default:
        return "text-blue-400 bg-blue-950/20 border-blue-500"
    }
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Code Editor",
        description: "Write, debug, and analyze code with AI-powered insights",
        icon: BracketsIcon,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="ring-2 ring-pop">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
                  <Bullet />
                  Code Editor
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-background border border-pop rounded px-3 py-1.5">
                    <Sparkles className={`size-4 ${geminiHintsEnabled ? "text-purple-400" : "text-foreground/40"}`} />
                    <Label htmlFor="gemini-hints" className="text-xs cursor-pointer">
                      Gemini Hints
                    </Label>
                    <Switch id="gemini-hints" checked={geminiHintsEnabled} onCheckedChange={setGeminiHintsEnabled} />
                  </div>
                  <LanguageSelector value={language} onChange={setLanguage} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-accent space-y-4">
              {geminiHintsEnabled && (
                <div
                  className={`p-3 rounded border ${geminiSuggestions ? getLevelColor(geminiSuggestions.recommendation_level) : "bg-background border-pop"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <Sparkles className="size-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase mb-2">
                          {isLoadingSuggestions
                            ? "Monky AI is analyzing..."
                            : suggestionError
                              ? "Error"
                              : geminiSuggestions
                                ? `${geminiSuggestions.suggested_action} • ${geminiSuggestions.recommendation_level.toUpperCase()}`
                                : "Monky AI Active"}
                        </p>
                        {isLoadingSuggestions && (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs opacity-70">Analyzing your code in real-time...</p>
                          </div>
                        )}
                        {suggestionError && <p className="text-xs opacity-70">{suggestionError}</p>}
                        {!isLoadingSuggestions && !suggestionError && geminiSuggestions && (
                          <ul className="space-y-1.5">
                            {geminiSuggestions.insights.map((insight, index) => (
                              <li key={index} className="text-xs flex items-start gap-2">
                                <span className="text-current">•</span>
                                <span className="opacity-90">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {!isLoadingSuggestions && !suggestionError && !geminiSuggestions && (
                          <p className="text-xs opacity-70">Start typing to receive real-time AI suggestions...</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setGeminiHintsEnabled(false)}
                      className="text-foreground/40 hover:text-foreground transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              {suggestedFix && (
                <div className="p-4 bg-green-950/20 border border-green-500 rounded space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="size-4 text-green-400" />
                        <p className="text-xs text-green-400 uppercase font-semibold">Gemini Suggested Fix</p>
                      </div>
                      <p className="text-sm text-foreground/90 mb-2">{suggestedFix.explanation}</p>
                      <ul className="space-y-1">
                        {suggestedFix.changes.map((change, index) => (
                          <li key={index} className="text-xs text-foreground/70 flex items-start gap-2">
                            <span className="text-green-400">✓</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => setSuggestedFix(null)}
                      className="text-foreground/40 hover:text-foreground transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyFix}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold transition-all text-sm"
                    >
                      Apply Fix
                    </button>
                    <button
                      onClick={() => setSuggestedFix(null)}
                      className="px-3 py-2 bg-background border border-pop rounded hover:bg-accent-active transition-all text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div className="h-[500px]">
                <MonacoEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  errorLine={errorLine}
                  onCursorChange={(line, column) => setCursorPosition({ line, column })}
                  roomId={roomId}
                />
              </div>

              <div>
                <label className="text-xs text-foreground/60 uppercase mb-2 block">Standard Input (Optional)</label>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  className="w-full h-20 p-3 font-mono text-sm bg-background border border-pop rounded resize-none focus:outline-none focus:ring-2 focus:ring-pop transition-all"
                  placeholder="Enter input for your program..."
                  spellCheck="false"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isRunning && !isDebugMode ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Code
                    </>
                  )}
                </button>
                <Dialog open={isCollaborateDialogOpen} onOpenChange={setIsCollaborateDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 font-semibold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Collaborate
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Collaborative Coding Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Room ID</label>
                        <Input
                          value={roomInput}
                          onChange={(e) => setRoomInput(e.target.value)}
                          placeholder="Enter room ID to join"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const newRoomId = Math.random().toString(36).substring(2, 15)
                            window.location.href = `?room=${newRoomId}`
                          }}
                          className="flex-1"
                        >
                          Create New Room
                        </Button>
                        <Button
                          onClick={() => {
                            if (roomInput.trim()) {
                              window.location.href = `?room=${roomInput.trim()}`
                            }
                          }}
                          disabled={!roomInput.trim()}
                          className="flex-1"
                        >
                          Join Room
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background border border-pop rounded hover:bg-accent-active transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background border border-pop rounded hover:bg-accent-active transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleClearCode}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background border border-pop rounded hover:bg-accent-active transition-all text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </CardContent>
          </Card>

          <OutputPanelTabs result={result} isLoading={isRunning} />

          <DebuggerView result={result} isActive={isDebugMode} />
        </div>

        <div className="space-y-4">
          <Card className="ring-2 ring-pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
                <Bullet />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-accent space-y-3">
              {geminiHintsEnabled && geminiSuggestions && (
                <div className="p-3 bg-purple-950/20 border border-purple-500 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-purple-400" />
                    <p className="text-xs text-purple-400 uppercase font-semibold">Gemini Active</p>
                  </div>
                  <p className="text-xs text-foreground/70">
                    Real-time suggestions: {geminiSuggestions.recommendation_level.toUpperCase()}
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="p-3 bg-background border border-pop rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-foreground/60">Analyzing code...</p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-background border border-pop rounded">
                <p className="text-xs text-foreground/60 uppercase mb-1">Code Quality</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full ${aiAnalysis?.codeQuality && aiAnalysis.codeQuality >= 80 ? "bg-green-500" : aiAnalysis?.codeQuality && aiAnalysis.codeQuality >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${aiAnalysis?.codeQuality || 85}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">{aiAnalysis?.codeQuality || 85}%</span>
                </div>
              </div>

              <div className="p-3 bg-background border border-pop rounded">
                <p className="text-xs text-foreground/60 uppercase mb-2">Issues Found</p>
                {!aiAnalysis || aiAnalysis.issues.length === 0 ? (
                  <p className="text-xs text-foreground/40">Run Debug & Analyze to find issues</p>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {aiAnalysis.issues.map((issue, index) => (
                      <li
                        key={index}
                        className={
                          issue.type === "error"
                            ? "text-red-400"
                            : issue.type === "warning"
                              ? "text-yellow-400"
                              : "text-blue-400"
                        }
                      >
                        {issue.type === "error" ? "✕" : issue.type === "warning" ? "⚠" : "ℹ"} {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 bg-background border border-pop rounded">
                <p className="text-xs text-foreground/60 uppercase mb-1">Time Complexity</p>
                <p className="text-sm font-bold">{aiAnalysis?.timeComplexity || "Run analysis to calculate"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="ring-2 ring-pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
                <Bullet />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-accent space-y-2">
              <button
                onClick={handleFormatCode}
                className="w-full px-3 py-2 text-sm bg-background border border-pop rounded hover:bg-accent-active text-left transition-all"
              >
                Format Code
              </button>
              <button
                onClick={handleUploadFile}
                className="w-full px-3 py-2 text-sm bg-background border border-pop rounded hover:bg-accent-active text-left transition-all"
              >
                Upload File
              </button>
              <button
                onClick={handleSaveSnippet}
                className="w-full px-3 py-2 text-sm bg-background border border-pop rounded hover:bg-accent-active text-left transition-all"
              >
                Save Snippet
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
