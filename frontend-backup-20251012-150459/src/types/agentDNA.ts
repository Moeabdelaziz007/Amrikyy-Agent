/**
 * AgentDNA Type Definitions
 * TypeScript interfaces for AI Agent DNA system
 */

export interface PersonalityTraits {
  analytical: number;      // 0-100: Data-driven, examines details
  creative: number;        // 0-100: Innovative, thinks outside box
  empathetic: number;      // 0-100: Understanding, emotionally aware
  logical: number;         // 0-100: Structured, organized thinking
  intuitive: number;       // 0-100: Relies on instinct and vision
  assertive: number;       // 0-100: Confident, takes charge
}

export interface Skills {
  coding: number;          // 0-100: Programming ability
  communication: number;   // 0-100: Clear expression
  problemSolving: number;  // 0-100: Finding solutions
  leadership: number;      // 0-100: Guiding others
  learning: number;        // 0-100: Adaptability
  cultural: number;        // 0-100: Cultural knowledge
}

export interface Behavior {
  decisionSpeed: number;   // 0-100: Quick ← → Thorough
  riskTolerance: number;   // 0-100: Bold ← → Conservative
  workStyle: number;       // 0-100: Collaborative ← → Solo
  detailLevel: number;     // 0-100: Meticulous ← → Big Picture
}

export interface AIModelConfig {
  provider: 'zai' | 'openai' | 'anthropic' | 'local';
  model: string;
  temperature: number;     // 0.0-1.0
  maxTokens: number;
  topP: number;           // 0.0-1.0
}

export interface Performance {
  tasksCompleted: number;
  qualityScore: number;    // 0-100
  innovations: number;
  totalScore: number;
  level: PerformanceLevel;
}

export type PerformanceLevel = 
  | 'Novice'
  | 'Apprentice'
  | 'Competent'
  | 'Proficient'
  | 'Expert'
  | 'Master'
  | 'Legend'
  | 'Quantum';

export type AgentType = 
  | 'general'
  | 'country-agent'
  | 'e-cmw-agent'
  | 'travel-expert'
  | 'customer-support'
  | 'ai-engineer';

export type Specialization =
  | 'general'
  | 'travel-expert'
  | 'country-agent'
  | 'hotel-specialist'
  | 'flight-specialist'
  | 'tour-guide'
  | 'luxury-expert'
  | 'budget-expert'
  | 'adventure-specialist'
  | 'cultural-expert'
  | 'ai-engineer'
  | 'frontend-dev'
  | 'backend-dev'
  | 'data-scientist';

export interface AgentDNA {
  id: string;
  name: string;
  type: AgentType;
  personality: PersonalityTraits;
  skills: Skills;
  behavior: Behavior;
  specialization: Specialization;
  domainExpertise: string[];
  aiModelConfig: AIModelConfig;
  performance: Performance;
  dnaScore: number;        // 0-100
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  type?: AgentType;
  personality?: Partial<PersonalityTraits>;
  skills?: Partial<Skills>;
  behavior?: Partial<Behavior>;
  specialization?: Specialization;
  domainExpertise?: string[];
  aiModelConfig?: Partial<AIModelConfig>;
}

export interface UpdateAgentRequest {
  name?: string;
  type?: AgentType;
  personality?: Partial<PersonalityTraits>;
  skills?: Partial<Skills>;
  behavior?: Partial<Behavior>;
  specialization?: Specialization;
  domainExpertise?: string[];
  aiModelConfig?: Partial<AIModelConfig>;
}

