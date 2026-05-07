'use client';

import React from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import type { FilterPeriod } from './GelirGiderContent';
import type { TransactionType, TransactionCategory } from '@/lib/storage';

interface TransactionFiltersProps {
  filterPeriod: FilterPeriod;
  setFilterPeriod: (v: FilterPeriod) => void;
  filterTur: 'tumu' | TransactionType;
  setFilterTur: (v: 'tumu' | TransactionType) => void;
  filterKategori: 'tumu' | TransactionCategory;
  setFilterKategori: (v: 'tumu' | TransactionCategory) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onAdd: () => void;
}

const PERIODS: { value: FilterPeriod; label: string }[] = [
  { value: 'tum', label: 'Tümü' },
  { value: 'gunluk', label: 'Bugün' },
  { value: 'haftalik', label: 'Bu Hafta' },
  { value: 'aylik', label: 'Bu Ay' },
];

const CATEGORIES: { value: 'tumu' | TransactionCategory; label: string }[] = [
  { value: 'tumu', label: 'Tüm Kategoriler' },
  { value: 'Satış', label: 'Satış' },
  { value: 'Un', label: 'Un' },
  { value: 'Maya', label: 'Maya' },
  { value: 'Tuz', label: 'Tuz' },
  { value: 'Susam', label: 'Susam' },
  { value: 'Odun', label: 'Odun' },
  { value: 'Personel', label: 'Personel' },
  { value: 'Su', label: 'Su' },
  { value: 'Elektrik', label: 'Elektrik' },
  { value: 'Kira', label: 'Kira' },
  { value: 'Yumurta', label: 'Yumurta' },
  { value: 'Tereyağı', label: 'Tereyağı' },
  { value: 'Ambalaj', label: 'Ambalaj' },
  { value: 'Diğer', label: 'Diğer' },
];

export default function TransactionFilters({
  filterPeriod,
  setFilterPeriod,
  filterTur,
  setFilterTur,
  filterKategori,
  setFilterKategori,
  searchQuery,
  setSearchQuery,
  onAdd,
}: TransactionFiltersProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Açıklama veya kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {/* Add button */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-700 hover:bg-primary/90 transition-all duration-150 active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>Yeni İşlem Ekle</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-muted-foreground shrink-0" />

        {/* Period chips */}
        <div className="flex gap-1.5 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={`period-${p.value}`}
              onClick={() => setFilterPeriod(p.value)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-600 transition-all duration-150 active:scale-95',
                filterPeriod === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border hidden sm:block" />

        {/* Type filter */}
        <div className="flex gap-1.5">
          {(['tumu', 'gelir', 'gider'] as const).map((t) => (
            <button
              key={`tur-${t}`}
              onClick={() => setFilterTur(t)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-600 transition-all duration-150 active:scale-95',
                filterTur === t
                  ? t === 'gelir' ?'bg-gelir-subtle text-gelir border border-gelir/20'
                    : t === 'gider' ?'bg-gider-subtle text-gider border border-gider/20' :'bg-primary text-primary-foreground' :'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')}
            >
              {t === 'tumu' ? 'Tür: Tümü' : t === 'gelir' ? 'Gelir' : 'Gider'}
            </button>
          ))}
        </div>

        {/* Category select */}
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value as 'tumu' | TransactionCategory)}
          className="px-3 py-1.5 rounded-lg text-xs font-600 border border-input bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
        >
          {CATEGORIES.map((c) => (
            <option key={`cat-opt-${c.value}`} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}