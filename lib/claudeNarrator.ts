import type { Stock } from './types';
import type { Choice } from '@/store/gameStore';

export async function getStoryChoices(
  stock: Stock,
  eventText: string,
  type: 'obstacle' | 'chest'
): Promise<Choice[]> {
  try {
    const res = await fetch('/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock, eventText, type }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.choices || !Array.isArray(data.choices)) throw new Error('No choices');
    return data.choices;
  } catch {
    // Fallback template choices
    if (type === 'chest') {
      return [
        { text: 'Take profits — sell 25%', detail: 'Lock in gains and de-risk.', impactMultiplier: 0.9 },
        { text: 'Hold for more upside', detail: 'Let the winner run longer.', impactMultiplier: 1.1 },
        { text: 'Reinvest everything', detail: 'Double down on the momentum.', impactMultiplier: 1.4 },
      ];
    }
    return [
      { text: 'Hold steady — ride it out', detail: 'Trust fundamentals and wait.', impactMultiplier: 0.6 },
      { text: 'Cut exposure — sell 20%', detail: 'Reduce risk by trimming position.', impactMultiplier: 0.8 },
      { text: 'Buy the dip — add more', detail: 'Average down on the drop.', impactMultiplier: 1.3 },
    ];
  }
}
