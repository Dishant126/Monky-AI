/**
 * Keywords that indicate the user wants a video explanation
 */
const VIDEO_KEYWORDS = [
  "video",
  "youtube",
  "show me",
  "tutorial",
  "watch",
  "didn't understand",
  "didnt understand",
  "don't understand",
  "dont understand",
  "confused",
  "explain better",
  "visual",
  "demonstration",
  "समझ नहीं आया", // Hindi: didn't understand
  "वीडियो", // Hindi: video
  "यूट्यूब", // Hindi: YouTube
]

/**
 * Common LeetCode problem patterns to extract
 */
const PROBLEM_PATTERNS = [
  /leetcode\s+(\d+)/i, // "leetcode 123"
  /problem\s+(\d+)/i, // "problem 123"
  /question\s+(\d+)/i, // "question 123"
  /(\w+\s+\w+)\s+problem/i, // "two sum problem"
  /"([^"]+)"/i, // Anything in quotes
  /['']([^'']+)['']/i, // Anything in single quotes
]

/**
 * Checks if a message contains video/YouTube request keywords
 */
export function isVideoRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return VIDEO_KEYWORDS.some((keyword) => lowerMessage.includes(keyword.toLowerCase()))
}

/**
 * Extracts problem name or number from the message or context
 */
export function extractProblemName(message: string, context?: { code?: string; errorType?: string }): string | null {
  // Try to extract from message first
  for (const pattern of PROBLEM_PATTERNS) {
    const match = message.match(pattern)
    if (match) {
      return match[1] || match[0]
    }
  }

  // If no pattern found, check if message contains words that could be a problem name
  const words = message.split(/\s+/)
  if (words.length >= 2 && words.length <= 5) {
    // Likely a problem name like "two sum" or "reverse linked list"
    const problemCandidate = words
      .filter((word) => word.length > 2 && !VIDEO_KEYWORDS.includes(word.toLowerCase()))
      .join(" ")
    if (problemCandidate.length > 5) {
      return problemCandidate
    }
  }

  // Fallback to context if available
  if (context?.errorType) {
    return context.errorType
  }

  return null
}

/**
 * Opens YouTube search for a LeetCode problem
 */
export function openYouTubeSearch(problemName: string) {
  const searchQuery = `LeetCode ${problemName} solution`
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`

  // Open in new tab
  window.open(youtubeSearchUrl, "_blank", "noopener,noreferrer")
}

/**
 * Main function to handle video requests
 * Returns true if a YouTube search was triggered
 */
export function handleVideoRequest(
  message: string,
  context?: { code?: string; errorType?: string },
): { triggered: boolean; problemName?: string } {
  if (!isVideoRequest(message)) {
    return { triggered: false }
  }

  const problemName = extractProblemName(message, context)

  if (problemName) {
    openYouTubeSearch(problemName)
    return { triggered: true, problemName }
  }

  // If we detected a video request but couldn't extract problem name,
  // open a general search
  openYouTubeSearch("programming tutorial")
  return { triggered: true, problemName: "programming tutorial" }
}
