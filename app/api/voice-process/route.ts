import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenerativeAI(apiKey || "");

const languageMap: { [key: string]: string } = {
  en: "English",
  ur: "Urdu",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
};

export async function POST(req: Request) {
  try {
    console.log("[VA-API] POST request received");
    console.log("[VA-API] API Key present:", !!process.env.GEMINI_API_KEY);

    // Validate request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { directText } = body;
    console.log("[VA-API] Text provided:", !!directText);

    // Validate transcript
    if (!directText || directText.trim().length === 0) {
      console.log("[VA-API] Empty transcript provided");
      return Response.json(
        { error: "No valid text provided" },
        { status: 400 }
      );
    }

    const transcribedText = directText.trim();
    const language = body.language || "en";
    const languageName = languageMap[language] || "English";

    console.log("[VA-API] Creating Gemini model with gemini-2.5-flash...");
    // Using gemini-2.5-flash model (as requested)
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate response from Gemini
    console.log("[VA-API] Sending request to Gemini for:", transcribedText);
    const response = await model.generateContent([
      {
        text: `The user asked in ${languageName}: "${transcribedText}"

Please provide a clear, simple explanation in ${languageName} language. 
Rules:
- Keep it easy to understand and beginner-friendly
- Be concise but complete
- If they asked to explain code, debug, or generate code - provide practical help
- Use simple words, avoid complex jargon
- Format your response in a friendly, conversational way
- Write ONLY in ${languageName}, no English mixing`,
      },
    ]);

    const explanation = response.response.text();
    console.log("[VA-API] Response generated successfully, length:", explanation.length);

    return Response.json({
      success: true,
      transcribed: transcribedText,
      explanation: explanation,
    });
  } catch (error) {
    console.error("[VA-API] Error occurred:", error);

    // Parse error message
    const errorStr = error instanceof Error ? error.message : String(error);
    let statusCode = 500;
    let userMessage = "Failed to process your request. Please try again.";

    // Handle specific error types
    if (errorStr.includes("429") || errorStr.includes("quota")) {
      statusCode = 429;
      userMessage =
        "API quota exceeded. Please wait a moment and try again.";
      console.error("[VA-API] QUOTA ERROR - 429");
    } else if (
      errorStr.includes("404") ||
      errorStr.includes("not found") ||
      errorStr.includes("not supported")
    ) {
      statusCode = 404;
      userMessage = "Model not available. Please refresh and try again.";
      console.error("[VA-API] MODEL ERROR - 404");
    } else if (errorStr.includes("authentication") || errorStr.includes("API key")) {
      statusCode = 401;
      userMessage = "API key error. Please contact support.";
      console.error("[VA-API] AUTH ERROR - 401");
    } else if (errorStr.includes("network") || errorStr.includes("fetch")) {
      statusCode = 503;
      userMessage = "Network error. Please check your connection.";
      console.error("[VA-API] NETWORK ERROR - 503");
    }

    console.error("[VA-API] Error details:", errorStr);

    return Response.json(
      {
        error: userMessage,
        details: errorStr,
        status: statusCode,
      },
      { status: statusCode }
    );
  }
}
