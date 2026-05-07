import React from 'react';
import { Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { getStockStatus, formatCurrency, type StockItem } from '@/lib/storage';

interface StokSummaryCardsProps {
  items: StockItem[];
}

export default function StokSummaryCards({ items }: StokSummaryCardsProps) {
  const criticalCount = items.filter(i => {
    const s = getStockStatus(i);
    return s === 'kritik' || s === 'tukendi';
  }).length;

  const warningCount = items.filter(i => getStockStatus(i) === 'uyari').length;

  const totalValue = items.reduce((sum, item) => sum + item.mevcutMiktar * item.birimMaliyet, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total items */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Package size={22} className="text-primary" />
        </div>
        <div>
          <p className="text-xs font-600 uppercase tracking-widest text-muted-foreground">
            Toplam Kalem
          </p>
          <p className="text-2xl font-800 font-tabular text-foreground leading-tight">{items.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">takip edilen malzeme</p>
        </div>
      </div>

      {/* Critical / warning */}
      <div className={[
        'rounded-2xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow',
        criticalCount > 0
          ? 'bg-critical-subtle border-critical/20'
          : warningCount > 0
          ? 'bg-warning-subtle border-warning/20' :'bg-normal-subtle border-gelir/20',
      ].join(' ')}>
        <div className={[
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
          criticalCount > 0 ? 'bg-critical/15' : warningCount > 0 ? 'bg-warning/15' : 'bg-gelir/15',
        ].join(' ')}>
          <AlertTriangle
            size={22}
            className={criticalCount > 0 ? 'text-critical' : warningCount > 0 ? 'text-warning' : 'text-gelir'}
          />
        </div>
        <div>
          <p className="text-xs font-600 uppercase tracking-widest text-muted-foreground">
            Kritik Stok
          </p>
          <p className={[
            'text-2xl font-800 font-tabular leading-tight',
            criticalCount > 0 ? 'text-critical' : warningCount > 0 ? 'text-warning' : 'text-gelir',
          ].join(' ')}>
            {criticalCount}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {warningCount > 0 ? `+${warningCount} uyarı seviyesinde` : 'tükendi veya kritik'}
          </p>
        </div>
      </div>

      {/* Total stock value */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <TrendingDown size={22} className="text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs font-600 uppercase tracking-widest text-muted-foreground">
            Stok Değeri
          </p>
          <p className="text-2xl font-800 font-tabular text-foreground leading-tight">
            {formatCurrency(totalValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">mevcut stok maliyeti</p>
        </div>
      </div>
    </div>
  );
}