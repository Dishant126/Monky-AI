@echo off
echo Starting WebSocket server and Next.js dev server...
start /B node websocket-server.js
npm run next-dev
