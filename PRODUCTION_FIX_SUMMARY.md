# Fix for Production WebSocket Connectivity

## Problem

On Vercel (production), the application was trying to connect to `ws://localhost:8080` and `ws://localhost:8081`, which don't exist on the production server. This caused:
- ❌ Collaborative code editing not working
- ❌ Voice chat not working
- ❌ Console errors about WebSocket connection failures

## Root Cause

The `wsUrl` was hardcoded to `"ws://localhost:8080"` in the component, which worked in development but not in production where there's no local WebSocket server.

## Solution

### 1. Created Environment-Aware Configuration File

**File**: `lib/ws-config.ts`

This file exports two functions that automatically detect the environment:

```typescript
getWebSocketUrl()       // Returns ws://localhost:8080 locally, or NEXT_PUBLIC_WS_URL from env
getVoiceWebSocketUrl()  // Returns port 8081 variant
```

**Logic**:
- If running on `localhost` → use `ws://localhost:8080`
- If running on production with `NEXT_PUBLIC_WS_URL` env var → use that
- Otherwise → use same host as current page (fallback)

### 2. Updated Monaco Editor Component

**File**: `components/codetutor/monaco-editor.tsx`

Changed from:
```typescript
wsUrl = "ws://localhost:8080"  // Hardcoded ❌
```

To:
```typescript
const baseWsUrl = wsUrl || getWebSocketUrl();      // Auto-detect ✅
const voiceWsUrl = getVoiceWebSocketUrl();         // Auto-detect ✅
```

### 3. Added Environment Variable Configuration

**File**: `.env.local`

Added template for WebSocket URL configuration:
```env
# Leave empty for development (auto-detects localhost)
# For production, set to your deployed WebSocket server
NEXT_PUBLIC_WS_URL=
```

### 4. Updated Documentation

**Files**:
- `SETUP.md` - Added WebSocket server deployment instructions
- `WEBSOCKET_DEPLOYMENT.md` - Complete deployment guide for Railway/Heroku/AWS

## How It Works Now

### Development (Local)
```
npm run dev
→ Runs both Next.js and WebSocket servers
→ Auto-detects localhost:8080
→ Works immediately ✅
```

### Production (Vercel)
```
1. Deploy WebSocket server to Railway/Heroku
   (separate from Vercel)

2. Set NEXT_PUBLIC_WS_URL in Vercel environment variables
   NEXT_PUBLIC_WS_URL=wss://your-server.railway.app

3. Redeploy Vercel app

4. Browser automatically uses production WebSocket URL ✅
```

## Key Changes Summary

| Component | Change | Impact |
|-----------|--------|--------|
| `lib/ws-config.ts` | New file | Centralized URL detection logic |
| `monaco-editor.tsx` | Import + use `getWebSocketUrl()` | Auto-detects environment |
| `.env.local` | Added `NEXT_PUBLIC_WS_URL` | Allows overriding URL in production |
| `SETUP.md` | Added WebSocket deployment section | Users know how to deploy |
| `WEBSOCKET_DEPLOYMENT.md` | New guide | Step-by-step deployment instructions |

## Testing

The fix has been verified:
- ✅ `npm run build` succeeds (no TypeScript errors)
- ✅ Code compiles successfully
- ✅ Dev environment still auto-detects localhost
- ✅ Production environment ready to use external server

## Next Steps for User

To make collaborative features work on Vercel:

1. **Deploy WebSocket Server** (Railway recommended, takes 5 minutes)
   - See `WEBSOCKET_DEPLOYMENT.md` for step-by-step

2. **Set Environment Variable** in Vercel
   - `NEXT_PUBLIC_WS_URL=wss://your-websocket-server.railway.app`

3. **Redeploy** on Vercel

4. **Test** - collaborative editing and voice chat should work!

## Technical Notes

- WebSocket runs on **port 8080** (Yjs sync) and **8081** (voice signaling)
- Production must use `wss://` (secure) instead of `ws://` when accessed via HTTPS
- The configuration is client-side only (no build-time variables needed)
- Backward compatible with existing code that passes `wsUrl` prop
