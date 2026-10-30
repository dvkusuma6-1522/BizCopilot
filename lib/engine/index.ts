/**
 * BizCopilot Pure Calculation Engine
 * FACTS FIRST: All numbers come from deterministic code.
 */

export interface DailySalesPoint {
  date: string;
  unitsSold: number;
}

export interface ProductInventoryState {
  productId: string;
  productName: string;
  category?: string;
  stockOnHand: number;
  reorderLevel?: number;
  supplierLeadDays?: number;
  unitCost?: number;
  unitPrice: number;
}

export interface SalesPeriodComparison {
  productId: string;
  productName: string;
  currentUnits: number;
  previousUnits: number;
  changePct: number;
  isDrop: boolean;
  severity: 'none' | 'warning' | 'critical';
  evidenceText: string;
}

export interface StockoutEvaluation {
  productId: string;
  velocity: number; // avg daily units over analysis window
  daysOfCover: number;
  supplierLeadDays: number;
  leadTimeAssumed: boolean;
  status: 'critical' | 'warning' | 'healthy';
  friendlyText: string;
  reorderQuantity: number;
  safetyStock: number;
  reorderPoint: number;
}

export interface DeadStockEvaluation {
  productId: string;
  isDeadStock: boolean;
  unitsSold: number;
  stockOnHand: number;
  costValue: number;
  isCostEstimated: boolean;
  retailValue: number;
  friendlyText: string;
}

export interface ABCClassification {
  productId: string;
  revenue: number;
  cumulativePct: number;
  abcClass: 'A' | 'B' | 'C';
  description: string;
}

export interface ForecastPoint {
  date: string;
  predictedUnits: number;
  lowerConfidence?: number;
  upperConfidence?: number;
}

export interface StockDepletionDay {
  dayIndex: number;
  date: string;
  projectedStock: number;
  isStockout: boolean;
  isDeliveryDay: boolean;
}

export interface StockDepletionProjection {
  daysUntilStockout: number | null; // null if stock never exhausts within forecast window
  daysWithoutStock: number; // count of days in window with 0 stock
  depletionCurve: StockDepletionDay[];
  confidence: 'high' | 'low';
}

// 1. VELOCITY & DAYS OF COVER
export function calculateVelocity(
  dailySales: DailySalesPoint[],
  daysCount: number = 14
): number {
  if (!dailySales || dailySales.length === 0) return 0;
  const totalUnits = dailySales.reduce((sum, d) => sum + (d.unitsSold || 0), 0);
  return Number((totalUnits / Math.max(1, daysCount)).toFixed(2));
}

export function calculateDaysOfCover(stockOnHand: number, velocity: number): number {
  if (velocity <= 0) return stockOnHand > 0 ? 999 : 0;
  return Number((stockOnHand / velocity).toFixed(1));
}

// 2. REORDER QUANTITY
// reorder quantity = max(0, ceil(velocity * (lead_days + buffer_days) - stock_on_hand))
// Acceptance check: velocity 3.8, stock 10, lead 5, buffer 7 -> ceil(3.8 * (5+7) - 10) = ceil(45.6 - 10) = 36
export function calculateReorderQuantity(
  velocity: number,
  stockOnHand: number,
  leadDays: number = 3,
  bufferDays: number = 7
): number {
  if (velocity <= 0) return 0;
  const targetUnits = velocity * (leadDays + bufferDays);
  return Math.max(0, Math.ceil(targetUnits - stockOnHand));
}

// 3. STOCKOUT STATUS EVALUATION
export function evaluateStockout(
  stockOnHand: number,
  velocity: number,
  supplierLeadDays?: number,
  dailySalesHistory: number[] = []
): StockoutEvaluation {
  const leadTimeAssumed = supplierLeadDays === undefined || supplierLeadDays === null || supplierLeadDays <= 0;
  const effectiveLead = leadTimeAssumed ? 3 : supplierLeadDays;
  const daysOfCover = calculateDaysOfCover(stockOnHand, velocity);

  let status: 'critical' | 'warning' | 'healthy' = 'healthy';
  let friendlyText = `About ${daysOfCover} days of stock left. Stock is healthy.`;

  if (velocity > 0) {
    if (daysOfCover < effectiveLead) {
      status = 'critical';
      friendlyText = `Oil/stock may run out before delivery! About ${daysOfCover} days left, but delivery takes ${effectiveLead} days.`;
    } else if (daysOfCover < effectiveLead + 3) {
      status = 'warning';
      friendlyText = `Stock is getting low (about ${daysOfCover} days left, delivery takes ${effectiveLead} days). Plan reorder.`;
    }
  }

  const reorderQuantity = calculateReorderQuantity(velocity, stockOnHand, effectiveLead, 7);
  const safety = calculateSafetyStock(dailySalesHistory, effectiveLead);
  const reorderPoint = Math.ceil(velocity * effectiveLead + safety);

  return {
    productId: '',
    velocity,
    daysOfCover,
    supplierLeadDays: effectiveLead,
    leadTimeAssumed,
    status,
    friendlyText,
    reorderQuantity,
    safetyStock: safety,
    reorderPoint,
  };
}

