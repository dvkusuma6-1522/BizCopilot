import { describe, it, expect } from 'vitest';
import {
  matchBillLinesToInventory,
  applyStockDecrement,
  revertStockDecrement,
  ExtractedBillItem,
} from './fast-entry';
import { INITIAL_INVENTORY } from '../demo-data';

describe('Fast Entry & Bill Engine (lib/engine/fast-entry.ts)', () => {
  describe('matchBillLinesToInventory', () => {
    it('matches bill items with high confidence to existing inventory', () => {
      const billItems: ExtractedBillItem[] = [
        { name: 'Parle-G 250g Pkt', quantity: 24, unitPrice: 7.2 },
        { name: 'Sunflower Oil 1 Litre pouch', quantity: 15, unitPrice: 130 },
      ];

      const matches = matchBillLinesToInventory(billItems, INITIAL_INVENTORY);
      expect(matches).toHaveLength(2);
      expect(matches[0].autoSelected).toBe(true);
      expect(matches[0].matchedProduct?.productId).toBe('P001');
      expect(matches[1].autoSelected).toBe(true);
      expect(matches[1].matchedProduct?.productId).toBe('P002');
    });

    it('marks unknown products with autoSelected: false', () => {
      const billItems: ExtractedBillItem[] = [
        { name: 'Unheard Exotic Imported Item 500g', quantity: 5, unitPrice: 999 },
      ];

      const matches = matchBillLinesToInventory(billItems, INITIAL_INVENTORY);
      expect(matches).toHaveLength(1);
      expect(matches[0].autoSelected).toBe(false);
      expect(matches[0].matchedProduct).toBeUndefined();
    });
  });

  describe('applyStockDecrement and revertStockDecrement', () => {
    it('atomically decrements stock without dropping below 0', () => {
      const testInventory = [
        { ...INITIAL_INVENTORY[0], stockOnHand: 10 },
        { ...INITIAL_INVENTORY[1], stockOnHand: 5 },
      ];

      const { updatedInventory, adjustments } = applyStockDecrement(testInventory, [
        { productId: INITIAL_INVENTORY[0].productId, quantity: 4 },
        { productId: INITIAL_INVENTORY[1].productId, quantity: 8 }, // more than 5
      ]);

      const item0 = updatedInventory.find((p) => p.productId === INITIAL_INVENTORY[0].productId);
      const item1 = updatedInventory.find((p) => p.productId === INITIAL_INVENTORY[1].productId);

      expect(item0?.stockOnHand).toBe(6);
      expect(item1?.stockOnHand).toBe(0); // floored at 0
      expect(adjustments).toHaveLength(2);
    });

    it('reverts stock decrement exactly when undo is triggered', () => {
      const originalStock = 25;
      const testInventory = [
        { ...INITIAL_INVENTORY[0], stockOnHand: originalStock },
      ];

      const { updatedInventory, adjustments } = applyStockDecrement(testInventory, [
        { productId: INITIAL_INVENTORY[0].productId, quantity: 5 },
      ]);

      expect(updatedInventory[0].stockOnHand).toBe(20);

      // Trigger undo
      const restoredInventory = revertStockDecrement(updatedInventory, adjustments);
      expect(restoredInventory[0].stockOnHand).toBe(originalStock);
    });
  });
});
