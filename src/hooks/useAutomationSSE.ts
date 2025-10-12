// ===== Hook للربط مع Backend عبر Server-Sent Events =====

import { useState, useEffect, useRef } from 'react';
import type { 
  TripSearchData, 
  AutomationProgress, 
  ActionLogEntry,
  HotelDiscovery
} from '../types/automation';

interface UseAutomationSSEReturn {
  phase: 'idle' | 'running' | 'complete' | 'error';
  currentAction: string;
  progress: number;
  screenshot: string;
  actions: ActionLogEntry[];
  discoveredHotels: HotelDiscovery[];
  error: string | null;
  startTime: number | null;
  stop: () => void;
  reset: () => void;
}

export function useAutomationSSE(
  tripData: TripSearchData,
  shouldStart: boolean
): UseAutomationSSEReturn {
  const [phase, setPhase] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
  const [currentAction, setCurrentAction] = useState('');
  const [progress, setProgress] = useState(0);
  const [screenshot, setScreenshot] = useState('');
  const [actions, setActions] = useState<ActionLogEntry[]>([]);
  const [discoveredHotels, setDiscoveredHotels] = useState<HotelDiscovery[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const totalSteps = 10; // تقدير عدد الخطوات الكلية

  useEffect(() => {
    if (!shouldStart || phase === 'running') return;

    // إعادة تعيين الحالة عند البدء
    setPhase('running');
    setProgress(0);
    setActions([]);
    setDiscoveredHotels([]);
    setError(null);
    setStartTime(Date.now());

    // بناء URL مع معاملات الرحلة
    const params = new URLSearchParams({
      destination: tripData.destination,
      checkIn: tripData.checkIn,
      checkOut: tripData.checkOut,
      travelers: tripData.travelers.toString(),
      ...(tripData.budget && { budget: tripData.budget.toString() })
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const url = `${API_URL}/api/automation/search-hotels?${params}`;

    console.log('🚀 بدء الاتصال بـ SSE:', url);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: AutomationProgress = JSON.parse(event.data);
        console.log('📨 رسالة SSE:', data.type, data);

        switch (data.type) {
          case 'init':
            setCurrentAction(data.data?.message || 'جاري التهيئة...');
            break;

          case 'action':
            // إضافة إجراء جديد للجدول الزمني
            const newAction: ActionLogEntry = {
              id: Date.now(),
              description: formatActionArabic(data.data?.action, data.data?.args),
              timestamp: data.timestamp,
              status: 'completed'
            };
            
            setActions(prev => [...prev, newAction]);
            setCurrentAction(newAction.description);
            
            // تحديث التقدم
            setProgress(prev => Math.min(prev + (100 / totalSteps), 95));
            break;

          case 'screenshot':
            if (data.data?.screenshot) {
              setScreenshot(data.data.screenshot);
            }
            break;

          case 'discovery':
            // عند اكتشاف فندق جديد
            if (data.data?.hotel) {
              setDiscoveredHotels(prev => [...prev, data.data!.hotel!]);
            }
            break;

          case 'complete':
            setPhase('complete');
            setProgress(100);
            setCurrentAction('اكتمل البحث! 🎉');
            eventSource.close();
            break;

          case 'finished':
            setPhase('complete');
            setProgress(100);
            eventSource.close();
            break;

          case 'error':
            setPhase('error');
            setError(data.data?.error || 'حدث خطأ غير متوقع');
            setProgress(0);
            eventSource.close();
            break;
        }
      } catch (err) {
        console.error('❌ خطأ في تحليل بيانات SSE:', err);
        setError('خطأ في معالجة البيانات من الخادم');
      }
    };

    eventSource.onerror = (err) => {
      console.error('❌ خطأ في اتصال SSE:', err);
      setPhase('error');
      setError('فقدنا الاتصال بخادم الأتمتة. يرجى المحاولة مرة أخرى.');
      eventSource.close();
    };

    eventSource.onopen = () => {
      console.log('✅ اتصال SSE مفتوح');
    };

    // التنظيف عند إلغاء التثبيت
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [shouldStart, tripData]);

  const stop = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setPhase('idle');
      console.log('⏸️ تم إيقاف الأتمتة');
    }
  };

  const reset = () => {
    stop();
    setPhase('idle');
    setCurrentAction('');
    setProgress(0);
    setScreenshot('');
    setActions([]);
    setDiscoveredHotels([]);
    setError(null);
    setStartTime(null);
  };

  return {
    phase,
    currentAction,
    progress,
    screenshot,
    actions,
    discoveredHotels,
    error,
    startTime,
    stop,
    reset
  };
}

// ===== دالة مساعدة لتحويل الإجراءات للعربية =====
function formatActionArabic(action?: string, args?: Record<string, any>): string {
  if (!action) return 'جاري تنفيذ إجراء...';

  const translations: Record<string, (args?: any) => string> = {
    click: (args) => `النقر على الإحداثيات (${args?.x || 0}, ${args?.y || 0})`,
    type: (args) => `الكتابة: "${args?.text || ''}"`,
    key: (args) => `الضغط على: ${args?.keyName || 'مفتاح'}`,
    scroll_down: () => 'التمرير للأسفل',
    scroll_up: () => 'التمرير للأعلى',
    cursor_position: (args) => `تحريك المؤشر إلى (${args?.x || 0}, ${args?.y || 0})`,
    done: () => 'اكتمل الإجراء ✅'
  };

  const formatter = translations[action];
  return formatter ? formatter(args) : `تنفيذ: ${action}`;
}

