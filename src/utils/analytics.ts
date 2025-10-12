// ===== خدمة التحليلات والتتبع =====

interface AnalyticsEvent {
  event: string;
  category: string;
  data?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

/**
 * تتبع حدث في النظام
 */
export function trackAutomationEvent(
  event: string,
  data?: Record<string, any>,
  userId?: string
) {
  const eventData: AnalyticsEvent = {
    event,
    category: 'automation',
    data,
    timestamp: new Date().toISOString(),
    userId,
  };

  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, {
      event_category: 'automation',
      event_label: JSON.stringify(data),
      value: data?.duration || 0,
      user_id: userId,
    });
  }

  // Console log في التطوير
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', eventData);
  }

  // إرسال إلى Backend للتسجيل
  sendToBackend(eventData).catch((err) => {
    console.error('❌ فشل إرسال حدث التحليلات:', err);
  });
}

/**
 * إرسال الحدث إلى Backend
 */
async function sendToBackend(event: AnalyticsEvent) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  try {
    await fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    // فشل صامت - لا نريد تعطيل التطبيق بسبب التحليلات
    if (import.meta.env.DEV) {
      console.warn('⚠️ فشل إرسال التحليلات:', error);
    }
  }
}

// ===== أحداث محددة مسبقاً =====

/**
 * تتبع بدء الأتمتة
 */
export function trackAutomationStart(
  tripData: {
    destination: string;
    travelers: number;
    budget?: number;
  },
  userId?: string
) {
  trackAutomationEvent(
    'automation_started',
    {
      destination: tripData.destination,
      travelers: tripData.travelers,
      budget: tripData.budget,
      timestamp: Date.now(),
    },
    userId
  );
}

/**
 * تتبع إكمال الأتمتة
 */
export function trackAutomationComplete(
  data: {
    destination: string;
    hotelsFound: number;
    duration: number;
    actions: number;
  },
  userId?: string
) {
  trackAutomationEvent(
    'automation_completed',
    {
      ...data,
      avgTimePerAction: data.duration / data.actions,
    },
    userId
  );
}

/**
 * تتبع فشل الأتمتة
 */
export function trackAutomationError(
  data: {
    error: string;
    phase: string;
    duration: number;
  },
  userId?: string
) {
  trackAutomationEvent('automation_error', data, userId);
}

/**
 * تتبع اكتشاف فندق
 */
export function trackHotelDiscovery(
  data: {
    hotelName: string;
    price: number;
    aiScore: number;
    order: number;
  },
  userId?: string
) {
  trackAutomationEvent('hotel_discovered', data, userId);
}

/**
 * تتبع نقرة على فندق
 */
export function trackHotelClick(
  data: {
    hotelId: number;
    hotelName: string;
    price: number;
    source: 'discovery' | 'results';
  },
  userId?: string
) {
  trackAutomationEvent('hotel_clicked', data, userId);
}

/**
 * تتبع مشاركة نتيجة
 */
export function trackResultShare(
  data: {
    platform: 'telegram' | 'whatsapp' | 'email' | 'link';
    hotelsCount: number;
  },
  userId?: string
) {
  trackAutomationEvent('result_shared', data, userId);
}

/**
 * تتبع الحالة العاطفية المكتشفة
 */
export function trackEmotionalDetection(
  data: {
    emotion: string;
    confidence: number;
    adapted: boolean;
  },
  userId?: string
) {
  trackAutomationEvent('emotion_detected', data, userId);
}

/**
 * تتبع وقت المستخدم في الصفحة
 */
export function trackTimeOnPage(
  pageName: string,
  duration: number,
  userId?: string
) {
  trackAutomationEvent(
    'time_on_page',
    {
      page: pageName,
      duration,
      durationMinutes: Math.round(duration / 60000),
    },
    userId
  );
}

// ===== Performance Tracking =====

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
}

const performanceMetrics: PerformanceMetric[] = [];

export function recordPerformanceMetric(
  name: string,
  value: number,
  unit: 'ms' | 'bytes' | 'count' = 'ms'
) {
  performanceMetrics.push({ name, value, unit });

  if (import.meta.env.DEV) {
    console.log(`⚡ Performance: ${name} = ${value}${unit}`);
  }
}

export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...performanceMetrics];
}

export function clearPerformanceMetrics() {
  performanceMetrics.length = 0;
}

// ===== Session Tracking =====

let sessionStartTime: number | null = null;
let sessionId: string | null = null;

export function startSession() {
  sessionStartTime = Date.now();
  sessionId = generateSessionId();

  trackAutomationEvent('session_start', {
    sessionId,
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  });
}

export function endSession() {
  if (!sessionStartTime) return;

  const duration = Date.now() - sessionStartTime;

  trackAutomationEvent('session_end', {
    sessionId,
    duration,
    durationMinutes: Math.round(duration / 60000),
  });

  sessionStartTime = null;
  sessionId = null;
}

export function getSessionId(): string | null {
  return sessionId;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===== تهيئة تلقائية =====
if (typeof window !== 'undefined') {
  // بدء جلسة عند التحميل
  window.addEventListener('load', startSession);

  // إنهاء جلسة عند الخروج
  window.addEventListener('beforeunload', endSession);

  // تتبع الأخطاء غير المعالجة
  window.addEventListener('error', (event) => {
    trackAutomationEvent('unhandled_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}
