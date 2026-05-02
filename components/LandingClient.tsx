'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Stock } from '@/lib/types';
import StockTable from '@/components/StockTable';
import RulesModal from '@/components/RulesModal';

interface LandingClientProps {
  stocks: Stock[];
}

export default function LandingClient({ stocks }: LandingClientProps) {
  const [showRules, setShowRules] = useState(false);

  return (
    <main className="min-h-screen bg-pixel-dark p-4 md:p-8">
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block">
          <h1
            className="text-2xl md:text-4xl glow-green mb-3 tracking-wider"
            style={{ color: '#00ff41', fontFamily: '"Press Start 2P", monospace', lineHeight: 1.4 }}
          >
            STOCK
            <span style={{ color: '#ffd700' }}>QUEST</span>
          </h1>
          <div className="text-[8px] text-gray-400 mb-1">
            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
          </div>
          <p className="text-[9px] text-gray-400 tracking-widest">
            MASTER THE MARKET · THROUGH PLAY
          </p>
        </div>
      </div>

      {/* Hero blurb */}
      <div className="max-w-4xl mx-auto mb-8 pixel-border p-4 text-center">
        <p className="text-[8px] text-gray-300 leading-relaxed">
          Pick a stock. Watch it run. Dodge market risks. Collect opportunities.
          <br />
          <span style={{ color: '#ffd700' }}>Real data. Real stories. Zero finance degree required.</span>
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
        <Link href="/setup">
          <button className="pixel-btn pixel-btn-green text-[11px] py-4 px-8 w-full sm:w-auto">
            ▶ PLAY GAME
          </button>
        </Link>
        <button
          className="pixel-btn pixel-btn-outline text-[11px] py-4 px-8"
          onClick={() => setShowRules(true)}
        >
          ? CONTROLS &amp; RULES
        </button>
      </div>

      {/* Stats bar */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'STOCKS', value: stocks.length.toString(), color: '#00ff41' },
          { label: 'SECTORS', value: '4', color: '#00bfff' },
          { label: 'MAX RETURN', value: `+${Math.max(...stocks.map((s) => s.returnRate)).toFixed(1)}%`, color: '#ffd700' },
          { label: 'GAME DURATION', value: '2 MIN', color: '#ff8c00' },
        ].map(({ label, value, color }) => (
          <div key={label} className="pixel-border p-3 text-center">
            <div className="text-[18px] font-bold mb-1" style={{ color, fontFamily: '"Press Start 2P", monospace' }}>
              {value}
            </div>
            <div className="text-[7px] text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Stock Table */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[9px] text-pixel-green">► LIVE MARKET DATA</span>
          <span className="animate-blink text-[9px] text-pixel-green">●</span>
          <span className="text-[7px] text-gray-500">CLICK HEADERS TO SORT</span>
        </div>
        <StockTable stocks={stocks} />
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 text-[7px] text-gray-600">
        <div className="mb-1">GS HACKATHON 2026 · TEAM STOCKQUEST</div>
        <div>* FOR EDUCATIONAL PURPOSES ONLY · NOT FINANCIAL ADVICE</div>
      </footer>
    </main>
  );
}
