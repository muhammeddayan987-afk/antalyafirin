import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate, type Transaction } from '@/lib/storage';
import StatusBadge from '@/components/ui/StatusBadge';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const categoryColors: Record<string, string> = {
  Satış: 'bg-accent/15 text-accent-foreground',
  Un: 'bg-secondary text-secondary-foreground',
  Maya: 'bg-secondary text-secondary-foreground',
  Odun: 'bg-secondary text-secondary-foreground',
  Personel: 'bg-primary/10 text-primary',
  Elektrik: 'bg-muted text-muted-foreground',
  Kira: 'bg-muted text-muted-foreground',
  Susam: 'bg-secondary text-secondary-foreground',
  Su: 'bg-muted text-muted-foreground',
  Diğer: 'bg-muted text-muted-foreground',
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-700 text-foreground">Son İşlemler</h2>
          <p className="text-xs text-muted-foreground mt-0.5">En son kaydedilen gelir ve giderler</p>
        </div>
        <Link
          href="/gelir-gider-takibi"
          className="flex items-center gap-1 text-xs font-600 text-primary hover:text-primary/80 transition-colors"
        >
          Tümünü gör <ArrowRight size={14} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <ArrowUpRight size={32} className="text-muted-foreground/40 mb-3" />
          <p className="text-sm font-600 text-muted-foreground">Henüz işlem kaydı yok</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Gelir ve gider kayıtları burada görünecek
          </p>
          <Link
            href="/gelir-gider-takibi"
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-all active:scale-95"
          >
            İlk İşlemi Ekle
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors group"
            >
              {/* Icon */}
              <div className={[
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                txn.tur === 'gelir' ? 'bg-gelir-subtle' : 'bg-gider-subtle',
              ].join(' ')}>
                {txn.tur === 'gelir'
                  ? <ArrowUpRight size={16} className="text-gelir" />
                  : <ArrowDownLeft size={16} className="text-gider" />
                }
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-600 text-foreground truncate">{txn.aciklama}</p>
                  <span className={[
                    'text-xs px-2 py-0.5 rounded-full font-500 shrink-0',
                    categoryColors[txn.kategori] ?? 'bg-muted text-muted-foreground',
                  ].join(' ')}>
                    {txn.kategori}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(txn.tarih)}</p>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className={[
                  'text-sm font-700 font-tabular',
                  txn.tur === 'gelir' ? 'text-gelir' : 'text-gider',
                ].join(' ')}>
                  {txn.tur === 'gelir' ? '+' : '-'}{formatCurrency(txn.miktar)}
                </p>
                <StatusBadge
                  variant={txn.tur}
                  label={txn.tur === 'gelir' ? 'Gelir' : 'Gider'}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}