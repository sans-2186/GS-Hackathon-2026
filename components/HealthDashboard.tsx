'use client';
import { useMemo } from 'react';
import StatFlashcard from '@/components/StatFlashcard';
import type { SuggestedPortfolio, AISuggestion, UserProfile } from '@/lib/portfolioAnalytics';

interface HealthDashboardProps {
  portfolio: SuggestedPortfolio;
  suggestions: AISuggestion[];
  profile: UserProfile;
  onSuggestionClick?: (id: string) => void;
}

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

function HealthRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : 'Weak';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(34,197,94,0.12)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl" style={{ color }}>{score}</span>
          <span className="text-xs text-forest-pale">/100</span>
        </div>
      </div>
      <div>
        <div className="font-display text-sm text-center" style={{ color }}>{label}</div>
        <div className="text-xs text-forest-pale text-center">Portfolio Health</div>
      </div>
    </div>
  );
}

export default function HealthDashboard({ portfolio, suggestions, profile, onSuggestionClick }: HealthDashboardProps) {
  const { healthScore, riskLevel, expectedReturn, crashResilience, sectorWeights } = portfolio;

  const returnTrend = expectedReturn >= 0.05 ? 'up' : expectedReturn < 0 ? 'down' : 'neutral';
  const healthTrend = healthScore >= 70 ? 'up' : healthScore < 50 ? 'down' : 'neutral';

  const riskColor =
    riskLevel === 'Low' ? '#22c55e' : riskLevel === 'High' ? '#ef4444' : '#f59e0b';

  const sectorEntries = useMemo(
    () => Object.entries(sectorWeights).filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]),
    [sectorWeights],
  );

  const GOAL_TEXT: Record<string, string> = {
    grow_wealth: 'Growing Wealth',
    preserve_capital: 'Capital Preservation',
    generate_income: 'Income Generation',
  };
  const RISK_TEXT: Record<string, string> = {
    conservative: 'Conservative',
    balanced: 'Balanced',
    growth: 'Growth',
  };

  return (
    <div className="space-y-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl text-forest-bright">🌱 Your Portfolio Health</h2>
          <p className="text-sm text-white/60 mt-0.5">
            Based on your goal: <span className="text-forest-pale font-semibold">{GOAL_TEXT[profile.goal]}</span>
            {' · '}
            <span className="text-forest-pale font-semibold">{RISK_TEXT[profile.riskComfort]}</span> style
          </p>
        </div>
        <div
          className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: 'rgba(252,211,77,0.12)', border: '1px solid rgba(252,211,77,0.35)', color: '#fcd34d' }}
        >
          💰 ${profile.startingAmount.toLocaleString()} invested
        </div>
      </div>

      {/* Health ring + stat cards */}
      <div className="forest-card p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Ring */}
          <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
            <HealthRing score={healthScore} />
          </div>

          {/* Stat cards grid */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <StatFlashcard
              icon="❤️"
              label="Portfolio Health"
              term="health score"
              value={`${healthScore}/100`}
              subValue={healthScore >= 75 ? 'Well protected' : healthScore >= 50 ? 'Room to improve' : 'Needs attention'}
              trend={healthTrend}
              color={healthScore >= 75 ? '#22c55e' : healthScore >= 50 ? '#f59e0b' : '#ef4444'}
            />
            <StatFlashcard
              icon="⚖️"
              label="Risk Level"
              term="risk level"
              value={riskLevel}
              subValue={riskLevel === 'Low' ? 'Stable & steady' : riskLevel === 'High' ? 'High potential swings' : 'Moderate swings'}
              color={riskColor}
            />
            <StatFlashcard
              icon="📈"
              label="Expected Annual Return"
              term="expected return"
              value={`${expectedReturn >= 0 ? '+' : ''}${(expectedReturn * 100).toFixed(1)}%`}
              subValue="Based on 12-month history"
              trend={returnTrend}
              color={expectedReturn >= 0 ? '#22c55e' : '#f87171'}
            />
            <StatFlashcard
              icon="🛡️"
              label="Crash Resilience"
              term="crash resilience"
              value={`${crashResilience}/100`}
              subValue="If markets fall sharply"
              trend={crashResilience >= 70 ? 'up' : 'down'}
              color={crashResilience >= 70 ? '#22c55e' : '#f59e0b'}
            />
          </div>
        </div>

        {/* Sector allocation bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-forest-pale uppercase tracking-wide">
              Sector Allocation
            </span>
            <span className="text-xs text-forest-light">Hover for details</span>
          </div>
          <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
            {sectorEntries.map(([sector, weight]) => (
              <div
                key={sector}
                className="group relative flex items-center justify-center transition-all duration-300"
                style={{
                  width: `${weight * 100}%`,
                  background: SECTOR_COLORS[sector] ?? '#94a3b8',
                  opacity: 0.85,
                }}
                title={`${SECTOR_LABELS[sector]}: ${Math.round(weight * 100)}%`}
              >
                {weight > 0.15 && (
                  <span className="text-[9px] font-bold text-black/70 whitespace-nowrap">
                    {Math.round(weight * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {sectorEntries.map(([sector, weight]) => (
              <div key={sector} className="flex items-center gap-1.5 text-xs text-forest-pale">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ background: SECTOR_COLORS[sector] ?? '#94a3b8' }}
                />
                {SECTOR_LABELS[sector]} — {Math.round(weight * 100)}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings preview */}
      <div className="forest-card p-5">
        <h3 className="font-display text-base text-forest-bright mb-3">📋 Suggested Holdings</h3>
        <div className="space-y-2">
          {portfolio.holdings.map(({ stock, weight }) => (
            <div key={stock.ticker} className="flex items-center gap-3">
              <div
                className="w-2 h-8 rounded-full flex-shrink-0"
                style={{ background: SECTOR_COLORS[stock.sector] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{stock.ticker}</span>
                  <span className="text-xs text-forest-pale truncate">{stock.company}</span>
                </div>
                <div className="w-full bg-forest-mid/50 rounded-full h-1.5 mt-1">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${weight * 100}%`, background: SECTOR_COLORS[stock.sector] }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-white">{Math.round(weight * 100)}%</div>
                <div
                  className="text-xs"
                  style={{ color: stock.annualReturn >= 0 ? '#4ade80' : '#f87171' }}
                >
                  {stock.annualReturn >= 0 ? '+' : ''}{(stock.annualReturn * 100).toFixed(1)}% yr
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="forest-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🧠</span>
            <h3 className="font-display text-base text-forest-bright">AI Suggestions to Improve Your Health Score</h3>
          </div>
          <div className="space-y-3">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => onSuggestionClick?.(s.id)}
                className="w-full text-left p-4 rounded-xl border border-forest-mid/50 hover:border-forest-bright/40 hover:bg-forest-mid/20 transition-all duration-150 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm mb-1">{s.tip}</div>
                    <div className="text-xs text-forest-pale leading-relaxed">{s.detail}</div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-forest-pale mb-1">Health score</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>{s.beforeScore}</span>
                      <span className="text-xs text-forest-light">→</span>
                      <span className="text-sm font-bold" style={{ color: '#22c55e' }}>{s.afterScore}</span>
                      <span className="text-xs" style={{ color: '#4ade80' }}>+{s.afterScore - s.beforeScore}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
