# 📋 Cursor Tasks - Integrated Amrikyy Experience

**Priority:** 🟡 **Important**  
**Estimated Time:** 60 minutes  
**Files:** `frontend/src/components/IntegratedAmrikyyExperience.tsx`

---

## ✅ What's Already Done

- ✅ Beautiful UI/UX design (10/10)
- ✅ Multi-view navigation (home, predictions, automation)
- ✅ Smooth animations with Framer Motion
- ✅ Prediction cards with reasoning
- ✅ Emotional state indicator
- ✅ Persona badge
- ✅ Social proof integration

---

## 📋 Tasks to Execute

### **Task 1: Add State Management (Zustand)** (15 min)

Create: `frontend/src/stores/amrikyyStore.ts`

```typescript
import { create } from 'zustand';

interface Prediction {
  id: number;
  destination: string;
  checkIn: string;
  checkOut: string;
  budgetRange: [number, number];
  confidence: number;
  reasoning: string[];
  aiScore: number;
  status: 'active' | 'accepted' | 'dismissed';
}

interface Persona {
  type: string;
  confidence: number;
  traits: string[];
}

interface AmrikyyState {
  // State
  currentView: 'home' | 'predictions' | 'automation' | 'results';
  emotionalState: string;
  predictions: Prediction[];
  userPersona: Persona | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentView: (view: string) => void;
  setEmotionalState: (state: string) => void;
  setPredictions: (predictions: Prediction[]) => void;
  setUserPersona: (persona: Persona | null) => void;

  // API calls
  fetchUserData: () => Promise<void>;
  acceptPrediction: (id: number) => Promise<void>;
}

export const useAmrikyyStore = create<AmrikyyState>((set, get) => ({
  currentView: 'home',
  emotionalState: 'محايد',
  predictions: [],
  userPersona: null,
  isLoading: false,
  error: null,

  setCurrentView: (view) => set({ currentView: view as any }),
  setEmotionalState: (state) => set({ emotionalState: state }),
  setPredictions: (predictions) => set({ predictions }),
  setUserPersona: (persona) => set({ userPersona: persona }),

  fetchUserData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [persona, predictions, emotional] = await Promise.all([
        fetch('/api/user/persona').then((r) => r.json()),
        fetch('/api/predictions').then((r) => r.json()),
        fetch('/api/user/emotional-state').then((r) => r.json()),
      ]);

      set({
        userPersona: persona,
        predictions: predictions,
        emotionalState: emotional.state,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  acceptPrediction: async (id) => {
    try {
      await fetch(`/api/predictions/${id}/accept`, { method: 'POST' });
      set({ currentView: 'automation' });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
```

Then update `IntegratedAmrikyyExperience.tsx`:

```typescript
import { useAmrikyyStore } from '@/stores/amrikyyStore';

export default function IntegratedAmrikyyExperience() {
  const {
    currentView,
    predictions,
    userPersona,
    emotionalState,
    isLoading,
    error,
    setCurrentView,
    fetchUserData,
  } = useAmrikyyStore();

  useEffect(() => {
    fetchUserData(); // Fetch real data from API
  }, [fetchUserData]);

  // ... rest of component
}
```

---

### **Task 2: Create API Client** (10 min)

Create: `frontend/src/api/amrikyy.ts`

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Prediction {
  id: number;
  destination: string;
  checkIn: string;
  checkOut: string;
  budgetRange: [number, number];
  confidence: number;
  reasoning: string[];
  aiScore: number;
  status: 'active' | 'accepted' | 'dismissed';
}

export interface Persona {
  type: string;
  confidence: number;
  traits: string[];
}

