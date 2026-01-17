/**
 * WebSocket configuration for collaborative features
 * Automatically detects environment and provides appropriate URLs
 */

export function getWebSocketUrl(): string {
  // If we're in a browser environment
  if (typeof window !== "undefined") {
    // Check if we're on localhost (development)
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "ws://localhost:8080/yjs";
    }

    // Production environment - use environment variable
    const productionUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (productionUrl) {
      // Ensure it has the /yjs path
      return productionUrl.endsWith("/yjs") ? productionUrl : `${productionUrl}/yjs`;
    }

    // Fallback: use same host as current page (for self-hosted or similar)
    // Convert https:// to wss:// and http:// to ws://
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/yjs`;
  }

  // Server-side fallback
  return "ws://localhost:8080/yjs";
}

export function getVoiceWebSocketUrl(): string {
  // If we're in a browser environment
  if (typeof window !== "undefined") {
    // Check if we're on localhost (development)
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "ws://localhost:8080/voice";
    }

    // Production environment - use environment variable
    const productionUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (productionUrl) {
      // Replace /yjs with /voice or append /voice
      return productionUrl.replace("/yjs", "/voice").endsWith("/voice") 
        ? productionUrl.replace("/yjs", "/voice")
        : `${productionUrl}/voice`;
    }

    // Fallback: use same host as current page
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/voice`;
  }

  // Server-side fallback
  return "ws://localhost:8080/voice";
}
