'use client';

import React, { useState, useEffect } from 'react';
import {
  getSabitGiderler,
  saveSabitGiderler,
  getTransactions,
  formatCurrency,
  getCurrentMonthString,
  type SabitGider,
  type Transaction,
} from '@/lib/storage';
import { toast } from 'sonner';
import { Building2, Zap, Droplets, Users, Plus, Pencil, Trash2, TrendingDown, BarChart3 } from 'lucide-react';
import SabitGiderModal from './SabitGiderModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

const KATEGORI_ICONS: Record<string, React.ReactNode> = {
  'Kira': <Building2 size={15} />,
  'Elektrik': <Zap size={15} />,
  'Su': <Droplets size={15} />,
  'Personel': <Users size={15} />,
  'Diğer Sabit': <BarChart3 size={15} />,
};

export default function GiderlerContent() {
  const [sabitGiderler, setSabitGiderler] = useState<SabitGider[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SabitGider | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedAy, setSelectedAy] = useState('');

  useEffect(() => {
    setSabitGiderler(getSabitGiderler());
    setTransactions(getTransactions());
    setSelectedAy(getCurrentMonthString());
    setLoading(false);
  }, []);

  const handleSave = (data: Omit<SabitGider, 'id'>) => {
    if (editingItem) {
      const updated = sabitGiderler.map(g =>
        g.id === editingItem.id ? { ...g, ...data } : g
      );
      setSabitGiderler(updated);
      saveSabitGiderler(updated);
      toast.success('Sabit gider güncellendi');
    } else {
      const newItem: SabitGider = { ...data, id: `sg-${Date.now()}` };
      const updated = [newItem, ...sabitGiderler];
      setSabitGiderler(updated);
      saveSabitGiderler(updated);
      toast.success('Sabit gider eklendi');
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const updated = sabitGiderler.filter(g => g.id !== deleteTarget);
    setSabitGiderler(updated);
    saveSabitGiderler(updated);
    setDeleteTarget(null);
    toast.success('Sabit gider silindi');
  };

  // Filter by selected month
  const filteredSabit = sabitGiderler.filter(g => !selectedAy || g.ay === selectedAy);

  // Variable costs from transactions for selected month
  const variableCosts = transactions.filter(t => {
    if (t.tur !== 'gider' || !t.isVariableCost) return false;
    if (!selectedAy) return true;
    return t.tarih.startsWith(selectedAy);
  });

  const totalSabit = filteredSabit.reduce((s, g) => s + g.aylikTutar, 0);
  const totalDegisken = variableCosts.reduce((s, t) => s + t.miktar, 0);
  const totalGider = totalSabit + totalDegisken;

  // All months from sabit giderler for filter
  const aylar = Array.from(new Set(sabitGiderler.map(g => g.ay))).sort().reverse();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-muted rounded-2xl h-24" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Month filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-600 text-foreground shrink-0">Ay Filtresi:</label>
        <select
          value={selectedAy}
          onChange={e => setSelectedAy(e.target.value)}
          className="px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
        >
          <option value="">Tüm Aylar</option>
          {aylar.map(ay => (
            <option key={ay} value={ay}>{ay}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 size={15} className="text-primary" />
            </div>
            <span className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Sabit Giderler</span>
          </div>
          <p className="text-2xl font-700 text-foreground">{formatCurrency(totalSabit)}</p>
          <p className="text-xs text-muted-foreground mt-1">{filteredSabit.length} kalem</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <TrendingDown size={15} className="text-warning" />
            </div>
            <span className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Değişken Giderler</span>
          </div>
          <p className="text-2xl font-700 text-foreground">{formatCurrency(totalDegisken)}</p>
          <p className="text-xs text-muted-foreground mt-1">Üretimden otomatik</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-critical/10 flex items-center justify-center">
              <BarChart3 size={15} className="text-critical" />
            </div>
            <span className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Toplam Gider</span>
          </div>
          <p className="text-2xl font-700 text-critical">{formatCurrency(totalGider)}</p>
          <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
            <span>Sabit: {totalGider > 0 ? Math.round((totalSabit / totalGider) * 100) : 0}%</span>
            <span>·</span>
            <span>Değişken: {totalGider > 0 ? Math.round((totalDegisken / totalGider) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sabit Giderler */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-primary" />
              <h2 className="text-sm font-700 text-foreground">Sabit Giderler</h2>
            </div>
            <button
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-700 hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus size={13} />
              Ekle
            </button>
          </div>

          {filteredSabit.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Bu ay için sabit gider yok</p>
              <button
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-600 hover:bg-primary/90 transition-all"
              >
                Sabit Gider Ekle
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredSabit.map(g => (
                <div key={g.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    {KATEGORI_ICONS[g.kategori] || <Building2 size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-foreground truncate">{g.aciklama}</p>
                    <p className="text-xs text-muted-foreground">{g.kategori} · {g.ay}</p>
                  </div>
                  <span className="text-sm font-700 text-foreground font-tabular shrink-0">{formatCurrency(g.aylikTutar)}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => { setEditingItem(g); setIsModalOpen(true); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(g.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-critical/10 hover:text-critical transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="px-4 py-3 bg-secondary/30 flex items-center justify-between">
                <span className="text-sm font-700 text-foreground">Toplam Sabit</span>
                <span className="text-sm font-700 text-primary">{formatCurrency(totalSabit)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Değişken Giderler (auto from production) */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <TrendingDown size={16} className="text-warning" />
            <h2 className="text-sm font-700 text-foreground">Değişken Giderler</h2>
            <span className="text-xs text-muted-foreground ml-1">(Üretimden otomatik)</span>
          </div>

          {variableCosts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Bu ay için değişken gider yok</p>
              <p className="text-xs text-muted-foreground mt-1">Üretim kaydı oluşturunca buraya otomatik eklenir</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {variableCosts.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                    <TrendingDown size={13} className="text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-foreground truncate">{t.aciklama}</p>
                    <p className="text-xs text-muted-foreground">{t.tarih}</p>
                  </div>
                  <span className="text-sm font-700 text-foreground font-tabular shrink-0">{formatCurrency(t.miktar)}</span>
                </div>
              ))}
              <div className="px-4 py-3 bg-secondary/30 flex items-center justify-between">
                <span className="text-sm font-700 text-foreground">Toplam Değişken</span>
                <span className="text-sm font-700 text-warning">{formatCurrency(totalDegisken)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <SabitGiderModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSave={handleSave}
        editingItem={editingItem}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Sabit gideri sil"
        message="Bu sabit gideri kalıcı olarak silmek istediğinizden emin misiniz?"
        confirmLabel="Evet, Sil"
        isDestructive
      />
    </div>
  );
}
