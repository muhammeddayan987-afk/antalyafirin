'use client';

import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Package } from 'lucide-react';
import { gramBirimMaliyet, formatCurrency, type Malzeme } from '@/lib/storage';

interface MalzemeTableProps {
  items: Malzeme[];
  deletingIds: Set<string>;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onAdd: () => void;
  onEdit: (item: Malzeme) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'ad' | 'ambalajTuru' | 'topluMiktar' | 'topluFiyat' | 'birimMaliyet';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

export default function MalzemeTable({
  items,
  deletingIds,
  searchQuery,
  setSearchQuery,
  onAdd,
  onEdit,
  onDelete,
}: MalzemeTableProps) {
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
    else if (sortKey === 'ambalajTuru') cmp = a.ambalajTuru.localeCompare(b.ambalajTuru, 'tr');
    else if (sortKey === 'topluMiktar') cmp = a.topluMiktar - b.topluMiktar;
    else if (sortKey === 'topluFiyat') cmp = a.topluFiyat - b.topluFiyat;
    else if (sortKey === 'birimMaliyet') cmp = gramBirimMaliyet(a) - gramBirimMaliyet(b);
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
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Malzeme adı ara..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-700 hover:bg-primary/90 transition-all duration-150 active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Yeni Malzeme</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {[
                { key: 'ad' as SortKey, label: 'Malzeme Adı' },
                { key: 'ambalajTuru' as SortKey, label: 'Ambalaj' },
                { key: 'topluMiktar' as SortKey, label: 'Toplu Miktar' },
                { key: 'topluFiyat' as SortKey, label: 'Toplu Fiyat' },
                { key: 'birimMaliyet' as SortKey, label: 'Birim Başına Maliyet' },
              ].map((col) => (
                <th key={`th-${col.key}`} className="px-4 py-3 text-left">
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
                <span className="text-xs font-600 uppercase tracking-widest text-muted-foreground">İşlemler</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={28} className="text-muted-foreground/30" />
                    <p className="text-sm font-600 text-muted-foreground">Malzeme bulunamadı</p>
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
                const birimMaliyet = gramBirimMaliyet(item);
                return (
                  <tr
                    key={item.id}
                    className={[
                      'border-b border-border last:border-0 transition-all duration-200 group',
                      deletingIds.has(item.id) ? 'opacity-40 scale-95' : '',
                      idx % 2 === 1 ? 'bg-secondary/20 hover:bg-secondary/50' : 'hover:bg-secondary/40',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Package size={13} className="text-primary" />
                        </span>
                        <span className="text-sm font-600 text-foreground">{item.ad}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-secondary text-xs font-600 text-foreground">
                        {item.ambalajTuru}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-tabular text-foreground">
                        {item.topluMiktar} {item.topluBirim}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-tabular font-600 text-foreground">
                        {formatCurrency(item.topluFiyat)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-700 text-primary font-tabular">
                          {formatCurrency(birimMaliyet)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ {item.topluBirim}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                          aria-label="Düzenle"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-critical/10 hover:text-critical transition-all"
                          aria-label="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
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
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {sorted.length} malzeme · Sayfa {page}/{totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 transition-all"
            >
              <ArrowUp size={14} className="rotate-[-90deg]" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 transition-all"
            >
              <ArrowDown size={14} className="rotate-[-90deg]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
