import Dexie, { type Table } from 'dexie';
import { SalesRecord, InventoryItem } from './types';
import {
  INITIAL_INVENTORY,
  INITIAL_SALES_RECORDS,
  STORE_NAME,
  STORE_TYPE,
  STORE_LOCATION,
} from './demo-data';

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
  supplierName?: string;
  supplierPhone?: string;
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

export class BizCopilotDB extends Dexie {
  stores!: Table<DBStore, number>;
  sales!: Table<DBSalesRecord, number>;
  products!: Table<DBProduct, number>;
  suppliers!: Table<DBSupplier, number>;
  supplierPrices!: Table<DBSupplierPrice, number>;
  actions!: Table<DBAction, number>;
  settings!: Table<DBSetting, string>;

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
  }
}

export const db = new BizCopilotDB();

// Default demo suppliers mapped to products
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
 * Initialize Dexie DB with default FreshMart data if empty
 */
export async function initDatabase(): Promise<{
  storeId: number;
  sales: SalesRecord[];
  inventory: InventoryItem[];
}> {
  if (typeof window === 'undefined') {
    return { storeId: 1, sales: INITIAL_SALES_RECORDS, inventory: INITIAL_INVENTORY };
  }

  try {
    const storeCount = await db.stores.count();
    let defaultStore: DBStore | undefined;

    if (storeCount === 0) {
      // Seed initial store
      const storeId = await db.stores.add({
        name: STORE_NAME,
        type: STORE_TYPE,
        location: STORE_LOCATION,
        isDefault: true,
      });

      // Seed suppliers
      for (const sup of DEFAULT_SUPPLIERS) {
        await db.suppliers.add({
          storeId,
          name: sup.name,
          phone: sup.phone,
          leadDays: sup.leadDays,
          language: sup.language,
        });
      }

      // Seed products
      const dbProducts: DBProduct[] = INITIAL_INVENTORY.map((inv) => {
        let supName = 'Bangalore FMCG Wholesalers';
        let supPhone = '+919886098765';
        if (inv.category === 'Cooking Essentials') {
          supName = 'Karnataka Agro Oils & Grains';
          supPhone = '+919845012345';
        } else if (inv.category === 'Snacks & Beverages') {
          supName = 'South India Snacks & Spices Depot';
          supPhone = '+919900112233';
        }

        return {
          storeId,
          productId: inv.productId,
          productName: inv.productName,
          category: inv.category,
          stockOnHand: inv.stockOnHand,
          reorderLevel: inv.reorderLevel,
          supplierLeadDays: inv.supplierLeadDays,
          unitCost: inv.unitCost,
          retailPrice: inv.retailPrice,
          supplierName: supName,
          supplierPhone: supPhone,
        };
      });
      await db.products.bulkAdd(dbProducts);

      // Seed sales
      const dbSales: DBSalesRecord[] = INITIAL_SALES_RECORDS.map((s) => ({
        storeId,
        date: s.date,
        productId: s.productId,
        productName: s.productName,
        category: s.category,
        unitsSold: s.unitsSold,
        unitPrice: s.unitPrice,
      }));
      await db.sales.bulkAdd(dbSales);

      // Seed default actions
      await db.actions.bulkAdd([
        {
          storeId,
          type: 'reorder',
          productId: 'GROC-OIL-001',
          productName: 'Sunflower Cooking Oil 1L',
          description: 'Stock may run out in ~2.6 days before next delivery (takes 5 days).',
          suggestedAction: 'Order 36 units now to avoid empty shelves.',
          impactValue: 36 * 145, // Rs 5,220 saved
          status: 'suggested',
          createdAt: new Date().toISOString(),
        },
        {
          storeId,
          type: 'discount_dead_stock',
          productId: 'SNK-CHIP-001',
          productName: 'Spiced Potato Chips 100g',
          description: '180 units sitting idle for 30+ days tying up Rs 4,500.',
          suggestedAction: 'Run 25% discount bundle to clear stock & recover cash.',
          impactValue: 4500, // Rs 4,500 cash unlocked
          status: 'suggested',
          createdAt: new Date().toISOString(),
        },
        {
          storeId,
          type: 'investigate_drop',
          productId: 'BSK-PARLE-001',
          productName: 'Parle-G Biscuits 250g',
          description: 'Sales dropped -40.7% from 643 to 381 units.',
          suggestedAction: 'Check shelf placement or competition nearby.',
          impactValue: (643 - 381) * 25, // Rs 6,550 revenue gap
          status: 'suggested',
          createdAt: new Date().toISOString(),
        },
      ]);

      // Seed initial settings
      await db.settings.bulkAdd([
        { key: 'language', value: 'en' },
        { key: 'mode', value: 'owner' },
        { key: 'leadBufferDays', value: '7' },
        { key: 'onboardingComplete', value: 'false' },
        { key: 'aiEnabled', value: 'true' },
      ]);

      return {
        storeId,
        sales: INITIAL_SALES_RECORDS,
        inventory: INITIAL_INVENTORY,
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
      }));

      return {
        storeId: currentStoreId,
        sales: sales.length > 0 ? sales : INITIAL_SALES_RECORDS,
        inventory: inventory.length > 0 ? inventory : INITIAL_INVENTORY,
      };
    }
  } catch (err) {
    console.error('Dexie DB initialization failed, falling back to in-memory demo data:', err);
    return { storeId: 1, sales: INITIAL_SALES_RECORDS, inventory: INITIAL_INVENTORY };
  }
}

/**
 * Reset Dexie database to FreshMart Grocery default demo
 */
export async function resetDatabaseToDemo(): Promise<{
  sales: SalesRecord[];
  inventory: InventoryItem[];
}> {
  if (typeof window === 'undefined') {
    return { sales: INITIAL_SALES_RECORDS, inventory: INITIAL_INVENTORY };
  }

  try {
    await db.sales.clear();
    await db.products.clear();
    await db.actions.clear();
    await db.stores.clear();
    await db.suppliers.clear();
    await db.settings.clear();
    return await initDatabase();
  } catch (err) {
    console.error('Failed to reset Dexie database:', err);
    return { sales: INITIAL_SALES_RECORDS, inventory: INITIAL_INVENTORY };
  }
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
