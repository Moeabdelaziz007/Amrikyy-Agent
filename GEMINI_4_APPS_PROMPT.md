# 🎨 Gemini 2.5 Pro - 4 Mini Apps Generation Prompt
## Amrikyy AI OS - Complete Travel Intelligence Platform

---

## 🎯 PROJECT OVERVIEW

Build 4 production-ready Mini Apps for **Amrikyy AI OS** using Google AI tools:

1. **Content Creator** 🎨 - AI content generation (NotebookLM, YouTube, Veo 3, Imagen 3)
2. **Smart Notes** 📝 - Intelligent note-taking with AI
3. **Travel Assistant** ✈️ - Complete travel planning
4. **Guide** 🗺️ - Real-time travel companion (Google Maps)

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion

---

## 📱 APP 1: CONTENT CREATOR 🎨

### **Purpose**
AI-powered content creation using Google's latest tools

### **Core Features**
1. **Video Generation** (Veo 3)
   - Create travel videos from text prompts
   - Generate destination showcases
   - Produce marketing content

2. **Image Generation** (Imagen 3)
   - Create travel posters
   - Generate destination images
   - Design social media content

3. **Content Writing** (NotebookLM)
   - Blog post generation
   - Travel guides
   - Social media captions

4. **YouTube Integration**
   - Analyze travel videos
   - Extract insights
   - Generate video scripts

### **UI Components**
```typescript
// frontend/src/pages/ContentCreatorApp.tsx
interface ContentCreatorProps {
  language: 'en' | 'ar';
}

const ContentCreatorApp = ({ language }: ContentCreatorProps) => {
  const [contentType, setContentType] = useState<'video' | 'image' | 'text'>('video');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Content type selector */}
      {/* Prompt input */}
      {/* Generation controls */}
      {/* Preview area */}
      {/* Export options */}
    </div>
  );
};
```

### **Backend API**
```javascript
// backend/routes/content-creator.js
router.post('/generate-video', async (req, res) => {
  const { prompt, duration, style } = req.body;
  // Veo 3 integration
  const video = await veo3.generateVideo(prompt, { duration, style });
  res.json({ videoUrl: video.url });
});

router.post('/generate-image', async (req, res) => {
  const { prompt, size, style } = req.body;
  // Imagen 3 integration
  const image = await imagen3.generateImage(prompt, { size, style });
  res.json({ imageUrl: image.url });
});

router.post('/generate-text', async (req, res) => {
  const { topic, type, language } = req.body;
  // NotebookLM integration
  const content = await notebookLM.generateContent(topic, { type, language });
  res.json({ content });
});
```

### **Design**
- **Icon**: 🎨 Palette
- **Colors**: Purple-500 → Pink-600 gradient
- **Avatar**: Creative artist with digital tools

---

## 📱 APP 2: SMART NOTES 📝

### **Purpose**
Intelligent note-taking with AI-powered organization and insights

### **Core Features**
1. **AI Note Enhancement**
   - Auto-summarization
   - Key points extraction
   - Smart tagging

2. **Voice to Text**
   - Record voice notes
   - Auto-transcription
   - Multi-language support

3. **Smart Organization**
   - Auto-categorization
   - Related notes linking
   - Search with AI

4. **Collaboration**
   - Share notes
   - Real-time editing
   - Comments and annotations

### **UI Components**
```typescript
// frontend/src/pages/SmartNotesApp.tsx
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  summary?: string;
}

const SmartNotesApp = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  return (
    <div className="flex h-screen">
      {/* Sidebar with notes list */}
      {/* Main editor area */}
      {/* AI suggestions panel */}
    </div>
  );
};
```

### **Backend API**
```javascript
// backend/routes/smart-notes.js
router.post('/notes', async (req, res) => {
  const { title, content, userId } = req.body;
  // AI enhancement
  const enhanced = await gemini.enhanceNote(content);
  const note = await db.notes.create({
    title,
    content,
    summary: enhanced.summary,
    tags: enhanced.tags,
    userId
  });
  res.json(note);
});

router.post('/notes/:id/transcribe', async (req, res) => {
  const { audioFile } = req.body;
  // Speech to text
  const text = await googleSpeech.transcribe(audioFile);
  res.json({ text });
});
```

