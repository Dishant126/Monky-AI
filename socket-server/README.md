# M.O.N.K.Y WebSocket Server

Production-ready WebSocket server for collaborative code editing and voice chat.

## Features

- ✅ Single port deployment (Railway compatible)
- ✅ Path-based WebSocket routing (`/yjs`, `/voice`)
- ✅ Binary message support for Yjs
- ✅ JSON message support for WebRTC signaling
- ✅ Room-based peer management
- ✅ Automatic cleanup on disconnect

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

Server runs on port 8080 by default.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | Server port |

## Endpoints

- `ws://localhost:8080/yjs` - Collaborative editing (Yjs sync)
- `ws://localhost:8080/voice` - Voice chat signaling (WebRTC)

## Deployment to Railway

1. Push this folder to GitHub
2. Create new Railway project
3. Deploy from GitHub repo (select `socket-server` folder)
4. Railway automatically sets `PORT` environment variable
5. Get your Railway URL: `https://your-app.railway.app`
6. Use in frontend: `NEXT_PUBLIC_WS_URL=wss://your-app.railway.app`

## Production URL Format

Frontend automatically appends paths:
- `wss://your-app.railway.app` → connects to `/yjs` and `/voice`

## Testing Locally

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Test connection
wscat -c ws://localhost:8080/yjs
wscat -c ws://localhost:8080/voice
```

## Message Format

### Yjs (`/yjs`)
- Binary messages only
- Automatic relay to all connected clients

### Voice (`/voice`)
- JSON messages only
- Supported types:
  - `join-room` - Join a voice room
  - `peer-announce` - Announce peer ID
  - `existing-peers` - Response with existing peers
  - `offer`, `answer`, `ice-candidate` - WebRTC signaling

## Architecture

```
HTTP Server (single port)
    │
    ├── /yjs → WebSocket Server (binary relay)
    │
    └── /voice → WebSocket Server (JSON signaling)
```
