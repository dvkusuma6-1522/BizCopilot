import {
  CalculatedInventoryItem,
  BusinessAlert,
  AIRecommendation,
  ProductPerformance,
} from './types';
import { formatINR } from './analytics';

export function generateBusinessAlerts(
  inventory: CalculatedInventoryItem[],
  productPerformance: ProductPerformance[]
): BusinessAlert[] {
  const alerts: BusinessAlert[] = [];

  // 1. Sales Decline Alert
  const decliningProduct = productPerformance.find(
    (p) => p.changePct !== undefined && p.changePct <= -25 && p.baselineUnits && p.baselineUnits > 20
  );

  if (decliningProduct) {
    alerts.push({
      id: `alert-sales-${decliningProduct.productId}`,
      severity: 'critical',
      type: 'sales_decline',
      title: 'Sudden Sales Drop Detected',
      productId: decliningProduct.productId,
      productName: decliningProduct.productName,
      supportingData: `Sold ${decliningProduct.unitsSold} units vs ${decliningProduct.baselineUnits} units in the previous period (${decliningProduct.changePct}% drop).`,
      recommendedAction: 'Check shelf visibility, recent price changes, or competitor discount activity.',
      targetSection: 'sales',
    });
  }

  // 2. Stockout Risk Alert
  const stockoutRiskItem = inventory.find((item) => item.isStockoutRisk);
  if (stockoutRiskItem) {
    alerts.push({
      id: `alert-stockout-${stockoutRiskItem.productId}`,
      severity: 'critical',
      type: 'stockout_risk',
      title: 'Imminent Stockout Risk',
      productId: stockoutRiskItem.productId,
      productName: stockoutRiskItem.productName,
      supportingData: `Stock on hand is ${stockoutRiskItem.stockOnHand} units (${stockoutRiskItem.daysOfCover} days cover), while supplier lead time is ${stockoutRiskItem.supplierLeadDays} days.`,
      recommendedAction: `Place expedited replenishment order for ${stockoutRiskItem.recommendedReorderQty} units immediately.`,
      targetSection: 'inventory',
    });
  }

  // 3. Dead Stock Alert
  const deadStockItem = inventory.find((item) => item.isDeadStock);
  if (deadStockItem) {
    alerts.push({
      id: `alert-deadstock-${deadStockItem.productId}`,
      severity: 'warning',
      type: 'dead_stock',
      title: 'Dead Stock Capital Tied Up',
      productId: deadStockItem.productId,
      productName: deadStockItem.productName,
      supportingData: `${deadStockItem.stockOnHand} units unsold across recent weeks. Estimated cost tied up is ${formatINR(
        deadStockItem.deadStockValue
      )}.`,
      recommendedAction: 'Create 15-20% bundle discount with top-selling snack or stop auto-restocking.',
      targetSection: 'inventory',
    });
  }

  // 4. Replenishment threshold alert (approaching reorder point)
  const reorderWarningItem = inventory.find(
    (item) => !item.isStockoutRisk && !item.isDeadStock && item.stockOnHand <= item.reorderLevel
  );
  if (reorderWarningItem) {
    alerts.push({
      id: `alert-reorder-${reorderWarningItem.productId}`,
      severity: 'warning',
      type: 'reorder_needed',
      title: 'Reorder Threshold Reached',
      productId: reorderWarningItem.productId,
      productName: reorderWarningItem.productName,
      supportingData: `Stock on hand (${reorderWarningItem.stockOnHand}) is at or below safety buffer (${reorderWarningItem.reorderLevel}).`,
      recommendedAction: `Issue purchase order for ${reorderWarningItem.recommendedReorderQty} units before weekend surge.`,
      targetSection: 'inventory',
    });
  }

  return alerts;
}

