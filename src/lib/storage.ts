// Backend integration point: Replace localStorage calls with API calls to your backend service

export type TransactionType = 'gelir' | 'gider';

export type TransactionCategory =
  | 'Satış' |'Un' |'Maya' |'Tuz' |'Susam' |'Odun' |'Personel' |'Su' |'Elektrik' |'Kira' |'Yumurta' |'Tereyağı' |'Ambalaj' |'Diğer';

export interface Transaction {
  id: string;
  tarih: string; // YYYY-MM-DD
  tur: TransactionType;
  kategori: TransactionCategory;
  aciklama: string;
  miktar: number;
  createdAt: string;
}

export type StockUnit = 'kg' | 'adet' | 'litre' | 'paket' | 'çuval';

export type StockStatus = 'normal' | 'uyari' | 'kritik' | 'tukendi';

export interface StockItem {
  id: string;
  ad: string;
  mevcutMiktar: number;
  birim: StockUnit;
  kritikSeviye: number;
  birimMaliyet: number; // cost per unit in ₺
  sonGuncelleme: string; // YYYY-MM-DD
}

const TRANSACTIONS_KEY = 'antalyafirin_transactions';
const STOCK_KEY = 'antalyafirin_stock';
const RECIPES_KEY = 'antalyafirin_recipes';

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : getDefaultTransactions();
  } catch {
    return getDefaultTransactions();
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function getStockItems(): StockItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STOCK_KEY);
    return raw ? JSON.parse(raw) : getDefaultStock();
  } catch {
    return getDefaultStock();
  }
}

export function saveStockItems(items: StockItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STOCK_KEY, JSON.stringify(items));
}

// ─── Recipe Types ────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  stockItemId: string;
  stockItemAd: string;
  miktar: number;
  birim: StockUnit;
}

export interface Recipe {
  id: string;
  ad: string; // e.g. "Ekmek", "Börek"
  aciklama: string;
  malzemeler: RecipeIngredient[];
  createdAt: string;
}

