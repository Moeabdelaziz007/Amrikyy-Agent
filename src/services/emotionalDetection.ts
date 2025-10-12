// ===== خدمة الكشف العاطفي =====

import type { EmotionalState } from '../types/automation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * كشف عاطفة المستخدم من رسائله
 */
export async function detectUserEmotion(
  conversationHistory: string[]
): Promise<EmotionalState> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/detect-emotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    return {
      emotion: data.emotion || 'محايد',
      confidence: data.confidence || 0.5,
      detectedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ فشل الكشف العاطفي:', error);
    
    // الرجوع إلى كشف بسيط محلي
    return detectEmotionLocally(conversationHistory);
  }
}

/**
 * كشف عاطفي بسيط محلي (fallback)
 */
function detectEmotionLocally(messages: string[]): EmotionalState {
  if (messages.length === 0) {
    return {
      emotion: 'محايد',
      confidence: 1,
      detectedAt: new Date().toISOString()
    };
  }

  const lastMessages = messages.slice(-5).join(' ').toLowerCase();
  
  // كلمات تدل على الحماس
  const excitementWords = ['رائع', 'ممتاز', 'مذهل', 'حماس', '!', 'يا له', 'أحب', 'سعيد'];
  const excitementCount = excitementWords.filter(word => lastMessages.includes(word)).length;
  
  // كلمات تدل على التوتر
  const stressWords = ['سريع', 'عاجل', 'مستعجل', 'ضروري', 'الآن', 'فوراً', 'متأخر'];
  const stressCount = stressWords.filter(word => lastMessages.includes(word)).length;
  
  // كلمات تدل على الحيرة
  const confusionWords = ['؟', 'كيف', 'ماذا', 'لا أفهم', 'محتار', 'مرتبك', 'ساعدني'];
  const confusionCount = confusionWords.filter(word => lastMessages.includes(word)).length;

  // تحديد العاطفة السائدة
  const max = Math.max(excitementCount, stressCount, confusionCount);
  
  if (max === 0) {
    return {
      emotion: 'محايد',
      confidence: 0.7,
      detectedAt: new Date().toISOString()
    };
  }

  if (excitementCount === max) {
    return {
      emotion: 'متحمس',
      confidence: Math.min(excitementCount / 5, 0.9),
      detectedAt: new Date().toISOString()
    };
  }

  if (stressCount === max) {
    return {
      emotion: 'متوتر',
      confidence: Math.min(stressCount / 5, 0.9),
      detectedAt: new Date().toISOString()
    };
  }

  return {
    emotion: 'مرتبك',
    confidence: Math.min(confusionCount / 5, 0.9),
    detectedAt: new Date().toISOString()
  };
}

/**
 * الحصول على رسالة مناسبة للعاطفة
 */
export function getEmotionalMessage(emotion: EmotionalState['emotion']): string {
  const messages = {
    'متحمس': 'أشعر بحماسك! دعني أجد لك أفضل الأماكن!',
    'متوتر': 'لا تقلق، سأتعامل مع كل شيء بسرعة',
    'مرتبك': 'دعني أرشدك خطوة بخطوة',
    'محايد': 'جاهز لمساعدتك'
  };

  return messages[emotion] || messages['محايد'];
}

/**
 * الحصول على لون مناسب للعاطفة
 */
export function getEmotionalColor(emotion: EmotionalState['emotion']): {
  gradient: string;
  icon: string;
} {
  const colors = {
    'متحمس': {
      gradient: 'from-yellow-500 to-orange-500',
      icon: '🎉'
    },
    'متوتر': {
      gradient: 'from-blue-500 to-cyan-500',
      icon: '😌'
    },
    'مرتبك': {
      gradient: 'from-purple-500 to-pink-500',
      icon: '🤝'
    },
    'محايد': {
      gradient: 'from-gray-500 to-gray-600',
      icon: '🤖'
    }
  };

  return colors[emotion] || colors['محايد'];
}

/**
 * تخزين مؤقت للحالة العاطفية
 */
const emotionalCache = new Map<string, EmotionalState>();

export function cacheEmotionalState(userId: string, state: EmotionalState) {
  emotionalCache.set(userId, state);
}

export function getCachedEmotionalState(userId: string): EmotionalState | null {
  const cached = emotionalCache.get(userId);
  
  if (!cached) return null;
  
  // انتهاء صلاحية الذاكرة المؤقتة بعد 5 دقائق
  const age = Date.now() - new Date(cached.detectedAt).getTime();
  if (age > 5 * 60 * 1000) {
    emotionalCache.delete(userId);
    return null;
  }
  
  return cached;
}

