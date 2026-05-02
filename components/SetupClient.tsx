'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Stock, Sector, RiskLevel } from '@/lib/types';
import { filterStocks } from '@/lib/stockFilter';
import { useGameStore } from '@/store/gameStore';
import { useSound } from '@/lib/useSound';

const AvatarCard = dynamic(() => import('@/components/AvatarCard'), { ssr: false });

interface SetupClientProps { stocks: Stock[]; }

const SECTOR_OPTIONS: { value: Sector; label: string; desc: string; emoji: string; color: string }[] = [
  { value: 'tech', label: 'Technology', desc: 'Software, hardware, AI & cloud', emoji: '💻', color: '#38bdf8' },
  { value: 'finance', label: 'Finance', desc: 'Banks, payments & investments', emoji: '💰', color: '#fcd34d' },
  { value: 'energy', label: 'Energy', desc: 'Oil, gas & renewables', emoji: '⚡', color: '#fb923c' },
  { value: 'manufacturing', label: 'Manufacturing', desc: 'Industrial, aerospace & machinery', emoji: '⚙️', color: '#a3e635' },
];

export default function SetupClient({ stocks }: SetupClientProps) {
  const router = useRouter();
  const { setSelectedStock, setInvestment, setGameEvents, user } = useGameStore();
  const { play, startNature } = useSound();

  const [sector, setSector] = useState<Sector>('tech');
  const [risk, setRisk] = useState<RiskLevel>('low');
  const [amount, setAmount] = useState<number>(1000);
  const [amountStr, setAmountStr] = useState('1000');
  const [finalists, setFinalists] = useState<Stock[]>([]);
  const [picked, setPicked] = useState<Stock | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [descended, setDescended] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

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
    play('click');
    setDescended(true);
    setSelectedStock(picked);
    setInvestment(amount);
    const { generateCourse } = await import('@/lib/gameSeed');
    setGameEvents(generateCourse(picked));
    setTimeout(() => {
      startNature();
      setCountdown(3);
      let c = 3;
      const iv = setInterval(() => {
        c--;
        play('countdown');
        if (c <= 0) { clearInterval(iv); router.push('/game'); }
        else setCountdown(c);
      }, 1000);
    }, 800);
  }

  if (countdown !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#2d5a27,#0d1f0d)' }}>
        <div className="text-center">
          <div className="text-8xl font-display" style={{ color: countdown > 1 ? '#fcd34d' : '#22c55e', textShadow: `0 0 40px ${countdown > 1 ? '#fcd34d' : '#22c55e'}` }}>
            {countdown}
          </div>
          <div className="text-forest-pale text-lg mt-4 font-semibold">Get Ready!</div>
          <div className="text-3xl mt-2 animate-bounce-gentle">🏁</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const sectorColor = SECTOR_OPTIONS.find(s => s.value === sector)?.color ?? '#22c55e';

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Sky section */}
      <div
        className="fixed inset-0 transition-transform duration-1000 ease-in-out pointer-events-none"
        style={{ transform: descended ? 'translateY(-40%)' : 'translateY(0)' }}
      >
        {/* Sky */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0ea5e9 0%,#7dd3fc 40%,#fbbf24 70%,#fde68a 100%)', height: '55vh' }} />
        {/* Sun */}
        <div className="absolute" style={{ width: 70, height: 70, borderRadius: '50%', background: 'radial-gradient(circle,#fef9c3,#fcd34d)', boxShadow: '0 0 50px rgba(252,211,77,0.7)', top: '8%', right: '12%' }} />
        {/* Clouds */}
        {[0,1,2,3].map(i => (
          <div key={i} className="absolute text-4xl opacity-75" style={{ top: `${5+i*5}%`, left: `-100px`, animation: `cloudDrift ${16+i*5}s linear ${i*4}s infinite` }}>☁️</div>
        ))}
        {/* Tree silhouette transition */}
        <div className="absolute w-full" style={{ top: '48vh' }}>
          <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="w-full">
            <path d="M0,160 L0,80 Q60,20 120,80 Q180,20 240,80 Q300,0 360,80 Q420,20 480,80 Q540,0 600,60 Q660,10 720,70 Q780,10 840,80 Q900,20 960,80 Q1020,0 1080,70 Q1140,20 1200,80 Q1260,10 1320,60 Q1380,30 1440,80 L1440,160 Z" fill="#1a3a1a"/>
            <path d="M0,160 L0,110 Q80,60 160,120 Q240,70 320,130 Q400,60 480,130 Q560,80 640,140 Q720,70 800,135 Q880,80 960,140 Q1040,70 1120,135 Q1200,80 1280,130 Q1360,90 1440,130 L1440,160 Z" fill="#0d1f0d"/>
          </svg>
        </div>
        {/* Forest floor */}
        <div className="absolute w-full bottom-0" style={{ height: '45vh', background: 'linear-gradient(180deg,#1a3a1a 0%,#0d1f0d 100%)', top: '55vh' }} />
        {/* Floating forest emojis */}
        {['🦋','🐦','🍃','🌿'].map((e, i) => (
          <span key={i} className="absolute animate-float text-2xl opacity-50" style={{ left:`${15+i*20}%`, top:`${25+i*5}%`, animationDelay:`${i*0.7}s` }}>{e}</span>
        ))}
      </div>

      {/* Content layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top nav */}
        <div className="p-4 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="forest-btn forest-btn-outline text-sm py-2 px-4">← Back</button>
          <h1 className="font-display text-2xl text-white drop-shadow-lg">Choose Your Champion</h1>
        </div>

        <div className="flex-1 flex items-start justify-center px-4 pb-8 pt-4">
          <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6">
            {/* LEFT — inputs */}
            <div className="space-y-5">
              {/* Sector */}
              <div className="forest-card p-5">
                <label className="block text-sm font-bold text-forest-bright mb-3">🌍 Choose Sector</label>
                <div className="grid grid-cols-2 gap-2">
                  {SECTOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { play('click'); setSector(opt.value); }}
                      className="p-3 rounded-xl text-left transition-all duration-200 hover:scale-105"
                      style={{
                        border: `1.5px solid ${sector === opt.value ? opt.color : 'rgba(134,239,172,0.15)'}`,
                        background: sector === opt.value ? `${opt.color}18` : 'rgba(13,31,13,0.6)',
                        boxShadow: sector === opt.value ? `0 0 12px ${opt.color}40` : 'none',
                      }}
                    >
                      <div className="text-2xl mb-1">{opt.emoji}</div>
                      <div className="text-sm font-bold" style={{ color: sector === opt.value ? opt.color : '#86efac' }}>{opt.label}</div>
                      <div className="text-xs text-forest-light mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk */}
              <div className="forest-card p-5">
                <label className="block text-sm font-bold text-forest-bright mb-3">⚖️ Risk Tolerance</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['low', 'high'] as RiskLevel[]).map((r) => (
                    <button key={r} onClick={() => { play('click'); setRisk(r); }}
                      className="p-4 rounded-xl text-center transition-all duration-200"
                      style={{
                        border: `1.5px solid ${risk === r ? (r === 'high' ? '#ef4444' : '#22c55e') : 'rgba(134,239,172,0.15)'}`,
                        background: risk === r ? (r === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)') : 'rgba(13,31,13,0.6)',
                      }}>
                      <div className="text-2xl mb-1">{r === 'high' ? '🔥' : '🛡️'}</div>
                      <div className="font-bold text-sm" style={{ color: r === 'high' ? '#f87171' : '#4ade80' }}>{r.toUpperCase()} RISK</div>
                      <div className="text-xs text-forest-light mt-1">{r === 'high' ? 'Higher upside, more volatility' : 'Stable, steady growth'}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="forest-card p-5">
                <label className="block text-sm font-bold text-forest-bright mb-3">💵 Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-mid font-bold text-base pointer-events-none">$</span>
                  <input type="number" value={amountStr} onChange={(e) => handleAmountChange(e.target.value)}
                    className="forest-input" style={{ paddingLeft: '1.75rem' }} min="1" step="100" placeholder="1000" />
                </div>
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 5000, 10000].map((v) => (
                    <button key={v} onClick={() => { setAmount(v); setAmountStr(String(v)); }}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: amount === v ? 'rgba(245,158,11,0.2)' : 'rgba(26,58,26,0.6)',
                        border: `1px solid ${amount === v ? '#f59e0b' : 'rgba(134,239,172,0.2)'}`,
                        color: amount === v ? '#fcd34d' : '#86efac',
                      }}>
                      ${v >= 1000 ? `${v/1000}K` : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finalists */}
              {finalists.length > 0 && (
                <div className="forest-card p-4">
                  <label className="block text-sm font-bold text-forest-bright mb-3">🏆 Matching Stocks</label>
                  <div className="space-y-1.5">
                    {finalists.map((s, i) => (
                      <div key={s.ticker} onClick={() => setPicked(s)}
                        className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all"
                        style={{
                          border: `1.5px solid ${picked?.ticker === s.ticker ? sectorColor : 'rgba(134,239,172,0.1)'}`,
                          background: picked?.ticker === s.ticker ? `${sectorColor}15` : 'rgba(13,31,13,0.5)',
                        }}>
                        <span className="text-lg">{SECTOR_OPTIONS.find(o => o.value === s.sector)?.emoji}</span>
                        <span className="font-bold text-sm w-12" style={{ color: sectorColor }}>{s.ticker}</span>
                        <span className="text-xs text-forest-pale flex-1 truncate">{s.company}</span>
                        <span className="text-sm font-bold text-forest-bright">+{s.returnRate.toFixed(1)}%</span>
                        {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sectorColor, color: '#0d1f0d' }}>AI Pick</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finalists.length === 0 && (
                <div className="forest-card p-5 text-center" style={{ border: '1.5px solid rgba(239,68,68,0.3)' }}>
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="text-sm text-red-300 mb-1">No stocks found</div>
                  <div className="text-xs text-forest-light">Try a higher investment amount or different sector/risk.</div>
                </div>
              )}
            </div>

            {/* RIGHT — avatar card + CTA */}
            <div className="space-y-4">
              {picked ? (
                <>
                  <label className="block text-sm font-bold text-forest-bright">🦸 Your Champion</label>
                  <AvatarCard stock={picked} investment={amount} />
                  <button onClick={handleStart} className="forest-btn forest-btn-gold w-full text-xl py-5">
                    🏁 Start Race!
                  </button>
                  <p className="text-center text-xs text-forest-light">Use ↑ to jump · → to dash · ↓ to duck</p>
                </>
              ) : (
                <div className="forest-card p-10 flex flex-col items-center justify-center gap-4 h-80">
                  <div className="text-5xl animate-float">🌲</div>
                  <p className="text-forest-pale text-sm text-center">Select your preferences to reveal your champion</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
