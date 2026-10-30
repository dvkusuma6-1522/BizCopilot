import {
  CalculatedInventoryItem,
  BusinessAlert,
  AIRecommendation,
  ProductPerformance,
  ActTodayItem,
  WatchThisWeekItem,
  DoingWellItem,
  SalesRecord,
} from './types';
import { formatINR, formatNumber } from './analytics';
import { CategoryConfig } from './categories/types';
import { SupportedLanguage } from './i18n';

// 1. ACT TODAY: Genuinely critical problems requiring immediate attention today
export function generateActTodayItems(
  inventory: CalculatedInventoryItem[],
  productPerformance: ProductPerformance[],
  category?: CategoryConfig,
  lang: SupportedLanguage = 'en',
  sales: SalesRecord[] = [],
  periodDays: number = 14
): ActTodayItem[] {
  const items: ActTodayItem[] = [];

  // A. Emergency Stockout Risk: Days of stock remaining < Supplier delivery time
  const stockoutRiskItems = inventory.filter((i) => i.isStockoutRisk);
  for (const item of stockoutRiskItems) {
    items.push({
      id: `act-stockout-${item.productId}`,
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      headline: `Stock may run out before delivery`,
      simpleExplanation: `You only have about ${item.daysOfCover} days of stock left, but your supplier takes ${item.supplierLeadDays} days to deliver. If you don't order now, you will have an empty shelf.`,
      supportingNumbers: `Stock on hand: ${item.stockOnHand} units | Selling: ~${item.avgDailySales} units/day | Days left: ~${item.daysOfCover} days | Supplier delivery: ${item.supplierLeadDays} days`,
      suggestedAction: `Call your supplier today and place an urgent order for ${item.recommendedReorderQty || item.reorderLevel} units.`,
      howCalculated: `${item.stockOnHand} units in shop ÷ ${item.avgDailySales} daily demand = ${item.daysOfCover} days of stock left. This is less than the ${item.supplierLeadDays} days needed for delivery.`,
      targetSection: 'inventory',
    });
  }

  // B. Major Sales Collapse on a High-Volume Product (>25% drop on significant baseline)
  const severeDrop = productPerformance.find(
    (p) => p.changePct !== undefined && p.changePct <= -25 && p.baselineUnits && p.baselineUnits > 20
  );
  if (severeDrop) {
    items.push({
      id: `act-sales-drop-${severeDrop.productId}`,
      productId: severeDrop.productId,
      productName: severeDrop.productName,
      category: severeDrop.category,
      headline: `Sales have dropped more than usual`,
      simpleExplanation: `${severeDrop.productName} sales dropped sharply by ${Math.abs(
        severeDrop.changePct!
      )}% compared with the previous baseline period.`,
      supportingNumbers: `Current sales: ${severeDrop.unitsSold} units (vs ${severeDrop.baselineUnits} units in previous period). A drop of ${severeDrop.changePct}%.`,
      suggestedAction: `Check if this product was out of stock on the shelf, if prices were changed, or if competitors ran a discount.`,
      howCalculated: `Compared current period sales (${severeDrop.unitsSold} units) directly against the prior baseline period (${severeDrop.baselineUnits} units). Change = ((${severeDrop.unitsSold} - ${severeDrop.baselineUnits}) / ${severeDrop.baselineUnits}) × 100 = ${severeDrop.changePct}%.`,
      targetSection: 'sales',
    });
  }

  // C. Category Domain Alert Rules for Act Today
  if (category?.alertRules) {
    for (const rule of category.alertRules) {
      try {
        const results = rule.evaluate({ inventory, sales, periodDays });
        for (const res of results) {
          if (res.triggered && res.section === 'today') {
            items.push({
              id: `cat-today-${rule.id}-${res.productId || 'store'}`,
              productId: res.productId || 'CAT-ALERT',
              productName: res.productName || category.labels[lang] || category.labels.en,
              category: category.labels[lang] || category.labels.en,
              headline: res.headline[lang] || res.headline.en,
              simpleExplanation: res.explanation[lang] || res.explanation.en,
              supportingNumbers: res.supportingData,
              suggestedAction: res.suggestedAction[lang] || res.suggestedAction.en,
              howCalculated: res.supportingData,
              targetSection: 'inventory',
            });
          }
        }
      } catch (e) {
        console.warn(`Category rule ${rule.id} evaluation error:`, e);
      }
    }
  }

  return items;
}

