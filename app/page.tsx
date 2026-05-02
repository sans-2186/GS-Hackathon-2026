import { readFileSync } from 'fs';
import { join } from 'path';
import { parseStocks } from '@/lib/stockFilter';
import LandingClient from '@/components/LandingClient';

export default function HomePage() {
  const csvPath = join(process.cwd(), 'data', 'stocks.csv');
  const csvText = readFileSync(csvPath, 'utf-8');
  const stocks = parseStocks(csvText);

  return <LandingClient stocks={stocks} />;
}
