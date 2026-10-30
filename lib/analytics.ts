import {
  CalculatedInventoryItem,
  DailySalesTrend,
  InventoryItem,
  PeriodSummary,
  ProductPerformance,
  SalesRecord,
} from './types';

// Format Indian Rupee currency nicely
export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

// Format standard numbers with commas
export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
}

// Get sorted unique dates from sales records
export function getSortedSalesDates(sales: SalesRecord[]): string[] {
  const dates = Array.from(new Set(sales.map((s) => s.date)));
  return dates.sort();
}

// Filter sales records for the last N days
export function filterSalesByPeriod(
  sales: SalesRecord[],
  periodDays: number,
  offsetDays: number = 0
): { filtered: SalesRecord[]; startDate: string; endDate: string } {
  const allDates = getSortedSalesDates(sales);
  if (allDates.length === 0) {
    return { filtered: [], startDate: '', endDate: '' };
  }

  const endIdx = allDates.length - 1 - offsetDays;
  const startIdx = Math.max(0, endIdx - periodDays + 1);

  if (endIdx < 0 || startIdx > endIdx) {
    return { filtered: [], startDate: '', endDate: '' };
  }

  const targetDates = new Set(allDates.slice(startIdx, endIdx + 1));
  const filtered = sales.filter((s) => targetDates.has(s.date));

  return {
    filtered,
    startDate: allDates[startIdx],
    endDate: allDates[endIdx],
  };
}

// Calculate comprehensive inventory metrics using current sales demand
export function calculateInventoryMetrics(
  inventory: InventoryItem[],
  sales: SalesRecord[],
  periodDays: number = 14
): CalculatedInventoryItem[] {
  const { filtered } = filterSalesByPeriod(sales, periodDays);

  // Group units sold by product in this period
  const unitsSoldMap = new Map<string, number>();
  for (const s of filtered) {
    const current = unitsSoldMap.get(s.productId) || 0;
    unitsSoldMap.set(s.productId, current + (s.unitsSold || 0));
  }

  return inventory.map((item) => {
    const unitsSoldInPeriod = unitsSoldMap.get(item.productId) || 0;
    const avgDailySales = Number((unitsSoldInPeriod / Math.max(1, periodDays)).toFixed(1));

    let daysOfCover = 0;
    if (avgDailySales > 0) {
      daysOfCover = Number((item.stockOnHand / avgDailySales).toFixed(1));
    } else {
      daysOfCover = item.stockOnHand > 0 ? 999 : 0;
    }

    // Dead stock evaluation: less than or equal to 2 units sold over at least 14 days (or 0 over 7 days)
    const isDeadStock =
      (periodDays >= 14 ? unitsSoldInPeriod <= 2 : unitsSoldInPeriod === 0) &&
      item.stockOnHand > 15;

    const deadStockValue = isDeadStock ? Math.round(item.stockOnHand * item.unitCost) : 0;

    // Stockout risk: days of cover is strictly less than supplier lead days
    const isStockoutRisk = avgDailySales > 0 && daysOfCover < item.supplierLeadDays;

    // Overstocked: more than 45 days of stock and more than 2x reorder level
    const isOverstocked =
      avgDailySales > 0 && daysOfCover > 45 && item.stockOnHand > item.reorderLevel * 2;

    // Determine status
    let status: 'critical' | 'warning' | 'healthy' = 'healthy';
    let statusReason = 'Stock levels are balanced relative to customer demand.';
    let suggestedAction = 'Maintain standard monitoring and scheduled restocking.';

    // Recommended reorder quantity: target 10-14 days cover
    const targetBufferDays = item.supplierLeadDays + 7;
    const recommendedReorderQty = Math.max(
      0,
      Math.ceil(avgDailySales * targetBufferDays - item.stockOnHand)
    );

    if (isStockoutRisk) {
      status = 'critical';
      statusReason = `Stock cover is only ${daysOfCover} days, but supplier delivery takes ${item.supplierLeadDays} days. High risk of empty shelf!`;
      suggestedAction = `Place urgent supplier order for ${recommendedReorderQty || item.reorderLevel} units today.`;
    } else if (isDeadStock) {
      status = 'critical';
      statusReason = `Only ${unitsSoldInPeriod} unit(s) sold in ${periodDays} days. ${item.stockOnHand} units tied up in capital (${formatINR(
        deadStockValue
      )}).`;
      suggestedAction = 'Pause future reorders, create a bundle deal or markdown by 15-20%.';
    } else if (daysOfCover <= item.supplierLeadDays * 1.5 || item.stockOnHand <= item.reorderLevel) {
      status = 'warning';
      statusReason = `Stock on hand (${item.stockOnHand}) is approaching reorder threshold (${item.reorderLevel}).`;
      suggestedAction = `Prepare replenishment order for ${recommendedReorderQty || item.reorderLevel} units before next cycle.`;
    } else if (isOverstocked) {
      status = 'warning';
      statusReason = `High stock cover (${daysOfCover} days). Inventory velocity is slow compared to holding quantity.`;
      suggestedAction = 'Hold off new orders until inventory levels reduce below 30 days cover.';
    }

    return {
      ...item,
      unitsSoldInPeriod,
      avgDailySales,
      daysOfCover,
      status,
      statusReason,
      isStockoutRisk,
      isDeadStock,
      isOverstocked,
      deadStockValue,
      suggestedAction,
      recommendedReorderQty,
    };
  });
}

