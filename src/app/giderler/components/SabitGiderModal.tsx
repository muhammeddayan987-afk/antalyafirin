'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type SabitGider, type SabitGiderKategori, getCurrentMonthString } from '@/lib/storage';

interface SabitGiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SabitGider, 'id'>) => void;
  editingItem: SabitGider | null;
}

const KATEGORILER: SabitGiderKategori[] = ['Elektrik', 'Su', 'Kira', 'Personel', 'Diğer Sabit'];

export default function SabitGiderModal({ isOpen, onClose, onSave, editingItem }: SabitGiderModalProps) {
  const [kategori, setKategori] = useState<SabitGiderKategori>('Kira');
  const [aciklama, setAciklama] = useState('');
  const [aylikTutar, setAylikTutar] = useState('');
  const [ay, setAy] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setKategori(editingItem.kategori);
        setAciklama(editingItem.aciklama);
        setAylikTutar(String(editingItem.aylikTutar));
        setAy(editingItem.ay);
      } else {
        setKategori('Kira');
        setAciklama('');
        setAylikTutar('');
        setAy(getCurrentMonthString());
      }
      setErrors({});
    }
  }, [isOpen, editingItem]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!aciklama.trim()) errs.aciklama = 'Açıklama zorunludur';
    if (!aylikTutar || parseFloat(aylikTutar) <= 0) errs.tutar = 'Geçerli tutar girin';
    if (!ay) errs.ay = 'Ay seçiniz';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    onSave({ kategori, aciklama: aciklama.trim(), aylikTutar: parseFloat(aylikTutar), ay });
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
        className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-700 text-foreground">
            {editingItem ? 'Sabit Gideri Düzenle' : 'Sabit Gider Ekle'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-600 text-foreground mb-1">Kategori</label>
            <select
              value={kategori}
              onChange={e => setKategori(e.target.value as SabitGiderKategori)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
            >
              {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-600 text-foreground mb-1">
              Açıklama <span className="text-critical">*</span>
            </label>
            <input
              type="text"
              value={aciklama}
              onChange={e => setAciklama(e.target.value)}
              placeholder="örn: Aylık işyeri kirası"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            {errors.aciklama && <p className="mt-1 text-xs text-critical">{errors.aciklama}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-600 text-foreground mb-1">
                Aylık Tutar (₺) <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-600 text-sm">₺</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={aylikTutar}
                  onChange={e => setAylikTutar(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
                />
              </div>
              {errors.tutar && <p className="mt-1 text-xs text-critical">{errors.tutar}</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-foreground mb-1">
                Ay <span className="text-critical">*</span>
              </label>
              <input
                type="month"
                value={ay}
                onChange={e => setAy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              {errors.ay && <p className="mt-1 text-xs text-critical">{errors.ay}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-600 text-foreground hover:bg-muted transition-all">
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-700 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                editingItem ? 'Güncelle' : 'Ekle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
