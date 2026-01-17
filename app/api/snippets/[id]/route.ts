import { type NextRequest, NextResponse } from "next/server"
import dbConnect from '@/lib/db'
import Code from '@/lib/models/Code'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const snippet = await Code.findOne({
      _id: params.id,
      userId: user.id
    })

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: (snippet as any)._id.toString(),
      userId: snippet.userId,
      title: snippet.title,
      language: snippet.language,
      code: snippet.code,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    })
  } catch (error) {
    console.error("[v0] Error fetching snippet:", error)
    if (error === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    await dbConnect()

    const snippet = await Code.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { code },
      { new: true }
    )

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: (snippet as any)._id.toString(),
      userId: snippet.userId,
      title: snippet.title,
      language: snippet.language,
      code: snippet.code,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    })
  } catch (error) {
    console.error("[v0] Error updating snippet:", error)
    if (error === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
