const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""

interface CodeFixRequest {
  code: string
  language: string
  errorMessage?: string
  lineNumber?: number
}

interface CodeFix {
  fixed_code: string
  explanation: string
  changes: string[]
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options)

    // If successful or non-retryable error, return immediately
    if (response.ok || (response.status !== 503 && response.status !== 429)) {
      return response
    }

    // If this is the last retry, return the failed response
    if (i === retries - 1) {
      return response
    }

    // Wait before retrying (exponential backoff: 1s, 2s, 4s)
    const delay = Math.pow(2, i) * 1000
    console.log(`[v0] Retrying after ${delay}ms (attempt ${i + 1}/${retries})`)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  throw new Error("Max retries exceeded")
}

export async function POST(request: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key not configured - add GEMINI_API_KEY to environment variables" },
        { status: 500 },
      )
    }

    const body: CodeFixRequest = await request.json()
    const { code, language, errorMessage, lineNumber } = body

    if (!code || !language) {
      return Response.json({ error: "Code and language are required" }, { status: 400 })
    }

    const errorContext = errorMessage
      ? `The code has this error: "${errorMessage}"${lineNumber ? ` on line ${lineNumber}` : ""}.`
      : "The code may have issues that need fixing."

    const prompt = `You are an expert ${language} developer. ${errorContext}

Original code:
\`\`\`${language}
${code}
\`\`\`

Fix the code and respond ONLY with valid JSON (no markdown):
{
  "fixed_code": "complete fixed code here",
  "explanation": "brief explanation of what was fixed",
  "changes": ["change 1", "change 2"]
}

Important:
- Return the COMPLETE fixed code, not just the changes
- Preserve the original code structure and formatting
- Only fix the actual errors/issues
- Keep explanations brief (under 100 chars)`

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetchWithRetry(
      GEMINI_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40,
          },
        }),
      },
      3, // retry 3 times
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Gemini API error:", errorData)

      if (response.status === 503) {
        return Response.json(
          { error: "Gemini API is temporarily overloaded. Please try again in a few moments." },
          { status: 503 },
        )
      }

      return Response.json({ error: "Failed to generate code fix" }, { status: 500 })
    }

    const data = await response.json()
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || data.candidates?.[0]?.output || data.text || null

    if (!aiResponse) {
      console.error("[v0] No text found in response")
      return Response.json({ error: "No fix generated" }, { status: 500 })
    }

    let jsonString = aiResponse.trim()

    // Remove markdown code blocks
    if (jsonString.includes("```json")) {
      jsonString = jsonString.replace(/```json\s*/g, "").replace(/```\s*$/g, "")
    } else if (jsonString.includes("```")) {
      jsonString = jsonString.replace(/```\s*/g, "")
    }

    const firstBraceIndex = jsonString.indexOf("{")
    const lastBraceIndex = jsonString.lastIndexOf("}")

    if (firstBraceIndex !== -1 && lastBraceIndex !== -1) {
      jsonString = jsonString.substring(firstBraceIndex, lastBraceIndex + 1)
    }

    let fix: CodeFix
    try {
      fix = JSON.parse(jsonString)

      if (!fix.fixed_code || !fix.explanation) {
        throw new Error("Invalid response structure")
      }
    } catch (parseError) {
      console.error("[v0] Failed to parse Gemini response:", jsonString.substring(0, 200))
      return Response.json({ error: "Failed to parse fix response" }, { status: 500 })
    }

    return Response.json({
      success: true,
      fix,
    })
  } catch (error) {
    console.error("[v0] Error generating code fix:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
