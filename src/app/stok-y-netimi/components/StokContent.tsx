'use client';

import React, { useState, useEffect } from 'react';
import {
  getStockItems,
  saveStockItems,
  getTransactions,
  saveTransactions,
  getStockStatus,
  formatCurrency,
  getTodayString,
  type StockItem,
} from '@/lib/storage';
import { toast } from 'sonner';
import StokSummaryCards from './StokSummaryCards';
import StokAlertBanner from './StokAlertBanner';
import StokTable from './StokTable';
import StokModal from './StokModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function StokContent() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'tumu' | 'kritik' | 'uyari' | 'normal' | 'tukendi'>('tumu');

  useEffect(() => {
    const items = getStockItems();
    setStockItems(items);
    setLoading(false);
  }, []);

  const filteredItems = stockItems.filter(item => {
    const status = getStockStatus(item);
    const matchesSearch = item.ad.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'tumu' || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeletingIds(prev => new Set(prev).add(deleteTarget));
    setTimeout(() => {
      const updated = stockItems.filter(i => i.id !== deleteTarget);
      setStockItems(updated);
      saveStockItems(updated);
      setDeletingIds(prev => { const s = new Set(prev); s.delete(deleteTarget!); return s; });
      setDeleteTarget(null);
      toast.success('Stok kalemi silindi');
    }, 280);
  };

  const handleSave = (data: Omit<StockItem, 'id' | 'sonGuncelleme'>, addedQuantity?: number) => {
    const today = getTodayString();

    if (editingItem) {
      // Editing existing item
      const quantityDiff = data.mevcutMiktar - editingItem.mevcutMiktar;

      if (quantityDiff > 0) {
        // Stock increased — auto-create expense
        // Backend integration point: POST /api/transactions { tur: 'gider', kategori: ..., miktar: ... }
        const expenseMiktar = quantityDiff * data.birimMaliyet;
        const transactions = getTransactions();
        const newExpense = {
          id: `txn-${Date.now()}`,
          tarih: today,
          tur: 'gider' as const,
          kategori: data.ad as any,
          aciklama: `Stok alımı — ${data.ad} (+${quantityDiff} ${data.birim})`,
          miktar: expenseMiktar,
          createdAt: today,
        };
        const updatedTxns = [newExpense, ...transactions];
        saveTransactions(updatedTxns);
        toast.success(
          `Stok güncellendi. ${formatCurrency(expenseMiktar)} gider olarak kaydedildi.`,
          { duration: 4000 }
        );
      } else {
        toast.success('Stok kalemi güncellendi');
      }

      const updated = stockItems.map(i =>
        i.id === editingItem.id
          ? { ...i, ...data, sonGuncelleme: today }
          : i
      );
      setStockItems(updated);
      saveStockItems(updated);
    } else {
      // New item — auto-create expense for initial stock
      if (data.mevcutMiktar > 0 && data.birimMaliyet > 0) {
        const expenseMiktar = data.mevcutMiktar * data.birimMaliyet;
        const transactions = getTransactions();
        const newExpense = {
          id: `txn-${Date.now()}`,
          tarih: today,
          tur: 'gider' as const,
          kategori: data.ad as any,
          aciklama: `Başlangıç stoku — ${data.ad} (${data.mevcutMiktar} ${data.birim})`,
          miktar: expenseMiktar,
          createdAt: today,
        };
        const updatedTxns = [newExpense, ...transactions];
        saveTransactions(updatedTxns);
        toast.success(
          `Stok eklendi. ${formatCurrency(expenseMiktar)} gider olarak kaydedildi.`,
          { duration: 4000 }
        );
      } else {
        toast.success('Yeni stok kalemi eklendi');
      }

      const newItem: StockItem = {
        ...data,
        id: `stk-${Date.now()}`,
        sonGuncelleme: today,
      };
      const updated = [newItem, ...stockItems];
      setStockItems(updated);
      saveStockItems(updated);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={`stk-skel-${i}`} className="animate-pulse bg-muted rounded-2xl h-24" />
          ))}
        </div>
        <div className="animate-pulse bg-muted rounded-2xl h-96" />
      </div>
    );
  }

  const criticalItems = stockItems.filter(i => {
    const s = getStockStatus(i);
    return s === 'kritik' || s === 'tukendi';
  });

  return (
    <div className="space-y-5 fade-in">
      {/* Summary cards */}
      <StokSummaryCards items={stockItems} />

      {/* Alert banner */}
      {criticalItems.length > 0 && (
        <StokAlertBanner items={criticalItems} />
      )}

      {/* Table */}
      <StokTable
        items={filteredItems}
        deletingIds={deletingIds}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Add/Edit Modal */}
      <StokModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSave={handleSave}
        editingItem={editingItem}
      />

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Stok kalemini sil"
        message="Bu stok kalemini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Evet, Sil"
        isDestructive
      />
    </div>
  );
}