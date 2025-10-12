// ===== Types & Interfaces للأتمتة =====

export interface TripSearchData {
  destination: string;
  checkIn: string;
  checkOut: string;
  travelers: number;
  budget?: number;
  preferences?: string[];
}

export interface AutomationProgress {
  type:
    | 'init'
    | 'action'
    | 'screenshot'
    | 'discovery'
    | 'complete'
    | 'error'
    | 'finished';
  timestamp: string;
  data?: {
    message?: string;
    action?: string;
    args?: Record<string, any>;
    screenshot?: string;
    url?: string;
    error?: string;
    summary?: string;
    hotel?: HotelDiscovery;
  };
}

export interface ActionLogEntry {
  id: string | number;
  description: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'running';
  screenshot?: string;
}

export interface HotelDiscovery {
  id: number;
  name: string;
  rating: number;
  price: number;
  aiScore: number;
  image?: string;
  highlights?: string[];
  url?: string;
  location?: string;
  amenities?: string[];
}

export interface AutomationState {
  phase: 'idle' | 'running' | 'complete' | 'error';
  currentAction: string;
  progress: number;
  screenshot: string;
  actions: ActionLogEntry[];
  discoveredHotels: HotelDiscovery[];
  error: string | null;
  startTime: number | null;
  duration: number | null;
}

export interface EmotionalState {
  emotion: 'متحمس' | 'متوتر' | 'مرتبك' | 'محايد';
  confidence: number;
  detectedAt: string;
}

export interface AutomationResult {
  success: boolean;
  duration: number;
  screenshots: string[];
  actions: ActionLogEntry[];
  hotels: HotelDiscovery[];
  error?: string;
  cost?: {
    input: number;
    output: number;
    total: number;
  };
}
