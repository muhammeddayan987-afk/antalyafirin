'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate, type Transaction } from '@/lib/storage';
import StatusBadge from '@/components/ui/StatusBadge';

interface TransactionTableProps {
  transactions: Transaction[];
  deletingIds: Set<string>;
  selectedIds: Set<string>;
  onEdit: (txn: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

type SortKey = 'tarih' | 'tur' | 'kategori' | 'aciklama' | 'miktar';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function TransactionTable({
  transactions,
  deletingIds,
  selectedIds,
  onEdit,
  onDelete,
  onToggleSelect,
  onToggleSelectAll,
}: TransactionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('tarih');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const sorted = [...transactions].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'tarih') cmp = a.tarih.localeCompare(b.tarih);
    else if (sortKey === 'tur') cmp = a.tur.localeCompare(b.tur);
    else if (sortKey === 'kategori') cmp = a.kategori.localeCompare(b.kategori);
    else if (sortKey === 'aciklama') cmp = a.aciklama.localeCompare(b.aciklama);
    else if (sortKey === 'miktar') cmp = a.miktar - b.miktar;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={13} className="text-muted-foreground/50" />;
    return sortDir === 'asc'
      ? <ArrowUp size={13} className="text-primary" />
      : <ArrowDown size={13} className="text-primary" />;
  };

  const allPageSelected = paginated.length > 0 && paginated.every(t => selectedIds.has(t.id));

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-border accent-primary cursor-pointer"
                  aria-label="Tümünü seç"
                />
              </th>
              {[
                { key: 'tarih' as SortKey, label: 'Tarih' },
                { key: 'tur' as SortKey, label: 'Tür' },
                { key: 'kategori' as SortKey, label: 'Kategori' },
                { key: 'aciklama' as SortKey, label: 'Açıklama' },
                { key: 'miktar' as SortKey, label: 'Miktar' },
              ].map((col) => (
                <th
                  key={`th-${col.key}`}
                  className="px-4 py-3 text-left"
                >
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1.5 text-xs font-600 uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {col.label}
                    <SortIcon col={col.key} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-right">
                <span className="text-xs font-600 uppercase tracking-widest text-muted-foreground">
                  İşlemler
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowUpDown size={28} className="text-muted-foreground/30" />
                    <p className="text-sm font-600 text-muted-foreground">Kayıt bulunamadı</p>
                    <p className="text-xs text-muted-foreground/70">
                      Filtrelerinizi değiştirmeyi veya yeni işlem eklemeyi deneyin
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((txn, idx) => (
                <tr
                  key={txn.id}
                  className={[
                    'border-b border-border last:border-0 transition-all duration-200 group',
                    idx % 2 === 1 ? 'bg-secondary/20' : '',
                    deletingIds.has(txn.id) ? 'row-delete' : '',
                    selectedIds.has(txn.id) ? 'bg-primary/5' : 'hover:bg-secondary/50',
                  ].join(' ')}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(txn.id)}
                      onChange={() => onToggleSelect(txn.id)}
                      className="rounded border-border accent-primary cursor-pointer"
                      aria-label={`${txn.aciklama} seç`}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground font-500 whitespace-nowrap">
                    {formatDate(txn.tarih)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge
                      variant={txn.tur}
                      label={txn.tur === 'gelir' ? 'Gelir' : 'Gider'}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary font-500 text-secondary-foreground">
                      {txn.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-foreground font-500 max-w-[240px] truncate">
                    {txn.aciklama}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={[
                      'text-sm font-700 font-tabular',
                      txn.tur === 'gelir' ? 'text-gelir' : 'text-gider',
                    ].join(' ')}>
                      {txn.tur === 'gelir' ? '+' : '-'}{formatCurrency(txn.miktar)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative group/btn">
                        <button
                          onClick={() => onEdit(txn)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-150 active:scale-95"
                          aria-label="Düzenle"
                        >
                          <Pencil size={15} />
                        </button>
                        <span className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-foreground text-primary-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
                          Düzenle
                        </span>
                      </div>
                      <div className="relative group/btn">
                        <button
                          onClick={() => onDelete(txn.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-critical/10 hover:text-critical transition-all duration-150 active:scale-95"
                          aria-label="Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                        <span className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-foreground text-primary-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
                          Bu kaydı sil
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-secondary/20">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{transactions.length} kayıt</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="px-2 py-1 rounded-lg border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map(s => (
              <option key={`pagesize-${s}`} value={s}>{s} / sayfa</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="Önceki sayfa"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => setPage(pageNum)}
                className={[
                  'w-8 h-8 rounded-lg text-xs font-600 transition-all active:scale-95',
                  page === pageNum
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ].join(' ')}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="Sonraki sayfa"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}