export const amrikyyAPI = {
  async getUserPersona(): Promise<Persona> {
    const response = await fetch(`${API_BASE}/api/user/persona`);
    if (!response.ok) throw new Error('Failed to fetch persona');
    return response.json();
  },

  async getPredictions(): Promise<Prediction[]> {
    const response = await fetch(`${API_BASE}/api/predictions`);
    if (!response.ok) throw new Error('Failed to fetch predictions');
    return response.json();
  },

  async getEmotionalState(): Promise<{ state: string }> {
    const response = await fetch(`${API_BASE}/api/user/emotional-state`);
    if (!response.ok) throw new Error('Failed to fetch emotional state');
    return response.json();
  },

  async acceptPrediction(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/predictions/${id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to accept prediction');
  },

  async dismissPrediction(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/predictions/${id}/dismiss`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to dismiss prediction');
  },
};
```

---

### **Task 3: Add Loading/Error States** (10 min)

Update `IntegratedAmrikyyExperience.tsx`:

```typescript
// Loading state
if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Brain className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        </motion.div>
        <p className="text-white text-xl">جاري تحميل تجربتك الشخصية...</p>
        <p className="text-gray-400 text-sm mt-2">نحلل أنماطك ونجهز توصياتك</p>
      </motion.div>
    </div>
  );
}

// Error state
if (error) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center"
      >
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">حدث خطأ</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => fetchUserData()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all"
        >
          حاول مرة أخرى
        </button>
      </motion.div>
    </div>
  );
}
```

---

### **Task 4: Add Analytics Tracking** (10 min)

Create: `frontend/src/utils/analytics.ts`

```typescript
export const trackEvent = (event: string, data?: any) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', event, data);
  }

  // Backend analytics
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      data,
      timestamp: Date.now(),
      page: window.location.pathname,
    }),
  }).catch((err) => console.error('Analytics error:', err));
};

// Pre-defined events
export const analytics = {
  viewPrediction: (predictionId: number, destination: string) => {
    trackEvent('prediction_viewed', { predictionId, destination });
  },

  acceptPrediction: (predictionId: number, confidence: number) => {
    trackEvent('prediction_accepted', { predictionId, confidence });
  },

  dismissPrediction: (predictionId: number, reason?: string) => {
    trackEvent('prediction_dismissed', { predictionId, reason });
  },

  navigateTo: (view: string) => {
    trackEvent('page_view', { view });
  },
};
```

Usage in component:

```typescript
import { analytics } from '@/utils/analytics';

const onAccept = (prediction: Prediction) => {
  analytics.acceptPrediction(prediction.id, prediction.confidence);
  acceptPrediction(prediction.id);
};

const onNavigate = (view: string) => {
  analytics.navigateTo(view);
  setCurrentView(view);
};
```

---

### **Task 5: Split Component** (15 min)

Create component folder:

```
frontend/src/components/amrikyy/
├── IntegratedAmrikyyExperience.tsx (main, 100 lines)
├── pages/
│   ├── HomePage.tsx (150 lines)
│   └── PredictionsPage.tsx (100 lines)
├── components/
│   ├── EmotionalIndicatorBadge.tsx
│   ├── PersonaBadge.tsx
│   ├── FeatureCard.tsx
│   ├── PredictionCard.tsx
│   └── StatCard.tsx
└── types.ts
```

---

## ✅ Success Criteria

- [ ] Zustand store created and working
- [ ] API client created with all methods
- [ ] Loading state shows on initial load
- [ ] Error state handles failures gracefully
- [ ] Analytics tracking on all user actions
- [ ] Component split into smaller files (< 150 lines each)
- [ ] Real API integration (not mock data)
- [ ] TypeScript types complete

---

## 📊 Before vs After

| Feature              | Before               | After                 |
| -------------------- | -------------------- | --------------------- |
| **State Management** | useState (scattered) | Zustand (centralized) |
| **Data**             | Mock (hardcoded)     | Real API calls        |
| **Error Handling**   | None                 | Complete with UI      |
| **Loading State**    | None                 | Beautiful skeleton    |
| **Analytics**        | None                 | Full tracking         |
| **Component Size**   | 615 lines            | < 150 lines each      |
| **TypeScript**       | Partial              | Complete types        |

---

## 🎯 Expected Impact

- **Maintainability:** +200% (centralized state + split components)
- **User Experience:** +30% (loading states + error handling)
- **Data Insights:** +∞ (analytics from 0 to complete)
- **Type Safety:** +100% (complete TypeScript coverage)

---

**Status:** Needs refactoring for production! 🔧
