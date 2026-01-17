# Collaboration & Voice Features Guide

## What Was Fixed

### 1. **Real-time Code Synchronization**
- ✅ WebSocket server now runs automatically alongside Next.js
- ✅ Code changes sync instantly between multiple browser tabs/windows
- ✅ Improved binary message handling for Yjs protocol

### 2. **Voice Communication**
- ✅ Fixed peer connection initialization logic
- ✅ Added proper error handling for microphone access
- ✅ Improved audio stream handling with autoplay
- ✅ Better connection state management

## How to Test

### Testing Code Synchronization

1. **Start the development server** (already running):
   ```bash
   npm run dev
   ```
   This now starts both the WebSocket server (port 8080) and Next.js (port 3000)

2. **Open the Code Editor** in your first browser:
   ```
   http://localhost:3000/code-editor
   ```

3. **Create a collaboration room**:
   - Click the "Collaborate" or "Users" button
   - Click "Create Room" - this generates a unique room ID
   - You'll be redirected to a URL like: `http://localhost:3000/code-editor?room=xg8l5rznx2`

4. **Open the same room** in a second browser/tab:
   - Copy the full URL with the `?room=...` parameter
   - Open it in another browser window or incognito mode
   - Or open it on another device on the same network using your local IP

5. **Test synchronization**:
   - Start typing code in one browser
   - You should see the changes appear **instantly** in the other browser
   - Both cursors should be visible (different colors)
   - Try editing from both sides simultaneously

### Testing Voice Communication

1. **Both browsers must be in the same room** (same room ID in URL)

2. **In the FIRST browser**:
   - Click the green **"Start Voice"** button
   - Allow microphone access when prompted
   - The button should change to "Voice Connected"

3. **In the SECOND browser**:
   - The voice connection should establish automatically
   - You should see "Voice Connected" status
   - Try speaking - you should hear audio in both browsers

4. **Test mute/unmute**:
   - Click the "Mute" button to disable your microphone
   - Click "Unmute" to enable it again

## Troubleshooting

### Code Not Syncing?

1. **Check WebSocket connection**:
   - Open Browser DevTools (F12)
   - Go to Console tab
   - Look for: "Client joined room" message
   - Should see: `ws://localhost:8080` connection

2. **Check for errors**:
   - Look for any red errors in Console
   - Common issue: WebSocket server not running
   - Solution: Restart with `npm run dev`

3. **Verify both browsers are in the same room**:
   - URLs must have identical `?room=...` parameter
   - Case-sensitive!

### Voice Not Working?

1. **Check microphone permissions**:
   - Browser must have microphone access
   - Check browser settings: `chrome://settings/content/microphone`
   - Or look for blocked icon in address bar

2. **Check peer connection**:
   - Open DevTools Console
   - Look for "Peer connection" messages
   - Should see "Voice Connected" status

3. **Try these steps**:
   - Refresh both browsers
   - Click "Start Voice" in the first browser FIRST
   - Wait 2-3 seconds before opening second browser
   - Check volume/mute settings on your computer

4. **Browser compatibility**:
   - Works best in Chrome/Edge (Chromium-based)
   - Firefox may have WebRTC issues
   - Safari requires HTTPS (won't work on localhost)

### Port Already in Use?

If you see `EADDRINUSE: address already in use :::8080`:

```bash
# Windows - Kill all Node processes
taskkill //F //IM node.exe

# Then restart
npm run dev
```

## Architecture Overview

```
Browser 1 ←→ WebSocket Server (port 8080) ←→ Browser 2
              ↓                              ↓
         Code Sync (Yjs)              Code Sync (Yjs)
         Voice (WebRTC)               Voice (WebRTC)
```

### Components:

- **Yjs**: CRDT library for conflict-free code synchronization
- **y-websocket**: WebSocket provider for Yjs
- **simple-peer**: WebRTC wrapper for peer-to-peer voice
- **Monaco Editor**: Code editor with collaborative binding

## Key Files Modified

1. [package.json](package.json) - Updated dev script
2. [start-dev.js](start-dev.js) - New startup script
3. [websocket-server.js](websocket-server.js) - Enhanced WebSocket server
4. [components/codetutor/monaco-editor.tsx](components/codetutor/monaco-editor.tsx) - Fixed voice & sync logic

## Security Notes

⚠️ **Important for Production**:
- This setup uses unencrypted WebSocket (ws://)
- For production, use WSS (WebSocket Secure)
- Implement authentication for room access
- Add rate limiting to prevent abuse
- Use TURN servers for voice in production (NAT traversal)

## Next Steps

To deploy this to production:
1. Set up WSS with SSL certificates
2. Use environment variables for WebSocket URL
3. Deploy WebSocket server separately (e.g., on a VPS)
4. Add user authentication to rooms
5. Implement room cleanup/expiry logic
6. Add STUN/TURN servers for better voice connectivity

## Need Help?

If issues persist:
1. Check the terminal for server logs
2. Check browser console for client errors
3. Verify both servers are running (WebSocket + Next.js)
4. Try clearing browser cache and restarting
