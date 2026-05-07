'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { getStockStatus, formatCurrency, formatDate, type StockItem } from '@/lib/storage';
import StatusBadge from '@/components/ui/StatusBadge';

interface StokTableProps {
  items: StockItem[];
  deletingIds: Set<string>;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterStatus: 'tumu' | 'kritik' | 'uyari' | 'normal' | 'tukendi';
  setFilterStatus: (v: 'tumu' | 'kritik' | 'uyari' | 'normal' | 'tukendi') => void;
  onAdd: () => void;
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'ad' | 'mevcutMiktar' | 'kritikSeviye' | 'birimMaliyet' | 'sonGuncelleme';
type SortDir = 'asc' | 'desc';

const STATUS_FILTERS = [
  { value: 'tumu' as const, label: 'Tümü' },
  { value: 'normal' as const, label: 'Normal' },
  { value: 'uyari' as const, label: 'Uyarı' },
  { value: 'kritik' as const, label: 'Kritik' },
  { value: 'tukendi' as const, label: 'Tükendi' },
];

const PAGE_SIZE = 10;

function StockLevelBar({ item }: { item: StockItem }) {
  const status = getStockStatus(item);
  const maxDisplay = Math.max(item.kritikSeviye * 3, item.mevcutMiktar * 1.2, 1);
  const pct = Math.min(100, (item.mevcutMiktar / maxDisplay) * 100);

  const barColor =
    status === 'tukendi' ? 'bg-foreground/20'
    : status === 'kritik' ? 'bg-critical'
    : status === 'uyari'? 'bg-warning' :'bg-gelir';

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-600 font-tabular text-foreground whitespace-nowrap">
        {item.mevcutMiktar} {item.birim}
      </span>
    </div>
  );
}

function StatusIcon({ item }: { item: StockItem }) {
  const status = getStockStatus(item);
  if (status === 'tukendi') return <XCircle size={15} className="text-muted-foreground/50" />;
  if (status === 'kritik') return <AlertTriangle size={15} className="text-critical" />;
  if (status === 'uyari') return <AlertTriangle size={15} className="text-warning" />;
  return <CheckCircle size={15} className="text-gelir" />;
}

export default function StokTable({
  items,
  deletingIds,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  onAdd,
  onEdit,
  onDelete,
}: StokTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('ad');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'ad') cmp = a.ad.localeCompare(b.ad, 'tr');
    else if (sortKey === 'mevcutMiktar') cmp = a.mevcutMiktar - b.mevcutMiktar;
    else if (sortKey === 'kritikSeviye') cmp = a.kritikSeviye - b.kritikSeviye;
    else if (sortKey === 'birimMaliyet') cmp = a.birimMaliyet - b.birimMaliyet;
    else if (sortKey === 'sonGuncelleme') cmp = a.sonGuncelleme.localeCompare(b.sonGuncelleme);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={13} className="text-muted-foreground/50" />;
    return sortDir === 'asc'
      ? <ArrowUp size={13} className="text-primary" />
      : <ArrowDown size={13} className="text-primary" />;
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Malzeme adı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-700 hover:bg-primary/90 transition-all duration-150 active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Yeni Malzeme Ekle</span>
          </button>
        </div>

        {/* Status filter chips */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={`stk-filter-${f.value}`}
              onClick={() => { setFilterStatus(f.value); setPage(1); }}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-600 transition-all duration-150 active:scale-95',
                filterStatus === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {[
                { key: 'ad' as SortKey, label: 'Malzeme Adı' },
                { key: 'mevcutMiktar' as SortKey, label: 'Mevcut Stok' },
                { key: 'kritikSeviye' as SortKey, label: 'Kritik Seviye' },
                { key: 'birimMaliyet' as SortKey, label: 'Birim Maliyet' },
                { key: 'sonGuncelleme' as SortKey, label: 'Son Güncelleme' },
              ].map((col) => (
                <th key={`stk-th-${col.key}`} className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1.5 text-xs font-600 uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {col.label}
                    <SortIcon col={col.key} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-600 uppercase tracking-widest text-muted-foreground">
                  Durum
                </span>
              </th>
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
                    <Search size={28} className="text-muted-foreground/30" />
                    <p className="text-sm font-600 text-muted-foreground">Malzeme bulunamadı</p>
                    <p className="text-xs text-muted-foreground/70">
                      Arama teriminizi değiştirin veya yeni malzeme ekleyin
                    </p>
                    <button
                      onClick={onAdd}
                      className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-all active:scale-95"
                    >
                      Yeni Malzeme Ekle
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => {
                const status = getStockStatus(item);
                const isRowCritical = status === 'kritik' || status === 'tukendi';
                const isRowWarning = status === 'uyari';
                return (
                  <tr
                    key={item.id}
                    className={[
                      'border-b border-border last:border-0 transition-all duration-200 group',
                      deletingIds.has(item.id) ? 'row-delete' : '',
                      isRowCritical
                        ? 'bg-critical-subtle/30 hover:bg-critical-subtle/50'
                        : isRowWarning
                        ? 'bg-warning-subtle/30 hover:bg-warning-subtle/50'
                        : idx % 2 === 1
                        ? 'bg-secondary/20 hover:bg-secondary/50' :'hover:bg-secondary/40',
                    ].join(' ')}
                  >
                    {/* Malzeme adı */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusIcon item={item} />
                        <span className="text-sm font-600 text-foreground">{item.ad}</span>
                      </div>
                    </td>

                    {/* Stok seviyesi */}
                    <td className="px-4 py-3.5">
                      <StockLevelBar item={item} />
                    </td>

                    {/* Kritik seviye */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-muted-foreground font-tabular">
                        {item.kritikSeviye} {item.birim}
                      </span>
                    </td>

                    {/* Birim maliyet */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-600 font-tabular text-foreground">
                        {formatCurrency(item.birimMaliyet)} / {item.birim}
                      </span>
                    </td>

                    {/* Son güncelleme */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(item.sonGuncelleme)}
                      </span>
                    </td>

                    {/* Durum */}
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        variant={status === 'normal' ? 'normal' : status === 'uyari' ? 'uyari' : status === 'kritik' ? 'kritik' : 'tukendi'}
                        label={
                          status === 'normal' ? 'Normal'
                          : status === 'uyari' ? 'Uyarı'
                          : status === 'kritik'? 'Kritik' :'Tükendi'
                        }
                        size="sm"
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative group/btn">
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-150 active:scale-95"
                            aria-label={`${item.ad} düzenle`}
                          >
                            <Pencil size={15} />
                          </button>
                          <span className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-foreground text-primary-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
                            Stok güncelle
                          </span>
                        </div>
                        <div className="relative group/btn">
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-critical/10 hover:text-critical transition-all duration-150 active:scale-95"
                            aria-label={`${item.ad} sil`}
                          >
                            <Trash2 size={15} />
                          </button>
                          <span className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-foreground text-primary-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
                            Bu kalemi sil
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-secondary/20">
        <span className="text-xs text-muted-foreground">
          {items.length} malzeme
        </span>
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
            const pageNum = i + 1;
            return (
              <button
                key={`stk-page-${pageNum}`}
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