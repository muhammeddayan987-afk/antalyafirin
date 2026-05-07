import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Package, ArrowRight, CheckCircle } from 'lucide-react';
import { getStockStatus, type StockItem } from '@/lib/storage';
import StatusBadge from '@/components/ui/StatusBadge';

interface StockAlertPanelProps {
  items: StockItem[];
}

const statusLabels: Record<string, string> = {
  uyari: 'Uyarı',
  kritik: 'Kritik',
  tukendi: 'Tükendi',
};

export default function StockAlertPanel({ items }: StockAlertPanelProps) {
  const criticalAndEmpty = items.filter(i => {
    const s = getStockStatus(i);
    return s === 'kritik' || s === 'tukendi';
  });

  const warnings = items.filter(i => getStockStatus(i) === 'uyari');

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          {criticalAndEmpty.length > 0 ? (
            <AlertTriangle size={16} className="text-critical" />
          ) : (
            <Package size={16} className="text-muted-foreground" />
          )}
          <div>
            <h2 className="text-base font-700 text-foreground">Stok Uyarıları</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Dikkat gerektiren malzemeler</p>
          </div>
        </div>
        <Link
          href="/stok-y-netimi"
          className="flex items-center gap-1 text-xs font-600 text-primary hover:text-primary/80 transition-colors"
        >
          Yönet <ArrowRight size={14} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <CheckCircle size={28} className="text-gelir mb-2" />
            <p className="text-sm font-600 text-muted-foreground">Tüm stoklar yeterli seviyede</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Kritik eşiğin altına düşen malzeme yok
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Critical & Empty first */}
            {criticalAndEmpty.map((item) => {
              const status = getStockStatus(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3.5 bg-critical-subtle/40 hover:bg-critical-subtle/60 transition-colors"
                >
                  <AlertTriangle size={16} className="text-critical shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-foreground truncate">{item.ad}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.mevcutMiktar} {item.birim} / min: {item.kritikSeviye} {item.birim}
                    </p>
                  </div>
                  <StatusBadge
                    variant={status as 'kritik' | 'tukendi'}
                    label={statusLabels[status] ?? status}
                    size="sm"
                  />
                </div>
              );
            })}
            {/* Warnings */}
            {warnings.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-5 py-3.5 bg-warning-subtle/30 hover:bg-warning-subtle/50 transition-colors"
              >
                <AlertTriangle size={16} className="text-warning shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-foreground truncate">{item.ad}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.mevcutMiktar} {item.birim} / min: {item.kritikSeviye} {item.birim}
                  </p>
                </div>
                <StatusBadge variant="uyari" label="Uyarı" size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div className="px-5 py-3 border-t border-border bg-secondary/30 rounded-b-2xl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {criticalAndEmpty.length} kritik, {warnings.length} uyarı
          </span>
          <span className="font-600 text-foreground">{items.length} malzeme izleniyor</span>
        </div>
      </div>
    </div>
  );
}