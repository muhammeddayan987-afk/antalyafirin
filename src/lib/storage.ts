// Backend integration point: Replace localStorage calls with API calls to your backend service

export type TransactionType = 'gelir' | 'gider';

export type TransactionCategory =
  | 'Satış' | 'Un' | 'Maya' | 'Tuz' | 'Susam' | 'Odun' | 'Personel' | 'Su' | 'Elektrik' | 'Kira' | 'Yumurta' | 'Tereyağı' | 'Ambalaj' | 'Üretim Maliyeti' | 'Diğer';

export interface Transaction {
  id: string;
  tarih: string; // YYYY-MM-DD
  tur: TransactionType;
  kategori: TransactionCategory;
  aciklama: string;
  miktar: number;
  createdAt: string;
  isVariableCost?: boolean; // auto-set for production costs
}

// ─── Malzeme (Material) Types ─────────────────────────────────────────────────

export type AmbalajTuru = 'Çuval' | 'Koli' | 'Teneke' | 'Kasa' | 'Paket' | 'kg' | 'L' | 'ml' | 'g';
export type TopluBirim = 'kg' | 'adet' | 'lt' | 'g' | 'ml';

export interface Malzeme {
  id: string;
  ad: string;
  ambalajTuru: AmbalajTuru;
  topluMiktar: number;       // e.g. 50 for a 50kg sack
  topluBirim: TopluBirim;    // kg, adet, lt
  topluFiyat: number;        // bulk purchase price in ₺
  // Computed: gramBirimMaliyet = topluFiyat / topluMiktar
  sonGuncelleme: string;
}

export function gramBirimMaliyet(m: Malzeme): number {
  if (!m.topluMiktar || m.topluMiktar === 0) return 0;
  return m.topluFiyat / m.topluMiktar;
}

// ─── Recipe Types ─────────────────────────────────────────────────────────────

export type RecipeMeasureUnit = 'kg' | 'g' | 'ml' | 'lt' | 'adet';

export interface RecipeIngredient {
  malzemeId: string;
  malzemeAd: string;
  miktar: number;
  birim: RecipeMeasureUnit;
}

export interface Recipe {
  id: string;
  ad: string;
  aciklama: string;
  malzemeler: RecipeIngredient[];
  createdAt: string;
}

// ─── Production Types ─────────────────────────────────────────────────────────

export interface Production {
  id: string;
  receteId: string;
  receteAd: string;
  tarih: string;
  uretimAdedi: number;       // number of units produced
  topluPartiMaliyeti: number; // total batch cost (from recipe)
  birimMaliyet: number;      // topluPartiMaliyeti / uretimAdedi
  createdAt: string;
}

// ─── Expense Types ────────────────────────────────────────────────────────────

export type SabitGiderKategori = 'Elektrik' | 'Su' | 'Kira' | 'Personel' | 'Diğer Sabit';

export interface SabitGider {
  id: string;
  kategori: SabitGiderKategori;
  aciklama: string;
  aylikTutar: number;
  ay: string; // YYYY-MM
}

// ─── Legacy StockItem (kept for backward compat with dashboard) ───────────────

export type StockUnit = 'kg' | 'adet' | 'litre' | 'paket' | 'çuval';
export type StockStatus = 'normal' | 'uyari' | 'kritik' | 'tukendi';

export interface StockItem {
  id: string;
  ad: string;
  mevcutMiktar: number;
  birim: StockUnit;
  kritikSeviye: number;
  birimMaliyet: number;
  sonGuncelleme: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const TRANSACTIONS_KEY = 'antalyafirin_transactions';
const MALZEMELER_KEY = 'antalyafirin_malzemeler';
const RECIPES_KEY = 'antalyafin_recipes';
const PRODUCTIONS_KEY = 'antalyafirin_productions';
const SABIT_GIDERLER_KEY = 'antalyafirin_sabit_giderler';
// Legacy
const STOCK_KEY = 'antalyafirin_stock';

// ─── Transactions ─────────────────────────────────────────────────────────────

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

// ─── Malzemeler ───────────────────────────────────────────────────────────────

export function getMalzemeler(): Malzeme[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MALZEMELER_KEY);
    return raw ? JSON.parse(raw) : getDefaultMalzemeler();
  } catch {
    return getDefaultMalzemeler();
  }
}

