'use client';
import { useState, useRef, useCallback } from 'react';

const DEFINITIONS: Record<string, string> = {
  volatility: 'How wildly a stock price swings up and down. Higher = more unpredictable.',
  beta: 'How much a stock moves compared to the overall market. Beta > 1 means more volatile than the market.',
  'div.yield': 'Dividend Yield — the annual cash payout as a % of the stock price. Higher = more passive income.',
  'p/e ratio': 'Price-to-Earnings ratio. How much investors pay per $1 of profit. Higher can mean overvalued.',
  'return%': 'Historical annual return — how much the stock grew in percentage over the past year.',
  price: 'Current market price per share in USD.',
  risk: 'Our classification: Low = stable blue-chip, High = growth/speculative with bigger swings.',
  sector: 'The industry the company operates in: Tech, Finance, Energy, or Manufacturing.',
  beta_full: 'Measures stock sensitivity to market moves. 1.5 beta = moves 1.5x the market.',
  marketcap: 'Total market value of all shares. Large-cap = $10B+, Mid-cap = $2–10B.',
  momentum: 'Recent price trend direction and strength — a measure of buying/selling pressure.',
};

interface KeywordProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

export default function Keyword({ term, children, className = '' }: KeywordProps) {
  const key = term.toLowerCase();
  const definition =
    DEFINITIONS[key] ??
    DEFINITIONS[Object.keys(DEFINITIONS).find(k => key.includes(k)) ?? ''] ??
    null;

  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  const handleEnter = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    setVisible(true);
  }, []);

  if (!definition) return <span className={className}>{children}</span>;

  return (
    <>
      <span
        ref={ref}
        className={`border-b border-dotted border-forest-bright/60 cursor-help ${className}`}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>

      {visible && (
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'rgba(5,15,5,0.97)',
            border: '1px solid rgba(34,197,94,0.5)',
            borderRadius: 8,
            padding: '7px 12px',
            fontSize: 12,
            fontFamily: 'Nunito, sans-serif',
            color: '#d1fae5',
            maxWidth: 240,
            whiteSpace: 'normal',
            boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
            lineHeight: 1.5,
          }}>
            {definition}
            <div style={{
              position: 'absolute',
              bottom: -6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(34,197,94,0.5)',
            }} />
          </div>
        </div>
      )}
    </>
  );
}
