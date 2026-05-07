'use client';

import React, { useState, useEffect } from 'react';
import { getTransactions, getStockItems, getStockStatus, formatDate, getTodayString, type Transaction, type StockItem,  } from '@/lib/storage';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import KpiCardsRow from './KpiCardsRow';
import WeeklyChart from './WeeklyChart';
import RecentTransactions from './RecentTransactions';
import StockAlertPanel from './StockAlertPanel';

export default function DashboardContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState('');

  useEffect(() => {
    const todayStr = getTodayString();
    setToday(todayStr);
    const txns = getTransactions();
    const stock = getStockItems();
    setTransactions(txns);
    setStockItems(stock);
    setLoading(false);
  }, []);

  if (loading) return <DashboardSkeleton />;

  const todayTxns = transactions.filter(t => t.tarih === today);
  const totalGelir = todayTxns.filter(t => t.tur === 'gelir').reduce((s, t) => s + t.miktar, 0);
  const totalGider = todayTxns.filter(t => t.tur === 'gider').reduce((s, t) => s + t.miktar, 0);
  const netKar = totalGelir - totalGider;
  const karMarji = totalGelir > 0 ? ((netKar / totalGelir) * 100) : 0;

  const criticalItems = stockItems.filter(i => {
    const s = getStockStatus(i);
    return s === 'kritik' || s === 'tukendi' || s === 'uyari';
  });

  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-6 fade-in">
      {/* KPI Cards */}
      <KpiCardsRow
        totalGelir={totalGelir}
        totalGider={totalGider}
        netKar={netKar}
        karMarji={karMarji}
        criticalStockCount={criticalItems.filter(i => getStockStatus(i) === 'kritik' || getStockStatus(i) === 'tukendi').length}
        todayFormatted={today ? formatDate(today) : ''}
      />

      {/* Charts & Alert Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <WeeklyChart transactions={transactions} />
        </div>
        <div>
          <StockAlertPanel items={criticalItems} />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}