import { InventoryItem, SalesRecord } from './types';

export const STORE_NAME = "FreshMart Grocery";
export const STORE_TYPE = "Kirana & Neighborhood Retail";
export const STORE_LOCATION = "Indiranagar, Bangalore";

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    productId: "P001",
    productName: "Parle-G Biscuits 250g",
    category: "Snacks",
    stockOnHand: 120,
    reorderLevel: 50,
    supplierLeadDays: 2,
    unitCost: 7.5,
    retailPrice: 10,
  },
  {
    productId: "P002",
    productName: "Sunflower Cooking Oil 1L",
    category: "Pantry",
    stockOnHand: 10,
    reorderLevel: 25,
    supplierLeadDays: 5,
    unitCost: 135,
    retailPrice: 165,
  },
  {
    productId: "P003",
    productName: "Basmati Rice 5kg",
    category: "Staples",
    stockOnHand: 45,
    reorderLevel: 20,
    supplierLeadDays: 3,
    unitCost: 360,
    retailPrice: 450,
  },
  {
    productId: "P004",
    productName: "Chakki Wheat Flour 10kg",
    category: "Staples",
    stockOnHand: 35,
    reorderLevel: 30,
    supplierLeadDays: 3,
    unitCost: 340,
    retailPrice: 420,
  },
  {
    productId: "P005",
    productName: "Fresh Toned Milk 500ml",
    category: "Dairy",
    stockOnHand: 60,
    reorderLevel: 40,
    supplierLeadDays: 1,
    unitCost: 26,
    retailPrice: 32,
  },
  {
    productId: "P006",
    productName: "Masala Instant Noodles 70g",
    category: "Snacks",
    stockOnHand: 180,
    reorderLevel: 60,
    supplierLeadDays: 2,
    unitCost: 11,
    retailPrice: 15,
  },
  {
    productId: "P007",
    productName: "Spiced Potato Chips 100g",
    category: "Snacks",
    stockOnHand: 180,
    reorderLevel: 30,
    supplierLeadDays: 4,
    unitCost: 25,
    retailPrice: 35,
  },
  {
    productId: "P008",
    productName: "Refined White Sugar 1kg",
    category: "Pantry",
    stockOnHand: 18,
    reorderLevel: 25,
    supplierLeadDays: 3,
    unitCost: 39,
    retailPrice: 48,
  },
  {
    productId: "P009",
    productName: "Premium Assam Tea 250g",
    category: "Beverages",
    stockOnHand: 52,
    reorderLevel: 20,
    supplierLeadDays: 4,
    unitCost: 105,
    retailPrice: 140,
  },
  {
    productId: "P010",
    productName: "Natural Mineral Water 1L",
    category: "Beverages",
    stockOnHand: 90,
    reorderLevel: 35,
    supplierLeadDays: 2,
    unitCost: 12,
    retailPrice: 20,
  },
  {
    productId: "P011",
    productName: "Organic Toor Dal 1kg",
    category: "Pulses",
    stockOnHand: 42,
    reorderLevel: 20,
    supplierLeadDays: 3,
    unitCost: 140,
    retailPrice: 175,
  },
  {
    productId: "P012",
    productName: "Detergent Bar 200g",
    category: "Household",
    stockOnHand: 320,
    reorderLevel: 40,
    supplierLeadDays: 3,
    unitCost: 18,
    retailPrice: 25,
  },
];

