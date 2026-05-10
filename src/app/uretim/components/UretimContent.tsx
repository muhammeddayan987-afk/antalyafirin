'use client';

import React, { useState, useEffect } from 'react';
import {
  getProductions,
  saveProductions,
  getTransactions,
  saveTransactions,
  getTodayString,
  formatCurrency,
  formatDate,
  type Production,
} from '@/lib/storage';
import { toast } from 'sonner';
import { Factory, Plus, Trash2, TrendingDown, Package, Calculator, Zap } from 'lucide-react';
import UretimModal from './UretimModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function UretimContent() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    setProductions(getProductions());
    setLoading(false);
  }, []);

  const handleSave = (data: Omit<Production, 'id' | 'createdAt'>) => {
    const today = getTodayString();
    const newProduction: Production = {
      ...data,
      id: `prd-${Date.now()}`,
      createdAt: today,
    };

    // Auto-add to transactions as variable cost
    const transactions = getTransactions();
    const newExpense = {
      id: `txn-${Date.now()}`,
      tarih: data.tarih,
      tur: 'gider' as const,
      kategori: 'Üretim Maliyeti' as const,
      aciklama: `${data.receteAd} üretimi — ${data.uretimAdedi} adet (birim: ${formatCurrency(data.birimMaliyet)})`,
      miktar: data.topluPartiMaliyeti,
      createdAt: today,
      isVariableCost: true,
    };
    saveTransactions([newExpense, ...transactions]);

    const updated = [newProduction, ...productions];
    setProductions(updated);
    saveProductions(updated);
    setIsModalOpen(false);
    setEditingProduction(null);
    toast.success(
      `Üretim kaydedildi. ${formatCurrency(data.topluPartiMaliyeti)} değişken gider olarak işlendi.`,
      { duration: 4000 }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const updated = productions.filter(p => p.id !== deleteTarget);
    setProductions(updated);
    saveProductions(updated);
    setDeleteTarget(null);
    toast.success('Üretim kaydı silindi');
  };

  const totalProduced = productions.reduce((s, p) => s + p.uretimAdedi, 0);
  const totalCost = productions.reduce((s, p) => s + p.topluPartiMaliyeti, 0);
  const avgUnitCost = totalProduced > 0 ? totalCost / totalProduced : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-muted rounded-2xl h-24" />)}
        </div>
        <div className="animate-pulse bg-muted rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Package size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Toplam Üretilen</p>
            <p className="text-xl font-700 text-foreground">{totalProduced.toLocaleString('tr-TR')} adet</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-critical/10 flex items-center justify-center shrink-0">
            <TrendingDown size={18} className="text-critical" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Toplam Üretim Maliyeti</p>
            <p className="text-xl font-700 text-foreground">{formatCurrency(totalCost)}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gelir/10 flex items-center justify-center shrink-0">
            <Calculator size={18} className="text-gelir" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ort. Birim Maliyet</p>
            <p className="text-xl font-700 text-foreground">{formatCurrency(avgUnitCost)}</p>
          </div>
        </div>
      </div>

      {/* Auto-expense info banner */}
      <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <Zap size={16} className="text-warning shrink-0" />
        <p className="text-sm text-foreground">
          Her üretim kaydı otomatik olarak <span className="font-700">Giderler</span> takibine değişken maliyet olarak eklenir.
        </p>
      </div>

      {/* Production list */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Factory size={18} className="text-primary" />
            <h2 className="text-sm font-700 text-foreground">Üretim Kayıtları</h2>
            <span className="text-xs text-muted-foreground">({productions.length})</span>
          </div>
          <button
            onClick={() => { setEditingProduction(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-700 hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus size={15} />
            Yeni Üretim
          </button>
        </div>

        {productions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <Factory size={24} className="text-primary" />
            </div>
            <p className="text-sm font-600 text-foreground mb-1">Henüz üretim kaydı yok</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Reçete seçerek üretim kaydı oluşturun. Birim maliyet otomatik hesaplanır.
            </p>
            <button
              onClick={() => { setEditingProduction(null); setIsModalOpen(true); }}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-600 hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus size={15} />
              İlk Üretimi Kaydet
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-600 uppercase tracking-widest text-muted-foreground">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-600 uppercase tracking-widest text-muted-foreground">Ürün (Reçete)</th>
                  <th className="px-4 py-3 text-left text-xs font-600 uppercase tracking-widest text-muted-foreground">Üretilen Adet</th>
                  <th className="px-4 py-3 text-left text-xs font-600 uppercase tracking-widest text-muted-foreground">Parti Maliyeti</th>
                  <th className="px-4 py-3 text-left text-xs font-600 uppercase tracking-widest text-muted-foreground">Birim Maliyet</th>
                  <th className="px-4 py-3 text-right text-xs font-600 uppercase tracking-widest text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {productions.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={[
                      'border-b border-border last:border-0 transition-all group',
                      idx % 2 === 1 ? 'bg-secondary/20 hover:bg-secondary/50' : 'hover:bg-secondary/40',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{formatDate(p.tarih)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Factory size={13} className="text-primary" />
                        </span>
                        <span className="text-sm font-600 text-foreground">{p.receteAd}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-tabular text-foreground">{p.uretimAdedi} adet</td>
                    <td className="px-4 py-3.5 text-sm font-tabular font-600 text-foreground">{formatCurrency(p.topluPartiMaliyeti)}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-700 text-primary font-tabular">{formatCurrency(p.birimMaliyet)}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ adet</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setDeleteTarget(p.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-critical/10 hover:text-critical transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UretimModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduction(null); }}
        onSave={handleSave}
        editingProduction={editingProduction}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Üretim kaydını sil"
        message="Bu üretim kaydını silmek istediğinizden emin misiniz? Giderlere eklenen kayıt etkilenmez."
        confirmLabel="Evet, Sil"
        isDestructive
      />
    </div>
  );
}
