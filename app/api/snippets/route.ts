import { type NextRequest, NextResponse } from "next/server"
import dbConnect from '@/lib/db'
import Code from '@/lib/models/Code'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const snippets = await Code.find({ userId: user.id }).sort({ createdAt: -1 })

    const formattedSnippets = snippets.map(snippet => ({
      id: (snippet as any)._id.toString(),
      userId: snippet.userId,
      title: snippet.title,
      language: snippet.language,
      code: snippet.code,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    }))

    return NextResponse.json(formattedSnippets)
  } catch (error) {
    console.error("[v0] Error fetching snippets:", error)
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

    const { title, language, code } = await request.json()

    if (!title || !language || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    const snippet = new Code({
      userId: user.id,
      title,
      language,
      code,
    })

    await snippet.save()

    return NextResponse.json({
      id: (snippet as any)._id.toString(),
      userId: snippet.userId,
      title: snippet.title,
      language: snippet.language,
      code: snippet.code,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating snippet:", error)
    if (error === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Snippet ID is required" }, { status: 400 })
    }

    await dbConnect()

    const snippet = await Code.findOneAndDelete({
      _id: id,
      userId: user.id
    })

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Snippet deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting snippet:", error)
    if (error === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
