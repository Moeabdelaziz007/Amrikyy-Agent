// Type definitions for AI OS Desktop

export enum AppType {
  TERMINAL = 'terminal',
  FILES = 'files',
  DASHBOARD = 'dashboard',
  NEWS = 'news',
  QUANTUM_TRAVEL = 'quantum_travel',
  DEBUGGER = 'debugger',
  AI_NOTES = 'ai_notes',
}

export type CustomerFormStep = 'overview' | 'address' | 'notes';

export enum AgentStatus {
  ACTIVE = 'active',
  BUSY = 'busy',
  IDLE = 'idle',
  LEARNING = 'learning',
}

export enum Language {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  ARABIC = 'ar',
}

export enum AgentColor {
  AMRIKYY = '#3B82F6',
  SAFAR = '#10B981',
  THRIFTY = '#F59E0B',
  THAQAFA = '#8B5CF6',
}

// Props types
export interface DesktopProps {
  currentTime?: Date;
  activeApps?: AppType[];
  showCustomerModal?: boolean;
  selectedAgent?: Agent | null;
  onAppLaunch?: (appType: AppType) => void;
  onModalClose?: () => void;
}

export interface App {
  id: string;
  name: string;
  type: AppType;
  icon: string;
  color: string;
  isActive: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  status: AgentStatus;
  avatar: string | null;
  skills: Skill[];
}

export interface Skill {
  name: string;
  level: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

export interface HologramAvatarProps {
  agent: Agent;
  size?: number;
  showParticles?: boolean;
  showBreathing?: boolean;
}

export interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerFormData) => void;
  initialStep?: CustomerFormStep;
}

export interface CustomerFormData {
  overview: OverviewFormData;
  address: AddressFormData;
  notes: NotesFormData;
}

export interface OverviewFormData {
  avatar: File | null;
  firstName: string;
  lastName: string;
  language: Language;
  phoneCountryCode: string;
  phoneNumber: string;
  marketingEmailConsent: boolean;
  marketingSmsConsent: boolean;
}

export interface AddressFormData {
  country: string;
  region: string;
  apartments: string;
  city: string;
  zipCode: string;
}

export interface NotesFormData {
  note: string;
}

export interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

export interface RegionOption {
  value: string;
  label: string;
}

export interface LanguageOption {
  value: string;
  label: string;
}

export interface AppData {
  id: string;
  name: string;
  icon: string;
  component: React.FC;
  category: 'core' | 'utility' | 'creative' | 'system';
}

export interface HologramProps {
  size?: number;
  color?: string;
  opacity?: number;
  speed?: number;
}

export interface ParticleProps {
  color?: string;
  count?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
}
