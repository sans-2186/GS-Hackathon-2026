'use client';
import Keyword from '@/components/Keyword';

interface StatFlashcardProps {
  icon: string;
  label: string;
  term: string;         // for Keyword hover def
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  className?: string;
}

export default function StatFlashcard({
  icon,
  label,
  term,
  value,
  subValue,
  trend = 'neutral',
  color = '#22c55e',
  className = '',
}: StatFlashcardProps) {
  const trendArrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '';
  const trendColor = trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : '#94a3b8';

  return (
    <div
      className={`forest-card p-5 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 ${className}`}
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {trendArrow && (
          <span className="text-sm font-bold" style={{ color: trendColor }}>
            {trendArrow}
          </span>
        )}
      </div>

      <div>
        <div className="text-xs text-forest-pale mb-0.5 cursor-help">
          <Keyword term={term}>{label}</Keyword>
        </div>
        <div className="font-display text-2xl" style={{ color }}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-forest-light mt-0.5">{subValue}</div>
        )}
      </div>
    </div>
  );
}
