'use client';
import { useRouter } from 'next/navigation';
import GameCanvas from '@/components/GameCanvas';
import { useGameStore } from '@/store/gameStore';
import type { GameResultEvent } from '@/store/gameStore';

export default function GamePage() {
  const router = useRouter();
  const { selectedStock, setResultTimeline, setFinalValue } = useGameStore();

  function handleGameEnd(timeline: GameResultEvent[], finalValue: number) {
    setResultTimeline(timeline);
    setFinalValue(finalValue);
    setTimeout(() => router.push('/results'), 1200);
  }

  if (!selectedStock) {
    // #region agent log
    fetch('http://127.0.0.1:7317/ingest/db66ef74-30f5-40d2-acf7-ffd6771fd886',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e6835'},body:JSON.stringify({sessionId:'1e6835',hypothesisId:'A',location:'app/game/page.tsx:18',message:'router.push called in render body — selectedStock is null',data:{windowDefined:typeof window !== 'undefined'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (typeof window !== 'undefined') router.push('/setup');
    return null;
  }

  return (
    <main className="min-h-screen bg-pixel-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Stock info header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[8px] text-gray-500">
            NOW RACING:
            <span className="ml-2" style={{ color: '#00ff41' }}>
              ${selectedStock.ticker} · {selectedStock.company}
            </span>
          </div>
          <div className="text-[7px] text-gray-600">
            {selectedStock.sector.toUpperCase()} · {selectedStock.risk.toUpperCase()} RISK
          </div>
        </div>

        <GameCanvas onGameEnd={handleGameEnd} />

        <div className="text-center mt-4 text-[7px] text-gray-600">
          ⌨ SPACE / ↑ / W to jump · Click canvas to jump on mobile
        </div>
      </div>
    </main>
  );
}
