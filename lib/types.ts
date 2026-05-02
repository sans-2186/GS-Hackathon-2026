export type Sector = 'tech' | 'finance' | 'energy' | 'manufacturing';
export type RiskLevel = 'high' | 'low';

export interface UserProfile {
  goal: 'grow_wealth' | 'preserve_capital' | 'generate_income';
  horizon: 'short' | 'medium' | 'long';
  lossReaction: 'panic_sell' | 'hold' | 'buy_more';
  riskComfort: 'conservative' | 'balanced' | 'growth';
  startingAmount: number;
}

export interface Stock {
  ticker: string;
  company: string;
  sector: Sector;
  risk: RiskLevel;
  price: number;
  returnRate: number;
  volatility: number;
  beta: number;
  dividendYield: number;
  description: string;
  marketCap: number;
  peRatio: number;
}

export interface GameEvent {
  type: 'obstacle' | 'chest';
  position: number;
  magnitude: number;
  text: string;
  impactPercent: number;
}
