import { readFileSync } from 'fs';
import { join } from 'path';
import { parseStocks } from '@/lib/stockFilter';
import HomeClient from '@/components/HomeClient';

export default function HomePage() {
  const csvPath = join(process.cwd(), 'data', 'stocks.csv');
  const csvText = readFileSync(csvPath, 'utf-8');
  const stocks = parseStocks(csvText);
  return <HomeClient stocks={stocks} />;
}