export function generateAIRecommendations(
  inventory: CalculatedInventoryItem[],
  productPerformance: ProductPerformance[]
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  // 1. Stockout Prevention Recommendations
  const stockoutItems = inventory.filter((i) => i.isStockoutRisk);
  for (const item of stockoutItems) {
    recommendations.push({
      id: `rec-stockout-${item.productId}`,
      priority: 'high',
      category: 'Stockout Prevention',
      title: `Expedite Reorder for ${item.productName}`,
      productId: item.productId,
      productName: item.productName,
      reason: `Current stock of ${item.stockOnHand} will exhaust in ~${item.daysOfCover} days based on daily sales of ${item.avgDailySales} units/day. Supplier requires ${item.supplierLeadDays} days delivery window.`,
      supportingEvidence: `Daily Velocity: ${item.avgDailySales} units/day | Cover: ${item.daysOfCover}d | Lead Time: ${item.supplierLeadDays}d | Stock on Hand: ${item.stockOnHand}`,
      recommendedNextAction: `Contact supplier today and order ${item.recommendedReorderQty} units to prevent stockout loss.`,
      targetSection: 'inventory',
    });
  }

  // 2. Sales Decline Investigation Recommendations
  const decliningProducts = productPerformance.filter(
    (p) => p.changePct !== undefined && p.changePct <= -20 && p.baselineUnits && p.baselineUnits > 15
  );
  for (const item of decliningProducts) {
    recommendations.push({
      id: `rec-decline-${item.productId}`,
      priority: 'high',
      category: 'Sales Decline Investigation',
      title: `Investigate Sales Drop for ${item.productName}`,
      productId: item.productId,
      productName: item.productName,
      reason: `Sales volume contracted by ${Math.abs(item.changePct!)}% from ${item.baselineUnits} units down to ${item.unitsSold} units. Pure sales data cannot identify customer churn cause.`,
      supportingEvidence: `Current Units: ${item.unitsSold} | Baseline Units: ${item.baselineUnits} | Net Drop: ${item.changePct}% | Revenue Share: ${item.shareOfRevenue}%`,
      recommendedNextAction: 'Inspect expiry dates, check if nearby competitor launched a discount, or reposition item to checkout counter.',
      targetSection: 'sales',
    });
  }

  // 3. Dead Stock Reduction Recommendations
  const deadStockItems = inventory.filter((i) => i.isDeadStock);
  for (const item of deadStockItems) {
    recommendations.push({
      id: `rec-deadstock-${item.productId}`,
      priority: 'medium',
      category: 'Dead Stock Reduction',
      title: `Liquidate Stagnant ${item.productName}`,
      productId: item.productId,
      productName: item.productName,
      reason: `No significant movement (${item.unitsSoldInPeriod} sold in period). ${item.stockOnHand} units occupying shelf capacity and locking up capital.`,
      supportingEvidence: `Inventory Cost Locked: ${formatINR(item.deadStockValue)} | Units Held: ${item.stockOnHand} | Daily Sales: ${item.avgDailySales} units`,
      recommendedNextAction: `Implement "Buy 1 Get 1 at 50% Off" or bundle with high-velocity product. Avoid auto-replenishment until cleared.`,
      targetSection: 'inventory',
    });
  }

  // 4. Overstock / Working Capital Optimization
  const overstockedItems = inventory.filter((i) => i.isOverstocked);
  for (const item of overstockedItems) {
    recommendations.push({
      id: `rec-overstock-${item.productId}`,
      priority: 'low',
      category: 'Replenishment',
      title: `Defer Restocking for ${item.productName}`,
      productId: item.productId,
      productName: item.productName,
      reason: `Excessive buffer of ${item.daysOfCover} days of supply. Current stock (${item.stockOnHand}) exceeds required safety threshold by more than double.`,
      supportingEvidence: `Days of Supply: ${item.daysOfCover} days | Daily Sales: ${item.avgDailySales} units/day | Holding Quantity: ${item.stockOnHand}`,
      recommendedNextAction: 'Snooze automatic supplier reorders for next 3 weeks to liberate working capital.',
      targetSection: 'inventory',
    });
  }

  // 5. Replenishment for regular fast movers approaching reorder level
  const fastMoversNeedingOrder = inventory.filter(
    (i) => !i.isStockoutRisk && !i.isDeadStock && !i.isOverstocked && i.stockOnHand <= i.reorderLevel * 1.25
  );
  for (const item of fastMoversNeedingOrder) {
    recommendations.push({
      id: `rec-reorder-${item.productId}`,
      priority: 'medium',
      category: 'Replenishment',
      title: `Scheduled Restock for ${item.productName}`,
      productId: item.productId,
      productName: item.productName,
      reason: `Stock is within 25% of reorder threshold (${item.stockOnHand}/${item.reorderLevel}). Healthy velocity requires proactive replenishment.`,
      supportingEvidence: `Current Stock: ${item.stockOnHand} | Reorder Point: ${item.reorderLevel} | Est. Cover: ${item.daysOfCover} days`,
      recommendedNextAction: `Place standard supplier purchase order for ${item.recommendedReorderQty} units.`,
      targetSection: 'inventory',
    });
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