// Calculate Period Summary comparing current vs previous identical window
export function calculatePeriodSummary(
  inventory: InventoryItem[],
  sales: SalesRecord[],
  periodDays: number = 14
): PeriodSummary {
  const current = filterSalesByPeriod(sales, periodDays, 0);
  const previous = filterSalesByPeriod(sales, periodDays, periodDays);

  const totalRevenue = current.filtered.reduce((sum, s) => sum + s.unitsSold * s.unitPrice, 0);
  const prevPeriodRevenue = previous.filtered.reduce((sum, s) => sum + s.unitsSold * s.unitPrice, 0);

  const totalUnitsSold = current.filtered.reduce((sum, s) => sum + s.unitsSold, 0);
  const prevPeriodUnitsSold = previous.filtered.reduce((sum, s) => sum + s.unitsSold, 0);

  const revenueChangePct =
    prevPeriodRevenue > 0
      ? Number((((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100).toFixed(1))
      : 0;

  const unitsChangePct =
    prevPeriodUnitsSold > 0
      ? Number((((totalUnitsSold - prevPeriodUnitsSold) / prevPeriodUnitsSold) * 100).toFixed(1))
      : 0;

  const calculatedInventory = calculateInventoryMetrics(inventory, sales, periodDays);

  const stockoutRiskCount = calculatedInventory.filter((i) => i.isStockoutRisk).length;
  const deadStockItems = calculatedInventory.filter((i) => i.isDeadStock);
  const deadStockCount = deadStockItems.length;
  const deadStockTotalCost = deadStockItems.reduce((sum, i) => sum + i.deadStockValue, 0);

  const totalInventoryCost = inventory.reduce((sum, i) => sum + i.stockOnHand * i.unitCost, 0);
  const totalRetailValue = inventory.reduce((sum, i) => sum + i.stockOnHand * i.retailPrice, 0);

  // Sales Health Assessment
  let salesHealth: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical' = 'Good';
  let salesHealthReason = 'Revenue is stable compared to previous analysis window.';
  if (revenueChangePct >= 8) {
    salesHealth = 'Excellent';
    salesHealthReason = `Sales grew ${revenueChangePct}% compared to previous period. Strong customer traffic.`;
  } else if (revenueChangePct >= -3) {
    salesHealth = 'Good';
    salesHealthReason = 'Sales are holding steady within normal retail variance.';
  } else if (revenueChangePct >= -12) {
    salesHealth = 'Needs Attention';
    salesHealthReason = `Sales slipped ${Math.abs(revenueChangePct)}% vs previous baseline. Key product velocity declined.`;
  } else {
    salesHealth = 'Critical';
    salesHealthReason = `Significant sales contraction of ${Math.abs(revenueChangePct)}%. Investigate footfall and stock availability.`;
  }

  // Inventory Health Assessment
  let inventoryHealth: 'Optimal' | 'Balanced' | 'High Risk' | 'Overstocked' = 'Balanced';
  let inventoryHealthReason = 'Inventory buffer is adequate across most categories.';
  if (stockoutRiskCount >= 2) {
    inventoryHealth = 'High Risk';
    inventoryHealthReason = `${stockoutRiskCount} core product(s) face imminent stockouts before supplier replenishment arrives.`;
  } else if (deadStockTotalCost > 15000) {
    inventoryHealth = 'Overstocked';
    inventoryHealthReason = `${formatINR(deadStockTotalCost)} trapped in slow-moving dead stock items.`;
  } else if (stockoutRiskCount === 1) {
    inventoryHealth = 'Balanced';
    inventoryHealthReason = '1 item requires immediate reorder; remaining inventory is within safety margins.';
  } else {
    inventoryHealth = 'Optimal';
    inventoryHealthReason = 'All tracked inventory items meet supplier delivery lead-time cover.';
  }

  return {
    periodDays,
    startDate: current.startDate,
    endDate: current.endDate,
    totalRevenue,
    prevPeriodRevenue,
    revenueChangePct,
    totalUnitsSold,
    prevPeriodUnitsSold,
    unitsChangePct,
    stockoutRiskCount,
    deadStockCount,
    deadStockTotalCost,
    totalInventoryCost,
    totalRetailValue,
    salesHealth,
    salesHealthReason,
    inventoryHealth,
    inventoryHealthReason,
  };
}

// Get daily trend points for Recharts
export function getDailySalesTrend(
  sales: SalesRecord[],
  periodDays: number = 14
): DailySalesTrend[] {
  const { filtered } = filterSalesByPeriod(sales, periodDays);

  const dayMap = new Map<string, { revenue: number; units: number }>();
  for (const s of filtered) {
    const existing = dayMap.get(s.date) || { revenue: 0, units: 0 };
    existing.revenue += s.unitsSold * s.unitPrice;
    existing.units += s.unitsSold;
    dayMap.set(s.date, existing);
  }

  const sortedDates = Array.from(dayMap.keys()).sort();
  const rawPoints = sortedDates.map((date) => {
    const item = dayMap.get(date)!;
    const d = new Date(date + 'T00:00:00');
    const displayDate = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return {
      date,
      displayDate,
      revenue: item.revenue,
      units: item.units,
    };
  });

  // Calculate 7-day rolling average to flag anomalous drops
  const avgRev = rawPoints.reduce((acc, p) => acc + p.revenue, 0) / Math.max(1, rawPoints.length);

  return rawPoints.map((p) => ({
    ...p,
    isDrop: p.revenue < avgRev * 0.78,
  }));
}

// Get product performance rankings with baseline comparison
export function getProductPerformance(
  sales: SalesRecord[],
  periodDays: number = 14
): ProductPerformance[] {
  const current = filterSalesByPeriod(sales, periodDays, 0);
  const baseline = filterSalesByPeriod(sales, periodDays, periodDays);

  const currMap = new Map<string, { name: string; cat: string; rev: number; units: number }>();
  for (const s of current.filtered) {
    const existing = currMap.get(s.productId) || {
      name: s.productName,
      cat: s.category,
      rev: 0,
      units: 0,
    };
    existing.rev += s.unitsSold * s.unitPrice;
    existing.units += s.unitsSold;
    currMap.set(s.productId, existing);
  }

  const baseMap = new Map<string, number>();
  for (const s of baseline.filtered) {
    baseMap.set(s.productId, (baseMap.get(s.productId) || 0) + s.unitsSold);
  }

  const totalRev = Array.from(currMap.values()).reduce((sum, item) => sum + item.rev, 0);

  const list: ProductPerformance[] = Array.from(currMap.entries()).map(([productId, item]) => {
    const baselineUnits = baseMap.get(productId) || 0;
    let changePct: number | undefined = undefined;
    if (baselineUnits > 0) {
      changePct = Number((((item.units - baselineUnits) / baselineUnits) * 100).toFixed(1));
    }
    const shareOfRevenue = totalRev > 0 ? Number(((item.rev / totalRev) * 100).toFixed(1)) : 0;

    return {
      productId,
      productName: item.name,
      category: item.cat,
      revenue: item.rev,
      unitsSold: item.units,
      shareOfRevenue,
      baselineUnits,
      changePct,
    };
  });

  // Sort by revenue descending
  return list.sort((a, b) => b.revenue - a.revenue);
}
