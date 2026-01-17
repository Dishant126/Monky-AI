import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { code, language, projectContext, stepContext } = await request.json()

    if (!code || !language) {
      return NextResponse.json({ error: "Missing required fields: code and language" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are an expert code reviewer and programming mentor. Review this ${language} code for the project "${projectContext}" (step: "${stepContext}").

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive review with:
1. Code quality score (0-100)
2. Positive feedback (3-5 things done well)
3. Improvement suggestions (3-5 specific recommendations)

Focus on: code quality, best practices, readability, performance, security, and educational value.

Respond in JSON format:
{
  "score": number,
  "feedback": ["positive point 1", "positive point 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const review = JSON.parse(jsonMatch[0])

    return NextResponse.json({ review })
  } catch (error) {
    console.error("[v0] Error reviewing code:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to review code" },
      { status: 500 }
    )
  }
}
