import React from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle,  } from 'lucide-react';
import { formatCurrency } from '@/lib/storage';

interface KpiCardsRowProps {
  totalGelir: number;
  totalGider: number;
  netKar: number;
  karMarji: number;
  criticalStockCount: number;
  todayFormatted: string;
}

export default function KpiCardsRow({
  totalGelir,
  totalGider,
  netKar,
  karMarji,
  criticalStockCount,
  todayFormatted,
}: KpiCardsRowProps) {
  const isProfit = netKar >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero: Net Kâr — spans 2 cols */}
      <div className={[
        'sm:col-span-2 rounded-2xl border p-6 flex flex-col justify-between min-h-[140px] shadow-sm',
        isProfit
          ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20' :'bg-gider-subtle border-critical/20',
      ].join(' ')}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-600 uppercase tracking-widest text-muted-foreground mb-1">
              Net Kâr — {todayFormatted}
            </p>
            <p className={[
              'text-4xl font-800 font-tabular leading-none',
              isProfit ? 'text-primary' : 'text-critical',
            ].join(' ')}>
              {formatCurrency(netKar)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {isProfit ? '✓ Bugün kârlı gidiyorsunuz' : '⚠ Giderler geliri aşıyor'}
            </p>
          </div>
          <div className={[
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            isProfit ? 'bg-primary/15' : 'bg-critical/15',
          ].join(' ')}>
            <Wallet size={24} className={isProfit ? 'text-primary' : 'text-critical'} />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Gelir</p>
            <p className="text-sm font-700 text-gelir font-tabular">{formatCurrency(totalGelir)}</p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div>
            <p className="text-xs text-muted-foreground">Gider</p>
            <p className="text-sm font-700 text-gider font-tabular">{formatCurrency(totalGider)}</p>
          </div>
        </div>
      </div>

      {/* Günlük Gelir */}
      <div className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-600 uppercase tracking-widest text-muted-foreground mb-2">
              Günlük Gelir
            </p>
            <p className="text-2xl font-800 font-tabular text-gelir leading-none">
              {formatCurrency(totalGelir)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gelir-subtle flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="text-gelir" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <TrendingUp size={12} className="text-gelir" />
          <p className="text-xs text-muted-foreground">
            Satış işlemlerinden elde edilen toplam
          </p>
        </div>
      </div>

      {/* Günlük Gider */}
      <div className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-600 uppercase tracking-widest text-muted-foreground mb-2">
              Günlük Gider
            </p>
            <p className="text-2xl font-800 font-tabular text-gider leading-none">
              {formatCurrency(totalGider)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gider-subtle flex items-center justify-center shrink-0">
            <TrendingDown size={20} className="text-gider" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          {criticalStockCount > 0 ? (
            <>
              <AlertTriangle size={12} className="text-critical" />
              <p className="text-xs text-critical font-600">
                {criticalStockCount} kritik stok uyarısı
              </p>
            </>
          ) : (
            <>
              <TrendingDown size={12} className="text-gider" />
              <p className="text-xs text-muted-foreground">
                Tüm maliyet kalemleri
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}