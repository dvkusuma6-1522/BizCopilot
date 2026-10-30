import {
  CalculatedInventoryItem,
  ChatMessage,
  PeriodSummary,
  ProductPerformance,
} from './types';
import { formatINR, formatNumber } from './analytics';

export interface CopilotContext {
  summary: PeriodSummary;
  inventory: CalculatedInventoryItem[];
  productPerformance: ProductPerformance[];
}

export function generateCopilotResponse(
  userQuery: string,
  context: CopilotContext
): Omit<ChatMessage, 'id' | 'timestamp'> {
  const q = userQuery.toLowerCase().trim();
  const { summary, inventory, productPerformance } = context;

  // 1. Specific product query?
  const matchedProduct = inventory.find(
    (p) =>
      q.includes(p.productName.toLowerCase()) ||
      q.includes(p.productId.toLowerCase()) ||
      q.includes(p.productName.toLowerCase().split(' ')[0])
  );

  if (matchedProduct && (q.includes('about') || q.includes('how is') || q.includes('status') || q.includes('stock'))) {
    const perf = productPerformance.find((p) => p.productId === matchedProduct.productId);
    const dropText =
      perf && perf.changePct !== undefined
        ? `Sales trend: ${perf.changePct > 0 ? '+' : ''}${perf.changePct}% vs previous baseline.`
        : '';

    return {
      sender: 'assistant',
      text: `**${matchedProduct.productName} (${matchedProduct.category}) Status Overview:**\n\n` +
        `• **Current Stock on Hand:** ${matchedProduct.stockOnHand} units\n` +
        `• **Average Daily Sales:** ${matchedProduct.avgDailySales} units/day\n` +
        `• **Estimated Stock Cover:** ${matchedProduct.daysOfCover} days\n` +
        `• **Supplier Lead Time:** ${matchedProduct.supplierLeadDays} days\n` +
        `• **Current Assessment:** ${matchedProduct.statusReason}\n` +
        (dropText ? `• **Velocity Trend:** ${dropText}\n` : '') +
        `\n**Recommended Action:** ${matchedProduct.suggestedAction}`,
      dataBadges: [
        { label: 'Stock on Hand', value: `${matchedProduct.stockOnHand} units`, color: 'blue' },
        { label: 'Stock Cover', value: `${matchedProduct.daysOfCover}d`, color: matchedProduct.isStockoutRisk ? 'red' : 'emerald' },
        { label: 'Supplier Lead', value: `${matchedProduct.supplierLeadDays}d`, color: 'amber' },
      ],
      suggestedFollowUps: [
        'Which products should I reorder first?',
        'Why did my sales drop this week?',
        'Give me the top three actions I should take today.',
      ],
    };
  }

  // 2. Sales Drop / Decline Intent
  if (
    q.includes('drop') ||
    q.includes('decline') ||
    q.includes('down') ||
    q.includes('why') ||
    q.includes('fell') ||
    q.includes('sales slip')
  ) {
    const declining = productPerformance.filter(
      (p) => p.changePct !== undefined && p.changePct <= -20
    );

    if (declining.length > 0) {
      const topDrop = declining[0];
      return {
        sender: 'assistant',
        text: `Based on your sales history over the last ${summary.periodDays} days, the primary sales drop is driven by **${topDrop.productName}**.\n\n` +
          `• **Current Volume:** ${topDrop.unitsSold} units sold (${formatINR(topDrop.revenue)})\n` +
          `• **Baseline Volume:** ${topDrop.baselineUnits} units sold in the previous period\n` +
          `• **Net Contraction:** **${topDrop.changePct}%** drop in unit volume\n\n` +
          `*Note: As an automated sales advisor, sales figures alone cannot pinpoint customer sentiment. However, we recommend checking if retail pricing changed, if a competitor launched a promotion, or whether shelf stock was temporarily blocked.*`,
        dataBadges: [
          { label: 'Affected Product', value: topDrop.productName, color: 'red' },
          { label: 'Volume Drop', value: `${topDrop.changePct}%`, color: 'red' },
          { label: 'Baseline Volume', value: `${topDrop.baselineUnits} units`, color: 'slate' },
        ],
        suggestedFollowUps: [
          'Which products are tying up my cash?',
          'Which products should I reorder first?',
          'What are my top-selling products?',
        ],
      };
    } else {
      return {
        sender: 'assistant',
        text: `Good news! There are no severe product-level sales contractions exceeding -20% across your active catalogue. Overall revenue changed by **${summary.revenueChangePct > 0 ? '+' : ''}${summary.revenueChangePct}%** compared to the previous period.`,
        dataBadges: [
          { label: 'Revenue Trend', value: `${summary.revenueChangePct}%`, color: summary.revenueChangePct >= 0 ? 'emerald' : 'amber' },
          { label: 'Total Revenue', value: formatINR(summary.totalRevenue), color: 'emerald' },
        ],
        suggestedFollowUps: [
          'What are my top-selling products?',
          'Which products should I reorder first?',
        ],
      };
    }
  }

  // 3. Reorder / Stockout / Delivery Intent
  if (
    q.includes('reorder') ||
    q.includes('stockout') ||
    q.includes('run out') ||
    q.includes('delivery') ||
    q.includes('depleted') ||
    q.includes('supplier')
  ) {
    const stockoutItems = inventory.filter((i) => i.isStockoutRisk);
    const warningItems = inventory.filter(
      (i) => !i.isStockoutRisk && (i.stockOnHand <= i.reorderLevel || i.daysOfCover <= i.supplierLeadDays * 1.5)
    );

    if (stockoutItems.length > 0) {
      const urgent = stockoutItems[0];
      return {
        sender: 'assistant',
        text: `**${urgent.productName}** needs attention first before all other items!\n\n` +
          `• **Current Stock:** ${urgent.stockOnHand} units\n` +
          `• **Daily Customer Demand:** ~${urgent.avgDailySales} units/day\n` +
          `• **Days of Cover Remaining:** ~${urgent.daysOfCover} days\n` +
          `• **Supplier Delivery Lead Time:** **${urgent.supplierLeadDays} days**\n\n` +
          `⚠️ **Critical Warning:** Your current stock will be exhausted in ~${urgent.daysOfCover} days, but delivery requires ${urgent.supplierLeadDays} days. You face an imminent stockout.\n\n` +
          `**Immediate Action:** Issue an expedited purchase order for **${urgent.recommendedReorderQty} units** today.` +
          (warningItems.length > 0
            ? `\n\n*Secondary items approaching reorder threshold: ${warningItems.map((w) => w.productName).join(', ')}.*`
            : ''),
        dataBadges: [
          { label: 'Priority Reorder', value: urgent.productName, color: 'red' },
          { label: 'Stock Cover', value: `${urgent.daysOfCover} days`, color: 'red' },
          { label: 'Lead Time', value: `${urgent.supplierLeadDays} days`, color: 'amber' },
          { label: 'Suggested Order', value: `${urgent.recommendedReorderQty} units`, color: 'blue' },
        ],
        suggestedFollowUps: [
          'Give me the top three actions I should take today.',
          'Which products are tying up my cash?',
          'What are my top-selling products?',
        ],
      };
    } else {
      return {
        sender: 'assistant',
        text: `No products currently exhibit emergency stockout risk. All products possess sufficient days of inventory cover to bridge their supplier delivery windows.\n\n` +
          (warningItems.length > 0
            ? `However, ${warningItems.length} product(s) are nearing their reorder levels: **${warningItems.map((i) => i.productName).join(', ')}**.`
            : 'All stock levels are currently within safe operational buffers.'),
        dataBadges: [
          { label: 'Stockout Risk Items', value: '0', color: 'emerald' },
          { label: 'Buffer Status', value: 'Safe', color: 'emerald' },
        ],
        suggestedFollowUps: [
          'What are my top-selling products?',
          'Which products are tying up my cash?',
        ],
      };
    }
  }

  // 4. Dead Stock / Cash Tied Up Intent
  if (
    q.includes('cash') ||
    q.includes('dead') ||
    q.includes('tied up') ||
    q.includes('slow') ||
    q.includes('stagnant') ||
    q.includes('capital')
  ) {
    const deadItems = inventory.filter((i) => i.isDeadStock);

    if (deadItems.length > 0) {
      const totalDeadVal = deadItems.reduce((acc, i) => acc + i.deadStockValue, 0);
      const itemsList = deadItems
        .map(
          (i) =>
            `• **${i.productName}**: ${i.stockOnHand} units on hand, only ${i.unitsSoldInPeriod} sold in ${summary.periodDays} days (${formatINR(i.deadStockValue)} tied up at cost).`
        )
        .join('\n');

      return {
        sender: 'assistant',
        text: `You currently have **${formatINR(totalDeadVal)}** in working capital tied up in slow-moving or dead stock:\n\n` +
          `${itemsList}\n\n` +
          `**Recommendations to Liberate Cash:**\n` +
          `1. **Bundle Deal:** Bundle slow-moving items with high-turnover staples (e.g. Basmati Rice or Noodles).\n` +
          `2. **Clearance Promotion:** Apply an immediate 15% to 20% markdown.\n` +
          `3. **Supplier Return:** If sale-or-return terms exist with your distributor, request an exchange credit.`,
        dataBadges: [
          { label: 'Dead Stock Value', value: formatINR(totalDeadVal), color: 'amber' },
          { label: 'Stagnant Products', value: `${deadItems.length}`, color: 'amber' },
        ],
        suggestedFollowUps: [
          'Which products should I reorder first?',
          'What are my top-selling products?',
          'Give me the top three actions I should take today.',
        ],
      };
    } else {
      return {
        sender: 'assistant',
        text: `Inventory turnover is healthy! No products currently meet the dead stock threshold (fewer than 2 units sold over 14+ days with large holding stock).`,
        dataBadges: [
          { label: 'Dead Stock Value', value: '₹0', color: 'emerald' },
          { label: 'Turnover Status', value: 'Active', color: 'emerald' },
        ],
        suggestedFollowUps: [
          'What are my top-selling products?',
          'Which products should I reorder first?',
        ],
      };
    }
  }

  // 5. Top-Selling Products Intent
  if (
    q.includes('top') ||
    q.includes('best') ||
    q.includes('highest') ||
    q.includes('leaders') ||
    q.includes('popular')
  ) {
    const top3 = productPerformance.slice(0, 3);
    const topList = top3
      .map(
        (p, idx) =>
          `${idx + 1}. **${p.productName}** — ${formatINR(p.revenue)} revenue (${formatNumber(p.unitsSold)} units, ${p.shareOfRevenue}% of total sales)`
      )
      .join('\n');

    return {
      sender: 'assistant',
      text: `Here are your top-performing products by revenue over the last ${summary.periodDays} days:\n\n` +
        `${topList}\n\n` +
        `Together, these top 3 products generate **${top3.reduce((acc, p) => acc + p.shareOfRevenue, 0).toFixed(1)}%** of your store's total revenue. Ensure supplier relationships and shelf availability for these items remain spotless.`,
      dataBadges: top3.map((p) => ({
        label: p.productName.split(' ')[0],
        value: formatINR(p.revenue),
        color: 'emerald',
      })),
      suggestedFollowUps: [
        'Which products should I reorder first?',
        'Why did my sales drop this week?',
        'Which products are tying up my cash?',
      ],
    };
  }

  // 6. Top Three Actions / Today's Checklist
  if (
    q.includes('action') ||
    q.includes('today') ||
    q.includes('do') ||
    q.includes('priority') ||
    q.includes('checklist') ||
    q.includes('plan')
  ) {
    const stockout = inventory.find((i) => i.isStockoutRisk);
    const drop = productPerformance.find(
      (p) => p.changePct !== undefined && p.changePct <= -20
    );
    const dead = inventory.find((i) => i.isDeadStock);

    const actions: string[] = [];
    if (stockout) {
      actions.push(
        `1. 🚨 **Prevent Stockout on ${stockout.productName}:** Reorder ${stockout.recommendedReorderQty} units immediately. Stock cover (${stockout.daysOfCover}d) is lower than supplier lead time (${stockout.supplierLeadDays}d).`
      );
    } else {
      actions.push(`1. ✅ **Stock Levels:** Inventory buffers are safe today.`);
    }

    if (drop) {
      actions.push(
        `2. 📉 **Investigate Sales Contraction on ${drop.productName}:** Sales fell ${Math.abs(drop.changePct!)}% vs baseline. Verify shelf stock and competitor pricing.`
      );
    } else {
      actions.push(`2. 📈 **Sales Velocity:** Product turnover is stable across core categories.`);
    }

    if (dead) {
      actions.push(
        `3. 💰 **Liquidate Dead Stock for ${dead.productName}:** ${dead.stockOnHand} packets remain unsold (${formatINR(dead.deadStockValue)} trapped). Bundle with high-moving snacks.`
      );
    } else {
      actions.push(`3. 📦 **Working Capital:** Dead stock is minimal.`);
    }

    return {
      sender: 'assistant',
      text: `Here are the top three high-impact actions for **FreshMart Grocery** today:\n\n` +
        actions.join('\n\n') +
        `\n\n*Execute these actions in order of priority to protect revenue and maximize cash flow.*`,
      dataBadges: [
        { label: 'Priority 1', value: stockout ? stockout.productName : 'Restock Normal', color: 'red' },
        { label: 'Priority 2', value: drop ? drop.productName : 'Monitor Sales', color: 'amber' },
        { label: 'Priority 3', value: dead ? dead.productName : 'Working Capital OK', color: 'blue' },
      ],
      suggestedFollowUps: [
        'Which products should I reorder first?',
        'Why did my sales drop this week?',
        'Which products are tying up my cash?',
      ],
    };
  }

  // Fallback: Intelligent overview of store performance
  return {
    sender: 'assistant',
    text: `I am your **BizCopilot Advisor** for FreshMart Grocery. Here is what I can analyze right now:\n\n` +
      `• **Total Period Revenue:** ${formatINR(summary.totalRevenue)} (${summary.revenueChangePct > 0 ? '+' : ''}${summary.revenueChangePct}% vs previous window)\n` +
      `• **Total Units Sold:** ${formatNumber(summary.totalUnitsSold)} units\n` +
      `• **Stockout Exposure:** ${summary.stockoutRiskCount} product(s) at critical risk\n` +
      `• **Dead Stock Tied Up:** ${formatINR(summary.deadStockTotalCost)}\n\n` +
      `Try asking me specific questions like:\n` +
      `• *"Why did my sales drop this week?"*\n` +
      `• *"Which products should I reorder first?"*\n` +
      `• *"Which products are tying up my cash?"*\n` +
      `• *"Give me the top three actions I should take today."*`,
    dataBadges: [
      { label: 'Revenue', value: formatINR(summary.totalRevenue), color: 'emerald' },
      { label: 'Stockout Risks', value: `${summary.stockoutRiskCount}`, color: summary.stockoutRiskCount > 0 ? 'red' : 'emerald' },
      { label: 'Dead Stock', value: formatINR(summary.deadStockTotalCost), color: 'amber' },
    ],
    suggestedFollowUps: [
      'Which products should I reorder first?',
      'Why did my sales drop this week?',
      'Give me the top three actions I should take today.',
      'Which products are tying up my cash?',
    ],
  };
}