export function saveMalzemeler(items: Malzeme[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MALZEMELER_KEY, JSON.stringify(items));
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

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

export function calculateRecipeCost(recipe: Recipe, malzemeler: Malzeme[]): number {
  return recipe.malzemeler.reduce((total, ing) => {
    const malzeme = malzemeler.find(m => m.id === ing.malzemeId);
    if (!malzeme) return total;
    const costPerUnit = gramBirimMaliyet(malzeme); // cost per topluBirim unit
    // Convert recipe ingredient unit to malzeme topluBirim
    const convertedMiktar = convertToBaseUnit(ing.miktar, ing.birim, malzeme.topluBirim);
    return total + convertedMiktar * costPerUnit;
  }, 0);
}

// Convert recipe measure to malzeme base unit
function convertToBaseUnit(miktar: number, from: RecipeMeasureUnit, to: TopluBirim): number {
  // Weight conversions
  if (from === 'kg' && to === 'kg') return miktar;
  if (from === 'g' && to === 'kg') return miktar / 1000;
  if (from === 'kg' && to === 'g') return miktar * 1000;
  if (from === 'g' && to === 'g') return miktar;
  // Volume conversions
  if (from === 'lt' && to === 'lt') return miktar;
  if (from === 'ml' && to === 'lt') return miktar / 1000;
  if (from === 'lt' && to === 'ml') return miktar * 1000;
  if (from === 'ml' && to === 'ml') return miktar;
  // Adet
  if (from === 'adet' && to === 'adet') return miktar;
  // Cross-type: return as-is (user should match units)
  return miktar;
}

// ─── Productions ──────────────────────────────────────────────────────────────

export function getProductions(): Production[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRODUCTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProductions(productions: Production[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTIONS_KEY, JSON.stringify(productions));
}

// ─── Sabit Giderler ───────────────────────────────────────────────────────────

export function getSabitGiderler(): SabitGider[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SABIT_GIDERLER_KEY);
    return raw ? JSON.parse(raw) : getDefaultSabitGiderler();
  } catch {
    return getDefaultSabitGiderler();
  }
}

export function saveSabitGiderler(items: SabitGider[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SABIT_GIDERLER_KEY, JSON.stringify(items));
}

// ─── Legacy Stock (for dashboard backward compat) ─────────────────────────────

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

export function getStockStatus(item: StockItem): StockStatus {
  if (item.mevcutMiktar <= 0) return 'tukendi';
  if (item.mevcutMiktar <= item.kritikSeviye * 0.5) return 'kritik';
  if (item.mevcutMiktar <= item.kritikSeviye) return 'uyari';
  return 'normal';
}

// ─── Utilities ────────────────────────────────────────────────────────────────

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
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getCurrentMonthString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// ─── Default Data ─────────────────────────────────────────────────────────────

function getDefaultMalzemeler(): Malzeme[] {
  const today = getDateOffset(0);
  const items: Malzeme[] = [
    { id: 'mlz-001', ad: 'Buğday Unu', ambalajTuru: 'Çuval', topluMiktar: 50, topluBirim: 'kg', topluFiyat: 840, sonGuncelleme: today },
    { id: 'mlz-002', ad: 'Taze Maya', ambalajTuru: 'Paket', topluMiktar: 5, topluBirim: 'kg', topluFiyat: 145, sonGuncelleme: getDateOffset(1) },
    { id: 'mlz-003', ad: 'Tuz', ambalajTuru: 'Koli', topluMiktar: 25, topluBirim: 'kg', topluFiyat: 112, sonGuncelleme: getDateOffset(2) },
    { id: 'mlz-004', ad: 'Susam', ambalajTuru: 'Çuval', topluMiktar: 10, topluBirim: 'kg', topluFiyat: 320, sonGuncelleme: getDateOffset(1) },
    { id: 'mlz-005', ad: 'Tereyağı', ambalajTuru: 'Koli', topluMiktar: 10, topluBirim: 'kg', topluFiyat: 1850, sonGuncelleme: today },
    { id: 'mlz-006', ad: 'Yumurta', ambalajTuru: 'Kasa', topluMiktar: 30, topluBirim: 'adet', topluFiyat: 126, sonGuncelleme: today },
    { id: 'mlz-007', ad: 'Ayçiçek Yağı', ambalajTuru: 'Teneke', topluMiktar: 18, topluBirim: 'lt', topluFiyat: 756, sonGuncelleme: getDateOffset(3) },
    { id: 'mlz-008', ad: 'Şeker', ambalajTuru: 'Çuval', topluMiktar: 50, topluBirim: 'kg', topluFiyat: 1100, sonGuncelleme: getDateOffset(4) },
  ];
  if (typeof window !== 'undefined') {
    localStorage.setItem(MALZEMELER_KEY, JSON.stringify(items));
  }
  return items;
}

function getDefaultSabitGiderler(): SabitGider[] {
  const ay = getCurrentMonthString();
  const items: SabitGider[] = [
    { id: 'sg-001', kategori: 'Kira', aciklama: 'Aylık işyeri kirası', aylikTutar: 4500, ay },
    { id: 'sg-002', kategori: 'Elektrik', aciklama: 'Elektrik faturası', aylikTutar: 1240, ay },
    { id: 'sg-003', kategori: 'Su', aciklama: 'Su faturası', aylikTutar: 280, ay },
    { id: 'sg-004', kategori: 'Personel', aciklama: 'Personel maaşları (2 kişi)', aylikTutar: 18000, ay },
  ];
  if (typeof window !== 'undefined') {
    localStorage.setItem(SABIT_GIDERLER_KEY, JSON.stringify(items));
  }
  return items;
}

