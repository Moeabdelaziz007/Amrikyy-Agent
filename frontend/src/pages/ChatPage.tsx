import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import ChatMessage from '../components/chat/ChatMessage';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChatInput from '../components/chat/ChatInput';
import HologramWorkflow from '../components/workflow/HologramWorkflow';
import { aiService } from '../api/services';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

/**
 * ChatPage - Main chat interface for trip planning
 * 
 * Features:
 * - Real-time chat with AI assistant
 * - Hologram workflow sidebar showing agent activity
 * - Auto-scroll to latest message
 * - Typing indicators
 * - Message history
 */
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m Amrikyy, your AI travel companion. I can help you plan amazing trips within your budget. Where would you like to go?',
      role: 'assistant',
      timestamp: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [showWorkflow, setShowWorkflow] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Send to AI service
      const history = messages.slice(-5).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data } = await aiService.sendMessage(content, {
        useTools: true,
        conversationHistory: history,
      });

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data?.success
          ? data.reply
          : 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Set session ID for workflow tracking
      if (data?.sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting. Please check your internet and try again.',
        role: 'assistant',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-88px)] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="glass-effect p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Amrikyy AI</h2>
                <p className="text-xs text-gray-400">Your travel planning assistant</p>
              </div>
            </div>
            <button
              onClick={() => setShowWorkflow(!showWorkflow)}
              className="px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-gray-300 lg:hidden"
            >
              {showWorkflow ? 'Hide' : 'Show'} Workflow
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>

      {/* Workflow Sidebar */}
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ 
          x: showWorkflow ? 0 : 400, 
          opacity: showWorkflow ? 1 : 0 
        }}
        className={`w-96 border-l border-white/10 overflow-y-auto ${
          showWorkflow ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AI Workflow</h3>
            <button
              onClick={() => setShowWorkflow(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <HologramWorkflow sessionId={sessionId || 'demo'} />
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPage;