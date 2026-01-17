'use client'

import { useState } from 'react'
import { MessageCircle, Bot, Volume2, Square } from 'lucide-react'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'

interface ChatMessageProps {
  message: {
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: Date
    audioPlayed?: boolean
  }
  language?: string
}

export default function ChatMessage({ message, language = 'en' }: ChatMessageProps) {
  const isAssistant = message.type === 'assistant'
  const { speak, stop, isSpeaking } = useTextToSpeech({ language })
  const [hasPlayed, setHasPlayed] = useState(message.audioPlayed || false)

  const handleSpeak = () => {
    if (isSpeaking) {
      stop()
    } else {
      speak(message.content)
      setHasPlayed(true)
    }
  }

  return (
    <div
      className={`flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 ${
        isAssistant ? 'flex-start' : 'flex-end justify-end'
      }`}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mt-1">
          <Bot className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
      )}

      <div
        className={`max-w-md px-4 py-3 rounded-lg ${
          isAssistant
            ? 'bg-slate-800/50 border border-slate-700 text-slate-100'
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className="flex items-center justify-between gap-2 mt-2">
          <p
            className={`text-xs ${
              isAssistant ? 'text-slate-500' : 'text-cyan-100/60'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          
          {/* Speaker button for assistant messages */}
          {isAssistant && (
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-md transition-all text-xs font-medium flex items-center gap-1 ${
                isSpeaking
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-cyan-400'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Play audio'}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span className="text-xs">Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span className="text-xs">Play</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mt-1">
          <MessageCircle className="w-4 h-4 text-slate-300" strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}
