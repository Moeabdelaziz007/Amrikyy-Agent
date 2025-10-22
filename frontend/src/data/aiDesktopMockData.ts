import type { AppType, AgentStatus, Language, App, Agent, Particle, CustomerFormData } from '../types/aiDesktop';

// Mock data for AI OS Desktop

export const mockRootProps = {
  currentTime: new Date(),
  activeApps: ['dashboard', 'terminal'] as AppType[],
  showCustomerModal: false,
  selectedAgent: null
};

export const mockApps: App[] = [
  {
    id: 'terminal',
    name: 'Terminal',
    type: 'terminal' as AppType,
    icon: 'terminal',
    color: '#22D3EE',
    isActive: false
  },
  {
    id: 'files',
    name: 'Files',
    type: 'files' as AppType,
    icon: 'folder',
    color: '#22D3EE',
    isActive: false
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    type: 'dashboard' as AppType,
    icon: 'layout-dashboard',
    color: '#22D3EE',
    isActive: true
  },
  {
    id: 'news',
    name: 'News',
    type: 'news' as AppType,
    icon: 'newspaper',
    color: '#22D3EE',
    isActive: false
  },
  {
    id: 'quantum-travel',
    name: 'Quantum Travel',
    type: 'quantum_travel' as AppType,
    icon: 'plane',
    color: '#22D3EE',
    isActive: false
  },
  {
    id: 'debugger',
    name: 'Debugger',
    type: 'debugger' as AppType,
    icon: 'bug',
    color: '#22D3EE',
    isActive: false
  },
  {
    id: 'ai-notes',
    name: 'AI Notes',
    type: 'ai_notes' as AppType,
    icon: 'file-text',
    color: '#22D3EE',
    isActive: false
  }
];

export const mockAgents: Agent[] = [
  {
    id: 'amrikyy-001',
    name: 'Amrikyy',
    role: 'AI Travel Companion',
    color: '#3B82F6',
    status: 'active' as AgentStatus,
    avatar: null,
    skills: [
      { name: 'Trip Planning', level: 95 },
      { name: 'Conversation', level: 93 }
    ]
  },
  {
    id: 'safar-001',
    name: 'Safar',
    role: 'Travel Specialist',
    color: '#10B981',
    status: 'active' as AgentStatus,
    avatar: null,
    skills: [
      { name: 'Research', level: 96 },
      { name: 'Hidden Gems', level: 93 }
    ]
  }
];

export const mockParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  color: ['#22D3EE', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 5)],
  delay: Math.random() * 5
}));

export const mockCustomerForm: CustomerFormData = {
  overview: {
    avatar: null as File | null,
    firstName: 'Jon',
    lastName: 'Snow',
    language: 'en' as Language,
    phoneCountryCode: '+1',
    phoneNumber: '555-0199',
    marketingEmailConsent: false,
    marketingSmsConsent: false
  },
  address: {
    country: '',
    region: '',
    apartments: '',
    city: '',
    zipCode: ''
  },
  notes: {
    note: ''
  }
};

export const mockCountries = [
  { value: 'us', label: 'United States', flag: 'US' },
  { value: 'uk', label: 'United Kingdom', flag: 'UK' },
  { value: 'ca', label: 'Canada', flag: 'CA' },
  { value: 'au', label: 'Australia', flag: 'AU' }
];

export const mockRegions = [
  { value: 'ca', label: 'California' },
  { value: 'ny', label: 'New York' },
  { value: 'tx', label: 'Texas' },
  { value: 'fl', label: 'Florida' }
];

export const mockLanguages = [
  { value: 'en', label: 'English (Default)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' }
];