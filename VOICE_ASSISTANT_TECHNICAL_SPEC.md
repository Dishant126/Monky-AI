# Voice Assistant - Technical Specification

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Voice Assistant App                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         voice-assistant.tsx (Main Component)     │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ • State Management (listening, processing, etc) │  │
│  │ • Message Management                            │  │
│  │ • Language Selection                            │  │
│  │ • Auto-speak Toggle                             │  │
│  │ • Microphone Recording                          │  │
│  │ • Message Display                               │  │
│  └──────────────────────────────────────────────────┘  │
│                  ↓              ↓              ↓        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ChatMessage│ │Waveform  │ │QuickAction              │
│  │Component  │ │Viz       │ │Buttons                  │
│  └──────────┘ └──────────┘ └──────────┘              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │      useTextToSpeech Hook                        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ • Web Speech API Integration                    │  │
│  │ • Language Support                              │  │
│  │ • Speaking State Management                     │  │
│  │ • Play/Pause/Stop Controls                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              ┌─────────────────────────┐               │
│              │  Browser APIs Used      │               │
│              ├─────────────────────────┤               │
│              │ • MediaRecorder API     │               │
│              │ • AudioContext API      │               │
│              │ • Web Speech API        │               │
│              │ • Fetch API             │               │
│              │ • FileReader API        │               │
│              └─────────────────────────┘               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Backend Integration                       │
│              ↓                                          │
│         POST /api/voice-process                        │
│              ↓                                          │
│         Google Gemini API                              │
│              ↓                                          │
│         Text Response                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Speech-to-Text-to-Response Flow

```
┌────────────┐
│   Start    │
└─────┬──────┘
      ↓
┌────────────────────────────────┐
│ User Clicks Microphone Button  │
│ isListening = true             │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ Request Microphone Permission  │
│ (if not granted before)        │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ Initialize MediaRecorder       │
│ Start Recording Audio          │
│ Display Waveform Visualization │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ User Speaks Question           │
│ Audio chunks collected         │
│ Real-time visualization        │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ User Stops Recording           │
│ isListening = false            │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ Convert Audio Blob to Base64   │
│ isProcessing = true            │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ POST /api/voice-process        │
│ Send: {audioBase64, language}  │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ Gemini Transcribes Audio       │
│ Returns: transcribedText       │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ Add User Message to Chat       │
│ content: transcribedText       │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ Gemini Generates Response      │
│ Returns: explanation           │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ Add Assistant Message to Chat  │
│ content: explanation           │
│ audioPlayed: false             │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ Check autoSpeak Setting        │
└─────┬──────────────────────────┘
      ├─ YES ─────────────────────┬─ NO
      ↓                           ↓
┌───────────────────┐    ┌──────────────────┐
│ Trigger TTS       │    │ Wait for Manual  │
│ Speak Response    │    │ Play Button      │
└─────┬─────────────┘    └──────────────────┘
      ↓
┌────────────────────────────────┐
│ Web Speech API Plays Audio     │
│ isSpeaking = true              │
│ Status: "Speaking..."          │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ Audio Playback Complete        │
│ isSpeaking = false             │
│ Status: "Ready"                │
└─────┬──────────────────────────┘
      ↓
┌────────────────────────────────┐
│ isProcessing = false           │
│ Ready for Next Input           │
└─────┬──────────────────────────┘
      ↓
┌────────────┐
│    End     │
└────────────┘
```

## Component Specifications

### voice-assistant.tsx

**Purpose**: Main container component for the voice assistant interface

**Props**: None (uses only hooks)

**State**:
```typescript
const [isListening, setIsListening] = useState(false)      // Mic recording state
const [isProcessing, setIsProcessing] = useState(false)    // API processing state
const [language, setLanguage] = useState('en')             // Selected language
const [autoSpeak, setAutoSpeak] = useState(true)           // Auto TTS toggle
const [messages, setMessages] = useState<Message[]>([...]) // Chat history
```

**Hooks**:
- `useState`: State management
- `useEffect`: Side effects
- `useRef`: Refs for DOM elements and persistent values
- `useTextToSpeech`: TTS functionality

