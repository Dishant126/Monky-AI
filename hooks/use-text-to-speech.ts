import { useCallback, useRef, useState } from 'react'

interface UseTextToSpeechOptions {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    language = 'en',
    rate = 1,
    pitch = 1,
    volume = 1,
  } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Get language code based on language name
  const getLanguageCode = useCallback((lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'ur': 'ur-PK',
      'hi': 'hi-IN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'english': 'en-US',
      'urdu': 'ur-PK',
      'hindi': 'hi-IN',
      'spanish': 'es-ES',
      'french': 'fr-FR',
    }
    return languageMap[lang.toLowerCase()] || 'en-US'
  }, [])

  const speak = useCallback((text: string) => {
    // Cancel any ongoing speech
    if (isSpeaking) {
      window.speechSynthesis.cancel()
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = getLanguageCode(language)
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = Math.min(volume, 1)

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsSpeaking(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [language, rate, pitch, volume, isSpeaking, getLanguageCode])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
    }
  }, [])

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }, [])

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
  }
}