### **Design**
- **Icon**: 📝 Notepad with sparkles
- **Colors**: Blue-500 → Cyan-600 gradient
- **Avatar**: Smart owl with notebook

---

## 📱 APP 3: TRAVEL ASSISTANT ✈️

### **Purpose**
Complete AI-powered travel planning and booking

### **Core Features**
1. **Trip Planning**
   - Destination recommendations
   - Itinerary generation
   - Budget optimization

2. **Booking Integration**
   - Flight search
   - Hotel booking
   - Activity reservations

3. **Smart Recommendations**
   - Personalized suggestions
   - Weather-based planning
   - Local insights

4. **Travel Documents**
   - Visa requirements
   - Packing lists
   - Travel insurance

### **UI Components**
```typescript
// frontend/src/pages/TravelAssistantApp.tsx
interface Trip {
  destination: string;
  dates: { start: Date; end: Date };
  budget: number;
  travelers: number;
  preferences: string[];
}

const TravelAssistantApp = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Trip planner form */}
      {/* Itinerary timeline */}
      {/* Recommendations grid */}
      {/* Booking options */}
    </div>
  );
};
```

### **Backend API**
```javascript
// backend/routes/travel-assistant.js
router.post('/plan-trip', async (req, res) => {
  const { destination, dates, budget, preferences } = req.body;
  // AI trip planning
  const plan = await gemini.planTrip({
    destination,
    dates,
    budget,
    preferences
  });
  res.json(plan);
});

router.get('/recommendations', async (req, res) => {
  const { destination, interests } = req.query;
  // AI recommendations
  const recommendations = await gemini.getRecommendations(destination, interests);
  res.json(recommendations);
});
```

### **Design**
- **Icon**: ✈️ Airplane
- **Colors**: Green-500 → Emerald-600 gradient
- **Avatar**: Friendly travel guide

---

## 📱 APP 4: GUIDE (المرشد) 🗺️

### **Purpose**
Real-time travel companion with Google Maps integration

### **Core Features**
1. **Interactive Maps** (Google Maps API)
   - Real-time location
   - Route planning
   - Nearby places

2. **Voice Navigation**
   - Turn-by-turn directions
   - Audio guidance
   - Multi-language support

3. **Local Discovery**
   - Restaurants nearby
   - Attractions
   - Emergency services

4. **Offline Mode**
   - Download maps
   - Cached directions
   - Saved places

### **UI Components**
```typescript
// frontend/src/pages/GuideApp.tsx
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

interface Location {
  lat: number;
  lng: number;
  name: string;
  type: string;
}

const GuideApp = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [route, setRoute] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Location[]>([]);
  
  return (
    <div className="h-screen flex flex-col">
      {/* Search bar */}
      <div className="flex-1">
        <GoogleMap
          center={currentLocation}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        >
          {currentLocation && <Marker position={currentLocation} />}
          {destination && <Marker position={destination} />}
          {route && <DirectionsRenderer directions={route} />}
        </GoogleMap>
      </div>
      {/* Bottom sheet with nearby places */}
    </div>
  );
};
```

### **Backend API**
```javascript
// backend/routes/guide.js
router.post('/directions', async (req, res) => {
  const { origin, destination, mode } = req.body;
  // Google Directions API
  const directions = await googleMaps.getDirections(origin, destination, mode);
  res.json(directions);
});

router.get('/nearby', async (req, res) => {
  const { lat, lng, type, radius } = req.query;
  // Google Places API
  const places = await googleMaps.getNearbyPlaces({ lat, lng }, type, radius);
  res.json(places);
});

router.post('/voice-guidance', async (req, res) => {
  const { instruction, language } = req.body;
  // Text to Speech
  const audio = await googleTTS.synthesize(instruction, language);
  res.json({ audioUrl: audio.url });
});
```

### **Design**
- **Icon**: 🗺️ Map with location pin
- **Colors**: Teal-500 → Blue-600 gradient
- **Avatar**: Compass with AI glow

---

## 🌍 INTERNATIONALIZATION

