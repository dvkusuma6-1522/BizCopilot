import {
  CalculatedInventoryItem,
  DailySalesTrend,
  InventoryItem,
  PeriodSummary,
  ProductPerformance,
  SalesRecord,
  ABCClass,
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

// Get product performance rankings with ABC analysis and baseline comparisons
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

  // Initial list sorted by revenue descending
  const sortedRaw = Array.from(currMap.entries())
    .map(([productId, item]) => {
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
    })
    .sort((a, b) => b.revenue - a.revenue);

  // ABC Analysis:
  // Class A: Top products generating up to ~70% of total revenue (Vital core drivers)
  // Class B: Next products generating up to ~90% (Steady sellers)
  // Class C: Bottom products generating the remaining 10% (Slow movers or small niche)
  let cumulativeRevenue = 0;
  return sortedRaw.map((p) => {
    cumulativeRevenue += p.revenue;
    const cumulativePct = totalRev > 0 ? (cumulativeRevenue / totalRev) * 100 : 100;

    let abcClass: ABCClass = 'C';
    let abcDescription = 'Class C: Lower revenue contributor. Review holding quantities.';

    if (cumulativePct <= 72 || sortedRaw.indexOf(p) < 3) {
      abcClass = 'A';
      abcDescription = 'Class A: Top revenue champion (Vital 70% revenue driver). Never let this run out.';
    } else if (cumulativePct <= 92) {
      abcClass = 'B';
      abcDescription = 'Class B: Steady core seller (Middle 20% revenue driver). Keep balanced stock.';
    }

    return {
      ...p,
      abcClass,
      abcDescription,
    };
  });
}