// 2. WATCH THIS WEEK: Important issues to monitor or plan for, but not an emergency today
export function generateWatchThisWeekItems(
  inventory: CalculatedInventoryItem[],
  productPerformance: ProductPerformance[],
  category?: CategoryConfig,
  lang: SupportedLanguage = 'en',
  sales: SalesRecord[] = [],
  periodDays: number = 14
): WatchThisWeekItem[] {
  const items: WatchThisWeekItem[] = [];

  // A. Products nearing reorder point (Buffer is getting close)
  const nearingReorder = inventory.filter(
    (i) => !i.isStockoutRisk && !i.isDeadStock && (i.stockOnHand <= i.reorderLevel || i.daysOfCover <= i.supplierLeadDays * 1.5)
  );
  for (const item of nearingReorder) {
    items.push({
      id: `watch-reorder-${item.productId}`,
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      headline: `Stock is getting low (nearing reorder point)`,
      reason: `Current stock of ${item.stockOnHand} units is close to your safety level of ${item.reorderLevel} units. You have about ${item.daysOfCover} days of stock remaining.`,
      supportingNumbers: `Stock on hand: ${item.stockOnHand} units | Reorder level: ${item.reorderLevel} units | Days left: ~${item.daysOfCover} days`,
      recommendedAction: `Add ${item.recommendedReorderQty || item.reorderLevel} units to your regular supplier purchase order this week.`,
      howCalculated: `Current stock (${item.stockOnHand}) is at or below the designated reorder threshold (${item.reorderLevel}).`,
      targetSection: 'inventory',
    });
  }

  // B. Money tied up in products that are not selling (Dead Stock)
  const deadStockItems = inventory.filter((i) => i.isDeadStock);
  for (const item of deadStockItems) {
    items.push({
      id: `watch-deadstock-${item.productId}`,
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      headline: `Money tied up in products that are not selling`,
      reason: `You have ${item.stockOnHand} units sitting on the shelf with only ${item.unitsSoldInPeriod} unit(s) sold recently. This is locking up ${formatINR(item.deadStockValue)} of your cash.`,
      supportingNumbers: `Unsold stock: ${item.stockOnHand} units | Money tied up at cost: ${formatINR(item.deadStockValue)} | Retail value: ${formatINR(item.stockOnHand * item.retailPrice)}`,
      recommendedAction: `Bundle this with a popular product at a discount, or avoid reordering until current boxes sell out.`,
      howCalculated: `${item.stockOnHand} units unsold × unit cost of ${formatINR(item.unitCost)} = ${formatINR(item.deadStockValue)} tied up.`,
      targetSection: 'inventory',
    });
  }

  // C. Excess inventory accumulating (Overstocked)
  const overstockedItems = inventory.filter((i) => i.isOverstocked);
  for (const item of overstockedItems) {
    items.push({
      id: `watch-overstock-${item.productId}`,
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      headline: `More stock than needed right now`,
      reason: `You have about ${item.daysOfCover} days of stock on hand (${item.stockOnHand} units). This is more than double what your store normally needs.`,
      supportingNumbers: `Current stock: ${item.stockOnHand} units | Days of supply: ~${item.daysOfCover} days | Daily sales: ~${item.avgDailySales} units/day`,
      recommendedAction: `Pause new supplier orders for this item until stock levels drop back down to about 30 days of supply.`,
      howCalculated: `${item.stockOnHand} units ÷ ${item.avgDailySales} sold/day = ${item.daysOfCover} days of supply. This exceeds the 45-day normal target.`,
      targetSection: 'inventory',
    });
  }

  // D. Moderate sales slowdown (10% to 24% drop)
  const moderateDrops = productPerformance.filter(
    (p) => p.changePct !== undefined && p.changePct <= -10 && p.changePct > -25
  );
  for (const item of moderateDrops) {
    items.push({
      id: `watch-drop-${item.productId}`,
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      headline: `Sales are slightly slower than normal`,
      reason: `Sales volume is down ${Math.abs(item.changePct!)}% compared with the previous baseline period.`,
      supportingNumbers: `Sold ${item.unitsSold} units vs ${item.baselineUnits} units previously (${item.changePct}% change).`,
      recommendedAction: `Keep an eye on this product this week to see if sales recover before ordering extra stock.`,
      howCalculated: `Sales fell from ${item.baselineUnits} units to ${item.unitsSold} units in the same number of days.`,
      targetSection: 'sales',
    });
  }

  // E. Category Domain Alert Rules for Watch This Week
  if (category?.alertRules) {
    for (const rule of category.alertRules) {
      try {
        const results = rule.evaluate({ inventory, sales, periodDays });
        for (const res of results) {
          if (res.triggered && res.section === 'week') {
            items.push({
              id: `cat-week-${rule.id}-${res.productId || 'store'}`,
              productId: res.productId || 'CAT-ALERT',
              productName: res.productName || category.labels[lang] || category.labels.en,
              category: category.labels[lang] || category.labels.en,
              headline: res.headline[lang] || res.headline.en,
              reason: res.explanation[lang] || res.explanation.en,
              supportingNumbers: res.supportingData,
              recommendedAction: res.suggestedAction[lang] || res.suggestedAction.en,
              howCalculated: res.supportingData,
              targetSection: 'inventory',
            });
          }
        }
      } catch (e) {
        console.warn(`Category rule ${rule.id} evaluation error:`, e);
      }
    }
  }

  return items;
}