```javascript
// frontend/src/lib/i18n.ts
export const translations = {
  contentCreator: {
    en: {
      title: 'Content Creator',
      subtitle: 'AI-Powered Content Generation',
      generateVideo: 'Generate Video',
      generateImage: 'Generate Image',
      generateText: 'Generate Text'
    },
    ar: {
      title: 'منشئ المحتوى',
      subtitle: 'إنشاء المحتوى بالذكاء الاصطناعي',
      generateVideo: 'إنشاء فيديو',
      generateImage: 'إنشاء صورة',
      generateText: 'إنشاء نص'
    }
  },
  smartNotes: {
    en: {
      title: 'Smart Notes',
      subtitle: 'Intelligent Note-Taking',
      newNote: 'New Note',
      record: 'Record Voice',
      enhance: 'Enhance with AI'
    },
    ar: {
      title: 'ملاحظات ذكية',
      subtitle: 'تدوين ملاحظات ذكي',
      newNote: 'ملاحظة جديدة',
      record: 'تسجيل صوتي',
      enhance: 'تحسين بالذكاء الاصطناعي'
    }
  },
  travelAssistant: {
    en: {
      title: 'Travel Assistant',
      subtitle: 'AI Travel Planning',
      planTrip: 'Plan Trip',
      getRecommendations: 'Get Recommendations',
      bookNow: 'Book Now'
    },
    ar: {
      title: 'مساعد السفر',
      subtitle: 'تخطيط السفر بالذكاء الاصطناعي',
      planTrip: 'خطط رحلة',
      getRecommendations: 'احصل على توصيات',
      bookNow: 'احجز الآن'
    }
  },
  guide: {
    en: {
      title: 'Guide',
      subtitle: 'Real-Time Travel Companion',
      navigate: 'Navigate',
      nearby: 'Nearby Places',
      voiceGuidance: 'Voice Guidance'
    },
    ar: {
      title: 'المرشد',
      subtitle: 'مرافق السفر الحي',
      navigate: 'التنقل',
      nearby: 'الأماكن القريبة',
      voiceGuidance: 'الإرشاد الصوتي'
    }
  }
};
```

---

## 🚀 GOOGLE AI TOOLS INTEGRATION

### **1. Veo 3 (Video Generation)**
```javascript
// backend/src/services/Veo3Service.js
const { GoogleAIStudio } = require('@google/generative-ai');

class Veo3Service {
  async generateVideo(prompt, options = {}) {
    const { duration = 30, style = 'cinematic', resolution = '1080p' } = options;
    
    // Veo 3 API call
    const video = await this.veo3.generate({
      prompt,
      duration,
      style,
      resolution
    });
    
    return {
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration
    };
  }
}
```

### **2. Imagen 3 (Image Generation)**
```javascript
// backend/src/services/Imagen3Service.js
class Imagen3Service {
  async generateImage(prompt, options = {}) {
    const { size = '1024x1024', style = 'photorealistic' } = options;
    
    // Imagen 3 API call
    const image = await this.imagen3.generate({
      prompt,
      size,
      style
    });
    
    return {
      url: image.url,
      width: image.width,
      height: image.height
    };
  }
}
```

### **3. NotebookLM (Content Generation)**
```javascript
// backend/src/services/NotebookLMService.js
class NotebookLMService {
  async generateContent(topic, options = {}) {
    const { type = 'blog', language = 'en', length = 'medium' } = options;
    
    // NotebookLM API call
    const content = await this.notebookLM.generate({
      topic,
      type,
      language,
      length
    });
    
    return {
      title: content.title,
      body: content.body,
      summary: content.summary,
      keywords: content.keywords
    };
  }
}
```

### **4. Google Maps API**
```javascript
// backend/src/services/GoogleMapsService.js
class GoogleMapsService {
  async getDirections(origin, destination, mode = 'driving') {
    const response = await this.mapsClient.directions({
      params: {
        origin,
        destination,
        mode,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    
    return response.data.routes[0];
  }
  
  async getNearbyPlaces(location, type, radius = 1000) {
    const response = await this.placesClient.nearbySearch({
      params: {
        location,
        type,
        radius,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    
    return response.data.results;
  }
}
```

---

## 📦 DEPLOYMENT CHECKLIST

### **Phase 1: Backend Services**
- [ ] Create Veo3Service.js
- [ ] Create Imagen3Service.js
- [ ] Create NotebookLMService.js
- [ ] Create GoogleMapsService.js
- [ ] Add API routes for all 4 apps
- [ ] Configure environment variables

