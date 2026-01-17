# 🎤 Voice Assistant - Quick Start Guide

## Installation & Setup

### 1. Ensure Dependencies
All required packages are already in `package.json`:
```json
{
  "dependencies": {
    "@google/generative-ai": "latest",
    "lucide-react": "^0.454.0",
    "react": "18.2.0",
    ...
  }
}
```

### 2. Environment Variables
Add to `.env`:
```
GEMINI_API_KEY=your_gemini_api_key
```
✅ Already configured in your `.env`

### 3. Start Dev Server
```bash
npm run dev
# or
npm run next-dev
# or use the batch file
./start-dev.bat
```

## 🚀 First Time Usage

### 1. Navigate to Voice Assistant
```
http://localhost:3000/voice-assistant
```

### 2. Allow Microphone Permission
Browser will ask for microphone access. Click **"Allow"**.

### 3. Try These Actions:

#### Action 1: Simple Voice Test
1. Click the **blue microphone button**
2. Say: "Hello, how are you?"
3. Click microphone again to stop
4. Wait for response
5. Hear the AI's response

#### Action 2: Code Explanation
1. Say: "Explain the map function"
2. See transcription appear
3. See AI explanation
4. Hear response (if auto-speak on)

#### Action 3: Quick Action Button
1. Click **"Explain"** button
2. System sends: "Can you explain this code?"
3. See AI response
4. Hear explanation

#### Action 4: Manual Audio Playback
1. Look for message with **"Play"** button
2. Click "Play"
3. Hear message read aloud
4. Click "Stop" to stop

#### Action 5: Switch Language
1. Click language dropdown (default: "English")
2. Select "Urdu"
3. Say something in Urdu
4. Transcription and response in Urdu
5. Audio speaks in Urdu

## 🎯 Key Controls

### Header Controls (Top Right)
| Control | Function | How to Use |
|---------|----------|-----------|
| 🌐 Language | Change language | Click dropdown: English/Urdu/Hindi/Spanish/French |
| 🔊 Volume | Toggle auto-play | Click to enable/disable auto-speak |
| 🟢 Status | Shows state | Listening/Processing/Speaking/Ready |

### Microphone Button (Center)
| Color | Meaning | Action |
|-------|---------|--------|
| 🔵 Blue | Ready | Click to start recording |
| 🔴 Red | Recording | Speak your question |
| 🟡 Yellow | Processing | Wait for AI response |

### Message Controls
- **Play Button**: Click to hear message read aloud
- **Stop Button**: Click (when red) to stop playback

## 💡 Pro Tips

### Tip 1: Speak Clearly
- Speak at normal volume
- Minimize background noise
- Pause between sentences

### Tip 2: Enable Auto-Speak
- Click volume icon to enable
- Responses play automatically
- Better for learning

### Tip 3: Use Quick Actions
- Click "Explain" for code explanation
- Click "Debug" for error help
- Click "Generate" for code generation

### Tip 4: Try Different Languages
- Each language has native speech recognition
- Responses are in selected language
- Perfect for multi-lingual learning

### Tip 5: Manual Replay
- Miss something? Click "Play" on message
- Re-listen as many times as needed
- No re-processing required

## 🔧 Troubleshooting

### Problem: No sound output
**Solution:**
1. Check system volume
2. Click Volume icon to enable auto-speak
3. Click "Play" button on message
4. Check browser audio settings

### Problem: Microphone not working
**Solution:**
1. Check browser permissions (click lock icon)
2. Allow microphone access
3. Check microphone hardware
4. Try different browser

### Problem: Bad transcription
**Solution:**
1. Speak clearly and slowly
2. Reduce background noise
3. Get closer to microphone
4. Try different language setting

### Problem: No response from Gemini
**Solution:**
1. Check internet connection
2. Verify API key in `.env`
3. Check Gemini API quota
4. Restart dev server

