/**
 * BizCopilot Category-Aware Pure Calculation Engine Extensions
 * FACTS FIRST: Pure functions extending the core engine without modifying baseline math.
 */

import { ForecastPoint } from './index';

// 1. EXPIRY RISK MODULE (Pharmacy, Consumables, Packaged Goods)
export interface ExpiryRiskItem {
  productId: string;
  productName: string;
  expiryDate: string; // YYYY-MM-DD
  stockOnHand: number;
  dailyVelocity: number;
  unitCost: number;
  batchNo?: string;
}

export interface ExpiryEvaluation {
  productId: string;
  productName: string;
  batchNo?: string;
  daysUntilExpiry: number;
  projectedSalesUntilExpiry: number;
  unitsAtRisk: number;
  costAtRisk: number;
  severity: 'none' | 'warning' | 'critical';
  evidenceText: string;
  actionRecommendation: string;
}

export function evaluateExpiryRisk(
  items: ExpiryRiskItem[],
  now: Date = new Date()
): ExpiryEvaluation[] {
  return items.map((item) => {
    const expDate = new Date(item.expiryDate + 'T00:00:00');
    const diffTime = expDate.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const effectiveVelocity = Math.max(0, item.dailyVelocity);
    const projectedSales =
      daysUntilExpiry > 0 ? Number((effectiveVelocity * daysUntilExpiry).toFixed(1)) : 0;
    const unitsAtRisk =
      daysUntilExpiry <= 0
        ? item.stockOnHand
        : Math.max(0, Math.ceil(item.stockOnHand - projectedSales));
    const costAtRisk = Math.round(unitsAtRisk * item.unitCost);

    let severity: 'none' | 'warning' | 'critical' = 'none';
    let actionRecommendation = 'Stock is selling at healthy pace before expiry.';

    if (daysUntilExpiry <= 0) {
      severity = 'critical';
      actionRecommendation = `EXPIRED: ${item.stockOnHand} units expired. Remove from shelves immediately and return to stockist.`;
    } else if (daysUntilExpiry <= 30 && unitsAtRisk > 0) {
      severity = 'critical';
      actionRecommendation = `URGENT: ${unitsAtRisk} units will expire in ${daysUntilExpiry} days. Return to stockist or offer fast clearance.`;
    } else if (daysUntilExpiry <= 90 && unitsAtRisk > 0) {
      severity = 'warning';
      actionRecommendation = `WATCH: ${unitsAtRisk} units may expire unsold in ${daysUntilExpiry} days. Prioritize dispensing this batch first.`;
    }

    const evidenceText =
      daysUntilExpiry <= 0
        ? `Batch expired ${Math.abs(daysUntilExpiry)} days ago. ${item.stockOnHand} units unsold.`
        : `${unitsAtRisk} of ${item.stockOnHand} units at risk (${daysUntilExpiry}d left, sales rate ~${item.dailyVelocity}/day).`;

    return {
      productId: item.productId,
      productName: item.productName,
      batchNo: item.batchNo,
      daysUntilExpiry,
      projectedSalesUntilExpiry: projectedSales,
      unitsAtRisk,
      costAtRisk,
      severity,
      evidenceText,
      actionRecommendation,
    };
  });
}

// 2. SIZE CURVE GAP MODULE (Apparel, Footwear, Saree & Garments)
export interface ApparelSKU {
  productId: string;
  styleId: string;
  styleName: string;
  size: string; // e.g. 'M', 'L', 'XL', '40', '42'
  stockOnHand: number;
  velocity: number;
}

export interface SizeCurveGapEvaluation {
  styleId: string;
  styleName: string;
  isBrokenCurve: boolean;
  depletedSizes: string[];
  excessSizes: string[];
  evidenceText: string;
  recommendation: string;
}

