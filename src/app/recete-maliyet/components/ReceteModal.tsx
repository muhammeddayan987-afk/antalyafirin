'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChefHat } from 'lucide-react';
import { formatCurrency, type Recipe, type RecipeIngredient, type StockItem, type StockUnit } from '@/lib/storage';

interface ReceteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Recipe, 'id' | 'createdAt'>) => void;
  editingRecipe: Recipe | null;
  stockItems: StockItem[];
}

const URUN_SUGGESTIONS = ['Ekmek', 'Börek', 'Simit', 'Poğaça', 'Pide', 'Baklava', 'Kurabiye', 'Çörek', 'Pasta', 'Tart'];

export default function ReceteModal({ isOpen, onClose, onSave, editingRecipe, stockItems }: ReceteModalProps) {
  const [ad, setAd] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [malzemeler, setMalzemeler] = useState<RecipeIngredient[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingRecipe) {
        setAd(editingRecipe.ad);
        setAciklama(editingRecipe.aciklama);
        setMalzemeler(editingRecipe.malzemeler.map(m => ({ ...m })));
      } else {
        setAd('');
        setAciklama('');
        setMalzemeler([]);
      }
      setErrors({});
    }
  }, [isOpen, editingRecipe]);

  const addIngredient = () => {
    if (stockItems.length === 0) return;
    const first = stockItems[0];
    setMalzemeler(prev => [...prev, {
      stockItemId: first.id,
      stockItemAd: first.ad,
      miktar: 1,
      birim: first.birim,
    }]);
  };

  const updateIngredient = (idx: number, field: keyof RecipeIngredient, value: string | number) => {
    setMalzemeler(prev => {
      const updated = [...prev];
      if (field === 'stockItemId') {
        const stock = stockItems.find(s => s.id === value);
        if (stock) {
          updated[idx] = { ...updated[idx], stockItemId: stock.id, stockItemAd: stock.ad, birim: stock.birim };
        }
      } else if (field === 'miktar') {
        updated[idx] = { ...updated[idx], miktar: Number(value) };
      } else {
        (updated[idx] as Record<string, unknown>)[field] = value;
      }
      return updated;
    });
  };

  const removeIngredient = (idx: number) => {
    setMalzemeler(prev => prev.filter((_, i) => i !== idx));
  };

  const totalCost = malzemeler.reduce((sum, ing) => {
    const stock = stockItems.find(s => s.id === ing.stockItemId);
    return sum + (stock ? ing.miktar * stock.birimMaliyet : 0);
  }, 0);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!ad.trim()) errs.ad = 'Ürün adı zorunludur';
    if (malzemeler.length === 0) errs.malzemeler = 'En az bir malzeme ekleyin';
    malzemeler.forEach((m, i) => {
      if (!m.miktar || m.miktar <= 0) errs[`miktar_${i}`] = 'Geçerli miktar girin';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    onSave({ ad: ad.trim(), aciklama: aciklama.trim(), malzemeler });
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(28, 10, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-lg modal-content max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recete-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 id="recete-modal-title" className="text-base font-700 text-foreground flex items-center gap-2">
            <ChefHat size={18} className="text-primary" />
            {editingRecipe ? 'Reçeteyi Düzenle' : 'Yeni Reçete Oluştur'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Ürün adı */}
          <div>
            <label htmlFor="rec-ad" className="block text-sm font-600 text-foreground mb-1">
              Ürün Adı <span className="text-critical">*</span>
            </label>
            <input
              id="rec-ad"
              type="text"
              list="urun-suggestions"
              placeholder="örn: Ekmek, Börek, Simit..."
              value={ad}
              onChange={e => setAd(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <datalist id="urun-suggestions">
              {URUN_SUGGESTIONS.map(s => <option key={s} value={s} />)}
            </datalist>
            {errors.ad && <p className="mt-1 text-xs text-critical">{errors.ad}</p>}
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="rec-aciklama" className="block text-sm font-600 text-foreground mb-1">
              Açıklama <span className="text-muted-foreground font-400">(isteğe bağlı)</span>
            </label>
            <input
              id="rec-aciklama"
              type="text"
              placeholder="örn: Standart 500g ekmek reçetesi"
              value={aciklama}
              onChange={e => setAciklama(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          {/* Malzemeler */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-600 text-foreground">
                Malzemeler <span className="text-critical">*</span>
              </label>
              <button
                type="button"
                onClick={addIngredient}
                disabled={stockItems.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-600 hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={13} />
                Malzeme Ekle
              </button>
            </div>

            {stockItems.length === 0 && (
              <div className="text-xs text-muted-foreground bg-muted rounded-xl px-4 py-3">
                Önce Stok Yönetimi ekranından malzeme ekleyin.
              </div>
            )}

            {errors.malzemeler && <p className="mb-2 text-xs text-critical">{errors.malzemeler}</p>}

            <div className="space-y-2">
              {malzemeler.map((ing, idx) => {
                const stock = stockItems.find(s => s.id === ing.stockItemId);
                const lineCost = stock ? ing.miktar * stock.birimMaliyet : 0;
                return (
                  <div key={`ing-${idx}`} className="flex items-center gap-2 bg-muted/50 rounded-xl p-3">
                    {/* Stock select */}
                    <select
                      value={ing.stockItemId}
                      onChange={e => updateIngredient(idx, 'stockItemId', e.target.value)}
                      className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                    >
                      {stockItems.map(s => (
                        <option key={s.id} value={s.id}>{s.ad}</option>
                      ))}
                    </select>

                    {/* Miktar */}
                    <div className="relative w-24 shrink-0">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={ing.miktar}
                        onChange={e => updateIngredient(idx, 'miktar', e.target.value)}
                        className="w-full px-2.5 py-2 pr-8 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {ing.birim}
                      </span>
                    </div>

                    {/* Line cost */}
                    <span className="text-xs font-600 text-primary w-16 text-right shrink-0">
                      {formatCurrency(lineCost)}
                    </span>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-critical/10 hover:text-critical transition-all shrink-0"
                      aria-label="Malzemeyi kaldır"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total cost preview */}
          {malzemeler.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-600 text-foreground">Tahmini Toplam Maliyet</span>
              <span className="text-lg font-700 text-primary">{formatCurrency(totalCost)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-600 text-foreground hover:bg-muted transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-600 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : null}
              {editingRecipe ? 'Güncelle' : 'Reçete Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
