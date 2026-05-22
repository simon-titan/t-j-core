'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { DailyDmPoint } from './types';

interface TooltipProps {
  active?:  boolean;
  payload?: { value: number }[];
  label?:   string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background:   'var(--frost)',
        border:       '1px solid var(--mist)',
        borderRadius: 'var(--radius-3)',
        padding:      '8px 12px',
        fontFamily:   'var(--font-sans)',
        fontSize:     '13px',
        color:        'var(--ink)',
        boxShadow:    'var(--shadow-2)',
      }}
    >
      <div style={{ color: 'var(--mute)', fontSize: '11px', marginBottom: 2 }}>{label}</div>
      <div><strong>{payload[0].value}</strong> DMs</div>
    </div>
  );
}

interface Props {
  data: DailyDmPoint[];
}

export function DmsPerDayChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mist)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--mute)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={d => d.slice(5)} // MM-DD
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--mute)' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#1F3A2E"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#1F3A2E', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
