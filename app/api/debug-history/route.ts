import { type NextRequest, NextResponse } from "next/server"
import dbConnect from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import DebugHistory from '@/lib/models/DebugHistory'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const entries = await DebugHistory.find({ userId: user.id }).sort({ createdAt: -1 }).lean()

    return NextResponse.json(entries)
  } catch (error) {
    console.error("[v0] Error fetching debug history:", error)
    if (error === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { codeSnippetId, errorMessage, analysis, fixedCode } = await request.json()

    if (!errorMessage || !fixedCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    const entry = new DebugHistory({
      userId: user.id,
      codeSnippetId: codeSnippetId ?? null,
      errorMessage,
      analysis,
      fixedCode,
    })

    await entry.save()

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating debug history:", error)
    if (error === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
