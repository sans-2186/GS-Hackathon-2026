// Portfolio analytics derived from FIN MODELLING LEC 2 YT COMBINED STUDY(Sheet2)
// Monthly adjusted close prices, Jun-2025 → May-2026 (oldest first)

export type HistorySector = 'tech' | 'finance' | 'energy' | 'manufacturing';

export interface StockMetrics {
  ticker: string;
  company: string;
  sector: HistorySector;
  annualReturn: number;      // decimal, e.g. 0.12 = 12%
  volatility: number;        // annualized std dev, decimal
  expectedCrashDrop: number; // decimal, e.g. 0.25 = 25% loss in crash
  currentPrice: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PortfolioHolding {
  ticker: string;
  weight: number; // 0–1, must sum to 1
}

export interface SuggestedPortfolio {
  holdings: { stock: StockMetrics; weight: number }[];
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  expectedReturn: number;        // decimal
  crashResilience: number;       // 0–100 (100 = no crash exposure)
  sectorWeights: Record<HistorySector, number>;
}

export interface AISuggestion {
  id: string;
  tip: string;
  detail: string;
  beforeScore: number;
  afterScore: number;
  category: 'diversify' | 'reduce_risk' | 'rebalance';
}

export interface ScenarioResult {
  type: 'market_crash' | 'inflation' | 'withdrawal_20';
  title: string;
  description: string;
  dollarImpact: number;
  percentImpact: number;
  newPortfolioValue: number;
  newHealthScore: number;
  recommendation: string;
  rebalancingActions: string[];
  transparencyNote: {
    why: string;
    tradeOff: string;
    goalAlignment: string;
  };
}

export interface UserProfile {
  goal: 'grow_wealth' | 'preserve_capital' | 'generate_income';
  horizon: 'short' | 'medium' | 'long';
  lossReaction: 'panic_sell' | 'hold' | 'buy_more';
  riskComfort: 'conservative' | 'balanced' | 'growth';
  startingAmount: number;
}

// ── Raw price data ──────────────────────────────────────────────────────────
const STOCK_PRICES: Record<string, { company: string; sector: HistorySector; prices: number[] }> = {
  MSFT: { company: 'Microsoft',        sector: 'tech',          prices: [494.54,530.42,503.76,515.81,515.67,489.97,482.52,429.31,391.85,370.17,407.78,414.44] },
  TSLA: { company: 'Tesla',            sector: 'tech',          prices: [317.66,308.27,333.87,444.72,456.56,430.17,449.72,430.41,402.51,371.75,381.63,390.82] },
  NVDA: { company: 'NVIDIA',           sector: 'tech',          prices: [157.95,177.84,174.15,186.55,202.47,176.98,186.48,191.12,177.18,174.39,199.57,198.45] },
  AAPL: { company: 'Apple',            sector: 'tech',          prices: [204.55,206.94,231.44,254.15,269.86,278.32,271.61,259.24,263.93,253.79,271.35,280.14] },
  JPM:  { company: 'JPMorgan Chase',   sector: 'finance',       prices: [284.38,290.59,297.09,310.90,306.66,310.09,319.14,302.97,298.77,292.66,311.64,312.47] },
  GS:   { company: 'Goldman Sachs',    sector: 'finance',       prices: [696.84,712.44,733.76,788.27,781.36,817.66,870.08,930.51,855.07,841.56,923.77,923.71] },
  V:    { company: 'Visa',             sector: 'finance',       prices: [353.00,343.47,349.75,340.00,339.37,333.09,349.99,321.17,319.48,302.24,329.84,328.03] },
  BAC:  { company: 'Bank of America',  sector: 'finance',       prices: [46.28,46.50,49.92,50.75,52.87,53.07,54.41,52.90,49.55,48.48,53.46,53.24] },
  XOM:  { company: 'Exxon Mobil',      sector: 'energy',        prices: [105.18,108.93,111.51,111.03,112.62,114.15,119.54,140.46,151.49,169.66,154.33,152.75] },
  PWR:  { company: 'Quanta Services',  sector: 'energy',        prices: [377.72,405.74,377.70,414.13,448.82,464.67,421.87,474.41,562.97,548.91,727.63,742.21] },
  CAT:  { company: 'Caterpillar',      sector: 'energy',        prices: [384.05,433.33,416.07,473.77,573.17,573.32,570.45,654.58,741.42,707.11,888.42,889.67] },
  CVX:  { company: 'Chevron',          sector: 'energy',        prices: [138.69,146.88,155.56,152.09,154.47,148.01,150.93,175.19,184.95,206.90,193.31,190.63] },
  BA:   { company: 'Boeing',           sector: 'manufacturing', prices: [209.53,221.84,234.68,215.83,201.02,189.00,217.12,233.72,227.53,199.03,229.03,227.38] },
  BABA: { company: 'Alibaba',          sector: 'manufacturing', prices: [111.53,120.63,135.00,178.73,170.43,157.30,146.58,169.56,144.11,125.46,131.88,131.50] },
  GE:   { company: 'General Electric', sector: 'manufacturing', prices: [256.03,269.65,274.15,299.67,308.15,297.68,307.23,306.34,341.76,283.36,289.93,286.51] },
  GM:   { company: 'General Motors',   sector: 'manufacturing', prices: [48.71,52.97,58.18,60.55,68.79,73.20,80.97,83.80,78.52,74.32,76.89,75.77] },
};

// ── Calculation helpers ─────────────────────────────────────────────────────
function calcMonthlyReturns(prices: number[]): number[] {
  return prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
}

function calcAnnualReturn(prices: number[]): number {
  const months = prices.length - 1;
  return Math.pow(prices[prices.length - 1] / prices[0], 12 / months) - 1;
}

function calcVolatility(monthlyReturns: number[]): number {
  const mean = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length;
  const variance = monthlyReturns.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / (monthlyReturns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(12);
}

function calcExpectedCrashDrop(volatility: number): number {
  return Math.min(0.55, Math.max(0.10, volatility * 0.6));
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ── Real sector curves (normalized to 100 at start) ─────────────────────────
// Returns 12-point series per sector using actual STOCK_PRICES data
export function getRealSectorCurves(): Record<string, number[]> {
  const sectors: HistorySector[] = ['tech', 'finance', 'energy', 'manufacturing'];
  const result: Record<string, number[]> = {};

  for (const sector of sectors) {
    const entries = Object.values(STOCK_PRICES).filter(s => s.sector === sector);
    if (!entries.length) { result[sector] = []; continue; }

    // Normalize each stock's 12 prices to start at 100
    const normalized = entries.map(({ prices }) =>
      prices.map(p => (p / prices[0]) * 100)
    );

    // Average across stocks in sector, point by point
    const len = normalized[0].length;
    result[sector] = Array.from({ length: len }, (_, i) => {
      const avg = normalized.reduce((sum, s) => sum + s[i], 0) / normalized.length;
      return parseFloat(avg.toFixed(2));
    });
  }

  return result;
}

// ── Public API ──────────────────────────────────────────────────────────────

let _metricsCache: StockMetrics[] | null = null;

export function getAllStockMetrics(): StockMetrics[] {
  if (_metricsCache) return _metricsCache;
  _metricsCache = Object.entries(STOCK_PRICES).map(([ticker, { company, sector, prices }]) => {
    const returns = calcMonthlyReturns(prices);
    const annualReturn = calcAnnualReturn(prices);
    const volatility = calcVolatility(returns);
    const expectedCrashDrop = calcExpectedCrashDrop(volatility);
    const riskLevel: 'low' | 'medium' | 'high' =
      volatility > 0.35 ? 'high' : volatility > 0.20 ? 'medium' : 'low';
    return {
      ticker,
      company,
      sector,
      annualReturn,
      volatility,
      expectedCrashDrop,
      currentPrice: prices[prices.length - 1],
      riskLevel,
    };
  });
  return _metricsCache;
}

export function getStockMetric(ticker: string): StockMetrics | undefined {
  return getAllStockMetrics().find(m => m.ticker === ticker);
}

// ── Health score formula (adapted from finguide-ai) ─────────────────────────
export function calcHealthScore(holdings: PortfolioHolding[]): number {
  const metrics = getAllStockMetrics();
  const map = new Map(metrics.map(m => [m.ticker, m]));

  const weightedCrashDrop = holdings.reduce((sum, h) => {
    const m = map.get(h.ticker);
    return sum + (m ? m.expectedCrashDrop * h.weight : 0);
  }, 0);

  const sectorWeights: Partial<Record<HistorySector, number>> = {};
  holdings.forEach(h => {
    const m = map.get(h.ticker);
    if (m) sectorWeights[m.sector] = (sectorWeights[m.sector] ?? 0) + h.weight;
  });
  const topSectorWeight = Math.max(...(Object.values(sectorWeights) as number[]), 0);

  const score = 100 - weightedCrashDrop * 100 - Math.max(0, topSectorWeight * 100 - 35) * 0.7;
  return Math.round(clamp(score, 0, 100));
}

export function getSectorWeights(holdings: PortfolioHolding[]): Record<HistorySector, number> {
  const metrics = getAllStockMetrics();
  const map = new Map(metrics.map(m => [m.ticker, m]));
  const sw: Record<HistorySector, number> = { tech: 0, finance: 0, energy: 0, manufacturing: 0 };
  holdings.forEach(h => {
    const m = map.get(h.ticker);
    if (m) sw[m.sector] = (sw[m.sector] ?? 0) + h.weight;
  });
  return sw;
}

// ── Portfolio builder ────────────────────────────────────────────────────────
const PORTFOLIOS: Record<string, PortfolioHolding[]> = {
  conservative: [
    { ticker: 'JPM',  weight: 0.30 },
    { ticker: 'XOM',  weight: 0.25 },
    { ticker: 'CVX',  weight: 0.20 },
    { ticker: 'V',    weight: 0.15 },
    { ticker: 'GE',   weight: 0.10 },
  ],
  balanced: [
    { ticker: 'MSFT', weight: 0.25 },
    { ticker: 'AAPL', weight: 0.15 },
    { ticker: 'JPM',  weight: 0.20 },
    { ticker: 'XOM',  weight: 0.15 },
    { ticker: 'GE',   weight: 0.15 },
    { ticker: 'V',    weight: 0.10 },
  ],
  growth: [
    { ticker: 'NVDA', weight: 0.30 },
    { ticker: 'TSLA', weight: 0.25 },
    { ticker: 'GS',   weight: 0.20 },
    { ticker: 'CAT',  weight: 0.15 },
    { ticker: 'BABA', weight: 0.10 },
  ],
};

export function buildSuggestedPortfolio(profile: UserProfile): SuggestedPortfolio {
  const key =
    profile.riskComfort === 'conservative' ? 'conservative'
    : profile.riskComfort === 'growth' ? 'growth'
    : 'balanced';

  const holdings = PORTFOLIOS[key];
  const metrics = getAllStockMetrics();
  const map = new Map(metrics.map(m => [m.ticker, m]));

  const enriched = holdings.map(h => ({ stock: map.get(h.ticker)!, weight: h.weight }));
  const healthScore = calcHealthScore(holdings);
  const sectorWeights = getSectorWeights(holdings);
  const topSectorWeight = Math.max(...Object.values(sectorWeights));
  const riskLevel: SuggestedPortfolio['riskLevel'] =
    topSectorWeight > 0.50 || key === 'growth' ? 'High' : key === 'conservative' ? 'Low' : 'Medium';
  const expectedReturn = holdings.reduce((sum, h) => {
    const m = map.get(h.ticker);
    return sum + (m ? m.annualReturn * h.weight : 0);
  }, 0);
  const avgCrashDrop = holdings.reduce((sum, h) => {
    const m = map.get(h.ticker);
    return sum + (m ? m.expectedCrashDrop * h.weight : 0);
  }, 0);

  return {
    holdings: enriched,
    healthScore,
    riskLevel,
    expectedReturn,
    crashResilience: Math.round(clamp(100 - avgCrashDrop * 100, 0, 100)),
    sectorWeights,
  };
}

// ── AI suggestions ───────────────────────────────────────────────────────────
export function generateAISuggestions(
  holdings: PortfolioHolding[],
  profile: UserProfile,
  healthScore: number,
): AISuggestion[] {
  const metrics = getAllStockMetrics();
  const map = new Map(metrics.map(m => [m.ticker, m]));
  const suggestions: AISuggestion[] = [];

  const sectorWeights = getSectorWeights(holdings);
  const topEntry = Object.entries(sectorWeights).sort((a, b) => b[1] - a[1])[0];
  const SECTOR_LABELS: Record<string, string> = { tech: 'Technology', finance: 'Finance', energy: 'Energy', manufacturing: 'Manufacturing' };

  if (topEntry && topEntry[1] > 0.40) {
    suggestions.push({
      id: 'diversify',
      tip: `Spread beyond ${SECTOR_LABELS[topEntry[0]] ?? topEntry[0]}`,
      detail: `${Math.round(topEntry[1] * 100)}% in one sector is a lot of eggs in one basket. Adding a stock from another sector could raise your health score.`,
      beforeScore: healthScore,
      afterScore: Math.round(clamp(healthScore + 8, 0, 100)),
      category: 'diversify',
    });
  }

  const highVolHoldings = holdings.filter(h => {
    const m = map.get(h.ticker);
    return m && m.volatility > 0.40 && h.weight > 0.20;
  });
  if (highVolHoldings.length > 0) {
    suggestions.push({
      id: 'reduce_risk',
      tip: 'Trim your most unpredictable stocks',
      detail: `${highVolHoldings.map(h => h.ticker).join(', ')} swing wildly with market news. Reducing their share adds stability to your portfolio.`,
      beforeScore: healthScore,
      afterScore: Math.round(clamp(healthScore + 7, 0, 100)),
      category: 'reduce_risk',
    });
  }

  if (profile.goal === 'generate_income') {
    suggestions.push({
      id: 'add_income',
      tip: 'Add dividend-paying stocks',
      detail: 'For income goals, stocks that pay regular dividends (like XOM or V) give you cash returns without selling.',
      beforeScore: healthScore,
      afterScore: Math.round(clamp(healthScore + 5, 0, 100)),
      category: 'rebalance',
    });
  } else if (profile.horizon === 'short' && sectorWeights.tech > 0.30) {
    suggestions.push({
      id: 'shorten_duration',
      tip: 'Reduce tech exposure for short-term goal',
      detail: 'Tech stocks need time to recover from dips. With a short time horizon, more stable sectors protect your goal date.',
      beforeScore: healthScore,
      afterScore: Math.round(clamp(healthScore + 6, 0, 100)),
      category: 'rebalance',
    });
  } else {
    suggestions.push({
      id: 'rebalance_general',
      tip: 'Rebalance to your target weights',
      detail: 'Markets drift weights over time. Trimming winners and adding to laggards keeps your risk level where you want it.',
      beforeScore: healthScore,
      afterScore: Math.round(clamp(healthScore + 4, 0, 100)),
      category: 'rebalance',
    });
  }

  return suggestions.slice(0, 3);
}

// ── Scenario simulations ─────────────────────────────────────────────────────
const GOAL_LABELS: Record<UserProfile['goal'], string> = {
  grow_wealth: 'growing your wealth',
  preserve_capital: 'preserving your capital',
  generate_income: 'generating steady income',
};

export function runScenario(
  type: ScenarioResult['type'],
  holdings: PortfolioHolding[],
  profile: UserProfile,
  investmentAmount: number,
): ScenarioResult {
  const metrics = getAllStockMetrics();
  const map = new Map(metrics.map(m => [m.ticker, m]));
  const currentHealthScore = calcHealthScore(holdings);
  const goal = GOAL_LABELS[profile.goal];

  if (type === 'market_crash') {
    const dollarLoss = holdings.reduce((sum, h) => {
      const m = map.get(h.ticker);
      return sum + (m ? m.expectedCrashDrop * h.weight * investmentAmount : 0);
    }, 0);
    const newValue = investmentAmount - dollarLoss;
    const newHealthScore = Math.round(clamp(currentHealthScore - 14, 0, 100));
    const hardest = [...holdings].sort((a, b) => {
      const ma = map.get(a.ticker);
      const mb = map.get(b.ticker);
      return (mb?.expectedCrashDrop ?? 0) - (ma?.expectedCrashDrop ?? 0);
    });

    return {
      type,
      title: 'Market Drops 20%',
      description: 'A sudden market-wide selloff hits. How does your portfolio hold up?',
      dollarImpact: -dollarLoss,
      percentImpact: -dollarLoss / investmentAmount,
      newPortfolioValue: newValue,
      newHealthScore,
      recommendation: `Shift ${Math.round((hardest[0]?.weight ?? 0.1) * 100)}% from ${hardest[0]?.ticker ?? 'high-risk stocks'} into stable dividend payers (XOM, JPM) to cushion the blow.`,
      rebalancingActions: [
        `Reduce ${hardest[0]?.ticker ?? 'volatile positions'} by 15–20%`,
        'Add defensive stocks: XOM, JPM, V',
        'Keep 10–15% in cash as a buffer',
      ],
      transparencyNote: {
        why: 'Stocks with high expected crash drops are the biggest drag when markets fall. Reducing them lowers your exposure.',
        tradeOff: 'You may miss out on upside if markets recover quickly.',
        goalAlignment: `Protecting your investment during a crash directly supports your goal of ${goal}.`,
      },
    };
  }

  if (type === 'inflation') {
    const sectorWeights = getSectorWeights(holdings);
    const cashLikePct = (sectorWeights.finance ?? 0);
    const pressureRate = 0.03 + (1 - Object.keys(sectorWeights).length / 4) * 0.01;
    const annualErosion = investmentAmount * pressureRate;
    const newValue = investmentAmount - annualErosion;
    const newHealthScore = Math.round(clamp(currentHealthScore - 8, 0, 100));

    return {
      type,
      title: 'Inflation Stays High',
      description: 'Prices keep rising, eating into purchasing power and squeezing company margins.',
      dollarImpact: -annualErosion,
      percentImpact: -pressureRate,
      newPortfolioValue: newValue,
      newHealthScore,
      recommendation: `Increase exposure to energy (XOM, CVX) and real-assets sectors that historically outperform during inflation.`,
      rebalancingActions: [
        'Increase energy sector weight to 25–30%',
        'Reduce cash-equivalent holdings',
        'Add commodity-linked stocks (XOM, CVX, CAT)',
      ],
      transparencyNote: {
        why: 'Inflation erodes the value of cash and fixed-income assets. Energy and commodity stocks tend to rise with inflation.',
        tradeOff: 'Energy stocks are more volatile and tied to oil prices, which can be unpredictable.',
        goalAlignment: `Inflation protection helps preserve the real value of your savings — key for ${goal}.`,
      },
    };
  }

  // withdrawal_20
  const withdrawalAmount = investmentAmount * 0.20;
  const liquidSectors: HistorySector[] = ['finance'];
  const sectorWeights = getSectorWeights(holdings);
  const liquidPct = liquidSectors.reduce((s, sec) => s + (sectorWeights[sec] ?? 0), 0);
  const liquidAmount = investmentAmount * liquidPct;
  const gap = withdrawalAmount > liquidAmount ? withdrawalAmount - liquidAmount : 0;
  const newValue = investmentAmount - withdrawalAmount;
  const newHealthScore = Math.round(clamp(currentHealthScore - (gap > 0 ? 12 : 5), 0, 100));

  return {
    type,
    title: 'Need to Withdraw 20%',
    description: 'Life happens. You need to pull out 20% of your funds right now.',
    dollarImpact: -withdrawalAmount,
    percentImpact: -0.20,
    newPortfolioValue: newValue,
    newHealthScore,
    recommendation: gap > 0
      ? `You have a $${Math.round(gap).toLocaleString()} liquidity gap. Sell ${Math.round((gap / investmentAmount) * 100)}% of your least-volatile holdings (JPM, V) first.`
      : 'Your finance holdings provide enough liquidity. Sell those first to avoid disrupting your growth positions.',
    rebalancingActions: [
      gap > 0 ? `Sell JPM or V to cover $${Math.round(gap).toLocaleString()} gap` : 'Sell finance holdings first (most liquid)',
      'Avoid selling NVDA or TSLA mid-run — high slippage risk',
      'Rebuild liquidity buffer after withdrawal',
    ],
    transparencyNote: {
      why: 'Finance stocks (banks, payment networks) tend to have tighter bid-ask spreads and faster settlement, making them easiest to liquidate without large losses.',
      tradeOff: 'Selling good assets early locks in whatever price they are at today, which may not be ideal.',
      goalAlignment: `Having a liquid emergency plan is part of responsible investing, regardless of your goal of ${goal}.`,
    },
  };
}
