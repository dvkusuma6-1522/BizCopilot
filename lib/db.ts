import Dexie, { type Table } from 'dexie';
import { SalesRecord, InventoryItem } from './types';
import {
  INITIAL_INVENTORY,
  INITIAL_SALES_RECORDS,
  STORE_NAME,
} from './demo-data';
import { BusinessCategoryId, BusinessProfile } from './categories/types';
import { getCategory, DEFAULT_CATEGORY_ID } from './categories/registry';
import { SupportedLanguage } from './i18n';

export interface DBStore {
  id?: number;
  name: string;
  type: string;
  location: string;
  isDefault: boolean;
}

export interface DBSalesRecord {
  id?: number;
  storeId: number;
  date: string;
  productId: string;
  productName: string;
  category: string;
  unitsSold: number;
  unitPrice: number;
}

export interface DBProduct {
  id?: number;
  storeId: number;
  productId: string;
  productName: string;
  category: string;
  stockOnHand: number;
  reorderLevel: number;
  supplierLeadDays: number;
  unitCost: number;
  retailPrice: number;
  barcode?: string;
  supplierName?: string;
  supplierPhone?: string;
  attributes?: Record<string, unknown>;
}

export interface DBSupplier {
  id?: number;
  storeId: number;
  name: string;
  phone: string;
  leadDays: number;
  language: 'en' | 'kn' | 'hi';
}

export interface DBSupplierPrice {
  id?: number;
  supplierId: number;
  productId: string;
  unitCost: number;
  date: string;
}

export type ActionStatus = 'suggested' | 'approved' | 'done' | 'dismissed';

export interface DBAction {
  id?: number;
  storeId: number;
  type: 'reorder' | 'discount_dead_stock' | 'investigate_drop' | 'supplier_followup';
  productId: string;
  productName: string;
  description: string;
  suggestedAction: string;
  impactValue: number; // In INR: sales saved or cash liberated
  status: ActionStatus;
  createdAt: string;
  completedAt?: string;
}

export interface DBSetting {
  key: string;
  value: string; // JSON encoded or string
}

export interface DBBusinessProfile {
  id?: number;
  categoryId: BusinessCategoryId;
  businessName: string;
  city: string;
  language: SupportedLanguage;
  createdAt: string;
}

export class BizCopilotDB extends Dexie {
  stores!: Table<DBStore, number>;
  sales!: Table<DBSalesRecord, number>;
  products!: Table<DBProduct, number>;
  suppliers!: Table<DBSupplier, number>;
  supplierPrices!: Table<DBSupplierPrice, number>;
  actions!: Table<DBAction, number>;
  settings!: Table<DBSetting, string>;
  businessProfile!: Table<DBBusinessProfile, number>;

  constructor() {
    super('BizCopilotDB');
    this.version(1).stores({
      stores: '++id, name, isDefault',
      sales: '++id, storeId, date, productId, category',
      products: '++id, storeId, productId, category',
      suppliers: '++id, storeId, name',
      supplierPrices: '++id, supplierId, productId',
      actions: '++id, storeId, productId, status, type',
      settings: 'key',
    });

    this.version(2).stores({
      businessProfile: '++id, categoryId, businessName, city',
    });

    this.version(3).stores({
      products: '++id, storeId, productId, category, barcode',
    });
  }
}

export const db = new BizCopilotDB();

// Default demo suppliers
export const DEFAULT_SUPPLIERS = [
  {
    name: 'Karnataka Agro Oils & Grains',
    phone: '+919845012345',
    leadDays: 5,
    language: 'kn' as const,
  },
  {
    name: 'Bangalore FMCG Wholesalers',
    phone: '+919886098765',
    leadDays: 3,
    language: 'en' as const,
  },
  {
    name: 'South India Snacks & Spices Depot',
    phone: '+919900112233',
    leadDays: 4,
    language: 'hi' as const,
  },
];

