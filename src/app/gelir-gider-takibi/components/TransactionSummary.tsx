import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency, type Transaction } from '@/lib/storage';
import type { FilterPeriod } from './GelirGiderContent';

interface TransactionSummaryProps {
  transactions: Transaction[];
  filterPeriod: FilterPeriod;
}

const periodLabels: Record<FilterPeriod, string> = {
  gunluk: 'Bugün',
  haftalik: 'Bu Hafta',
  aylik: 'Bu Ay',
  tum: 'Tüm Zamanlar',
};

export default function TransactionSummary({ transactions, filterPeriod }: TransactionSummaryProps) {
  const totalGelir = transactions.filter(t => t.tur === 'gelir').reduce((s, t) => s + t.miktar, 0);
  const totalGider = transactions.filter(t => t.tur === 'gider').reduce((s, t) => s + t.miktar, 0);
  const netKar = totalGelir - totalGider;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-gelir-subtle border border-gelir/20 rounded-xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gelir/15 flex items-center justify-center shrink-0">
          <TrendingUp size={18} className="text-gelir" />
        </div>
        <div>
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide">
            {periodLabels[filterPeriod]} Gelir
          </p>
          <p className="text-lg font-800 font-tabular text-gelir leading-tight">
            {formatCurrency(totalGelir)}
          </p>
        </div>
      </div>

      <div className="bg-gider-subtle border border-gider/20 rounded-xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gider/15 flex items-center justify-center shrink-0">
          <TrendingDown size={18} className="text-gider" />
        </div>
        <div>
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide">
            {periodLabels[filterPeriod]} Gider
          </p>
          <p className="text-lg font-800 font-tabular text-gider leading-tight">
            {formatCurrency(totalGider)}
          </p>
        </div>
      </div>

      <div className={[
        'border rounded-xl p-4 flex items-center gap-3',
        netKar >= 0 ? 'bg-primary/8 border-primary/20' : 'bg-gider-subtle border-gider/20',
      ].join(' ')}>
        <div className={[
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          netKar >= 0 ? 'bg-primary/15' : 'bg-gider/15',
        ].join(' ')}>
          <Wallet size={18} className={netKar >= 0 ? 'text-primary' : 'text-gider'} />
        </div>
        <div>
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide">
            Net Kâr
          </p>
          <p className={[
            'text-lg font-800 font-tabular leading-tight',
            netKar >= 0 ? 'text-primary' : 'text-gider',
          ].join(' ')}>
            {formatCurrency(netKar)}
          </p>
        </div>
      </div>
    </div>
  );
}