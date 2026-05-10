'use client';

import React, { useState, useEffect } from 'react';
import {
  getMalzemeler,
  saveMalzemeler,
  gramBirimMaliyet,
  formatCurrency,
  getTodayString,
  type Malzeme,
} from '@/lib/storage';
import { toast } from 'sonner';
import { Package, ShoppingCart, Calculator } from 'lucide-react';
import MalzemeTable from './MalzemeTable';
import MalzemeModal from './MalzemeModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function MalzemeContent() {
  const [malzemeler, setMalzemeler] = useState<Malzeme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Malzeme | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMalzemeler(getMalzemeler());
    setLoading(false);
  }, []);

  const filteredItems = malzemeler.filter(m =>
    m.ad.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInventoryValue = malzemeler.reduce((s, m) => s + m.topluFiyat, 0);
  const avgCostPerUnit = malzemeler.length > 0
    ? malzemeler.reduce((s, m) => s + gramBirimMaliyet(m), 0) / malzemeler.length
    : 0;

  const handleSave = (data: Omit<Malzeme, 'id' | 'sonGuncelleme'>) => {
    const today = getTodayString();
    if (editingItem) {
      const updated = malzemeler.map(m =>
        m.id === editingItem.id ? { ...m, ...data, sonGuncelleme: today } : m
      );
      setMalzemeler(updated);
      saveMalzemeler(updated);
      toast.success('Malzeme güncellendi');
    } else {
      const newItem: Malzeme = { ...data, id: `mlz-${Date.now()}`, sonGuncelleme: today };
      const updated = [newItem, ...malzemeler];
      setMalzemeler(updated);
      saveMalzemeler(updated);
      toast.success('Malzeme eklendi');
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeletingIds(prev => new Set(prev).add(deleteTarget));
    setTimeout(() => {
      const updated = malzemeler.filter(m => m.id !== deleteTarget);
      setMalzemeler(updated);
      saveMalzemeler(updated);
      setDeletingIds(prev => { const s = new Set(prev); s.delete(deleteTarget!); return s; });
      setDeleteTarget(null);
      toast.success('Malzeme silindi');
    }, 280);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={`skel-${i}`} className="animate-pulse bg-muted rounded-2xl h-24" />
          ))}
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
            <p className="text-xs text-muted-foreground">Toplam Malzeme</p>
            <p className="text-xl font-700 text-foreground">{malzemeler.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gelir/10 flex items-center justify-center shrink-0">
            <ShoppingCart size={18} className="text-gelir" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Toplam Envanter Değeri</p>
            <p className="text-xl font-700 text-foreground">{formatCurrency(totalInventoryValue)}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
            <Calculator size={18} className="text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ort. Birim Maliyet</p>
            <p className="text-xl font-700 text-foreground">{formatCurrency(avgCostPerUnit)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <MalzemeTable
        items={filteredItems}
        deletingIds={deletingIds}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAdd={() => { setEditingItem(null); setIsModalOpen(true); }}
        onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
        onDelete={setDeleteTarget}
      />

      <MalzemeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSave={handleSave}
        editingItem={editingItem}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Malzemeyi sil"
        message="Bu malzemeyi kalıcı olarak silmek istediğinizden emin misiniz? Reçetelerde kullanılıyorsa maliyet hesabı etkilenebilir."
        confirmLabel="Evet, Sil"
        isDestructive
      />
    </div>
  );
}
