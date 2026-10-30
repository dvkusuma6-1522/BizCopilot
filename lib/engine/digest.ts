import { CalculatedInventoryItem, ProductPerformance } from '@/lib/types';
import { Festival, FESTIVALS_DATA } from '@/lib/festivals/data';
import { upcomingFestivals, stockCheckForFestival } from './festivals';
import { SupportedLanguage } from '@/lib/i18n';

export type DigestActionType = 'stockout' | 'festival_reorder' | 'sales_drop' | 'dead_stock';

export interface DigestAction {
  id: string;
  type: DigestActionType;
  priority: 'critical' | 'warning' | 'info';
  productId?: string;
  productName?: string;
  festivalId?: string;
  festivalName?: string;
  params: {
    productName?: string;
    daysOfCover?: number;
    leadDays?: number;
    stockOnHand?: number;
    reorderQty?: number;
    dropPct?: number;
    currentUnits?: number;
    previousUnits?: number;
    deadStockValue?: number;
    festivalName?: string;
    daysUntilFestival?: number;
    [key: string]: string | number | undefined;
  };
}

export interface DailyDigest {
  date: string;
  categoryId: string;
  actions: DigestAction[];
}

export interface DigestActionRenderedText {
  title: string;
  explanation: string;
  actionText: string;
}

/**
 * Builds the top 3 actions ranked strictly by urgency:
 * 1. Critical stockouts (cover < lead days)
 * 2. Upcoming festival reorders (reorder now)
 * 3. Significant sales drops (changePct <= -25%)
 * 4. High dead stock exposure
 */
export function buildDigest(
  inventory: CalculatedInventoryItem[] = [],
  productPerformance: ProductPerformance[] = [],
  festivals: Festival[] = FESTIVALS_DATA,
  today: string | Date = new Date(),
  categoryId: string = 'all'
): DailyDigest {
  const dateStr =
    typeof today === 'string'
      ? today.slice(0, 10)
      : today.toISOString().slice(0, 10);

  const candidateActions: DigestAction[] = [];

  // 1. Critical stockout candidates (Priority 1)
  const stockoutRiskItems = inventory
    .filter((i) => i.isStockoutRisk)
    .sort((a, b) => a.daysOfCover - b.daysOfCover);

  for (const item of stockoutRiskItems) {
    const lead = item.supplierLeadDays || 3;
    const reorderQty = item.recommendedReorderQty || item.reorderLevel || 10;
    candidateActions.push({
      id: `digest-stockout-${item.productId}`,
      type: 'stockout',
      priority: 'critical',
      productId: item.productId,
      productName: item.productName,
      params: {
        productName: item.productName,
        daysOfCover: item.daysOfCover,
        leadDays: lead,
        stockOnHand: item.stockOnHand,
        reorderQty,
      },
    });
  }

  // 2. Upcoming festival reorders (Priority 2)
  const upcoming = upcomingFestivals(today, categoryId, 30, festivals);
  for (const fest of upcoming) {
    const checks = stockCheckForFestival(fest, inventory, today);
    const reorderNowItems = checks.filter((c) => c.status === 'reorder now');
    for (const check of reorderNowItems) {
      // Avoid duplicating product if already in stockout list
      if (!candidateActions.some((a) => a.productId === check.productId)) {
        candidateActions.push({
          id: `digest-fest-${fest.id}-${check.productId}`,
          type: 'festival_reorder',
          priority: 'critical',
          productId: check.productId,
          productName: check.productName,
          festivalId: fest.id,
          festivalName: fest.name.en,
          params: {
            productName: check.productName,
            festivalName: fest.name.en,
            daysUntilFestival: check.daysUntilFestival,
            daysOfCover: check.daysOfCover,
            reorderQty: check.recommendedOrderQty || 15,
            leadDays: check.leadDays,
            stockOnHand: check.stockOnHand,
          },
        });
      }
    }
  }

  // 3. Significant sales drops (Priority 3)
  const droppedProducts = productPerformance
    .filter((p) => p.changePct !== undefined && p.changePct <= -25 && (p.baselineUnits || 0) >= 10)
    .sort((a, b) => (a.changePct || 0) - (b.changePct || 0));

  for (const p of droppedProducts) {
    if (!candidateActions.some((a) => a.productId === p.productId)) {
      candidateActions.push({
        id: `digest-drop-${p.productId}`,
        type: 'sales_drop',
        priority: 'warning',
        productId: p.productId,
        productName: p.productName,
        params: {
          productName: p.productName,
          dropPct: Math.abs(Math.round(p.changePct || 0)),
          currentUnits: p.unitsSold,
          previousUnits: p.baselineUnits || 0,
        },
      });
    }
  }

  // 4. Dead stock with high capital locked (Priority 4)
  const deadStockItems = inventory
    .filter((i) => i.isDeadStock && i.deadStockValue > 500)
    .sort((a, b) => b.deadStockValue - a.deadStockValue);

  for (const item of deadStockItems) {
    if (!candidateActions.some((a) => a.productId === item.productId)) {
      candidateActions.push({
        id: `digest-dead-${item.productId}`,
        type: 'dead_stock',
        priority: 'warning',
        productId: item.productId,
        productName: item.productName,
        params: {
          productName: item.productName,
          deadStockValue: Math.round(item.deadStockValue),
          stockOnHand: item.stockOnHand,
        },
      });
    }
  }

  // Limit to at most top 3 actions
  return {
    date: dateStr,
    categoryId,
    actions: candidateActions.slice(0, 3),
  };
}

