import { describe, it, expect } from 'vitest';
import {
  calculateDaysOfCover,
  calculateReorderQuantity,
  evaluateStockout,
  evaluateSalesDrop,
  evaluateDeadStock,
  calculateABCAnalysis,
  projectStockDepletion,
} from './index';

describe('BizCopilot Calculation Engine Specification & Acceptance Checks', () => {
  // Acceptance Check 1: Sunflower Cooking Oil 1L Reorder Quantity
  it('calculates reorder quantity correctly matching acceptance check: velocity 3.8, stock 10, lead 5 gives 36 units', () => {
    const velocity = 3.8;
    const stockOnHand = 10;
    const leadDays = 5;
    const bufferDays = 7;

    const reorderQty = calculateReorderQuantity(velocity, stockOnHand, leadDays, bufferDays);
    // ceil(3.8 * (5 + 7) - 10) = ceil(45.6 - 10) = ceil(35.6) = 36
    expect(reorderQty).toBe(36);
  });

  // Acceptance Check 2: Sunflower Cooking Oil Days of Cover & Critical Stockout Status
  it('evaluates Sunflower Cooking Oil 1L as Critical stockout risk with 2.6 days cover', () => {
    const stockOnHand = 10;
    const velocity = 3.8;
    const leadDays = 5;

    const daysOfCover = calculateDaysOfCover(stockOnHand, velocity);
    // 10 / 3.8 = 2.63 -> 2.6 days
    expect(daysOfCover).toBe(2.6);

    const evalResult = evaluateStockout(stockOnHand, velocity, leadDays);
    expect(evalResult.status).toBe('critical');
    expect(evalResult.daysOfCover).toBe(2.6);
    expect(evalResult.supplierLeadDays).toBe(5);
    expect(evalResult.reorderQuantity).toBe(36);
  });

  // Acceptance Check 3: Parle-G Biscuits 250g Sales Drop
  it('flags Parle-G Biscuits 250g sales drop of -40.7% as Critical', () => {
    const currentUnits = 381;
    const previousUnits = 643;

    const result = evaluateSalesDrop('P001', 'Parle-G Biscuits 250g', currentUnits, previousUnits);
    // ((381 - 643) / 643) * 100 = -40.746% -> -40.7%
    expect(result.changePct).toBe(-40.7);
    expect(result.isDrop).toBe(true);
    expect(result.severity).toBe('critical');
    expect(result.evidenceText).toContain('Sold 381 units vs 643 in previous period (-40.7%)');
  });

  // Acceptance Check 4: Spiced Potato Chips 100g Dead Stock
  it('evaluates Spiced Potato Chips 100g as dead stock tying up Rs 4,500', () => {
    const stockOnHand = 180;
    const unitsSold30d = 1;
    const unitCost = 25;
    const unitPrice = 35;

    const result = evaluateDeadStock('P007', stockOnHand, unitsSold30d, unitCost, unitPrice);
    expect(result.isDeadStock).toBe(true);
    expect(result.costValue).toBe(4500); // 180 * 25
    expect(result.retailValue).toBe(6300); // 180 * 35
    expect(result.isCostEstimated).toBe(false);
  });

  // Test 5: Dead Stock fallback to 70% retail price if cost is missing
  it('falls back to 70% of unit price when unit cost is missing', () => {
    const stockOnHand = 100;
    const unitsSold30d = 2;
    const unitPrice = 50;

    const result = evaluateDeadStock('P999', stockOnHand, unitsSold30d, undefined, unitPrice);
    expect(result.isDeadStock).toBe(true);
    expect(result.isCostEstimated).toBe(true);
    // 100 * (50 * 0.7) = 100 * 35 = 3500
    expect(result.costValue).toBe(3500);
  });

  // Test 6: ABC Classification
  it('correctly ranks and assigns Class A, B, and C by revenue share', () => {
    const products = [
      { productId: 'P1', revenue: 70000 },
      { productId: 'P2', revenue: 20000 },
      { productId: 'P3', revenue: 8000 },
      { productId: 'P4', revenue: 2000 },
    ];

    const abc = calculateABCAnalysis(products);
    expect(abc[0].productId).toBe('P1');
    expect(abc[0].abcClass).toBe('A');
    expect(abc[1].productId).toBe('P2');
    expect(abc[1].abcClass).toBe('B');
    expect(abc[3].productId).toBe('P4');
    expect(abc[3].abcClass).toBe('C');
  });

  // Test 7: Demand Forecast & Stock Depletion
  it('projects stock depletion correctly and detects zero stock days', () => {
    const initialStock = 10;
    const forecast = [
      { date: '2026-11-01', predictedUnits: 3.5 },
      { date: '2026-11-02', predictedUnits: 4.0 },
      { date: '2026-11-03', predictedUnits: 3.5 }, // reaches 0 here
      { date: '2026-11-04', predictedUnits: 4.0 },
      { date: '2026-11-05', predictedUnits: 3.5 },
    ];

    const projection = projectStockDepletion(initialStock, forecast, 5, 0);
    expect(projection.daysUntilStockout).toBe(3);
    expect(projection.daysWithoutStock).toBeGreaterThan(0);
  });

  // Test 8: What-if delivery replenishment
  it('restores stock on delivery day when simulated order quantity is provided', () => {
    const initialStock = 10;
    const forecast = [
      { date: '2026-11-01', predictedUnits: 3.5 },
      { date: '2026-11-02', predictedUnits: 4.0 },
      { date: '2026-11-03', predictedUnits: 3.5 },
      { date: '2026-11-04', predictedUnits: 4.0 },
      { date: '2026-11-05', predictedUnits: 3.5 },
    ];

    // Delivery arrives on day 3 with 36 units
    const projection = projectStockDepletion(initialStock, forecast, 3, 36);
    const day3 = projection.depletionCurve.find((d) => d.dayIndex === 3);
    expect(day3?.isDeliveryDay).toBe(true);
    expect(day3?.projectedStock).toBeGreaterThan(25);
  });
});
