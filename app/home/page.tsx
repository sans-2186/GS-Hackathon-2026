import { readFileSync } from 'fs';
import { join } from 'path';
import { parseStocks } from '@/lib/stockFilter';
import HomeClient from '@/components/HomeClient';
import {
  buildSuggestedPortfolio,
  generateAISuggestions,
} from '@/lib/portfolioAnalytics';
import type { UserProfile } from '@/lib/portfolioAnalytics';

// Default profile used server-side when no profile is available yet.
// HomeClient re-computes on the client once the real profile is loaded from the store.
const DEFAULT_PROFILE: UserProfile = {
  goal: 'grow_wealth',
  horizon: 'medium',
  lossReaction: 'hold',
  riskComfort: 'balanced',
  startingAmount: 1000,
};

export default function HomePage() {
  const csvPath = join(process.cwd(), 'data', 'stocks.csv');
  const csvText = readFileSync(csvPath, 'utf-8');
  const stocks = parseStocks(csvText);

  // Pre-compute portfolio analytics with the default profile.
  // These are passed as initial props; the client refreshes with the real user profile.
  const portfolio = buildSuggestedPortfolio(DEFAULT_PROFILE);
  const suggestions = generateAISuggestions(portfolio.holdings.map(h => ({ ticker: h.stock.ticker, weight: h.weight })), DEFAULT_PROFILE, portfolio.healthScore);

  return (
    <HomeClient
      stocks={stocks}
      initialPortfolio={portfolio}
      initialSuggestions={suggestions}
    />
  );
}