// 3. DOING WELL: Positive business signals
export function generateDoingWellItems(
  inventory: CalculatedInventoryItem[],
  productPerformance: ProductPerformance[],
  category?: CategoryConfig,
  lang: SupportedLanguage = 'en',
  sales: SalesRecord[] = [],
  periodDays: number = 14
): DoingWellItem[] {
  const items: DoingWellItem[] = [];

  // A. Top-selling revenue champions (Class A products)
  const topRevenueProducts = productPerformance.filter((p) => p.abcClass === 'A').slice(0, 3);
  for (const p of topRevenueProducts) {
    const inv = inventory.find((i) => i.productId === p.productId);
    items.push({
      id: `well-top-${p.productId}`,
      productId: p.productId,
      productName: p.productName,
      category: p.category,
      headline: `Top Revenue Champion (Class A)`,
      positiveSignal: `This is one of your shop's best earners, bringing in ${formatINR(p.revenue)} (${p.shareOfRevenue}% of your total shop sales).`,
      supportingNumbers: `Revenue: ${formatINR(p.revenue)} | Units sold: ${formatNumber(p.unitsSold)} | Stock remaining: ${inv ? `${inv.daysOfCover} days` : 'Healthy'}`,
      takeaway: `Keep this product prominently displayed on front shelves and always keep supplier deliveries on schedule.`,
      targetSection: 'sales',
    });
  }

  // B. Products with growing sales
  const growingProducts = productPerformance
    .filter((p) => p.changePct !== undefined && p.changePct >= 8)
    .slice(0, 2);
  for (const p of growingProducts) {
    items.push({
      id: `well-growing-${p.productId}`,
      productId: p.productId,
      productName: p.productName,
      category: p.category,
      headline: `Sales are growing (+${p.changePct}%)`,
      positiveSignal: `Customer demand for this product is picking up. Sold ${p.unitsSold} units (up from ${p.baselineUnits} units in the prior period).`,
      supportingNumbers: `Growth: +${p.changePct}% | Current units: ${p.unitsSold} | Prior units: ${p.baselineUnits}`,
      takeaway: `Ensure you have enough supplier stock to meet this growing customer interest.`,
      targetSection: 'sales',
    });
  }

  // C. Perfectly balanced inventory items (Healthy cover > lead time + 7d)
  const healthyItems = inventory
    .filter((i) => i.status === 'healthy' && i.daysOfCover >= 10 && i.daysOfCover <= 35 && i.avgDailySales > 2)
    .slice(0, 2);
  for (const item of healthyItems) {
    items.push({
      id: `well-stock-${item.productId}`,
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      headline: `Healthy Stock Level`,
      positiveSignal: `You have about ${item.daysOfCover} days of stock left. This comfortably covers supplier delivery (${item.supplierLeadDays} days) without tying up excess cash.`,
      supportingNumbers: `Stock on hand: ${item.stockOnHand} units | Selling: ~${item.avgDailySales} units/day | Supplier delivery: ${item.supplierLeadDays} days`,
      takeaway: `No action needed right now. Everything is running smoothly.`,
      targetSection: 'inventory',
    });
  }

  // D. Category Domain Alert Rules for Doing Well
  if (category?.alertRules) {
    for (const rule of category.alertRules) {
      try {
        const results = rule.evaluate({ inventory, sales, periodDays });
        for (const res of results) {
          if (res.triggered && res.section === 'well') {
            items.push({
              id: `cat-well-${rule.id}-${res.productId || 'store'}`,
              productId: res.productId || 'CAT-ALERT',
              productName: res.productName || category.labels[lang] || category.labels.en,
              category: category.labels[lang] || category.labels.en,
              headline: res.headline[lang] || res.headline.en,
              positiveSignal: res.explanation[lang] || res.explanation.en,
              supportingNumbers: res.supportingData,
              takeaway: res.suggestedAction[lang] || res.suggestedAction.en,
              targetSection: 'inventory',
            });
          }
        }
      } catch (e) {
        console.warn(`Category rule ${rule.id} evaluation error:`, e);
      }
    }
  }

  return items;
}

