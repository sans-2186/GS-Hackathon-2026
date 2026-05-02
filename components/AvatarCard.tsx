'use client';
import type { Stock } from '@/lib/types';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import Keyword from './Keyword';

interface AvatarCardProps { stock: Stock; investment: number; }

const SECTOR_COLORS: Record<string, string> = {
  tech: '#38bdf8', finance: '#fcd34d', energy: '#fb923c', manufacturing: '#a3e635',
};
const SECTOR_EMOJIS: Record<string, string> = {
  tech: '💻', finance: '💰', energy: '⚡', manufacturing: '⚙️',
};

function generateSparklineData(stock: Stock) {
  const pts = 14;
  const data = [];
  let v = 100;
  for (let i = 0; i < pts; i++) {
    v = v * (1 + stock.returnRate / 100 / 12 + Math.sin(i * 2.1 + stock.beta) * stock.volatility * 0.3);
    data.push({ v: parseFloat(v.toFixed(2)) });
  }
  return data;
}

export default function AvatarCard({ stock, investment }: AvatarCardProps) {
  const color = SECTOR_COLORS[stock.sector];
  const sparkData = generateSparklineData(stock);
  const projectedGain = investment * (stock.returnRate / 100);
  const initial = stock.ticker.charAt(0).toUpperCase();

  return (
    <div className="forest-card p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none" style={{ background: color }} />

      {/* Avatar face + nametag */}
      <div className="flex items-center gap-4 mb-4">
        {/* Logo face — company initial in a circle */}
        <div className="relative flex-shrink-0">
          {/* Nametag above */}
          <div
            className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap"
            style={{ background: `${color}22`, border: `1px solid ${color}80`, color }}
          >
            ${stock.ticker}
          </div>
          {/* Circle face */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display select-none animate-float"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${color}40, ${color}15)`,
              border: `3px solid ${color}`,
              boxShadow: `0 0 20px ${color}40`,
              color,
            }}
          >
            {initial}
          </div>
          {/* Sector emoji badge */}
          <div className="absolute -bottom-1 -right-1 text-base" title={stock.sector}>
            {SECTOR_EMOJIS[stock.sector]}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl" style={{ color }}>{stock.company.split(' ').slice(0,3).join(' ')}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="badge text-xs" style={{ background: `${color}20`, color, border: `1px solid ${color}50` }}>
              {SECTOR_EMOJIS[stock.sector]} {stock.sector}
            </span>
            <span className="badge text-xs" style={{
              background: stock.risk === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
              color: stock.risk === 'high' ? '#f87171' : '#4ade80',
              border: `1px solid ${stock.risk === 'high' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
            }}>
              {stock.risk === 'high' ? '🔥 High Risk' : '🛡 Low Risk'}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-forest-pale leading-relaxed mb-4">{stock.description}</p>

      {/* Sparkline */}
      <div className="mb-4">
        <div className="text-xs text-forest-light mb-1">📈 12-Month Trend (Simulated)</div>
        <div className="h-14 rounded-lg overflow-hidden" style={{ background: 'rgba(13,31,13,0.5)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
              <Tooltip
                contentStyle={{ background: '#0d1f0d', border: `1px solid ${color}50`, fontSize: 11, fontFamily: 'Nunito,sans-serif', borderRadius: 8 }}
                formatter={(v: number) => [`$${v}`, 'Value']}
                labelFormatter={() => ''}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: <Keyword term="price">Price</Keyword>, value: `$${stock.price.toFixed(2)}`, color: '#fcd34d' },
          { label: <Keyword term="return%">Return</Keyword>, value: `+${stock.returnRate.toFixed(1)}%`, color: '#4ade80' },
          { label: <Keyword term="volatility">Volatility</Keyword>, value: `${(stock.volatility*100).toFixed(0)}%`, color: stock.volatility > 0.4 ? '#f87171' : '#94a3b8' },
          { label: <Keyword term="beta">Beta</Keyword>, value: stock.beta.toFixed(2), color: stock.beta > 1.3 ? '#f87171' : '#94a3b8' },
          { label: <Keyword term="div.yield">Div. Yield</Keyword>, value: `${stock.dividendYield.toFixed(2)}%`, color: stock.dividendYield > 3 ? '#4ade80' : '#94a3b8' },
          { label: <Keyword term="p/e ratio">P/E</Keyword>, value: stock.peRatio.toFixed(1), color: '#94a3b8' },
        ].map(({ label, value, color: c }, i) => (
          <div key={i} className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(13,31,13,0.6)', border: '1px solid rgba(26,58,26,0.8)' }}>
            <div className="text-xs text-forest-light mb-0.5">{label}</div>
            <div className="text-sm font-bold" style={{ color: c }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Projection */}
      <div className="rounded-xl p-3 text-center" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
        <div className="text-xs text-forest-light mb-1">Projected Annual Gain</div>
        <div className="font-display text-lg" style={{ color }}>
          ${investment.toLocaleString()} → ${(investment + projectedGain).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-forest-bright mt-0.5">+${projectedGain.toLocaleString(undefined, { maximumFractionDigits: 0 })} estimated</div>
      </div>

      {/* #1 badge */}
      <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full font-bold" style={{ background: color, color: '#0d1f0d' }}>
        #1 Pick
      </div>
    </div>
  );
}
