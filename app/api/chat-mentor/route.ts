import { generateText } from "ai"
import type { ChatMessage, ChatSessionContext } from "@/lib/types/chat-mentor"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, context, language, videoRequest } = body as {
      messages: ChatMessage[]
      context: ChatSessionContext
      language: "english" | "hindi"
      videoRequest?: boolean
    }

    if (!messages || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const conversationHistory = messages.map((m) => `${m.role === "user" ? "User" : "Mentor"}: ${m.content}`).join("\n")

    const videoContext = videoRequest
      ? "\n\nNote: The user has requested a video tutorial. A YouTube search has been opened automatically. Acknowledge this and offer to explain the concept in text as well."
      : ""

    const mentorResponse = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are CodeTutor, an experienced and patient coding mentor helping beginners understand programming concepts. 
      
Your role:
- Explain concepts in simple, conversational language
- Use analogies and real-world examples
- Ask guiding questions rather than just giving answers
- Encourage learning and curiosity
- Be supportive and non-judgmental
- Provide code examples when helpful
- Respond in ${language === "hindi" ? "Hindi" : "English"}${videoContext}

Current Code Context:
Language: ${context.language}
Error Type: ${context.errorType || "General question"}
${context.errorMessage ? `Error Message: ${context.errorMessage}` : ""}

Keep responses concise (2-3 sentences) unless asked for more detail.`,

      prompt: `Conversation History:
${conversationHistory}

User's latest question: ${lastMessage.content}

Provide a helpful, encouraging response that guides the user toward understanding. If relevant, offer a brief learning tip.`,
    })

    const responseText = mentorResponse.text

    const suggestions: string[] = []
    if (lastMessage.content.toLowerCase().includes("how") || lastMessage.content.toLowerCase().includes("explain")) {
      suggestions.push(
        language === "hindi" ? "विस्तार से समझाएं" : "Explain in detail",
        language === "hindi" ? "कोड उदाहरण दें" : "Show a code example",
        language === "hindi" ? "इसे कैसे सुधारूं?" : "How do I fix this?",
      )
    }

    if (!videoRequest && !suggestions.includes(language === "hindi" ? "वीडियो देखें" : "Show me a video")) {
      suggestions.push(language === "hindi" ? "वीडियो देखें" : "Show me a video")
    }

    return Response.json({
      success: true,
      message: responseText,
      suggestions,
    })
  } catch (error) {
    console.error("[v0] Chat mentor error:", error)
    return Response.json(
      {
        error: "Failed to get mentor response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
