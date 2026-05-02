// Plain-English definitions for financial terms used throughout StockQuest.
// All definitions are jargon-free — no Alpha, Beta, Sharpe, or other metrics
// that require finance training to understand.

const GLOSSARY: Record<string, string> = {
  // Portfolio & health
  'health score': 'A 0–100 score showing how safe and balanced your portfolio is. Higher = better protected from market swings.',
  'portfolio health': 'A 0–100 score showing how safe and balanced your portfolio is. Higher = better protected from market swings.',
  'crash resilience': 'How much of your money survives if markets fall sharply. 80 crash resilience means you keep ~80% of your investment.',
  'sector concentration': 'What % of your portfolio is in one industry. Over 40% in one sector = risky — one bad news story can hurt you more.',
  'diversification': 'Spreading your money across different companies and industries so one bad event doesn\'t wipe everything out.',

  // Return & risk
  'expected return': 'An estimate of how much your investment could grow in a year, based on past performance. Not a guarantee.',
  'annual return': 'How much a stock grew (or fell) over a full year, shown as a percentage.',
  'return%': 'How much a stock grew over the past 12 months, as a percentage. Past performance doesn\'t guarantee future results.',
  'volatility': 'How wildly a stock price swings up and down day to day. High volatility = more unpredictable, higher risk.',
  'risk level': 'Low = stable, slow-moving stocks. High = fast-moving stocks that can gain or lose a lot quickly.',
  'risk': 'Low = stable, slow-moving stocks. High = fast-moving stocks that can gain or lose a lot quickly.',

  // Stock fundamentals
  'price': 'Current market price per share in USD.',
  'div.yield': 'Dividend Yield — the annual cash payment a stock makes, shown as a % of its price. Like interest paid for owning the stock.',
  'dividend yield': 'The annual cash payment a stock makes, shown as a % of its price. Like interest paid for owning the stock.',
  'p/e ratio': 'Price-to-Earnings — how much you\'re paying for $1 of company profit. High P/E can mean investors expect big growth.',
  'marketcap': 'Total value of all company shares combined. Large = $10B+, established company. Small = newer, riskier.',
  'market cap': 'Total value of all company shares combined. Large = $10B+, established company. Small = newer, riskier.',
  'beta': 'How much a stock moves compared to the overall market. 1.5 means if market drops 10%, this stock typically drops 15%.',
  'sector': 'The industry a company operates in: Tech, Finance, Energy, or Manufacturing.',

  // Scenarios
  'market crash': 'A sudden, large drop in stock prices across the whole market — often 20% or more. Rare, but happens every few years.',
  'inflation': 'When everyday prices rise over time, making your money buy less. High inflation can also squeeze company profits.',
  'liquidity': 'How quickly and easily you can turn your investment into cash. Liquid = sellable fast. Illiquid = takes time or costs more.',
  'rebalancing': 'Adjusting how your money is split across stocks to get back to your target plan — like trimming the winners and boosting the laggards.',
  'what-if scenario': 'A simulation showing what might happen to your portfolio under a specific market event, so you can plan ahead.',

  // Game-specific
  'momentum': 'The current direction and strength of a stock\'s price trend — whether buyers or sellers are in control.',
};

export default GLOSSARY;

export function getDefinition(term: string): string | null {
  const key = term.toLowerCase().trim();
  if (GLOSSARY[key]) return GLOSSARY[key];
  // Partial match
  const match = Object.keys(GLOSSARY).find(k => key.includes(k) || k.includes(key));
  return match ? GLOSSARY[match] : null;
}
