'use client';
import { create } from 'zustand';
import type { Stock, GameEvent, UserProfile } from '@/lib/types';

export interface GameResultEvent {
  time: number;
  value: number;
  label: string;
  type: 'obstacle' | 'chest';
}

export interface Choice {
  text: string;
  detail: string;
  impactMultiplier: number;
}

export interface User {
  name: string;
  email: string;
}

interface GameStore {
  // Auth
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;

  // Onboarding / profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;

  // Game
  selectedStock: Stock | null;
  investment: number;
  gameEvents: GameEvent[];
  resultTimeline: GameResultEvent[];
  finalValue: number;

  // Story choices
  storyChoices: Choice[] | null;
  pendingEventIdx: number | null;
  setStoryChoices: (choices: Choice[] | null) => void;
  setPendingEventIdx: (idx: number | null) => void;

  // Actions
  setSelectedStock: (stock: Stock) => void;
  setInvestment: (amount: number) => void;
  setGameEvents: (events: GameEvent[]) => void;
  setResultTimeline: (timeline: GameResultEvent[]) => void;
  setFinalValue: (value: number) => void;
  reset: () => void;
}

const loadUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sq_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const loadUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sq_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useGameStore = create<GameStore>((set) => ({
  user: loadUser(),
  setUser: (user) => {
    if (typeof window !== 'undefined') localStorage.setItem('sq_user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sq_user');
      localStorage.removeItem('sq_profile');
    }
    set({ user: null, userProfile: null });
  },

  userProfile: loadUserProfile(),
  setUserProfile: (profile) => {
    if (typeof window !== 'undefined') localStorage.setItem('sq_profile', JSON.stringify(profile));
    set({ userProfile: profile });
  },

  selectedStock: null,
  investment: 1000,
  gameEvents: [],
  resultTimeline: [],
  finalValue: 0,

  storyChoices: null,
  pendingEventIdx: null,
  setStoryChoices: (choices) => set({ storyChoices: choices }),
  setPendingEventIdx: (idx) => set({ pendingEventIdx: idx }),

  setSelectedStock: (stock) => set({ selectedStock: stock }),
  setInvestment: (amount) => set({ investment: amount }),
  setGameEvents: (events) => set({ gameEvents: events }),
  setResultTimeline: (timeline) => set({ resultTimeline: timeline }),
  setFinalValue: (value) => set({ finalValue: value }),
  reset: () =>
    set({
      selectedStock: null,
      investment: 1000,
      gameEvents: [],
      resultTimeline: [],
      finalValue: 0,
      storyChoices: null,
      pendingEventIdx: null,
    }),
}));