export interface AgentDashboard {
  totalAgents: number;
  averageDNAScore: number;
  specializations: Record<string, number>;
  performanceLevels: Record<PerformanceLevel, number>;
  topPerformers: Array<{
    id: string;
    name: string;
    dnaScore: number;
    performanceScore: number;
    level: PerformanceLevel;
  }>;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Agent presets for quick creation
export interface AgentPreset {
  name: string;
  type: AgentType;
  specialization: Specialization;
  personality: PersonalityTraits;
  skills: Skills;
  behavior: Behavior;
  description: string;
  icon: string;
}

// Validation helpers
export const isValidScore = (score: number): boolean => {
  return score >= 0 && score <= 100;
};

export const isValidTemperature = (temp: number): boolean => {
  return temp >= 0 && temp <= 1;
};

export const getDefaultPersonality = (): PersonalityTraits => ({
  analytical: 50,
  creative: 50,
  empathetic: 50,
  logical: 50,
  intuitive: 50,
  assertive: 50,
});

export const getDefaultSkills = (): Skills => ({
  coding: 50,
  communication: 50,
  problemSolving: 50,
  leadership: 50,
  learning: 50,
  cultural: 50,
});

export const getDefaultBehavior = (): Behavior => ({
  decisionSpeed: 50,
  riskTolerance: 50,
  workStyle: 50,
  detailLevel: 50,
});

export const getDefaultAIModelConfig = (): AIModelConfig => ({
  provider: 'zai',
  model: 'glm-4.6',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 0.9,
});

// Predefined agent presets
export const AGENT_PRESETS: AgentPreset[] = [
  {
    name: 'Egypt Travel Expert',
    type: 'country-agent',
    specialization: 'travel-expert',
    personality: {
      analytical: 75,
      creative: 60,
      empathetic: 85,
      logical: 70,
      intuitive: 80,
      assertive: 65,
    },
    skills: {
      cultural: 95,
      communication: 90,
      problemSolving: 85,
      learning: 80,
      leadership: 70,
      coding: 50,
    },
    behavior: {
      decisionSpeed: 60,
      riskTolerance: 40,
      workStyle: 70,
      detailLevel: 80,
    },
    description: 'Expert in Egyptian tourism, culture, and historical sites',
    icon: '🇪🇬',
  },
  {
    name: 'Saudi Arabia Guide',
    type: 'country-agent',
    specialization: 'cultural-expert',
    personality: {
      analytical: 70,
      creative: 55,
      empathetic: 90,
      logical: 75,
      intuitive: 70,
      assertive: 60,
    },
    skills: {
      cultural: 98,
      communication: 95,
      problemSolving: 80,
      learning: 75,
      leadership: 65,
      coding: 45,
    },
    behavior: {
      decisionSpeed: 55,
      riskTolerance: 35,
      workStyle: 75,
      detailLevel: 85,
    },
    description: 'Specialist in Hajj, Umrah, and Saudi cultural experiences',
    icon: '🇸🇦',
  },
  {
    name: 'Luxury Travel Concierge',
    type: 'travel-expert',
    specialization: 'luxury-expert',
    personality: {
      analytical: 80,
      creative: 70,
      empathetic: 85,
      logical: 75,
      intuitive: 85,
      assertive: 75,
    },
    skills: {
      communication: 95,
      problemSolving: 90,
      cultural: 85,
      leadership: 80,
      learning: 75,
      coding: 50,
    },
    behavior: {
      decisionSpeed: 65,
      riskTolerance: 50,
      workStyle: 80,
      detailLevel: 90,
    },
    description: 'High-end travel planning with attention to every detail',
    icon: '💎',
  },
  {
    name: 'Budget Adventure Guide',
    type: 'travel-expert',
    specialization: 'adventure-specialist',
    personality: {
      analytical: 65,
      creative: 85,
      empathetic: 70,
      logical: 60,
      intuitive: 80,
      assertive: 70,
    },
    skills: {
      problemSolving: 90,
      communication: 85,
      cultural: 75,
      learning: 85,
      leadership: 70,
      coding: 55,
    },
    behavior: {
      decisionSpeed: 75,
      riskTolerance: 70,
      workStyle: 65,
      detailLevel: 60,
    },
    description: 'Affordable adventures for the spirited traveler',
    icon: '🎒',
  },
  {
    name: 'AI Assistant Engineer',
    type: 'ai-engineer',
    specialization: 'ai-engineer',
    personality: {
      analytical: 95,
      creative: 75,
      empathetic: 60,
      logical: 95,
      intuitive: 70,
      assertive: 65,
    },
    skills: {
      coding: 95,
      problemSolving: 95,
      learning: 90,
      communication: 75,
      leadership: 70,
      cultural: 55,
    },
    behavior: {
      decisionSpeed: 50,
      riskTolerance: 70,
      workStyle: 60,
      detailLevel: 85,
    },
    description: 'Technical AI agent for E-CMW orchestration',
    icon: '🤖',
  },
];

