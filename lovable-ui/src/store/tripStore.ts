import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TripData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  tripStyle: string;
  specialRequests: string;
}

export interface SelectedItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  name: string;
  price: number;
  details: any;
}

interface TripStore {
  tripData: TripData;
  selectedItems: SelectedItem[];
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  setTripData: (data: Partial<TripData>) => void;
  addSelectedItem: (item: SelectedItem) => void;
  removeSelectedItem: (id: string) => void;
  clearSelectedItems: () => void;
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearChatMessages: () => void;
  getTotalCost: () => number;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      tripData: {
        destination: '',
        startDate: '',
        endDate: '',
        travelers: 1,
        budget: 'medium',
        tripStyle: 'leisure',
        specialRequests: '',
      },
      selectedItems: [],
      chatMessages: [],
      setTripData: (data) =>
        set((state) => ({
          tripData: { ...state.tripData, ...data },
        })),
      addSelectedItem: (item) =>
        set((state) => ({
          selectedItems: [...state.selectedItems, item],
        })),
      removeSelectedItem: (id) =>
        set((state) => ({
          selectedItems: state.selectedItems.filter((item) => item.id !== id),
        })),
      clearSelectedItems: () => set({ selectedItems: [] }),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      clearChatMessages: () => set({ chatMessages: [] }),
      getTotalCost: () => {
        const state = get();
        return state.selectedItems.reduce((total, item) => total + item.price, 0);
      },
    }),
    {
      name: 'amrikyy-trip-storage',
    }
  )
);
