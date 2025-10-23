import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';

interface AgentCardProps {
  agent: {
    id: string;
    name: { en: string; ar: string };
    description: { en: string; ar: string };
    icon: React.FC<{ className?: string }>;
    color: string; // Tailwind color class suffix, e.g., 'blue', 'purple'
  };
  isActive: boolean;
  onClick: (id: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive, onClick }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentThemeColors = theme.colors;

  const getAgentColorClasses = (colorName: string, isGradient: boolean = false) => {
    switch (colorName) {
      case 'blue': return isGradient ? `from-${currentThemeColors.primary} to-${currentThemeColors.secondary}` : currentThemeColors.primary;
      case 'purple': return isGradient ? `from-${currentThemeColors.secondary} to-${currentThemeColors.accent}` : currentThemeColors.secondary;
      case 'green': return isGradient ? `from-${currentThemeColors.accent} to-${currentThemeColors.primary}` : currentThemeColors.accent;
      case 'cyan': return isGradient ? `from-${currentThemeColors.secondary} to-${currentThemeColors.primary}` : currentThemeColors.secondary;
      case 'orange': return isGradient ? `from-${currentThemeColors.accent} to-${currentThemeColors.secondary}` : currentThemeColors.accent;
      case 'indigo': return isGradient ? `from-${currentThemeColors.primary} to-${currentThemeColors.accent}` : currentThemeColors.primary;
      case 'red': return isGradient ? `from-red-500 to-orange-500` : 'red-500'; // Specific for media/video, can be themed
      case 'pink': return isGradient ? `from-pink-500 to-purple-500` : 'pink-500'; // Specific for communicator, can be themed
      default: return isGradient ? `from-gray-500 to-gray-600` : 'gray-500';
    }
  };

  const cardBgClass = isActive
    ? `bg-gradient-to-br ${getAgentColorClasses(agent.color, true)} text-white shadow-xl scale-105`
    : `${currentThemeColors.surface} text-text border border-border hover:shadow-lg hover:scale-[1.02]`;

  const iconColorClass = isActive ? 'text-white' : `text-${agent.color}-500`; // Icon color

  return (
    <motion.button
      whileHover={{ scale: isActive ? 1.05 : 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(agent.id)}
      className={`relative p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-200 cursor-pointer ${cardBgClass}`}
      aria-label={`${agent.name[lang]} Agent`}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-200 ${isActive ? 'bg-white/30' : `bg-${agent.color}-100/${theme.mode === 'dark' ? '20' : '80'}`}`}>
        <agent.icon className={`w-8 h-8 transition-colors duration-200 ${iconColorClass}`} />
      </div>
      <h3 className={`text-xl font-bold mb-1 ${isActive ? 'text-white' : 'text-text'}`}>
        {agent.name[lang]}
      </h3>
      <p className={`text-sm ${isActive ? 'text-white/80' : 'text-text-secondary'}`}>
        {agent.description[lang]}
      </p>
    </motion.button>
  );
};

export default AgentCard;