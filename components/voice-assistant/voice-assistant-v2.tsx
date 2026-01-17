'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function VoiceAssistantV2() {
  // State Management
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'assistant',
      content: 'Hello! I\'m your Voice Assistant. Click the microphone button and speak. I\'ll understand you, get a response from Gemini AI, and speak it back.',
      timestamp: new Date(),
    },
  ])
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [transcript, setTranscript] = useState('')

  // Refs
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // TTS Hook
  const { speak, isSpeaking, stop } = useTextToSpeech({ language: 'en' })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Start listening for user voice
   */
  const startListening = useCallback(async () => {
    try {
      console.log('[VA] Starting voice recording...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      console.log('[VA] Microphone access granted')
      mediaStreamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data)
      })

      mediaRecorder.start()
      setIsListening(true)
      setTranscript('Listening...')
      console.log('[VA] Recording started')
    } catch (error) {
      console.error('[VA] Microphone access error:', error)
      alert('Please allow microphone access to use this voice assistant')
      setTranscript('Microphone access denied')
    }
  }, [])

  /**
   * Stop listening and process audio
   */
  const stopListening = useCallback(async () => {
    console.log('[VA] Stopping recording...')
    
    if (!mediaRecorderRef.current) {
      console.error('[VA] MediaRecorder not initialized')
      return
    }

    mediaRecorderRef.current.stop()
    setIsListening(false)

    // Stop all tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    setTranscript('Processing...')
  }, [])

  /**
   * Handle MediaRecorder stop and process audio
   */
  useEffect(() => {
    if (!mediaRecorderRef.current) return

    mediaRecorderRef.current.addEventListener('stop', async () => {
      if (audioChunksRef.current.length === 0) {
        console.log('[VA] No audio chunks recorded')
        setTranscript('No audio recorded')
        return
      }

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      console.log('[VA] Audio blob created, size:', audioBlob.size, 'bytes')

      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const audioBase64 = (reader.result as string).split(',')[1]
          console.log('[VA] Audio converted to base64, length:', audioBase64.length)
          
          await processAudio(audioBase64)
        } catch (error) {
          console.error('[VA] Error reading audio:', error)
          setTranscript('Error processing audio')
        }
      }
      reader.readAsDataURL(audioBlob)
    })
  }, [])

  /**
   * Send audio to API and handle response
   */
  const processAudio = async (audioBase64: string) => {
    setIsProcessing(true)
    try {
      console.log('[VA] Sending audio to API...')
      console.log('[VA] Audio Base64 length:', audioBase64.length)

      const response = await fetch('/api/voice-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64,
          language: 'en',
        }),
      })

      console.log('[VA] API response status:', response.status)
      const data = await response.json()
      console.log('[VA] API response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process audio')
      }

      // Add user message
      if (data.transcribed) {
        console.log('[VA] Transcribed text:', data.transcribed)
        setTranscript(data.transcribed)
        
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          type: 'user',
          content: data.transcribed,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMessage])
      }

      // Add assistant message
      if (data.explanation) {
        console.log('[VA] Received explanation from Gemini')
        
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: data.explanation,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])

        // Auto-speak if enabled
        if (autoSpeak) {
          console.log('[VA] Speaking response...')
          setTimeout(() => {
            speak(data.explanation)
          }, 500)
        }
      }
    } catch (error) {
      console.error('[VA] Processing error:', error)
      const errorText = error instanceof Error ? error.message : 'Unknown error'
      setTranscript(`Error: ${errorText}`)
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `I encountered an error: ${errorText}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <h1 className="text-2xl font-bold text-white">🎤 Voice Assistant</h1>
        <p className="text-slate-400 text-sm mt-1">Speak → Gemini AI → Voice Response</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-slate-700 border-t border-slate-600 p-4">
          <p className="text-slate-300 text-sm">
            <span className="font-semibold">Transcript:</span> {transcript}
          </p>
        </div>
      )}

      {/* Control Area */}
      <div className="bg-slate-800 border-t border-slate-700 p-6 space-y-4">
        {/* Main Controls */}
        <div className="flex gap-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`flex-1 h-12 text-lg font-bold ${
              isListening
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2" size={20} /> Stop Listening
              </>
            ) : (
              <>
                <Mic className="mr-2" size={20} /> Start Listening
              </>
            )}
          </Button>

          <Button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`h-12 px-6 ${
              autoSpeak
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
          >
            {autoSpeak ? (
              <Volume2 size={20} />
            ) : (
              <VolumeX size={20} />
            )}
          </Button>

          {isSpeaking && (
            <Button
              onClick={stop}
              className="h-12 px-6 bg-orange-600 hover:bg-orange-700"
            >
              Stop Speaking
            </Button>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-4 text-slate-400">
            {isListening && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Recording...
              </span>
            )}
            {isProcessing && (
              <span className="flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                Processing...
              </span>
            )}
            {isSpeaking && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Speaking...
              </span>
            )}
          </div>
          
          <button
            onClick={() => setMessages([messages[0]])}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            Clear History
          </button>
        </div>
      </div>
    </div>
  )
}