function getDefaultTransactions(): Transaction[] {
  const transactions: Transaction[] = [
    { id: 'txn-001', tarih: getDateOffset(0), tur: 'gelir', kategori: 'Satış', aciklama: 'Sabah ekmek satışı', miktar: 1850.00, createdAt: getDateOffset(0) },
    { id: 'txn-002', tarih: getDateOffset(0), tur: 'gelir', kategori: 'Satış', aciklama: 'Öğle simit & poğaça satışı', miktar: 620.50, createdAt: getDateOffset(0) },
    { id: 'txn-003', tarih: getDateOffset(0), tur: 'gider', kategori: 'Üretim Maliyeti', aciklama: 'Ekmek üretim maliyeti (200 adet)', miktar: 840.00, createdAt: getDateOffset(0), isVariableCost: true },
    { id: 'txn-004', tarih: getDateOffset(0), tur: 'gider', kategori: 'Personel', aciklama: 'Günlük işçi ücreti (2 kişi)', miktar: 600.00, createdAt: getDateOffset(0) },
    { id: 'txn-005', tarih: getDateOffset(0), tur: 'gelir', kategori: 'Satış', aciklama: 'Akşam pastane ürünleri', miktar: 430.00, createdAt: getDateOffset(0) },
    { id: 'txn-006', tarih: getDateOffset(1), tur: 'gelir', kategori: 'Satış', aciklama: 'Sabah ekmek satışı', miktar: 1720.00, createdAt: getDateOffset(1) },
    { id: 'txn-007', tarih: getDateOffset(1), tur: 'gider', kategori: 'Üretim Maliyeti', aciklama: 'Simit üretim maliyeti (150 adet)', miktar: 450.00, createdAt: getDateOffset(1), isVariableCost: true },
    { id: 'txn-008', tarih: getDateOffset(1), tur: 'gelir', kategori: 'Satış', aciklama: 'Toplu sipariş — kafe', miktar: 890.00, createdAt: getDateOffset(1) },
    { id: 'txn-009', tarih: getDateOffset(2), tur: 'gelir', kategori: 'Satış', aciklama: 'Sabah satışı', miktar: 1540.00, createdAt: getDateOffset(2) },
    { id: 'txn-010', tarih: getDateOffset(2), tur: 'gider', kategori: 'Elektrik', aciklama: 'Elektrik faturası', miktar: 1240.00, createdAt: getDateOffset(2) },
    { id: 'txn-011', tarih: getDateOffset(3), tur: 'gelir', kategori: 'Satış', aciklama: 'Cumartesi yoğun satış', miktar: 2340.00, createdAt: getDateOffset(3) },
    { id: 'txn-012', tarih: getDateOffset(3), tur: 'gider', kategori: 'Üretim Maliyeti', aciklama: 'Börek üretim maliyeti (80 adet)', miktar: 560.00, createdAt: getDateOffset(3), isVariableCost: true },
    { id: 'txn-013', tarih: getDateOffset(4), tur: 'gelir', kategori: 'Satış', aciklama: 'Pazar satışı', miktar: 1980.00, createdAt: getDateOffset(4) },
    { id: 'txn-014', tarih: getDateOffset(4), tur: 'gider', kategori: 'Kira', aciklama: 'Aylık kira ödemesi', miktar: 4500.00, createdAt: getDateOffset(4) },
    { id: 'txn-015', tarih: getDateOffset(5), tur: 'gelir', kategori: 'Satış', aciklama: 'Sabah ekmek satışı', miktar: 1650.00, createdAt: getDateOffset(5) },
    { id: 'txn-016', tarih: getDateOffset(6), tur: 'gelir', kategori: 'Satış', aciklama: 'Pazartesi sabah satışı', miktar: 1420.00, createdAt: getDateOffset(6) },
    { id: 'txn-017', tarih: getDateOffset(6), tur: 'gider', kategori: 'Üretim Maliyeti', aciklama: 'Poğaça üretim maliyeti (100 adet)', miktar: 380.00, createdAt: getDateOffset(6), isVariableCost: true },
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
    { id: 'stk-005', ad: 'Tereyağı', mevcutMiktar: 6, birim: 'kg', kritikSeviye: 5, birimMaliyet: 185.00, sonGuncelleme: today },
    { id: 'stk-006', ad: 'Yumurta', mevcutMiktar: 120, birim: 'adet', kritikSeviye: 60, birimMaliyet: 4.20, sonGuncelleme: today },
    { id: 'stk-007', ad: 'Ayçiçek Yağı', mevcutMiktar: 15, birim: 'litre', kritikSeviye: 10, birimMaliyet: 42.00, sonGuncelleme: getDateOffset(3) },
    { id: 'stk-008', ad: 'Şeker', mevcutMiktar: 8, birim: 'kg', kritikSeviye: 10, birimMaliyet: 22.00, sonGuncelleme: getDateOffset(4) },
  ];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STOCK_KEY, JSON.stringify(items));
  }
  return items;
}