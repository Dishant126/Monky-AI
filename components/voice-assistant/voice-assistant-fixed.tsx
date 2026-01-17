'use client'

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Loader, AlertCircle, Send, MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'
import { cn } from '@/lib/utils' // Make sure you have this utility for class merging

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type SpeechRecognitionType = typeof window.SpeechRecognition

export default function VoiceAssistantFixed() {
  // State Management
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'assistant',
      content: 'Hello! I\'m your AI Assistant. You can type your message or use the microphone to speak to me.',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [error, setError] = useState('')
  const [browserSupport, setBrowserSupport] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Refs - Using refs to avoid stale closures in event handlers
  const recognitionRef = useRef<any>(null)
  const hasSpeechRef = useRef(false)  // Track if we got any speech results
  const finalTranscriptRef = useRef('')  // Real-time transcript tracking
  const cooldownRef = useRef(false)  // Prevent multiple simultaneous API calls
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)  // For cooldown timer

  // TTS Hook
  const { speak, isSpeaking, stop } = useTextToSpeech({ language: 'en' })

  // Initialize Speech Recognition (only once on client)
  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.error('[VA] Speech Recognition API not supported in this browser')
      setBrowserSupport(false)
      setError('Your browser does not support Web Speech API. Please use Chrome, Edge, or Safari.')
      return
    }

    console.log('[VA] Speech Recognition API available')
    setBrowserSupport(true)

    const recognition = new SpeechRecognition()

    // Configure recognition - en-IN for better Indian accent support
    recognition.continuous = false  // Stop after one phrase
    recognition.interimResults = true  // Show results as speaking
    recognition.lang = 'en-IN'  // Better for Indian accent

    console.log('[VA] Speech Recognition configured: lang=en-IN, continuous=false, interimResults=true')

    // Event: When recognition starts
    recognition.onstart = () => {
      console.log('[VA-SR] ✓ Speech recognition STARTED - listening for voice...')
      hasSpeechRef.current = false  // Reset speech detection flag
      finalTranscriptRef.current = ''  // Reset transcript
      setIsListening(true)
      setError('')
      setInterimTranscript('')
      setFinalTranscript('')
    }

    // Event: Getting results (both interim and final)
    recognition.onresult = (event: any) => {
      console.log('[VA-SR] onresult event:', {
        resultIndex: event.resultIndex,
        resultsLength: event.results.length,
        isFinal: event.results[event.results.length - 1].isFinal,
      })

      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence
        const isFinal = event.results[i].isFinal

        console.log(`[VA-SR] Result ${i}:`, {
          transcript,
          confidence: confidence.toFixed(2),
          isFinal,
          transcriptLength: transcript.length,
        })

        if (isFinal) {
          final += transcript + ' '
          hasSpeechRef.current = true  // Mark that we got speech
          console.log(`[VA-SR] ✓ FINAL result received: "${transcript}"`)
        } else {
          interim += transcript
        }
      }

      // Update refs with current values (for onend handler to use)
      if (final.trim()) {
        finalTranscriptRef.current = final.trim()
        console.log('[VA-SR] Updated finalTranscriptRef:', finalTranscriptRef.current)
      }

      // Update state for UI display
      setInterimTranscript(interim)
      setFinalTranscript(final)
    }

    // Event: Error occurred
    recognition.onerror = (event: any) => {
      console.error('[VA-SR] ✗ Speech recognition ERROR:', {
        error: event.error,
        hasSpeech: hasSpeechRef.current,
      })
      setError(`Error: ${event.error}`)
      setIsListening(false)
    }

    // Event: Recognition ended
    recognition.onend = () => {
      console.log('[VA-SR] Speech recognition ENDED', {
        hasSpeech: hasSpeechRef.current,
        finalTranscript: finalTranscriptRef.current,
        finalTranscriptLength: finalTranscriptRef.current.length,
      })

      setIsListening(false)

      // Check if we got any speech using ref (not stale state)
      if (hasSpeechRef.current && finalTranscriptRef.current.trim().length > 0) {
        console.log('[VA-SR] Processing transcript:', finalTranscriptRef.current)
        processTranscript(finalTranscriptRef.current)
      } else {
        console.warn('[VA-SR] No valid speech detected')
        console.log('[VA-SR] hasSpeech:', hasSpeechRef.current)
        console.log('[VA-SR] transcriptLength:', finalTranscriptRef.current.trim().length)
        setError('No speech detected. Please try again.')
      }
    }

    recognitionRef.current = recognition
    console.log('[VA] Speech Recognition initialized and stored in ref')
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, interimTranscript])

  // Handle form submission for text input
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    
    const message = inputMessage.trim()
    setInputMessage('')
    await processTranscript(message)
  }

  /**
   * Start listening for user voice
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error('[VA] Speech Recognition not available')
      setError('Speech Recognition not available')
      return
    }

    console.log('[VA] Starting speech recognition...')
    setError('')
    setFinalTranscript('')
    setInterimTranscript('')

    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('[VA] Error starting recognition:', err)
      setError('Failed to start microphone. Ensure you allowed microphone access.')
    }
  }, [])

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return

    console.log('[VA] Stopping speech recognition...')
    try {
      recognitionRef.current.stop()
    } catch (err) {
      console.error('[VA] Error stopping recognition:', err)
    }
  }, [])

  /**
   * Send transcript to API and handle response
   * Includes cooldown to prevent multiple simultaneous calls
   */
  const processTranscript = async (transcript: string) => {
    // Safety check - never call API with empty transcript
    if (!transcript || transcript.trim().length === 0) {
      console.error('[VA] Cannot process empty transcript')
      setError('Cannot process empty speech. Please try again.')
      return
    }

    // Cooldown check - prevent multiple rapid calls
    if (cooldownRef.current) {
      console.warn('[VA] Still processing previous request. Please wait.')
      setError('Still processing. Please wait a moment.')
      return
    }

    // Set cooldown flag
    cooldownRef.current = true
    setIsProcessing(true)
    setError('')

    try {
      console.log('[VA] Processing transcript:', {
        text: transcript,
        length: transcript.length,
      })

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: transcript,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMessage])

      // Hardcoded responses to avoid API call
      const lowerCaseTranscript = transcript.toLowerCase().trim();

      if (lowerCaseTranscript === 'hello') {
        console.log('[VA] Hardcoded response for "hello"');
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: 'Hello! How can I help you today?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        if (autoSpeak) {
          setTimeout(() => speak('Hello! How can I help you today?'), 300);
        }
        // Skip API call
        setIsProcessing(false);
        cooldownRef.current = false; // Reset cooldown immediately
        return;
      }

      if (lowerCaseTranscript === 'what is recursion') {
        console.log('[VA] Hardcoded response for "what is recursion"');
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: 'Recursion is a programming technique where a function calls itself to solve a problem.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        if (autoSpeak) {
          setTimeout(() => speak('Recursion is a programming technique where a function calls itself to solve a problem.'), 300);
        }
        // Skip API call
        setIsProcessing(false);
        cooldownRef.current = false; // Reset cooldown immediately
        return;
      }

      // Send to API
      console.log('[VA] Sending to Gemini API...')
      const response = await fetch('/api/voice-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          directText: transcript,  // Only sending text (using Web Speech API)
          language: 'en',
        }),
      })

      console.log('[VA] API response status:', response.status)
      const data = await response.json()
      console.log('[VA] API response received')

      // Handle API errors
      if (!response.ok) {
        const errorMsg = data.error || `HTTP ${response.status}: Failed to process`
        console.error('[VA] API Error:', errorMsg)
        throw new Error(errorMsg)
      }

      // Add assistant message
      if (data.explanation) {
        console.log('[VA] Received response from Gemini, length:', data.explanation.length)

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
      } else {
        throw new Error('No response from Gemini')
      }
    } catch (err) {
      console.error('[VA] Processing error:', err)
      const errorText = err instanceof Error ? err.message : 'Unknown error'
      
      // Parse error for better user message
      let userFriendlyError = errorText
      if (errorText.includes('quota') || errorText.includes('429')) {
        userFriendlyError = '⏳ API quota exceeded. Please wait a moment and try again.'
      } else if (errorText.includes('not found') || errorText.includes('404')) {
        userFriendlyError = '❌ Model not available. Please refresh the page.'
      } else if (errorText.includes('Failed to fetch') || errorText.includes('network')) {
        userFriendlyError = '🌐 Network error. Check your connection and try again.'
      } else if (errorText.includes('API key') || errorText.includes('authentication')) {
        userFriendlyError = '🔑 API key error. Please contact support.'
      }

      setError(userFriendlyError)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `⚠️ Error: ${userFriendlyError}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)

      // Reset cooldown after 2 seconds
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
      processingTimeoutRef.current = setTimeout(() => {
        cooldownRef.current = false
        console.log('[VA] Cooldown reset, ready for next request')
      }, 2000)
    }
  }

  if (!browserSupport) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center">
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Browser Not Supported</h2>
          <p className="text-red-200">
            Your browser does not support the Web Speech API. Please use Google Chrome, Microsoft Edge, or Safari.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {isOpen && (
        <div className="flex flex-col w-96 h-[600px] bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 overflow-hidden transform transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="bg-slate-800/80 border-b border-slate-700 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setAutoSpeak(!autoSpeak)}
                className="text-slate-300 hover:text-white transition-colors p-1 rounded-full"
                title={autoSpeak ? 'Mute voice' : 'Unmute voice'}
              >
                {autoSpeak ? (
                  <Volume2 className="h-5 w-5 text-blue-400" />
                ) : (
                  <VolumeX className="h-5 w-5 text-slate-400" />
                )}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full"
                title="Minimize"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[90%] rounded-2xl p-5 backdrop-blur-sm',
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none shadow-lg shadow-blue-500/20'
                      : 'bg-slate-700/80 text-slate-100 rounded-bl-none shadow-lg shadow-slate-900/30'
                  )}
                >
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-2 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center justify-start">
                <div className="bg-slate-700/80 rounded-full p-2.5 shadow-lg">
                  <Loader className="h-5 w-5 animate-spin text-blue-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-slate-800/80 border-t border-slate-700 p-4">
            {error && (
              <div className="flex items-center bg-red-900/30 border border-red-800 text-red-200 text-sm p-3 rounded-lg mb-3">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex h-12 w-full rounded-xl bg-slate-700/80 border border-slate-600/50 text-slate-100 placeholder-slate-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 disabled:opacity-50 transition-all duration-200 shadow-lg"
                  disabled={isProcessing || isListening}
                />
                {interimTranscript && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800/90 p-3 rounded-xl border border-slate-700 text-sm text-slate-300 shadow-xl">
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
                      <span>{interimTranscript}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing || !browserSupport || !!inputMessage}
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isListening 
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl shadow-red-500/30 transform scale-105' 
                      : 'bg-gradient-to-br from-slate-700/80 to-slate-600/80 text-slate-200 hover:text-white border border-slate-600/50 hover:border-slate-500/70 hover:shadow-lg'
                  } ${(isProcessing || !browserSupport || !!inputMessage) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isListening ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </button>
                
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isProcessing || isListening}
                  className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    !inputMessage.trim() || isProcessing || isListening
                      ? 'bg-blue-600/50 text-blue-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
            
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-slate-400">
                {isListening && (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    <span>Listening...</span>
                  </span>
                )}
                {isProcessing && !isListening && (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full">
                    <Loader className="h-3 w-3 animate-spin text-blue-400" />
                    <span>Processing...</span>
                  </span>
                )}
                {isSpeaking && (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Speaking...</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center">
                <span className="hidden sm:inline mr-1">Powered by</span>
                <span className="font-medium text-blue-400">Gemini AI</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center h-16 w-16 rounded-full shadow-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 transform -translate-y-2' 
            : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 hover:shadow-2xl'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <MessageSquare className="h-7 w-7 text-white" />
        )}
      </button>
    </div>
  )
}
