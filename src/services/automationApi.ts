// ===== خدمة الاتصال بـ API الأتمتة =====

import type { TripSearchData, AutomationProgress } from '../types/automation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class AutomationAPI {
  /**
   * بدء البحث عن الفنادق مع SSE
   */
  static startHotelSearch(
    tripData: TripSearchData,
    onProgress: (progress: AutomationProgress) => void,
    onError: (error: Error) => void
  ): EventSource {
    const params = new URLSearchParams({
      destination: tripData.destination,
      checkIn: tripData.checkIn,
      checkOut: tripData.checkOut,
      travelers: tripData.travelers.toString(),
      ...(tripData.budget && { budget: tripData.budget.toString() }),
    });

    const url = `${API_BASE_URL}/api/automation/search-hotels?${params}`;
    console.log('🔗 الاتصال بـ:', url);

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const progress: AutomationProgress = JSON.parse(event.data);
        onProgress(progress);

        // إغلاق الاتصال عند الانتهاء
        if (progress.type === 'finished' || progress.type === 'complete') {
          eventSource.close();
        }
      } catch (error) {
        console.error('❌ فشل تحليل رسالة SSE:', error);
        onError(new Error('فشل تحليل البيانات من الخادم'));
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ خطأ في اتصال SSE:', error);
      eventSource.close();
      onError(new Error('فقدنا الاتصال بخدمة الأتمتة'));
    };

    return eventSource;
  }

  /**
   * التحقق من حالة خدمة الأتمتة
   */
  static async checkStatus(): Promise<{
    available: boolean;
    model: string;
    version: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/automation/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ حالة خدمة الأتمتة:', data);
      return data;
    } catch (error) {
      console.error('❌ فشل التحقق من حالة الأتمتة:', error);
      return {
        available: false,
        model: 'unknown',
        version: 'unknown'
      };
    }
  }

  /**
   * إيقاف جلسة أتمتة نشطة
   */
  static async stopAutomation(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/automation/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      });

      return response.ok;
    } catch (error) {
      console.error('❌ فشل إيقاف الأتمتة:', error);
      return false;
    }
  }
}

// ===== دوال مساعدة =====

/**
 * التحقق من صحة بيانات الرحلة
 */
export function validateTripData(tripData: TripSearchData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!tripData.destination || tripData.destination.trim().length === 0) {
    errors.push('الوجهة مطلوبة');
  }

  if (!tripData.checkIn) {
    errors.push('تاريخ تسجيل الوصول مطلوب');
  }

  if (!tripData.checkOut) {
    errors.push('تاريخ تسجيل المغادرة مطلوب');
  }

  if (tripData.travelers < 1 || tripData.travelers > 20) {
    errors.push('عدد المسافرين يجب أن يكون بين 1 و 20');
  }

  if (tripData.budget && tripData.budget < 0) {
    errors.push('الميزانية يجب أن تكون رقم موجب');
  }

  // التحقق من أن تاريخ المغادرة بعد تاريخ الوصول
  const checkInDate = new Date(tripData.checkIn);
  const checkOutDate = new Date(tripData.checkOut);
  
  if (checkOutDate <= checkInDate) {
    errors.push('تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

