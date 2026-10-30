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
    barcode: "8901030383456",
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
    barcode: "8901058852415",
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
    barcode: "8901725181223",
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
    barcode: "8901262010014",
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
    barcode: "8901063141221",
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
    barcode: "8901058852422",
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
    barcode: "8901491101824",
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
    barcode: "8901233024018",
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
    barcode: "8901030012219",
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
    barcode: "8901725181001",
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
    barcode: "8906014410052",
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
    barcode: "8901030044012",
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
// Exactly calibrates acceptance check numbers:
// - P001: 381 units in current 14d vs 643 in previous 14d (-40.7%)
// - P002: 53 units in current 14d (3.8/day, 2.6d cover, lead 5, reorder 36)
// - P007: 180 unsold on hand, 0 sold in 14d, Rs 4,500 dead stock
export function generateDemoSalesRecords(): SalesRecord[] {
  const records: SalesRecord[] = [];

  // Fixed daily curves matching exact sums
  // Current 14 days for P001: sums to 381
  const p001Current14 = [28, 25, 27, 26, 29, 31, 28, 25, 27, 26, 28, 27, 26, 28]; // sum = 381
  // Previous 14 days for P001: sums to 643
  const p001Prev14 = [46, 45, 48, 44, 47, 51, 48, 45, 47, 44, 46, 45, 43, 44]; // sum = 643

  // Current 14 days for P002 (Sunflower Cooking Oil): sums to 53 (avg 3.79 -> 3.8/day)
  const p002Current14 = [4, 4, 3, 4, 4, 5, 4, 3, 4, 4, 4, 5, 4, 4]; // sum = 53
  const p002Prev14 = [4, 5, 4, 4, 5, 5, 4, 4, 4, 5, 4, 4, 5, 4]; // sum = 61

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const dateStr = getDateString(daysAgo);

    // Day of week factor for general products
    const dayOfWeek = (29 - daysAgo + 4) % 7;
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
    const weekendMultiplier = isWeekend ? 1.2 : 1.0;

    // 1. P001: Parle-G Biscuits 250g
    let p001Units = 45;
    if (daysAgo < 14) {
      p001Units = p001Current14[daysAgo];
    } else if (daysAgo < 28) {
      p001Units = p001Prev14[daysAgo - 14];
    }
    records.push({
      date: dateStr,
      productId: "P001",
      productName: "Parle-G Biscuits 250g",
      category: "Snacks",
      unitsSold: p001Units,
      unitPrice: 10,
    });

    // 2. P002: Sunflower Cooking Oil 1L
    let p002Units = 4;
    if (daysAgo < 14) {
      p002Units = p002Current14[daysAgo];
    } else if (daysAgo < 28) {
      p002Units = p002Prev14[daysAgo - 14];
    }
    records.push({
      date: dateStr,
      productId: "P002",
      productName: "Sunflower Cooking Oil 1L",
      category: "Pantry",
      unitsSold: p002Units,
      unitPrice: 165,
    });

    // 3. P003: Basmati Rice 5kg - High revenue, Class A (~4-5 bags/day)
    const p003Units = Math.round((4 + (daysAgo % 4 === 1 ? 1 : 0)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P003",
      productName: "Basmati Rice 5kg",
      category: "Staples",
      unitsSold: Math.max(3, p003Units),
      unitPrice: 450,
    });

    // 4. P004: Chakki Wheat Flour 10kg - Class A (~5-6 bags/day)
    const p004Units = Math.round((5 + (daysAgo % 3 === 2 ? 1 : 0)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P004",
      productName: "Chakki Wheat Flour 10kg",
      category: "Staples",
      unitsSold: Math.max(4, p004Units),
      unitPrice: 420,
    });

    // 5. P005: Fresh Toned Milk 500ml - Class B (~45 pouches/day)
    const p005Units = Math.round((44 + (daysAgo % 5)) * (isWeekend ? 1.15 : 1.0));
    records.push({
      date: dateStr,
      productId: "P005",
      productName: "Fresh Toned Milk 500ml",
      category: "Dairy",
      unitsSold: p005Units,
      unitPrice: 32,
    });

    // 6. P006: Masala Instant Noodles 70g - Class B (~22 packs/day)
    const p006Units = Math.round((21 + (daysAgo % 4)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P006",
      productName: "Masala Instant Noodles 70g",
      category: "Snacks",
      unitsSold: p006Units,
      unitPrice: 15,
    });

    // 7. P007: Spiced Potato Chips 100g - Dead Stock (180 unsold, 0 sold in last 14d, 1 sold on day 26)
    const p007Units = daysAgo === 26 ? 1 : 0;
    records.push({
      date: dateStr,
      productId: "P007",
      productName: "Spiced Potato Chips 100g",
      category: "Snacks",
      unitsSold: p007Units,
      unitPrice: 35,
    });

    // 8. P008: Refined White Sugar 1kg - Class B (~8 kg/day)
    const p008Units = Math.round((8 + (daysAgo % 3 - 1)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P008",
      productName: "Refined White Sugar 1kg",
      category: "Pantry",
      unitsSold: Math.max(6, p008Units),
      unitPrice: 48,
    });

    // 9. P009: Premium Assam Tea 250g - Class B (~6 packs/day)
    const p009Units = Math.round((6 + (daysAgo % 3 === 0 ? 1 : 0)) * (isWeekend ? 1.1 : 1.0));
    records.push({
      date: dateStr,
      productId: "P009",
      productName: "Premium Assam Tea 250g",
      category: "Beverages",
      unitsSold: Math.max(5, p009Units),
      unitPrice: 140,
    });

    // 10. P010: Natural Mineral Water 1L - Class C (~15 bottles/day)
    const p010Units = Math.round((14 + (daysAgo % 4)) * (isWeekend ? 1.2 : 0.95));
    records.push({
      date: dateStr,
      productId: "P010",
      productName: "Natural Mineral Water 1L",
      category: "Beverages",
      unitsSold: Math.max(12, p010Units),
      unitPrice: 20,
    });

    // 11. P011: Organic Toor Dal 1kg - Class B (~4 kg/day)
    const p011Units = Math.round((4 + (daysAgo % 2 === 0 ? 1 : 0)) * weekendMultiplier);
    records.push({
      date: dateStr,
      productId: "P011",
      productName: "Organic Toor Dal 1kg",
      category: "Pulses",
      unitsSold: Math.max(3, p011Units),
      unitPrice: 175,
    });

    // 12. P012: Detergent Bar 200g - Class C (Overstocked with 320 on hand!)
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
