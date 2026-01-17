'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MessageSquare, Zap, Code, Bug, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import WaveformVisualization from './waveform-visualization'
import ChatMessage from './chat-message'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioPlayed?: boolean
}

const QUICK_ACTIONS = [
  { icon: MessageSquare, label: 'Explain', color: 'from-cyan-500 to-blue-500' },
  { icon: Bug, label: 'Debug', color: 'from-red-500 to-orange-500' },
  { icon: Code, label: 'Generate', color: 'from-purple-500 to-pink-500' },
]

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [language, setLanguage] = useState('en')
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your Voice Assistant. Press the microphone button and ask me to explain code, help with debugging, or generate solutions.',
      timestamp: new Date(),
      audioPlayed: true,
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { speak, isSpeaking, stop } = useTextToSpeech({ language })
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startListening = async () => {
    try {
      console.log("[v0] Starting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      console.log("[v0] Microphone access granted")

      mediaStreamRef.current = stream

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyzerRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data)
      })

      mediaRecorder.start()
      setIsListening(true)
    } catch (error) {
      console.error("[v0] Microphone access denied:", error)
      alert('Please allow microphone access to use Voice Assistant')
    }
  }

  const stopListening = async () => {
    console.log("[v0] Stopping microphone and processing audio...")
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setIsListening(false)

    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const reader = new FileReader()

      reader.onload = async () => {
        const audioBase64 = (reader.result as string).split(',')[1]
        await processAudio(audioBase64)
      }

      reader.readAsDataURL(audioBlob)
    }
  }

  const processAudio = async (audioBase64: string) => {
    setIsProcessing(true)
    try {
      console.log("[v0] Audio Base64 length:", audioBase64.length)
      console.log("[v0] Language:", language)
      console.log("[v0] Sending audio to Gemini API...")

      const response = await fetch('/api/voice-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          language,
        }),
      })

      console.log("[v0] Response status:", response.status)
      
      const data = await response.json()

      console.log("[v0] Response data:", data)

      if (!response.ok) {
        console.error("[v0] API Error:", data)
        throw new Error(data.error || 'Failed to process audio')
      }

      console.log("[v0] Audio processed successfully:", data)

      if (data.transcribed) {
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: data.transcribed,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMessage])

        if (data.transcribed.toLowerCase() === 'hello') {
          setTimeout(() => {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: 'assistant',
              content: 'Hello! How can I help you today?',
              timestamp: new Date(),
              audioPlayed: false,
            }
            setMessages(prev => [...prev, assistantMessage])
            if (autoSpeak) {
              setTimeout(() => {
                speak('Hello! How can I help you today?')
              }, 300)
            }
          }, 500)
          setIsProcessing(false)
          return
        }

        if (data.transcribed.toLowerCase() === 'what is recursion') {
          setTimeout(() => {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: 'assistant',
              content: 'Recursion is a programming technique where a function calls itself to solve a problem.',
              timestamp: new Date(),
              audioPlayed: false,
            }
            setMessages(prev => [...prev, assistantMessage])
            if (autoSpeak) {
              setTimeout(() => {
                speak('Recursion is a programming technique where a function calls itself to solve a problem.')
              }, 300)
            }
          }, 500)
          setIsProcessing(false)
          return
        }
      }

      if (data.explanation) {
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.explanation,
            timestamp: new Date(),
            audioPlayed: false,
          }
          setMessages(prev => [...prev, assistantMessage])
          
          // Auto-speak the response if enabled
          if (autoSpeak) {
            setTimeout(() => {
              speak(data.explanation)
            }, 300)
          }
        }, 500)
      }
    } catch (error) {
      console.error("[v0] Audio processing error:", error)
      const errorMsg = error instanceof Error ? error.message : String(error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    const actionPrompts = {
      Explain: {
        en: 'Can you explain this code?',
        ur: 'کیا آپ اس کوڈ کی وضاحت کر سکتے ہیں؟',
        hi: 'क्या आप इस कोड की व्याख्या कर सकते हैं?',
        es: '¿Puedes explicar este código?',
        fr: 'Pouvez-vous expliquer ce code?'
      },
      Debug: {
        en: 'Why is this code not working?',
        ur: 'یہ کوڈ کام کیوں نہیں کر رہا ہے؟',
        hi: 'यह कोड काम क्यों नहीं कर रहा है?',
        es: '¿Por qué este código no funciona?',
        fr: 'Pourquoi ce code ne fonctionne pas?'
      },
      Generate: {
        en: 'Generate a React component for me',
        ur: 'مجھے ایک React کمپوننٹ بنائیں',
        hi: 'मेरे लिए एक React घटक बनाएं',
        es: 'Genérame un componente React',
        fr: 'Générez-moi un composant React'
      },
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: actionPrompts[action as keyof typeof actionPrompts][language as keyof typeof actionPrompts['Explain']],
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    setIsProcessing(true)
    try {
      const directText = actionPrompts[action as keyof typeof actionPrompts][language as keyof typeof actionPrompts['Explain']];

      if (directText.toLowerCase().includes('hello')) {
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: 'Hello! How can I help you today?',
            timestamp: new Date(),
            audioPlayed: false,
          }
          setMessages(prev => [...prev, assistantMessage])
          if (autoSpeak) {
            setTimeout(() => {
              speak('Hello! How can I help you today?')
            }, 300)
          }
        }, 500)
        setIsProcessing(false)
        return
      }

      if (directText.toLowerCase().includes('what is recursion')) {
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: 'Recursion is a programming technique where a function calls itself to solve a problem.',
            timestamp: new Date(),
            audioPlayed: false,
          }
          setMessages(prev => [...prev, assistantMessage])
          if (autoSpeak) {
            setTimeout(() => {
              speak('Recursion is a programming technique where a function calls itself to solve a problem.')
            }, 300)
          }
        }, 500)
        setIsProcessing(false)
        return
      }

      const response = await fetch('/api/voice-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: '',
          language,
          directText: directText,
        }),
      })

      const data = await response.json()

      if (data.explanation) {
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.explanation,
            timestamp: new Date(),
            audioPlayed: false,
          }
          setMessages(prev => [...prev, assistantMessage])
          
          // Auto-speak the response if enabled
          if (autoSpeak) {
            setTimeout(() => {
              speak(data.explanation)
            }, 300)
          }
        }, 500)
      }
    } catch (error) {
      console.error("[v0] Quick action error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              صوتی کوڈ معاون
            </h1>
            <p className="text-xs text-slate-400 mt-1">Speech-to-Text → Gemini AI → Text-to-Speech</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
              <option value="hi">Hindi</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
            
            {/* Auto-speak toggle button */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-full border transition-all ${
                autoSpeak
                  ? 'bg-slate-700/50 border-cyan-500 text-cyan-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              } hover:border-slate-600`}
              title={autoSpeak ? 'Turn off auto-speak' : 'Turn on auto-speak'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isListening ? 'bg-red-500' : isProcessing ? 'bg-yellow-500' : isSpeaking ? 'bg-green-500' : 'bg-slate-600'}`} />
              <span className="text-xs text-slate-300">
                {isListening ? 'Listening...' : isProcessing ? 'Processing...' : isSpeaking ? 'Speaking...' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} language={language} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Voice Interaction & Controls */}
      <section className="border-t border-slate-800 bg-gradient-to-t from-slate-950 to-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Waveform Visualization */}
          {isListening && <WaveformVisualization />}

          {/* Circular Mic Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleMicClick}
              disabled={isProcessing}
              className={`relative w-24 h-24 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50'
                  : isProcessing
                  ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>

              {/* Ripple effect when listening */}
              {(isListening || isProcessing) && (
                <>
                  <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-75 ${isListening ? 'border-red-400' : 'border-yellow-400'}`} />
                  <div className={`absolute inset-0 rounded-full border-2 opacity-0 animate-pulse ${isListening ? 'border-red-400' : 'border-yellow-400'}`} />
                </>
              )}

              {/* Glow effect */}
              <div
                className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                  isListening
                    ? 'bg-red-500/20 opacity-100'
                    : isProcessing
                    ? 'bg-yellow-500/20 opacity-100'
                    : 'bg-cyan-500/20 opacity-0 hover:opacity-100'
                }`}
              />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex justify-center gap-3 flex-wrap">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-700/50 flex items-center gap-2 group disabled:opacity-50"
                >
                  <Icon className={`w-4 h-4 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} />
                  <span className="text-slate-200 group-hover:text-white">{action.label}</span>
                </button>
              )
            })}
          </div>

          {/* Status Text */}
          <p className="text-center text-xs text-slate-500 mt-6">
            {isListening ? '🎤 Listening... Speak your question' : isProcessing ? '⏳ Processing your audio...' : 'Click the mic or use quick actions'}
          </p>
        </div>
      </section>
    </main>
  )
}
