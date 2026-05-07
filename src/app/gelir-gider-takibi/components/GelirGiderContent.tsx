'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTransactions, saveTransactions, getTodayString, type Transaction, type TransactionType, type TransactionCategory,  } from '@/lib/storage';
import { toast } from 'sonner';
import TransactionFilters from './TransactionFilters';
import TransactionSummary from './TransactionSummary';
import TransactionTable from './TransactionTable';
import TransactionModal from './TransactionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export type FilterPeriod = 'gunluk' | 'haftalik' | 'aylik' | 'tum';

export default function GelirGiderContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('tum');
  const [filterTur, setFilterTur] = useState<'tumu' | TransactionType>('tumu');
  const [filterKategori, setFilterKategori] = useState<'tumu' | TransactionCategory>('tumu');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(false);
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(getTodayString());
    const txns = getTransactions();
    setTransactions(txns);
    setLoading(false);
  }, []);

  const getFilteredTransactions = useCallback(() => {
    let filtered = [...transactions];

    // Period filter
    if (filterPeriod !== 'tum') {
      const now = new Date(2026, 4, 7);
      filtered = filtered.filter(t => {
        const tDate = new Date(t.tarih);
        if (filterPeriod === 'gunluk') {
          return t.tarih === today;
        } else if (filterPeriod === 'haftalik') {
          const diff = (now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 7;
        } else if (filterPeriod === 'aylik') {
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    // Type filter
    if (filterTur !== 'tumu') {
      filtered = filtered.filter(t => t.tur === filterTur);
    }

    // Category filter
    if (filterKategori !== 'tumu') {
      filtered = filtered.filter(t => t.kategori === filterKategori);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.aciklama.toLowerCase().includes(q) ||
        t.kategori.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => b.tarih.localeCompare(a.tarih) || b.createdAt.localeCompare(a.createdAt));
  }, [transactions, filterPeriod, filterTur, filterKategori, searchQuery, today]);

  const filteredTransactions = getFilteredTransactions();

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (txn: Transaction) => {
    setEditingTransaction(txn);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeletingIds(prev => new Set(prev).add(deleteTarget));
    setTimeout(() => {
      const updated = transactions.filter(t => t.id !== deleteTarget);
      setTransactions(updated);
      saveTransactions(updated);
      setDeletingIds(prev => { const s = new Set(prev); s.delete(deleteTarget); return s; });
      setDeleteTarget(null);
      toast.success('İşlem silindi');
    }, 280);
  };

  const handleBulkDeleteConfirm = () => {
    const ids = Array.from(selectedIds);
    ids.forEach(id => setDeletingIds(prev => new Set(prev).add(id)));
    setTimeout(() => {
      const updated = transactions.filter(t => !selectedIds.has(t.id));
      setTransactions(updated);
      saveTransactions(updated);
      setDeletingIds(new Set());
      setSelectedIds(new Set());
      setBulkDeleteTarget(false);
      toast.success(`${ids.length} işlem silindi`);
    }, 280);
  };

  const handleSave = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      // Edit existing
      const updated = transactions.map(t =>
        t.id === editingTransaction.id
          ? { ...t, ...data }
          : t
      );
      setTransactions(updated);
      saveTransactions(updated);
      toast.success('İşlem güncellendi');
    } else {
      // Add new
      const newTxn: Transaction = {
        ...data,
        id: `txn-${Date.now()}`,
        createdAt: getTodayString(),
      };
      const updated = [newTxn, ...transactions];
      setTransactions(updated);
      saveTransactions(updated);
      toast.success('İşlem eklendi');
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={`gg-skel-${i + 1}`} className="animate-pulse bg-muted rounded-2xl h-16" />
        ))}
        <div className="animate-pulse bg-muted rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Filters */}
      <TransactionFilters
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        filterTur={filterTur}
        setFilterTur={setFilterTur}
        filterKategori={filterKategori}
        setFilterKategori={setFilterKategori}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAdd={handleAdd}
      />

      {/* Summary */}
      <TransactionSummary transactions={filteredTransactions} filterPeriod={filterPeriod} />

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="slide-up bg-foreground text-primary-foreground rounded-xl px-5 py-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-600">{selectedIds.size} işlem seçildi</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              Seçimi temizle
            </button>
            <button
              onClick={() => setBulkDeleteTarget(true)}
              className="px-3 py-1.5 bg-critical rounded-lg text-sm font-600 text-white hover:bg-critical/90 transition-all active:scale-95"
            >
              Seçilenleri sil
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <TransactionTable
        transactions={filteredTransactions}
        deletingIds={deletingIds}
        selectedIds={selectedIds}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
      />

      {/* Add/Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onSave={handleSave}
        editingTransaction={editingTransaction}
      />

      {/* Single delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="İşlemi sil"
        message="Bu kaydı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Evet, Sil"
        isDestructive
      />

      {/* Bulk delete confirm */}
      <ConfirmModal
        isOpen={bulkDeleteTarget}
        onClose={() => setBulkDeleteTarget(false)}
        onConfirm={handleBulkDeleteConfirm}
        title={`${selectedIds.size} işlemi sil`}
        message={`Seçili ${selectedIds.size} kaydı kalıcı olarak silmek istediğinizden emin misiniz?`}
        confirmLabel="Evet, Hepsini Sil"
        isDestructive
      />
    </div>
  );
}