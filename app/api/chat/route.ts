import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import GLOSSARY from '@/lib/glossary';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PortfolioContext {
  goal?: string;
  riskComfort?: string;
  healthScore?: number;
  startingAmount?: number;
  expectedReturn?: number;
}

const GOAL_LABELS: Record<string, string> = {
  grow_wealth: 'Grow Wealth',
  preserve_capital: 'Preserve Capital',
  generate_income: 'Generate Income',
};
const RISK_LABELS: Record<string, string> = {
  conservative: 'Conservative',
  balanced: 'Balanced',
  growth: 'Growth-focused',
};

// Compact glossary string injected into the system prompt
const GLOSSARY_SNIPPET = Object.entries(GLOSSARY)
  .slice(0, 18) // keep the prompt tight
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n');

const FALLBACK_REPLIES = [
  "Great question! Your portfolio health score measures how balanced and crash-resistant your investments are — higher is safer.",
  "In StockQuest, obstacles trigger What-If scenarios (market crash, inflation) while treasure chests are investment opportunities.",
  "Volatility means how wildly a stock price swings. High volatility stocks can gain or lose a lot — riskier but potentially more rewarding.",
  "Diversification means spreading your money across different sectors so one bad event doesn't hurt everything at once.",
  "Try clicking an AI suggestion on the dashboard — it shows exactly why that move is recommended for your goal and risk level.",
];
let fallbackIdx = 0;

function buildSystemPrompt(ctx?: PortfolioContext): string {
  const portfolio = ctx
    ? [
        ctx.goal ? `Goal: ${GOAL_LABELS[ctx.goal] ?? ctx.goal}` : null,
        ctx.riskComfort ? `Risk style: ${RISK_LABELS[ctx.riskComfort] ?? ctx.riskComfort}` : null,
        ctx.healthScore != null ? `Portfolio health score: ${ctx.healthScore}/100` : null,
        ctx.startingAmount != null ? `Starting investment: $${ctx.startingAmount.toLocaleString()}` : null,
        ctx.expectedReturn != null ? `Expected annual return: ${(ctx.expectedReturn * 100).toFixed(1)}%` : null,
      ].filter(Boolean).join(' | ')
    : null;

  return `You are StockQuest's friendly forest guide — a jargon-free financial help-desk assistant built into a stock market adventure game.

${portfolio ? `The user's current portfolio snapshot: ${portfolio}.` : ''}

Your job:
- Answer questions about the user's portfolio, financial concepts, and how the game works
- Always use plain English — never use unexplained jargon
- Keep every reply to 2-3 short conversational sentences maximum
- Be encouraging and positive, like a knowledgeable forest guide
- If a question is unrelated to finance or the game, gently redirect
- CRITICAL: Do NOT use any markdown formatting. No asterisks, no bullet points, no dashes, no headers, no bold, no italics. Plain conversational sentences only.

Key financial terms for reference (use these exact definitions):
${GLOSSARY_SNIPPET}

Game context:
- StockQuest is a runner game where the player's avatar is a stock they chose
- Obstacles trigger What-If scenarios (market crash = eventIndex 0, inflation = eventIndex 1)
- Treasure chests are investment opportunities (take profits / hold / reinvest)
- The home page shows a Portfolio Health Dashboard with sector allocation and AI suggestions
- After the race, a results page shows a scenario recap with transparency notes`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  let body: { messages?: ChatMessage[]; portfolioContext?: PortfolioContext } = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const { messages = [], portfolioContext } = body;

  if (!messages.length) {
    return NextResponse.json({ reply: "Hi! I'm your forest guide. Ask me anything about your portfolio or the game!" });
  }

  if (!apiKey || apiKey.includes('YOUR_KEY')) {
    const reply = FALLBACK_REPLIES[fallbackIdx % FALLBACK_REPLIES.length];
    fallbackIdx++;
    return NextResponse.json({ reply });
  }

  try {
    const systemPrompt = buildSystemPrompt(portfolioContext);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        system: systemPrompt,
        messages: messages.slice(-10), // keep last 10 messages for context
      }),
    });

    if (!response.ok) throw new Error(`Claude API ${response.status}`);

    const data = await response.json();
    const reply = data?.content?.[0]?.text?.trim() ?? '';
    if (!reply) throw new Error('Empty reply');

    return NextResponse.json({ reply });
  } catch {
    const reply = FALLBACK_REPLIES[fallbackIdx % FALLBACK_REPLIES.length];
    fallbackIdx++;
    return NextResponse.json({ reply });
  }
}
