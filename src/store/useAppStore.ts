import { create } from 'zustand';

export type ViewState = 'home' | 'dashboard' | 'settings';

interface AppState {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
}));
