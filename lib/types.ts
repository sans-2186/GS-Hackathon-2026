export type Sector = 'tech' | 'finance' | 'energy' | 'manufacturing';
export type RiskLevel = 'high' | 'low';

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
