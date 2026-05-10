'use client';

import React, { useState, useEffect } from 'react';
import {
  getTransactions,
  getSabitGiderler,
  getProductions,
  getRecipes,
  getMalzemeler,
  calculateRecipeCost,
  formatCurrency,
  getCurrentMonthString,
  type Transaction,
  type SabitGider,
  type Production,
} from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,  } from 'recharts';
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, AlertCircle } from 'lucide-react';

interface ProductAnalysis {
  receteId: string;
  receteAd: string;
  birimMaliyet: number;
  satisFiyati: number;
  karMarji: number;
  basabas: number;
}

export default function KarPanelContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sabitGiderler, setSabitGiderler] = useState<SabitGider[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [productAnalyses, setProductAnalyses] = useState<ProductAnalysis[]>([]);
  const [selectedAy, setSelectedAy] = useState('');
  const [loading, setLoading] = useState(true);
  const [satisFiyatlari, setSatisFiyatlari] = useState<Record<string, string>>({});

  useEffect(() => {
    const txns = getTransactions();
    const sabit = getSabitGiderler();
    const prods = getProductions();
    const recipes = getRecipes();
    const malzemeler = getMalzemeler();

    setTransactions(txns);
    setSabitGiderler(sabit);
    setProductions(prods);
    setSelectedAy(getCurrentMonthString());

    // Build product analyses from recipes + productions
    const analyses: ProductAnalysis[] = recipes.map(recipe => {
      const cost = calculateRecipeCost(recipe, malzemeler);
      // Find latest production for this recipe to get unit cost
      const recipeProd = prods.filter(p => p.receteId === recipe.id);
      const latestProd = recipeProd.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      const birimMaliyet = latestProd ? latestProd.birimMaliyet : (cost > 0 ? cost : 0);
      return {
        receteId: recipe.id,
        receteAd: recipe.ad,
        birimMaliyet,
        satisFiyati: 0,
        karMarji: 0,
        basabas: 0,
      };
    });
    setProductAnalyses(analyses);

    // Init satış fiyatları
    const initFiyatlar: Record<string, string> = {};
    analyses.forEach(a => { initFiyatlar[a.receteId] = ''; });
    setSatisFiyatlari(initFiyatlar);

    setLoading(false);
  }, []);

  // Monthly calculations
  const monthTransactions = transactions.filter(t => t.tarih.startsWith(selectedAy));
  const monthGelir = monthTransactions.filter(t => t.tur === 'gelir').reduce((s, t) => s + t.miktar, 0);
  const monthDegiskenGider = monthTransactions.filter(t => t.tur === 'gider' && t.isVariableCost).reduce((s, t) => s + t.miktar, 0);
  const monthSabitGider = sabitGiderler.filter(g => g.ay === selectedAy).reduce((s, g) => s + g.aylikTutar, 0);
  const monthTotalGider = monthDegiskenGider + monthSabitGider;
  const monthNetKar = monthGelir - monthTotalGider;

  // Last 6 months chart data
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const ay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const ayTxns = transactions.filter(t => t.tarih.startsWith(ay));
    const gelir = ayTxns.filter(t => t.tur === 'gelir').reduce((s, t) => s + t.miktar, 0);
    const degisken = ayTxns.filter(t => t.tur === 'gider' && t.isVariableCost).reduce((s, t) => s + t.miktar, 0);
    const sabit = sabitGiderler.filter(g => g.ay === ay).reduce((s, g) => s + g.aylikTutar, 0);
    const gider = degisken + sabit;
    return {
      ay: ay.slice(5) + '/' + ay.slice(2, 4),
      Gelir: Math.round(gelir),
      Gider: Math.round(gider),
      'Net Kâr': Math.round(gelir - gider),
    };
  });

  // Product analysis with user-entered satış fiyatları
  const analysesWithSatis = productAnalyses.map(a => {
    const satisFiyati = parseFloat(satisFiyatlari[a.receteId] || '0') || 0;
    const karMarji = satisFiyati > 0 ? ((satisFiyati - a.birimMaliyet) / satisFiyati) * 100 : 0;
    const basabas = satisFiyati > a.birimMaliyet && monthSabitGider > 0
      ? Math.ceil(monthSabitGider / (satisFiyati - a.birimMaliyet))
      : 0;
    return { ...a, satisFiyati, karMarji, basabas };
  });

  // All months for filter
  const allMonths = Array.from(new Set([
    ...transactions.map(t => t.tarih.slice(0, 7)),
    ...sabitGiderler.map(g => g.ay),
  ])).sort().reverse();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-muted rounded-2xl h-32" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Month filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-600 text-foreground shrink-0">Ay Seç:</label>
        <select
          value={selectedAy}
          onChange={e => setSelectedAy(e.target.value)}
          className="px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
        >
          {allMonths.map(ay => (
            <option key={ay} value={ay}>{ay}</option>
          ))}
        </select>
      </div>

      {/* Monthly KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gelir/10 flex items-center justify-center">
              <TrendingUp size={15} className="text-gelir" />
            </div>
            <span className="text-xs text-muted-foreground">Aylık Gelir</span>
          </div>
          <p className="text-xl font-700 text-gelir">{formatCurrency(monthGelir)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-critical/10 flex items-center justify-center">
              <TrendingDown size={15} className="text-critical" />
            </div>
            <span className="text-xs text-muted-foreground">Aylık Gider</span>
          </div>
          <p className="text-xl font-700 text-critical">{formatCurrency(monthTotalGider)}</p>
        </div>
        <div className={[
          'bg-card border rounded-2xl p-4',
          monthNetKar >= 0 ? 'border-gelir/30' : 'border-critical/30',
        ].join(' ')}>
          <div className="flex items-center gap-2 mb-2">
            <div className={['w-8 h-8 rounded-lg flex items-center justify-center', monthNetKar >= 0 ? 'bg-gelir/10' : 'bg-critical/10'].join(' ')}>
              <DollarSign size={15} className={monthNetKar >= 0 ? 'text-gelir' : 'text-critical'} />
            </div>
            <span className="text-xs text-muted-foreground">Net Kâr/Zarar</span>
          </div>
          <p className={['text-xl font-700', monthNetKar >= 0 ? 'text-gelir' : 'text-critical'].join(' ')}>
            {formatCurrency(monthNetKar)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 size={15} className="text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Kâr Marjı</span>
          </div>
          <p className="text-xl font-700 text-primary">
            {monthGelir > 0 ? `${((monthNetKar / monthGelir) * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Monthly Income/Expense Chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-700 text-foreground mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          Aylık Gelir / Gider Karşılaştırması (Son 6 Ay)
        </h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ay" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={v => `₺${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Gelir" fill="var(--gelir)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gider" fill="var(--critical)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Kâr" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Analysis — Birim Maliyet vs Satış Fiyatı */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-700 text-foreground flex items-center gap-2">
            <Target size={16} className="text-primary" />
            Birim Maliyet vs Satış Fiyatı Analizi
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Her ürün için satış fiyatı girin — kâr marjı ve başabaş noktası otomatik hesaplanır
          </p>
        </div>

        {analysesWithSatis.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Reçete ve üretim kaydı oluşturunca analiz burada görünür</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {analysesWithSatis.map(a => {
              const hasPrice = a.satisFiyati > 0;
              const isProfit = hasPrice && a.satisFiyati > a.birimMaliyet;
              const isLoss = hasPrice && a.satisFiyati <= a.birimMaliyet;
              return (
                <div key={a.receteId} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-700 text-foreground">{a.receteAd}</h3>
                    {hasPrice && (
                      <span className={[
                        'px-2.5 py-1 rounded-lg text-xs font-700',
                        isProfit ? 'bg-gelir/10 text-gelir' : 'bg-critical/10 text-critical',
                      ].join(' ')}>
                        {isProfit ? `+${a.karMarji.toFixed(1)}% kâr` : 'Zarar'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Birim Maliyet */}
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Birim Maliyet</p>
                      <p className="text-lg font-700 text-critical">{formatCurrency(a.birimMaliyet)}</p>
                      <p className="text-xs text-muted-foreground">/ adet</p>
                    </div>

                    {/* Satış Fiyatı input */}
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Satış Fiyatı</p>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-600">₺</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={satisFiyatlari[a.receteId] || ''}
                          onChange={e => setSatisFiyatlari(prev => ({ ...prev, [a.receteId]: e.target.value }))}
                          placeholder="0,00"
                          className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-input bg-background text-sm font-700 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all font-tabular"
                        />
                      </div>
                    </div>

                    {/* Kâr / Başabaş */}
                    <div className="bg-muted/50 rounded-xl p-3">
                      {hasPrice ? (
                        <>
                          <p className="text-xs text-muted-foreground mb-1">Birim Kâr</p>
                          <p className={['text-lg font-700', isProfit ? 'text-gelir' : 'text-critical'].join(' ')}>
                            {formatCurrency(a.satisFiyati - a.birimMaliyet)}
                          </p>
                          <p className="text-xs text-muted-foreground">/ adet</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground mb-1">Birim Kâr</p>
                          <p className="text-lg font-700 text-muted-foreground">—</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Başabaş analizi */}
                  {hasPrice && isProfit && a.basabas > 0 && (
                    <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-primary" />
                        <span className="text-sm text-foreground">
                          Sabit giderleri karşılamak için gereken satış:
                        </span>
                      </div>
                      <span className="text-base font-700 text-primary">
                        {a.basabas.toLocaleString('tr-TR')} adet
                      </span>
                    </div>
                  )}

                  {/* Visual bar */}
                  {hasPrice && a.birimMaliyet > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Maliyet</span>
                        <span>Satış Fiyatı</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={['h-full rounded-full transition-all', isProfit ? 'bg-gelir' : 'bg-critical'].join(' ')}
                          style={{ width: `${Math.min(100, (a.birimMaliyet / Math.max(a.satisFiyati, a.birimMaliyet)) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-critical font-600">{formatCurrency(a.birimMaliyet)}</span>
                        <span className={isProfit ? 'text-gelir font-600' : 'text-critical font-600'}>{formatCurrency(a.satisFiyati)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
