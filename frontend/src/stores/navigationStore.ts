import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  learningProgress: LearningProgress;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar' | 'es' | 'fr';
  notifications: boolean;
  soundEffects: boolean;
  autoSave: boolean;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface LearningProgress {
  quantumComputing: TrackProgress;
  programmingAlgorithms: TrackProgress;
  aiTrading: TrackProgress;
  personalization: TrackProgress;
  totalHours: number;
  certificates: string[];
  achievements: Achievement[];
}

export interface TrackProgress {
  completed: boolean;
  progress: number; // 0-100
  currentModule: string;
  lastAccessed: Date;
  timeSpent: number; // in minutes
  quizScores: number[];
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  strength: number; // 0-100
  completed: boolean;
  dueDate?: Date;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface NavigationState {
  currentRoute: string;
  previousRoute: string;
  isMenuOpen: boolean;
  activeDropdown: string | null;
  breadcrumbs: Breadcrumb[];
  searchQuery: string;
  searchResults: SearchResult[];
}

export interface Breadcrumb {
  label: string;
  path: string;
  icon?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'lesson' | 'project' | 'article';
  path: string;
  relevance: number;
}

// Store Interface
interface NavigationStore {
  // Navigation State
  navigation: NavigationState;
  user: User | null;
  isLoading: boolean;

  // Navigation Actions
  setCurrentRoute: (route: string) => void;
  setPreviousRoute: (route: string) => void;
  toggleMenu: () => void;
  setActiveDropdown: (dropdown: string | null) => void;
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
  removeBreadcrumb: (index: number) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;

  // User Actions
  setUser: (user: User) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  updateLearningProgress: (
    track: keyof LearningProgress,
    progress: Partial<TrackProgress>
  ) => void;
  addAchievement: (achievement: Achievement) => void;
  setLoading: (loading: boolean) => void;

  // Utility Actions
  resetNavigation: () => void;
  logout: () => void;
}

// Initial State
const initialNavigationState: NavigationState = {
  currentRoute: '/',
  previousRoute: '',
  isMenuOpen: false,
  activeDropdown: null,
  breadcrumbs: [{ label: 'Home', path: '/', icon: 'home' }],
  searchQuery: '',
  searchResults: [],
};

const initialUser: User = {
  id: 'demo-user-1',
  name: 'AI Learner',
  email: 'learner@amrikyy.ai',
  avatar: '/avatars/default-avatar.png',
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: true,
    soundEffects: true,
    autoSave: true,
    learningStyle: 'visual',
    difficulty: 'intermediate',
  },
  learningProgress: {
    quantumComputing: {
      completed: false,
      progress: 25,
      currentModule: 'Quantum Gates Basics',
      lastAccessed: new Date(),
      timeSpent: 120,
      quizScores: [85, 92, 78],
      projects: [
        {
          id: 'proj-1',
          name: 'Build Your First Quantum Circuit',
          strength: 80,
          completed: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          description: 'Create a quantum circuit using Qiskit',
        },
      ],
    },
    programmingAlgorithms: {
      completed: false,
      progress: 45,
      currentModule: 'Data Structures',
      lastAccessed: new Date(),
      timeSpent: 180,
      quizScores: [90, 88, 95, 87],
      projects: [],
    },
    aiTrading: {
      completed: false,
      progress: 10,
      currentModule: 'Market Analysis Fundamentals',
      lastAccessed: new Date(),
      timeSpent: 45,
      quizScores: [75],
      projects: [],
    },
    personalization: {
      completed: false,
      progress: 60,
      currentModule: 'Learning Analytics',
      lastAccessed: new Date(),
      timeSpent: 90,
      quizScores: [92, 88],
      projects: [],
    },
    totalHours: 435,
    certificates: [],
    achievements: [
      {
        id: 'ach-1',
        name: 'First Steps',
        description: 'Completed your first lesson',
        icon: 'star',
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        rarity: 'common',
      },
    ],
  },
};

// Store Implementation
export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      // Initial State
      navigation: initialNavigationState,
      user: initialUser,
      isLoading: false,

      // Navigation Actions
      setCurrentRoute: (route: string) => {
        const currentState = get();
        set({
          navigation: {
            ...currentState.navigation,
            previousRoute: currentState.navigation.currentRoute,
            currentRoute: route,
          },
        });
      },

      setPreviousRoute: (route: string) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            previousRoute: route,
          },
        }));
      },

      toggleMenu: () => {
        set(state => ({
          navigation: {
            ...state.navigation,
            isMenuOpen: !state.navigation.isMenuOpen,
          },
        }));
      },

      setActiveDropdown: (dropdown: string | null) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            activeDropdown: dropdown,
          },
        }));
      },

      addBreadcrumb: (breadcrumb: Breadcrumb) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            breadcrumbs: [...state.navigation.breadcrumbs, breadcrumb],
          },
        }));
      },

      removeBreadcrumb: (index: number) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            breadcrumbs: state.navigation.breadcrumbs.filter(
              (_, i) => i !== index
            ),
          },
        }));
      },

      setSearchQuery: (query: string) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            searchQuery: query,
          },
        }));
      },

      setSearchResults: (results: SearchResult[]) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            searchResults: results,
          },
        }));
      },

      // User Actions
      setUser: (user: User) => {
        set({ user });
      },

      updateUserPreferences: (preferences: Partial<UserPreferences>) => {
        set(state => ({
          user: state.user
            ? {
                ...state.user,
                preferences: { ...state.user.preferences, ...preferences },
              }
            : null,
        }));
      },

      updateLearningProgress: (
        track: keyof LearningProgress,
        progress: Partial<TrackProgress>
      ) => {
        set(state => {
          if (!state.user) return state;

          return {
            user: {
              ...state.user,
              learningProgress: {
                ...state.user.learningProgress,
                [track]: {
                  ...state.user.learningProgress[track],
                  ...progress,
                } as TrackProgress,
              },
            },
          };
        });
      },

      addAchievement: (achievement: Achievement) => {
        set(state => {
          if (!state.user) return state;

          return {
            user: {
              ...state.user,
              learningProgress: {
                ...state.user.learningProgress,
                achievements: [
                  ...state.user.learningProgress.achievements,
                  achievement,
                ],
              },
            },
          };
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Utility Actions
      resetNavigation: () => {
        set({ navigation: initialNavigationState });
      },

      logout: () => {
        set({ user: null, navigation: initialNavigationState });
      },
    }),
    {
      name: 'navigation-store',
      partialize: state => ({
        user: state.user,
        navigation: {
          currentRoute: state.navigation.currentRoute,
          previousRoute: state.navigation.previousRoute,
          breadcrumbs: state.navigation.breadcrumbs,
        },
      }),
    }
  )
);

// Selectors for better performance
export const selectCurrentRoute = (state: NavigationStore) =>
  state.navigation.currentRoute;
export const selectUser = (state: NavigationStore) => state.user;
export const selectLearningProgress = (state: NavigationStore) =>
  state.user?.learningProgress;
export const selectUserPreferences = (state: NavigationStore) =>
  state.user?.preferences;
export const selectAchievements = (state: NavigationStore) =>
  state.user?.learningProgress.achievements || [];