### **Phase 2: Frontend Components**
- [ ] Create ContentCreatorApp.tsx
- [ ] Create SmartNotesApp.tsx
- [ ] Create TravelAssistantApp.tsx
- [ ] Create GuideApp.tsx
- [ ] Add i18n support
- [ ] Implement responsive design

### **Phase 3: Integration**
- [ ] Connect frontend to backend APIs
- [ ] Test all Google AI tools
- [ ] Verify language switching
- [ ] Test on mobile devices

### **Phase 4: Polish**
- [ ] Add loading states
- [ ] Error handling
- [ ] Performance optimization
- [ ] Accessibility (a11y)

---

## 🎯 SUCCESS METRICS

- **Content Creator**: Generate 100+ pieces of content/day
- **Smart Notes**: 1000+ notes created
- **Travel Assistant**: 500+ trips planned
- **Guide**: 10,000+ navigation requests

---

## 🎨 THEME SYSTEM

### **Theme Requirements**
Create a comprehensive theme system with multiple color schemes for all 4 apps.

### **Theme Structure**
```typescript
// frontend/src/lib/themes.ts
export interface Theme {
  id: string;
  name: string;
  nameAr: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    gradient: string;
  };
  mode: 'light' | 'dark';
}

export const themes: Theme[] = [
  // Light Themes
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    nameAr: 'نسيم المحيط',
    colors: {
      primary: '#0ea5e9', // sky-500
      secondary: '#06b6d4', // cyan-500
      accent: '#14b8a6', // teal-500
      background: '#f0f9ff', // sky-50
      surface: '#ffffff',
      text: '#0c4a6e', // sky-900
      textSecondary: '#075985', // sky-800
      border: '#bae6fd', // sky-200
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
    },
    mode: 'light'
  },
  {
    id: 'sunset',
    name: 'Desert Sunset',
    nameAr: 'غروب الصحراء',
    colors: {
      primary: '#f97316', // orange-500
      secondary: '#fb923c', // orange-400
      accent: '#fbbf24', // amber-400
      background: '#fff7ed', // orange-50
      surface: '#ffffff',
      text: '#7c2d12', // orange-900
      textSecondary: '#9a3412', // orange-800
      border: '#fed7aa', // orange-200
      gradient: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)'
    },
    mode: 'light'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    nameAr: 'الغابة الخضراء',
    colors: {
      primary: '#10b981', // emerald-500
      secondary: '#34d399', // emerald-400
      accent: '#22c55e', // green-500
      background: '#ecfdf5', // emerald-50
      surface: '#ffffff',
      text: '#064e3b', // emerald-900
      textSecondary: '#065f46', // emerald-800
      border: '#a7f3d0', // emerald-200
      gradient: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)'
    },
    mode: 'light'
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    nameAr: 'حلم اللافندر',
    colors: {
      primary: '#a855f7', // purple-500
      secondary: '#c084fc', // purple-400
      accent: '#d946ef', // fuchsia-500
      background: '#faf5ff', // purple-50
      surface: '#ffffff',
      text: '#581c87', // purple-900
      textSecondary: '#6b21a8', // purple-800
      border: '#e9d5ff', // purple-200
      gradient: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
    },
    mode: 'light'
  },
  
  // Dark Themes
  {
    id: 'midnight',
    name: 'Midnight Blue',
    nameAr: 'أزرق منتصف الليل',
    colors: {
      primary: '#3b82f6', // blue-500
      secondary: '#60a5fa', // blue-400
      accent: '#06b6d4', // cyan-500
      background: '#0f172a', // slate-900
      surface: '#1e293b', // slate-800
      text: '#f1f5f9', // slate-100
      textSecondary: '#cbd5e1', // slate-300
      border: '#334155', // slate-700
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
    },
    mode: 'dark'
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    nameAr: 'ليالي النيون',
    colors: {
      primary: '#ec4899', // pink-500
      secondary: '#f472b6', // pink-400
      accent: '#a855f7', // purple-500
      background: '#18181b', // zinc-900
      surface: '#27272a', // zinc-800
      text: '#fafafa', // zinc-50
      textSecondary: '#d4d4d8', // zinc-300
      border: '#3f3f46', // zinc-700
      gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
    },
    mode: 'dark'
  },
  {
    id: 'emerald-dark',
    name: 'Emerald Night',
    nameAr: 'ليلة الزمرد',
    colors: {
      primary: '#10b981', // emerald-500
      secondary: '#34d399', // emerald-400
      accent: '#14b8a6', // teal-500
      background: '#0c1713', // custom dark green
      surface: '#1a2e23', // custom dark green
      text: '#d1fae5', // emerald-100
      textSecondary: '#a7f3d0', // emerald-200
      border: '#064e3b', // emerald-900
      gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
    },
    mode: 'dark'
  },
  {
    id: 'amber-dark',
    name: 'Amber Glow',
    nameAr: 'توهج العنبر',
    colors: {
      primary: '#f59e0b', // amber-500
      secondary: '#fbbf24', // amber-400
      accent: '#f97316', // orange-500
      background: '#1c1917', // stone-900
      surface: '#292524', // stone-800
      text: '#fef3c7', // amber-100
      textSecondary: '#fde68a', // amber-200
      border: '#78350f', // amber-900
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
    },
    mode: 'dark'
  }
];
```

