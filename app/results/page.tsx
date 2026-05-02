'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { generateNarratorSummary } from '@/lib/aiNarrator';
import dynamic from 'next/dynamic';
import { getAvatarConfig, getSectorIcon } from '@/lib/avatarGenerator';

const ResultsChart = dynamic(() => import('@/components/ResultsChart'), { ssr: false });

export default function ResultsPage() {
  const router = useRouter();
  const { selectedStock, investment, resultTimeline, finalValue, reset } = useGameStore();

  // #region agent log
  if (typeof window !== 'undefined') fetch('http://127.0.0.1:7317/ingest/db66ef74-30f5-40d2-acf7-ffd6771fd886',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e6835'},body:JSON.stringify({sessionId:'1e6835',hypothesisId:'E',location:'results/page.tsx:render',message:'ResultsPage render',data:{hasStock:!!selectedStock,timelineLen:resultTimeline?.length,finalValue,investment},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    if (!selectedStock || resultTimeline.length === 0) {
      router.push('/setup');
    }
  }, [selectedStock, resultTimeline, router]);

  if (!selectedStock || resultTimeline.length === 0) return null;

  const gain = finalValue - investment;
  const gainPct = ((gain / investment) * 100).toFixed(2);
  const isGain = gain >= 0;
  const cfg = getAvatarConfig(selectedStock.sector, selectedStock.risk);

  const obstacles = resultTimeline.filter((e) => e.type === 'obstacle');
  const chests = resultTimeline.filter((e) => e.type === 'chest');
  const bestMoment = [...resultTimeline].sort((a, b) => b.value - a.value)[0];
  const worstMoment = [...resultTimeline].sort((a, b) => a.value - b.value)[0];

  const narratorText = generateNarratorSummary(
    selectedStock,
    gain,
    resultTimeline
  );

  function handlePlayAgain() {
    reset();
    router.push('/setup');
  }

  return (
    <main className="min-h-screen bg-pixel-dark p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Finish Banner */}
        <div className="text-center mb-8">
          <div
            className="text-3xl md:text-5xl mb-2 glow-yellow"
            style={{ color: '#ffd700', fontFamily: '"Press Start 2P", monospace', lineHeight: 1.4 }}
          >
            FINISH!
          </div>
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-2xl">{getSectorIcon(selectedStock.sector)}</span>
            <span
              className="text-[12px]"
              style={{ color: cfg.color, fontFamily: '"Press Start 2P", monospace' }}
            >
              ${selectedStock.ticker}
            </span>
            <span className="text-[9px] text-gray-400">{selectedStock.company}</span>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div
            className="p-4 text-center col-span-2"
            style={{
              border: `2px solid ${isGain ? '#00ff41' : '#ff3131'}`,
              background: isGain ? 'rgba(0,255,65,0.05)' : 'rgba(255,49,49,0.05)',
              boxShadow: `0 0 20px ${isGain ? 'rgba(0,255,65,0.2)' : 'rgba(255,49,49,0.2)'}`,
            }}
          >
            <div className="text-[8px] text-gray-400 mb-2">FINAL PORTFOLIO VALUE</div>
            <div
              className="text-2xl"
              style={{ color: isGain ? '#00ff41' : '#ff3131', fontFamily: '"Press Start 2P", monospace' }}
            >
              ${finalValue.toFixed(2)}
            </div>
            <div
              className="text-[10px] mt-1"
              style={{ color: isGain ? '#00ff41' : '#ff3131' }}
            >
              {isGain ? '+' : ''}{gain.toFixed(2)} ({isGain ? '+' : ''}{gainPct}%)
            </div>
          </div>

          <div className="p-3 text-center" style={{ border: '2px solid #333', background: '#111' }}>
            <div className="text-[7px] text-gray-500 mb-1">INITIAL INVESTMENT</div>
            <div className="text-[12px] text-gray-300" style={{ fontFamily: '"Press Start 2P", monospace' }}>
              ${investment.toFixed(0)}
            </div>
          </div>

          <div className="p-3 text-center" style={{ border: '2px solid #333', background: '#111' }}>
            <div className="text-[7px] text-gray-500 mb-1">EVENTS</div>
            <div className="text-[10px]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
              <span style={{ color: '#ff3131' }}>{obstacles.length}⚠</span>
              {' '}
              <span style={{ color: '#ffd700' }}>{chests.length}✓</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="pixel-border p-4 mb-6">
          <div className="text-[9px] text-pixel-green mb-4">► PORTFOLIO TIMELINE</div>
          <ResultsChart timeline={resultTimeline} investment={investment} />
        </div>

        {/* Best / Worst moments */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4" style={{ border: '2px solid #00ff41', background: 'rgba(0,255,65,0.05)' }}>
            <div className="text-[8px] text-pixel-green mb-2">► BEST MOMENT</div>
            <div className="text-[9px] text-gray-300 leading-relaxed">
              ${bestMoment?.value.toFixed(2)} at {Math.floor(bestMoment?.time ?? 0)}s
            </div>
            <div className="text-[7px] text-gray-500 mt-1 leading-relaxed">
              {bestMoment?.label}
            </div>
          </div>
          <div className="p-4" style={{ border: '2px solid #ff3131', background: 'rgba(255,49,49,0.05)' }}>
            <div className="text-[8px] text-pixel-red mb-2">► WORST MOMENT</div>
            <div className="text-[9px] text-gray-300 leading-relaxed">
              ${worstMoment?.value.toFixed(2)} at {Math.floor(worstMoment?.time ?? 0)}s
            </div>
            <div className="text-[7px] text-gray-500 mt-1 leading-relaxed">
              {worstMoment?.label}
            </div>
          </div>
        </div>

        {/* AI Narrator */}
        <div className="pixel-border p-5 mb-6">
          <div className="text-[9px] text-pixel-yellow glow-yellow mb-3">► AI MARKET ANALYSIS</div>
          <p className="text-[8px] text-gray-300 leading-relaxed">{narratorText}</p>
        </div>

        {/* Event Log */}
        <div className="pixel-border p-4 mb-8">
          <div className="text-[9px] text-pixel-green mb-3">► FULL EVENT LOG</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {resultTimeline.map((ev, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2 text-[7px]"
                style={{
                  background: ev.type === 'obstacle' ? 'rgba(255,49,49,0.05)' : 'rgba(0,255,65,0.05)',
                  borderLeft: `3px solid ${ev.type === 'obstacle' ? '#ff3131' : '#00ff41'}`,
                }}
              >
                <span style={{ color: ev.type === 'obstacle' ? '#ff3131' : '#00ff41', flexShrink: 0 }}>
                  {ev.type === 'obstacle' ? '⚠' : '✓'} {Math.floor(ev.time)}s
                </span>
                <span className="text-gray-400 flex-1">{ev.label}</span>
                <span style={{ color: ev.type === 'obstacle' ? '#ff3131' : '#00ff41', flexShrink: 0 }}>
                  ${ev.value.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePlayAgain}
            className="pixel-btn pixel-btn-green text-[10px] py-4 px-8"
          >
            ▶ PLAY AGAIN
          </button>
          <Link href="/">
            <button className="pixel-btn pixel-btn-outline text-[10px] py-4 px-8 w-full sm:w-auto">
              ← VIEW ALL STOCKS
            </button>
          </Link>
        </div>

        <p className="text-center text-[7px] text-gray-600 mt-8">
          * SIMULATION ONLY · RESULTS DO NOT REFLECT REAL MARKET PERFORMANCE · NOT FINANCIAL ADVICE
        </p>
      </div>
    </main>
  );
}
