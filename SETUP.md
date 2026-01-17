# M.O.N.K.Y Backend Setup Guide

## Prerequisites

1. MongoDB Atlas account (or local MongoDB installation)
2. Auth0 account
3. Judge0 API key (for code execution)

## Setup Instructions

### 1. MongoDB Setup

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Click "Connect" and choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Add the connection string to your `.env.local` file

### 2. Auth0 Setup

1. Create a free Auth0 account at https://auth0.com
2. Create a new Application (Single Page Application)
3. Note your Domain, Client ID, and Client Secret
4. Set Allowed Callback URLs to: `http://localhost:3000/callback, https://your-domain.vercel.app/callback`
5. Set Allowed Logout URLs to: `http://localhost:3000, https://your-domain.vercel.app`
6. Set Allowed Web Origins to: `http://localhost:3000, https://your-domain.vercel.app`
7. Create an API in Auth0 with an identifier (e.g., `https://monky-api`)
8. Add all Auth0 credentials to your `.env.local` file

### 3. Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

\`\`\`env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/monky-os?retryWrites=true&w=majority

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://monky-api

# Auth0 Public (for frontend)
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://monky-api

# Judge0 (already configured)
RAPIDAPI_KEY=your-rapidapi-key
\`\`\`

### 4. WebSocket Server Setup (for Collaborative Features)

The application supports real-time collaborative code editing and voice chat. These features require a WebSocket server.

#### Development (Local)

WebSocket servers run automatically on `localhost`:
- **Port 8080**: Yjs document sync (collaborative editing)
- **Port 8081**: Voice signaling (peer discovery)

To run locally with WebSocket support:
```bash
npm run dev
```

This runs both the Next.js dev server and WebSocket servers concurrently.

#### Production Deployment

For production (Vercel, etc.), you need to deploy a separate WebSocket server:

**Option 1: Deploy to Railway (Recommended)**

1. Create a Railway account at https://railway.app
2. Create a new project and select "Deploy from GitHub"
3. Create a `Procfile` in your repo:
   ```
   web: node websocket-server.js
   ```
4. Set the following Railway environment variables:
   ```
   PORT=8080
   ```
5. Get your Railway deployment URL (e.g., `your-app.railway.app`)
6. In your Vercel project settings, add:
   ```
   NEXT_PUBLIC_WS_URL=wss://your-app.railway.app
   ```

**Option 2: Deploy to Heroku**

1. Create a Heroku account at https://www.heroku.com
2. Install Heroku CLI: `npm install -g heroku`
3. Login: `heroku login`
4. Create app: `heroku create your-app-name`
5. Deploy:
   ```bash
   git push heroku main
   ```
6. Set PORT: `heroku config:set PORT=8080`
7. Get your Heroku URL and add to Vercel:
   ```
   NEXT_PUBLIC_WS_URL=wss://your-app.herokuapp.com
   ```

**Vercel Environment Setup:**

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add: `NEXT_PUBLIC_WS_URL=wss://your-websocket-server.railway.app` (use your actual server URL)
4. Redeploy

### 5. Vercel Deployment

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the environment variables from your `.env.local` file
4. Add `NEXT_PUBLIC_WS_URL` pointing to your WebSocket server (see WebSocket Server Setup above)
5. Redeploy your application

## Testing

1. Run `npm install` to install dependencies (mongoose and jose are already added)
2. Run `npm run dev` to start the development server with WebSocket support
3. Navigate to http://localhost:3000
4. Try signing up and logging in
5. Test saving code snippets from the Code Editor
6. Test the Debug History feature
7. Test collaborative editing:
   - Open the same room URL in multiple browser windows
   - Type code in one window - it should appear in the other
8. Test voice chat:
   - Open two browser windows in the same room
   - Click the microphone button to start voice call
   - Speak into your microphone - audio should transmit to the other window

## Features Implemented

- ✅ Auth0 authentication integration
- ✅ MongoDB database with Mongoose models
- ✅ Protected API routes
- ✅ User profile management
- ✅ Code snippets workspace
- ✅ Debug history tracking
- ✅ Activity logging
- ✅ Chat repositioned to bottom-right corner
- ✅ Real-time collaborative code editing (Yjs + y-websocket)
- ✅ Voice calling with PeerJS and WebRTC
- ✅ Automatic peer discovery in collaborative sessions

## Notes

- The current implementation uses localStorage for basic auth as a fallback
- Full Auth0 integration requires environment variables to be set
- All API routes are protected and require authentication tokens
- MongoDB models will be created automatically on first connection
- **Collaborative features (editing + voice) require a WebSocket server**
  - Locally: Runs automatically via `npm run dev`
  - Production: Must be deployed separately to Railway/Heroku/AWS and configured via `NEXT_PUBLIC_WS_URL`
