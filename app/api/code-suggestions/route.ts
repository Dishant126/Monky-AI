const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

interface CodeSuggestionRequest {
  code: string
  language: string
  cursorLine?: number
  cursorColumn?: number
}

interface GeminiSuggestion {
  insights: string[]
  recommendation_level: "info" | "warning" | "critical"
  suggested_action: "Explain" | "Fix" | "Refactor" | "Optimize" | "Document"
}

let circuitBreakerOpen = false
let circuitBreakerResetTime = 0
const CIRCUIT_BREAKER_TIMEOUT = 60000 // 1 minute

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  if (circuitBreakerOpen && Date.now() < circuitBreakerResetTime) {
    throw new Error("Circuit breaker is open - API temporarily disabled")
  }

  let lastError: Error | null = null

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options)

      // If successful, reset circuit breaker
      if (response.ok) {
        circuitBreakerOpen = false
        circuitBreakerResetTime = 0
        return response
      }

      // If we get 503 (overloaded), retry with exponential backoff + jitter
      if (response.status === 503 && i < maxRetries) {
        const baseWait = Math.pow(2, i + 1) * 1000
        const jitter = Math.random() * 1000
        const waitTime = baseWait + jitter

        console.log(
          `[v0] Gemini API overloaded (503), retrying in ${Math.round(waitTime / 1000)}s... (attempt ${i + 1}/${maxRetries})`,
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        continue
      }

      if (response.status === 503 && i === maxRetries) {
        circuitBreakerOpen = true
        circuitBreakerResetTime = Date.now() + CIRCUIT_BREAKER_TIMEOUT
        console.log("[v0] Opening circuit breaker - API will be disabled for 1 minute")
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error")
      if (i < maxRetries) {
        const waitTime = Math.pow(2, i) * 1000
        console.log(`[v0] Fetch error, retrying in ${waitTime}ms...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError || new Error("Max retries reached")
}

export async function POST(request: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return Response.json({
        success: true,
        suggestion: {
          insights: ["Gemini API key not configured - add GEMINI_API_KEY to environment variables"],
          recommendation_level: "warning" as const,
          suggested_action: "Explain" as const,
        },
      })
    }

    if (circuitBreakerOpen && Date.now() < circuitBreakerResetTime) {
      const remainingTime = Math.ceil((circuitBreakerResetTime - Date.now()) / 1000)
      return Response.json({
        success: true,
        suggestion: {
          insights: [
            `Gemini API temporarily paused (${remainingTime}s remaining)`,
            "Continue coding - suggestions will resume automatically",
          ],
          recommendation_level: "info" as const,
          suggested_action: "Explain" as const,
        },
      })
    }

    const body: CodeSuggestionRequest = await request.json()
    const { code, language, cursorLine, cursorColumn } = body

    if (!code || !language) {
      return Response.json({ error: "Code and language are required" }, { status: 400 })
    }

    const lines = code.split("\n")
    let cursorContext = "at the end of the code"

    if (cursorLine && cursorLine > 0 && cursorLine <= lines.length) {
      const currentLine = lines[cursorLine - 1]
      const lineContent = currentLine.trim()

      if (lineContent.includes("function") || lineContent.includes("def ")) {
        cursorContext = `inside function definition on line ${cursorLine}`
      } else if (lineContent.includes("class ")) {
        cursorContext = `inside class definition on line ${cursorLine}`
      } else if (lineContent.includes("if ") || lineContent.includes("for ") || lineContent.includes("while ")) {
        cursorContext = `inside control flow statement on line ${cursorLine}`
      } else if (lineContent) {
        cursorContext = `on line ${cursorLine}: "${lineContent}"`
      } else {
        cursorContext = `on empty line ${cursorLine}`
      }
    }

    const prompt = `Analyze this ${language} code (cursor ${cursorContext}) and provide 1-3 brief insights:

\`\`\`${language}
${code}
\`\`\`

Respond ONLY with valid JSON (no markdown):
{
  "insights": ["brief insight 1", "brief insight 2"],
  "recommendation_level": "info",
  "suggested_action": "Explain"
}

Focus on real issues or improvements. Keep each insight under 80 chars.`

    const response = await fetchWithRetry(GEMINI_API_URL, {
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
          temperature: 0.4,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 40,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Gemini API error:", errorData)

      const errorMessage = errorData?.error?.message || "Unknown error"
      const isOverloaded = errorData?.error?.code === 503

      return Response.json({
        success: true,
        suggestion: {
          insights: [
            isOverloaded
              ? "Gemini is busy - suggestions paused temporarily"
              : "AI temporarily unavailable - your code will be analyzed soon",
          ],
          recommendation_level: "info" as const,
          suggested_action: "Explain" as const,
        },
      })
    }

    const data = await response.json()

    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || data.candidates?.[0]?.output || data.text || null

    if (!aiResponse) {
      console.error("[v0] No text found in response. Full response:", JSON.stringify(data, null, 2))

      return Response.json({
        success: true,
        suggestion: {
          insights: ["Keep coding - AI will analyze as you type"],
          recommendation_level: "info" as const,
          suggested_action: "Explain" as const,
        },
      })
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

    let suggestion: GeminiSuggestion
    try {
      suggestion = JSON.parse(jsonString)

      if (!suggestion.insights || !Array.isArray(suggestion.insights)) {
        throw new Error("Invalid response structure")
      }
    } catch (parseError) {
      console.error("[v0] Failed to parse Gemini response:", jsonString.substring(0, 200))
      console.error("[v0] Parse error:", parseError)

      suggestion = {
        insights: [
          "Continue writing - AI suggestions will appear shortly",
          "Make sure your code has clear logic and structure",
        ],
        recommendation_level: "info",
        suggested_action: "Explain",
      }
    }

    return Response.json({
      success: true,
      suggestion,
    })
  } catch (error) {
    console.error("[v0] Error getting code suggestions:", error)

    const isCircuitBreakerError = error instanceof Error && error.message.includes("Circuit breaker")

    return Response.json({
      success: true,
      suggestion: {
        insights: [
          isCircuitBreakerError
            ? "AI temporarily paused - will retry automatically"
            : "AI assistant is processing - continue coding",
        ],
        recommendation_level: "info" as const,
        suggested_action: "Explain" as const,
      },
    })
  }
}
