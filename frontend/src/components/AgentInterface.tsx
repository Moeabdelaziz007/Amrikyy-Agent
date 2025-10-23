import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskHistoryEntry } from '../types';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';

// Import all specific agent UIs
import NavigatorAgentUI from './agents/NavigatorAgentUI';
import VisionAgentUI from './agents/VisionAgentUI';
import ResearchAgentUI from './agents/ResearchAgentUI';
import TranslatorAgentUI from './agents/TranslatorAgentUI';
import SchedulerAgentUI from './agents/SchedulerAgentUI';
import StorageAgentUI from './agents/StorageAgentUI';
import MediaAgentUI from './agents/MediaAgentUI';
import CommunicatorAgentUI from './agents/CommunicatorAgentUI';
import CodingAgentUI from './agents/CodingAgentUI';
import MarketingAgentUI from './agents/MarketingAgentUI';
import { XIcon } from './IconComponents';

interface AgentInterfaceProps {
  agentId: string;
  onClose: () => void;
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const agentComponents: { [key: string]: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> } = {
  navigator: NavigatorAgentUI,
  vision: VisionAgentUI,
  research: ResearchAgentUI,
  translator: TranslatorAgentUI,
  scheduler: SchedulerAgentUI,
  storage: StorageAgentUI,
  media: MediaAgentUI,
  communicator: CommunicatorAgentUI,
  coding: CodingAgentUI,
  marketing: MarketingAgentUI,
};

const AgentInterface: React.FC<AgentInterfaceProps> = ({ agentId, onClose, onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentThemeColors = theme.colors;

  const AgentComponent = agentComponents[agentId];
  if (!AgentComponent) {
    return (
      <div className="p-4 text-center text-red-500">
        {lang === 'en' ? 'Agent not found.' : 'لم يتم العثور على العميل.'}
      </div>
    );
  }

  const agentName = translations.agents[agentId as keyof typeof translations.agents]?.['en']?.name || 'Agent'; // Fallback
  const localizedAgentName = translations.agents[agentId as keyof typeof translations.agents]?.[lang]?.name || agentName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm`}
    >
      <div className={`w-full max-w-4xl h-[85vh] max-h-[800px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20`}
           style={{ background: currentThemeColors.surface }}>
        <header className={`flex items-center justify-between p-3 border-b`}
                style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
          <span className={`font-bold text-text`}>{localizedAgentName}</span>
          <button onClick={onClose} className={`p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors text-text`}>
            <XIcon className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto" style={{ background: currentThemeColors.background }}>
          <AgentComponent onTaskComplete={onTaskComplete} />
        </div>
      </div>
    </motion.div>
  );
};

export default AgentInterface;