'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Stock } from '@/lib/types';
import StockTable from '@/components/StockTable';
import RulesModal from '@/components/RulesModal';
import { useGameStore } from '@/store/gameStore';
import dynamic from 'next/dynamic';

const MarketChart = dynamic(() => import('@/components/MarketChart'), { ssr: false });

interface HomeClientProps { stocks: Stock[]; }

export default function HomeClient({ stocks }: HomeClientProps) {
  const [showRules, setShowRules] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-forest-dark">
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b border-forest-mid/40" style={{ background: 'rgba(13,31,13,0.92)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🌲</span>
            <span className="font-display text-xl text-forest-bright">StockQuest</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-bright/60">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker or company..."
              className="forest-input pl-9 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-white/80 hidden md:block">👤 {user.name}</span>
            <button onClick={() => setShowRules(true)} className="forest-btn forest-btn-outline text-sm py-2 px-4">
              ? Rules
            </button>
            <Link href="/setup">
              <button className="forest-btn forest-btn-gold text-sm py-2 px-5">▶ Play</button>
            </Link>
            <button onClick={() => { logout(); router.push('/'); }} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Exit
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Stocks', value: stocks.length.toString(), icon: '📋', color: '#22c55e' },
            { label: 'Sectors', value: '4', icon: '🗂️', color: '#38bdf8' },
            { label: 'Best Return', value: `+${Math.max(...stocks.map(s => s.returnRate)).toFixed(0)}%`, icon: '🚀', color: '#fcd34d' },
            { label: 'Race Duration', value: '2 min', icon: '⏱️', color: '#fb923c' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="forest-card p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-display text-2xl" style={{ color }}>{value}</div>
              <div className="text-sm text-white/70 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Market overview chart */}
        <div className="forest-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl text-forest-bright">📈 Sector Performance</h3>
              <p className="text-sm text-white/60 mt-0.5">Simulated 12-month return curves by sector</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-end">
              {[
                { label: '💻 Tech', color: '#38bdf8' },
                { label: '💰 Finance', color: '#fcd34d' },
                { label: '⚡ Energy', color: '#fb923c' },
                { label: '⚙️ MFG', color: '#a3e635' },
              ].map(({ label, color }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
                  <span className="w-3 h-0.5 inline-block rounded" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="h-56">
            <MarketChart stocks={stocks} />
          </div>
        </div>

        {/* CTA row */}
        <div className="forest-card-gold p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-white mb-1">Ready to race, {user.name}?</h2>
            <p className="text-white/70 text-sm">Pick your stock, enter the forest, and grow your portfolio — one jump at a time.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => setShowRules(true)} className="forest-btn forest-btn-outline">📖 How to Play</button>
            <Link href="/setup">
              <button className="forest-btn forest-btn-gold text-lg px-8">🌲 Play Game</button>
            </Link>
          </div>
        </div>

        {/* Market table */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-display text-xl text-forest-bright">📊 Market Overview</h3>
            <span className="badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>🟢 Live</span>
            <span className="text-xs text-white/50 ml-1">Click headers to sort · Hover labels for definitions</span>
          </div>
          <StockTable stocks={stocks} searchQuery={searchQuery} />
        </div>
      </main>

      <footer className="text-center py-6 text-white/40 text-sm border-t border-forest-mid/20 mt-8">
        GS Hackathon 2026 · StockQuest · Not financial advice
      </footer>
    </div>
  );
}