/**
 * Renders a digest action into deterministic, owner-friendly language for en/kn/hi
 */
export function renderDigestActionText(
  action: DigestAction,
  lang: SupportedLanguage = 'en'
): DigestActionRenderedText {
  const p = action.params;
  const prod = (p.productName as string) || 'Product';

  switch (action.type) {
    case 'stockout': {
      const days = p.daysOfCover ?? 0;
      const lead = p.leadDays ?? 3;
      const qty = p.reorderQty ?? 10;

      if (lang === 'kn') {
        return {
          title: `${prod} ಖಾಲಿಯಾಗುವ ಭೀತಿ`,
          explanation: `${prod} ಕೇವಲ ಸುಮಾರು ${days} ದಿನಗಳಿಗಾಗುವಷ್ಟಿದೆ. ಪೂರೈಕೆದಾರರು ತಲುಪಿಸಲು ${lead} ದಿನ ಬೇಕು.`,
          actionText: `ತಕ್ಷಣ ಸಪ್ಲೈಯರ್‌ಗೆ ಕರೆ ಮಾಡಿ ${qty} ಯೂನಿಟ್ ಆರ್ಡರ್ ಮಾಡಿ.`,
        };
      }
      if (lang === 'hi') {
        return {
          title: `${prod} ख़त्म होने का जोखिम`,
          explanation: `${prod} केवल लगभग ${days} दिन का बचा है। सप्लायर को माल भेजने में ${lead} दिन लगते हैं।`,
          actionText: `सप्लायर को फोन करके ${qty} यूनिट तुरंत ऑर्डर करें।`,
        };
      }
      return {
        title: `${prod} stockout risk`,
        explanation: `About ${days} days of ${prod} left, but supplier takes ${lead} days to deliver.`,
        actionText: `Call supplier today and reorder ${qty} units.`,
      };
    }

    case 'festival_reorder': {
      const fest = (p.festivalName as string) || 'Festival';
      const daysUntil = p.daysUntilFestival ?? 0;
      const cover = p.daysOfCover ?? 0;
      const qty = p.reorderQty ?? 15;

      if (lang === 'kn') {
        return {
          title: `${fest} ಹಬ್ಬದ ತಯಾರಿ: ${prod}`,
          explanation: `${fest} ಇನ್ನು ${daysUntil} ದಿನಗಳಲ್ಲಿದೆ. ಆದರೆ ನಿಮ್ಮ ಬಳಿ ${cover} ದಿನಗಳ ಸ್ಟಾಕ್ ಮಾತ್ರ ಇದೆ.`,
          actionText: `ಹಬ್ಬದ ಗಡಿಬಿಡಿಯ ಮುನ್ನ ${qty} ಯೂನಿಟ್ ಆರ್ಡರ್ ಮಾಡಿ.`,
        };
      }
      if (lang === 'hi') {
        return {
          title: `${fest} त्यौहार तैयारी: ${prod}`,
          explanation: `${fest} में ${daysUntil} दिन बाकी हैं, लेकिन आपके पास सिर्फ ${cover} दिन का स्टॉक है।`,
          actionText: `त्यौहार की भीड़ से पहले ${qty} यूनिट ऑर्डर करें।`,
        };
      }
      return {
        title: `${fest} preparation: ${prod}`,
        explanation: `${fest} is in ${daysUntil} days, but you only have ${cover} days of stock left.`,
        actionText: `Reorder ${qty} units before the holiday rush.`,
      };
    }

    case 'sales_drop': {
      const drop = p.dropPct ?? 25;
      const cur = p.currentUnits ?? 0;
      const prev = p.previousUnits ?? 0;

      if (lang === 'kn') {
        return {
          title: `${prod} ಮಾರಾಟ ಕುಸಿತ`,
          explanation: `${prod} ಮಾರಾಟ ${drop}% ಕುಸಿದಿದೆ (${prev} ರಿಂದ ${cur} ಯೂನಿಟ್‌ಗೆ).`,
          actionText: `ಶೆಲ್ಫ್‌ನಲ್ಲಿ ವಸ್ತು ಇದೆಯೇ ಮತ್ತು ಬೆಲೆ ಸರಿಯಾಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.`,
        };
      }
      if (lang === 'hi') {
        return {
          title: `${prod} की बिक्री में गिरावट`,
          explanation: `${prod} की बिक्री ${drop}% गिरी है (${prev} से घटकर ${cur} यूनिट)।`,
          actionText: `शेल्फ पर माल और काउंटर डिस्प्ले की तुरंत जाँच करें।`,
        };
      }
      return {
        title: `${prod} sales drop`,
        explanation: `${prod} sales dropped by ${drop}% (from ${prev} to ${cur} units).`,
        actionText: `Check shelf stock, display placement, and competitor pricing.`,
      };
    }

    case 'dead_stock': {
      const value = (p.deadStockValue as number) || 0;
      const units = p.stockOnHand ?? 0;

      if (lang === 'kn') {
        return {
          title: `${prod} ನಲ್ಲಿ ಹಣ ಸಿಲುಕಿದೆ`,
          explanation: `ಮಾರಾಟವಾಗದೆ ಉಳಿದಿರುವ ${units} ಯೂನಿಟ್‌ಗಳಲ್ಲಿ ₹${value.toLocaleString('en-IN')} ಸಿಲುಕಿದೆ.`,
          actionText: `ಕಾಂಬೊ ಆಫರ್ ನೀಡಿ ಅಥವಾ ರಿಯಾಯಿತಿ ಕೊಟ್ಟು ನಗದನ್ನು ಮುಕ್ತಗೊಳಿಸಿ.`,
        };
      }
      if (lang === 'hi') {
        return {
          title: `${prod} में कैश अटका हुआ है`,
          explanation: `बिना बिकी ${units} यूनिटों में ₹${value.toLocaleString('en-IN')} की कार्यशील पूँजी फँसी है।`,
          actionText: `फास्ट-सेलिंग सामान के साथ बंडल करें या छूट देकर कैश निकालें।`,
        };
      }
      return {
        title: `Money tied up in ${prod}`,
        explanation: `₹${value.toLocaleString('en-IN')} is tied up across ${units} unsold units on shelf.`,
        actionText: `Bundle with fast-selling staples or run a clearance discount.`,
      };
    }
  }
}