/**
 * Get active business profile; defaults to Kirana if not yet configured
 */
export async function getBusinessProfile(): Promise<BusinessProfile> {
  if (typeof window === 'undefined') {
    return {
      categoryId: DEFAULT_CATEGORY_ID,
      businessName: STORE_NAME,
      city: 'Bengaluru',
      language: 'en',
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const profile = await db.businessProfile.toCollection().first();
    if (profile) {
      return {
        id: profile.id,
        categoryId: profile.categoryId || DEFAULT_CATEGORY_ID,
        businessName: profile.businessName || STORE_NAME,
        city: profile.city || 'Bengaluru',
        language: profile.language || 'en',
        createdAt: profile.createdAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('Failed to fetch businessProfile from Dexie:', err);
  }

  return {
    categoryId: DEFAULT_CATEGORY_ID,
    businessName: STORE_NAME,
    city: 'Bengaluru',
    language: 'en',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Save or update business profile
 */
export async function saveBusinessProfile(
  profile: Partial<BusinessProfile>
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const existing = await db.businessProfile.toCollection().first();
    if (existing && existing.id) {
      await db.businessProfile.update(existing.id, {
        categoryId: profile.categoryId || existing.categoryId,
        businessName: profile.businessName || existing.businessName,
        city: profile.city || existing.city,
        language: profile.language || existing.language,
      });
    } else {
      await db.businessProfile.add({
        categoryId: profile.categoryId || DEFAULT_CATEGORY_ID,
        businessName: profile.businessName || STORE_NAME,
        city: profile.city || 'Bengaluru',
        language: profile.language || 'en',
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Failed to save businessProfile to Dexie:', err);
  }
}

/**
 * Seed category-specific demo dataset into Dexie
 */
export async function seedCategoryDemoData(
  categoryId: BusinessCategoryId = DEFAULT_CATEGORY_ID
): Promise<{
  store: { name: string; type: string; location: string };
  sales: SalesRecord[];
  inventory: InventoryItem[];
}> {
  const cat = getCategory(categoryId);
  const demo = cat.demoDataset();

  if (typeof window === 'undefined') {
    return {
      store: demo.store,
      sales: demo.sales,
      inventory: demo.products,
    };
  }

  try {
    // Clear existing store tables
    await db.sales.clear();
    await db.products.clear();
    await db.actions.clear();
    await db.stores.clear();

    // Add store record
    const storeId = await db.stores.add({
      name: demo.store.name,
      type: demo.store.type,
      location: demo.store.location,
      isDefault: true,
    });

    // Bulk add products
    const dbProducts: DBProduct[] = demo.products.map((p) => ({
      storeId,
      productId: p.productId,
      productName: p.productName,
      category: p.category,
      stockOnHand: p.stockOnHand,
      reorderLevel: p.reorderLevel,
      supplierLeadDays: p.supplierLeadDays,
      unitCost: p.unitCost,
      retailPrice: p.retailPrice,
      barcode: p.barcode,
      attributes: p.attributes || {},
      supplierName: `${cat.labels.en} Wholesaler`,
      supplierPhone: '+919845012345',
    }));
    await db.products.bulkAdd(dbProducts);

    // Bulk add sales
    const dbSales: DBSalesRecord[] = demo.sales.map((s) => ({
      storeId,
      date: s.date,
      productId: s.productId,
      productName: s.productName,
      category: s.category,
      unitsSold: s.unitsSold,
      unitPrice: s.unitPrice,
    }));
    await db.sales.bulkAdd(dbSales);

    // Add initial category actions
    const initialActions: DBAction[] = [];
    const stockoutCandidates = demo.products.filter(
      (p) => p.stockOnHand <= (p.reorderLevel || 10)
    );
    if (stockoutCandidates.length > 0) {
      const p = stockoutCandidates[0];
      initialActions.push({
        storeId,
        type: 'reorder',
        productId: p.productId,
        productName: p.productName,
        description: `${p.productName} is approaching critical stock levels before next delivery.`,
        suggestedAction: `Order fresh replenishment batch today.`,
        impactValue: Math.round(p.reorderLevel * p.retailPrice),
        status: 'suggested',
        createdAt: new Date().toISOString(),
      });
    }

    if (initialActions.length > 0) {
      await db.actions.bulkAdd(initialActions);
    }

    // Update business profile category
    await saveBusinessProfile({ categoryId, businessName: demo.store.name, city: 'Bengaluru' });

    return {
      store: demo.store,
      sales: demo.sales,
      inventory: demo.products,
    };
  } catch (err) {
    console.error(`Failed to seed demo data for category ${categoryId}:`, err);
    return {
      store: demo.store,
      sales: demo.sales,
      inventory: demo.products,
    };
  }
}

/**
 * Initialize Dexie DB with default FreshMart data if empty
 */
export async function initDatabase(): Promise<{
  storeId: number;
  sales: SalesRecord[];
  inventory: InventoryItem[];
  profile: BusinessProfile;
}> {
  const profile = await getBusinessProfile();

  if (typeof window === 'undefined') {
    return {
      storeId: 1,
      sales: INITIAL_SALES_RECORDS,
      inventory: INITIAL_INVENTORY,
      profile,
    };
  }

  try {
    const storeCount = await db.stores.count();
    let defaultStore: DBStore | undefined;

    if (storeCount === 0) {
      // Seed initial category demo data
      const demoRes = await seedCategoryDemoData(profile.categoryId || DEFAULT_CATEGORY_ID);

      // Seed default suppliers
      for (const sup of DEFAULT_SUPPLIERS) {
        await db.suppliers.add({
          storeId: 1,
          name: sup.name,
          phone: sup.phone,
          leadDays: sup.leadDays,
          language: sup.language,
        });
      }

      // Seed settings
      await db.settings.bulkAdd([
        { key: 'language', value: profile.language || 'en' },
        { key: 'mode', value: 'owner' },
        { key: 'leadBufferDays', value: '7' },
        { key: 'onboardingComplete', value: 'false' },
        { key: 'aiEnabled', value: 'true' },
      ]);

      return {
        storeId: 1,
        sales: demoRes.sales,
        inventory: demoRes.inventory,
        profile,
      };
    } else {
      defaultStore = await db.stores.filter((s) => s.isDefault).first();
      const currentStoreId = defaultStore?.id || 1;

      const salesList = await db.sales.where('storeId').equals(currentStoreId).toArray();
      const productList = await db.products.where('storeId').equals(currentStoreId).toArray();

      const sales: SalesRecord[] = salesList.map((s) => ({
        date: s.date,
        productId: s.productId,
        productName: s.productName,
        category: s.category,
        unitsSold: s.unitsSold,
        unitPrice: s.unitPrice,
      }));

      const inventory: InventoryItem[] = productList.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        category: p.category,
        stockOnHand: p.stockOnHand,
        reorderLevel: p.reorderLevel,
        supplierLeadDays: p.supplierLeadDays,
        unitCost: p.unitCost,
        retailPrice: p.retailPrice,
        barcode: p.barcode,
        attributes: p.attributes || {},
      }));

      return {
        storeId: currentStoreId,
        sales: sales.length > 0 ? sales : INITIAL_SALES_RECORDS,
        inventory: inventory.length > 0 ? inventory : INITIAL_INVENTORY,
        profile,
      };
    }
  } catch (err) {
    console.error('Dexie DB initialization failed:', err);
    return {
      storeId: 1,
      sales: INITIAL_SALES_RECORDS,
      inventory: INITIAL_INVENTORY,
      profile,
    };
  }
}

/**
 * Reset Dexie database to current category's default demo
 */
export async function resetDatabaseToDemo(
  categoryId?: BusinessCategoryId
): Promise<{
  sales: SalesRecord[];
  inventory: InventoryItem[];
}> {
  const profile = await getBusinessProfile();
  const targetCategory = categoryId || profile.categoryId || DEFAULT_CATEGORY_ID;
  const res = await seedCategoryDemoData(targetCategory);
  return {
    sales: res.sales,
    inventory: res.inventory,
  };
}

/**
 * Save newly imported sales & inventory into Dexie
 */
export async function saveImportedDataToDb(
  sales: SalesRecord[],
  inventory: InventoryItem[]
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const store = await db.stores.filter((s) => s.isDefault).first();
    const storeId = store?.id || 1;

    // Clear old sales & products for this store
    await db.sales.where('storeId').equals(storeId).delete();
    await db.products.where('storeId').equals(storeId).delete();

    // Insert new sales
    const dbSales: DBSalesRecord[] = sales.map((s) => ({
      storeId,
      date: s.date,
      productId: s.productId,
      productName: s.productName,
      category: s.category || 'General',
      unitsSold: Number(s.unitsSold) || 0,
      unitPrice: Number(s.unitPrice) || 0,
    }));
    await db.sales.bulkAdd(dbSales);

    // Insert new inventory
    const dbProducts: DBProduct[] = inventory.map((inv) => ({
      storeId,
      productId: inv.productId,
      productName: inv.productName,
      category: inv.category || 'General',
      stockOnHand: Number(inv.stockOnHand) || 0,
      reorderLevel: Number(inv.reorderLevel) || 10,
      supplierLeadDays: Number(inv.supplierLeadDays) || 3,
      unitCost: Number(inv.unitCost) || Math.round(inv.retailPrice * 0.7),
      retailPrice: Number(inv.retailPrice) || 0,
      attributes: inv.attributes || {},
    }));
    await db.products.bulkAdd(dbProducts);
  } catch (err) {
    console.error('Failed to save imported data to Dexie:', err);
  }
}

/**
 * Actions management
 */
export async function getDbActions(): Promise<DBAction[]> {
  if (typeof window === 'undefined') return [];
  try {
    return await db.actions.toArray();
  } catch (e) {
    console.error('Failed to load actions from Dexie:', e);
    return [];
  }
}

export async function updateDbActionStatus(
  id: number,
  status: ActionStatus
): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const patch: Partial<DBAction> = { status };
    if (status === 'done') {
      patch.completedAt = new Date().toISOString();
    }
    await db.actions.update(id, patch);
  } catch (e) {
    console.error(`Failed to update action #${id} to ${status}:`, e);
  }
}

export async function addDbAction(action: Omit<DBAction, 'id'>): Promise<number> {
  if (typeof window === 'undefined') return 0;
  try {
    return await db.actions.add(action);
  } catch (e) {
    console.error('Failed to add action to Dexie:', e);
    return 0;
  }
}

/**
 * Settings helpers
 */
export async function getDbSetting(key: string, defaultValue: string): Promise<string> {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const row = await db.settings.get(key);
    return row ? row.value : defaultValue;
  } catch (e) {
    console.error(`Failed to get setting ${key}:`, e);
    return defaultValue;
  }
}

