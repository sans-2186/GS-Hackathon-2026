import { readFileSync } from 'fs';
import { join } from 'path';
import { parseStocks } from '@/lib/stockFilter';
import SetupClient from '@/components/SetupClient';

export default function SetupPage() {
  const csvPath = join(process.cwd(), 'data', 'stocks.csv');
  const csvText = readFileSync(csvPath, 'utf-8');
  const stocks = parseStocks(csvText);

  return <SetupClient stocks={stocks} />;
}
