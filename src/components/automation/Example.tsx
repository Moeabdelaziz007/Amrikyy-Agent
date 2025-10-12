// ===== مثال على استخدام مكونات الأتمتة =====

import { useState } from 'react';
import { AutomationTheater } from './AutomationTheater';
import type { TripSearchData } from '../../types/automation';

/**
 * مثال 1: استخدام بسيط مع بيانات افتراضية
 */
export function SimpleAutomationExample() {
  return <AutomationTheater />;
}

/**
 * مثال 2: استخدام مع بيانات مخصصة
 */
export function CustomDataExample() {
  const tripData: TripSearchData = {
    destination: 'دبي',
    checkIn: '2025-11-15',
    checkOut: '2025-11-22',
    travelers: 4,
    budget: 300,
    preferences: ['فندق فاخر', 'إطلالة بحرية', 'مسبح'],
  };

  return <AutomationTheater tripData={tripData} userId="user_12345" />;
}

/**
 * مثال 3: استخدام مع معالج الإغلاق
 */
export function WithCloseHandlerExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        ابدأ البحث الذكي
      </button>

      {isOpen && (
        <AutomationTheater
          onClose={() => setIsOpen(false)}
          userId="user_67890"
        />
      )}
    </div>
  );
}

/**
 * مثال 4: استخدام داخل صفحة كاملة
 */
export function FullPageExample() {
  const [tripData, setTripData] = useState<TripSearchData>({
    destination: '',
    checkIn: '',
    checkOut: '',
    travelers: 1,
  });

  const [showAutomation, setShowAutomation] = useState(false);

  const handleSearch = () => {
    if (!tripData.destination || !tripData.checkIn || !tripData.checkOut) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setShowAutomation(true);
  };

  if (showAutomation) {
    return (
      <AutomationTheater
        tripData={tripData}
        onClose={() => setShowAutomation(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          ابحث عن فندقك المثالي
        </h1>

        <div className="space-y-4 bg-gray-800 p-6 rounded-2xl">
          <div>
            <label className="block text-white mb-2">الوجهة</label>
            <input
              type="text"
              value={tripData.destination}
              onChange={(e) =>
                setTripData({ ...tripData, destination: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
              placeholder="مثال: القاهرة"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">تسجيل الوصول</label>
              <input
                type="date"
                value={tripData.checkIn}
                onChange={(e) =>
                  setTripData({ ...tripData, checkIn: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-white mb-2">تسجيل المغادرة</label>
              <input
                type="date"
                value={tripData.checkOut}
                onChange={(e) =>
                  setTripData({ ...tripData, checkOut: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">عدد المسافرين</label>
            <input
              type="number"
              min="1"
              max="20"
              value={tripData.travelers}
              onChange={(e) =>
                setTripData({
                  ...tripData,
                  travelers: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              الميزانية لليلة (اختياري)
            </label>
            <input
              type="number"
              min="0"
              value={tripData.budget || ''}
              onChange={(e) =>
                setTripData({
                  ...tripData,
                  budget: parseInt(e.target.value) || undefined,
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
              placeholder="مثال: 150"
            />
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-lg font-bold transition-all"
          >
            🚀 ابدأ البحث الذكي
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * مثال 5: استخدام مع Context API
 */
import { createContext, useContext, ReactNode } from 'react';

interface AutomationContextType {
  userId: string;
  onComplete?: (hotels: any[]) => void;
}

const AutomationContext = createContext<AutomationContextType>({
  userId: 'guest',
});

export function AutomationProvider({
  children,
  userId,
  onComplete,
}: {
  children: ReactNode;
  userId: string;
  onComplete?: (hotels: any[]) => void;
}) {
  return (
    <AutomationContext.Provider value={{ userId, onComplete }}>
      {children}
    </AutomationContext.Provider>
  );
}

export function AutomationWithContext({
  tripData,
}: {
  tripData: TripSearchData;
}) {
  const { userId } = useContext(AutomationContext);

  return <AutomationTheater tripData={tripData} userId={userId} />;
}

/**
 * مثال 6: استخدام مع React Router
 */
import { useNavigate } from 'react-router-dom';

export function RoutedAutomationExample() {
  const navigate = useNavigate();

  return <AutomationTheater onClose={() => navigate('/dashboard')} />;
}

/**
 * مثال 7: استخدام مع localStorage للحفظ التلقائي
 */
export function AutoSaveExample() {
  const [tripData, setTripData] = useState<TripSearchData>(() => {
    const saved = localStorage.getItem('lastSearch');
    return saved
      ? JSON.parse(saved)
      : {
          destination: '',
          checkIn: '',
          checkOut: '',
          travelers: 1,
        };
  });

  const handleStart = () => {
    localStorage.setItem('lastSearch', JSON.stringify(tripData));
  };

  return (
    <div>
      {/* نموذج البحث هنا */}
      <button onClick={handleStart}>بحث</button>
      <AutomationTheater tripData={tripData} />
    </div>
  );
}

/**
 * مثال 8: استخدام مع Telegram Mini App
 */
export function TelegramMiniAppExample() {
  // التحقق من وجود Telegram WebApp
  const isTelegram =
    typeof window !== 'undefined' && (window as any).Telegram?.WebApp;

  const getUserId = () => {
    if (isTelegram) {
      return (
        window as any
      ).Telegram.WebApp.initDataUnsafe?.user?.id?.toString();
    }
    return undefined;
  };

  return (
    <AutomationTheater
      userId={getUserId()}
      onClose={() => {
        if (isTelegram) {
          (window as any).Telegram.WebApp.close();
        }
      }}
    />
  );
}
