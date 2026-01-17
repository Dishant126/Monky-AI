# Voice Assistant Feature Documentation

## 🎤 Overview
The Voice Assistant feature provides a complete conversational AI experience combining:
- **Speech-to-Text**: Converts user's voice input to text
- **Gemini AI Processing**: Sends text to Google Gemini API for intelligent responses
- **Text-to-Speech**: Converts AI responses back to speech

## ✨ Features

### 1. **Speech-to-Text (STT)**
- Records user's voice using browser's MediaRecorder API
- Converts audio to text using Gemini's multimodal capabilities
- Supports multiple languages: English, Urdu, Hindi, Spanish, French
- Real-time waveform visualization during recording

### 2. **AI Processing**
- Sends transcribed text to Google Gemini 2.0 Flash model
- Receives intelligent, context-aware responses
- Supports quick actions: Explain, Debug, Generate
- Language-aware responses

### 3. **Text-to-Speech (TTS)**
- Automatic playback of responses (can be toggled)
- Manual play/stop controls on each message
- Supports all languages through Web Speech API
- Real-time speaking indicator in header

## 🔧 Implementation Details

### Components

#### `hooks/use-text-to-speech.ts`
Custom React hook for text-to-speech functionality.

**Usage:**
```typescript
const { speak, stop, pause, resume, isSpeaking } = useTextToSpeech({
  language: 'en',
  rate: 1,
  pitch: 1,
  volume: 1
})

// Speak text
speak("Hello world")

// Control playback
stop()
pause()
resume()

// Check if speaking
console.log(isSpeaking)
```

#### `components/voice-assistant/voice-assistant.tsx`
Main Voice Assistant component with:
- Microphone recording with real-time visualization
- Auto-speak toggle button
- Language selection
- Message history
- Quick action buttons

**Key States:**
- `isListening`: Microphone is active
- `isProcessing`: Audio is being processed by Gemini
- `autoSpeak`: Automatically speak responses
- `language`: Selected language
- `messages`: Chat history with audio playback status

#### `components/voice-assistant/chat-message.tsx`
Individual message component with:
- User/Assistant message styling
- Timestamp display
- Play/Stop audio button for assistant messages
- Real-time speaking indicator

### API Route

#### `app/api/voice-process/route.ts`
Handles audio processing:
1. Receives base64-encoded audio
2. Transcribes using Gemini API
3. Generates explanation/response
4. Returns both transcribed text and explanation

## 🚀 How It Works

### Complete Flow

```
User speaks
    ↓
[Speech-to-Text via Gemini]
    ↓
Convert to transcribed text
    ↓
Add to chat history
    ↓
[Send to Gemini API]
    ↓
Get AI response
    ↓
Add to chat history
    ↓
[Auto-speak if enabled]
    ↓
Text-to-Speech conversion
    ↓
Play audio (if autoSpeak=true)
```

### Quick Actions Flow

```
User clicks action (Explain/Debug/Generate)
    ↓
Send predefined prompt to Gemini
    ↓
Get response
    ↓
[Auto-speak if enabled]
    ↓
Add to chat history
```

## 🎯 Usage

### Basic Usage
1. Navigate to `/voice-assistant`
2. Click the microphone button
3. Speak your question
4. Wait for Gemini response
5. Listen to automatic response (if enabled)

### Manual Audio Playback
- Click the "Play" button on any assistant message
- Click "Stop" to stop playback
- Playback respects the selected language

### Toggle Auto-Speak
- Click the Volume icon in header to toggle auto-speak
- Icon shows filled when enabled, crossed when disabled

### Change Language
- Select language from dropdown
- Both speech recognition and generation use selected language

### Quick Actions
- **Explain**: Request code explanation
- **Debug**: Ask why code isn't working
- **Generate**: Request code generation

## 🔐 Environment Variables