// Helper to format date strings YYYY-MM-DD
function getDateString(daysAgo: number): string {
  const d = new Date(2026, 9, 30); // 2026-10-30
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic daily sales for the past 30 days
export function generateDemoSalesRecords(): SalesRecord[] {
  const records: SalesRecord[] = [];

  // Seeded deterministic generator
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const dateStr = getDateString(daysAgo);

    // Day of week factor: weekends (Friday=5, Saturday=6, Sunday=0) have ~20% higher demand
    const dayOfWeek = (29 - daysAgo + 4) % 7;
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
    const weekendMultiplier = isWeekend ? 1.22 : 1.0;

    // 1. P001: Parle-G Biscuits - Deliberate sales decline in the last 7-10 days
    // Baseline (daysAgo > 9): ~40-42 units/day. Recent (daysAgo <= 9): drops to ~18-20 units/day (-52%)
    const p001Units = daysAgo > 9 
      ? Math.round((39 + (daysAgo % 5) * 1.5) * weekendMultiplier)
      : Math.round((18 + (daysAgo % 3) * 1.2) * (isWeekend ? 1.1 : 1.0));
    records.push({
      date: dateStr,
      productId: "P001",
      productName: "Parle-G Biscuits 250g",
      category: "Snacks",
      unitsSold: p001Units,
      unitPrice: 10,
    });

    // 2. P002: Sunflower Cooking Oil 1L - Avg daily ~3.3 litres (3-4/day)
    const p002Units = Math.round((3 + (daysAgo % 3 === 0 ? 1 : 0)) * (isWeekend ? 1.2 : 0.95));
    records.push({
      date: dateStr,
      productId: "P002",
      productName: "Sunflower Cooking Oil 1L",
      category: "Pantry",
      unitsSold: Math.max(2, p002Units),
      unitPrice: 165,
    });

    // 3. P003: Basmati Rice 5kg - High revenue, ~4 bags/day
    const p003Units = Math.round((4 + (daysAgo % 4 === 1 ? 1 : -1)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P003",
      productName: "Basmati Rice 5kg",
      category: "Staples",
      unitsSold: Math.max(3, p003Units),
      unitPrice: 450,
    });

    // 4. P004: Chakki Wheat Flour 10kg - ~5 bags/day
    const p004Units = Math.round((5 + (daysAgo % 3 === 2 ? 1 : 0)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P004",
      productName: "Chakki Wheat Flour 10kg",
      category: "Staples",
      unitsSold: Math.max(4, p004Units),
      unitPrice: 420,
    });

    // 5. P005: Fresh Toned Milk 500ml - ~45 pouches/day
    const p005Units = Math.round((44 + (daysAgo % 5)) * (isWeekend ? 1.15 : 1.0));
    records.push({
      date: dateStr,
      productId: "P005",
      productName: "Fresh Toned Milk 500ml",
      category: "Dairy",
      unitsSold: p005Units,
      unitPrice: 32,
    });

    // 6. P006: Masala Instant Noodles 70g - ~22 packs/day
    const p006Units = Math.round((21 + (daysAgo % 4)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P006",
      productName: "Masala Instant Noodles 70g",
      category: "Snacks",
      unitsSold: p006Units,
      unitPrice: 15,
    });

    // 7. P007: Spiced Potato Chips 100g - Dead stock!
    // Sold only 1 unit on day 12 and 1 unit on day 26; 0 on all other days
    const p007Units = (daysAgo === 12 || daysAgo === 26) ? 1 : 0;
    records.push({
      date: dateStr,
      productId: "P007",
      productName: "Spiced Potato Chips 100g",
      category: "Snacks",
      unitsSold: p007Units,
      unitPrice: 35,
    });

    // 8. P008: Refined White Sugar 1kg - ~8 kg/day
    const p008Units = Math.round((8 + (daysAgo % 3 - 1)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P008",
      productName: "Refined White Sugar 1kg",
      category: "Pantry",
      unitsSold: Math.max(6, p008Units),
      unitPrice: 48,
    });

    // 9. P009: Premium Assam Tea 250g - ~6 packs/day
    const p009Units = Math.round((6 + (daysAgo % 3 === 0 ? 1 : 0)) * (isWeekend ? 1.1 : 1.0));
    records.push({
      date: dateStr,
      productId: "P009",
      productName: "Premium Assam Tea 250g",
      category: "Beverages",
      unitsSold: Math.max(5, p009Units),
      unitPrice: 140,
    });

    // 10. P010: Natural Mineral Water 1L - ~15 bottles/day
    const p010Units = Math.round((14 + (daysAgo % 4)) * (isWeekend ? 1.2 : 0.95));
    records.push({
      date: dateStr,
      productId: "P010",
      productName: "Natural Mineral Water 1L",
      category: "Beverages",
      unitsSold: Math.max(12, p010Units),
      unitPrice: 20,
    });

    // 11. P011: Organic Toor Dal 1kg - ~4 kg/day
    const p011Units = Math.round((4 + (daysAgo % 2 === 0 ? 1 : 0)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P011",
      productName: "Organic Toor Dal 1kg",
      category: "Pulses",
      unitsSold: Math.max(3, p011Units),
      unitPrice: 175,
    });

    // 12. P012: Detergent Bar 200g - ~2.8 bars/day (Overstocked with 320 on hand!)
    const p012Units = Math.round((2.8 + (daysAgo % 3 === 1 ? 0.5 : -0.5)));
    records.push({
      date: dateStr,
      productId: "P012",
      productName: "Detergent Bar 200g",
      category: "Household",
      unitsSold: Math.max(2, p012Units),
      unitPrice: 25,
    });
  }

  return records;
}

export const INITIAL_SALES_RECORDS = generateDemoSalesRecords();