export async function setDbSetting(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await db.settings.put({ key, value });
  } catch (e) {
    console.error(`Failed to set setting ${key}:`, e);
  }
}

/**
 * Fast Entry & Stock Operations
 */
export interface QuickSaleLine {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface QuickSaleResult {
  saleIds: number[];
  adjustments: { productId: string; productName: string; quantity: number }[];
  totalAmount: number;
}

export async function recordQuickSale(
  lines: QuickSaleLine[],
  dateStr?: string,
  storeId = 1
): Promise<QuickSaleResult> {
  const date = dateStr || new Date().toISOString().split('T')[0];
  const saleIds: number[] = [];
  const adjustments: { productId: string; productName: string; quantity: number }[] = [];
  let totalAmount = 0;

  if (typeof window === 'undefined') {
    return { saleIds: [1], adjustments: [], totalAmount: 0 };
  }

  await db.transaction('rw', db.sales, db.products, async () => {
    for (const line of lines) {
      if (!line.quantity || line.quantity <= 0) continue;
      const product = await db.products
        .where('storeId')
        .equals(storeId)
        .filter((p) => p.productId === line.productId)
        .first();

      if (!product) continue;

      const price = line.unitPrice ?? product.retailPrice ?? 0;
      const amount = price * line.quantity;
      totalAmount += amount;

      // Decrement stockOnHand (prevent negative stock)
      const newStock = Math.max(0, (product.stockOnHand || 0) - line.quantity);
      if (product.id) {
        await db.products.update(product.id, { stockOnHand: newStock });
      }

      // Add sales record
      const id = await db.sales.add({
        storeId,
        date,
        productId: product.productId,
        productName: product.productName,
        category: product.category,
        unitsSold: line.quantity,
        unitPrice: price,
      });

      saleIds.push(id);
      adjustments.push({
        productId: product.productId,
        productName: product.productName,
        quantity: line.quantity,
      });
    }
  });

  return { saleIds, adjustments, totalAmount };
}

export async function undoQuickSale(
  saleIds: number[],
  adjustments: { productId: string; quantity: number }[],
  storeId = 1
): Promise<void> {
  if (typeof window === 'undefined') return;
  await db.transaction('rw', db.sales, db.products, async () => {
    for (const id of saleIds) {
      await db.sales.delete(id);
    }
    for (const adj of adjustments) {
      const product = await db.products
        .where('storeId')
        .equals(storeId)
        .filter((p) => p.productId === adj.productId)
        .first();
      if (product && product.id) {
        await db.products.update(product.id, {
          stockOnHand: (product.stockOnHand || 0) + adj.quantity,
        });
      }
    }
  });
}

export async function recordStockIn(
  items: { productId: string; quantity: number; unitCost?: number }[],
  storeId = 1
): Promise<void> {
  if (typeof window === 'undefined') return;
  await db.transaction('rw', db.products, async () => {
    for (const item of items) {
      if (item.quantity <= 0) continue;
      const product = await db.products
        .where('storeId')
        .equals(storeId)
        .filter((p) => p.productId === item.productId)
        .first();
      if (product && product.id) {
        const patch: Partial<DBProduct> = {
          stockOnHand: (product.stockOnHand || 0) + item.quantity,
        };
        if (item.unitCost !== undefined && item.unitCost > 0) {
          patch.unitCost = item.unitCost;
        }
        await db.products.update(product.id, patch);
      }
    }
  });
}

export async function findProductByBarcode(
  barcode: string,
  storeId = 1
): Promise<DBProduct | undefined> {
  if (typeof window === 'undefined') return undefined;
  const clean = barcode.trim();
  const product = await db.products
    .where('storeId')
    .equals(storeId)
    .filter((p) => p.barcode === clean)
    .first();
  return product;
}

export async function clearDemoData(storeId = 1): Promise<void> {
  if (typeof window === 'undefined') return;
  await db.transaction('rw', db.sales, db.products, db.actions, db.settings, async () => {
    await db.sales.where('storeId').equals(storeId).delete();
    await db.products.where('storeId').equals(storeId).delete();
    await db.actions.where('storeId').equals(storeId).delete();
    await db.settings.put({ key: 'isDemoData', value: 'false' });
  });
}

export async function isDemoDataActive(): Promise<boolean> {
  const val = await getDbSetting('isDemoData', 'true');
  return val === 'true';
}

export async function setDemoDataActive(active: boolean): Promise<void> {
  await setDbSetting('isDemoData', active ? 'true' : 'false');
}

export async function getTourSeen(): Promise<boolean> {
  const val = await getDbSetting('tourSeen', 'false');
  return val === 'true';
}

export async function setTourSeen(seen = true): Promise<void> {
  await setDbSetting('tourSeen', seen ? 'true' : 'false');
}

