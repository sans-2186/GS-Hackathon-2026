'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { GameResultEvent } from '@/store/gameStore';

interface ResultsChartProps {
  timeline: GameResultEvent[];
  investment: number;
}

interface ChartPoint {
  t: string;
  actual: number;
  baseline: number;
  label?: string;
}

export default function ResultsChart({ timeline, investment }: ResultsChartProps) {
  const data: ChartPoint[] = timeline.map((pt) => ({
    t: `${Math.floor(pt.time)}s`,
    actual: parseFloat(pt.value.toFixed(2)),
    baseline: investment,
    label: pt.label,
  }));

  // Add final point at 120s
  if (data.length > 0 && data[data.length - 1].t !== '120s') {
    data.push({
      t: '120s',
      actual: data[data.length - 1].actual,
      baseline: investment,
    });
  }

  const finalValue = data[data.length - 1]?.actual ?? investment;
  const gain = finalValue - investment;
  const lineColor = gain >= 0 ? '#00ff41' : '#ff3131';

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-2"
          style={{
            background: '#0a0a0a',
            border: '1px solid #00ff41',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 7,
          }}
        >
          <div style={{ color: lineColor }}>ACTUAL: ${payload[0]?.value.toFixed(2)}</div>
          <div style={{ color: '#666' }}>BASELINE: ${payload[1]?.value.toFixed(2)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.1)" />
        <XAxis
          dataKey="t"
          tick={{ fill: '#666', fontSize: 7, fontFamily: '"Press Start 2P", monospace' }}
          axisLine={{ stroke: '#333' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#666', fontSize: 7, fontFamily: '"Press Start 2P", monospace' }}
          axisLine={{ stroke: '#333' }}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#999' }}
        />
        <ReferenceLine y={investment} stroke="#444" strokeDasharray="4 4" />
        <Line
          type="stepAfter"
          dataKey="actual"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: lineColor }}
          name="YOUR RESULT"
        />
        <Line
          type="monotone"
          dataKey="baseline"
          stroke="#444"
          strokeWidth={1}
          strokeDasharray="4 4"
          dot={false}
          name="INITIAL INVESTMENT"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
