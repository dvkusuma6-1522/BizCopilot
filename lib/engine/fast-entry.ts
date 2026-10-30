import { InventoryItem } from '../types';
import { fuzzyMatchProduct } from '../voice/parse';

export interface ExtractedBillItem {
  name: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
}

export interface MatchedBillLine {
  extracted: ExtractedBillItem;
  matchedProduct?: InventoryItem;
  confidence: number;
  autoSelected: boolean;
}

export interface StockAdjustment {
  productId: string;
  productName: string;
  quantity: number;
}

/**
 * Pure function to match extracted bill line items to shop's inventory
 */
export function matchBillLinesToInventory(
  billItems: ExtractedBillItem[],
  inventory: InventoryItem[],
  minConfidence = 0.5
): MatchedBillLine[] {
  return billItems.map((item) => {
    const candidates = fuzzyMatchProduct(item.name, inventory);
    if (candidates.length > 0 && candidates[0].score >= minConfidence) {
      return {
        extracted: item,
        matchedProduct: candidates[0].product,
        confidence: candidates[0].score,
        autoSelected: true,
      };
    }
    return {
      extracted: item,
      matchedProduct: undefined,
      confidence: candidates[0]?.score || 0,
      autoSelected: false,
    };
  });
}

/**
 * Pure function to decrement stock on hand for quick sale
 */
export function applyStockDecrement(
  inventory: InventoryItem[],
  lines: { productId: string; quantity: number }[]
): {
  updatedInventory: InventoryItem[];
  adjustments: StockAdjustment[];
} {
  const lineMap = new Map<string, number>();
  for (const l of lines) {
    if (l.quantity > 0) {
      lineMap.set(l.productId, (lineMap.get(l.productId) || 0) + l.quantity);
    }
  }

  const adjustments: StockAdjustment[] = [];
  const updatedInventory = inventory.map((item) => {
    const qtyToDeduct = lineMap.get(item.productId);
    if (!qtyToDeduct) return item;

    const actualDeducted = Math.min(item.stockOnHand, qtyToDeduct);
    adjustments.push({
      productId: item.productId,
      productName: item.productName,
      quantity: actualDeducted,
    });

    return {
      ...item,
      stockOnHand: Math.max(0, item.stockOnHand - qtyToDeduct),
    };
  });

  return { updatedInventory, adjustments };
}

/**
 * Pure function to undo/revert quick sale stock decrement
 */
export function revertStockDecrement(
  inventory: InventoryItem[],
  adjustments: { productId: string; quantity: number }[]
): InventoryItem[] {
  const adjMap = new Map<string, number>();
  for (const a of adjustments) {
    adjMap.set(a.productId, (adjMap.get(a.productId) || 0) + a.quantity);
  }

  return inventory.map((item) => {
    const qtyToRestore = adjMap.get(item.productId);
    if (!qtyToRestore) return item;

    return {
      ...item,
      stockOnHand: item.stockOnHand + qtyToRestore,
    };
  });
}
