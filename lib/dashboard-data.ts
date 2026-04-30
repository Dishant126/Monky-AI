import { cache } from "react"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import { verifyToken, type AuthUser } from "@/lib/auth"
import User from "@/lib/models/User"
import Code from "@/lib/models/Code"
import DebugHistory from "@/lib/models/DebugHistory"
import type { MockData, Notification, SecurityStatus, WidgetData } from "@/types/dashboard"

type SnippetRecord = {
  userId: string
  title: string
  language: string
  code: string
  createdAt: Date | string
}

type LeaderboardEntry = {
  id: number
  name: string
  handle: string
  points: number
  avatar: string
  featured?: boolean
  streak: string
  languages?: number
  bugs?: number
}

export interface DashboardDataBundle {
  currentUser: AuthUser
  mockData: MockData
  leaderboard: LeaderboardEntry[]
  insights: {
    mostFixedErrors: string
    mostFixedErrorsCount: number
    topLanguage: string
    topLanguageCount: number
    avgDebugTime: string
  }
}

const DEFAULT_AVATAR = "/placeholder.svg?height=100&width=100"

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function addYears(date: Date, years: number) {
  const next = new Date(date)
  next.setFullYear(next.getFullYear() + years)
  return next
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function estimateQuality(code: string, language: string) {
  const lineCount = Math.max(1, code.split(/\r?\n/).length)
  const averageLineLength = code.length / lineCount
  const braceBalance = (code.match(/\{/g)?.length ?? 0) - (code.match(/\}/g)?.length ?? 0)

  let score = 92
  score -= Math.min(12, Math.max(0, averageLineLength - 45) / 5)
  score -= Math.min(10, Math.abs(braceBalance) * 2)

  if (/\bany\b/.test(code) || /as any/.test(code)) {
    score -= 4
  }

  if (/console\.log/.test(code)) {
    score -= 2
  }

  if (/TODO|FIXME/.test(code)) {
    score -= 3
  }

  if (/typescript|ts/i.test(language) && /:\s*any\b/.test(code)) {
    score -= 4
  }

  return clamp(Math.round(score), 60, 99)
}

function estimateLearningMinutes(code: string) {
  return Math.max(5, Math.round(code.length / 60 + code.split(/\r?\n/).length * 0.5))
}

function getConsecutiveDays(snippets: SnippetRecord[]) {
  if (snippets.length === 0) {
    return 0
  }

  const activeDays = new Set(snippets.map((snippet) => startOfDay(new Date(snippet.createdAt)).toISOString()))
  let streak = 0
  let cursor = startOfDay(new Date())

  while (activeDays.has(cursor.toISOString())) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

function getSnippetMistakes(snippets: SnippetRecord[]) {
  return [
    {
      error: "Undefined References",
      count: snippets.filter((snippet) => /\bundefined\b/.test(snippet.code) || /\?\./.test(snippet.code)).length,
    },
    {
      error: "Null Handling",
      count: snippets.filter((snippet) => /\bnull\b/.test(snippet.code)).length,
    },
    {
      error: "Type Safety",
      count: snippets.filter((snippet) => /\bany\b/.test(snippet.code) || /as any/.test(snippet.code)).length,
    },
    {
      error: "Syntax Balance",
      count: snippets.filter(
        (snippet) => (snippet.code.match(/\{/g)?.length ?? 0) !== (snippet.code.match(/\}/g)?.length ?? 0),
      ).length,
    },
    {
      error: "Logic Complexity",
      count: snippets.filter((snippet) => /for\s*\(|while\s*\(|map\s*\(/.test(snippet.code)).length,
    },
  ].filter((entry) => entry.count > 0)
}

function buildSeries(snippets: SnippetRecord[], periods: number, unit: "day" | "month" | "year") {
  const now = new Date()
  const buckets = Array.from({ length: periods }, (_, index) => {
    const offset = periods - 1 - index

    const bucketStart =
      unit === "day"
        ? startOfDay(addDays(now, -offset))
        : unit === "month"
          ? startOfDay(addMonths(new Date(now.getFullYear(), now.getMonth(), 1), -offset))
          : startOfDay(addYears(new Date(now.getFullYear(), 0, 1), -offset))

    const bucketEnd = unit === "day" ? addDays(bucketStart, 1) : unit === "month" ? addMonths(bucketStart, 1) : addYears(bucketStart, 1)

    return { bucketStart, bucketEnd, snippets: [] as SnippetRecord[] }
  })

  for (const snippet of snippets) {
    const createdAt = new Date(snippet.createdAt)
    const bucket = buckets.find((candidate) => createdAt >= candidate.bucketStart && createdAt < candidate.bucketEnd)

    if (bucket) {
      bucket.snippets.push(snippet)
    }
  }

  return buckets.map((bucket) => {
    const label =
      unit === "day"
        ? bucket.bucketStart.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })
        : unit === "month"
          ? bucket.bucketStart.toLocaleDateString("en-US", { month: "short" })
          : String(bucket.bucketStart.getFullYear())

    const quality = bucket.snippets.length
      ? Math.round(bucket.snippets.reduce((sum, snippet) => sum + estimateQuality(snippet.code, snippet.language), 0) / bucket.snippets.length)
      : 0

    const learningTime = bucket.snippets.reduce((sum, snippet) => sum + estimateLearningMinutes(snippet.code), 0)

    return {
      date: label,
      bugsFixed: bucket.snippets.length,
      codeQuality: quality,
      learningTime,
    }
  })
}

function buildLeaderboard(
  users: Array<{ id: string; name: string; email: string; avatar?: string }>,
  snippets: SnippetRecord[],
  debugEntries: Array<{ userId: string; createdAt: string }> = [],
) {
  const snippetsByUser = new Map<string, SnippetRecord[]>()

  for (const snippet of snippets) {
    const existing = snippetsByUser.get(snippet.userId) ?? []
    existing.push(snippet)
    snippetsByUser.set(snippet.userId, existing)
  }

  return users
    .map((user) => {
      const userSnippets = snippetsByUser.get(user.id) ?? []
      const userBugFixes = debugEntries.filter((d) => d.userId === user.id).length
      const languageCount = new Set(userSnippets.map((snippet) => snippet.language.trim().toLowerCase())).size
      const streakDays = getConsecutiveDays(userSnippets)
      // include bug-fix points: each debug-history entry gets +20
      const points = userSnippets.length * 10 + languageCount * 15 + streakDays * 5 + userBugFixes * 20

      return {
        id: 0,
        name: user.name.toUpperCase(),
        handle: `@${(user.name || user.email.split("@")[0]).replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
        points,
        avatar: user.avatar || DEFAULT_AVATAR,
        streak: `${streakDays} DAY${streakDays === 1 ? "" : "S"} STREAK - Bugs: ${userSnippets.length}`,
        languages: languageCount,
        bugs: userSnippets.length,
      }
    })
    .sort((left, right) => right.points - left.points)
    .slice(0, 4)
    .map((user, index) => ({
      ...user,
      id: index + 1,
      featured: index === 0,
    }))
}

function buildNotifications(snippets: SnippetRecord[], streakDays: number, languagesMastered: number): Notification[] {
  const latestSnippets = [...snippets]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 3)

  const notifications: Notification[] = latestSnippets.map((snippet, index) => ({
    id: `snippet-${index}-${snippet.title}`,
    title: "SNIPPET SAVED",
    message: `${snippet.title} in ${snippet.language} was saved from your backend data.`,
    timestamp: new Date(snippet.createdAt).toISOString(),
    type: "success",
    read: index > 0,
    priority: index === 0 ? "high" : "medium",
  }))

  if (streakDays > 0) {
    notifications.push({
      id: "streak-notice",
      title: "LEARNING STREAK",
      message: `You are on a ${streakDays}-day learning streak based on recent saved snippets.`,
      timestamp: new Date().toISOString(),
      type: "info",
      read: false,
      priority: "medium",
    })
  }

  notifications.push({
    id: "languages-notice",
    title: "LANGUAGES MASTERED",
    message: `Your backend data includes ${languagesMastered} active language${languagesMastered === 1 ? "" : "s"}.`,
    timestamp: new Date().toISOString(),
    type: "info",
    read: false,
    priority: "low",
  })

  return notifications.slice(0, 4)
}

function buildWidgetData(currentUser: AuthUser, snippets: SnippetRecord[]): WidgetData {
  const now = new Date()
  const activityLoad = snippets.length

  return {
    location: currentUser.name,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    temperature: `${clamp(22 + activityLoad, 24, 34)}°C`,
    weather: activityLoad > 0 ? "ACTIVE" : "READY",
    date: now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }
}

function buildSecurityStatus(totalSessions: number, successRate: number, insightsCount: number): SecurityStatus[] {
  return [
    {
      title: "CODE ANALYZER",
      value: totalSessions > 0 ? "ON" : "IDLE",
      status: totalSessions > 0 ? "[RUNNING...]" : "[WAITING]",
      variant: totalSessions > 0 ? "success" : "warning",
    },
    {
      title: "ERROR DETECTION",
      value: `${Math.round(successRate)}%`,
      status: "[ACTIVE]",
      variant: "success",
    },
    {
      title: "LEARNING INSIGHTS",
      value: String(insightsCount),
      status: "[GENERATED]",
      variant: "success",
    },
  ]
}

function buildBundle(currentUser: AuthUser, snippets: SnippetRecord[], users: Array<{ id: string; name: string; email: string; avatar?: string }>): DashboardDataBundle {
  const languagesMastered = new Set(snippets.map((snippet) => snippet.language.trim().toLowerCase())).size
  const streakDays = getConsecutiveDays(snippets)
  const totalSessions = snippets.length
  const codeQuality = totalSessions > 0
    ? Math.round(snippets.reduce((sum, snippet) => sum + estimateQuality(snippet.code, snippet.language), 0) / totalSessions)
    : 0
  const commonMistakes = getSnippetMistakes(snippets)
  const leaderboard = buildLeaderboard(users, snippets)
  const notifications = buildNotifications(snippets, streakDays, languagesMastered)
  const widgetData = buildWidgetData(currentUser, snippets)
  const securityStatus = buildSecurityStatus(totalSessions, codeQuality, commonMistakes.length)
  const chartData = {
    week: buildSeries(snippets, 8, "day"),
    month: buildSeries(snippets, 12, "month"),
    year: buildSeries(snippets, 5, "year"),
  }

  const topLanguage =
    snippets.length === 0
      ? undefined
      : Array.from(
          snippets.reduce((counts, snippet) => {
            const key = snippet.language || "Unknown"
            counts.set(key, (counts.get(key) ?? 0) + 1)
            return counts
          }, new Map<string, number>()),
        ).sort((left, right) => right[1] - left[1])[0]

  const totalLearningTime = snippets.reduce((sum, snippet) => sum + estimateLearningMinutes(snippet.code), 0)

  return {
    currentUser,
    mockData: {
      dashboardStats: [
        {
          label: "BUGS FIXED",
          value: String(totalSessions),
          description: "THIS MONTH",
          intent: "positive",
          icon: "gear",
          tag: "🐛 SOLVED",
          direction: totalSessions > 0 ? "up" : undefined,
        },
        {
          label: "CODE QUALITY",
          value: `${codeQuality}%`,
          description: "IMPROVEMENT SCORE",
          intent: "positive",
          icon: "proccesor",
          tag: codeQuality >= 90 ? "EXCELLENT" : "TRACKING",
          direction: totalSessions > 0 ? "up" : undefined,
        },
        {
          label: "LEARNING STREAK",
          value: String(streakDays),
          description: "DAYS CONSECUTIVE",
          intent: "positive",
          icon: "boom",
          tag: streakDays > 0 ? "🔥 HOT" : "START",
          direction: streakDays > 0 ? "up" : undefined,
        },
        {
          label: "LANGUAGES MASTERED",
          value: String(languagesMastered),
          description: "PROFICIENCY LEVEL",
          intent: "positive",
          icon: "atom",
          direction: languagesMastered > 0 ? "up" : undefined,
        },
      ],
      chartData,
      rebelsRanking: leaderboard,
      securityStatus,
      notifications,
      widgetData,
    },
    leaderboard,
    insights: {
      mostFixedErrors: commonMistakes[0]?.error ?? "No error patterns yet",
      mostFixedErrorsCount: commonMistakes[0]?.count ?? 0,
      topLanguage: topLanguage?.[0] ?? "N/A",
      topLanguageCount: topLanguage?.[1] ?? 0,
      avgDebugTime: `${snippets.length > 0 ? (totalLearningTime / snippets.length).toFixed(1) : "0.0"} min`,
    },
  }
}

export const getDashboardData = cache(async function getDashboardData(): Promise<DashboardDataBundle> {
  try {
    await dbConnect()

    const token = cookies().get("auth-token")?.value
    const fallbackUser: AuthUser = {
      id: "demo-user",
      email: "demo@example.com",
      name: "Demo User",
      avatar: DEFAULT_AVATAR,
      bio: "This is a demo user for preview purposes",
    }

    const authenticatedUser = token ? await verifyToken(token) : null
    const currentUser = authenticatedUser ?? fallbackUser

    const [users, userSnippets, allSnippets, debugEntries] = await Promise.all([
      User.find({}).select("name email avatar").lean(),
      Code.find({ userId: currentUser.id }).sort({ createdAt: -1 }).lean(),
      Code.find({}).sort({ createdAt: -1 }).lean(),
      DebugHistory.find({}).sort({ createdAt: -1 }).lean(),
    ])

    const normalizedUsers = (users as any[]).map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || DEFAULT_AVATAR,
    }))

    const liveUser =
      authenticatedUser ??
      normalizedUsers.find((user) => user.id === currentUser.id) ??
      fallbackUser

    // use user-specific snippets for personal stats, but all snippets + debug entries to build the leaderboard
    const bundle = buildBundle(
      liveUser,
      userSnippets as SnippetRecord[],
      normalizedUsers.length > 0
        ? normalizedUsers
        : [{ id: liveUser.id, name: liveUser.name, email: liveUser.email, avatar: liveUser.avatar || DEFAULT_AVATAR }],
    )

    // replace leaderboard with one computed from global snippets + debug entries
    const globalLeaderboard = buildLeaderboard(
      normalizedUsers.length > 0
        ? normalizedUsers
        : [{ id: liveUser.id, name: liveUser.name, email: liveUser.email, avatar: liveUser.avatar || DEFAULT_AVATAR }],
      allSnippets as SnippetRecord[],
      debugEntries as any[],
    )

    return {
      ...bundle,
      mockData: {
        ...bundle.mockData,
        rebelsRanking: globalLeaderboard,
      },
      leaderboard: globalLeaderboard,
    }
  } catch (error) {
    const fallbackUser: AuthUser = {
      id: "demo-user",
      email: "demo@example.com",
      name: "Demo User",
      avatar: DEFAULT_AVATAR,
      bio: "This is a demo user for preview purposes",
    }

    return buildBundle(fallbackUser, [], [{ id: fallbackUser.id, name: fallbackUser.name, email: fallbackUser.email, avatar: fallbackUser.avatar || DEFAULT_AVATAR }])
  }
})