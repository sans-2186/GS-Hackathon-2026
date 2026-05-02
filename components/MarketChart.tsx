'use client';
import type { Stock } from '@/lib/types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface MarketChartProps { stocks: Stock[]; }

const SECTOR_COLORS: Record<string, string> = {
  tech: '#38bdf8',
  finance: '#fcd34d',
  energy: '#fb923c',
  manufacturing: '#a3e635',
};

const SECTOR_LABELS: Record<string, string> = {
  tech: '💻 Tech',
  finance: '💰 Finance',
  energy: '⚡ Energy',
  manufacturing: '⚙️ MFG',
};

function buildSectorCurve(stocks: Stock[], sector: string) {
  const sectorStocks = stocks.filter(s => s.sector === sector);
  if (!sectorStocks.length) return [];
  const avgReturn = sectorStocks.reduce((sum, s) => sum + s.returnRate, 0) / sectorStocks.length;
  const avgVolatility = sectorStocks.reduce((sum, s) => sum + s.volatility, 0) / sectorStocks.length;
  const avgBeta = sectorStocks.reduce((sum, s) => sum + s.beta, 0) / sectorStocks.length;

  const pts = 13; // monthly points
  const data = [];
  let v = 100;
  for (let i = 0; i < pts; i++) {
    v = v * (1 + avgReturn / 100 / 12 + Math.sin(i * 1.7 + avgBeta * 2) * avgVolatility * 0.18);
    data.push(parseFloat(v.toFixed(2)));
  }
  return data;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Now'];

export default function MarketChart({ stocks }: MarketChartProps) {
  const sectors = ['tech', 'finance', 'energy', 'manufacturing'];
  const curves: Record<string, number[]> = {};
  for (const s of sectors) curves[s] = buildSectorCurve(stocks, s);

  const chartData = MONTHS.map((month, i) => {
    const row: Record<string, string | number> = { month };
    for (const s of sectors) row[s] = curves[s][i] ?? 100;
    return row;
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(5,15,5,0.96)',
        border: '1px solid rgba(34,197,94,0.35)',
        borderRadius: 10,
        padding: '10px 14px',
        fontFamily: 'Nunito, sans-serif',
        fontSize: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      }}>
        <div style={{ color: '#86efac', marginBottom: 6, fontWeight: 700 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: p.color, marginBottom: 2 }}>
            <span>{SECTOR_LABELS[p.name]}</span>
            <span style={{ fontWeight: 700 }}>${p.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {sectors.map(s => (
            <linearGradient key={s} id={`grad-${s}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SECTOR_COLORS[s]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={SECTOR_COLORS[s]} stopOpacity={0.03} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
        <XAxis
          dataKey="month"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Nunito,sans-serif' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Nunito,sans-serif' }}
          axisLine={false} tickLine={false}
          tickFormatter={(v) => `$${v}`}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        {sectors.map(s => (
          <Area
            key={s}
            type="monotone"
            dataKey={s}
            stroke={SECTOR_COLORS[s]}
            strokeWidth={2}
            fill={`url(#grad-${s})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: SECTOR_COLORS[s] }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
