import { describe, it, expect } from 'vitest';
import {
  buildDigest,
  renderDigestActionText,
  generateWhatsAppDigestShareText,
  DigestAction,
} from './digest';
import { CalculatedInventoryItem, ProductPerformance } from '@/lib/types';
import { Festival } from '@/lib/festivals/data';

describe('Daily Digest Engine', () => {
  const mockInventory: CalculatedInventoryItem[] = [
    {
      productId: 'P1',
      productName: 'Sunflower Oil 1L',
      category: 'Edible Oils',
      stockOnHand: 3,
      reorderLevel: 15,
      supplierLeadDays: 4,
      unitCost: 120,
      retailPrice: 155,
      unitsSoldInPeriod: 28,
      avgDailySales: 2,
      daysOfCover: 1.5,
      status: 'critical',
      statusReason: 'Stockout risk',
      friendlyStatusText: '1.5 days left',
      isStockoutRisk: true,
      isDeadStock: false,
      isOverstocked: false,
      deadStockValue: 0,
      suggestedAction: 'Order 20 units',
      recommendedReorderQty: 20,
      howCalculated: '3 / 2 = 1.5 days',
    },
    {
      productId: 'P2',
      productName: 'Pure Ghee 500ml',
      category: 'Dairy',
      stockOnHand: 4,
      reorderLevel: 12,
      supplierLeadDays: 3,
      unitCost: 320,
      retailPrice: 360,
      unitsSoldInPeriod: 14,
      avgDailySales: 1,
      daysOfCover: 4,
      status: 'warning',
      statusReason: 'Low',
      friendlyStatusText: '4 days left',
      isStockoutRisk: false,
      isDeadStock: false,
      isOverstocked: false,
      deadStockValue: 0,
      suggestedAction: 'Order 15 units',
      recommendedReorderQty: 15,
      howCalculated: '4 / 1 = 4 days',
    },
    {
      productId: 'P3',
      productName: 'Instant Noodle Pack 12x',
      category: 'Snacks',
      stockOnHand: 45,
      reorderLevel: 10,
      supplierLeadDays: 2,
      unitCost: 110,
      retailPrice: 140,
      unitsSoldInPeriod: 1,
      avgDailySales: 0.1,
      daysOfCover: 450,
      status: 'warning',
      statusReason: 'Dead stock',
      friendlyStatusText: '450 days left',
      isStockoutRisk: false,
      isDeadStock: true,
      isOverstocked: true,
      deadStockValue: 4950,
      suggestedAction: 'Discount 20%',
      recommendedReorderQty: 0,
      howCalculated: '45 * 110 = 4950',
    },
  ];

  const mockPerformance: ProductPerformance[] = [
    {
      productId: 'P4',
      productName: 'Basmati Rice 5kg',
      category: 'Grains',
      revenue: 4500,
      unitsSold: 9,
      shareOfRevenue: 12,
      baselineUnits: 25,
      changePct: -64,
      abcClass: 'A',
      abcDescription: 'Top revenue',
    },
  ];

  const mockFestivals: Festival[] = [
    {
      id: 'fest_diwali',
      name: { en: 'Diwali', kn: 'ದೀಪಾವಳಿ', hi: 'दीपावली' },
      date: '2026-11-08',
      type: 'festival',
      regions: 'all',
      categories: 'all',
      commonlyInDemand: { en: ['Ghee'], kn: ['ತುಪ್ಪ'], hi: ['घी'] },
      tip: { en: 'Stock ghee', kn: 'ತುಪ್ಪ ಇಟ್ಟುಕೊಳ್ಳಿ', hi: 'घी रखें' },
      keywords: ['ghee'],
      verified: true,
    },
  ];

  it('builds top 3 actions ranked by urgency (stockout, festival reorder, sales drop, dead stock)', () => {
    // Today is 6 days before festival: 2026-11-02
    // Ghee has 4 days of cover < 6 days until festival + 3 lead days (9) => festival reorder now!
    const today = '2026-11-02';
    const digest = buildDigest(mockInventory, mockPerformance, mockFestivals, today, 'kirana');

    expect(digest.actions.length).toBeLessThanOrEqual(3);
    expect(digest.actions.length).toBe(3);

    // 1st should be critical stockout (P1 Sunflower Oil)
    expect(digest.actions[0].type).toBe('stockout');
    expect(digest.actions[0].productId).toBe('P1');
    expect(digest.actions[0].priority).toBe('critical');

    // 2nd should be festival reorder (P2 Pure Ghee)
    expect(digest.actions[1].type).toBe('festival_reorder');
    expect(digest.actions[1].productId).toBe('P2');

    // 3rd should be sales drop (P4 Basmati Rice)
    expect(digest.actions[2].type).toBe('sales_drop');
    expect(digest.actions[2].productId).toBe('P4');
  });

  it('caps digest actions at exactly 3 even if more problems exist', () => {
    const today = '2026-11-02';
    const digest = buildDigest(mockInventory, mockPerformance, mockFestivals, today, 'kirana');
    expect(digest.actions.length).toBe(3);
  });

  it('handles empty inventory and returns empty actions list', () => {
    const digest = buildDigest([], [], [], '2026-05-01', 'kirana');
    expect(digest.actions).toEqual([]);
  });

  it('renders deterministic trilingual text containing exact numbers', () => {
    const action: DigestAction = {
      id: 'act-1',
      type: 'stockout',
      priority: 'critical',
      productId: 'P1',
      productName: 'Sunflower Oil 1L',
      params: {
        productName: 'Sunflower Oil 1L',
        daysOfCover: 1.5,
        leadDays: 4,
        reorderQty: 20,
      },
    };

    const en = renderDigestActionText(action, 'en');
    expect(en.explanation).toContain('1.5');
    expect(en.explanation).toContain('4');
    expect(en.actionText).toContain('20');

    const kn = renderDigestActionText(action, 'kn');
    expect(kn.explanation).toContain('1.5');
    expect(kn.explanation).toContain('4');
    expect(kn.actionText).toContain('20');

    const hi = renderDigestActionText(action, 'hi');
    expect(hi.explanation).toContain('1.5');
    expect(hi.explanation).toContain('4');
    expect(hi.actionText).toContain('20');
  });

  it('generates a valid encoded WhatsApp share string', () => {
    const today = '2026-11-02';
    const digest = buildDigest(mockInventory, mockPerformance, mockFestivals, today, 'kirana');
    const shareUrlParam = generateWhatsAppDigestShareText('FreshMart', digest, 'en');

    expect(typeof shareUrlParam).toBe('string');
    const decoded = decodeURIComponent(shareUrlParam);
    expect(decoded).toContain('FreshMart');
    expect(decoded).toContain('Sunflower Oil 1L');
  });
});
