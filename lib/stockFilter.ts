import Papa from 'papaparse';
import type { Stock, Sector, RiskLevel } from './types';

export function parseStocks(csvText: string): Stock[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  return result.data.map((row) => ({
    ticker: row.ticker?.trim() ?? '',
    company: row.company?.trim() ?? '',
    sector: (row.sector?.trim().toLowerCase() as Sector) ?? 'tech',
    risk: (row.risk?.trim().toLowerCase() as RiskLevel) ?? 'low',
    price: parseFloat(row.price) || 0,
    returnRate: parseFloat(row.returnRate) || 0,
    volatility: parseFloat(row.volatility) || 0,
    beta: parseFloat(row.beta) || 1,
    dividendYield: parseFloat(row.dividendYield) || 0,
    description: row.description?.trim() ?? '',
    marketCap: parseFloat(row.marketCap) || 0,
    peRatio: parseFloat(row.peRatio) || 0,
  }));
}

export function filterStocks(
  stocks: Stock[],
  sector: Sector,
  risk: RiskLevel,
  amount: number
): Stock[] {
  return stocks
    .filter(
      (s) =>
        s.sector === sector &&
        s.risk === risk &&
        s.price <= amount
    )
    .sort((a, b) => b.returnRate - a.returnRate);
}

export function pickBestStock(
  stocks: Stock[],
  sector: Sector,
  risk: RiskLevel,
  amount: number
): Stock | null {
  const filtered = filterStocks(stocks, sector, risk, amount);
  return filtered[0] ?? null;
}

export function getAllSectors(stocks: Stock[]): Sector[] {
  const seen = new Set<string>();
  const result: Sector[] = [];
  for (const s of stocks) {
    if (!seen.has(s.sector)) {
      seen.add(s.sector);
      result.push(s.sector);
    }
  }
  return result.sort();
}