**Key Methods**:
```typescript
startListening()        // Request mic permission, start recording
stopListening()         // Stop recording, close audio context
processAudio()          // Send audio to API, handle response
handleQuickAction()     // Handle quick action buttons
handleMicClick()        // Toggle mic on/off
```

**Renders**:
- Header with controls
- Messages section
- Microphone button
- Quick action buttons
- Status indicator

---

### chat-message.tsx

**Purpose**: Individual message display component

**Props**:
```typescript
interface ChatMessageProps {
  message: {
    id: string                    // Unique ID
    type: 'user' | 'assistant'   // Message source
    content: string               // Text content
    timestamp: Date               // Creation time
    audioPlayed?: boolean         // Audio played flag
  }
  language?: string               // Selected language
}
```

**State**:
```typescript
const [hasPlayed, setHasPlayed] = useState(...)  // Track audio playback
```

**Hooks**:
- `useState`: Track playback state
- `useTextToSpeech`: TTS for message content

**Key Methods**:
```typescript
handleSpeak()          // Trigger TTS or stop playback
```

**Features**:
- User vs Assistant styling
- Timestamp display
- Play/Stop button (assistant only)
- Real-time speaking indicator

---

### useTextToSpeech Hook

**Purpose**: Encapsulates Web Speech API functionality

**Parameters**:
```typescript
interface UseTextToSpeechOptions {
  language?: string      // Language code (default: 'en')
  rate?: number          // Speech rate 0.1-10 (default: 1)
  pitch?: number         // Pitch 0-2 (default: 1)
  volume?: number        // Volume 0-1 (default: 1)
}
```

**Return Value**:
```typescript
{
  speak: (text: string) => void       // Start speaking
  stop: () => void                    // Stop playback
  pause: () => void                   // Pause playback
  resume: () => void                  // Resume playback
  isSpeaking: boolean                 // Current speaking state
}
```

**Language Mapping**:
```typescript
{
  'en': 'en-US',
  'ur': 'ur-PK',
  'hi': 'hi-IN',
  'es': 'es-ES',
  'fr': 'fr-FR'
}
```

---

## API Integration

### Endpoint: POST /api/voice-process

**Request**:
```typescript
{
  audioBase64: string,     // Base64-encoded audio
  language: string,        // Language code (en, ur, hi, es, fr)
  directText?: string      // Optional: send text directly instead of audio
}
```

**Response**:
```typescript
{
  transcribed: string,     // Transcribed text from audio
  explanation: string      // AI-generated response
}
```

**Processing**:
1. Receives base64 audio
2. Decodes from base64
3. Sends to Gemini multimodal API
4. Gets transcription
5. Sends prompt to Gemini for response
6. Returns both results

---

## State Management

### Global States

```
Component: voice-assistant.tsx
│
├─ isListening: boolean
│  └─ Indicates: Microphone recording active
│
├─ isProcessing: boolean
│  └─ Indicates: API request in progress
│
├─ isSpeaking: boolean (from useTextToSpeech)
│  └─ Indicates: TTS playback active
│
├─ autoSpeak: boolean
│  └─ Indicates: Automatic speech synthesis enabled
│
├─ language: string
│  └─ Selected language code
│
└─ messages: Message[]
   └─ Chat history array

Component: chat-message.tsx
│
├─ hasPlayed: boolean
│  └─ Tracks if message audio was played
│
└─ isSpeaking: boolean (from useTextToSpeech)
   └─ Tracks current playback state

Hook: useTextToSpeech
│
└─ isSpeaking: boolean
   └─ Real-time speaking state
```

---

## Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| MediaRecorder API | 49+ | 29+ | 14.1+ | 79+ |
| Web Speech API | 25+ | 44+ | 14.1+ | 79+ |
| AudioContext | 35+ | 25+ | 14+ | 12+ |
| Fetch API | 40+ | 39+ | 10.1+ | 14+ |
| FileReader API | All | All | All | All |
| **Fully Supported** | ✅ | ✅ | ✅ | ✅ |

