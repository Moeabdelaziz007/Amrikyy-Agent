import React, { useContext } from 'react';
import { TaskHistoryEntry } from '../types';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskHistoryProps {
  history: TaskHistoryEntry[];
  onClearHistory: () => void;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({ history, onClearHistory }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const historyItemClass = `p-4 rounded-lg shadow-sm mb-3 border ${currentThemeColors.surface} ${currentThemeColors.border}`;
  const statusSuccessClass = 'text-green-500';
  const statusErrorClass = 'text-red-500';
  const textColorClass = `text-text`;
  const textSecondaryClass = `text-text-secondary`;

  return (
    <div className={`p-6 rounded-xl mt-8 shadow-inner`} style={{ background: currentThemeColors.background }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${textColorClass}`}>{currentText.taskHistory}</h2>
        <button
          onClick={onClearHistory}
          className={`px-4 py-2 rounded-lg text-sm font-medium bg-secondary hover:opacity-90 transition-opacity`}
          style={{ background: currentThemeColors.secondary, color: 'white' }}
          disabled={history.length === 0}
        >
          {currentText.clearHistory}
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-center py-4 ${textSecondaryClass}`}
            >
              {currentText.noTasksYet}
            </motion.p>
          ) : (
            [...history].reverse().map((entry) => ( // Reverse to show latest first
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className={historyItemClass}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-semibold text-lg ${textColorClass}`}>
                    {translations.agents[entry.agentId as keyof typeof translations.agents]?.[lang]?.name || entry.agentName}
                  </span>
                  <span className={`text-sm ${textSecondaryClass}`}>
                    {new Date(entry.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
                <p className={`text-sm mb-1 ${textColorClass}`}>
                  <strong>{currentText.task}:</strong> {entry.taskType}
                </p>
                <p className={`text-sm mb-1 ${textColorClass} break-words`}>
                  <strong>{currentText.input}:</strong> {typeof entry.taskInput === 'string' ? entry.taskInput : JSON.stringify(entry.taskInput)}
                </p>
                <p className={`text-sm mb-1 ${textColorClass} break-words`}>
                  <strong>{currentText.output}:</strong> {typeof entry.taskOutput === 'string' ? entry.taskOutput : JSON.stringify(entry.taskOutput)}
                </p>
                <p className={`text-sm ${entry.status === 'success' ? statusSuccessClass : statusErrorClass}`}>
                  <strong>{currentText.status}:</strong> {entry.status === 'success' ? currentText.success : currentText.error}
                  {entry.errorMessage && ` (${entry.errorMessage})`}
                </p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskHistory;