import type { Stock, GameEvent } from './types';
import { OBSTACLE_TEMPLATES, CHEST_TEMPLATES } from './aiNarrator';

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateCourse(stock: Stock): GameEvent[] {
  const seed = hashString(stock.ticker) + Math.floor(stock.volatility * 10000);
  const rand = seededRandom(seed);

  // Scale obstacle count by volatility (0.14 → ~3, 0.62 → ~12)
  const obstacleCount = Math.max(3, Math.round(stock.volatility * 20));
  // Scale chest count by dividend yield + return rate
  const chestCount = Math.max(2, Math.round(stock.dividendYield * 10 + stock.returnRate * 0.1));

  const totalEvents = obstacleCount + chestCount;
  const events: GameEvent[] = [];

  const obstacleTexts = OBSTACLE_TEMPLATES[stock.sector];
  const chestTexts = CHEST_TEMPLATES[stock.sector];

  // Assign types
  const types: ('obstacle' | 'chest')[] = [
    ...Array(obstacleCount).fill('obstacle'),
    ...Array(chestCount).fill('chest'),
  ];

  // Shuffle types
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  // Spread events across the course (positions 600–9000 game pixels)
  const courseLength = 9000;
  const minGap = 500;

  let obstIdx = 0;
  let chestIdx = 0;
  let lastPos = 600;

  for (let i = 0; i < totalEvents; i++) {
    const type = types[i];
    const gap = minGap + Math.floor(rand() * 400);
    const pos = lastPos + gap;
    if (pos > courseLength - 200) break;
    lastPos = pos;

    const impactPercent = type === 'obstacle'
      ? -(1.5 + rand() * stock.volatility * 15)
      : (1.0 + rand() * stock.returnRate * 0.3);

    let text: string;
    if (type === 'obstacle') {
      text = obstacleTexts[obstIdx % obstacleTexts.length];
      obstIdx++;
    } else {
      text = chestTexts[chestIdx % chestTexts.length];
      chestIdx++;
    }

    events.push({ type, position: pos, magnitude: Math.abs(impactPercent), text, impactPercent });
  }

  return events;
}