// 4. SALES DROP DETECTION
export function evaluateSalesDrop(
  productId: string,
  productName: string,
  currentUnits: number,
  previousUnits: number
): SalesPeriodComparison {
  let changePct = 0;
  if (previousUnits > 0) {
    changePct = Number((((currentUnits - previousUnits) / previousUnits) * 100).toFixed(1));
  } else if (currentUnits > 0) {
    changePct = 100;
  }

  // Flag if down 20% or more; severity Critical at 35% or more
  const isDrop = changePct <= -20 && previousUnits > 15;
  const severity: 'none' | 'warning' | 'critical' =
    changePct <= -35 && previousUnits > 15
      ? 'critical'
      : isDrop
      ? 'warning'
      : 'none';

  const evidenceText = `Sold ${currentUnits} units vs ${previousUnits} in previous period (${changePct > 0 ? '+' : ''}${changePct}%)`;

  return {
    productId,
    productName,
    currentUnits,
    previousUnits,
    changePct,
    isDrop,
    severity,
    evidenceText,
  };
}

// 5. DEAD STOCK EVALUATION
export function evaluateDeadStock(
  productId: string,
  stockOnHand: number,
  unitsSold30d: number,
  unitCost?: number,
  unitPrice: number = 0,
  thresholdUnits: number = 4 // under 1 unit/week over 30d
): DeadStockEvaluation {
  const isDeadStock = stockOnHand > 10 && unitsSold30d <= thresholdUnits;
  const isCostEstimated = unitCost === undefined || unitCost === null || unitCost <= 0;
  const effectiveCost = !isCostEstimated ? unitCost! : unitPrice * 0.7;
  const costValue = isDeadStock ? Math.round(stockOnHand * effectiveCost) : 0;
  const retailValue = isDeadStock ? Math.round(stockOnHand * unitPrice) : 0;

  const friendlyText = isDeadStock
    ? `Rs ${costValue.toLocaleString('en-IN')} locked in ${stockOnHand} unsold units (${unitsSold30d} sold in 30 days).`
    : 'Inventory velocity is normal.';

  return {
    productId,
    isDeadStock,
    unitsSold: unitsSold30d,
    stockOnHand,
    costValue,
    isCostEstimated,
    retailValue,
    friendlyText,
  };
}

// 6. ABC REVENUE CLASSIFICATION
export function calculateABCAnalysis(
  products: { productId: string; revenue: number }[]
): ABCClassification[] {
  const sorted = [...products].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = sorted.reduce((sum, p) => sum + p.revenue, 0);

  let cumulativeRevenue = 0;
  return sorted.map((p, idx) => {
    cumulativeRevenue += p.revenue;
    const cumulativePct = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) * 100 : 100;

    let abcClass: 'A' | 'B' | 'C' = 'C';
    let description = 'Class C: Lower revenue contributor. Keep lean stock.';

    // A = top 70%, B = next 20%, C = rest
    if (cumulativePct <= 70 || idx === 0) {
      abcClass = 'A';
      description = 'Class A: Top ~70% earner (vital revenue driver). Never run out.';
    } else if (cumulativePct <= 90) {
      abcClass = 'B';
      description = 'Class B: Middle ~20% earner (steady core seller).';
    }

    return {
      productId: p.productId,
      revenue: p.revenue,
      cumulativePct: Number(cumulativePct.toFixed(1)),
      abcClass,
      description,
    };
  });
}

// 7. SAFETY STOCK & REORDER POINT
// Safety stock = z(1.65 for 95% service level) * std_dev(daily_demand) * sqrt(lead_time)
export function calculateSafetyStock(dailySalesHistory: number[], leadDays: number): number {
  if (!dailySalesHistory || dailySalesHistory.length < 2) return Math.ceil(1.65 * 1 * Math.sqrt(leadDays));

  const mean = dailySalesHistory.reduce((a, b) => a + b, 0) / dailySalesHistory.length;
  const variance =
    dailySalesHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    (dailySalesHistory.length - 1);
  const stdDev = Math.sqrt(variance);

  return Math.ceil(1.65 * stdDev * Math.sqrt(Math.max(1, leadDays)));
}

