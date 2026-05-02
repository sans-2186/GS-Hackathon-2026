'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GameCanvas from '@/components/GameCanvas';
import { useGameStore } from '@/store/gameStore';
import type { GameResultEvent } from '@/store/gameStore';

export default function GamePage() {
  const router = useRouter();
  const { selectedStock, setResultTimeline, setFinalValue, user } = useGameStore();

  useEffect(() => {
    if (!selectedStock) router.push('/setup');
    if (!user) router.push('/login');
  }, [selectedStock, user, router]);

  function handleGameEnd(timeline: GameResultEvent[], finalValue: number) {
    setResultTimeline(timeline);
    setFinalValue(finalValue);
    setTimeout(() => router.push('/results'), 1200);
  }

  if (!selectedStock) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(180deg,#0d1f0d,#050f05)' }}>
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-forest-pale">
            🌲 <span className="font-semibold" style={{ color: '#22c55e' }}>${selectedStock.ticker}</span>
            <span className="ml-2 text-forest-light text-xs">{selectedStock.company}</span>
          </div>
          <div className="text-xs text-forest-light">
            {selectedStock.sector} · {selectedStock.risk} risk
          </div>
        </div>
        <GameCanvas onGameEnd={handleGameEnd} />
      </div>
    </main>
  );
}
