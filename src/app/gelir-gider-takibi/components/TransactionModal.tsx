'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { getTodayString, type Transaction, type TransactionType, type TransactionCategory } from '@/lib/storage';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction: Transaction | null;
}

interface FormValues {
  tarih: string;
  tur: TransactionType;
  kategori: TransactionCategory;
  aciklama: string;
  miktar: number;
}

const GELIR_CATEGORIES: TransactionCategory[] = ['Satış', 'Diğer'];
const GIDER_CATEGORIES: TransactionCategory[] = [
  'Un', 'Maya', 'Tuz', 'Susam', 'Odun', 'Personel', 'Su', 'Elektrik', 'Kira',
  'Yumurta', 'Tereyağı', 'Ambalaj', 'Diğer',
];

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
}: TransactionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      tarih: getTodayString(),
      tur: 'gelir',
      kategori: 'Satış',
      aciklama: '',
      miktar: undefined,
    },
  });

  const watchTur = watch('tur');
  const availableCategories = watchTur === 'gelir' ? GELIR_CATEGORIES : GIDER_CATEGORIES;

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        reset({
          tarih: editingTransaction.tarih,
          tur: editingTransaction.tur,
          kategori: editingTransaction.kategori,
          aciklama: editingTransaction.aciklama,
          miktar: editingTransaction.miktar,
        });
      } else {
        reset({
          tarih: getTodayString(),
          tur: 'gelir',
          kategori: 'Satış',
          aciklama: '',
          miktar: undefined,
        });
      }
    }
  }, [isOpen, editingTransaction, reset]);

  // Reset category when type changes
  useEffect(() => {
    const cats = watchTur === 'gelir' ? GELIR_CATEGORIES : GIDER_CATEGORIES;
    setValue('kategori', cats[0]);
  }, [watchTur, setValue]);

  const onSubmit = async (data: FormValues) => {
    await new Promise(r => setTimeout(r, 400));
    onSave({
      tarih: data.tarih,
      tur: data.tur,
      kategori: data.kategori,
      aciklama: data.aciklama,
      miktar: Number(data.miktar),
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
        className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="txn-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="txn-modal-title" className="text-base font-700 text-foreground">
            {editingTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}
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
          {/* Tarih */}
          <div>
            <label htmlFor="tarih" className="block text-sm font-600 text-foreground mb-1">
              Tarih <span className="text-critical">*</span>
            </label>
            <input
              id="tarih"
              type="date"
              {...register('tarih', { required: 'Tarih zorunludur' })}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            {errors.tarih && (
              <p className="mt-1 text-xs text-critical">{errors.tarih.message}</p>
            )}
          </div>

          {/* Tür */}
          <div>
            <label className="block text-sm font-600 text-foreground mb-1">
              Tür <span className="text-critical">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">Bu kaydın gelir mi yoksa gider mi olduğunu seçin</p>
            <div className="flex gap-2">
              {(['gelir', 'gider'] as TransactionType[]).map((t) => (
                <label
                  key={`tur-radio-${t}`}
                  className={[
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-600',
                    watchTur === t
                      ? t === 'gelir' ?'bg-gelir-subtle border-gelir/40 text-gelir' :'bg-gider-subtle border-gider/40 text-gider' :'border-input bg-background text-muted-foreground hover:bg-secondary',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    value={t}
                    {...register('tur')}
                    className="sr-only"
                  />
                  {t === 'gelir' ? '↑ Gelir' : '↓ Gider'}
                </label>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label htmlFor="kategori" className="block text-sm font-600 text-foreground mb-1">
              Kategori <span className="text-critical">*</span>
            </label>
            <select
              id="kategori"
              {...register('kategori', { required: 'Kategori zorunludur' })}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
            >
              {availableCategories.map((c) => (
                <option key={`modal-cat-${c}`} value={c}>{c}</option>
              ))}
            </select>
            {errors.kategori && (
              <p className="mt-1 text-xs text-critical">{errors.kategori.message}</p>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="aciklama" className="block text-sm font-600 text-foreground mb-1">
              Açıklama <span className="text-critical">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">
              Kısa ve açıklayıcı bir not girin (örn: Sabah ekmek satışı)
            </p>
            <input
              id="aciklama"
              type="text"
              placeholder="İşlem açıklaması..."
              {...register('aciklama', {
                required: 'Açıklama zorunludur',
                minLength: { value: 3, message: 'En az 3 karakter giriniz' },
                maxLength: { value: 120, message: 'En fazla 120 karakter' },
              })}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            {errors.aciklama && (
              <p className="mt-1 text-xs text-critical">{errors.aciklama.message}</p>
            )}
          </div>

          {/* Miktar */}
          <div>
            <label htmlFor="miktar" className="block text-sm font-600 text-foreground mb-1">
              Miktar (₺) <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-600 text-sm">₺</span>
              <input
                id="miktar"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                {...register('miktar', {
                  required: 'Miktar zorunludur',
                  min: { value: 0.01, message: 'Miktar 0\'dan büyük olmalıdır' },
                  valueAsNumber: true,
                })}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
              />
            </div>
            {errors.miktar && (
              <p className="mt-1 text-xs text-critical">{errors.miktar.message}</p>
            )}
          </div>

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
                editingTransaction ? 'Güncelle' : 'Ekle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}