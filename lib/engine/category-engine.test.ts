import { describe, it, expect } from 'vitest';
import {
  evaluateExpiryRisk,
  evaluateSizeCurveGap,
  evaluateSpoilageRisk,
  calculateFoodCostPct,
  evaluateCreditExposure,
  getFestivalMultiplier,
  applySeasonalityToForecast,
} from './category-engine';

describe('Category-Aware Pure Engine Extensions', () => {
  // MODULE 1: EXPIRY RISK TESTS
  describe('evaluateExpiryRisk', () => {
    const fixedNow = new Date('2026-10-30T00:00:00');

    it('identifies critical near-expiry stock when units will not sell out in time', () => {
      // 50 units in stock, expires in 20 days (2026-11-19), sells only 1 unit/day -> 30 units at risk
      const items = [
        {
          productId: 'MED-AZI-001',
          productName: 'Azithromycin 500mg',
          expiryDate: '2026-11-19',
          stockOnHand: 50,
          dailyVelocity: 1.0,
          unitCost: 80,
          batchNo: 'B2409',
        },
      ];

      const res = evaluateExpiryRisk(items, fixedNow);
      expect(res).toHaveLength(1);
      expect(res[0].severity).toBe('critical');
      expect(res[0].daysUntilExpiry).toBe(20);
      expect(res[0].unitsAtRisk).toBe(30); // 50 - (1 * 20) = 30
      expect(res[0].costAtRisk).toBe(2400); // 30 * 80
      expect(res[0].actionRecommendation).toContain('URGENT: 30 units will expire');
    });

    it('marks batch as critical EXPIRED if expiryDate has passed', () => {
      const items = [
        {
          productId: 'MED-EXP-001',
          productName: 'Cough Syrup 100ml',
          expiryDate: '2026-10-15',
          stockOnHand: 15,
          dailyVelocity: 2.0,
          unitCost: 45,
          batchNo: 'EXP-1',
        },
      ];

      const res = evaluateExpiryRisk(items, fixedNow);
      expect(res[0].severity).toBe('critical');
      expect(res[0].daysUntilExpiry).toBeLessThanOrEqual(0);
      expect(res[0].unitsAtRisk).toBe(15);
      expect(res[0].actionRecommendation).toContain('EXPIRED: 15 units expired');
    });

    it('returns severity none if stock will sell out safely well before expiry', () => {
      // 20 units in stock, expires in 120 days, velocity 2/day (sells in 10 days)
      const items = [
        {
          productId: 'MED-SAFE-001',
          productName: 'Paracetamol 650mg',
          expiryDate: '2027-02-28',
          stockOnHand: 20,
          dailyVelocity: 2.0,
          unitCost: 15,
        },
      ];

      const res = evaluateExpiryRisk(items, fixedNow);
      expect(res[0].severity).toBe('none');
      expect(res[0].unitsAtRisk).toBe(0);
    });
  });

  // MODULE 2: SIZE CURVE GAP TESTS
  describe('evaluateSizeCurveGap', () => {
    it('detects a broken size curve when central sizes are depleted while fringe sizes sit excess', () => {
      const skus = [
        {
          productId: 'APP-KURTI-M',
          styleId: 'STYLE-KURTI-01',
          styleName: 'Cotton Anarkali Kurti',
          size: 'M',
          stockOnHand: 1, // depleted
          velocity: 1.5,
        },
        {
          productId: 'APP-KURTI-L',
          styleId: 'STYLE-KURTI-01',
          styleName: 'Cotton Anarkali Kurti',
          size: 'L',
          stockOnHand: 2, // depleted (cover < 4 days)
          velocity: 1.2,
        },
        {
          productId: 'APP-KURTI-XXL',
          styleId: 'STYLE-KURTI-01',
          styleName: 'Cotton Anarkali Kurti',
          size: 'XXL',
          stockOnHand: 25, // excess
          velocity: 0.2, // 125 days cover
        },
      ];

      const res = evaluateSizeCurveGap(skus);
      expect(res).toHaveLength(1);
      expect(res[0].isBrokenCurve).toBe(true);
      expect(res[0].depletedSizes).toContain('M');
      expect(res[0].depletedSizes).toContain('L');
      expect(res[0].excessSizes).toContain('XXL');
      expect(res[0].evidenceText).toContain('Broken size curve');
    });

    it('returns isBrokenCurve false when sizes have balanced stock levels', () => {
      const skus = [
        {
          productId: 'SHIRT-M',
          styleId: 'STYLE-SHIRT',
          styleName: 'Linen Shirt',
          size: 'M',
          stockOnHand: 15,
          velocity: 1.0,
        },
        {
          productId: 'SHIRT-L',
          styleId: 'STYLE-SHIRT',
          styleName: 'Linen Shirt',
          size: 'L',
          stockOnHand: 18,
          velocity: 1.2,
        },
      ];

      const res = evaluateSizeCurveGap(skus);
      expect(res[0].isBrokenCurve).toBe(false);
      expect(res[0].depletedSizes).toHaveLength(0);
    });
  });

  // MODULE 3: SPOILAGE RISK TESTS
  describe('evaluateSpoilageRisk', () => {
    const fixedNow = new Date('2026-10-30T00:00:00');

    it('flags critical spoilage risk when perishable item has only 1 day remaining and slow velocity', () => {
      // Received 4 days ago, shelf life 5 days -> 1 day left. Stock 20 kg, sells 5 kg/day -> 15 kg spoiled
      const items = [
        {
          productId: 'PER-TOMATO',
          productName: 'Fresh Country Tomatoes',
          shelfLifeDays: 5,
          receivedDate: '2026-10-26',
          stockOnHand: 20,
          dailyVelocity: 5,
          unitCost: 30,
        },
      ];

      const res = evaluateSpoilageRisk(items, fixedNow);
      expect(res).toHaveLength(1);
      expect(res[0].severity).toBe('critical');
      expect(res[0].daysRemaining).toBe(1);
      expect(res[0].projectedLossUnits).toBe(15);
      expect(res[0].projectedLossValue).toBe(450); // 15 * 30
      expect(res[0].actionRecommendation).toContain('Flash markdown');
    });

    it('returns severity none if perishable items sell out well before shelf life expires', () => {
      // Received 1 day ago, shelf life 6 days -> 5 days left. Stock 10, velocity 4/day -> 0 spoiled
      const items = [
        {
          productId: 'PER-PANEER',
          productName: 'Fresh Malai Paneer 500g',
          shelfLifeDays: 6,
          receivedDate: '2026-10-29',
          stockOnHand: 10,
          dailyVelocity: 4,
          unitCost: 120,
        },
      ];

      const res = evaluateSpoilageRisk(items, fixedNow);
      expect(res[0].severity).toBe('none');
      expect(res[0].projectedLossUnits).toBe(0);
      expect(res[0].projectedLossValue).toBe(0);
    });
  });

  // MODULE 4: FOOD COST % TESTS
  describe('calculateFoodCostPct', () => {
    it('calculates optimal food cost % when within target benchmark', () => {
      const res = calculateFoodCostPct(60000, 200000, 30);
      expect(res.foodCostPct).toBe(30);
      expect(res.varianceFromTargetPct).toBe(0);
      expect(res.status).toBe('optimal');
    });

    it('flags critical alert when food cost % exceeds 36% indicating portioning or wastage', () => {
      const res = calculateFoodCostPct(95000, 240000, 30); // 39.6%
      expect(res.foodCostPct).toBe(39.6);
      expect(res.varianceFromTargetPct).toBe(9.6);
      expect(res.status).toBe('critical');
      expect(res.actionRecommendation).toContain('Check recipe portion sizes');
    });
  });

  // MODULE 5: CREDIT EXPOSURE TESTS
  describe('evaluateCreditExposure', () => {
    it('flags limit-breached retail customers and overdue 60-day receivables', () => {
      const debtors = [
        {
          customerId: 'CUST-01',
          customerName: 'Sri Sai Provision Store',
          outstandingAmount: 75000,
          daysOverdue: 65,
          creditLimit: 50000, // breached by 25,000
        },
        {
          customerId: 'CUST-02',
          customerName: 'Balaji Supermart',
          outstandingAmount: 30000,
          daysOverdue: 20,
          creditLimit: 40000,
        },
      ];

      const res = evaluateCreditExposure(debtors);
      expect(res.totalOutstanding).toBe(105000);
      expect(res.overdue60DaysAmount).toBe(75000);
      expect(res.limitBreachedCount).toBe(1);
      expect(res.breachedCustomers[0].customerName).toBe('Sri Sai Provision Store');
      expect(res.breachedCustomers[0].excessAmount).toBe(25000);
      expect(res.actionRecommendation).toContain('Freeze new delivery dispatch');
    });

    it('reports optimal receivables when all accounts are within 30 days', () => {
      const debtors = [
        {
          customerId: 'CUST-03',
          customerName: 'Kaveri Mart',
          outstandingAmount: 20000,
          daysOverdue: 15,
          creditLimit: 30000,
        },
      ];

      const res = evaluateCreditExposure(debtors);
      expect(res.overdue30DaysAmount).toBe(0);
      expect(res.limitBreachedCount).toBe(0);
      expect(res.actionRecommendation).toContain('within normal 30-day');
    });
  });

  // MODULE 6: INDIAN FESTIVAL SEASONALITY TESTS
  describe('getFestivalMultiplier & applySeasonalityToForecast', () => {
    it('applies Diwali festive surge (+45%) to retail categories in late October / November', () => {
      const diwaliDate = '2026-10-28';
      const kiranaRes = getFestivalMultiplier('kirana', diwaliDate);
      expect(kiranaRes.multiplier).toBe(1.45);
      expect(kiranaRes.festivalName).toContain('Diwali');
    });

    it('applies school reopening surge (+80%) to stationery in June', () => {
      const juneDate = '2026-06-10';
      const stationeryRes = getFestivalMultiplier('stationery', juneDate);
      expect(stationeryRes.multiplier).toBe(1.8);
      expect(stationeryRes.festivalName).toContain('School & College Reopening');
    });

    it('returns multiplier 1.0 for dates without active festival season', () => {
      const normalDate = '2026-02-15';
      const res = getFestivalMultiplier('kirana', normalDate);
      expect(res.multiplier).toBe(1.0);
    });

    it('scales forecast points cleanly using applySeasonalityToForecast without altering original array', () => {
      const initialForecast = [
        { date: '2026-10-28', predictedUnits: 10, lowerConfidence: 8, upperConfidence: 12 },
        { date: '2026-02-15', predictedUnits: 10, lowerConfidence: 8, upperConfidence: 12 },
      ];

      const adjusted = applySeasonalityToForecast(initialForecast, 'kirana');
      // Diwali date (10-28) scaled by 1.45 -> 14.5 units
      expect(adjusted[0].predictedUnits).toBe(14.5);
      // Non-festival date (02-15) remains 10
      expect(adjusted[1].predictedUnits).toBe(10);
      // Original untouched
      expect(initialForecast[0].predictedUnits).toBe(10);
    });
  });
});