export function evaluateSizeCurveGap(skus: ApparelSKU[]): SizeCurveGapEvaluation[] {
  // Group SKUs by styleId
  const stylesMap = new Map<string, ApparelSKU[]>();
  for (const sku of skus) {
    const list = stylesMap.get(sku.styleId) || [];
    list.push(sku);
    stylesMap.set(sku.styleId, list);
  }

  const results: SizeCurveGapEvaluation[] = [];

  stylesMap.forEach((styleSkus, styleId) => {
    const styleName = styleSkus[0]?.styleName || styleId;
    const depletedSizes: string[] = [];
    const excessSizes: string[] = [];

    for (const sku of styleSkus) {
      const coverDays =
        sku.velocity > 0 ? sku.stockOnHand / sku.velocity : sku.stockOnHand > 0 ? 999 : 0;
      if (sku.stockOnHand <= 2 || coverDays < 4) {
        depletedSizes.push(sku.size);
      } else if (coverDays > 30 || (sku.velocity === 0 && sku.stockOnHand > 8)) {
        excessSizes.push(sku.size);
      }
    }

    const isBrokenCurve = depletedSizes.length > 0 && excessSizes.length > 0;
    let evidenceText = 'Balanced size curve across sizes.';
    let recommendation = 'Maintain standard replenishment.';

    if (isBrokenCurve) {
      evidenceText = `Broken size curve: fast sizes [${depletedSizes.join(', ')}] running out while sizes [${excessSizes.join(', ')}] sit with excess stock.`;
      recommendation = `Restock only sizes [${depletedSizes.join(', ')}]. Avoid full-box assortments to prevent fringe size pileup.`;
    } else if (depletedSizes.length > 0) {
      evidenceText = `Sizes [${depletedSizes.join(', ')}] critically low on shelf.`;
      recommendation = `Reorder replenishment for depleted sizes [${depletedSizes.join(', ')}].`;
    }

    results.push({
      styleId,
      styleName,
      isBrokenCurve,
      depletedSizes,
      excessSizes,
      evidenceText,
      recommendation,
    });
  });

  return results;
}

// 3. SPOILAGE RISK MODULE (Perishables, Fruit-Veg, Dairy, Meat, Cafe Ingredients)
export interface PerishableItem {
  productId: string;
  productName: string;
  shelfLifeDays: number;
  receivedDate: string; // YYYY-MM-DD
  stockOnHand: number;
  dailyVelocity: number;
  unitCost: number;
}

export interface SpoilageEvaluation {
  productId: string;
  productName: string;
  daysRemaining: number;
  projectedLossUnits: number;
  projectedLossValue: number;
  severity: 'none' | 'warning' | 'critical';
  evidenceText: string;
  actionRecommendation: string;
}

