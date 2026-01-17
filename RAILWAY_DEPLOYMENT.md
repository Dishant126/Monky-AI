# Deploying M.O.N.K.Y WebSocket Server to Railway

## Quick Deploy (5 minutes)

### Step 1: Prepare Your Repository

Make sure the `socket-server` folder is in your GitHub repository:

```
your-repo/
├── socket-server/
│   ├── index.js
│   ├── package.json
│   ├── Procfile
│   └── README.md
└── (rest of your Next.js app)
```

### Step 2: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select your repository**
5. Railway will auto-detect Node.js and deploy

### Step 3: Configure (if needed)

Railway automatically:
- ✅ Sets `PORT` environment variable
- ✅ Runs `npm install`
- ✅ Executes `npm start`
- ✅ Provides HTTPS (wss://) URL

**Your deployment URL**: `https://your-app-production-xxxx.railway.app`

### Step 4: Configure Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add new variable:
   ```
   Name: NEXT_PUBLIC_WS_URL
   Value: wss://your-app-production-xxxx.railway.app
   ```
   
   ⚠️ **Important**: 
   - Use `wss://` (not `ws://`) for production
   - Don't add `/yjs` or `/voice` - they're added automatically

3. **Redeploy** your Vercel app:
   - Go to "Deployments"
   - Click "..." → "Redeploy"

### Step 5: Test

1. Open your Vercel app: `https://your-app.vercel.app`
2. Generate a room code
3. Open DevTools (F12) → Console
4. Should see:
   ```
   ✅ [Yjs] Client connected
   ✅ [Voice] Client connected
   ```

## Advanced Configuration

### Custom Domain on Railway

1. Railway Settings → **Networking** → **Custom Domain**
2. Add your domain (e.g., `ws.yourdomain.com`)
3. Update Vercel environment variable:
   ```
   NEXT_PUBLIC_WS_URL=wss://ws.yourdomain.com
   ```

### Environment Variables

Railway automatically sets:
- `PORT` - Don't override this!

Optional variables you can add:
- `NODE_ENV=production` (optional, Railway sets this)

### Monitoring

Check logs in Railway dashboard:
- **Deployments** tab → Click latest deployment
- **View Logs** to see:
  ```
  🚀 M.O.N.K.Y WebSocket Server running on port XXXX
  📡 Yjs endpoint: ws://localhost:XXXX/yjs
  🎤 Voice endpoint: ws://localhost:XXXX/voice
  ```

## Troubleshooting

### Issue: "Failed to connect to WebSocket"

**Check 1**: Verify Railway deployment is running
- Go to Railway dashboard
- Check deployment status is "Active"

**Check 2**: Verify Vercel environment variable
- Should be: `wss://your-railway-url` (not `ws://`)
- Should NOT include `/yjs` or `/voice` paths

**Check 3**: Check Railway logs
- Look for "WebSocket Server running"
- Look for connection attempts

### Issue: "Connection established but no sync"

**Check**: Browser console for errors
- Press F12 → Console tab
- Look for WebSocket errors or room mismatches

### Issue: "Works locally but not in production"

**Check**: Environment variable in Vercel
1. Vercel Dashboard → Settings → Environment Variables
2. Ensure `NEXT_PUBLIC_WS_URL` is set
3. Click "Redeploy" after adding (critical!)

## Cost

Railway Free Tier includes:
- ✅ 500 hours/month runtime
- ✅ $5 usage credit
- ✅ HTTPS/WSS included
- ✅ Automatic deployments

This is sufficient for:
- Development and testing
- Small production deployments (< 100 concurrent users)

## Alternative: Heroku

If you prefer Heroku:

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-ws-server

# Deploy
cd socket-server
git init
git add .
git commit -m "WebSocket server"
heroku git:remote -a your-ws-server
git push heroku main

# Your URL: wss://your-ws-server.herokuapp.com
```

Then update Vercel:
```
NEXT_PUBLIC_WS_URL=wss://your-ws-server.herokuapp.com
```

## Testing the Deployment

### Test WebSocket Connection

Using browser console:
```javascript
const ws = new WebSocket('wss://your-app.railway.app/yjs');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
```

### Test Voice Signaling

```javascript
const ws = new WebSocket('wss://your-app.railway.app/voice');
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'join-room', roomId: 'test' }));
};
ws.onmessage = (e) => console.log('Message:', e.data);
```

## Architecture Diagram

```
┌─────────────────┐
│   Browser       │
│  (Vercel App)   │
└────────┬────────┘
         │
         │ HTTPS/WSS
         │
         ▼
┌─────────────────────┐
│  Railway            │
│  Node.js Server     │
│  (Single Port)      │
│                     │
│  /yjs  → Yjs Sync  │
│  /voice → WebRTC   │
└─────────────────────┘
```

## Next Steps

✅ Deploy socket-server to Railway  
✅ Get Railway deployment URL  
✅ Add `NEXT_PUBLIC_WS_URL` to Vercel  
✅ Redeploy Vercel app  
✅ Test collaborative features  
✅ Monitor Railway logs  

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check browser console (F12) for WebSocket errors
- Check Railway logs for server errors
