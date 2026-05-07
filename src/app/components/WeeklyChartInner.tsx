'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,  } from 'recharts';
import type { Transaction } from '@/lib/storage';

interface WeeklyChartInnerProps {
  transactions: Transaction[];
}

const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function getWeekData(transactions: Transaction[]) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(2026, 4, 7);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayIndex = d.getDay(); // 0=Sun
    const label = dayIndex === 0 ? 'Paz' : DAY_LABELS[dayIndex - 1] ?? DAY_LABELS[dayIndex];

    const dayTxns = transactions.filter(t => t.tarih === dateStr);
    const gelir = dayTxns.filter(t => t.tur === 'gelir').reduce((s, t) => s + t.miktar, 0);
    const gider = dayTxns.filter(t => t.tur === 'gider').reduce((s, t) => s + t.miktar, 0);

    result.push({ label, gelir, gider, net: gelir - gider });
  }
  return result;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-700 text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={`tooltip-${entry.name}`} className="flex justify-between items-center gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
          </span>
          <span className="font-700 font-tabular text-foreground">
            ₺{entry.value.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyChartInner({ transactions }: WeeklyChartInnerProps) {
  const data = useMemo(() => getWeekData(transactions), [transactions]);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-700 text-foreground">Haftalık Gelir / Gider</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Son 7 günün karşılaştırmalı özeti</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gelir inline-block" />
            <span className="text-muted-foreground font-500">Gelir</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gider inline-block" />
            <span className="text-muted-foreground font-500">Gider</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `₺${(v / 1000).toFixed(0)}K`}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
          <Bar dataKey="gelir" name="Gelir" fill="var(--gelir)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gider" name="Gider" fill="var(--gider)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}