### **Theme Provider**
```typescript
// frontend/src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes } from '../lib/themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedThemeId = localStorage.getItem('amrikyy-theme');
    if (savedThemeId) {
      const theme = themes.find(t => t.id === savedThemeId);
      if (theme) setCurrentTheme(theme);
    }
  }, []);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('amrikyy-theme', themeId);
      
      // Apply CSS variables
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### **Theme Selector Component**
```typescript
// frontend/src/components/ThemeSelector.tsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, Check } from 'lucide-react';

export const ThemeSelector: React.FC<{ language: 'en' | 'ar' }> = ({ language }) => {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:bg-opacity-80 transition-all"
      >
        <Palette className="w-5 h-5" />
        <span>{language === 'en' ? theme.name : theme.nameAr}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-surface border border-border rounded-lg shadow-xl p-4 z-50">
          <h3 className="font-semibold mb-3">
            {language === 'en' ? 'Choose Theme' : 'اختر المظهر'}
          </h3>
          
          <div className="space-y-2">
            {availableThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-background transition-all"
                style={{
                  background: theme.id === t.id ? t.colors.gradient : 'transparent',
                  color: theme.id === t.id ? '#ffffff' : 'inherit'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ background: t.colors.gradient }}
                  />
                  <span className="font-medium">
                    {language === 'en' ? t.name : t.nameAr}
                  </span>
                </div>
                {theme.id === t.id && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### **Using Themes in Apps**
```typescript
// Example: ContentCreatorApp.tsx with theme
import { useTheme } from '../contexts/ThemeContext';

const ContentCreatorApp = () => {
  const { theme } = useTheme();
  
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: theme.colors.background,
        color: theme.colors.text 
      }}
    >
      <div 
        className="p-6 rounded-xl"
        style={{ 
          background: theme.colors.gradient,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}
      >
        <h1 className="text-3xl font-bold text-white">Content Creator</h1>
      </div>
      
      {/* Rest of the app */}
    </div>
  );
};
```

### **Tailwind CSS Configuration**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-textSecondary)',
        border: 'var(--color-border)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--color-gradient)',
      }
    }
  }
};
```

### **Theme Animations**
```typescript
// frontend/src/components/ThemeTransition.tsx
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={theme.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
```

### **Theme Presets for Each App**
```typescript
// Recommended themes per app
export const appThemePresets = {
  contentCreator: ['lavender', 'neon', 'sunset'],
  smartNotes: ['ocean', 'midnight', 'forest'],
  travelAssistant: ['ocean', 'sunset', 'emerald-dark'],
  guide: ['forest', 'emerald-dark', 'ocean']
};
```

---

## 🚀 YOUR MISSION, GEMINI 2.5 PRO

Build these 4 apps with:
- ✅ Beautiful, modern UI
- ✅ Full Google AI tools integration
- ✅ English/Arabic support
- ✅ Production-ready code
- ✅ Responsive design
- ✅ **8 Complete Themes** (4 Light + 4 Dark)
- ✅ **Smooth Theme Transitions** with Framer Motion
- ✅ **Theme Persistence** with localStorage
- ✅ **Per-App Theme Recommendations**

**Make it legendary! 🌟**
