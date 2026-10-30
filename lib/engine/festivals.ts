import { Festival, FESTIVALS_DATA } from '@/lib/festivals/data';
import { CalculatedInventoryItem, InventoryItem } from '@/lib/types';

export interface FestivalProductStockCheck {
  productId: string;
  productName: string;
  stockOnHand: number;
  avgDailySales: number;
  daysOfCover: number;
  leadDays: number;
  daysUntilFestival: number;
  status: 'ok' | 'reorder soon' | 'reorder now';
  recommendedOrderQty: number;
  matchedKeyword: string;
}

function parseDateOnly(d: string | Date): Date {
  if (typeof d === 'string') {
    const s = d.slice(0, 10);
    return new Date(`${s}T00:00:00`);
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Returns festival effective date for proximity calculation
 */
export function getFestivalEffectiveDate(festival: Festival): string {
  if (festival.date) return festival.date;
  if (festival.dateRange) return festival.dateRange.start;
  return '2099-01-01';
}

/**
 * Returns upcoming festivals within a window of days, optionally filtered by category
 */
export function upcomingFestivals(
  today: string | Date = new Date(),
  categoryId: string = 'all',
  windowDays: number = 60,
  allFestivals: Festival[] = FESTIVALS_DATA
): Festival[] {
  const todayDate = parseDateOnly(today);
  const maxDate = new Date(todayDate.getTime() + windowDays * 24 * 60 * 60 * 1000);

  return allFestivals
    .filter((festival) => {
      // 1. Category check
      if (categoryId && categoryId !== 'all') {
        if (festival.categories !== 'all' && !festival.categories.includes(categoryId)) {
          return false;
        }
      }

      // 2. Date window check
      if (festival.date) {
        const festDate = parseDateOnly(festival.date);
        return festDate >= todayDate && festDate <= maxDate;
      }

      if (festival.dateRange) {
        const startDate = parseDateOnly(festival.dateRange.start);
        const endDate = parseDateOnly(festival.dateRange.end);
        // Include if currently active or starting within the window
        return endDate >= todayDate && startDate <= maxDate;
      }

      return false;
    })
    .sort((a, b) => {
      const dateA = parseDateOnly(getFestivalEffectiveDate(a)).getTime();
      const dateB = parseDateOnly(getFestivalEffectiveDate(b)).getTime();
      return dateA - dateB;
    });
}

/**
 * Matches festival keywords against the store's inventory and computes stock sufficiency
 * using existing Days of Cover & Lead Time replenishment formulas.
 */
export function stockCheckForFestival(
  festival: Festival,
  products: (CalculatedInventoryItem | InventoryItem)[],
  today: string | Date = new Date()
): FestivalProductStockCheck[] {
  const todayDate = parseDateOnly(today);
  const festEffectiveStr = getFestivalEffectiveDate(festival);
  const festDate = parseDateOnly(festEffectiveStr);
  const diffTime = festDate.getTime() - todayDate.getTime();
  const daysUntilFestival = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const checks: FestivalProductStockCheck[] = [];
  const normalizedKeywords = festival.keywords.map((k) => k.toLowerCase().trim());

  for (const product of products) {
    const nameLower = product.productName.toLowerCase();
    const matchedKw = normalizedKeywords.find((kw) => nameLower.includes(kw));

    if (!matchedKw) continue;

    // Determine velocity & days of cover using existing formulas
    const calc = product as CalculatedInventoryItem;
    const avgDailySales =
      calc.avgDailySales !== undefined
        ? calc.avgDailySales
        : calc.unitsSoldInPeriod !== undefined
        ? Number((calc.unitsSoldInPeriod / 14).toFixed(2))
        : 1; // sensible fallback

    const daysOfCover =
      calc.daysOfCover !== undefined
        ? calc.daysOfCover
        : avgDailySales > 0
        ? Number((product.stockOnHand / avgDailySales).toFixed(1))
        : product.stockOnHand > 0
        ? 999
        : 0;

    const leadDays = product.supplierLeadDays || 3;
    const bufferDays = 3;

    // Status: ok / reorder soon / reorder now
    let status: 'ok' | 'reorder soon' | 'reorder now' = 'ok';
    if (daysOfCover < daysUntilFestival + leadDays) {
      status = 'reorder now';
    } else if (daysOfCover < daysUntilFestival + leadDays + bufferDays) {
      status = 'reorder soon';
    }

    // Recommended reorder quantity: velocity * (lead_days + buffer_days) - stock_on_hand
    const recommendedOrderQty = Math.max(
      0,
      Math.ceil(avgDailySales * (leadDays + bufferDays) - product.stockOnHand)
    );

    checks.push({
      productId: product.productId,
      productName: product.productName,
      stockOnHand: product.stockOnHand,
      avgDailySales,
      daysOfCover,
      leadDays,
      daysUntilFestival,
      status,
      recommendedOrderQty,
      matchedKeyword: matchedKw,
    });
  }

  // Sort urgent items first (reorder now -> reorder soon -> ok)
  return checks.sort((a, b) => {
    const priority = { 'reorder now': 0, 'reorder soon': 1, ok: 2 };
    return priority[a.status] - priority[b.status];
  });
}

/**
 * Checks whether an in-app reminder is due (exact 14 days or 3 days before festival)
 */
export function reminderDue(
  festival: Festival,
  today: string | Date = new Date()
): boolean {
  const todayDate = parseDateOnly(today);
  const festEffectiveStr = getFestivalEffectiveDate(festival);
  const festDate = parseDateOnly(festEffectiveStr);

  const diffDays = Math.round(
    (festDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays === 14 || diffDays === 3;
}