export function evaluateSpoilageRisk(
  items: PerishableItem[],
  now: Date = new Date()
): SpoilageEvaluation[] {
  return items.map((item) => {
    const recDate = new Date(item.receivedDate + 'T00:00:00');
    const elapsedDays = Math.max(0, Math.floor((now.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, item.shelfLifeDays - elapsedDays);

    const projectedSales = Number((Math.max(0, item.dailyVelocity) * daysRemaining).toFixed(1));
    const projectedLossUnits =
      daysRemaining === 0
        ? item.stockOnHand
        : Math.max(0, Math.ceil(item.stockOnHand - projectedSales));
    const projectedLossValue = Math.round(projectedLossUnits * item.unitCost);

    let severity: 'none' | 'warning' | 'critical' = 'none';
    let actionRecommendation = 'Stock will sell before shelf life ends.';

    if (daysRemaining <= 1 && projectedLossUnits > 0) {
      severity = 'critical';
      actionRecommendation = `TODAY: ${projectedLossUnits} units risk spoiling tomorrow. Flash markdown 30% or prep immediately.`;
    } else if (daysRemaining <= 3 && projectedLossUnits > 0) {
      severity = 'warning';
      actionRecommendation = `WATCH: ${projectedLossUnits} units will exceed shelf life in ~${daysRemaining} days. Bundle or move to front display.`;
    }

    const evidenceText =
      daysRemaining === 0
        ? `Shelf life exceeded. ${item.stockOnHand} units past freshness window.`
        : `${daysRemaining} days left of ${item.shelfLifeDays}d shelf life. Projected unsold: ${projectedLossUnits} units (₹${projectedLossValue}).`;

    return {
      productId: item.productId,
      productName: item.productName,
      daysRemaining,
      projectedLossUnits,
      projectedLossValue,
      severity,
      evidenceText,
      actionRecommendation,
    };
  });
}

// 4. FOOD COST % MODULE (Restaurants, Cafes, Bakeries, Cloud Kitchens)
export interface FoodCostEvaluation {
  costOfIngredients: number;
  foodRevenue: number;
  foodCostPct: number;
  varianceFromTargetPct: number;
  status: 'optimal' | 'warning' | 'critical';
  evidenceText: string;
  actionRecommendation: string;
}

export function calculateFoodCostPct(
  costOfIngredients: number,
  foodRevenue: number,
  targetPct: number = 30
): FoodCostEvaluation {
  if (foodRevenue <= 0) {
    return {
      costOfIngredients,
      foodRevenue: 0,
      foodCostPct: 0,
      varianceFromTargetPct: 0,
      status: 'optimal',
      evidenceText: 'No food sales recorded in this period.',
      actionRecommendation: 'Log sales data to evaluate food cost ratio.',
    };
  }

  const foodCostPct = Number(((costOfIngredients / foodRevenue) * 100).toFixed(1));
  const varianceFromTargetPct = Number((foodCostPct - targetPct).toFixed(1));

  let status: 'optimal' | 'warning' | 'critical' = 'optimal';
  let actionRecommendation = `Food cost ratio at healthy ${foodCostPct}% (within ${targetPct}% benchmark).`;

  if (foodCostPct > 36) {
    status = 'critical';
    actionRecommendation = `Food cost high at ${foodCostPct}% (+${varianceFromTargetPct}% above target). Check recipe portion sizes and kitchen wastage.`;
  } else if (foodCostPct > 32) {
    status = 'warning';
    actionRecommendation = `Food cost slightly elevated at ${foodCostPct}%. Review supplier dairy/oil price increases or portion drift.`;
  }

  const evidenceText = `Ingredient cost ₹${costOfIngredients.toLocaleString('en-IN')} on ₹${foodRevenue.toLocaleString('en-IN')} food revenue = ${foodCostPct}%.`;

  return {
    costOfIngredients,
    foodRevenue,
    foodCostPct,
    varianceFromTargetPct,
    status,
    evidenceText,
    actionRecommendation,
  };
}

// 5. CREDIT EXPOSURE MODULE (Distributors, Wholesalers, FMCG Stockists)
export interface DebtorRecord {
  customerId: string;
  customerName: string;
  outstandingAmount: number;
  daysOverdue: number;
  creditLimit: number;
}

export interface CreditExposureEvaluation {
  totalOutstanding: number;
  overdue30DaysAmount: number;
  overdue60DaysAmount: number;
  limitBreachedCount: number;
  breachedCustomers: { customerName: string; excessAmount: number }[];
  evidenceText: string;
  actionRecommendation: string;
}

export function evaluateCreditExposure(debtors: DebtorRecord[]): CreditExposureEvaluation {
  const totalOutstanding = debtors.reduce((sum, d) => sum + d.outstandingAmount, 0);
  const overdue30DaysAmount = debtors
    .filter((d) => d.daysOverdue > 30)
    .reduce((sum, d) => sum + d.outstandingAmount, 0);
  const overdue60DaysAmount = debtors
    .filter((d) => d.daysOverdue > 60)
    .reduce((sum, d) => sum + d.outstandingAmount, 0);

  const breachedCustomers: { customerName: string; excessAmount: number }[] = [];
  for (const d of debtors) {
    if (d.outstandingAmount > d.creditLimit && d.creditLimit > 0) {
      breachedCustomers.push({
        customerName: d.customerName,
        excessAmount: d.outstandingAmount - d.creditLimit,
      });
    }
  }

  let evidenceText = `Total market receivables: ₹${totalOutstanding.toLocaleString('en-IN')}.`;
  let actionRecommendation = 'Receivables are within normal 30-day payment cycles.';

  if (overdue60DaysAmount > 0 || breachedCustomers.length > 0) {
    evidenceText = `₹${overdue60DaysAmount.toLocaleString('en-IN')} overdue >60 days; ${breachedCustomers.length} retail accounts exceeded credit limit.`;
    actionRecommendation = 'Freeze new delivery dispatch for credit-breached retailers until overdue dues are paid.';
  } else if (overdue30DaysAmount > 0) {
    evidenceText = `₹${overdue30DaysAmount.toLocaleString('en-IN')} overdue >30 days across accounts.`;
    actionRecommendation = 'Send automated WhatsApp payment reminders to accounts past 30 days.';
  }

  return {
    totalOutstanding,
    overdue30DaysAmount,
    overdue60DaysAmount,
    limitBreachedCount: breachedCustomers.length,
    breachedCustomers,
    evidenceText,
    actionRecommendation,
  };
}

// 6. INDIAN FESTIVAL & SEASONALITY MULTIPLIERS
export interface SeasonalityEvent {
  id: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  multiplier: number;
  applicableCategories: string[]; // empty for all
  rationale: string;
}

export const INDIAN_SEASONALITY_EVENTS: SeasonalityEvent[] = [
  {
    id: 'diwali',
    name: 'Diwali Festive Season',
    startMonth: 10,
    startDay: 15,
    endMonth: 11,
    endDay: 15,
    multiplier: 1.45,
    applicableCategories: ['kirana', 'apparel', 'electronics', 'stationery', 'distributor', 'salon'],
    rationale: 'Major nationwide surge in gifting, ethnic wear, sweets, and consumer goods.',
  },
  {
    id: 'ugadi',
    name: 'Ugadi & New Year',
    startMonth: 3,
    startDay: 20,
    endMonth: 4,
    endDay: 10,
    multiplier: 1.3,
    applicableCategories: ['kirana', 'apparel', 'perishables', 'restaurant'],
    rationale: 'Karnataka traditional new year: surge in festive cooking ingredients, flowers, and festive silks.',
  },
  {
    id: 'school_reopen',
    name: 'School & College Reopening',
    startMonth: 5,
    startDay: 20,
    endMonth: 6,
    endDay: 30,
    multiplier: 1.8,
    applicableCategories: ['stationery', 'apparel'],
    rationale: 'Annual school reopening rush for notebooks, stationery kits, bags, and uniforms.',
  },
  {
    id: 'monsoon_health',
    name: 'Monsoon Seasonal Health Surge',
    startMonth: 6,
    startDay: 1,
    endMonth: 8,
    endDay: 31,
    multiplier: 1.35,
    applicableCategories: ['pharmacy', 'hardware'],
    rationale: 'Monsoon viral fever, dengue/malaria medications, plus waterproofing and plumbing materials.',
  },
  {
    id: 'wedding_season',
    name: 'Winter Wedding Season',
    startMonth: 11,
    startDay: 15,
    endMonth: 1,
    endDay: 31,
    multiplier: 1.4,
    applicableCategories: ['apparel', 'salon', 'restaurant'],
    rationale: 'Peak wedding dates: bridal wear, grooming services, and event catering.',
  },
];

export function getFestivalMultiplier(
  categoryId: string,
  dateStr: string
): { multiplier: number; festivalName?: string; rationale?: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  for (const event of INDIAN_SEASONALITY_EVENTS) {
    if (
      event.applicableCategories.length === 0 ||
      event.applicableCategories.includes(categoryId)
    ) {
      let matches = false;
      if (event.startMonth <= event.endMonth) {
        if (
          (month > event.startMonth || (month === event.startMonth && day >= event.startDay)) &&
          (month < event.endMonth || (month === event.endMonth && day <= event.endDay))
        ) {
          matches = true;
        }
      } else {
        // Crosses year boundary (e.g. Nov to Jan)
        if (
          month > event.startMonth ||
          (month === event.startMonth && day >= event.startDay) ||
          month < event.endMonth ||
          (month === event.endMonth && day <= event.endDay)
        ) {
          matches = true;
        }
      }

      if (matches) {
        return {
          multiplier: event.multiplier,
          festivalName: event.name,
          rationale: event.rationale,
        };
      }
    }
  }

  return { multiplier: 1.0 };
}

/**
 * Apply festival seasonality cleanly on top of an existing Holt-Winters forecast without mutating baseline math
 */
export function applySeasonalityToForecast(
  forecast: ForecastPoint[],
  categoryId: string
): ForecastPoint[] {
  return forecast.map((pt) => {
    const { multiplier } = getFestivalMultiplier(categoryId, pt.date);
    if (multiplier === 1.0) return pt;

    const adjusted = Number((pt.predictedUnits * multiplier).toFixed(1));
    return {
      date: pt.date,
      predictedUnits: adjusted,
      lowerConfidence: pt.lowerConfidence
        ? Number((pt.lowerConfidence * multiplier).toFixed(1))
        : undefined,
      upperConfidence: pt.upperConfidence
        ? Number((pt.upperConfidence * multiplier).toFixed(1))
        : undefined,
    };
  });
}
