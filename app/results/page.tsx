'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { generateNarratorSummary } from '@/lib/aiNarrator';
import TransparencyPanel from '@/components/TransparencyPanel';
import dynamic from 'next/dynamic';
import {
  buildSuggestedPortfolio,
  runScenario,
  type UserProfile,
} from '@/lib/portfolioAnalytics';

const ResultsChart = dynamic(() => import('@/components/ResultsChart'), { ssr: false });

const SECTOR_COLORS: Record<string, string> = {
  tech: '#38bdf8', finance: '#fcd34d', energy: '#fb923c', manufacturing: '#a3e635',
};
const SECTOR_EMOJIS: Record<string, string> = {
  tech: '💻', finance: '💰', energy: '⚡', manufacturing: '⚙️',
};

export default function ResultsPage() {
  const router = useRouter();
  const { selectedStock, investment, resultTimeline, finalValue, reset, userProfile } = useGameStore();

  useEffect(() => {
    if (!selectedStock || resultTimeline.length === 0) router.push('/setup');
  }, [selectedStock, resultTimeline, router]);

  if (!selectedStock || resultTimeline.length === 0) return null;

  const gain = finalValue - investment;
  const gainPct = ((gain / investment) * 100).toFixed(1);
  const isGain = gain >= 0;
  const sectorColor = SECTOR_COLORS[selectedStock.sector];
  const sectorEmoji = SECTOR_EMOJIS[selectedStock.sector];

  const obstacles = resultTimeline.filter((e) => e.type === 'obstacle');
  const chests = resultTimeline.filter((e) => e.type === 'chest');
  const bestMoment = [...resultTimeline].sort((a, b) => b.value - a.value)[0];
  const worstMoment = [...resultTimeline].sort((a, b) => a.value - b.value)[0];

  const narratorText = generateNarratorSummary(selectedStock, gain, resultTimeline);

  // Scenario recap using portfolio analytics
  const scenarioRecap = useMemo(() => {
    if (!userProfile) return null;
    const profile = userProfile as UserProfile;
    const portfolio = buildSuggestedPortfolio(profile);
    const holdings = portfolio.holdings.map(h => ({ ticker: h.stock.ticker, weight: h.weight }));
    const amount = investment;

    // Determine which scenario was hardest (most obstacles = market crash scenario)
    const obstacleCount = resultTimeline.filter(e => e.type === 'obstacle').length;
    const scenarioType =
      obstacleCount >= 2 ? 'market_crash' as const
      : gain < 0 ? 'inflation' as const
      : 'withdrawal_20' as const;

    return runScenario(scenarioType, holdings, profile, amount);
  }, [userProfile, investment, resultTimeline, gain]);

  return (
    <main className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(180deg,#0d1f0d,#050f05)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Finish banner */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3 animate-bounce-gentle">🏁</div>
          <h1 className="font-display text-5xl mb-2" style={{ color: sectorColor }}>Race Complete!</h1>
          <div className="flex items-center justify-center gap-2 text-forest-pale text-base">
            <span>{sectorEmoji}</span>
            <span className="font-bold" style={{ color: sectorColor }}>${selectedStock.ticker}</span>
            <span className="text-forest-light">·</span>
            <span>{selectedStock.company}</span>
          </div>
        </div>

        {/* Main result card */}
        <div
          className="forest-card p-6 mb-6 text-center"
          style={{
            border: `2px solid ${isGain ? '#22c55e' : '#ef4444'}`,
            background: isGain ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
            boxShadow: `0 0 40px ${isGain ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
          }}
        >
          <div className="text-sm text-forest-pale mb-1">Final Portfolio Value</div>
          <div className="font-display text-5xl mb-2" style={{ color: isGain ? '#4ade80' : '#f87171' }}>
            ${finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="font-semibold text-xl" style={{ color: isGain ? '#22c55e' : '#ef4444' }}>
            {isGain ? '▲' : '▼'} {isGain ? '+' : ''}{gain.toFixed(0)} ({isGain ? '+' : ''}{gainPct}%)
          </div>
          <div className="text-sm text-forest-light mt-1">Started with ${investment.toLocaleString()}</div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: '💰', label: 'Initial', value: `$${investment.toLocaleString()}`, color: '#94a3b8' },
            { icon: '⚠️', label: 'Obstacles Hit', value: obstacles.length.toString(), color: '#f87171' },
            { icon: '💎', label: 'Chests Collected', value: chests.length.toString(), color: '#fcd34d' },
            { icon: isGain ? '🚀' : '📉', label: 'Outcome', value: isGain ? 'Profit' : 'Loss', color: isGain ? '#4ade80' : '#f87171' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="forest-card p-3 text-center">
              <div className="text-xl mb-1">{icon}</div>
              <div className="font-bold text-base" style={{ color }}>{value}</div>
              <div className="text-xs text-forest-light mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="forest-card p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📈</span>
            <h3 className="font-display text-lg text-forest-bright">Portfolio Timeline</h3>
          </div>
          <ResultsChart timeline={resultTimeline} investment={investment} />
        </div>

        {/* Best / Worst row */}
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div className="forest-card p-4" style={{ border: '1.5px solid rgba(34,197,94,0.4)' }}>
            <div className="text-sm font-bold text-forest-bright mb-2">🏆 Best Moment</div>
            <div className="text-lg font-bold" style={{ color: '#4ade80' }}>${bestMoment?.value.toFixed(0)} at {Math.floor(bestMoment?.time ?? 0)}s</div>
            <div className="text-xs text-forest-pale mt-1 leading-relaxed">{bestMoment?.label}</div>
          </div>
          <div className="forest-card p-4" style={{ border: '1.5px solid rgba(239,68,68,0.4)' }}>
            <div className="text-sm font-bold text-red-400 mb-2">⚡ Hardest Obstacle</div>
            <div className="text-lg font-bold" style={{ color: '#f87171' }}>${worstMoment?.value.toFixed(0)} at {Math.floor(worstMoment?.time ?? 0)}s</div>
            <div className="text-xs text-forest-pale mt-1 leading-relaxed">{worstMoment?.label}</div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="forest-card-gold p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧠</span>
            <h3 className="font-display text-lg text-gold-mid">AI Market Analysis</h3>
          </div>
          <p className="text-sm text-forest-pale leading-relaxed">{narratorText}</p>
        </div>

        {/* Event log */}
        <div className="forest-card p-4 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📜</span>
            <h3 className="font-display text-base text-forest-bright">Full Event Log</h3>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {resultTimeline.map((ev, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-lg text-sm"
                style={{
                  background: ev.type === 'obstacle' ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)',
                  borderLeft: `3px solid ${ev.type === 'obstacle' ? '#ef4444' : '#22c55e'}`,
                }}
              >
                <span style={{ color: ev.type === 'obstacle' ? '#f87171' : '#4ade80', flexShrink: 0, width: 44, fontSize: 11 }}>
                  {ev.type === 'obstacle' ? '⚠' : '✓'} {Math.floor(ev.time)}s
                </span>
                <span className="text-forest-pale flex-1 truncate text-xs">{ev.label}</span>
                <span className="font-bold text-xs" style={{ color: ev.type === 'obstacle' ? '#f87171' : '#4ade80', flexShrink: 0 }}>
                  ${ev.value.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Advisor */}
        {scenarioRecap && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🧭</span>
              <h3 className="font-display text-xl text-forest-bright">Your Portfolio Advisor</h3>
            </div>
            <div className="forest-card p-5 mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">
                  {scenarioRecap.type === 'market_crash' ? '🛡️' : scenarioRecap.type === 'inflation' ? '⚡' : '🌱'}
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-lg text-white mb-1">{scenarioRecap.title}</h4>
                  <p className="text-forest-pale text-sm mb-4">{scenarioRecap.description}</p>

                  {/* Action-first metrics — no loss numbers */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.09)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <div className="text-xs text-forest-bright font-semibold mb-1">HEALTH AFTER REBALANCING</div>
                      <div className="font-display text-2xl" style={{ color: '#4ade80' }}>{scenarioRecap.newHealthScore}<span className="text-sm text-forest-light">/100</span></div>
                      <div className="text-xs text-forest-pale mt-0.5">Follow the steps below to get here</div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(252,211,77,0.09)', border: '1px solid rgba(252,211,77,0.2)' }}>
                      <div className="text-xs text-yellow-300 font-semibold mb-1">YOUR BEST MOVE</div>
                      <div className="text-sm font-semibold text-white leading-snug">{scenarioRecap.recommendation}</div>
                    </div>
                  </div>

                  {/* Rebalancing steps */}
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.15)' }}>
                    <div className="text-xs text-sky-400 font-semibold mb-2">ACTION PLAN</div>
                    <ul className="space-y-1.5">
                      {scenarioRecap.rebalancingActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-forest-pale">
                          <span className="text-forest-bright mt-0.5 flex-shrink-0 font-bold">{i + 1}.</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <TransparencyPanel scenario={scenarioRecap} investmentAmount={investment} />
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button onClick={() => { reset(); router.push('/setup'); }} className="forest-btn forest-btn-gold text-lg px-10 py-4">
            🔄 Play Again
          </button>
          <Link href="/home">
            <button className="forest-btn forest-btn-outline text-lg px-10 py-4 w-full sm:w-auto">
              📊 Market Overview
            </button>
          </Link>
        </div>

        <p className="text-center text-xs text-forest-light/40 mt-4">
          Simulation only · Not financial advice · GS Hackathon 2026
        </p>
      </div>
    </main>
  );
}