// Calculate comprehensive inventory metrics with owner-friendly language
export function calculateInventoryMetrics(
  inventory: InventoryItem[],
  sales: SalesRecord[],
  periodDays: number = 14
): CalculatedInventoryItem[] {
  const { filtered } = filterSalesByPeriod(sales, periodDays);
  const productPerf = getProductPerformance(sales, periodDays);
  const abcMap = new Map<string, ABCClass>(productPerf.map((p) => [p.productId, p.abcClass]));

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

    // Dead stock evaluation: <= 2 units sold over at least 14 days and has holding stock
    const isDeadStock =
      (periodDays >= 14 ? unitsSoldInPeriod <= 2 : unitsSoldInPeriod === 0) &&
      item.stockOnHand > 15;

    const deadStockValue = isDeadStock ? Math.round(item.stockOnHand * item.unitCost) : 0;

    // Stockout risk: stock cover is less than supplier delivery lead days
    const isStockoutRisk = avgDailySales > 0 && daysOfCover < item.supplierLeadDays;

    // Overstocked: more than 45 days of stock and more than 2x reorder level
    const isOverstocked =
      avgDailySales > 0 && daysOfCover > 45 && item.stockOnHand > item.reorderLevel * 2;

    const abcClass = abcMap.get(item.productId) || 'B';

    // Target reorder quantity
    const targetBufferDays = item.supplierLeadDays + 7;
    const recommendedReorderQty = Math.max(
      0,
      Math.ceil(avgDailySales * targetBufferDays - item.stockOnHand)
    );

    let status: 'critical' | 'warning' | 'healthy' = 'healthy';
    let statusReason = 'Stock levels are balanced relative to normal customer demand.';
    let friendlyStatusText = `About ${daysOfCover} days of stock left. Stock is healthy.`;
    let suggestedAction = 'Keep normal restocking schedule.';
    const howCalculated = `${item.stockOnHand} units on hand ÷ ${avgDailySales} units sold per day = ${daysOfCover >= 900 ? 'No sales' : `${daysOfCover} days of stock left`}. Supplier delivery takes ${item.supplierLeadDays} days.`;

    if (isStockoutRisk) {
      status = 'critical';
      statusReason = `Current stock of ${item.stockOnHand} units will only last about ${daysOfCover} days, but delivery takes ${item.supplierLeadDays} days.`;
      friendlyStatusText = `Your stock may run out before the next delivery arrives (about ${daysOfCover} days left, delivery takes ${item.supplierLeadDays} days).`;
      suggestedAction = `Order ${recommendedReorderQty || item.reorderLevel} units from supplier today.`;
    } else if (isDeadStock) {
      status = 'critical';
      statusReason = `Only ${unitsSoldInPeriod} unit(s) sold in ${periodDays} days. ${item.stockOnHand} units sitting on shelf.`;
      friendlyStatusText = `Money tied up in products that are not selling (${formatINR(deadStockValue)} trapped at cost).`;
      suggestedAction = 'Put on discount, create a bundle deal, or pause future orders.';
    } else if (daysOfCover <= item.supplierLeadDays * 1.5 || item.stockOnHand <= item.reorderLevel) {
      status = 'warning';
      statusReason = `Stock is getting low (${item.stockOnHand} units left, safety point is ${item.reorderLevel}).`;
      friendlyStatusText = `About ${daysOfCover} days of stock left. Nearing reorder point.`;
      suggestedAction = `Plan to reorder ${recommendedReorderQty || item.reorderLevel} units before the weekend.`;
    } else if (isOverstocked) {
      status = 'warning';
      statusReason = `High stock (${daysOfCover} days of supply). Selling slower than the quantity on hand.`;
      friendlyStatusText = `More stock than needed right now (${daysOfCover} days of supply on hand).`;
      suggestedAction = 'Hold off buying more until current stock drops below 30 days.';
    }

    return {
      ...item,
      unitsSoldInPeriod,
      avgDailySales,
      daysOfCover,
      status,
      statusReason,
      friendlyStatusText,
      isStockoutRisk,
      isDeadStock,
      isOverstocked,
      deadStockValue,
      suggestedAction,
      recommendedReorderQty,
      howCalculated,
      abcClass,
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

  // Sales Health Assessment in Owner Language
  let salesHealth: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical' = 'Good';
  let salesHealthReason = 'Overall sales are stable compared with the previous period.';
  if (revenueChangePct >= 8) {
    salesHealth = 'Excellent';
    salesHealthReason = `Sales are up ${revenueChangePct}% compared with the previous ${periodDays} days.`;
  } else if (revenueChangePct >= -3) {
    salesHealth = 'Good';
    salesHealthReason = 'Sales are holding steady within normal shop day-to-day variations.';
  } else if (revenueChangePct >= -12) {
    salesHealth = 'Needs Attention';
    salesHealthReason = `Sales have dropped ${Math.abs(revenueChangePct)}% compared with the previous ${periodDays} days.`;
  } else {
    salesHealth = 'Critical';
    salesHealthReason = `Sales have dropped significantly (${Math.abs(revenueChangePct)}% drop). Check customer footfall and top items.`;
  }

  // Inventory Health Assessment in Owner Language
  let inventoryHealth: 'Optimal' | 'Balanced' | 'High Risk' | 'Overstocked' = 'Balanced';
  let inventoryHealthReason = 'Stock buffers are balanced across most shop categories.';
  if (stockoutRiskCount >= 2) {
    inventoryHealth = 'High Risk';
    inventoryHealthReason = `${stockoutRiskCount} important items may run out before the supplier delivery arrives.`;
  } else if (deadStockTotalCost > 15000) {
    inventoryHealth = 'Overstocked';
    inventoryHealthReason = `${formatINR(deadStockTotalCost)} tied up in products that are not selling.`;
  } else if (stockoutRiskCount === 1) {
    inventoryHealth = 'Balanced';
    inventoryHealthReason = '1 item needs an urgent order; other items are in safe supply.';
  } else {
    inventoryHealth = 'Optimal';
    inventoryHealthReason = 'All items have enough stock to comfortably cover supplier delivery times.';
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

  // Calculate average daily revenue to flag days with steep dips
  const avgRev = rawPoints.reduce((acc, p) => acc + p.revenue, 0) / Math.max(1, rawPoints.length);

  return rawPoints.map((p) => ({
    ...p,
    isDrop: p.revenue < avgRev * 0.78,
  }));
}
