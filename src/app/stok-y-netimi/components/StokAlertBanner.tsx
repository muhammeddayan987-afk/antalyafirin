import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { getStockStatus, type StockItem } from '@/lib/storage';

interface StokAlertBannerProps {
  items: StockItem[];
}

export default function StokAlertBanner({ items }: StokAlertBannerProps) {
  const emptyItems = items.filter(i => getStockStatus(i) === 'tukendi');
  const criticalItems = items.filter(i => getStockStatus(i) === 'kritik');

  return (
    <div className="bg-critical-subtle border border-critical/25 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm">
      <AlertTriangle size={20} className="text-critical shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-700 text-critical mb-1">
          Acil Stok Uyarısı — {items.length} malzeme dikkat gerektiriyor
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {emptyItems.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-600 text-critical">{emptyItems.length} malzeme tükendi:</span>{' '}
              {emptyItems.map(i => i.ad).join(', ')}
            </p>
          )}
          {criticalItems.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-600 text-warning">{criticalItems.length} kritik seviyede:</span>{' '}
              {criticalItems.map(i => i.ad).join(', ')}
            </p>
          )}
        </div>
      </div>
      <Link
        href="/gelir-gider-takibi"
        className="flex items-center gap-1 text-xs font-600 text-primary hover:text-primary/80 transition-colors shrink-0 mt-0.5"
      >
        Gider ekle <ArrowRight size={13} />
      </Link>
    </div>
  );
}