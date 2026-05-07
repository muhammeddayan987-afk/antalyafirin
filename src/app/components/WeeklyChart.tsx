'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Transaction } from '@/lib/storage';

const WeeklyChartInner = dynamic(() => import('./WeeklyChartInner'), { ssr: false });

interface WeeklyChartProps {
  transactions: Transaction[];
}

export default function WeeklyChart({ transactions }: WeeklyChartProps) {
  return <WeeklyChartInner transactions={transactions} />;
}