---

## Performance Metrics

### Typical Processing Times

```
Step                          Time
─────────────────────────────────────
Microphone Permission        ~100ms
Recording (5 sec audio)       5000ms
Audio → Base64 Conversion    ~200ms
API Request + Transcription  ~1000ms
API Request + Response Gen   ~2000ms
TTS Initialization           ~100ms
TTS Audio Playback           Variable
─────────────────────────────────────
Total (without playback)     ~3400ms
```

### Memory Usage

```
Component            Memory (est)
─────────────────────────────────
voice-assistant.tsx    ~2MB
chat-message.tsx       ~0.5MB per message
useTextToSpeech        ~1MB
Message History        ~50KB per message
Audio Chunks           ~50KB per 5s audio
─────────────────────────────────
Total (10 messages)    ~10-15MB
```

---

## Error Handling

### Microphone Access Denied
```typescript
catch (error) {
  console.error("Microphone access denied:", error)
  alert('Please allow microphone access')
  // Recovery: None, user must grant permission
}
```

### API Errors
```typescript
if (!response.ok) {
  throw new Error(data.error || 'Failed to process audio')
  // Recovery: Display error message, allow retry
}
```

### Speech Synthesis Errors
```typescript
utterance.onerror = (event) => {
  console.error('Speech synthesis error:', event.error)
  setIsSpeaking(false)
  // Recovery: Graceful degradation, continue chat
}
```

---

## Accessibility Features

- ✅ Keyboard support for buttons
- ✅ ARIA labels for controls
- ✅ Audio playback (alt to text)
- ✅ Multiple language support
- ✅ Clear visual status indicators
- ✅ Sufficient color contrast
- ✅ Touch-friendly button sizes

---

## Security Considerations

1. **Audio Data**
   - Transmitted via HTTPS only (production)
   - Not stored locally
   - Sent only to Gemini API

2. **API Key**
   - Stored in server environment
   - Not exposed to frontend
   - Used only on backend

3. **User Data**
   - Messages stored in component state only
   - No persistent storage
   - No tracking implemented

4. **Browser Permissions**
   - Microphone permission controlled by user
   - User can revoke anytime
   - Clear permission prompt

---

## Testing Strategy

### Unit Tests
- TTS hook: speak, stop, pause, resume
- Language mapping: correct locale codes
- Message formatting: user vs assistant

### Integration Tests
- STT → API → TTS flow
- Quick action buttons
- Language switching
- Auto-speak toggle

### E2E Tests
- Complete voice conversation
- Manual audio playback
- Error handling
- Multi-browser compatibility

---

## Future Enhancements

### Phase 2 Features
- [ ] Chat history persistence
- [ ] User voice customization
- [ ] Code syntax highlighting
- [ ] Export conversations
- [ ] Recording playback

### Phase 3 Features
- [ ] Real-time transcription
- [ ] Multi-speaker support
- [ ] Voice commands
- [ ] Conversation context
- [ ] Advanced filtering

---

## Configuration Options

### Tunable Parameters

```typescript
// In useTextToSpeech
LANGUAGE_CODES = {
  'en': 'en-US',
  'ur': 'ur-PK',
  'hi': 'hi-IN',
  'es': 'es-ES',
  'fr': 'fr-FR'
}

// Speech rate (0.1 - 10)
DEFAULT_RATE = 1

// Pitch (0 - 2)
DEFAULT_PITCH = 1

// Volume (0 - 1)
DEFAULT_VOLUME = 1

// Audio recording settings
RECORDING_OPTIONS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true
}
```

---

## Deployment Considerations

### Production Requirements
- HTTPS enabled (microphone access)
- Gemini API key secured
- Rate limiting on API endpoint
- Error monitoring/logging
- Performance monitoring

### Scaling
- Message history pagination
- Lazy-load old messages
- Worker for audio processing
- Cache TTS results

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-16 | Initial implementation with STT, Gemini, TTS |

---

**Document Version**: 1.0
**Last Updated**: January 16, 2026
**Status**: Complete & Ready for Production
