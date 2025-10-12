// ===== الجدول الزمني للإجراءات =====

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ActionLogEntry } from '../../types/automation';

interface ActionTimelineProps {
  actions: ActionLogEntry[];
}

export function ActionTimeline({ actions }: ActionTimelineProps) {
  return (
    <div className="w-96 bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 border-2 border-gray-800 shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">الجدول الزمني</h3>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 pb-4 border-l-2 border-blue-500/50 last:border-l-0 last:pb-0"
            >
              {/* نقطة الجدول الزمني */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-gray-900 ${
                  action.status === 'completed'
                    ? 'bg-green-500'
                    : action.status === 'failed'
                    ? 'bg-red-500'
                    : 'bg-blue-500 animate-pulse'
                }`}
              />

              {/* محتوى الإجراء */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-gray-600/50 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white font-medium flex-1">
                    {action.description}
                  </p>
                  {action.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : action.status === 'failed' ? (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(action.timestamp).toLocaleTimeString('ar-EG')}
                </p>

                {/* صورة مصغرة إذا كانت متاحة */}
                {action.screenshot && (
                  <motion.img
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    src={`data:image/png;base64,${action.screenshot}`}
                    alt="Action screenshot"
                    className="mt-2 w-full rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* رسالة عندما لا توجد إجراءات */}
        {actions.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">لم تبدأ الإجراءات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