### Problem: Page not loading
**Solution:**
1. Ensure dev server is running
2. Check console for errors
3. Clear browser cache
4. Try `http://localhost:3000/voice-assistant`

## 📊 Supported Languages

| Language | Code | Locale | Usage |
|----------|------|--------|-------|
| English | en | en-US | Default |
| Urdu | ur | ur-PK | Pakistan, Urdu speakers |
| Hindi | hi | hi-IN | India, Hindi speakers |
| Spanish | es | es-ES | Spain, Spanish speakers |
| French | fr | fr-FR | France, French speakers |

## 🎓 Learning Examples

### Example 1: Learn JavaScript Array Methods
```
Say: "Explain array.map"
     ↓
Transcribed: "Explain array.map"
     ↓
AI Response: [Detailed explanation with examples]
     ↓
Hear: [Spoken explanation]
```

### Example 2: Debug React Component
```
Say: "My component is not rendering"
     ↓
Transcribed: "My component is not rendering"
     ↓
AI Response: [Debugging suggestions]
     ↓
Hear: [Solutions read aloud]
```

### Example 3: Generate Code
```
Click: "Generate" button
       ↓
System: "Generate a React component for me"
       ↓
AI Response: [Complete component code]
       ↓
Hear: [Code explanation]
```

## 🔄 Complete Conversation Flow

```
┌─────────────────────────────────────────┐
│      Open Voice Assistant Page          │
│      http://localhost:3000/voice-...    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Select Language (if not English)    │
│     Click dropdown → Choose language    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Click Microphone Button              │
│     (Turn red, starts recording)        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Speak Your Question/Request         │
│     (See waveform visualization)        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Click Microphone Again to Stop      │
│     (Turn yellow, processing)           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     See Transcription in Chat           │
│     (Your voice as text)                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Receive AI Response in Chat         │
│     (Gemini's answer)                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Hear Response (if auto-speak on)    │
│     Or click Play button manually       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Continue Conversation                │
│     Go back to Step 3 for more questions│
└─────────────────────────────────────────┘
```

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Page loads at `/voice-assistant`
- [ ] Header shows language selector
- [ ] Microphone button is visible and clickable
- [ ] Permission dialog appears when clicking mic
- [ ] Recording starts (button turns red)
- [ ] Audio waveform visualizes voice
- [ ] Stop button works (turns yellow)
- [ ] Transcription appears in chat
- [ ] AI response appears in chat
- [ ] Audio plays (if auto-speak enabled)
- [ ] Manual play button works
- [ ] Language switching works
- [ ] Status indicator updates

## 📞 Support Resources

### Documentation Files
- **[VOICE_ASSISTANT_GUIDE.md](./VOICE_ASSISTANT_GUIDE.md)** - Complete feature documentation
- **[VOICE_ASSISTANT_SHOWCASE.md](./VOICE_ASSISTANT_SHOWCASE.md)** - Feature showcase with examples
- **[VOICE_ASSISTANT_IMPLEMENTATION.md](./VOICE_ASSISTANT_IMPLEMENTATION.md)** - Implementation details

### API Documentation
- **[app/api/voice-process/route.ts](./app/api/voice-process/route.ts)** - API endpoint

### Component Files
- **[components/voice-assistant/voice-assistant.tsx](./components/voice-assistant/voice-assistant.tsx)** - Main component
- **[components/voice-assistant/chat-message.tsx](./components/voice-assistant/chat-message.tsx)** - Message display
- **[hooks/use-text-to-speech.ts](./hooks/use-text-to-speech.ts)** - TTS hook

## 🎉 You're Ready!

Your Voice Assistant is fully set up and ready to use. 

**Next Step**: Open `http://localhost:3000/voice-assistant` and start speaking! 🎤

---

**Have Questions?** Check the complete guide: [VOICE_ASSISTANT_GUIDE.md](./VOICE_ASSISTANT_GUIDE.md)
