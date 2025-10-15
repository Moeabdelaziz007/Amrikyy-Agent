import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled = false,
  placeholder = "Where would you like to go?" 
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="glass-effect-enhanced p-6 border-t border-white/10">
      <div className="relative">
        {/* Attachment Button - Floating */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5 text-gray-300" />
        </motion.button>

        {/* Input Field - Premium */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full pl-14 pr-16 py-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none max-h-32 text-base"
          style={{ minHeight: '56px', fontSize: 'var(--font-size-base)' }}
        />

        {/* Send Button - Premium */}
        <motion.button
          whileHover={{ scale: input.trim() && !disabled ? 1.05 : 1 }}
          whileTap={{ scale: input.trim() && !disabled ? 0.95 : 1 }}
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all duration-300 ${
            input.trim() && !disabled
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/50'
              : 'bg-gray-600/50 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatInput;