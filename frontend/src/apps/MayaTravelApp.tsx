/**
 * Maya Travel App - AI-Powered Travel Assistant
 * 
 * Features:
 * - AI chat interface powered by Gemini Pro
 * - Voice input support
 * - Bilingual support (Arabic/English)
 * - Travel planning and booking assistance
 * - Integration with OS window system
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Mic, 
  MicOff, 
  Plane, 
  Globe, 
  Sparkles,
  Loader2,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  language?: 'en' | 'ar'
}

interface MayaTravelAppProps {
  className?: string
  onClose?: () => void
}

export function MayaTravelApp({ className, onClose }: MayaTravelAppProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Maya, your AI travel assistant. I can help you plan trips, find deals, book flights and hotels. How can I assist you today?',
      timestamp: new Date(),
      language: 'en'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      language
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call backend API
      const response = await fetch('/api/os/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          command: input.trim(),
          context: {
            appId: 'maya-travel',
            language,
            conversationHistory: messages.slice(-5) // Last 5 messages for context
          }
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data?.response || 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        language
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'ar' 
          ? 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        language
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  /**
   * Handle voice input
   */
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  /**
   * Toggle language
   */
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en'
    setLanguage(newLang)

    const announcement: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: newLang === 'ar' 
        ? 'تم التبديل إلى اللغة العربية. كيف يمكنني مساعدتك؟'
        : 'Switched to English. How can I help you?',
      timestamp: new Date(),
      language: newLang
    }

    setMessages(prev => [...prev, announcement])
  }

  /**
   * Quick action buttons
   */
  const quickActions = [
    { icon: Plane, label: language === 'ar' ? 'رحلات الطيران' : 'Flights', query: 'Find me flights' },
    { icon: MapPin, label: language === 'ar' ? 'فنادق' : 'Hotels', query: 'Search for hotels' },
    { icon: Calendar, label: language === 'ar' ? 'خطة رحلة' : 'Plan Trip', query: 'Help me plan a trip' },
    { icon: DollarSign, label: language === 'ar' ? 'عروض' : 'Deals', query: 'Show me travel deals' }
  ]

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {language === 'ar' ? 'مايا - مساعد السفر' : 'Maya - Travel Assistant'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
            </p>
          </div>
        </div>

        {/* Language Toggle */}
        <Button
          onClick={toggleLanguage}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Globe className="w-4 h-4" />
          {language === 'ar' ? 'EN' : 'عربي'}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="gap-2 whitespace-nowrap"
            onClick={() => {
              setInput(action.query)
              inputRef.current?.focus()
            }}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2 shadow-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none border'
                  )}
                  dir={message.language === 'ar' ? 'rtl' : 'ltr'}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-xs font-semibold text-primary">Maya</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString(message.language === 'ar' ? 'ar-SA' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-lg px-4 py-2 border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'مايا تفكر...' : 'Maya is thinking...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              className={cn(
                'pr-12',
                language === 'ar' && 'text-right'
              )}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
            {isListening && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </motion.div>
            )}
          </div>

          {/* Voice Input Button */}
          <Button
            onClick={handleVoiceInput}
            variant={isListening ? 'default' : 'outline'}
            size="icon"
            disabled={isLoading}
            className={cn(
              'transition-all',
              isListening && 'animate-pulse bg-red-500 hover:bg-red-600'
            )}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          {language === 'ar' 
            ? 'اضغط Enter للإرسال • مدعوم بـ Gemini Pro'
            : 'Press Enter to send • Powered by Gemini Pro'}
        </p>
      </div>
    </div>
  )
}

export default MayaTravelApp