export function getRecipes(): Recipe[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

/**
 * Calculate total cost of a recipe based on current stock unit prices.
 * Returns total cost for the recipe (for 1 batch).
 */
export function calculateRecipeCost(recipe: Recipe, stockItems: StockItem[]): number {
  return recipe.malzemeler.reduce((total, ing) => {
    const stockItem = stockItems.find(s => s.id === ing.stockItemId);
    if (!stockItem) return total;
    return total + ing.miktar * stockItem.birimMaliyet;
  }, 0);
}

export function getStockStatus(item: StockItem): StockStatus {
  if (item.mevcutMiktar <= 0) return 'tukendi';
  if (item.mevcutMiktar <= item.kritikSeviye * 0.5) return 'kritik';
  if (item.mevcutMiktar <= item.kritikSeviye) return 'uyari';
  return 'normal';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

export function getTodayString(): string {
  const now = new Date(2026, 4, 7); // May 7, 2026 — matches current timestamp
  return now.toISOString().split('T')[0];
}

function getDateOffset(days: number): string {
  const d = new Date(2026, 4, 7);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function getDefaultTransactions(): Transaction[] {
  const transactions: Transaction[] = [
    { id: 'txn-001', tarih: getDateOffset(0), tur: 'gelir', kategori: 'Satış', aciklama: 'Sabah ekmek satışı', miktar: 1850.00, createdAt: getDateOffset(0) },
    { id: 'txn-002', tarih: getDateOffset(0), tur: 'gelir', kategori: 'Satış', aciklama: 'Öğle simit & poğaça satışı', miktar: 620.50, createdAt: getDateOffset(0) },
    { id: 'txn-003', tarih: getDateOffset(0), tur: 'gider', kategori: 'Un', aciklama: 'Un alımı — 50kg çuval x2', miktar: 840.00, createdAt: getDateOffset(0) },
    { id: 'txn-004', tarih: getDateOffset(0), tur: 'gider', kategori: 'Personel', aciklama: 'Günlük işçi ücreti (2 kişi)', miktar: 600.00, createdAt: getDateOffset(0) },
    { id: 'txn-005', tarih: getDateOffset(0), tur: 'gelir', kategori: 'Satış', aciklama: 'Akşam pastane ürünleri', miktar: 430.00, createdAt: getDateOffset(0) },
    { id: 'txn-006', tarih: getDateOffset(0), tur: 'gider', kategori: 'Odun', aciklama: 'Odun yakıt — günlük', miktar: 180.00, createdAt: getDateOffset(0) },
    { id: 'txn-007', tarih: getDateOffset(1), tur: 'gelir', kategori: 'Satış', aciklama: 'Sabah ekmek satışı', miktar: 1720.00, createdAt: getDateOffset(1) },
    { id: 'txn-008', tarih: getDateOffset(1), tur: 'gider', kategori: 'Maya', aciklama: 'Taze maya alımı — 5kg', miktar: 145.00, createdAt: getDateOffset(1) },
    { id: 'txn-009', tarih: getDateOffset(1), tur: 'gider', kategori: 'Personel', aciklama: 'Günlük işçi ücreti (2 kişi)', miktar: 600.00, createdAt: getDateOffset(1) },
    { id: 'txn-010', tarih: getDateOffset(1), tur: 'gelir', kategori: 'Satış', aciklama: 'Toplu sipariş — kafe', miktar: 890.00, createdAt: getDateOffset(1) },
    { id: 'txn-011', tarih: getDateOffset(2), tur: 'gelir', kategori: 'Satış', aciklama: 'Sabah satışı', miktar: 1540.00, createdAt: getDateOffset(2) },
    { id: 'txn-012', tarih: getDateOffset(2), tur: 'gider', kategori: 'Elektrik', aciklama: 'Elektrik faturası — Mayıs', miktar: 1240.00, createdAt: getDateOffset(2) },
    { id: 'txn-013', tarih: getDateOffset(2), tur: 'gider', kategori: 'Susam', aciklama: 'Susam alımı — 10kg', miktar: 320.00, createdAt: getDateOffset(2) },
    { id: 'txn-014', tarih: getDateOffset(3), tur: 'gelir', kategori: 'Satış', aciklama: 'Cumartesi yoğun satış', miktar: 2340.00, createdAt: getDateOffset(3) },
    { id: 'txn-015', tarih: getDateOffset(3), tur: 'gider', kategori: 'Un', aciklama: 'Haftalık un stoku', miktar: 1260.00, createdAt: getDateOffset(3) },
    { id: 'txn-016', tarih: getDateOffset(3), tur: 'gider', kategori: 'Personel', aciklama: 'Hafta sonu mesai ücreti', miktar: 750.00, createdAt: getDateOffset(3) },
    { id: 'txn-017', tarih: getDateOffset(4), tur: 'gelir', kategori: 'Satış', aciklama: 'Pazar satışı', miktar: 1980.00, createdAt: getDateOffset(4) },
    { id: 'txn-018', tarih: getDateOffset(4), tur: 'gider', kategori: 'Kira', aciklama: 'Aylık kira ödemesi', miktar: 4500.00, createdAt: getDateOffset(4) },
    { id: 'txn-019', tarih: getDateOffset(5), tur: 'gelir', kategori: 'Satış', aciklama: 'Sabah ekmek satışı', miktar: 1650.00, createdAt: getDateOffset(5) },
    { id: 'txn-020', tarih: getDateOffset(5), tur: 'gider', kategori: 'Odun', aciklama: 'Odun yakıt — 2 günlük', miktar: 360.00, createdAt: getDateOffset(5) },
    { id: 'txn-021', tarih: getDateOffset(6), tur: 'gelir', kategori: 'Satış', aciklama: 'Pazartesi sabah satışı', miktar: 1420.00, createdAt: getDateOffset(6) },
    { id: 'txn-022', tarih: getDateOffset(6), tur: 'gider', kategori: 'Personel', aciklama: 'Günlük ücret', miktar: 600.00, createdAt: getDateOffset(6) },
    { id: 'txn-023', tarih: getDateOffset(6), tur: 'gider', kategori: 'Ambalaj', aciklama: 'Poşet & torba alımı', miktar: 215.00, createdAt: getDateOffset(6) },
  ];

  if (typeof window !== 'undefined') {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
  return transactions;
}

function getDefaultStock(): StockItem[] {
  const today = getDateOffset(0);
  const items: StockItem[] = [
    { id: 'stk-001', ad: 'Buğday Unu', mevcutMiktar: 85, birim: 'kg', kritikSeviye: 50, birimMaliyet: 16.80, sonGuncelleme: today },
    { id: 'stk-002', ad: 'Taze Maya', mevcutMiktar: 2.5, birim: 'kg', kritikSeviye: 5, birimMaliyet: 29.00, sonGuncelleme: getDateOffset(1) },
    { id: 'stk-003', ad: 'Tuz', mevcutMiktar: 12, birim: 'kg', kritikSeviye: 5, birimMaliyet: 4.50, sonGuncelleme: getDateOffset(2) },
    { id: 'stk-004', ad: 'Susam', mevcutMiktar: 3, birim: 'kg', kritikSeviye: 8, birimMaliyet: 32.00, sonGuncelleme: getDateOffset(1) },
    { id: 'stk-005', ad: 'Çörekotu', mevcutMiktar: 0, birim: 'kg', kritikSeviye: 3, birimMaliyet: 55.00, sonGuncelleme: getDateOffset(5) },
    { id: 'stk-006', ad: 'Tereyağı', mevcutMiktar: 6, birim: 'kg', kritikSeviye: 5, birimMaliyet: 185.00, sonGuncelleme: today },
    { id: 'stk-007', ad: 'Yumurta', mevcutMiktar: 120, birim: 'adet', kritikSeviye: 60, birimMaliyet: 4.20, sonGuncelleme: today },
    { id: 'stk-008', ad: 'Odun', mevcutMiktar: 40, birim: 'kg', kritikSeviye: 30, birimMaliyet: 4.50, sonGuncelleme: getDateOffset(1) },
    { id: 'stk-009', ad: 'Ayçiçek Yağı', mevcutMiktar: 15, birim: 'litre', kritikSeviye: 10, birimMaliyet: 42.00, sonGuncelleme: getDateOffset(3) },
    { id: 'stk-010', ad: 'Şeker', mevcutMiktar: 8, birim: 'kg', kritikSeviye: 10, birimMaliyet: 22.00, sonGuncelleme: getDateOffset(4) },
  ];

  if (typeof window !== 'undefined') {
    localStorage.setItem(STOCK_KEY, JSON.stringify(items));
  }
  return items;
}