/**
 * Generates formatted text for click-to-chat WhatsApp sharing
 */
export function generateWhatsAppDigestShareText(
  storeName: string,
  digest: DailyDigest,
  lang: SupportedLanguage = 'en'
): string {
  const header =
    lang === 'kn'
      ? `📋 *${storeName} - ಇಂದಿನ BizCopilot ಸಲಹೆಗಳು* (${digest.date})\n\n`
      : lang === 'hi'
      ? `📋 *${storeName} - आज की BizCopilot मुख्य सलाहें* (${digest.date})\n\n`
      : `📋 *${storeName} - Today's BizCopilot Action Digest* (${digest.date})\n\n`;

  if (digest.actions.length === 0) {
    const allGood =
      lang === 'kn'
        ? `✅ ನಿಮ್ಮ ಅಂಗಡಿಯಲ್ಲಿ ಎಲ್ಲಾ ವಸ್ತುಗಳ ದಾಸ್ತಾನು ಮತ್ತು ಮಾರಾಟ ಸ್ಥಿತಿ ಉತ್ತಮವಾಗಿದೆ.`
        : lang === 'hi'
        ? `✅ आपकी दुकान में स्टॉक और बिक्री की स्थिति सामान्य और संतुलित है।`
        : `✅ All product stocks and sales velocity are currently healthy.`;
    return encodeURIComponent(header + allGood);
  }

  const items = digest.actions.map((action, idx) => {
    const text = renderDigestActionText(action, lang);
    return `${idx + 1}. *${text.title}*\n   • ${text.explanation}\n   👉 *ಸಲಹೆ:* ${text.actionText}`;
  });

  const footer =
    lang === 'kn'
      ? `\n\n_BizCopilot ನಿಖರ ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ ರಚಿಸಲಾಗಿದೆ._`
      : lang === 'hi'
      ? `\n\n_BizCopilot सटीक गणना द्वारा संचालित।_`
      : `\n\n_Generated by BizCopilot local inventory advisor._`;

  return encodeURIComponent(header + items.join('\n\n') + footer);
}
