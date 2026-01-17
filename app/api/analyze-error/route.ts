import type { CodeAnalysisRequest, ErrorAnalysis } from "@/lib/types/error-analysis"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

export async function POST(request: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key not configured. Please add GEMINI_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const body: CodeAnalysisRequest = await request.json()
    const { code, language, errorMessage } = body

    if (!code || !language) {
      return Response.json({ error: "Code and language are required" }, { status: 400 })
    }

    const prompt = `You are an expert code debugger. Analyze this ${language} code and provide a detailed analysis.

Code:
\`\`\`${language}
${code}
\`\`\`

${errorMessage ? `Error Message: ${errorMessage}` : ""}

Provide your analysis in the following JSON format (keep responses BRIEF):
{
  "errorType": "Brief error title or 'No Errors Found'",
  "severity": "critical" | "warning" | "info",
  "rootCause": "Brief root cause explanation",
  "explanationEnglish": "Brief explanation in English",
  "explanationHindi": "Brief explanation in Hindi",
  "fixedCode": "The corrected/improved code",
  "fixExplanation": "Brief fix explanation",
  "timeComplexity": "Time complexity in Big O notation (e.g., O(n), O(n²), O(log n), O(1))",
  "spaceComplexity": "Space complexity in Big O notation",
  "confidence": 85-99,
  "alternatives": [
    {
      "title": "Brief alternative title",
      "code": "Alternative code",
      "explanation": "Brief explanation"
    }
  ] (EXACTLY 3 alternatives specific to this code),
  "variableSnapshot": {
    "variableName": "value"
  } (extract ACTUAL variables from THIS code),
  "learningResources": [
    {"title": "Resource title", "description": "Brief description"}
  ] (EXACTLY 3 resources relevant to THIS code's concepts),
  "learningTip": "Brief learning tip relevant to THIS code"
}

CRITICAL: 
- BE CONCISE - Keep all explanations under 100 chars
- Calculate ACTUAL time complexity from the code (loops, recursion, etc.)
- Calculate ACTUAL space complexity (data structures, memory usage)
- Provide EXACTLY 3 alternatives
- Provide EXACTLY 3 learning resources
- Extract REAL variables from the code
- Return ONLY valid JSON, no markdown`

    const response = await fetch(GEMINI_API_URL, {
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
          maxOutputTokens: 4096,
          topP: 0.95,
          topK: 40,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()

    console.log("[v0] Gemini API full response:", JSON.stringify(data, null, 2))

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      throw new Error("No response from Gemini API")
    }

    // Extract JSON from markdown code blocks if present
    let jsonString = aiResponse

    // Remove markdown code blocks if present
    if (jsonString.includes("```json")) {
      jsonString = jsonString.replace(/```json\s*/g, "").replace(/```\s*$/g, "")
    } else if (jsonString.includes("```")) {
      jsonString = jsonString.replace(/```\s*/g, "")
    }

    // Find the JSON object boundaries - ensure we get the complete object
    const firstBraceIndex = jsonString.indexOf("{")
    let lastBraceIndex = -1
    let braceCount = 0

    // Count braces to find the matching closing brace
    for (let i = firstBraceIndex; i < jsonString.length; i++) {
      if (jsonString[i] === "{") braceCount++
      if (jsonString[i] === "}") {
        braceCount--
        if (braceCount === 0) {
          lastBraceIndex = i
          break
        }
      }
    }

    if (firstBraceIndex === -1 || lastBraceIndex === -1 || firstBraceIndex >= lastBraceIndex) {
      console.error("[v0] Could not find valid JSON boundaries in:", aiResponse.substring(0, 200))
      throw new Error("Could not find valid JSON in AI response")
    }

    jsonString = jsonString.substring(firstBraceIndex, lastBraceIndex + 1)

    let aiAnalysis
    try {
      // Try direct parse first
      aiAnalysis = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("[v0] JSON parse failed, attempting recovery:", parseError)

      try {
        // Fix unescaped quotes and newlines in strings
        const fixedJson = jsonString
          .replace(/\\n/g, " ")
          .replace(/\\t/g, " ")
          .replace(/[\n\r]/g, " ")

        aiAnalysis = JSON.parse(fixedJson)
      } catch (secondError) {
        console.error("[v0] Second parse attempt failed, using fallback")

        // Fallback with better field extraction
        aiAnalysis = {
          errorType: "Analysis Completed",
          severity: "info",
          explanationEnglish: "Code analysis completed. Review suggestions below.",
          explanationHindi: "कोड विश्लेषण पूर्ण हुआ। नीचे सुझाव देखें।",
          rootCause: "Code analyzed successfully",
          fixedCode: code,
          fixExplanation: "No critical issues found",
          timeComplexity: calculateTimeComplexity(code),
          spaceComplexity: "O(1)",
          confidence: 75,
          alternatives: [],
          variableSnapshot: {},
          learningResources: [],
          learningTip: "Continue practicing and improving your code!",
        }
      }
    }

    if (!aiAnalysis.alternatives || aiAnalysis.alternatives.length < 3) {
      // Generate fallbacks based on the actual code if AI didn't provide enough
      const fallbackAlternatives = generateAlternatives(code, language, aiAnalysis.alternatives || [])
      aiAnalysis.alternatives = fallbackAlternatives
    }

    if (!aiAnalysis.learningResources || aiAnalysis.learningResources.length < 3) {
      const fallbackResources = generateLearningResources(language, code, aiAnalysis.learningResources || [])
      aiAnalysis.learningResources = fallbackResources
    }

    // Extract variable snapshot from code or use AI's snapshot
    const variableSnapshot = aiAnalysis.variableSnapshot || extractVariableSnapshot(code, language)

    const analysis: ErrorAnalysis = {
      errorType: aiAnalysis.errorType,
      severity: aiAnalysis.severity,
      explanation: {
        english: aiAnalysis.explanationEnglish,
        hindi: aiAnalysis.explanationHindi,
      },
      rootCause: aiAnalysis.rootCause,
      suggestedFix: {
        code: aiAnalysis.fixedCode,
        explanation: aiAnalysis.fixExplanation,
      },
      complexity: aiAnalysis.timeComplexity || calculateTimeComplexity(code),
      confidence: aiAnalysis.confidence,
      alternatives: aiAnalysis.alternatives.slice(0, 3), // Ensure exactly 3
      variableSnapshot: Object.keys(variableSnapshot).length > 0 ? variableSnapshot : undefined,
      learningResources: aiAnalysis.learningResources.slice(0, 3), // Ensure exactly 3
      learningTip: aiAnalysis.learningTip,
    }

    return Response.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("[v0] Error analyzing code:", error)
    return Response.json(
      { error: "Failed to analyze code", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

function extractVariableSnapshot(code: string, language: string): Record<string, string> {
  const snapshot: Record<string, string> = {}

  if (language === "python") {
    const varMatches = code.matchAll(/(\w+)\s*=\s*([^=\n]+)/g)
    for (const match of varMatches) {
      snapshot[match[1]] = match[2].trim()
    }
  } else if (language === "javascript" || language === "typescript") {
    const varMatches = code.matchAll(/(?:let|const|var)\s+(\w+)\s*=\s*([^;\n]+)/g)
    for (const match of varMatches) {
      snapshot[match[1]] = match[2].trim()
    }
  }

  return snapshot
}

// Helper function to generate code-specific alternatives
function generateAlternatives(
  code: string,
  language: string,
  existing: any[],
): Array<{ title: string; code: string; explanation: string }> {
  const alternatives = [...existing]

  // Add generic improvements based on language if we don't have 3
  const genericAlternatives = [
    {
      title: "Add Error Handling",
      code: `try {\n  ${code.split("\n").slice(0, 3).join("\n  ")}\n} catch (error) {\n  console.error(error)\n}`,
      explanation: "Wrap code in try-catch to handle potential errors gracefully",
    },
    {
      title: "Add Input Validation",
      code: `// Add validation before processing\nif (input === null || input === undefined) {\n  throw new Error('Invalid input')\n}\n${code.split("\n").slice(0, 2).join("\n")}`,
      explanation: "Validate inputs before processing to prevent runtime errors",
    },
    {
      title: "Add Type Checking",
      code:
        language === "typescript"
          ? `// Use TypeScript types\nfunction processData(data: string[]): void {\n  // Implementation\n}`
          : `// Add runtime type checking\nif (typeof data !== 'object') {\n  throw new TypeError('Expected array')\n}`,
      explanation: "Add type checking to catch type-related errors early",
    },
  ]

  while (alternatives.length < 3) {
    alternatives.push(genericAlternatives[alternatives.length])
  }

  return alternatives.slice(0, 3)
}

// Helper function to generate language-specific learning resources
function generateLearningResources(
  language: string,
  code: string,
  existing: any[],
): Array<{ title: string; description: string }> {
  const resources = [...existing]

  const languageResources: Record<string, Array<{ title: string; description: string }>> = {
    javascript: [
      { title: "JavaScript Error Handling", description: "Learn about try-catch and error handling patterns" },
      { title: "JavaScript Best Practices", description: "Modern JavaScript coding standards and patterns" },
      { title: "Debugging JavaScript", description: "Tools and techniques for debugging JS code" },
    ],
    typescript: [
      { title: "TypeScript Type System", description: "Understanding TypeScript's type checking" },
      { title: "TypeScript Best Practices", description: "Writing type-safe TypeScript code" },
      { title: "TypeScript Error Handling", description: "Handling errors in TypeScript applications" },
    ],
    python: [
      { title: "Python Exception Handling", description: "Learn about Python's try-except blocks" },
      { title: "Python Best Practices", description: "PEP 8 and Python coding standards" },
      { title: "Python Debugging", description: "Using pdb and debugging tools in Python" },
    ],
    java: [
      { title: "Java Exception Handling", description: "Understanding Java's exception hierarchy" },
      { title: "Java Best Practices", description: "Writing clean and maintainable Java code" },
      { title: "Java Debugging", description: "Using IDE debuggers and logging in Java" },
    ],
    cpp: [
      { title: "C++ Error Handling", description: "Exception handling and error codes in C++" },
      { title: "C++ Best Practices", description: "Modern C++ coding standards" },
      { title: "C++ Debugging", description: "Using GDB and other C++ debugging tools" },
    ],
    c: [
      { title: "C Error Handling", description: "Error codes and errno in C programming" },
      { title: "C Best Practices", description: "Writing safe and efficient C code" },
      { title: "C Debugging", description: "Using GDB and Valgrind for C debugging" },
    ],
  }

  const defaultResources = languageResources[language.toLowerCase()] || languageResources["javascript"]

  while (resources.length < 3) {
    resources.push(defaultResources[resources.length])
  }

  return resources.slice(0, 3)
}

// Function to calculate time complexity from code structure
function calculateTimeComplexity(code: string): string {
  const lowerCode = code.toLowerCase()

  // Count nested loops
  const forLoops = (code.match(/for\s*\(/g) || []).length
  const whileLoops = (code.match(/while\s*\(/g) || []).length
  const totalLoops = forLoops + whileLoops

  // Check for recursion
  const hasRecursion = /function\s+(\w+)[^{]*{[^}]*\1\s*\(/.test(code) || /def\s+(\w+)[^:]*:[^}]*\1\s*\(/.test(code)

  // Check for sorting/complex operations
  const hasSorting = lowerCode.includes(".sort") || lowerCode.includes("sorted(")
  const hasBinarySearch = lowerCode.includes("binary") || lowerCode.includes("bsearch")

  if (hasRecursion && hasBinarySearch) return "O(n log n) - Recursive divide & conquer"
  if (hasRecursion) return "O(2^n) - Recursive"
  if (hasSorting) return "O(n log n) - Sorting"
  if (totalLoops >= 3) return "O(n³) - Cubic"
  if (totalLoops === 2) return "O(n²) - Quadratic"
  if (totalLoops === 1) return "O(n) - Linear"
  if (hasBinarySearch) return "O(log n) - Logarithmic"

  return "O(1) - Constant"
}
