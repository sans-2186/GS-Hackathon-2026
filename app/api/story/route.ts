import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// The 3 mid-game pauses map to the 3 hackathon What-If scenarios.
// eventIndex 0 = market crash, 1 = inflation, 2 = withdrawal
const SCENARIO_CHOICES: { text: string; detail: string; impactMultiplier: number }[][] = [
  // Scenario 0 — Market drops 20%
  [
    { text: 'Hold steady — ride it out',        detail: 'Markets recover. Stay calm and trust your plan.',         impactMultiplier: 0.75 },
    { text: 'Rebalance into safer stocks',       detail: 'Shift to finance & energy — less exposed to crash.',      impactMultiplier: 0.90 },
    { text: 'Buy the dip — double down',         detail: 'High risk, high reward. Bet on a fast recovery.',         impactMultiplier: 1.35 },
  ],
  // Scenario 1 — Inflation stays high
  [
    { text: 'Shift to energy stocks',            detail: 'Energy prices rise with inflation — a natural hedge.',    impactMultiplier: 1.15 },
    { text: 'Hold current positions',            detail: 'Stay the course and wait for central bank action.',       impactMultiplier: 0.85 },
    { text: 'Cut spending, raise cash',          detail: 'Preserve liquidity at the cost of potential gains.',      impactMultiplier: 0.70 },
  ],
  // Scenario 2 — Need to withdraw 20%
  [
    { text: 'Sell finance holdings first',       detail: 'Most liquid — sells fast with minimal loss.',             impactMultiplier: 0.88 },
    { text: 'Liquidate a bit of everything',     detail: 'Balanced approach — no single position takes a big hit.', impactMultiplier: 0.80 },
    { text: 'Delay the withdrawal',              detail: 'Keep invested for now and find another way.',             impactMultiplier: 1.05 },
  ],
];

const SCENARIO_HEADERS = [
  { emoji: '📉', title: 'Market drops 20%!', subtitle: 'What\'s your move?' },
  { emoji: '📈', title: 'Inflation is surging!', subtitle: 'How do you protect your portfolio?' },
  { emoji: '💸', title: 'You need to withdraw 20%!', subtitle: 'Which assets do you sell first?' },
];

// Fallback generic choices for unexpected event types
const TEMPLATE_CHOICES: Record<string, { text: string; detail: string; impactMultiplier: number }[]> = {
  obstacle: [
    { text: 'Hold steady — ride it out',  detail: 'Stay the course and trust the fundamentals.',   impactMultiplier: 0.6 },
    { text: 'Cut exposure — sell 20%',    detail: 'Reduce risk by trimming your position.',         impactMultiplier: 0.8 },
    { text: 'Buy the dip — add more',     detail: 'Average down and bet on recovery.',               impactMultiplier: 1.3 },
  ],
  chest: [
    { text: 'Take profits — sell 25%',    detail: 'Lock in gains and reduce risk.',                 impactMultiplier: 0.9 },
    { text: 'Hold for more gains',        detail: 'Let the winner run.',                             impactMultiplier: 1.1 },
    { text: 'Reinvest everything',        detail: 'Compound aggressively into the trend.',           impactMultiplier: 1.4 },
  ],
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let body: {
    stock?: { ticker?: string; company?: string; sector?: string };
    eventText?: string;
    type?: string;
    eventIndex?: number;
  } = {};

  try { body = await req.json(); } catch { /* ignore */ }

  const { stock, eventText, type = 'obstacle', eventIndex } = body;

  // Use What-If scenario choices when eventIndex is provided (0, 1, 2)
  const scenarioChoices =
    typeof eventIndex === 'number' && eventIndex >= 0 && eventIndex <= 2
      ? SCENARIO_CHOICES[eventIndex]
      : null;

  const scenarioHeader =
    typeof eventIndex === 'number' && eventIndex >= 0 && eventIndex <= 2
      ? SCENARIO_HEADERS[eventIndex]
      : null;

  if (!apiKey || apiKey === 'sk-ant-YOUR_KEY_HERE' || apiKey.startsWith('sk-ant-api03')) {
    // Use template for now — Claude key may not be configured for story generation
    if (scenarioChoices) {
      return NextResponse.json({ choices: scenarioChoices, scenarioHeader });
    }
    return NextResponse.json({ choices: TEMPLATE_CHOICES[type] ?? TEMPLATE_CHOICES.obstacle });
  }

  try {
    const scenarioContext = scenarioHeader
      ? `This is What-If Scenario ${(eventIndex ?? 0) + 1} of 3: "${scenarioHeader.title}" — ${scenarioHeader.subtitle}`
      : `A market event just occurred: "${eventText ?? 'Market volatility event'}"`;

    const prompt = `You are a financial storytelling AI for a stock market adventure game called StockQuest.

The player is running as stock: ${stock?.ticker ?? '??'} (${stock?.company ?? 'Unknown'}, ${stock?.sector ?? 'tech'} sector).

${scenarioContext}
Event type: ${type === 'obstacle' ? 'RISK (negative pressure)' : 'OPPORTUNITY (positive catalyst)'}

Generate exactly 3 short choices for the player. Each choice should:
- Be a realistic investing decision (5-8 words)
- Have a 1-sentence consequence in plain language (max 12 words, no finance jargon)
- Have an impactMultiplier: between 0.5 and 1.5 (1.0 = neutral, <1 = loss, >1 = gain)

Return ONLY valid JSON (no markdown):
{"choices":[{"text":"...","detail":"...","impactMultiplier":0.8},{"text":"...","detail":"...","impactMultiplier":1.1},{"text":"...","detail":"...","impactMultiplier":1.3}]}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Claude API ${response.status}`);

    const data = await response.json();
    const text = data?.content?.[0]?.text ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.choices || !Array.isArray(parsed.choices)) throw new Error('Invalid choices');

    return NextResponse.json({ choices: parsed.choices.slice(0, 3), scenarioHeader });
  } catch {
    if (scenarioChoices) {
      return NextResponse.json({ choices: scenarioChoices, scenarioHeader });
    }
    return NextResponse.json({ choices: TEMPLATE_CHOICES[type] ?? TEMPLATE_CHOICES.obstacle });
  }
}
