'use client';

import React, { useState, useEffect } from 'react';
import { getRecipes, saveRecipes, getMalzemeler, calculateRecipeCost, formatCurrency, getTodayString, type Recipe, type Malzeme } from '@/lib/storage';
import { ChefHat, Plus, Pencil, Trash2, Calculator } from 'lucide-react';
import ReceteModal from './ReceteModal';
import ReceteCostCard from './ReceteCostCard';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ReceteContent() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [malzemeler, setMalzemeler] = useState<Malzeme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    setRecipes(getRecipes());
    setMalzemeler(getMalzemeler());
    setLoading(false);
  }, []);

  const handleSave = (data: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (editingRecipe) {
      const updated = recipes.map(r =>
        r.id === editingRecipe.id ? { ...r, ...data } : r
      );
      setRecipes(updated);
      saveRecipes(updated);
      if (selectedRecipe?.id === editingRecipe.id) {
        setSelectedRecipe({ ...editingRecipe, ...data });
      }
    } else {
      const newRecipe: Recipe = {
        ...data,
        id: `rec-${Date.now()}`,
        createdAt: getTodayString(),
      };
      const updated = [newRecipe, ...recipes];
      setRecipes(updated);
      saveRecipes(updated);
    }
    setIsModalOpen(false);
    setEditingRecipe(null);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const updated = recipes.filter(r => r.id !== deleteTarget);
    setRecipes(updated);
    saveRecipes(updated);
    if (selectedRecipe?.id === deleteTarget) setSelectedRecipe(null);
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={`rec-skel-${i}`} className="animate-pulse bg-muted rounded-2xl h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-700 text-foreground flex items-center gap-2">
            <ChefHat size={22} className="text-primary" />
            Tarif ve Formülasyon
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ürün reçeteleri oluşturun, kg/g/ml/lt cinsinden malzeme ekleyin, toplam parti maliyetini hesaplayın
          </p>
        </div>
        <button
          onClick={() => { setEditingRecipe(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-600 hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Yeni Reçete</span>
          <span className="sm:hidden">Ekle</span>
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <ChefHat size={28} className="text-primary" />
          </div>
          <h3 className="text-base font-600 text-foreground mb-1">Henüz reçete yok</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Ekmek, börek gibi ürünler için reçete oluşturun ve malzeme maliyetlerinden otomatik hesaplayın.
          </p>
          <button
            onClick={() => { setEditingRecipe(null); setIsModalOpen(true); }}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-600 hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus size={16} />
            İlk Reçeteyi Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recipe list */}
          <div className="space-y-3">
            <h2 className="text-sm font-600 text-muted-foreground uppercase tracking-wider px-1">
              Reçeteler ({recipes.length})
            </h2>
            {recipes.map(recipe => {
              const totalCost = calculateRecipeCost(recipe, malzemeler);
              const isSelected = selectedRecipe?.id === recipe.id;
              return (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(isSelected ? null : recipe)}
                  className={[
                    'bg-card border rounded-2xl p-4 cursor-pointer transition-all duration-150 hover:shadow-md',
                    isSelected ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border hover:border-primary/40',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <ChefHat size={15} className="text-primary" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-700 text-foreground text-sm truncate">{recipe.ad}</h3>
                          {recipe.aciklama && (
                            <p className="text-xs text-muted-foreground truncate">{recipe.aciklama}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Toplam Parti Maliyeti</p>
                          <p className="text-base font-700 text-primary">{formatCurrency(totalCost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Malzeme Sayısı</p>
                          <p className="text-sm font-600 text-foreground">{recipe.malzemeler.length} kalem</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(recipe); }}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        aria-label="Düzenle"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(recipe.id); }}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-critical/10 hover:text-critical transition-all"
                        aria-label="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cost detail panel */}
          <div>
            {selectedRecipe ? (
              <ReceteCostCard recipe={selectedRecipe} malzemeler={malzemeler} />
            ) : (
              <div className="bg-card border border-dashed border-border rounded-2xl flex flex-col items-center justify-center py-16 text-center px-6">
                <Calculator size={28} className="text-muted-foreground mb-3" />
                <p className="text-sm font-600 text-foreground mb-1">Maliyet Detayı</p>
                <p className="text-xs text-muted-foreground">
                  Detaylı maliyet analizi için soldaki listeden bir reçete seçin
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <ReceteModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRecipe(null); }}
        onSave={handleSave}
        editingRecipe={editingRecipe}
        malzemeler={malzemeler}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Reçeteyi sil"
        message="Bu reçeteyi kalıcı olarak silmek istediğinizden emin misiniz?"
        confirmLabel="Evet, Sil"
        isDestructive
      />
    </div>
  );
}
