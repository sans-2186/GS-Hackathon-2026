import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const TEMPLATE_CHOICES: Record<string, { text: string; detail: string; impactMultiplier: number }[]> = {
  obstacle: [
    { text: 'Hold steady — ride it out', detail: 'Stay the course and trust the fundamentals.', impactMultiplier: 0.6 },
    { text: 'Cut exposure — sell 20%', detail: 'Reduce risk by trimming your position.', impactMultiplier: 0.8 },
    { text: 'Buy the dip — add more', detail: 'Average down and bet on recovery.', impactMultiplier: 1.3 },
  ],
  chest: [
    { text: 'Take profits — sell 25%', detail: 'Lock in gains and reduce risk.', impactMultiplier: 0.9 },
    { text: 'Hold for more gains', detail: 'Let the winner run.', impactMultiplier: 1.1 },
    { text: 'Reinvest everything', detail: 'Compound aggressively into the trend.', impactMultiplier: 1.4 },
  ],
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let body: { stock?: { ticker?: string; company?: string; sector?: string }; eventText?: string; type?: string } = {};

  try { body = await req.json(); } catch { /* ignore */ }

  const { stock, eventText, type = 'obstacle' } = body;

  if (!apiKey || apiKey === 'sk-ant-YOUR_KEY_HERE') {
    return NextResponse.json({ choices: TEMPLATE_CHOICES[type] ?? TEMPLATE_CHOICES.obstacle });
  }

  try {
    const prompt = `You are a financial storytelling AI for a stock market adventure game called StockQuest.

The player is running as stock: ${stock?.ticker ?? '??'} (${stock?.company ?? 'Unknown'}, ${stock?.sector ?? 'tech'} sector).

A market event just occurred: "${eventText ?? 'Market volatility event'}"
Event type: ${type === 'obstacle' ? 'RISK (negative pressure)' : 'OPPORTUNITY (positive catalyst)'}

Generate exactly 3 short, playful choices for the player. Each choice should:
- Be 5-8 words of action text
- Have a 1-sentence detail/consequence (max 12 words)
- Have an impactMultiplier: between 0.4 and 1.6 (1.0 = neutral, <1 = loss, >1 = gain)

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
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

    // Parse JSON from Claude response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.choices || !Array.isArray(parsed.choices)) throw new Error('Invalid choices');
    return NextResponse.json({ choices: parsed.choices.slice(0, 3) });
  } catch {
    return NextResponse.json({ choices: TEMPLATE_CHOICES[type] ?? TEMPLATE_CHOICES.obstacle });
  }
}
