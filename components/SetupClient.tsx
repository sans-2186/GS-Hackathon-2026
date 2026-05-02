'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Stock, Sector, RiskLevel } from '@/lib/types';
import { filterStocks, pickBestStock } from '@/lib/stockFilter';
import { getAvatarConfig, getSectorIcon } from '@/lib/avatarGenerator';
import { useGameStore } from '@/store/gameStore';
import dynamic from 'next/dynamic';

const AvatarCard = dynamic(() => import('@/components/AvatarCard'), { ssr: false });

interface SetupClientProps {
  stocks: Stock[];
}

const SECTOR_OPTIONS: { value: Sector; label: string; desc: string; emoji: string }[] = [
  { value: 'tech', label: 'TECHNOLOGY', desc: 'Software, hardware, AI & cloud', emoji: '💻' },
  { value: 'finance', label: 'FINANCE', desc: 'Banks, payments & investments', emoji: '💰' },
  { value: 'energy', label: 'ENERGY', desc: 'Oil, gas & renewables', emoji: '⚡' },
  { value: 'manufacturing', label: 'MANUFACTURING', desc: 'Industrial, aerospace & machinery', emoji: '⚙️' },
];

export default function SetupClient({ stocks }: SetupClientProps) {
  const router = useRouter();
  const { setSelectedStock, setInvestment, setGameEvents } = useGameStore();

  const [sector, setSector] = useState<Sector>('tech');
  const [risk, setRisk] = useState<RiskLevel>('low');
  const [amount, setAmount] = useState<number>(1000);
  const [amountStr, setAmountStr] = useState('1000');
  const [finalists, setFinalists] = useState<Stock[]>([]);
  const [picked, setPicked] = useState<Stock | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const filtered = filterStocks(stocks, sector, risk, amount);
    setFinalists(filtered.slice(0, 5));
    setPicked(filtered[0] ?? null);
  }, [sector, risk, amount, stocks]);

  function handleAmountChange(val: string) {
    setAmountStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) setAmount(num);
  }

  async function handleStart() {
    if (!picked) return;
    setSelectedStock(picked);
    setInvestment(amount);

    // Generate game course
    const { generateCourse } = await import('@/lib/gameSeed');
    const course = generateCourse(picked);
    // #region agent log
    fetch('http://127.0.0.1:7317/ingest/db66ef74-30f5-40d2-acf7-ffd6771fd886',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e6835'},body:JSON.stringify({sessionId:'1e6835',hypothesisId:'C+D',location:'SetupClient.tsx:handleStart',message:'generateCourse completed, setting game events',data:{ticker:picked.ticker,courseLen:course.length,firstEvent:course[0],hasNaN:course.some(e=>isNaN(e.position)||isNaN(e.impactPercent))},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setGameEvents(course);

    // Countdown 3-2-1
    setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(iv);
        router.push('/game');
      } else {
        setCountdown(c);
      }
    }, 1000);
  }

  const cfg = picked ? getAvatarConfig(picked.sector, picked.risk) : null;

  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-pixel-dark flex items-center justify-center">
        <div className="text-center">
          {countdown > 0 ? (
            <div
              className="text-9xl glow-green animate-pulse"
              style={{ color: '#00ff41', fontFamily: '"Press Start 2P", monospace' }}
            >
              {countdown}
            </div>
          ) : (
            <div
              className="text-6xl glow-yellow"
              style={{ color: '#ffd700', fontFamily: '"Press Start 2P", monospace' }}
            >
              GO!
            </div>
          )}
          <div className="text-[9px] text-gray-500 mt-4">GET READY TO RUN...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-pixel-dark p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.push('/')}
            className="pixel-btn pixel-btn-outline text-[8px] py-2 px-3"
          >
            ← BACK
          </button>
          <h1
            className="text-sm glow-green"
            style={{ color: '#00ff41', fontFamily: '"Press Start 2P", monospace' }}
          >
            CHOOSE YOUR STOCK
          </h1>
        </div>
        <div className="text-[7px] text-gray-500">
          SELECT YOUR PREFERENCES. WE&apos;LL PICK THE BEST STOCK FOR YOU.
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Left — inputs */}
        <div className="space-y-6">
          {/* Sector */}
          <div>
            <label className="block text-[9px] text-pixel-green mb-3">► SELECT SECTOR</label>
            <div className="grid grid-cols-2 gap-2">
              {SECTOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSector(opt.value)}
                  className="p-3 text-left transition-all"
                  style={{
                    border: sector === opt.value ? '2px solid #00ff41' : '2px solid #333',
                    background: sector === opt.value ? 'rgba(0,255,65,0.08)' : '#111',
                    boxShadow: sector === opt.value ? '0 0 10px rgba(0,255,65,0.2)' : 'none',
                  }}
                >
                  <div className="text-2xl mb-1">{opt.emoji}</div>
                  <div className="text-[8px] text-pixel-green mb-1">{opt.label}</div>
                  <div className="text-[6px] text-gray-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Risk */}
          <div>
            <label className="block text-[9px] text-pixel-green mb-3">► RISK TOLERANCE</label>
            <div className="grid grid-cols-2 gap-2">
              {(['low', 'high'] as RiskLevel[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className="p-4 text-center transition-all"
                  style={{
                    border: risk === r
                      ? `2px solid ${r === 'high' ? '#ff3131' : '#00ff41'}`
                      : '2px solid #333',
                    background: risk === r
                      ? r === 'high' ? 'rgba(255,49,49,0.08)' : 'rgba(0,255,65,0.08)'
                      : '#111',
                  }}
                >
                  <div className="text-2xl mb-1">{r === 'high' ? '🔥' : '🛡️'}</div>
                  <div
                    className="text-[9px]"
                    style={{ color: r === 'high' ? '#ff3131' : '#00ff41' }}
                  >
                    {r.toUpperCase()} RISK
                  </div>
                  <div className="text-[6px] text-gray-500 mt-1">
                    {r === 'high' ? 'More volatility, higher upside' : 'Stable, steady growth'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Investment Amount */}
          <div>
            <label className="block text-[9px] text-pixel-green mb-3">► INVESTMENT AMOUNT ($)</label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px]"
                style={{ color: '#ffd700', fontFamily: '"Press Start 2P", monospace' }}
              >
                $
              </span>
              <input
                type="number"
                value={amountStr}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pixel-input pl-8"
                min="1"
                step="100"
                placeholder="1000"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[500, 1000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  onClick={() => { setAmount(v); setAmountStr(String(v)); }}
                  className="pixel-btn pixel-btn-outline text-[7px] py-1 px-2 flex-1"
                >
                  ${v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
            </div>
          </div>

          {/* Finalists list */}
          {finalists.length > 0 && (
            <div>
              <label className="block text-[9px] text-pixel-green mb-3">
                ► MATCHING STOCKS ({finalists.length})
              </label>
              <div className="space-y-1">
                {finalists.map((s, i) => {
                  const c = getAvatarConfig(s.sector, s.risk);
                  return (
                    <div
                      key={s.ticker}
                      className="flex items-center gap-3 p-2 cursor-pointer transition-all"
                      style={{
                        border: picked?.ticker === s.ticker ? `2px solid ${c.borderColor}` : '2px solid #222',
                        background: picked?.ticker === s.ticker ? c.bgColor : '#111',
                      }}
                      onClick={() => setPicked(s)}
                    >
                      <span className="text-lg">{getSectorIcon(s.sector)}</span>
                      <span
                        className="text-[8px] font-bold w-12"
                        style={{ color: c.color }}
                      >
                        {s.ticker}
                      </span>
                      <span className="text-[7px] text-gray-400 flex-1 truncate">{s.company}</span>
                      <span className="text-[8px]" style={{ color: '#00ff41' }}>
                        +{s.returnRate.toFixed(1)}%
                      </span>
                      {i === 0 && (
                        <span className="text-[6px] px-1" style={{ background: c.borderColor, color: '#0a0a0a' }}>
                          AI PICK
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {finalists.length === 0 && (
            <div className="pixel-border-red p-4 text-center">
              <div className="text-[8px] text-pixel-red mb-2">NO STOCKS FOUND</div>
              <div className="text-[7px] text-gray-400">
                Try increasing your investment amount or changing sector/risk level.
              </div>
            </div>
          )}
        </div>

        {/* Right — avatar card + start */}
        <div className="space-y-4">
          {picked ? (
            <>
              <div className="text-[9px] text-pixel-green mb-2">► YOUR CHAMPION</div>
              <AvatarCard stock={picked} investment={amount} />
              <button
                onClick={handleStart}
                className="pixel-btn pixel-btn-green w-full text-[12px] py-5"
                style={{ fontSize: 11 }}
              >
                ▶ START RACE
              </button>
              <div className="text-center text-[7px] text-gray-500">
                PRESS SPACE TO JUMP OVER OBSTACLES
              </div>
            </>
          ) : (
            <div className="pixel-border p-8 text-center h-full flex flex-col items-center justify-center gap-4">
              <div className="text-4xl animate-float">🔍</div>
              <div className="text-[8px] text-gray-400">
                SELECT YOUR PREFERENCES TO SEE YOUR STOCK CHAMPION
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