// 8. DAY-OF-WEEK SEASONALITY FORECAST (Holt-Winters / Exponential Smoothing)
// 14 to 28 days projection with moving average fallback if < 21 days
export function generateDemandForecast(
  history: DailySalesPoint[],
  forecastDays: number = 14
): { forecast: ForecastPoint[]; confidence: 'high' | 'low' } {
  if (!history || history.length === 0) {
    return { forecast: [], confidence: 'low' };
  }

  const confidence: 'high' | 'low' = history.length >= 21 ? 'high' : 'low';

  // Calculate day-of-week seasonal multipliers (0=Sun, 1=Mon, ..., 6=Sat)
  const daySums = [0, 0, 0, 0, 0, 0, 0];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  const overallMean = history.reduce((sum, h) => sum + h.unitsSold, 0) / history.length;

  for (const h of history) {
    const d = new Date(h.date + 'T00:00:00');
    const day = d.getDay();
    daySums[day] += h.unitsSold;
    dayCounts[day] += 1;
  }

  const seasonalMultipliers = daySums.map((sum, i) => {
    if (dayCounts[i] === 0 || overallMean === 0) return 1.0;
    const avgForDay = sum / dayCounts[i];
    return Number((avgForDay / overallMean).toFixed(2));
  });

  // Recent baseline: exponentially smoothed or 14-day weighted moving average
  let baseline = overallMean;
  const alpha = 0.25;
  for (const h of history) {
    baseline = alpha * h.unitsSold + (1 - alpha) * baseline;
  }

  const lastDate = new Date(history[history.length - 1].date + 'T00:00:00');
  const forecast: ForecastPoint[] = [];

  for (let i = 1; i <= forecastDays; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);

    const dayOfWeek = nextDate.getDay();
    const multiplier = confidence === 'high' ? seasonalMultipliers[dayOfWeek] : 1.0;
    const predicted = Number(Math.max(0, baseline * multiplier).toFixed(1));

    const dateStr = nextDate.toISOString().slice(0, 10);
    forecast.push({
      date: dateStr,
      predictedUnits: predicted,
      lowerConfidence: Number(Math.max(0, predicted * 0.8).toFixed(1)),
      upperConfidence: Number((predicted * 1.25).toFixed(1)),
    });
  }

  return { forecast, confidence };
}

// 9. STOCK DEPLETION PROJECTION & WHAT-IF SIMULATOR
export function projectStockDepletion(
  initialStock: number,
  forecast: ForecastPoint[],
  leadDays: number,
  simulatedOrderQty: number = 0
): StockDepletionProjection {
  let currentStock = initialStock;
  let daysUntilStockout: number | null = null;
  let daysWithoutStock = 0;
  const curve: StockDepletionDay[] = [];

  forecast.forEach((point, idx) => {
    const dayIndex = idx + 1;
    const isDeliveryDay = dayIndex === leadDays && simulatedOrderQty > 0;

    if (isDeliveryDay) {
      currentStock += simulatedOrderQty;
    }

    currentStock = Math.max(0, Number((currentStock - point.predictedUnits).toFixed(1)));

    const isStockout = currentStock <= 0;
    if (isStockout) {
      daysWithoutStock += 1;
      if (daysUntilStockout === null) {
        daysUntilStockout = dayIndex;
      }
    }

    curve.push({
      dayIndex,
      date: point.date,
      projectedStock: currentStock,
      isStockout,
      isDeliveryDay,
    });
  });

  return {
    daysUntilStockout,
    daysWithoutStock,
    depletionCurve: curve,
    confidence: forecast.length >= 21 ? 'high' : 'low',
  };
}

// 10. ANOMALY DETECTION (Z-Score on residuals)
export function detectDemandAnomalies(
  dailySales: DailySalesPoint[]
): { date: string; unitsSold: number; isAnomaly: boolean; zScore: number }[] {
  if (!dailySales || dailySales.length < 7) {
    return dailySales.map((d) => ({ ...d, isAnomaly: false, zScore: 0 }));
  }

  const values = dailySales.map((d) => d.unitsSold);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev =
    Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length) || 1;

  return dailySales.map((d) => {
    const zScore = Number(((d.unitsSold - mean) / stdDev).toFixed(2));
    // Suppress typical weekend surge from being flagged as anomalous
    const isAnomaly = zScore <= -1.8; // Significant drop anomaly
    return {
      date: d.date,
      unitsSold: d.unitsSold,
      isAnomaly,
      zScore,
    };
  });
}
