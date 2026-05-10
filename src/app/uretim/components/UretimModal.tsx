'use client';

import React, { useState, useEffect } from 'react';
import { X, Factory, ChevronDown } from 'lucide-react';
import {
  getRecipes,
  getMalzemeler,
  calculateRecipeCost,
  formatCurrency,
  type Recipe,
  type Malzeme,
  type Production,
} from '@/lib/storage';

interface UretimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (production: Omit<Production, 'id' | 'createdAt'>) => void;
  editingProduction: Production | null;
}

export default function UretimModal({ isOpen, onClose, onSave, editingProduction }: UretimModalProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [malzemeler, setMalzemeler] = useState<Malzeme[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [uretimAdedi, setUretimAdedi] = useState('');
  const [tarih, setTarih] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const r = getRecipes();
      const m = getMalzemeler();
      setRecipes(r);
      setMalzemeler(m);
      if (editingProduction) {
        setSelectedRecipeId(editingProduction.receteId);
        setUretimAdedi(String(editingProduction.uretimAdedi));
        setTarih(editingProduction.tarih);
      } else {
        setSelectedRecipeId(r.length > 0 ? r[0].id : '');
        setUretimAdedi('');
        const today = new Date().toISOString().split('T')[0];
        setTarih(today);
      }
      setErrors({});
    }
  }, [isOpen, editingProduction]);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
  const topluPartiMaliyeti = selectedRecipe ? calculateRecipeCost(selectedRecipe, malzemeler) : 0;
  const adetNum = parseFloat(uretimAdedi) || 0;
  const birimMaliyet = adetNum > 0 ? topluPartiMaliyeti / adetNum : 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedRecipeId) errs.recete = 'Reçete seçiniz';
    if (!uretimAdedi || adetNum <= 0) errs.adet = 'Geçerli üretim adedi girin';
    if (!tarih) errs.tarih = 'Tarih zorunludur';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedRecipe) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    onSave({
      receteId: selectedRecipe.id,
      receteAd: selectedRecipe.ad,
      tarih,
      uretimAdedi: adetNum,
      topluPartiMaliyeti,
      birimMaliyet,
    });
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
        className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md modal-content max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-base font-700 text-foreground flex items-center gap-2">
            <Factory size={18} className="text-primary" />
            {editingProduction ? 'Üretimi Düzenle' : 'Yeni Üretim Kaydı'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Reçete seç */}
          <div>
            <label className="block text-sm font-600 text-foreground mb-1">
              Reçete <span className="text-critical">*</span>
            </label>
            {recipes.length === 0 ? (
              <div className="text-xs text-muted-foreground bg-muted rounded-xl px-4 py-3">
                Önce Tarif ekranından reçete oluşturun.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedRecipeId}
                  onChange={e => setSelectedRecipeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer appearance-none"
                >
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>{r.ad}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            )}
            {errors.recete && <p className="mt-1 text-xs text-critical">{errors.recete}</p>}
          </div>

          {/* Tarih */}
          <div>
            <label className="block text-sm font-600 text-foreground mb-1">
              Üretim Tarihi <span className="text-critical">*</span>
            </label>
            <input
              type="date"
              value={tarih}
              onChange={e => setTarih(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            {errors.tarih && <p className="mt-1 text-xs text-critical">{errors.tarih}</p>}
          </div>

          {/* Üretim adedi */}
          <div>
            <label className="block text-sm font-600 text-foreground mb-1">
              Üretilen Ürün Sayısı <span className="text-critical">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">Bu partiden kaç adet üretildi?</p>
            <input
              type="number"
              min="1"
              step="1"
              value={uretimAdedi}
              onChange={e => setUretimAdedi(e.target.value)}
              placeholder="örn: 200"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
            />
            {errors.adet && <p className="mt-1 text-xs text-critical">{errors.adet}</p>}
          </div>

          {/* Auto-calculated costs */}
          {selectedRecipe && topluPartiMaliyeti > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <p className="text-xs font-600 text-primary">Otomatik Hesaplanan Maliyetler</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Toplam Parti Maliyeti</span>
                <span className="text-sm font-700 text-foreground">{formatCurrency(topluPartiMaliyeti)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-primary/20 pt-2">
                <span className="text-sm font-600 text-foreground">Tek Ürün Birim Maliyeti</span>
                <span className="text-lg font-700 text-primary">
                  {adetNum > 0 ? formatCurrency(birimMaliyet) : '—'}
                </span>
              </div>
              {adetNum > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {formatCurrency(topluPartiMaliyeti)} ÷ {adetNum} adet = {formatCurrency(birimMaliyet)} / adet
                </p>
              )}
            </div>
          )}

          <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3">
            <p className="text-xs text-warning font-600">
              ⚡ Üretim maliyeti otomatik olarak Giderler&apos;e değişken maliyet olarak kaydedilecek.
            </p>
          </div>

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
              disabled={submitting || recipes.length === 0}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-700 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                editingProduction ? 'Güncelle' : 'Üretimi Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
