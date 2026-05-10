'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Info } from 'lucide-react';
import { formatCurrency, type Malzeme, type AmbalajTuru, type TopluBirim } from '@/lib/storage';

interface MalzemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Malzeme, 'id' | 'sonGuncelleme'>) => void;
  editingItem: Malzeme | null;
}

interface FormValues {
  ad: string;
  ambalajTuru: AmbalajTuru;
  topluMiktar: number;
  topluBirim: TopluBirim;
  topluFiyat: number;
}

const AMBALAJ_TURLERI: AmbalajTuru[] = ['Çuval', 'Koli', 'Teneke', 'Kasa', 'Paket', 'kg', 'L', 'ml', 'g'];
const TOPLU_BIRIMLER: TopluBirim[] = ['kg', 'adet', 'lt', 'g', 'ml'];

const MALZEME_SUGGESTIONS = [
  'Buğday Unu', 'Taze Maya', 'Tuz', 'Susam', 'Çörekotu', 'Tereyağı',
  'Yumurta', 'Ayçiçek Yağı', 'Şeker', 'Süt', 'Peynir', 'Zeytin', 'Odun',
];

export default function MalzemeModal({ isOpen, onClose, onSave, editingItem }: MalzemeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      ad: '',
      ambalajTuru: 'Çuval',
      topluMiktar: undefined,
      topluBirim: 'kg',
      topluFiyat: undefined,
    },
  });

  const watchMiktar = watch('topluMiktar');
  const watchFiyat = watch('topluFiyat');
  const watchBirim = watch('topluBirim');

  const costPerUnit =
    watchMiktar && watchFiyat && Number(watchMiktar) > 0
      ? Number(watchFiyat) / Number(watchMiktar)
      : 0;

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        reset({
          ad: editingItem.ad,
          ambalajTuru: editingItem.ambalajTuru,
          topluMiktar: editingItem.topluMiktar,
          topluBirim: editingItem.topluBirim,
          topluFiyat: editingItem.topluFiyat,
        });
      } else {
        reset({
          ad: '',
          ambalajTuru: 'Çuval',
          topluMiktar: undefined,
          topluBirim: 'kg',
          topluFiyat: undefined,
        });
      }
    }
  }, [isOpen, editingItem, reset]);

  const onSubmit = async (data: FormValues) => {
    await new Promise(r => setTimeout(r, 300));
    onSave({
      ad: data.ad,
      ambalajTuru: data.ambalajTuru,
      topluMiktar: Number(data.topluMiktar),
      topluBirim: data.topluBirim,
      topluFiyat: Number(data.topluFiyat),
    });
    reset();
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
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="malzeme-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 id="malzeme-modal-title" className="text-base font-700 text-foreground">
            {editingItem ? `${editingItem.ad} Düzenle` : 'Yeni Malzeme Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all duration-150"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Malzeme adı */}
          <div>
            <label htmlFor="mlz-ad" className="block text-sm font-600 text-foreground mb-1">
              Malzeme Adı <span className="text-critical">*</span>
            </label>
            <input
              id="mlz-ad"
              type="text"
              list="mlz-suggestions"
              placeholder="örn: Buğday Unu, Taze Maya..."
              {...register('ad', {
                required: 'Malzeme adı zorunludur',
                minLength: { value: 2, message: 'En az 2 karakter' },
              })}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <datalist id="mlz-suggestions">
              {MALZEME_SUGGESTIONS.map(s => <option key={`sug-${s}`} value={s} />)}
            </datalist>
            {errors.ad && <p className="mt-1 text-xs text-critical">{errors.ad.message}</p>}
          </div>

          {/* Ambalaj Türü */}
          <div>
            <label htmlFor="mlz-ambalaj" className="block text-sm font-600 text-foreground mb-1">
              Ambalaj Türü <span className="text-critical">*</span>
            </label>
            <select
              id="mlz-ambalaj"
              {...register('ambalajTuru', { required: true })}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
            >
              {AMBALAJ_TURLERI.map(t => (
                <option key={`ambalaj-${t}`} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Toplu Miktar & Birim */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="mlz-toplu-miktar" className="block text-sm font-600 text-foreground mb-1">
                Toplu Miktar <span className="text-critical">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Ambalajdaki toplam miktar
              </p>
              <input
                id="mlz-toplu-miktar"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="örn: 50"
                {...register('topluMiktar', {
                  required: 'Toplu miktar zorunludur',
                  min: { value: 0.001, message: 'Sıfırdan büyük olmalı' },
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
              />
              {errors.topluMiktar && <p className="mt-1 text-xs text-critical">{errors.topluMiktar.message}</p>}
            </div>
            <div>
              <label htmlFor="mlz-toplu-birim" className="block text-sm font-600 text-foreground mb-1">
                Toplu Birim <span className="text-critical">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Miktarın birimi
              </p>
              <select
                id="mlz-toplu-birim"
                {...register('topluBirim', { required: true })}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
              >
                {TOPLU_BIRIMLER.map(b => (
                  <option key={`birim-${b}`} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toplu Satın Alma Fiyatı */}
          <div>
            <label htmlFor="mlz-fiyat" className="block text-sm font-600 text-foreground mb-1">
              Toplu Satın Alma Fiyatı (₺) <span className="text-critical">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">
              Tüm ambalaj için ödenen toplam fiyat
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-600 text-sm">₺</span>
              <input
                id="mlz-fiyat"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('topluFiyat', {
                  required: 'Fiyat zorunludur',
                  min: { value: 0, message: 'Sıfır veya pozitif olmalı' },
                  valueAsNumber: true,
                })}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
              />
            </div>
            {errors.topluFiyat && <p className="mt-1 text-xs text-critical">{errors.topluFiyat.message}</p>}
          </div>

          {/* Auto-calculated cost per unit */}
          {costPerUnit > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Info size={13} className="text-primary" />
                <span className="text-xs font-600 text-primary">Otomatik Hesaplanan Maliyet</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {watchFiyat} ₺ ÷ {watchMiktar} {watchBirim}
                </span>
                <span className="text-lg font-700 text-primary">
                  {formatCurrency(costPerUnit)} / {watchBirim}
                </span>
              </div>
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-700 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                editingItem ? 'Güncelle' : 'Malzeme Ekle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
