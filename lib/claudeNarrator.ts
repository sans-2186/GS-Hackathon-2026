import type { Stock } from './types';
import type { Choice } from '@/store/gameStore';

export interface ScenarioHeader {
  emoji: string;
  title: string;
  subtitle: string;
}

// Fallback scenario choices (mirrors route.ts SCENARIO_CHOICES)
const SCENARIO_FALLBACKS: Choice[][] = [
  [
    { text: 'Hold steady — ride it out',   detail: 'Markets recover. Stay calm and trust your plan.',        impactMultiplier: 0.75 },
    { text: 'Rebalance into safer stocks', detail: 'Shift to finance & energy — less exposed to crash.',     impactMultiplier: 0.90 },
    { text: 'Buy the dip — double down',   detail: 'High risk, high reward. Bet on a fast recovery.',        impactMultiplier: 1.35 },
  ],
  [
    { text: 'Shift to energy stocks',      detail: 'Energy prices rise with inflation — a natural hedge.',   impactMultiplier: 1.15 },
    { text: 'Hold current positions',      detail: 'Stay the course and wait for central bank action.',      impactMultiplier: 0.85 },
    { text: 'Cut spending, raise cash',    detail: 'Preserve liquidity at the cost of potential gains.',     impactMultiplier: 0.70 },
  ],
  [
    { text: 'Sell finance holdings first', detail: 'Most liquid — sells fast with minimal loss.',            impactMultiplier: 0.88 },
    { text: 'Liquidate a bit of everything', detail: 'No single position takes a big hit.',                  impactMultiplier: 0.80 },
    { text: 'Delay the withdrawal',        detail: 'Keep invested for now and find another way.',            impactMultiplier: 1.05 },
  ],
];

const SCENARIO_HEADERS: ScenarioHeader[] = [
  { emoji: '📉', title: 'Market drops 20%!',        subtitle: "What's your move?" },
  { emoji: '📈', title: 'Inflation is surging!',     subtitle: 'How do you protect your portfolio?' },
  { emoji: '💸', title: 'You need to withdraw 20%!', subtitle: 'Which assets do you sell first?' },
];

export async function getStoryChoices(
  stock: Stock,
  eventText: string,
  type: 'obstacle' | 'chest',
  eventIndex?: number,
): Promise<{ choices: Choice[]; scenarioHeader?: ScenarioHeader }> {
  try {
    const res = await fetch('/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock, eventText, type, eventIndex }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.choices || !Array.isArray(data.choices)) throw new Error('No choices');
    return { choices: data.choices, scenarioHeader: data.scenarioHeader };
  } catch {
    const idx = typeof eventIndex === 'number' && eventIndex >= 0 && eventIndex <= 2 ? eventIndex : null;
    if (idx !== null) {
      return { choices: SCENARIO_FALLBACKS[idx], scenarioHeader: SCENARIO_HEADERS[idx] };
    }
    const fallback: Choice[] = type === 'chest'
      ? [
          { text: 'Take profits — sell 25%', detail: 'Lock in gains and de-risk.',       impactMultiplier: 0.9 },
          { text: 'Hold for more upside',    detail: 'Let the winner run longer.',        impactMultiplier: 1.1 },
          { text: 'Reinvest everything',     detail: 'Double down on the momentum.',      impactMultiplier: 1.4 },
        ]
      : [
          { text: 'Hold steady — ride it out', detail: 'Trust fundamentals and wait.',   impactMultiplier: 0.6 },
          { text: 'Cut exposure — sell 20%',   detail: 'Reduce risk by trimming.',        impactMultiplier: 0.8 },
          { text: 'Buy the dip — add more',    detail: 'Average down on the drop.',       impactMultiplier: 1.3 },
        ];
    return { choices: fallback };
  }
}
