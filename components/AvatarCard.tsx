'use client';
import type { Stock } from '@/lib/types';
import { getAvatarConfig, getSectorIcon } from '@/lib/avatarGenerator';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface AvatarCardProps {
  stock: Stock;
  investment: number;
}

function generateSparklineData(stock: Stock) {
  const points = 12;
  const data = [];
  let value = 100;
  for (let i = 0; i < points; i++) {
    value = value * (1 + (stock.returnRate / 100 / 12) + (Math.sin(i * 2.1 + stock.beta) * stock.volatility * 0.3));
    data.push({ v: parseFloat(value.toFixed(2)) });
  }
  return data;
}

export default function AvatarCard({ stock, investment }: AvatarCardProps) {
  const cfg = getAvatarConfig(stock.sector, stock.risk);
  const sparkData = generateSparklineData(stock);
  const projectedGain = investment * (stock.returnRate / 100);

  return (
    <div
      className="p-5 bg-pixel-dark relative overflow-hidden"
      style={{
        border: `2px solid ${cfg.borderColor}`,
        boxShadow: `0 0 0 2px #0a0a0a, 0 0 0 4px ${cfg.borderColor}, 0 0 30px ${cfg.bgColor}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar sprite */}
        <div
          className="w-20 h-20 flex items-center justify-center text-4xl flex-shrink-0 animate-float"
          style={{
            background: cfg.bgColor,
            border: `2px solid ${cfg.borderColor}`,
            imageRendering: 'pixelated',
          }}
        >
          {getSectorIcon(stock.sector)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[18px] font-bold glow-green"
              style={{ color: cfg.color, fontFamily: '"Press Start 2P", monospace' }}
            >
              ${stock.ticker}
            </span>
            <span
              className="text-[7px] px-2 py-1"
              style={{
                color: stock.risk === 'high' ? '#ff3131' : '#00ff41',
                border: `1px solid ${stock.risk === 'high' ? '#ff3131' : '#00ff41'}`,
                background: stock.risk === 'high' ? 'rgba(255,49,49,0.1)' : 'rgba(0,255,65,0.1)',
              }}
            >
              {stock.risk.toUpperCase()} RISK
            </span>
          </div>
          <div className="text-[8px] text-gray-400 mb-2 truncate">{stock.company}</div>
          <div
            className="inline-block text-[7px] px-2 py-1"
            style={{ color: cfg.accentColor, border: `1px solid ${cfg.accentColor}`, background: `${cfg.accentColor}15` }}
          >
            {stock.sector.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[7px] text-gray-400 leading-relaxed mb-4">{stock.description}</p>

      {/* Sparkline */}
      <div className="mb-4">
        <div className="text-[7px] text-gray-500 mb-1">12-MO TREND (SIMULATED)</div>
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={cfg.color}
                strokeWidth={2}
                dot={false}
              />
              <Tooltip
                contentStyle={{ background: '#0a0a0a', border: `1px solid ${cfg.borderColor}`, fontSize: 8, fontFamily: '"Press Start 2P", monospace' }}
                formatter={(v: number) => [`${v}`, 'VALUE']}
                labelFormatter={() => ''}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'PRICE', value: `$${stock.price.toFixed(2)}`, color: '#ffd700' },
          { label: 'RETURN', value: `+${stock.returnRate.toFixed(1)}%`, color: '#00ff41' },
          { label: 'VOLATILITY', value: `${(stock.volatility * 100).toFixed(0)}%`, color: stock.volatility > 0.4 ? '#ff3131' : '#ccc' },
          { label: 'BETA', value: stock.beta.toFixed(2), color: stock.beta > 1.3 ? '#ff3131' : '#ccc' },
          { label: 'DIV. YIELD', value: `${stock.dividendYield.toFixed(2)}%`, color: stock.dividendYield > 3 ? '#00ff41' : '#999' },
          { label: 'P/E RATIO', value: stock.peRatio.toFixed(1), color: '#ccc' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-2 bg-pixel-gray border border-gray-800">
            <div className="text-[6px] text-gray-500 mb-1">{label}</div>
            <div className="text-[9px]" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Investment projection */}
      <div
        className="p-3 text-center"
        style={{ background: `${cfg.bgColor}`, border: `1px solid ${cfg.borderColor}` }}
      >
        <div className="text-[7px] text-gray-400 mb-1">PROJECTED ANNUAL GAIN</div>
        <div className="text-[12px]" style={{ color: cfg.color }}>
          ${investment.toLocaleString()} → ${(investment + projectedGain).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div className="text-[7px] mt-1" style={{ color: '#00ff41' }}>
          +${projectedGain.toLocaleString(undefined, { maximumFractionDigits: 0 })} estimated
        </div>
      </div>

      {/* #1 badge */}
      <div
        className="absolute top-3 right-3 text-[7px] px-2 py-1"
        style={{ background: cfg.borderColor, color: '#0a0a0a' }}
      >
        #1 PICK
      </div>
    </div>
  );
}
