'use client';
import { create } from 'zustand';
import type { Stock, GameEvent } from '@/lib/types';

export interface GameResultEvent {
  time: number;
  value: number;
  label: string;
  type: 'obstacle' | 'chest';
}

interface GameStore {
  selectedStock: Stock | null;
  investment: number;
  gameEvents: GameEvent[];
  resultTimeline: GameResultEvent[];
  finalValue: number;

  setSelectedStock: (stock: Stock) => void;
  setInvestment: (amount: number) => void;
  setGameEvents: (events: GameEvent[]) => void;
  setResultTimeline: (timeline: GameResultEvent[]) => void;
  setFinalValue: (value: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  selectedStock: null,
  investment: 1000,
  gameEvents: [],
  resultTimeline: [],
  finalValue: 0,

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
    }),
}));
