'use client';
import type { AISuggestion, ScenarioResult } from '@/lib/portfolioAnalytics';

interface TransparencyPanelProps {
  suggestion?: AISuggestion;
  scenario?: ScenarioResult;
  investmentAmount?: number;
}

export default function TransparencyPanel({ suggestion, scenario, investmentAmount = 1000 }: TransparencyPanelProps) {
  if (!suggestion && !scenario) return null;

  if (scenario) {
    const { transparencyNote } = scenario;

    return (
      <div className="forest-card p-5 border-l-4" style={{ borderLeftColor: '#38bdf8' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💡</span>
          <h3 className="font-display text-base text-white">Why This Advice?</h3>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
            {scenario.title}
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(56,189,248,0.07)' }}>
            <div className="text-xs font-semibold text-sky-400 mb-1">THE REASONING</div>
            <p className="text-sm text-forest-pale leading-relaxed">{transparencyNote.why}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.07)' }}>
              <div className="text-xs font-semibold text-yellow-400 mb-1">TRADE-OFF TO KNOW</div>
              <p className="text-xs text-forest-pale leading-relaxed">{transparencyNote.tradeOff}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(168,85,247,0.07)' }}>
              <div className="text-xs font-semibold text-purple-400 mb-1">FITS YOUR GOAL</div>
              <p className="text-xs text-forest-pale leading-relaxed">{transparencyNote.goalAlignment}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-forest-light/40 mt-3 text-center">
          Simulation only · Not financial advice · GS Hackathon 2026
        </p>
      </div>
    );
  }

  // Suggestion mode
  if (!suggestion) return null;
  const scoreGain = suggestion.afterScore - suggestion.beforeScore;

  return (
    <div className="forest-card p-5 border-l-4" style={{ borderLeftColor: '#22c55e' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔍</span>
        <h3 className="font-display text-base text-white">Why We Suggest This</h3>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
          +{scoreGain} health
        </span>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.07)' }}>
          <div className="text-xs font-semibold text-forest-bright mb-1">THE SUGGESTION</div>
          <p className="text-sm font-semibold text-white">{suggestion.tip}</p>
          <p className="text-xs text-forest-pale mt-1 leading-relaxed">{suggestion.detail}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(56,189,248,0.07)' }}>
            <div className="text-xs font-semibold text-sky-400 mb-1">BEFORE</div>
            <div className="text-xl font-bold text-white">{suggestion.beforeScore}</div>
            <div className="text-xs text-forest-pale">Health score</div>
          </div>
          <div className="p-3 rounded-lg text-center flex flex-col items-center justify-center">
            <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>→</div>
            <div className="text-xs font-bold" style={{ color: '#4ade80' }}>+{scoreGain} pts</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(34,197,94,0.07)' }}>
            <div className="text-xs font-semibold text-forest-bright mb-1">AFTER</div>
            <div className="text-xl font-bold" style={{ color: '#4ade80' }}>{suggestion.afterScore}</div>
            <div className="text-xs text-forest-pale">Health score</div>
          </div>
        </div>

        <div className="p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.07)' }}>
          <div className="text-xs font-semibold text-yellow-400 mb-1">HONEST TRADE-OFF</div>
          <p className="text-xs text-forest-pale leading-relaxed">
            {suggestion.category === 'diversify' && 'Adding more sectors means some holdings may grow more slowly than a concentrated bet — but you protect against single-sector downturns.'}
            {suggestion.category === 'reduce_risk' && 'Lower volatility stocks tend to grow more slowly in bull markets. You give up some upside in exchange for sleeping better at night.'}
            {suggestion.category === 'rebalance' && 'Rebalancing means selling some winners and buying laggards. It feels counterintuitive but maintains your target risk level over time.'}
          </p>
        </div>
      </div>

      <p className="text-xs text-forest-light/40 mt-3 text-center">
        Simulation only · Not financial advice · GS Hackathon 2026
      </p>
    </div>
  );
}
