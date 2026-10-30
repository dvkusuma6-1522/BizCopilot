import { InventoryItem, SalesRecord } from './types';
import { INITIAL_INVENTORY, INITIAL_SALES_RECORDS } from './demo-data';

const SALES_STORAGE_KEY = 'bizcopilot_sales_v1';
const INVENTORY_STORAGE_KEY = 'bizcopilot_inventory_v1';

export function loadSalesData(): SalesRecord[] {
  if (typeof window === 'undefined') return INITIAL_SALES_RECORDS;
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY);
    if (!raw) return INITIAL_SALES_RECORDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SALES_RECORDS;
  } catch (e) {
    console.error('Failed to load sales from localStorage', e);
    return INITIAL_SALES_RECORDS;
  }
}

export function saveSalesData(sales: SalesRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
  } catch (e) {
    console.error('Failed to save sales to localStorage', e);
  }
}

export function loadInventoryData(): InventoryItem[] {
  if (typeof window === 'undefined') return INITIAL_INVENTORY;
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return INITIAL_INVENTORY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INVENTORY;
  } catch (e) {
    console.error('Failed to load inventory from localStorage', e);
    return INITIAL_INVENTORY;
  }
}

export function saveInventoryData(inventory: InventoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  } catch (e) {
    console.error('Failed to save inventory to localStorage', e);
  }
}

export function resetDemoData(): { sales: SalesRecord[]; inventory: InventoryItem[] } {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SALES_STORAGE_KEY);
      localStorage.removeItem(INVENTORY_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
  }
  return {
    sales: INITIAL_SALES_RECORDS,
    inventory: INITIAL_INVENTORY,
  };
}
