import React, { useState, useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskHistoryEntry } from '../types';
import { LanguageContext, TTSContext, NotificationContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';

// Import components for the Hub
import AgentCard from './AgentCard';
import AgentInterface from './AgentInterface';
import TaskHistory from './TaskHistory';
import { ThemeSelector } from './ThemeSelector'; // Import ThemeSelector

// Import all specific agent icons
import { MapPinIcon, EyeIcon, SearchIcon, LanguagesIcon, CalendarIcon, HardDriveIcon, VideoIcon, MailIcon, GlobeIcon, XIcon, CogIcon } from './IconComponents'; // Corrected Cog import

interface AgentDefinition {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  icon: React.FC<{ className?: string }>;
  color: string; // Tailwind color class suffix for gradients
}

const MiniAgentsHub: React.FC = () => {
  const { lang, setLang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const { selectedVoice, setSelectedVoice, playbackSpeed, setPlaybackSpeed } = useContext(TTSContext);
  const { notificationsEnabled, setNotificationsEnabled } = useContext(NotificationContext);

  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>(() => {
    const savedHistory = localStorage.getItem('amrikyy-task-history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [showSettings, setShowSettings] = useState(false);
  const [mainAIPrompt, setMainAIPrompt] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationError, setOrchestrationError] = useState<string | null>(null);


  useEffect(() => {
    localStorage.setItem('amrikyy-task-history', JSON.stringify(taskHistory));
  }, [taskHistory]);

  const handleTaskComplete = useCallback((entry: TaskHistoryEntry) => {
    setTaskHistory((prevHistory) => [...prevHistory, entry]);
    if (notificationsEnabled) {
      // In a real app, you'd send a browser notification
      console.log(`Notification: Task ${entry.status} by ${entry.agentName}`);
    }
  }, [notificationsEnabled]);

  const handleClearHistory = () => {
    setTaskHistory([]);
  };

  const handleOrchestrate = async () => {
    if (!mainAIPrompt.trim()) return;

    setIsOrchestrating(true);
    setOrchestrationError(null);
    const currentAgentName = translations.global[lang].mainAITitle;

    try {
      // Simulate calling a backend orchestrator
      const response = await fetch('http://localhost:3000/api/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: mainAIPrompt, lang }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const workflow = await response.json();
      
      handleTaskComplete({
        id: Date.now().toString(),
        agentId: 'orchestrator',
        agentName: currentAgentName,
        taskType: translations.global[lang].mainAIButton,
        taskInput: mainAIPrompt,
        taskOutput: translations.global[lang].aiPlanning,
        timestamp: new Date().toISOString(),
        status: 'success',
        workflowStep: 0,
      });

      // Simulate step-by-step execution and logging
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        // Cast translations.agents to Record<string, any> for dynamic key access
        const agentTranslations = (translations.agents as Record<string, any>)[step.agentId]?.[lang];

        // Simulate agent task execution
        // For NavigatorAgent, we will use the actual backend endpoint
        if (step.agentId === 'navigator') {
          const agentResponse = await fetch(`http://localhost:3000/api/agents/${step.agentId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(step.taskInput),
          });

          if (!agentResponse.ok) {
            const errorData = await agentResponse.json();
            throw new Error(errorData.error || agentResponse.statusText);
          }
          const agentResult = await agentResponse.json();

          handleTaskComplete({
            id: Date.now().toString() + `-step-${i + 1}`,
            agentId: step.agentId,
            agentName: agentTranslations?.name || step.agentId,
            taskType: agentTranslations?.tasks?.[step.taskType as keyof typeof agentTranslations.tasks] || step.taskType,
            taskInput: step.taskInput,
            taskOutput: agentResult, // Use real result from backend
            timestamp: new Date().toISOString(),
            status: 'success',
            workflowStep: i + 1,
          });

        } else {
          // For other agents, continue with mock execution
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
          handleTaskComplete({
            id: Date.now().toString() + `-step-${i + 1}`,
            agentId: step.agentId,
            agentName: agentTranslations?.name || step.agentId,
            taskType: agentTranslations?.tasks?.[step.taskType as keyof typeof agentTranslations.tasks] || step.taskType,
            taskInput: step.taskInput,
            taskOutput: (translations.agents as Record<string, any>)[step.agentId]?.[lang]?.mockResults?.[step.mockResultKey as keyof typeof translations.agents[string]['en']['mockResults']] || 'Mock output',
            timestamp: new Date().toISOString(),
            status: 'success',
            workflowStep: i + 1,
          });
        }
      }
    } catch (error: any) {
      console.error('Orchestration failed:', error);
      setOrchestrationError(`${currentGlobalText.orchestrationFailed} ${error.message}`);
      handleTaskComplete({
        id: Date.now().toString(),
        agentId: 'orchestrator',
        agentName: currentAgentName,
        taskType: translations.global[lang].mainAIButton,
        taskInput: mainAIPrompt,
        taskOutput: `Failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: error.message,
      });
    } finally {
      setIsOrchestrating(false);
      setMainAIPrompt('');
    }
  };


  const agents: AgentDefinition[] = [
    { 
      id: 'navigator', 
      name: { en: translations.agents.navigator.en.name, ar: translations.agents.navigator.ar.name }, 
      description: { en: translations.agents.navigator.en.description, ar: translations.agents.navigator.ar.description }, 
      icon: MapPinIcon, 
      color: 'blue' 
    },
    { 
      id: 'vision', 
      name: { en: translations.agents.vision.en.name, ar: translations.agents.vision.ar.name }, 
      description: { en: translations.agents.vision.en.description, ar: translations.agents.vision.ar.description }, 
      icon: EyeIcon, 
      color: 'purple' 
    },
    { 
      id: 'research', 
      name: { en: translations.agents.research.en.name, ar: translations.agents.research.ar.name }, 
      description: { en: translations.agents.research.en.description, ar: translations.agents.research.ar.description }, 
      icon: SearchIcon, 
      color: 'green' 
    },
    { 
      id: 'translator', 
      name: { en: translations.agents.translator.en.name, ar: translations.agents.translator.ar.name }, 
      description: { en: translations.agents.translator.en.description, ar: translations.agents.translator.ar.description }, 
      icon: LanguagesIcon, 
      color: 'cyan' 
    },
    { 
      id: 'scheduler', 
      name: { en: translations.agents.scheduler.en.name, ar: translations.agents.scheduler.ar.name }, 
      description: { en: translations.agents.scheduler.en.description, ar: translations.agents.scheduler.ar.description }, 
      icon: CalendarIcon, 
      color: 'orange' 
    },
    { 
      id: 'storage', 
      name: { en: translations.agents.storage.en.name, ar: translations.agents.storage.ar.name }, 
      description: { en: translations.agents.storage.en.description, ar: translations.agents.storage.ar.description }, 
      icon: HardDriveIcon, 
      color: 'indigo' 
    },
    { 
      id: 'media', 
      name: { en: translations.agents.media.en.name, ar: translations.agents.media.ar.name }, 
      description: { en: translations.agents.media.en.description, ar: translations.agents.media.ar.description }, 
      icon: VideoIcon, 
      color: 'red' 
    },
    { 
      id: 'communicator', 
      name: { en: translations.agents.communicator.en.name, ar: translations.agents.communicator.ar.name }, 
      description: { en: translations.agents.communicator.en.description, ar: translations.agents.communicator.ar.description }, 
      icon: MailIcon, 
      color: 'pink' 
    },
  ];

  const currentThemeColors = theme.colors;
  const currentGlobalText = translations.global[lang];

  const sectionClass = `mb-8 p-6 rounded-lg shadow-md`;
  const labelClass = `block text-lg font-semibold mb-3 text-primary`; // Use primary color for labels
  const controlBgClass = `bg-background border-border text-text`; // Use themed colors
  const toggleClass = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-gray-400'}`;

  return (
    <div 
      className={`min-h-screen p-6 transition-colors duration-300`}
      style={{ background: currentThemeColors.background, color: currentThemeColors.text, fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className={`text-4xl font-bold text-transparent bg-clip-text`}
                style={{ backgroundImage: currentThemeColors.gradient }}
            >
                {currentGlobalText.miniAgentsHub}
            </h1>
            <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                    className={`p-2 rounded-full border text-text-secondary transition-colors ${currentThemeColors.surface} ${currentThemeColors.border}`}
                    style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}
                    aria-label={lang === 'en' ? 'Switch to Arabic' : 'التحويل إلى الإنجليزية'}
                >
                    <GlobeIcon className="w-6 h-6" />
                </motion.button>
                {/* Settings Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(true)}
                    className={`p-2 rounded-full border text-text-secondary transition-colors ${currentThemeColors.surface} ${currentThemeColors.border}`}
                    style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}
                    aria-label={lang === 'en' ? 'Open Settings' : 'فتح الإعدادات'}
                >
                    <CogIcon className="w-6 h-6" />
                </motion.button>
            </div>
        </header>

        {/* Main AI Orchestration Input */}
        <div className={sectionClass} style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
          <h2 className={`text-2xl font-bold mb-4 text-text`} style={{ backgroundImage: currentThemeColors.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {currentGlobalText.mainAITitle}
          </h2>
          <div className="flex space-x-3 rtl:space-x-reverse">
            <input
              type="text"
              placeholder={currentGlobalText.mainAIPlaceholder}
              value={mainAIPrompt}
              onChange={(e) => setMainAIPrompt(e.target.value)}
              className={`flex-1 p-3 rounded-lg border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`}
              style={{ borderColor: currentThemeColors.border }}
              disabled={isOrchestrating}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOrchestrate}
              className={`px-6 py-3 rounded-lg text-white font-semibold bg-primary hover:opacity-90 transition-colors disabled:opacity-50`}
              style={{ background: currentThemeColors.primary }}
              disabled={isOrchestrating || !mainAIPrompt.trim()}
            >
              {isOrchestrating ? currentGlobalText.loading : currentGlobalText.mainAIButton}
            </motion.button>
          </div>
          {orchestrationError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-error mt-4 text-sm"
            >
              {orchestrationError}
            </motion.p>
          )}
        </div>


        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isActive={activeAgentId === agent.id}
              onClick={setActiveAgentId}
            />
          ))}
        </div>

        {/* Active Agent Interface */}
        <AnimatePresence>
          {activeAgentId && (
            <AgentInterface
              agentId={activeAgentId}
              onClose={() => setActiveAgentId(null)}
              onTaskComplete={handleTaskComplete}
            />
          )}
        </AnimatePresence>
        
        {/* Task History */}
        <TaskHistory history={taskHistory} onClearHistory={handleClearHistory} />

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className={`fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm`}
            >
              <div className={`w-full max-w-2xl h-[85vh] max-h-[800px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20`}
                   style={{ background: currentThemeColors.background }}>
                <header className={`flex items-center justify-between p-3 border-b`}
                        style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
                  <span className={`font-bold text-text`}>{lang === 'en' ? 'Settings' : 'الإعدادات'}</span>
                  <button onClick={() => setShowSettings(false)} className={`p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors text-text`}>
                    <XIcon className="w-5 h-5" />
                  </button>
                </header>
                <div className="flex-1 overflow-y-auto p-6" style={{ background: currentThemeColors.background }}>
                  {/* Language Settings */}
                  <div className={sectionClass} style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
                    <label className={labelClass}>{currentGlobalText.language}</label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setLang('en')}
                        className={`px-6 py-2 rounded-full font-medium ${lang === 'en' ? 'bg-primary text-white' : `${controlBgClass} hover:bg-border`} transition-colors`}
                        style={{ background: lang === 'en' ? currentThemeColors.primary : currentThemeColors.background, color: lang === 'en' ? 'white' : currentThemeColors.text, borderColor: currentThemeColors.border, border: '1px solid'}}
                      >
                        {currentGlobalText.english}
                      </button>
                      <button
                        onClick={() => setLang('ar')}
                        className={`px-6 py-2 rounded-full font-medium ${lang === 'ar' ? 'bg-primary text-white' : `${controlBgClass} hover:bg-border`} transition-colors`}
                        style={{ background: lang === 'ar' ? currentThemeColors.primary : currentThemeColors.background, color: lang === 'ar' ? 'white' : currentThemeColors.text, borderColor: currentThemeColors.border, border: '1px solid'}}
                      >
                        {currentGlobalText.arabic}
                      </button>
                    </div>
                  </div>

                  {/* Theme Settings */}
                  <div className={sectionClass} style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
                    <label className={labelClass}>{currentGlobalText.theme}</label>
                    <ThemeSelector language={lang} />
                  </div>

                  {/* Notifications Settings */}
                  <div className={sectionClass} style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
                    <label className={labelClass}>{currentGlobalText.notifications}</label>
                    <div className="flex items-center space-x-3">
                      <span className={`text-text-secondary`}>{currentGlobalText.enableNotifications}</span>
                      <label htmlFor="notification-toggle" className="flex items-center cursor-pointer">
                        <span className={toggleClass} style={{ background: notificationsEnabled ? currentThemeColors.primary : currentThemeColors.border }}>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </span>
                        <input
                          id="notification-toggle"
                          type="checkbox"
                          className="sr-only"
                          checked={notificationsEnabled}
                          onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Text-to-Speech Voice */}
                  <div className={sectionClass} style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
                    <label className={labelClass}>{currentGlobalText.ttsVoice}</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className={`w-full p-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${controlBgClass}`}
                      style={{ background: currentThemeColors.background, borderColor: currentThemeColors.border, color: currentThemeColors.text }}
                    >
                      {Object.entries({
                        'Zephyr': lang === 'en' ? 'Zephyr (Default, Female)' : 'زفير (افتراضي، أنثوي)',
                        'Kore': lang === 'en' ? 'Kore (Male)' : 'كوري (ذكوري)',
                        'Puck': lang === 'en' ? 'Puck (Female)' : 'باك (أنثوي)',
                        'Charon': lang === 'en' ? 'Charon (Deep Male)' : 'شارون (ذكوري عميق)',
                        'Fenrir': lang === 'en' ? 'Fenrir (Childlike Female)' : 'فنرير (أنثوي طفولي)',
                      }).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Text-to-Speech Speed */}
                  <div className={sectionClass} style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
                    <label className={labelClass}>{currentGlobalText.ttsSpeed}</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.25"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: currentThemeColors.primary }}
                      />
                      <span className={`w-12 text-center font-medium text-text-secondary`}>
                        {playbackSpeed.toFixed(2)}x
                      </span>
                      {/* Removed preview voice button for simplicity in this general settings panel */}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default MiniAgentsHub;