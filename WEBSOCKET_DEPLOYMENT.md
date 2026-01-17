# WebSocket Server Deployment Guide for M.O.N.K.Y

## Overview

This guide explains how to deploy the WebSocket servers required for real-time collaborative code editing and voice chat features to production environments.

## Architecture

The M.O.N.K.Y application uses a **separate WebSocket server** for collaborative features:

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Clients                         │
│                  (Vercel Deployment)                         │
└────────┬──────────────────────────────────────────────────┬──┘
         │                                                   │
         │ HTTPS (Vercel)                        WebSocket   │
         │                                       (separate   │
         ▼                                        server)    ▼
    ┌─────────────┐                      ┌──────────────────────┐
    │  Next.js    │                      │  WebSocket Server    │
    │  Frontend   │◄─────────────────────│  (Railway/Heroku)    │
    │ (Vercel)    │                      │  Port 8080 & 8081    │
    └─────────────┘                      └──────────────────────┘
         │                                        │
         └────────────────────┬───────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │    MongoDB        │
                    │    (Atlas)        │
                    └───────────────────┘
```

## Local Development

When running locally with `npm run dev`, both servers run automatically:
- **Port 3000**: Next.js frontend
- **Port 8080**: Yjs collaborative editing server
- **Port 8081**: Voice signaling server

## Production Deployment

### Step 1: Deploy WebSocket Server

Choose one of the following platforms:

#### Option A: Railway (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub or email

2. **Deploy WebSocket Server**
   - Click "Create new project" → "Deploy from GitHub"
   - Select your M.O.N.K.Y repository
   - Railway will auto-detect and run your project

3. **Configure Environment**
   - Set the start command: `node websocket-server.js`
   - Or add to your `Procfile`:
     ```
     web: node websocket-server.js
     ```

4. **Get Deployment URL**
   - Copy your Railway domain (e.g., `your-app-pva45.railway.app`)

#### Option B: Heroku

1. **Create Heroku Account**
   - Go to https://www.heroku.com
   - Sign up for free

2. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

3. **Deploy**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

4. **Create Procfile** (if not exists)
   - Create file: `Procfile`
   - Add: `web: node websocket-server.js`

5. **Get Deployment URL**
   - https://your-app-name.herokuapp.com

#### Option C: AWS EC2

1. Launch an Ubuntu EC2 instance
2. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Clone your repo and install dependencies:
   ```bash
   git clone https://github.com/your-username/monky-debug-app.git
   cd monky-debug-app
   npm install
   ```
4. Run WebSocket server:
   ```bash
   nohup node websocket-server.js > websocket.log 2>&1 &
   ```
5. Use your EC2 public IP or domain

### Step 2: Configure Vercel

1. **Open Vercel Project Settings**
   - Go to https://vercel.com/dashboard
   - Select your M.O.N.K.Y project
   - Go to "Settings" → "Environment Variables"

2. **Add WebSocket URL**
   - Variable: `NEXT_PUBLIC_WS_URL`
   - Value: `wss://your-websocket-server.railway.app` (or your chosen platform)
   - **Important**: Use `wss://` (secure) instead of `ws://` for HTTPS domains

3. **Redeploy**
   - Go to "Deployments"
   - Click "..." on the latest deployment
   - Select "Redeploy"

### Step 3: Test Deployment

1. **Open Your App**
   - Navigate to your Vercel URL

2. **Test Collaborative Editing**
   - Generate a room ID
   - Open the same room in two browser tabs
   - Type code in one tab - it should sync to the other

3. **Test Voice Chat**
   - Open the same room in two browser tabs
   - Click the microphone button
   - Speak into your microphone - audio should transmit

4. **Check Browser Console**
   - Open DevTools (F12)
   - Should see: `✅ WebSocket created, connecting to: wss://your-websocket-server...`
   - If error shows `localhost:8081`, the environment variable wasn't set correctly

## Environment Variable Reference

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `wss://your-app.railway.app` |

**For Development**: Leave empty (auto-detects localhost)
**For Production**: Must be set to your WebSocket server URL

## Troubleshooting

### Issue: "WebSocket connection to 'ws://localhost:8081' failed"

**Cause**: Environment variable not set on production
**Fix**: 
1. Check Vercel Environment Variables
2. Ensure `NEXT_PUBLIC_WS_URL` is set
3. Use `wss://` (not `ws://`) for HTTPS domains
4. Redeploy application

### Issue: WebSocket connects but no peers found

**Cause**: WebSocket server not running or port misconfigured
**Fix**:
1. Check WebSocket server status:
   - Railway: Check "Logs" in project dashboard
   - Heroku: `heroku logs --tail`
   - AWS: Check EC2 security groups allow port 8080/8081

### Issue: Can't hear voice on production

**Cause**: Usually WebSocket connection failed silently
**Fix**:
1. Check browser console for WebSocket errors
2. Verify environment variable is set correctly
3. Check WebSocket server is running
4. Try incognito mode (rules out extension interference)

## SSL/TLS Considerations

When using HTTPS (production), WebSocket connections must be secure:
- Use `wss://` (secure WebSocket) instead of `ws://`
- Railway and Heroku provide free HTTPS by default
- Update `NEXT_PUBLIC_WS_URL` to use `wss://`

## Performance Tips

1. **Monitor WebSocket Connections**
   - Check server logs regularly
   - Monitor CPU/memory usage

2. **Optimize for Latency**
   - Choose server region close to users
   - Railway: Select region nearest to your users

3. **Scale WebSocket Server**
   - Railway/Heroku: Upgrade plan for more dyno power
   - AWS: Use larger EC2 instance if needed

## File Reference

| File | Purpose |
|------|---------|
| `websocket-server.js` | Main WebSocket server (runs on port 8080/8081) |
| `lib/ws-config.ts` | Auto-detects environment and provides URLs |
| `.env.local` | Local development environment variables |
| `SETUP.md` | Full setup documentation |

## Next Steps

1. ✅ Deploy WebSocket server to Railway/Heroku
2. ✅ Set `NEXT_PUBLIC_WS_URL` environment variable in Vercel
3. ✅ Redeploy your Next.js app
4. ✅ Test collaborative features
5. ✅ Monitor logs for any issues

## Support

For issues or questions:
- Check browser console (F12)
- Review server logs
- Verify environment variables
- Ensure firewall allows WebSocket connections

