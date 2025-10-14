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
    <div className="glass-effect p-4 border-t border-white/10">
      <div className="flex gap-2 items-end">
        {/* Attachment Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5 text-gray-300" />
        </motion.button>

        {/* Input Field */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none max-h-32"
          style={{ minHeight: '48px' }}
        />

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className={`p-3 rounded-xl flex-shrink-0 transition-all ${
            input.trim() && !disabled
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatInput;