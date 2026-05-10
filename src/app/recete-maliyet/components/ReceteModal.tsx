'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChefHat } from 'lucide-react';
import { formatCurrency, calculateRecipeCost, type Recipe, type RecipeIngredient, type Malzeme, type RecipeMeasureUnit } from '@/lib/storage';

interface ReceteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Recipe, 'id' | 'createdAt'>) => void;
  editingRecipe: Recipe | null;
  malzemeler: Malzeme[];
}

const URUN_SUGGESTIONS = ['Ekmek', 'Börek', 'Simit', 'Poğaça', 'Pide', 'Baklava', 'Kurabiye', 'Çörek', 'Pasta', 'Tart'];
const MEASURE_UNITS: RecipeMeasureUnit[] = ['kg', 'g', 'lt', 'ml', 'adet'];

export default function ReceteModal({ isOpen, onClose, onSave, editingRecipe, malzemeler }: ReceteModalProps) {
  const [ad, setAd] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [malzemeList, setMalzemeList] = useState<RecipeIngredient[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingRecipe) {
        setAd(editingRecipe.ad);
        setAciklama(editingRecipe.aciklama);
        setMalzemeList(editingRecipe.malzemeler.map(m => ({ ...m })));
      } else {
        setAd('');
        setAciklama('');
        setMalzemeList([]);
      }
      setErrors({});
    }
  }, [isOpen, editingRecipe]);

  const addIngredient = () => {
    if (malzemeler.length === 0) return;
    const first = malzemeler[0];
    setMalzemeList(prev => [...prev, {
      malzemeId: first.id,
      malzemeAd: first.ad,
      miktar: 1,
      birim: first.topluBirim === 'adet' ? 'adet' : first.topluBirim === 'lt' ? 'lt' : 'kg',
    }]);
  };

  const updateIngredient = (idx: number, field: keyof RecipeIngredient, value: string | number) => {
    setMalzemeList(prev => {
      const updated = [...prev];
      if (field === 'malzemeId') {
        const m = malzemeler.find(x => x.id === value);
        if (m) {
          const defaultBirim: RecipeMeasureUnit = m.topluBirim === 'adet' ? 'adet' : m.topluBirim === 'lt' ? 'lt' : m.topluBirim === 'ml' ? 'ml' : m.topluBirim === 'g' ? 'g' : 'kg';
          updated[idx] = { ...updated[idx], malzemeId: m.id, malzemeAd: m.ad, birim: defaultBirim };
        }
      } else if (field === 'miktar') {
        updated[idx] = { ...updated[idx], miktar: Number(value) };
      } else if (field === 'birim') {
        updated[idx] = { ...updated[idx], birim: value as RecipeMeasureUnit };
      }
      return updated;
    });
  };

  const removeIngredient = (idx: number) => {
    setMalzemeList(prev => prev.filter((_, i) => i !== idx));
  };

  const totalCost = calculateRecipeCost({ id: '', ad, aciklama, malzemeler: malzemeList, createdAt: '' }, malzemeler);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!ad.trim()) errs.ad = 'Ürün adı zorunludur';
    if (malzemeList.length === 0) errs.malzemeler = 'En az bir malzeme ekleyin';
    malzemeList.forEach((m, i) => {
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
    onSave({ ad: ad.trim(), aciklama: aciklama.trim(), malzemeler: malzemeList });
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
                disabled={malzemeler.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-600 hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={13} />
                Malzeme Ekle
              </button>
            </div>

            {malzemeler.length === 0 && (
              <div className="text-xs text-muted-foreground bg-muted rounded-xl px-4 py-3">
                Önce Malzemeler ekranından malzeme ekleyin.
              </div>
            )}

            {errors.malzemeler && <p className="mb-2 text-xs text-critical">{errors.malzemeler}</p>}

            <div className="space-y-2">
              {malzemeList.map((ing, idx) => {
                const malzeme = malzemeler.find(m => m.id === ing.malzemeId);
                const lineCost = malzeme
                  ? (() => {
                      const costPerBase = malzeme.topluFiyat / malzeme.topluMiktar;
                      // Convert
                      let converted = ing.miktar;
                      if (ing.birim === 'g' && malzeme.topluBirim === 'kg') converted = ing.miktar / 1000;
                      else if (ing.birim === 'kg' && malzeme.topluBirim === 'g') converted = ing.miktar * 1000;
                      else if (ing.birim === 'ml' && malzeme.topluBirim === 'lt') converted = ing.miktar / 1000;
                      else if (ing.birim === 'lt' && malzeme.topluBirim === 'ml') converted = ing.miktar * 1000;
                      return converted * costPerBase;
                    })()
                  : 0;

                return (
                  <div key={`ing-${idx}`} className="bg-muted/50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Malzeme select */}
                      <select
                        value={ing.malzemeId}
                        onChange={e => updateIngredient(idx, 'malzemeId', e.target.value)}
                        className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                      >
                        {malzemeler.map(m => (
                          <option key={m.id} value={m.id}>{m.ad}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-critical/10 hover:text-critical transition-all shrink-0"
                        aria-label="Kaldır"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Miktar */}
                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={ing.miktar}
                        onChange={e => updateIngredient(idx, 'miktar', e.target.value)}
                        className="w-28 px-2.5 py-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
                        placeholder="Miktar"
                      />
                      {/* Birim */}
                      <select
                        value={ing.birim}
                        onChange={e => updateIngredient(idx, 'birim', e.target.value)}
                        className="w-20 px-2 py-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                      >
                        {MEASURE_UNITS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      {/* Line cost */}
                      <span className="ml-auto text-xs font-700 text-primary">
                        {formatCurrency(lineCost)}
                      </span>
                    </div>
                    {errors[`miktar_${idx}`] && (
                      <p className="text-xs text-critical">{errors[`miktar_${idx}`]}</p>
                    )}
                    {malzeme && (
                      <p className="text-xs text-muted-foreground">
                        Stok birim maliyeti: {formatCurrency(malzeme.topluFiyat / malzeme.topluMiktar)} / {malzeme.topluBirim}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total cost preview */}
          {malzemeList.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-600 text-foreground">Toplam Parti Maliyeti</span>
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-700 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                editingRecipe ? 'Güncelle' : 'Reçete Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
