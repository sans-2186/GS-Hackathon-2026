'use client';
import { useState, useMemo } from 'react';
import type { Stock } from '@/lib/types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import Keyword from './Keyword';

interface StockTableProps {
  stocks: Stock[];
  searchQuery?: string;
}

const SECTOR_COLORS: Record<string, string> = {
  tech: '#38bdf8',
  finance: '#fcd34d',
  energy: '#fb923c',
  manufacturing: '#a3e635',
};
const SECTOR_LABELS: Record<string, string> = {
  tech: '💻 Tech',
  finance: '💰 Finance',
  energy: '⚡ Energy',
  manufacturing: '⚙️ MFG',
};

function generateSparkData(stock: Stock) {
  const pts = 10;
  const data = [];
  let v = 100;
  for (let i = 0; i < pts; i++) {
    v = v * (1 + stock.returnRate / 100 / 12 + Math.sin(i * 2.1 + stock.beta) * stock.volatility * 0.25);
    data.push({ v: parseFloat(v.toFixed(2)) });
  }
  return data;
}

export default function StockTable({ stocks, searchQuery = '' }: StockTableProps) {
  const [sortKey, setSortKey] = useState<keyof Stock>('returnRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterSector, setFilterSector] = useState<string>('all');

  function handleSort(key: keyof Stock) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const filtered = useMemo(() =>
    stocks
      .filter((s) => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || s.ticker.toLowerCase().includes(q) || s.company.toLowerCase().includes(q) || s.sector.includes(q);
        const matchSector = filterSector === 'all' || s.sector === filterSector;
        return matchSearch && matchSector;
      })
      .sort((a, b) => {
        const av = a[sortKey] as number | string;
        const bv = b[sortKey] as number | string;
        if (typeof av === 'number' && typeof bv === 'number')
          return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      }),
    [stocks, searchQuery, filterSector, sortKey, sortDir]
  );

  const SortIcon = ({ col }: { col: keyof Stock }) => (
    <span className="ml-1 opacity-50">{sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '·'}</span>
  );

  return (
    <div className="w-full">
      {/* Sector filter pills */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {['all', 'tech', 'finance', 'energy', 'manufacturing'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterSector(s)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              background: filterSector === s
                ? (s === 'all' ? 'rgba(34,197,94,0.25)' : `${SECTOR_COLORS[s]}25`)
                : 'rgba(26,58,26,0.5)',
              color: filterSector === s
                ? (s === 'all' ? '#22c55e' : SECTOR_COLORS[s])
                : '#86efac',
              border: `1.5px solid ${filterSector === s ? (s === 'all' ? '#22c55e' : SECTOR_COLORS[s]) : 'rgba(134,239,172,0.2)'}`,
            }}
          >
            {s === 'all' ? '🌐 All' : SECTOR_LABELS[s]}
          </button>
        ))}
        <span className="ml-auto text-xs text-forest-light opacity-70">{filtered.length} stocks</span>
      </div>

      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(13,31,13,0.7)' }}>
        <table className="forest-table">
          <thead>
            <tr>
              <th className="cursor-pointer hover:text-forest-bright" onClick={() => handleSort('ticker')}>
                Ticker <SortIcon col="ticker" />
              </th>
              <th className="cursor-pointer hover:text-forest-bright" onClick={() => handleSort('company')}>
                Company <SortIcon col="company" />
              </th>
              <th><Keyword term="sector">Sector</Keyword></th>
              <th><Keyword term="risk">Risk</Keyword></th>
              <th className="cursor-pointer hover:text-forest-bright" onClick={() => handleSort('price')}>
                <Keyword term="price">Price</Keyword> <SortIcon col="price" />
              </th>
              <th className="cursor-pointer hover:text-forest-bright" onClick={() => handleSort('returnRate')}>
                <Keyword term="return%">Return%</Keyword> <SortIcon col="returnRate" />
              </th>
              <th className="cursor-pointer hover:text-forest-bright" onClick={() => handleSort('volatility')}>
                <Keyword term="volatility">Volatil.</Keyword> <SortIcon col="volatility" />
              </th>
              <th className="cursor-pointer hover:text-forest-bright" onClick={() => handleSort('dividendYield')}>
                <Keyword term="div.yield">Div.Yld</Keyword> <SortIcon col="dividendYield" />
              </th>
              <th className="cursor-pointer hover:text-forest-bright" onClick={() => handleSort('beta')}>
                <Keyword term="beta">Beta</Keyword> <SortIcon col="beta" />
              </th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((stock) => {
              const sparkData = generateSparkData(stock);
              const isUp = stock.returnRate > 0;
              return (
                <tr key={stock.ticker}>
                  <td className="font-bold" style={{ color: '#22c55e' }}>{stock.ticker}</td>
                  <td style={{ color: '#d1fae5', maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {stock.company}
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: `${SECTOR_COLORS[stock.sector]}20`,
                      color: SECTOR_COLORS[stock.sector],
                      border: `1px solid ${SECTOR_COLORS[stock.sector]}50`,
                    }}>
                      {SECTOR_LABELS[stock.sector]}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: stock.risk === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                      color: stock.risk === 'high' ? '#f87171' : '#86efac',
                      border: `1px solid ${stock.risk === 'high' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
                    }}>
                      {stock.risk === 'high' ? '🔥 High' : '🛡 Low'}
                    </span>
                  </td>
                  <td className="font-semibold" style={{ color: '#fcd34d' }}>${stock.price.toFixed(2)}</td>
                  <td className="font-bold" style={{ color: stock.returnRate >= 20 ? '#4ade80' : stock.returnRate >= 10 ? '#fcd34d' : '#fb923c' }}>
                    +{stock.returnRate.toFixed(1)}%
                  </td>
                  <td style={{ color: stock.volatility > 0.4 ? '#f87171' : '#94a3b8' }}>
                    {(stock.volatility * 100).toFixed(0)}%
                  </td>
                  <td style={{ color: stock.dividendYield > 3 ? '#4ade80' : '#94a3b8' }}>
                    {stock.dividendYield.toFixed(2)}%
                  </td>
                  <td style={{ color: stock.beta > 1.3 ? '#f87171' : '#94a3b8' }}>{stock.beta.toFixed(2)}</td>
                  <td style={{ width: 72 }}>
                    <div style={{ width: 64, height: 28 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line type="monotone" dataKey="v" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
