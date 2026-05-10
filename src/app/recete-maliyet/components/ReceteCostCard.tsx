'use client';

import React, { useState } from 'react';
import { calculateRecipeCost, formatCurrency, type Recipe, type Malzeme } from '@/lib/storage';
import { Calculator, Package, AlertTriangle } from 'lucide-react';

interface ReceteCostCardProps {
  recipe: Recipe;
  malzemeler: Malzeme[];
}

export default function ReceteCostCard({ recipe, malzemeler }: ReceteCostCardProps) {
  const [adet, setAdet] = useState<string>('1');

  const totalCost = calculateRecipeCost(recipe, malzemeler);
  const adetNum = parseFloat(adet) || 1;
  const unitCost = adetNum > 0 ? totalCost / adetNum : totalCost;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-4">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-primary" />
          <h3 className="font-700 text-foreground text-sm">{recipe.ad} — Maliyet Analizi</h3>
        </div>
        {recipe.aciklama && (
          <p className="text-xs text-muted-foreground mt-0.5 ml-6">{recipe.aciklama}</p>
        )}
      </div>

      {/* Ingredient breakdown */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-3">Malzeme Dökümü</p>
        {recipe.malzemeler.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Malzeme eklenmemiş</p>
        ) : (
          recipe.malzemeler.map((ing, idx) => {
            const malzeme = malzemeler.find(m => m.id === ing.malzemeId);
            const missing = !malzeme;
            let lineCost = 0;
            if (malzeme) {
              const costPerBase = malzeme.topluFiyat / malzeme.topluMiktar;
              let converted = ing.miktar;
              if (ing.birim === 'g' && malzeme.topluBirim === 'kg') converted = ing.miktar / 1000;
              else if (ing.birim === 'kg' && malzeme.topluBirim === 'g') converted = ing.miktar * 1000;
              else if (ing.birim === 'ml' && malzeme.topluBirim === 'lt') converted = ing.miktar / 1000;
              else if (ing.birim === 'lt' && malzeme.topluBirim === 'ml') converted = ing.miktar * 1000;
              lineCost = converted * costPerBase;
            }
            return (
              <div
                key={`ing-row-${idx}`}
                className={[
                  'flex items-center justify-between py-2 px-3 rounded-xl text-sm',
                  missing ? 'bg-critical/5 border border-critical/20' : 'bg-muted/50',
                ].join(' ')}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {missing ? (
                    <AlertTriangle size={13} className="text-critical shrink-0" />
                  ) : (
                    <Package size={13} className="text-muted-foreground shrink-0" />
                  )}
                  <span className={['font-500 truncate', missing ? 'text-critical' : 'text-foreground'].join(' ')}>
                    {ing.malzemeAd}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-xs text-muted-foreground">
                    {ing.miktar} {ing.birim}
                  </span>
                  <span className={['font-600 text-xs min-w-[60px] text-right', missing ? 'text-critical' : 'text-foreground'].join(' ')}>
                    {missing ? 'Malzeme yok' : formatCurrency(lineCost)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Totals */}
      <div className="px-5 pb-4 space-y-3">
        <div className="border-t border-border pt-3 flex items-center justify-between">
          <span className="text-sm font-600 text-foreground">Toplam Parti Maliyeti</span>
          <span className="text-lg font-700 text-primary">{formatCurrency(totalCost)}</span>
        </div>

        {/* Unit cost calculator */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-xs font-600 text-primary mb-3 flex items-center gap-1.5">
            <Calculator size={12} />
            Birim Başına Maliyet Hesapla
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label htmlFor="adet-input" className="text-xs text-muted-foreground block mb-1">
                Üretim Adedi
              </label>
              <input
                id="adet-input"
                type="number"
                min="1"
                step="1"
                value={adet}
                onChange={e => setAdet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-600 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
                placeholder="1"
              />
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-muted-foreground mb-1">Birim Maliyet</p>
              <p className="text-xl font-700 text-primary">{formatCurrency(unitCost)}</p>
              <p className="text-xs text-muted-foreground">/ adet</p>
            </div>
          </div>
          {adetNum > 1 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {adetNum} adet × {formatCurrency(unitCost)} = {formatCurrency(totalCost)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
