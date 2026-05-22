'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { TemplateMetrics } from './types';

interface TooltipProps {
  active?:  boolean;
  payload?: { name: string; value: number; color: string }[];
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
        minWidth:     120,
      }}
    >
      <div style={{ color: 'var(--mute)', fontSize: '11px', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}%</strong>
        </div>
      ))}
    </div>
  );
}

interface Props {
  templates: TemplateMetrics[];
}

export function AnswerRateByTemplateChart({ templates }: Props) {
  const data = templates.map(t => ({
    name:        t.name.length > 18 ? t.name.slice(0, 18) + '…' : t.name,
    Antwortrate: t.answerRate,
    Terminrate:  t.apptRate,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mist)" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--mute)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontFamily: 'var(--font-sans)', fontSize: 12, fill: 'var(--ink)' }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: '12px', paddingTop: 8 }}
        />
        <Bar dataKey="Antwortrate" fill="#1F3A2E" radius={[0, 3, 3, 0]} barSize={10} />
        <Bar dataKey="Terminrate"  fill="#4A7C5C" radius={[0, 3, 3, 0]} barSize={10} />
      </BarChart>
    </ResponsiveContainer>
  );
}
