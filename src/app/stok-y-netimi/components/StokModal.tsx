'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Info } from 'lucide-react';
import { formatCurrency, type StockItem, type StockUnit } from '@/lib/storage';

interface StokModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StockItem, 'id' | 'sonGuncelleme'>, addedQuantity?: number) => void;
  editingItem: StockItem | null;
}

interface FormValues {
  ad: string;
  mevcutMiktar: number;
  birim: StockUnit;
  kritikSeviye: number;
  birimMaliyet: number;
}

const UNITS: StockUnit[] = ['kg', 'adet', 'litre', 'paket', 'çuval'];

const MALZEME_SUGGESTIONS = [
  'Buğday Unu', 'Taze Maya', 'Tuz', 'Susam', 'Çörekotu', 'Tereyağı',
  'Yumurta', 'Odun', 'Ayçiçek Yağı', 'Şeker', 'Süt', 'Peynir', 'Zeytin',
];

export default function StokModal({ isOpen, onClose, onSave, editingItem }: StokModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      ad: '',
      mevcutMiktar: undefined,
      birim: 'kg',
      kritikSeviye: undefined,
      birimMaliyet: undefined,
    },
  });

  const watchMiktar = watch('mevcutMiktar');
  const watchMaliyet = watch('birimMaliyet');
  const watchBirim = watch('birim');

  const estimatedCost =
    watchMiktar && watchMaliyet && !isNaN(watchMiktar) && !isNaN(watchMaliyet)
      ? watchMiktar * watchMaliyet
      : 0;

  const quantityAdded = editingItem && watchMiktar > editingItem.mevcutMiktar
    ? watchMiktar - editingItem.mevcutMiktar
    : 0;

  const addedCost = quantityAdded > 0 && watchMaliyet ? quantityAdded * watchMaliyet : 0;

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        reset({
          ad: editingItem.ad,
          mevcutMiktar: editingItem.mevcutMiktar,
          birim: editingItem.birim,
          kritikSeviye: editingItem.kritikSeviye,
          birimMaliyet: editingItem.birimMaliyet,
        });
      } else {
        reset({
          ad: '',
          mevcutMiktar: undefined,
          birim: 'kg',
          kritikSeviye: undefined,
          birimMaliyet: undefined,
        });
      }
    }
  }, [isOpen, editingItem, reset]);

  const onSubmit = async (data: FormValues) => {
    await new Promise(r => setTimeout(r, 400));
    onSave(
      {
        ad: data.ad,
        mevcutMiktar: Number(data.mevcutMiktar),
        birim: data.birim,
        kritikSeviye: Number(data.kritikSeviye),
        birimMaliyet: Number(data.birimMaliyet),
      },
      editingItem ? quantityAdded : undefined
    );
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
        aria-labelledby="stok-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 id="stok-modal-title" className="text-base font-700 text-foreground">
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Malzeme adı */}
          <div>
            <label htmlFor="stk-ad" className="block text-sm font-600 text-foreground mb-1">
              Malzeme Adı <span className="text-critical">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">
              Stokta takip etmek istediğiniz ham madde adı
            </p>
            <input
              id="stk-ad"
              type="text"
              list="malzeme-suggestions"
              placeholder="örn: Buğday Unu, Taze Maya..."
              {...register('ad', {
                required: 'Malzeme adı zorunludur',
                minLength: { value: 2, message: 'En az 2 karakter giriniz' },
                maxLength: { value: 60, message: 'En fazla 60 karakter' },
              })}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <datalist id="malzeme-suggestions">
              {MALZEME_SUGGESTIONS.map(s => (
                <option key={`suggest-${s}`} value={s} />
              ))}
            </datalist>
            {errors.ad && (
              <p className="mt-1 text-xs text-critical">{errors.ad.message}</p>
            )}
          </div>

          {/* Miktar & Birim */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="stk-miktar" className="block text-sm font-600 text-foreground mb-1">
                Mevcut Miktar <span className="text-critical">*</span>
              </label>
              <input
                id="stk-miktar"
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                {...register('mevcutMiktar', {
                  required: 'Miktar zorunludur',
                  min: { value: 0, message: 'Sıfır veya pozitif olmalı' },
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
              />
              {errors.mevcutMiktar && (
                <p className="mt-1 text-xs text-critical">{errors.mevcutMiktar.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="stk-birim" className="block text-sm font-600 text-foreground mb-1">
                Birim <span className="text-critical">*</span>
              </label>
              <select
                id="stk-birim"
                {...register('birim', { required: true })}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
              >
                {UNITS.map(u => (
                  <option key={`unit-${u}`} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kritik seviye & Birim maliyet */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="stk-kritik" className="block text-sm font-600 text-foreground mb-1">
                Kritik Seviye <span className="text-critical">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Bu miktarın altına düşünce uyarı verilir
              </p>
              <div className="relative">
                <input
                  id="stk-kritik"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  {...register('kritikSeviye', {
                    required: 'Kritik seviye zorunludur',
                    min: { value: 0, message: 'Sıfır veya pozitif olmalı' },
                    valueAsNumber: true,
                  })}
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {watchBirim}
                </span>
              </div>
              {errors.kritikSeviye && (
                <p className="mt-1 text-xs text-critical">{errors.kritikSeviye.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="stk-maliyet" className="block text-sm font-600 text-foreground mb-1">
                Birim Maliyet (₺) <span className="text-critical">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">
                1 {watchBirim} başına maliyet
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-600 text-sm">₺</span>
                <input
                  id="stk-maliyet"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  {...register('birimMaliyet', {
                    required: 'Birim maliyet zorunludur',
                    min: { value: 0, message: 'Sıfır veya pozitif olmalı' },
                    valueAsNumber: true,
                  })}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
                />
              </div>
              {errors.birimMaliyet && (
                <p className="mt-1 text-xs text-critical">{errors.birimMaliyet.message}</p>
              )}
            </div>
          </div>

          {/* Auto-expense preview */}
          {estimatedCost > 0 && !editingItem && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/8 border border-primary/20">
              <Info size={15} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-700 text-primary">Otomatik Gider Kaydı</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Bu malzeme eklendiğinde{' '}
                  <span className="font-700 text-foreground">{formatCurrency(estimatedCost)}</span>{' '}
                  tutarında gider otomatik olarak Gelir &amp; Gider tablosuna işlenecek.
                </p>
              </div>
            </div>
          )}

          {/* Edit: show added cost if quantity increased */}
          {editingItem && addedCost > 0 && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/8 border border-primary/20">
              <Info size={15} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-700 text-primary">Stok Artışı — Gider Oluşturulacak</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  +{quantityAdded} {watchBirim} ekleniyor.{' '}
                  <span className="font-700 text-foreground">{formatCurrency(addedCost)}</span>{' '}
                  tutarında gider otomatik kaydedilecek.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-600 text-muted-foreground hover:bg-secondary transition-all duration-150 active:scale-95"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-700 hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Kaydediliyor...</span>
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