Required in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
```

## 📋 Supported Languages

| Code | Language |
|------|----------|
| en   | English  |
| ur   | Urdu     |
| hi   | Hindi    |
| es   | Spanish  |
| fr   | French   |

Language codes are mapped to proper locales:
- `en` → `en-US`
- `ur` → `ur-PK`
- `hi` → `hi-IN`
- `es` → `es-ES`
- `fr` → `fr-FR`

## 🎨 UI Components Used

- **Microphone Recording**: MediaRecorder API + Waveform visualization
- **Status Indicators**: Real-time status with colored dots
- **Toggle Buttons**: Language selector, auto-speak toggle
- **Message Bubbles**: Styled differently for user vs assistant
- **Control Buttons**: Play/Stop audio controls

## ⚙️ Browser Compatibility

**Required APIs:**
- `MediaRecorder API` (for audio recording)
- `Web Speech API` (for text-to-speech)
- `AudioContext API` (for waveform visualization)
- `Fetch API` (for API calls)

**Supported Browsers:**
- Chrome/Chromium 49+
- Firefox 25+
- Safari 14.1+
- Edge 79+

**Note:** Voice features require HTTPS in production (except localhost)

## 🔄 Message Flow

### Message Object
```typescript
interface Message {
  id: string                // Unique identifier
  type: 'user' | 'assistant'  // Message source
  content: string           // Text content
  timestamp: Date           // When message was created
  audioPlayed?: boolean     // Whether audio was played
}
```

## 🎤 Audio Processing Details

### Recording Settings
```typescript
{
  echoCancellation: true,    // Remove echo
  noiseSuppression: true,    // Reduce background noise
  autoGainControl: true      // Normalize volume
}
```

### Audio Format
- Format: WebM audio
- Codec: Opus (default for MediaRecorder)
- Sent as base64-encoded data to API

### Transcription
- Uses Gemini's multimodal vision API
- Maintains original language
- No translation unless requested

## 📊 State Management

States handled:
- **isListening**: Microphone recording active
- **isProcessing**: API request in progress
- **isSpeaking**: TTS playback active
- **autoSpeak**: Auto-speak toggle
- **language**: Selected language
- **messages**: Chat history

## 🚨 Error Handling

### Microphone Access
- Shows alert if permission denied
- Gracefully handles browser restrictions

### API Errors
- Displays error message in chat
- Continues to accept new input
- Logs errors to console

### Speech Synthesis
- Catches synthesis errors
- Continues without disrupting chat
- Falls back gracefully

## 📱 Responsive Design

- Mobile: Full-width chat, optimized controls
- Tablet: Max-width 4xl with proper spacing
- Desktop: Same max-width with full sidebar support

## 🎯 Future Enhancements

Potential improvements:
1. **Voice Selection**: Choose different voices for TTS
2. **Speed Control**: Adjust speech rate
3. **History Persistence**: Save chat history
4. **Recording Playback**: Play back user's own recordings
5. **Advanced Filters**: Real-time voice effects
6. **Transcription Editing**: Edit transcribed text before sending
7. **Context Persistence**: Remember conversation context
8. **Code Highlighting**: Syntax highlight code in responses

## 🐛 Troubleshooting

### Microphone Not Working
1. Check browser permissions
2. Ensure HTTPS (except localhost)
3. Try different browser
4. Check microphone hardware

### No Sound Output
1. Check system volume
2. Enable auto-speak toggle
3. Click Play button on message
4. Check browser audio permissions

### Transcription Incorrect
1. Speak clearly
2. Reduce background noise
3. Adjust microphone position
4. Try different language setting

### Gemini API Errors
1. Verify API key in `.env`
2. Check API quota and billing
3. Ensure network connectivity
4. Check API status page

## 📚 Related Files

- [voice-assistant.tsx](../components/voice-assistant/voice-assistant.tsx)
- [chat-message.tsx](../components/voice-assistant/chat-message.tsx)
- [use-text-to-speech.ts](../hooks/use-text-to-speech.ts)
- [voice-process API](../app/api/voice-process/route.ts)
- [waveform-visualization.tsx](../components/voice-assistant/waveform-visualization.tsx)