// 4. Owner-Friendly AI Recommendations
export function generateAIRecommendations(
  inventory: CalculatedInventoryItem[],
  productPerformance: ProductPerformance[],
  category?: CategoryConfig,
  lang: SupportedLanguage = 'en',
  sales: SalesRecord[] = [],
  periodDays: number = 14
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  // Stockout Prevention
  const stockoutItems = inventory.filter((i) => i.isStockoutRisk);
  for (const item of stockoutItems) {
    recommendations.push({
      id: `rec-stockout-${item.productId}`,
      priority: 'high',
      category: 'Stockout Prevention',
      title: `Reorder ${item.productName}`,
      productId: item.productId,
      productName: item.productName,
      whatIsHappening: `Current stock covers approximately ${item.daysOfCover} days of customer demand, but supplier delivery takes ${item.supplierLeadDays} days.`,
      supportingNumbers: `Stock on hand: ${item.stockOnHand} units | Average daily sales: ${item.avgDailySales} units/day | Days left: ${item.daysOfCover} days | Supplier delivery: ${item.supplierLeadDays} days`,
      whyOwnerShouldCare: `If you do not reorder now, customers won't find this item on your shelf, resulting in lost sales and frustrated regulars.`,
      recommendedNextStep: `Place a replenishment order for ${item.recommendedReorderQty || item.reorderLevel} units with your supplier today.`,
      howCalculated: `${item.stockOnHand} units ÷ ${item.avgDailySales} daily sales = ${item.daysOfCover} days remaining. Since ${item.daysOfCover} < ${item.supplierLeadDays} days delivery, stock will exhaust before the order arrives.`,
      targetSection: 'inventory',
    });
  }

  // Sales Decline Investigation
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
      whatIsHappening: `Sales have dropped from ${item.baselineUnits} to ${item.unitsSold} units compared with the baseline period (${item.changePct}% drop).`,
      supportingNumbers: `Current sales: ${item.unitsSold} units | Baseline sales: ${item.baselineUnits} units | Drop: ${item.changePct}% | Revenue share: ${item.shareOfRevenue}%`,
      whyOwnerShouldCare: `This product is an important revenue contributor (${item.abcClass} rank). Sales data alone cannot tell you customer thoughts, but a sharp drop hurts total weekly profits.`,
      recommendedNextStep: `Check product availability on shelves, verify if selling price was raised, check expiry dates, and see if nearby competitors launched promotions.`,
      howCalculated: `((Current period ${item.unitsSold} units - Previous period ${item.baselineUnits} units) ÷ ${item.baselineUnits}) × 100 = ${item.changePct}%.`,
      targetSection: 'sales',
    });
  }

  // Dead Stock Reduction
  const deadStockItems = inventory.filter((i) => i.isDeadStock);
  for (const item of deadStockItems) {
    recommendations.push({
      id: `rec-deadstock-${item.productId}`,
      priority: 'medium',
      category: 'Dead Stock Reduction',
      title: `Free Up Cash from ${item.productName}`,
      productId: item.productId,
      productName: item.productName,
      whatIsHappening: `Only ${item.unitsSoldInPeriod} unit(s) were sold recently. You have ${item.stockOnHand} units sitting in the shop.`,
      supportingNumbers: `Money tied up at cost: ${formatINR(item.deadStockValue)} | Units on hand: ${item.stockOnHand} | Retail value: ${formatINR(item.stockOnHand * item.retailPrice)}`,
      whyOwnerShouldCare: `Every rupee trapped in boxes that don't sell is cash you cannot use to buy fast-selling staples like milk, flour, or rice.`,
      recommendedNextStep: `Offer a "Buy 1 Get 1 at 50% Off" deal or bundle it with a fast-selling staple item. Do not order more from your distributor.`,
      howCalculated: `${item.stockOnHand} units in stock × ${formatINR(item.unitCost)} wholesale cost = ${formatINR(item.deadStockValue)} in idle cash.`,
      targetSection: 'inventory',
    });
  }

  // Category Domain Alert Rules for Recommendations
  if (category?.alertRules) {
    for (const rule of category.alertRules) {
      try {
        const results = rule.evaluate({ inventory, sales, periodDays });
        for (const res of results) {
          if (res.triggered) {
            recommendations.push({
              id: `rec-cat-${rule.id}-${res.productId || 'store'}`,
              priority: rule.priority === 'critical' ? 'high' : rule.priority === 'warning' ? 'medium' : 'low',
              category: `${category.labels[lang] || category.labels.en} Intelligence`,
              title: res.headline[lang] || res.headline.en,
              productId: res.productId || 'CAT-ALERT',
              productName: res.productName || category.labels[lang] || category.labels.en,
              whatIsHappening: res.explanation[lang] || res.explanation.en,
              supportingNumbers: res.supportingData,
              whyOwnerShouldCare: res.explanation[lang] || res.explanation.en,
              recommendedNextStep: res.suggestedAction[lang] || res.suggestedAction.en,
              howCalculated: res.supportingData,
              targetSection: 'inventory',
            });
          }
        }
      } catch (e) {
        console.warn(`Category recommendation rule ${rule.id} error:`, e);
      }
    }
  }

  // Overstock
  const overstockedItems = inventory.filter((i) => i.isOverstocked);
  for (const item of overstockedItems) {
    recommendations.push({
      id: `rec-overstock-${item.productId}`,
      priority: 'low',
      category: 'Replenishment',
      title: `Pause Restocking for ${item.productName}`,
      productId: item.productId,
      productName: item.productName,
      whatIsHappening: `You have about ${item.daysOfCover} days of stock (${item.stockOnHand} units), which is more than double your shop's safety buffer.`,
      supportingNumbers: `Days of stock: ~${item.daysOfCover} days | Daily demand: ~${item.avgDailySales} units/day | Holding quantity: ${item.stockOnHand} units`,
      whyOwnerShouldCare: `Storing extra boxes takes up shelf and storage room without bringing in extra customer sales.`,
      recommendedNextStep: `Skip supplier reorders for the next 3 weeks until current stock drops down to about 30 days of supply.`,
      howCalculated: `${item.stockOnHand} units ÷ ${item.avgDailySales} daily demand = ${item.daysOfCover} days of supply (>45 days limit).`,
      targetSection: 'inventory',
    });
  }

  // Scheduled Replenishment
  const reorderApproaching = inventory.filter(
    (i) => !i.isStockoutRisk && !i.isDeadStock && !i.isOverstocked && i.stockOnHand <= i.reorderLevel * 1.25
  );
  for (const item of reorderApproaching) {
    recommendations.push({
      id: `rec-reorder-${item.productId}`,
      priority: 'medium',
      category: 'Replenishment',
      title: `Plan Restock for ${item.productName}`,
      productId: item.productId,
      productName: item.productName,
      whatIsHappening: `Stock (${item.stockOnHand} units) is getting close to your safety reorder level (${item.reorderLevel} units).`,
      supportingNumbers: `Current stock: ${item.stockOnHand} units | Reorder level: ${item.reorderLevel} units | Days left: ~${item.daysOfCover} days`,
      whyOwnerShouldCare: `Proactive ordering keeps shelves full during busy weekend grocery rushes.`,
      recommendedNextStep: `Include ${item.recommendedReorderQty || item.reorderLevel} units on your regular supplier order this week.`,
      howCalculated: `Current stock (${item.stockOnHand}) is within 25% of the safety reorder point (${item.reorderLevel}).`,
      targetSection: 'inventory',
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// 5. Business Alerts for legacy compatibility
export function generateBusinessAlerts(
  inventory: CalculatedInventoryItem[],
  productPerformance: ProductPerformance[]
): BusinessAlert[] {
  const alerts: BusinessAlert[] = [];

  const stockoutRiskItem = inventory.find((item) => item.isStockoutRisk);
  if (stockoutRiskItem) {
    alerts.push({
      id: `alert-stockout-${stockoutRiskItem.productId}`,
      severity: 'critical',
      type: 'stockout_risk',
      title: 'Stock may run out before delivery',
      productId: stockoutRiskItem.productId,
      productName: stockoutRiskItem.productName,
      supportingData: `About ${stockoutRiskItem.daysOfCover} days of stock left (${stockoutRiskItem.stockOnHand} units), but delivery takes ${stockoutRiskItem.supplierLeadDays} days.`,
      recommendedAction: `Order ${stockoutRiskItem.recommendedReorderQty || stockoutRiskItem.reorderLevel} units from your supplier today.`,
      targetSection: 'inventory',
    });
  }

  const decliningProduct = productPerformance.find(
    (p) => p.changePct !== undefined && p.changePct <= -25 && p.baselineUnits && p.baselineUnits > 20
  );
  if (decliningProduct) {
    alerts.push({
      id: `alert-sales-${decliningProduct.productId}`,
      severity: 'critical',
      type: 'sales_decline',
      title: 'Sales have dropped more than usual',
      productId: decliningProduct.productId,
      productName: decliningProduct.productName,
      supportingData: `Sold ${decliningProduct.unitsSold} units vs ${decliningProduct.baselineUnits} units previously (${decliningProduct.changePct}% drop).`,
      recommendedAction: 'Check shelf visibility, pricing changes, or competitor discount activity.',
      targetSection: 'sales',
    });
  }

  const deadStockItem = inventory.find((item) => item.isDeadStock);
  if (deadStockItem) {
    alerts.push({
      id: `alert-deadstock-${deadStockItem.productId}`,
      severity: 'warning',
      type: 'dead_stock',
      title: 'Money tied up in products that are not selling',
      productId: deadStockItem.productId,
      productName: deadStockItem.productName,
      supportingData: `${deadStockItem.stockOnHand} units unsold. Estimated money tied up at cost is ${formatINR(
        deadStockItem.deadStockValue
      )}.`,
      recommendedAction: 'Put on discount, create a bundle deal, or pause future orders.',
      targetSection: 'inventory',
    });
  }

  return alerts;
}
