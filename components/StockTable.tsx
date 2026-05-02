'use client';
import { useState } from 'react';
import type { Stock } from '@/lib/types';

interface StockTableProps {
  stocks: Stock[];
}

const SECTOR_COLORS: Record<string, string> = {
  tech: '#00bfff',
  finance: '#ffd700',
  energy: '#ff8c00',
  manufacturing: '#a8ff78',
};

const SECTOR_LABELS: Record<string, string> = {
  tech: 'TECH',
  finance: 'FIN',
  energy: 'NRG',
  manufacturing: 'MFG',
};

export default function StockTable({ stocks }: StockTableProps) {
  const [sortKey, setSortKey] = useState<keyof Stock>('returnRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterSector, setFilterSector] = useState<string>('all');

  function handleSort(key: keyof Stock) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const filtered = stocks
    .filter((s) => filterSector === 'all' || s.sector === filterSector)
    .sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const SortIcon = ({ col }: { col: keyof Stock }) => (
    <span className="ml-1 opacity-60">
      {sortKey === col ? (sortDir === 'asc' ? '▲' : '▼') : '·'}
    </span>
  );

  return (
    <div className="w-full">
      {/* Filter bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'tech', 'finance', 'energy', 'manufacturing'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterSector(s)}
            className="pixel-btn text-[8px] py-2 px-3"
            style={{
              background: filterSector === s ? (SECTOR_COLORS[s] ?? '#00ff41') : 'transparent',
              color: filterSector === s ? '#0a0a0a' : (SECTOR_COLORS[s] ?? '#00ff41'),
              border: `2px solid ${SECTOR_COLORS[s] ?? '#00ff41'}`,
            }}
          >
            {s === 'all' ? 'ALL' : SECTOR_LABELS[s]}
          </button>
        ))}
        <span className="ml-auto text-[8px] text-green-500 opacity-60 self-center">
          {filtered.length} STOCKS
        </span>
      </div>

      <div className="overflow-x-auto pixel-border">
        <table className="pixel-table">
          <thead>
            <tr>
              <th
                className="cursor-pointer hover:bg-green-900/20"
                onClick={() => handleSort('ticker')}
              >
                TICKER <SortIcon col="ticker" />
              </th>
              <th
                className="cursor-pointer hover:bg-green-900/20"
                onClick={() => handleSort('company')}
              >
                COMPANY <SortIcon col="company" />
              </th>
              <th>SECTOR</th>
              <th>RISK</th>
              <th
                className="cursor-pointer hover:bg-green-900/20"
                onClick={() => handleSort('price')}
              >
                PRICE <SortIcon col="price" />
              </th>
              <th
                className="cursor-pointer hover:bg-green-900/20"
                onClick={() => handleSort('returnRate')}
              >
                RETURN% <SortIcon col="returnRate" />
              </th>
              <th
                className="cursor-pointer hover:bg-green-900/20"
                onClick={() => handleSort('volatility')}
              >
                VOLATIL. <SortIcon col="volatility" />
              </th>
              <th
                className="cursor-pointer hover:bg-green-900/20"
                onClick={() => handleSort('dividendYield')}
              >
                DIV.YLD <SortIcon col="dividendYield" />
              </th>
              <th
                className="cursor-pointer hover:bg-green-900/20"
                onClick={() => handleSort('beta')}
              >
                BETA <SortIcon col="beta" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((stock) => (
              <tr key={stock.ticker}>
                <td className="font-bold" style={{ color: '#00ff41' }}>
                  {stock.ticker}
                </td>
                <td style={{ color: '#ccc', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stock.company}
                </td>
                <td>
                  <span
                    className="px-2 py-1 text-[7px]"
                    style={{
                      background: `${SECTOR_COLORS[stock.sector]}22`,
                      color: SECTOR_COLORS[stock.sector],
                      border: `1px solid ${SECTOR_COLORS[stock.sector]}`,
                    }}
                  >
                    {SECTOR_LABELS[stock.sector]}
                  </span>
                </td>
                <td>
                  <span
                    className="text-[7px] px-2 py-1"
                    style={{
                      color: stock.risk === 'high' ? '#ff3131' : '#00ff41',
                      border: `1px solid ${stock.risk === 'high' ? '#ff3131' : '#00ff41'}`,
                    }}
                  >
                    {stock.risk.toUpperCase()}
                  </span>
                </td>
                <td style={{ color: '#ffd700' }}>${stock.price.toFixed(2)}</td>
                <td
                  style={{
                    color: stock.returnRate >= 20 ? '#00ff41' : stock.returnRate >= 10 ? '#ffd700' : '#ff8c00',
                    fontWeight: 'bold',
                  }}
                >
                  +{stock.returnRate.toFixed(1)}%
                </td>
                <td style={{ color: stock.volatility > 0.4 ? '#ff3131' : '#ccc' }}>
                  {(stock.volatility * 100).toFixed(0)}%
                </td>
                <td style={{ color: stock.dividendYield > 3 ? '#00ff41' : '#999' }}>
                  {stock.dividendYield.toFixed(2)}%
                </td>
                <td style={{ color: stock.beta > 1.3 ? '#ff3131' : '#ccc' }}>
                  {stock.beta.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
