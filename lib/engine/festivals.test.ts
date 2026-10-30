import { describe, it, expect } from 'vitest';
import {
  upcomingFestivals,
  stockCheckForFestival,
  reminderDue,
  getFestivalEffectiveDate,
} from './festivals';
import { Festival } from '@/lib/festivals/data';
import { CalculatedInventoryItem } from '@/lib/types';

describe('Festivals Engine', () => {
  const sampleFestivals: Festival[] = [
    {
      id: 'test_festival_soon',
      name: { en: 'Sweet Festival', kn: 'ಸಿಹಿ ಹಬ್ಬ', hi: 'मिठाई त्यौहार' },
      date: '2026-04-10',
      type: 'festival',
      regions: 'all',
      categories: ['kirana', 'restaurant'],
      commonlyInDemand: { en: ['Jaggery', 'Ghee'], kn: ['ಬೆಲ್ಲ', 'ತುಪ್ಪ'], hi: ['गुड़', 'घी'] },
      tip: { en: 'Order sweets early', kn: 'ಬೇಗನೆ ಆರ್ಡರ್ ಮಾಡಿ', hi: 'जल्दी आर्डर करें' },
      keywords: ['jaggery', 'ghee', 'bella'],
      verified: true,
    },
    {
      id: 'test_apparel_festival',
      name: { en: 'Textile Utsav', kn: 'ವಸ್ತ್ರೋತ್ಸವ', hi: 'वस्त्रोत्सव' },
      date: '2026-04-25',
      type: 'festival',
      regions: 'all',
      categories: ['apparel'],
      commonlyInDemand: { en: ['Silk Sarees'], kn: ['ರೇಷ್ಮೆ ಸೀರೆ'], hi: ['सिल्क साड़ी'] },
      tip: { en: 'Stock silk', kn: 'ರೇಷ್ಮೆ ದಾಸ್ತಾನು ಮಾಡಿ', hi: 'सिल्क रखें' },
      keywords: ['saree', 'silk'],
      verified: true,
    },
    {
      id: 'test_season_range',
      name: { en: 'Summer Rush', kn: 'ಬೇಸಿಗೆ ಸಮಯ', hi: 'ग्रीष्म सत्र' },
      dateRange: { start: '2026-04-01', end: '2026-05-31' },
      type: 'season',
      regions: 'all',
      categories: 'all',
      commonlyInDemand: { en: ['Cold Drink'], kn: ['ತಂಪು ಪಾನೀಯ'], hi: ['कोल्ड ड्रिंक'] },
      tip: { en: 'Keep drinks chilled', kn: 'ತಂಪಾಗಿಡಿ', hi: 'ठंडा रखें' },
      keywords: ['cold drink', 'juice', 'soda'],
      verified: true,
    },
    {
      id: 'test_past_festival',
      name: { en: 'Past Event', kn: 'ಹಿಂದಿನ ಕಾರ್ಯಕ್ರಮ', hi: 'पिछला कार्यक्रम' },
      date: '2026-01-01',
      type: 'festival',
      regions: 'all',
      categories: 'all',
      commonlyInDemand: { en: ['Old Item'], kn: ['ಹಳೆಯದು'], hi: ['पुरानी वस्तु'] },
      tip: { en: 'Already over', kn: 'ಮುಗಿದಿದೆ', hi: 'समाप्त' },
      keywords: ['old'],
      verified: true,
    },
  ];

  describe('upcomingFestivals', () => {
    it('returns upcoming festivals within window and excludes past ones', () => {
      const today = '2026-04-01';
      const result = upcomingFestivals(today, 'all', 30, sampleFestivals);
      const ids = result.map((f) => f.id);

      expect(ids).toContain('test_festival_soon');
      expect(ids).toContain('test_apparel_festival');
      expect(ids).toContain('test_season_range');
      expect(ids).not.toContain('test_past_festival');
    });

    it('filters festivals by business category', () => {
      const today = '2026-04-01';
      const kiranaResult = upcomingFestivals(today, 'kirana', 30, sampleFestivals);
      const kiranaIds = kiranaResult.map((f) => f.id);

      expect(kiranaIds).toContain('test_festival_soon');
      expect(kiranaIds).toContain('test_season_range'); // 'all' categories
      expect(kiranaIds).not.toContain('test_apparel_festival'); // apparel only
    });

    it('sorts festivals chronologically by effective date', () => {
      const today = '2026-03-15';
      const result = upcomingFestivals(today, 'all', 60, sampleFestivals);
      expect(result.length).toBeGreaterThanOrEqual(2);
      const firstDate = getFestivalEffectiveDate(result[0]);
      const secondDate = getFestivalEffectiveDate(result[1]);
      expect(new Date(firstDate).getTime()).toBeLessThanOrEqual(new Date(secondDate).getTime());
    });
  });

  describe('stockCheckForFestival', () => {
    const products: CalculatedInventoryItem[] = [
      {
        productId: 'P1',
        productName: 'Organic Jaggery 1kg (Bella)',
        category: 'Staples',
        stockOnHand: 4,
        reorderLevel: 10,
        supplierLeadDays: 3,
        unitCost: 60,
        retailPrice: 85,
        unitsSoldInPeriod: 28,
        avgDailySales: 2, // 2 units/day => 2 days of cover
        daysOfCover: 2,
        status: 'critical',
        statusReason: 'Low stock',
        friendlyStatusText: '2 days of stock left',
        isStockoutRisk: true,
        isDeadStock: false,
        isOverstocked: false,
        deadStockValue: 0,
        suggestedAction: 'Order now',
        recommendedReorderQty: 20,
        howCalculated: '4 units / 2 daily = 2 days',
      },
      {
        productId: 'P2',
        productName: 'Nandini Pure Ghee 500ml',
        category: 'Dairy',
        stockOnHand: 50,
        reorderLevel: 10,
        supplierLeadDays: 2,
        unitCost: 320,
        retailPrice: 360,
        unitsSoldInPeriod: 14,
        avgDailySales: 1, // 50 days of cover
        daysOfCover: 50,
        status: 'healthy',
        statusReason: 'Healthy',
        friendlyStatusText: '50 days left',
        isStockoutRisk: false,
        isDeadStock: false,
        isOverstocked: false,
        deadStockValue: 0,
        suggestedAction: 'Adequate stock',
        recommendedReorderQty: 0,
        howCalculated: '50 units / 1 daily = 50 days',
      },
    ];

    it('matches festival keywords and flags low cover product as reorder now', () => {
      const festival = sampleFestivals[0]; // date 2026-04-10
      const today = '2026-04-05'; // 5 days until festival
      // Jaggery: 2 days of cover < 5 days until festival + 3 lead days (8) => 'reorder now'
      const check = stockCheckForFestival(festival, products, today);

      expect(check.length).toBe(2);
      const jaggery = check.find((c) => c.productId === 'P1');
      expect(jaggery).toBeDefined();
      expect(jaggery?.status).toBe('reorder now');
      expect(jaggery?.matchedKeyword).toBe('jaggery');
      expect(jaggery?.daysUntilFestival).toBe(5);

      const ghee = check.find((c) => c.productId === 'P2');
      expect(ghee).toBeDefined();
      expect(ghee?.status).toBe('ok');
    });

    it('handles edge case when no products match festival keywords', () => {
      const festival = sampleFestivals[1]; // apparel festival with keywords ['saree', 'silk']
      const check = stockCheckForFestival(festival, products, '2026-04-01');
      expect(check).toEqual([]);
    });

    it('handles edge case when festival is today (0 days away)', () => {
      const festival = sampleFestivals[0]; // 2026-04-10
      const today = '2026-04-10';
      const check = stockCheckForFestival(festival, products, today);
      const jaggery = check.find((c) => c.productId === 'P1');

      expect(jaggery?.daysUntilFestival).toBe(0);
      // daysOfCover (2) < 0 + leadDays (3) => 'reorder now'
      expect(jaggery?.status).toBe('reorder now');
    });
  });

  describe('reminderDue', () => {
    const festival = sampleFestivals[0]; // date 2026-04-10

    it('returns true exactly 14 days and 3 days before festival', () => {
      expect(reminderDue(festival, '2026-03-27')).toBe(true); // 14 days before
      expect(reminderDue(festival, '2026-04-07')).toBe(true); // 3 days before
    });

    it('returns false for other days and past festivals', () => {
      expect(reminderDue(festival, '2026-03-26')).toBe(false); // 15 days
      expect(reminderDue(festival, '2026-04-01')).toBe(false); // 9 days
      expect(reminderDue(festival, '2026-04-06')).toBe(false); // 4 days
      expect(reminderDue(festival, '2026-04-08')).toBe(false); // 2 days
      expect(reminderDue(festival, '2026-04-10')).toBe(false); // today
      expect(reminderDue(festival, '2026-04-12')).toBe(false); // past
    });
  });
});
